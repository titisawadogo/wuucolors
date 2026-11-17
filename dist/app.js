import { currentLanguage, setLanguage, t } from './i18n.js';
import { createColorAnalysis, addColorTile, buildFullPalettes, exactColorPage, exactCsvChunks } from './color-analysis.js';
import { newTouchArea, moveOrResizeArea } from './selection-geometry.mjs';
const $ = (id) => document.getElementById(id);
const canvas = $('sourceCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const pixelCanvas=document.createElement('canvas');pixelCanvas.width=1;pixelCanvas.height=1;
const pixelContext=pixelCanvas.getContext('2d',{willReadFrequently:true});
const state = { file: null, type: null, pdf: null, page: 1, palette: [], accents: [], scan: null, sourceImage: null, pixel: null, area: null, areaPalette: [], screenColors: [], selecting: false, selectionStart: null, areaMode: false, touchArea: false, tapStart: null, pointerId: null, pointerStart: null, pointerMoved: false, demo: false, scaled: false, originalWidth: 0, originalHeight: 0 };
let toastTimer;
let pdfLibrary;
let heicLibraryPromise;
let scanToken = 0;
let loadToken = 0;
let exactCursor = 0;
let exactStarts = [];
let areaEdit = null;
let lastTouchTap = null;
let touchStart = null;

function toast(message) { const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600); }
function hex(r,g,b) { return '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('').toUpperCase(); }
function hsl(r,g,b) { r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0,s=0,l=(max+min)/2;if(d){s=d/(1-Math.abs(2*l-1));switch(max){case r:h=((g-b)/d)%6;break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4}h*=60;if(h<0)h+=360}return `${Math.round(h)}°, ${Math.round(s*100)}%, ${Math.round(l*100)}%`; }
function shareLabel(share) { return share<.01?'<1%':`${Math.round(share*100)}%`; }
function copy(text) { navigator.clipboard.writeText(text).then(()=>toast(t('copied'))).catch(()=>toast(t('clipboardUnavailable'))); }
function fileLabel() { return state.demo?t('exampleComposition'):(state.file?.name||t('untitled')); }
function refreshExports() { const available=Boolean(state.type||state.screenColors.length);$('downloadTxt').disabled=!available;$('downloadPdf').disabled=!available;$('downloadCsv').disabled=!state.scan; }
function syncMobileResults() {
  const loaded=Boolean(state.type),open=loaded&&document.body.classList.contains('results-open');
  document.body.classList.toggle('has-file',loaded);
  if(!loaded)document.body.classList.remove('results-open');
  $('mobileResultsToggle').hidden=!loaded;
  $('mobileResultsToggle').setAttribute('aria-expanded',String(open));
  $('mobileResultsLabel').textContent=t(state.area?'selectedAreaColors':'imageColors');
  $('mobileResultsAction').textContent=t(open?'hideColors':'viewColors');
  const swatches=$('mobileResultsSwatches');swatches.replaceChildren();
  for(const color of (state.area?state.areaPalette:state.palette).slice(0,4)){
    const chip=document.createElement('span');chip.style.background=hex(color.r,color.g,color.b);swatches.appendChild(chip);
  }
}
function setMobileResultsOpen(open) {
  document.body.classList.toggle('results-open',Boolean(open&&state.type));
  syncMobileResults();
  if(open&&state.area)$('colorsPanel').scrollTop=0;
}
function renderScreenColors() { const colors=state.screenColors,block=$('screenColorsBlock'),list=$('screenColorList');block.hidden=!colors.length;$('screenColorCount').textContent=`${colors.length}`;list.innerHTML='';colors.forEach((color,index)=>{const row=document.createElement('div');row.className='screen-color-row';const swatch=document.createElement('button');swatch.type='button';swatch.className='screen-color-copy';swatch.title=t('copyColor',{color});swatch.setAttribute('aria-label',t('copyColor',{color}));swatch.innerHTML=`<span class="screen-color-chip" style="background:${color}"></span><strong>${color}</strong><span>${t('copy')}</span>`;swatch.addEventListener('click',()=>copy(color));const remove=document.createElement('button');remove.type='button';remove.className='screen-color-remove';remove.setAttribute('aria-label',t('removeColor',{color}));remove.textContent='×';remove.addEventListener('click',()=>{state.screenColors.splice(index,1);renderScreenColors()});row.append(swatch,remove);list.appendChild(row)});refreshExports(); }
async function pickScreenColor() { if(typeof window.EyeDropper!=='function'||!window.isSecureContext)return;try{const result=await new EyeDropper().open();const color=result.sRGBHex.toUpperCase();if(!/^#[0-9A-F]{6}$/.test(color))throw new Error('Invalid color');if(!state.screenColors.includes(color)){state.screenColors.push(color);renderScreenColors();toast(t('screenAdded',{color}))}else toast(t('screenExists',{color}))}catch(error){if(error?.name==='AbortError')return;console.error(error);toast(t('screenFailed'))} }

function setLoaded() {
  $('emptyState').hidden=true;$('canvasWrap').hidden=false;$('dropzone').classList.remove('empty');
  $('previewToolbar').hidden=false;$('previewFileName').textContent=fileLabel();$('previewFileName').title=fileLabel();
  $('fileStatus').textContent=t(state.demo?'exampleOpen':'fileOpen');
  $('inspectorState').textContent=state.type==='pdf'?t('pdfPageState',{page:state.page}):t('imageLoaded');
  $('colorEmpty').hidden=true;$('colorResults').hidden=false;
  refreshExports();
  const shownWidth=state.type==='image'?state.originalWidth:canvas.width,shownHeight=state.type==='image'?state.originalHeight:canvas.height;
  $('dimensions').textContent=`${shownWidth.toLocaleString(currentLanguage())} × ${shownHeight.toLocaleString(currentLanguage())} PX${state.type==='pdf'?t('renderedPage'):state.scaled?t('originalImage'):''}`;
  updateStageHint();updateAreaButton();
  syncMobileResults();
  $('stageControls').hidden=state.type!=='pdf';
  if(state.type==='pdf'){$('pageIndicator').textContent=t('pageOf',{page:state.page,total:state.pdf.numPages});$('pagePrev').disabled=state.page===1;$('pageNext').disabled=state.page===state.pdf.numPages;}
}

function extractPalette(rect={x:0,y:0,w:canvas.width,h:canvas.height},limit=8) {
  const mini=document.createElement('canvas'),ratio=Math.min(1,170/Math.max(rect.w,rect.h));
  mini.width=Math.max(1,Math.round(rect.w*ratio));mini.height=Math.max(1,Math.round(rect.h*ratio));
  const mctx=mini.getContext('2d',{willReadFrequently:true});mctx.drawImage(canvas,rect.x,rect.y,rect.w,rect.h,0,0,mini.width,mini.height);
  const data=mctx.getImageData(0,0,mini.width,mini.height).data,samples=[];
  for(let i=0;i<data.length;i+=4)if(data[i+3]>=80)samples.push([data[i],data[i+1],data[i+2]]);
  if(!samples.length)return [];
  const buckets=new Map();for(const [r,g,b] of samples){const key=`${r>>3},${g>>3},${b>>3}`;let x=buckets.get(key);if(!x){x={r:0,g:0,b:0,n:0};buckets.set(key,x)}x.r+=r;x.g+=g;x.b+=b;x.n++}
  const seeds=[...buckets.values()].sort((a,b)=>b.n-a.n).slice(0,Math.min(9,limit+1)).map(x=>[x.r/x.n,x.g/x.n,x.b/x.n]);
  while(seeds.length<Math.min(limit,samples.length))seeds.push(samples[Math.floor(seeds.length*samples.length/(limit+1))]);
  let clusters=[];for(let round=0;round<6;round++){clusters=seeds.map(()=>({r:0,g:0,b:0,n:0}));for(const [r,g,b] of samples){let best=0,dist=Infinity;for(let k=0;k<seeds.length;k++){const s=seeds[k],d=(r-s[0])**2+(g-s[1])**2+(b-s[2])**2;if(d<dist){dist=d;best=k}}const c=clusters[best];c.r+=r;c.g+=g;c.b+=b;c.n++}clusters.forEach((c,k)=>{if(c.n)seeds[k]=[c.r/c.n,c.g/c.n,c.b/c.n]})}
  return clusters.filter(c=>c.n).map(c=>({r:Math.round(c.r/c.n),g:Math.round(c.g/c.n),b:Math.round(c.b/c.n),share:c.n/samples.length})).sort((a,b)=>b.share-a.share).slice(0,limit);
}
function renderPalette() { const list=$('paletteList');list.innerHTML='';$('paletteCount').textContent=t(state.palette.length===1?'colorsCountOne':'colorsCount',{count:state.palette.length});for(const c of state.palette){const color=hex(c.r,c.g,c.b),row=document.createElement('button');row.type='button';row.className='palette-item';row.title=t('copyColor',{color});row.innerHTML=`<span class="palette-chip" style="background:${color}"></span><span class="palette-hex">${color}</span><span class="palette-bar"><span style="width:${Math.max(3,Math.round(c.share*100))}%"></span></span><span class="palette-share">${shareLabel(c.share).replace('<','&lt;')}</span><span class="palette-copy">${t('copy')}</span>`;row.addEventListener('click',()=>copy(color));list.appendChild(row)}syncMobileResults() }
function renderAccents() {
  const section=$('accentSection'), list=$('accentList');
  section.hidden=!state.accents.length;
  list.innerHTML='';
  for(const c of state.accents){
    const color=hex(c.r,c.g,c.b),row=document.createElement('button');
    row.type='button';row.className='palette-item';row.title=t('copyColor',{color});
    row.innerHTML=`<span class="palette-chip" style="background:${color}"></span><span class="palette-hex">${color}</span><span class="palette-bar"><span style="width:${Math.max(3,Math.round(c.share*100))}%"></span></span><span class="palette-share">${shareLabel(c.share).replace('<','&lt;')}</span><span class="palette-copy">${t('copy')}</span>`;
    row.addEventListener('click',()=>copy(color));list.appendChild(row);
  }
}
function renderExactPage(start=0, reset=false) {
  if(reset){exactStarts=[];exactCursor=0;}
  const list=$('exactList');list.innerHTML='';
  if(!state.scan){list.textContent=t('exactPending');$('exactRange').textContent='';$('exactPrev').disabled=true;$('exactNext').disabled=true;return;}
  const prefix=$('exactSearch').value.replace(/[^0-9a-f]/gi,'').toUpperCase().slice(0,6);
  const page=exactColorPage(state.scan,start,prefix);
  exactCursor=start;
  for(const item of page.rows){
    const row=document.createElement('button');row.type='button';row.className='exact-row';row.title=t('copyColor',{color:item.color});
    row.innerHTML=`<span class="exact-chip" style="background:${item.color}"></span><strong>${item.color}</strong><span>${item.count.toLocaleString(currentLanguage())} px</span>`;
    row.addEventListener('click',()=>copy(item.color));list.appendChild(row);
  }
  if(!page.rows.length)list.textContent=t('exactEmpty');
  const from=exactStarts.length*40+1,to=from+page.rows.length-1;
  $('exactRange').textContent=page.rows.length?t('exactRange',{from:from.toLocaleString(currentLanguage()),to:to.toLocaleString(currentLanguage())}):'';
  $('exactPrev').disabled=!exactStarts.length;
  $('exactNext').disabled=page.next===null;
  $('exactNext').dataset.next=page.next??'';
}
function cancelScan() {
  scanToken++;
  state.scan=null;state.accents=[];
  $('accentSection').hidden=true;$('scanStatus').textContent='';$('exactCount').textContent='';
  $('exactSearch').value='';renderExactPage(0,true);refreshExports();
}
async function scanAllPixels() {
  const token=++scanToken;
  const source=state.sourceImage||canvas;
  const width=state.sourceImage?state.originalWidth:canvas.width;
  const height=state.sourceImage?state.originalHeight:canvas.height;
  const tile=document.createElement('canvas'),tileContext=tile.getContext('2d',{willReadFrequently:true});
  const size=128,tilesX=Math.ceil(width/size),tilesY=Math.ceil(height/size),totalTiles=tilesX*tilesY;
  let done=0,lastYield=performance.now();
  try{
    const analysis=createColorAnalysis();
    $('scanStatus').textContent=t('scanning',{percent:0});renderExactPage();
    for(let y=0;y<height;y+=size){
      for(let x=0;x<width;x+=size){
        if(token!==scanToken)return;
        tile.width=Math.min(size,width-x);tile.height=Math.min(size,height-y);
        tileContext.clearRect(0,0,tile.width,tile.height);
        tileContext.drawImage(source,x,y,tile.width,tile.height,0,0,tile.width,tile.height);
        addColorTile(analysis,tileContext.getImageData(0,0,tile.width,tile.height).data);
        done++;
        if(performance.now()-lastYield>12){
          $('scanStatus').textContent=t('scanning',{percent:Math.round(done/totalTiles*100)});
          await new Promise(requestAnimationFrame);
          lastYield=performance.now();
        }
      }
    }
    if(token!==scanToken)return;
    const result=buildFullPalettes(analysis);
    state.scan=analysis;state.palette=result.dominant;state.accents=result.accents;
    renderPalette();renderAccents();
    $('scanStatus').textContent=t('scanned',{count:analysis.unique.toLocaleString(currentLanguage()),pixels:analysis.total.toLocaleString(currentLanguage())});
    $('exactCount').textContent=analysis.unique.toLocaleString(currentLanguage());
    renderExactPage(0,true);refreshExports();
  }catch(error){
    if(token!==scanToken)return;
    console.error(error);$('scanStatus').textContent=t('scanFailed');
    state.scan=null;refreshExports();
  }
}
function renderAreaPalette() {
  const lists=[$('areaPalette'),$('mobileAreaPalette')];
  lists.forEach(list=>list.replaceChildren());
  $('areaSection').hidden=!state.area;
  $('areaResults').hidden=!state.area;
  $('mobileAreaSection').hidden=!state.area;
  if(!state.area){syncMobileResults();return}
  $('areaCaption').textContent=t('selectedArea',{width:state.area.w,height:state.area.h});
  $('mobileAreaCaption').textContent=`${state.area.w} × ${state.area.h} PX`;
  for(const list of lists){
    for(const c of state.areaPalette){
      const color=hex(c.r,c.g,c.b),row=document.createElement('button');
      row.type='button';row.className='area-color';row.title=t('copyColor',{color});
      row.innerHTML=`<span class="area-chip" style="background:${color}"></span><strong>${color}</strong><small>${shareLabel(c.share).replace('<','&lt;')}</small><span>${t('copy')}</span>`;
      row.addEventListener('click',()=>copy(color));list.appendChild(row);
    }
  }
  syncMobileResults();
}
function analyzeColors() { state.palette=extractPalette();renderPalette(); }
function readPixel(x,y) {
  const previewX=Math.max(0,Math.min(canvas.width-1,Math.floor(x))),previewY=Math.max(0,Math.min(canvas.height-1,Math.floor(y)));
  if(!state.sourceImage)return {x:previewX,y:previewY,previewX,previewY,data:ctx.getImageData(previewX,previewY,1,1).data};
  const sourceX=Math.max(0,Math.min(state.originalWidth-1,Math.floor(x/canvas.width*state.originalWidth)));
  const sourceY=Math.max(0,Math.min(state.originalHeight-1,Math.floor(y/canvas.height*state.originalHeight)));
  pixelContext.clearRect(0,0,1,1);
  pixelContext.drawImage(state.sourceImage,sourceX,sourceY,1,1,0,0,1,1);
  return {x:sourceX,y:sourceY,previewX,previewY,data:pixelContext.getImageData(0,0,1,1).data};
}
function pickPixel(x,y) {
  const pixel=readPixel(x,y),d=pixel.data;
  state.pixel={x:pixel.x,y:pixel.y,previewX:pixel.previewX,previewY:pixel.previewY,r:d[0],g:d[1],b:d[2],a:d[3]};
  const color=hex(d[0],d[1],d[2]);$('pixelHex').textContent=color;
  $('pixelCoord').textContent=`x ${pixel.x} · y ${pixel.y}${d[3]<255?' · '+t('opacity',{value:Math.round(d[3]/255*100)}):''}`;
  $('pixelSwatch').style.background=color;$('pixelRGB').textContent=`${d[0]}, ${d[1]}, ${d[2]}`;$('pixelHSL').textContent=hsl(d[0],d[1],d[2]);
}

function canvasPoint(event) { const rect=canvas.getBoundingClientRect();return {x:(event.clientX-rect.left)/rect.width*canvas.width,y:(event.clientY-rect.top)/rect.height*canvas.height}; }
function clampPoint(p) { return {x:Math.max(0,Math.min(canvas.width,p.x)),y:Math.max(0,Math.min(canvas.height,p.y))}; }
function updateLoupe(event,p) { const el=$('loupe');if(p.x<0||p.y<0||p.x>=canvas.width||p.y>=canvas.height){el.hidden=true;return}const lctx=$('loupeCanvas').getContext('2d');lctx.imageSmoothingEnabled=false;lctx.clearRect(0,0,88,88);const pixel=readPixel(p.x,p.y);const source=state.sourceImage||canvas;lctx.drawImage(source,pixel.x-5,pixel.y-5,11,11,0,0,88,88);lctx.strokeStyle='#46206f';lctx.lineWidth=1;lctx.strokeRect(39.5,39.5,8,8);const d=pixel.data;$('loupeLabel').textContent=hex(d[0],d[1],d[2]);const wrap=$('canvasWrap').getBoundingClientRect();el.style.left=Math.max(0,Math.min(wrap.width-115,event.clientX-wrap.left+18))+'px';el.style.top=Math.max(0,Math.min(wrap.height-125,event.clientY-wrap.top-125))+'px';el.hidden=false; }
function drawSelection(a,b) { const rect=canvas.getBoundingClientRect(),wrap=$('canvasWrap').getBoundingClientRect(),x=Math.min(a.x,b.x),y=Math.min(a.y,b.y);const el=$('selectionBox');el.style.left=(rect.left-wrap.left+x/canvas.width*rect.width)+'px';el.style.top=(rect.top-wrap.top+y/canvas.height*rect.height)+'px';el.style.width=(Math.abs(b.x-a.x)/canvas.width*rect.width)+'px';el.style.height=(Math.abs(b.y-a.y)/canvas.height*rect.height)+'px';el.hidden=false; }
function restoreSelection() { if(!state.area||state.selecting)return;const {x,y,w,h}=state.area;drawSelection({x,y},{x:x+w,y:y+h}); }
function showTapMarker(p) { const rect=canvas.getBoundingClientRect(),wrap=$('canvasWrap').getBoundingClientRect(),el=$('tapMarker');el.style.left=(rect.left-wrap.left+p.x/canvas.width*rect.width)+'px';el.style.top=(rect.top-wrap.top+p.y/canvas.height*rect.height)+'px';el.hidden=false; }
function updateAreaButton() { const button=$('selectAreaButton');button.classList.toggle('active',state.areaMode);button.querySelector('[data-i18n]').textContent=t(state.areaMode?'cancelSelection':state.area?'clearSelectedArea':'selectAreaAction'); }
function updateStageHint() { if(!state.type){$('stageHintText').textContent=t('localPrivacy');return}if(state.areaMode){$('stageHintText').textContent=t('selectAreaHint');return}const key=matchMedia('(pointer:coarse)').matches?'previewHintTouch':'previewHintMouse';$('stageHintText').textContent=(state.scaled?t('scaledPreview')+' ':'')+t(key); }
function leaveAreaMode() { state.areaMode=false;state.tapStart=null;$('tapMarker').hidden=true;$('dropzone').classList.remove('area-mode');updateAreaButton();updateStageHint(); }
function clearArea() { state.area=null;state.areaPalette=[];state.touchArea=false;areaEdit=null;lastTouchTap=null;touchStart=null;state.selecting=false;state.pointerId=null;$('selectionBox').hidden=true;$('selectionBox').classList.remove('touch-editable');$('selectionBox').tabIndex=-1;$('areaSection').hidden=true;$('areaResults').hidden=true;$('mobileAreaSection').hidden=true;leaveAreaMode();syncMobileResults(); }
function createTouchArea(center) {
  if(!state.type)return;
  const rect=canvas.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  clearArea();
  state.touchArea=true;
  state.area=newTouchArea(canvas.width,canvas.height,rect.width,rect.height,center.x,center.y);
  state.areaPalette=extractPalette(state.area,5);
  $('selectionBox').classList.add('touch-editable');
  $('selectionBox').tabIndex=0;
  renderAreaPalette();restoreSelection();updateAreaButton();
  $('loupe').hidden=true;
}
function finishArea(a,b) {
  const x=Math.round(Math.max(0,Math.min(a.x,b.x))),y=Math.round(Math.max(0,Math.min(a.y,b.y)));
  const w=Math.round(Math.min(canvas.width-x,Math.abs(a.x-b.x))),h=Math.round(Math.min(canvas.height-y,Math.abs(a.y-b.y)));
  if(w<8||h<8)return false;
  state.area={x,y,w,h};state.touchArea=false;state.areaPalette=extractPalette(state.area,5);renderAreaPalette();
  restoreSelection();$('loupe').hidden=true;leaveAreaMode();
  toast(t('areaReady'));return true;
}
function chooseCorner(p) { if(!state.tapStart){state.tapStart=p;showTapMarker(p);toast(t('firstCorner'));return}const first=state.tapStart;state.tapStart=null;$('tapMarker').hidden=true;if(!finishArea(first,p)){state.tapStart=first;showTapMarker(first);toast(t('dragLarger'))} }
function removeFile() {
  loadToken++;cancelScan();
  if(typeof ImageBitmap!=='undefined'&&state.sourceImage instanceof ImageBitmap)state.sourceImage.close();
  clearArea();state.file=null;state.type=null;state.pdf=null;state.page=1;state.demo=false;state.scaled=false;state.palette=[];state.pixel=null;state.sourceImage=null;state.originalWidth=0;state.originalHeight=0;
  $('loupe').hidden=true;
  canvas.width=1;canvas.height=1;$('fileInput').value='';$('emptyState').hidden=false;$('canvasWrap').hidden=true;$('dropzone').classList.add('empty');$('previewToolbar').hidden=true;
  $('fileStatus').textContent=t('readyForFile');$('inspectorState').textContent=t('noFileLoaded');$('dimensions').textContent=t('dimensionsIdle');$('stageControls').hidden=true;
  $('colorResults').hidden=true;$('colorEmpty').hidden=false;$('paletteList').innerHTML='';$('areaPalette').innerHTML='';updateStageHint();refreshExports();syncMobileResults();toast(t('fileRemoved'));
}
async function openFile(file) {
  if(!file)return;
  if(file.size>25*1024*1024){toast(t('fileTooLarge'));return}
  const ext=(file.name.split('.').pop()||'').toLowerCase(),isPdf=file.type==='application/pdf'||ext==='pdf',isHeic=['heic','heif'].includes(ext)||['image/heic','image/heif'].includes(file.type),imageExt=['png','jpg','jpeg','webp','avif','gif','bmp','svg','heic','heif'];
  if(!isPdf&&!file.type.startsWith('image/')&&!imageExt.includes(ext)){toast(t('invalidFile'));return}
  const token=++loadToken;cancelScan();
  if(typeof ImageBitmap!=='undefined'&&state.sourceImage instanceof ImageBitmap)state.sourceImage.close();
  state.file=file;state.demo=false;state.pdf=null;state.page=1;state.sourceImage=null;clearArea();
  try{
    if(isPdf){state.type='pdf';state.scaled=false;await loadPdf(file)}
    else{state.type='image';await loadImage(file,isHeic,token)}
    if(token!==loadToken)return;
    setLoaded();analyzeColors();pickPixel(canvas.width/2,canvas.height/2);toast(t('fileReady'));
    void scanAllPixels();
  }catch(err){
    if(token!==loadToken)return;
    console.error(err);removeFile();toast(t('fileError'));
  }
}
function getHeicLibrary() {
  if(!heicLibraryPromise)heicLibraryPromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src='./heic-to.js';script.async=true;
    script.onload=()=>window.HeicTo?resolve(window.HeicTo):reject(new Error('HEIC decoder unavailable'));
    script.onerror=()=>reject(new Error('HEIC decoder failed to load'));
    document.head.appendChild(script);
  });
  return heicLibraryPromise;
}
async function loadImage(file,isHeic,token) {
  const url=URL.createObjectURL(file);
  let image;
  try{
    try{image=new Image();image.decoding='async';image.src=url;await image.decode()}
    catch(error){
      if(!isHeic)throw error;
      $('fileStatus').textContent=t('openingHeic');
      image=await (await getHeicLibrary())({blob:file,type:'bitmap'});
    }
  }finally{URL.revokeObjectURL(url)}
  if(token!==loadToken){if(typeof ImageBitmap!=='undefined'&&image instanceof ImageBitmap)image.close();return}
  const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
  if(!width||!height)throw new Error('Image has no dimensions');
  state.sourceImage=image;state.originalWidth=width;state.originalHeight=height;
  const scale=Math.min(1,4096/Math.max(width,height));state.scaled=scale<1;
  canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
}
async function getPdfLibrary() { if(!pdfLibrary){pdfLibrary=await import('./pdf.min.mjs');pdfLibrary.GlobalWorkerOptions.workerSrc=new URL('./pdf.worker.min.mjs',import.meta.url).href}return pdfLibrary }
async function loadPdf(file) { const library=await getPdfLibrary();const bytes=await file.arrayBuffer();state.pdf=await library.getDocument({data:new Uint8Array(bytes),useSystemFonts:true}).promise;await renderPdfPage() }
async function renderPdfPage() { const page=await state.pdf.getPage(state.page),base=page.getViewport({scale:1}),scale=Math.min(2,1800/Math.max(base.width,base.height)),viewport=page.getViewport({scale});canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);await page.render({canvasContext:ctx,viewport}).promise }
function buildDemo() { loadToken++;cancelScan();if(typeof ImageBitmap!=='undefined'&&state.sourceImage instanceof ImageBitmap)state.sourceImage.close();state.sourceImage=null;state.file=null;state.demo=true;state.type='image';state.scaled=false;state.pdf=null;state.page=1;clearArea();canvas.width=1400;canvas.height=900;const g=ctx.createLinearGradient(0,0,1400,900);g.addColorStop(0,'#e9ddf1');g.addColorStop(1,'#d0b5e4');ctx.fillStyle=g;ctx.fillRect(0,0,1400,900);ctx.fillStyle='#faf7f3';ctx.fillRect(72,65,1256,770);ctx.fillStyle='#5d2d91';ctx.fillRect(72,65,450,770);ctx.fillStyle='#e4a786';ctx.beginPath();ctx.arc(1000,375,222,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b897d0';ctx.beginPath();ctx.arc(895,460,135,0,Math.PI*2);ctx.fill();ctx.fillStyle='#5d2d91';ctx.font='700 102px Arial';ctx.fillText('FORM',555,735);ctx.fillStyle='#faf7f3';ctx.font='italic 140px Georgia';ctx.fillText('color',116,417);ctx.fillStyle='#e4a786';ctx.fillRect(118,563,300,8);ctx.font='24px Arial';ctx.fillStyle='#faf7f3';ctx.fillText('A STUDY IN CONTRAST',118,625);state.originalWidth=canvas.width;state.originalHeight=canvas.height;setLoaded();analyzeColors();pickPixel(700,450);toast(t('demoReady'));void scanAllPixels() }

function reportLines() {
  const lines=[t('reportTitle'),t('reportGenerated',{date:new Date().toLocaleString(currentLanguage())})];
  if(state.screenColors.length){lines.push('',t('reportScreen'));state.screenColors.forEach((color,i)=>lines.push(`${i+1}. ${color}`))}
  if(state.type){
    lines.push('',t('reportFile',{file:fileLabel()}),t('reportType',{type:state.type==='pdf'?t('reportPdf',{page:state.page,total:state.pdf.numPages}):t('reportImage')}),t('reportDimensions',{width:state.type==='image'?state.originalWidth:canvas.width,height:state.type==='image'?state.originalHeight:canvas.height}),'',t('reportPalette'));
    state.palette.forEach((c,i)=>lines.push(`${i+1}. ${hex(c.r,c.g,c.b)}  RGB ${c.r}, ${c.g}, ${c.b}  ${shareLabel(c.share)}`));
    if(state.accents.length){lines.push('',t('reportAccent'));state.accents.forEach((c,i)=>lines.push(`${i+1}. ${hex(c.r,c.g,c.b)}  ${shareLabel(c.share)}`))}
    if(state.scan){
      lines.push('',t('reportExact'),t('reportExactStats',{count:state.scan.unique.toLocaleString(currentLanguage()),pixels:state.scan.total.toLocaleString(currentLanguage())}));
      lines.push(state.type==='pdf'?t('reportPdfPixels',{width:canvas.width,height:canvas.height}):t('reportImagePixels',{width:state.originalWidth,height:state.originalHeight}));
    }else if(state.scaled)lines.push(t('reportScaled',{width:state.originalWidth,height:state.originalHeight}));
    lines.push('',t('reportPixel'));
    if(state.pixel){const p=state.pixel;lines.push(t('reportAt',{color:hex(p.r,p.g,p.b),x:p.x,y:p.y}),`RGB ${p.r}, ${p.g}, ${p.b}`,`HSL ${hsl(p.r,p.g,p.b)}`)}
    if(state.area){lines.push('',t('reportArea'),t('reportAreaSize',{x:state.area.x,y:state.area.y,width:state.area.w,height:state.area.h}));state.areaPalette.forEach((c,i)=>lines.push(`${i+1}. ${hex(c.r,c.g,c.b)}  ${shareLabel(c.share)}`))}
    if(!state.scan)lines.push('',t('reportEstimates'));if(state.type==='pdf')lines.push(t('reportPdfNote'));
  }
  lines.push(t('reportPrivacy'));
  return lines;
}
function downloadBlob(name,blob) { const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500) }
function safeBaseName() { if(!state.type)return t('screenColorsFile');const base=fileLabel().replace(/\.[^.]+$/,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,40)||'design';return base+'-'+t('fileColorsSuffix') }
function downloadTxt() { downloadBlob(safeBaseName()+'.txt',new Blob([reportLines().join('\n')],{type:'text/plain;charset=utf-8'}));toast(t('txtDownloaded')) }
async function downloadCsv() {
  if(!state.scan)return;
  const scan=state.scan,parts=['hex,pixels,percent\n'],step=0x20000;
  $('downloadCsv').disabled=true;
  for(let start=0;start<0x1000000;start+=step){
    if(state.scan!==scan){refreshExports();return}
    parts.push(exactCsvChunks(scan,start,Math.min(0x1000000,start+step)));
    if(start%(step*8)===0)await new Promise(requestAnimationFrame);
  }
  downloadBlob(safeBaseName()+'-exact.csv',new Blob(parts,{type:'text/csv;charset=utf-8'}));
  refreshExports();toast(t('csvDownloaded'));
}
function pdfEscape(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,'-').replace(/[\\()]/g,'\\$&') }
function makePdf() {
  const lines=reportLines().slice(0,52);
  const headings=new Set([t('reportScreen'),t('reportPalette'),t('reportAccent'),t('reportExact'),t('reportPixel'),t('reportArea')]);
  let content=`0.36 0.18 0.57 rg\n36 746 540 46 re f\nBT /F2 19 Tf 1 1 1 rg 51 763 Td (${pdfEscape(t('reportTitle'))}) Tj ET\n`,y=728;
  for(let i=1;i<lines.length;i++){
    const line=lines[i];if(y<42)break;const heading=headings.has(line);if(heading)y-=5;
    content+=`BT /${heading?'F2':'F1'} ${heading?11:9} Tf ${heading?'0.36 0.18 0.57':'0.20 0.17 0.24'} rg 51 ${y} Td (${pdfEscape(line).slice(0,105)}) Tj ET\n`;
    y-=heading?19:14;
  }
  const objects=[null,'<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',`<< /Length ${new TextEncoder().encode(content).length} >>\nstream\n${content}endstream`];
  let pdf='%PDF-1.4\n',offsets=[0];
  for(let i=1;i<objects.length;i++){offsets.push(new TextEncoder().encode(pdf).length);pdf+=`${i} 0 obj\n${objects[i]}\nendobj\n`}
  const xref=new TextEncoder().encode(pdf).length;pdf+=`xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for(let i=1;i<objects.length;i++)pdf+=`${String(offsets[i]).padStart(10,'0')} 00000 n \n`;
  pdf+=`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf],{type:'application/pdf'});
}
function downloadPdf() { downloadBlob(safeBaseName()+'.pdf',makePdf());toast(t('pdfDownloaded')) }

const drop=$('dropzone');drop.addEventListener('click',()=>{if(drop.classList.contains('empty'))$('fileInput').click()});drop.addEventListener('keydown',e=>{if(e.target===drop&&drop.classList.contains('empty')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();$('fileInput').click()}});['dragenter','dragover'].forEach(event=>drop.addEventListener(event,e=>{e.preventDefault();drop.classList.add('dragover')}));['dragleave','drop'].forEach(event=>drop.addEventListener(event,e=>{e.preventDefault();drop.classList.remove('dragover')}));drop.addEventListener('drop',e=>openFile(e.dataTransfer.files[0]));$('fileInput').addEventListener('change',e=>{openFile(e.target.files[0]);e.target.value=''});
$('demoButton').addEventListener('click',buildDemo);$('mobileDemoButton').addEventListener('click',e=>{e.stopPropagation();buildDemo()});$('copyPalette').addEventListener('click',()=>copy(state.palette.map(c=>hex(c.r,c.g,c.b)).join(', ')));$('copyPixel').addEventListener('click',()=>state.pixel&&copy(hex(state.pixel.r,state.pixel.g,state.pixel.b)));$('downloadTxt').addEventListener('click',downloadTxt);$('downloadPdf').addEventListener('click',downloadPdf);
$('downloadCsv').addEventListener('click',downloadCsv);
$('exactSearch').addEventListener('input',()=>renderExactPage(0,true));
$('exactNext').addEventListener('click',()=>{const next=Number($('exactNext').dataset.next);if(!state.scan||!Number.isFinite(next))return;exactStarts.push(exactCursor);renderExactPage(next)});
$('exactPrev').addEventListener('click',()=>{if(!exactStarts.length)return;const previous=exactStarts.pop();renderExactPage(previous)});
$('screenPickButton').addEventListener('click',pickScreenColor);$('clearScreenColors').addEventListener('click',()=>{state.screenColors=[];renderScreenColors();toast(t('screenCleared'))});
function updateScreenAvailability() {
  const isPhoneOrTablet=navigator.userAgentData?.mobile===true||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&(/Macintosh/i.test(navigator.userAgent)||matchMedia('(pointer: coarse)').matches));
  const available=!isPhoneOrTablet&&typeof window.EyeDropper==='function'&&window.isSecureContext&&matchMedia('(hover: hover) and (pointer: fine)').matches;
  $('screenSection').hidden=!available;$('screenHelpStep').hidden=!available;$('screenFallback').hidden=available;
  $('screenPickButton').disabled=!available;
}
updateScreenAvailability();
matchMedia('(hover: hover) and (pointer: fine)').addEventListener?.('change',updateScreenAvailability);
refreshExports();
const mobileViewport=matchMedia('(max-width: 820px)');
$('mobileResultsToggle').addEventListener('click',()=>setMobileResultsOpen(!document.body.classList.contains('results-open')));
$('mobileResultsClose').addEventListener('click',()=>setMobileResultsOpen(false));
mobileViewport.addEventListener?.('change',e=>{if(!e.matches)setMobileResultsOpen(false)});
function hasTouchInput(){return navigator.maxTouchPoints>0||matchMedia('(any-pointer: coarse)').matches}
$('selectAreaButton').addEventListener('click',()=>{
  if(!state.type)return;
  if(state.areaMode){leaveAreaMode();$('selectionBox').hidden=true;return}
  if(state.area){clearArea();return}
  if(hasTouchInput()){
    createTouchArea({x:canvas.width/2,y:canvas.height/2});
    return;
  }
  state.areaMode=true;state.tapStart=null;$('tapMarker').hidden=true;$('selectionBox').hidden=true;$('loupe').hidden=true;$('dropzone').classList.add('area-mode');
  updateAreaButton();updateStageHint();
});
$('removeFileButton').addEventListener('click',removeFile);
const selectionBox=$('selectionBox');
selectionBox.addEventListener('pointerdown',e=>{
  if(!state.touchArea||!state.area||areaEdit)return;
  e.preventDefault();e.stopPropagation();
  areaEdit={id:e.pointerId,action:e.target.dataset.handle||'move',clientX:e.clientX,clientY:e.clientY,original:{...state.area}};
  selectionBox.setPointerCapture(e.pointerId);
});
selectionBox.addEventListener('pointermove',e=>{
  if(!areaEdit||e.pointerId!==areaEdit.id)return;
  e.preventDefault();e.stopPropagation();
  const rect=canvas.getBoundingClientRect();
  const dx=(e.clientX-areaEdit.clientX)/rect.width*canvas.width,dy=(e.clientY-areaEdit.clientY)/rect.height*canvas.height;
  const minWidth=Math.min(canvas.width,Math.max(8,Math.ceil(64/rect.width*canvas.width)));
  const minHeight=Math.min(canvas.height,Math.max(8,Math.ceil(64/rect.height*canvas.height)));
  state.area=moveOrResizeArea(areaEdit.original,areaEdit.action,dx,dy,canvas.width,canvas.height,minWidth,minHeight);
  drawSelection({x:state.area.x,y:state.area.y},{x:state.area.x+state.area.w,y:state.area.y+state.area.h});
});
selectionBox.addEventListener('pointerup',e=>{
  if(!areaEdit||e.pointerId!==areaEdit.id)return;
  e.preventDefault();e.stopPropagation();areaEdit=null;
  state.areaPalette=extractPalette(state.area,5);renderAreaPalette();restoreSelection();
});
selectionBox.addEventListener('pointercancel',e=>{
  if(!areaEdit||e.pointerId!==areaEdit.id)return;
  e.stopPropagation();state.area=areaEdit.original;areaEdit=null;restoreSelection();
});
selectionBox.addEventListener('keydown',e=>{
  if(!state.touchArea||!state.area||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
  e.preventDefault();e.stopPropagation();
  const step=e.shiftKey?10:1,dx=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0,dy=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0;
  const rect=canvas.getBoundingClientRect(),minWidth=Math.min(canvas.width,Math.max(8,Math.ceil(64/rect.width*canvas.width))),minHeight=Math.min(canvas.height,Math.max(8,Math.ceil(64/rect.height*canvas.height)));
  state.area=moveOrResizeArea(state.area,e.target.dataset.handle||'move',dx,dy,canvas.width,canvas.height,minWidth,minHeight);
  state.areaPalette=extractPalette(state.area,5);renderAreaPalette();restoreSelection();
});
drop.addEventListener('pointerdown',e=>{
  if(!state.type||e.target!==canvas)return;
  if(e.pointerType==='touch'&&!state.areaMode){touchStart={id:e.pointerId,x:e.clientX,y:e.clientY};return}
  e.preventDefault();
  state.selecting=true;state.pointerId=e.pointerId;state.selectionStart=clampPoint(canvasPoint(e));state.pointerStart={x:e.clientX,y:e.clientY};state.pointerMoved=false;
  drop.setPointerCapture(e.pointerId);
});
drop.addEventListener('pointermove',e=>{
  if(!state.type)return;
  const p=canvasPoint(e);
  if(state.selecting&&e.pointerId===state.pointerId){
    if(Math.hypot(e.clientX-state.pointerStart.x,e.clientY-state.pointerStart.y)>=5)state.pointerMoved=true;
    if(state.pointerMoved){$('tapMarker').hidden=true;drawSelection(state.selectionStart,clampPoint(p))}
    return;
  }
  if(e.pointerType!=='touch'&&!state.areaMode)updateLoupe(e,p);
});
drop.addEventListener('pointerup',e=>{
  if(!state.type)return;
  const p=clampPoint(canvasPoint(e));
  if(state.selecting&&e.pointerId===state.pointerId){
    state.selecting=false;state.pointerId=null;
    if(state.pointerMoved){
      if(!finishArea(state.selectionStart,p)){if(state.area)restoreSelection();else $('selectionBox').hidden=true;if(state.areaMode){if(state.tapStart)showTapMarker(state.tapStart);toast(t('dragLarger'))}else pickPixel(p.x,p.y)}
    }else if(state.areaMode)chooseCorner(p);
    else pickPixel(p.x,p.y);
    return;
  }
  if(e.target===canvas&&e.pointerType==='touch'&&!state.areaMode){
    const start=touchStart;touchStart=null;
    if(!start||start.id!==e.pointerId||Math.hypot(e.clientX-start.x,e.clientY-start.y)>12){lastTouchTap=null;return}
    const now=performance.now(),previous=lastTouchTap;
    if(previous&&now-previous.time<360&&Math.hypot(e.clientX-previous.x,e.clientY-previous.y)<32){
      lastTouchTap=null;createTouchArea(p);
    }else{lastTouchTap={time:now,x:e.clientX,y:e.clientY};pickPixel(p.x,p.y)}
  }
});
drop.addEventListener('pointercancel',()=>{state.selecting=false;state.pointerId=null;lastTouchTap=null;touchStart=null;if(state.area)restoreSelection();else $('selectionBox').hidden=true});
drop.addEventListener('pointerleave',()=>{$('loupe').hidden=true});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){if(document.body.classList.contains('results-open'))setMobileResultsOpen(false);else if(state.areaMode){leaveAreaMode();$('selectionBox').hidden=true}else if(state.touchArea)clearArea()}});
async function changePage(delta) { if(!state.pdf)return;const next=state.page+delta;if(next<1||next>state.pdf.numPages)return;state.page=next;cancelScan();clearArea();await renderPdfPage();setLoaded();analyzeColors();pickPixel(canvas.width/2,canvas.height/2);void scanAllPixels() }
$('pagePrev').addEventListener('click',()=>changePage(-1));$('pageNext').addEventListener('click',()=>changePage(1));
$('helpButton').addEventListener('click',()=>$('helpDialog').showModal());$('closeHelp').addEventListener('click',()=>$('helpDialog').close());$('helpStart').addEventListener('click',()=>$('helpDialog').close());
$('footerYear').textContent=String(new Date().getFullYear());
function applyLanguage(next) {
  setLanguage(next);
  if(state.type){setLoaded();renderPalette();renderAccents();renderAreaPalette();if(state.pixel)pickPixel(state.pixel.previewX,state.pixel.previewY)}
  else updateStageHint();
  if(state.screenColors.length)renderScreenColors();
  if(state.scan){$('scanStatus').textContent=t('scanned',{count:state.scan.unique.toLocaleString(currentLanguage()),pixels:state.scan.total.toLocaleString(currentLanguage())});$('exactCount').textContent=state.scan.unique.toLocaleString(currentLanguage());renderExactPage(exactCursor)}
  updateScreenAvailability();
  if(state.area)requestAnimationFrame(restoreSelection);
}
let languagePointerSelection=false;
$('languageSelect').addEventListener('pointerdown',()=>{languagePointerSelection=true});
$('languageSelect').addEventListener('keydown',()=>{languagePointerSelection=false});
$('languageSelect').addEventListener('change',e=>{applyLanguage(e.target.value);if(languagePointerSelection)e.target.blur();languagePointerSelection=false});
if('ResizeObserver' in window)new ResizeObserver(restoreSelection).observe(canvas);
applyLanguage(currentLanguage());
