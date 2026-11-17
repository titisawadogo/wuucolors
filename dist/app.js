import { currentLanguage, setLanguage, t } from './i18n.js';
const $ = (id) => document.getElementById(id);
const canvas = $('sourceCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const state = { file: null, type: null, pdf: null, page: 1, palette: [], pixel: null, area: null, areaPalette: [], screenColors: [], selecting: false, selectionStart: null, areaMode: false, tapStart: null, pointerId: null, pointerStart: null, pointerMoved: false, demo: false, scaled: false, originalWidth: 0, originalHeight: 0 };
let toastTimer;
let pdfLibrary;

function toast(message) { const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600); }
function hex(r,g,b) { return '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('').toUpperCase(); }
function hsl(r,g,b) { r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0,s=0,l=(max+min)/2;if(d){s=d/(1-Math.abs(2*l-1));switch(max){case r:h=((g-b)/d)%6;break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4}h*=60;if(h<0)h+=360}return `${Math.round(h)}°, ${Math.round(s*100)}%, ${Math.round(l*100)}%`; }
function shareLabel(share) { return share<.01?'<1%':`${Math.round(share*100)}%`; }
function copy(text) { navigator.clipboard.writeText(text).then(()=>toast(t('copied'))).catch(()=>toast(t('clipboardUnavailable'))); }
function fileLabel() { return state.demo?t('exampleComposition'):(state.file?.name||t('untitled')); }
function refreshExports() { const available=Boolean(state.type||state.screenColors.length);$('downloadTxt').disabled=!available;$('downloadPdf').disabled=!available; }
function renderScreenColors() { const colors=state.screenColors,block=$('screenColorsBlock'),list=$('screenColorList');block.hidden=!colors.length;$('screenColorCount').textContent=`${colors.length}`;list.innerHTML='';colors.forEach((color,index)=>{const row=document.createElement('div');row.className='screen-color-row';const swatch=document.createElement('button');swatch.type='button';swatch.className='screen-color-copy';swatch.title=t('copyColor',{color});swatch.setAttribute('aria-label',t('copyColor',{color}));swatch.innerHTML=`<span class="screen-color-chip" style="background:${color}"></span><strong>${color}</strong><span>${t('copy')}</span>`;swatch.addEventListener('click',()=>copy(color));const remove=document.createElement('button');remove.type='button';remove.className='screen-color-remove';remove.setAttribute('aria-label',t('removeColor',{color}));remove.textContent='×';remove.addEventListener('click',()=>{state.screenColors.splice(index,1);renderScreenColors()});row.append(swatch,remove);list.appendChild(row)});refreshExports(); }
async function pickScreenColor() { if(typeof window.EyeDropper!=='function'||!window.isSecureContext)return;try{const result=await new EyeDropper().open();const color=result.sRGBHex.toUpperCase();if(!/^#[0-9A-F]{6}$/.test(color))throw new Error('Invalid color');if(!state.screenColors.includes(color)){state.screenColors.push(color);renderScreenColors();toast(t('screenAdded',{color}))}else toast(t('screenExists',{color}))}catch(error){if(error?.name==='AbortError')return;console.error(error);toast(t('screenFailed'))} }

function setLoaded() {
  $('emptyState').hidden=true;$('canvasWrap').hidden=false;$('dropzone').classList.remove('empty');
  $('previewToolbar').hidden=false;$('previewFileName').textContent=fileLabel();$('previewFileName').title=fileLabel();
  $('fileStatus').textContent=t(state.demo?'exampleOpen':'fileOpen');
  $('inspectorState').textContent=state.type==='pdf'?t('pdfPageState',{page:state.page}):t('imageLoaded');
  $('colorEmpty').hidden=true;$('colorResults').hidden=false;
  refreshExports();
  $('dimensions').textContent=`${canvas.width.toLocaleString(currentLanguage())} × ${canvas.height.toLocaleString(currentLanguage())} PX${state.type==='pdf'?t('renderedPage'):''}`;
  updateStageHint();updateAreaButton();
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
function renderPalette() { const list=$('paletteList');list.innerHTML='';$('paletteCount').textContent=t('colorsCount',{count:state.palette.length});for(const c of state.palette){const color=hex(c.r,c.g,c.b),row=document.createElement('button');row.type='button';row.className='palette-item';row.title=t('copyColor',{color});row.innerHTML=`<span class="palette-chip" style="background:${color}"></span><span class="palette-hex">${color}</span><span class="palette-bar"><span style="width:${Math.max(3,Math.round(c.share*100))}%"></span></span><span class="palette-share">${shareLabel(c.share).replace('<','&lt;')}</span><span class="palette-copy">${t('copy')}</span>`;row.addEventListener('click',()=>copy(color));list.appendChild(row)} }
function renderAreaPalette() {
  const list=$('areaPalette');list.innerHTML='';
  $('areaSection').hidden=!state.area;
  $('areaResults').hidden=!state.area;
  if(!state.area)return;
  $('areaCaption').textContent=t('selectedArea',{width:state.area.w,height:state.area.h});
  for(const c of state.areaPalette){
    const color=hex(c.r,c.g,c.b),row=document.createElement('button');
    row.type='button';row.className='area-color';row.title=t('copyColor',{color});
    row.innerHTML=`<span class="area-chip" style="background:${color}"></span><strong>${color}</strong><small>${shareLabel(c.share).replace('<','&lt;')}</small><span>${t('copy')}</span>`;
    row.addEventListener('click',()=>copy(color));list.appendChild(row);
  }
}
function analyzeColors() { state.palette=extractPalette();renderPalette(); }
function pickPixel(x,y) { x=Math.max(0,Math.min(canvas.width-1,Math.floor(x)));y=Math.max(0,Math.min(canvas.height-1,Math.floor(y)));const d=ctx.getImageData(x,y,1,1).data;state.pixel={x,y,r:d[0],g:d[1],b:d[2],a:d[3]};const color=hex(d[0],d[1],d[2]);$('pixelHex').textContent=color;$('pixelCoord').textContent=`x ${x} · y ${y}${d[3]<255?' · '+t('opacity',{value:Math.round(d[3]/255*100)}):''}`;$('pixelSwatch').style.background=color;$('pixelRGB').textContent=`${d[0]}, ${d[1]}, ${d[2]}`;$('pixelHSL').textContent=hsl(d[0],d[1],d[2]); }

function canvasPoint(event) { const rect=canvas.getBoundingClientRect();return {x:(event.clientX-rect.left)/rect.width*canvas.width,y:(event.clientY-rect.top)/rect.height*canvas.height}; }
function clampPoint(p) { return {x:Math.max(0,Math.min(canvas.width,p.x)),y:Math.max(0,Math.min(canvas.height,p.y))}; }
function updateLoupe(event,p) { const el=$('loupe');if(p.x<0||p.y<0||p.x>=canvas.width||p.y>=canvas.height){el.hidden=true;return}const lctx=$('loupeCanvas').getContext('2d');lctx.imageSmoothingEnabled=false;lctx.clearRect(0,0,88,88);lctx.drawImage(canvas,Math.floor(p.x)-5,Math.floor(p.y)-5,11,11,0,0,88,88);lctx.strokeStyle='#46206f';lctx.lineWidth=1;lctx.strokeRect(39.5,39.5,8,8);const d=ctx.getImageData(Math.floor(p.x),Math.floor(p.y),1,1).data;$('loupeLabel').textContent=hex(d[0],d[1],d[2]);const wrap=$('canvasWrap').getBoundingClientRect();el.style.left=Math.max(0,Math.min(wrap.width-115,event.clientX-wrap.left+18))+'px';el.style.top=Math.max(0,Math.min(wrap.height-125,event.clientY-wrap.top-125))+'px';el.hidden=false; }
function drawSelection(a,b) { const rect=canvas.getBoundingClientRect(),wrap=$('canvasWrap').getBoundingClientRect(),x=Math.min(a.x,b.x),y=Math.min(a.y,b.y);const el=$('selectionBox');el.style.left=(rect.left-wrap.left+x/canvas.width*rect.width)+'px';el.style.top=(rect.top-wrap.top+y/canvas.height*rect.height)+'px';el.style.width=(Math.abs(b.x-a.x)/canvas.width*rect.width)+'px';el.style.height=(Math.abs(b.y-a.y)/canvas.height*rect.height)+'px';el.hidden=false; }
function restoreSelection() { if(!state.area||state.selecting)return;const {x,y,w,h}=state.area;drawSelection({x,y},{x:x+w,y:y+h}); }
function showTapMarker(p) { const rect=canvas.getBoundingClientRect(),wrap=$('canvasWrap').getBoundingClientRect(),el=$('tapMarker');el.style.left=(rect.left-wrap.left+p.x/canvas.width*rect.width)+'px';el.style.top=(rect.top-wrap.top+p.y/canvas.height*rect.height)+'px';el.hidden=false; }
function updateAreaButton() { const button=$('selectAreaButton');button.classList.toggle('active',state.areaMode);button.querySelector('[data-i18n]').textContent=t(state.areaMode?'cancelSelection':state.area?'clearSelectedArea':'selectAreaAction'); }
function updateStageHint() { if(!state.type){$('stageHintText').textContent=t('localPrivacy');return}if(state.areaMode){$('stageHintText').textContent=t('selectAreaHint');return}const key=matchMedia('(pointer:coarse)').matches?'previewHintTouch':'previewHintMouse';$('stageHintText').textContent=(state.scaled?t('scaledPreview')+' ':'')+t(key); }
function leaveAreaMode() { state.areaMode=false;state.tapStart=null;$('tapMarker').hidden=true;$('dropzone').classList.remove('area-mode');updateAreaButton();updateStageHint(); }
function clearArea() { state.area=null;state.areaPalette=[];state.selecting=false;state.pointerId=null;$('selectionBox').hidden=true;$('areaSection').hidden=true;$('areaResults').hidden=true;leaveAreaMode(); }
function finishArea(a,b) {
  const x=Math.round(Math.max(0,Math.min(a.x,b.x))),y=Math.round(Math.max(0,Math.min(a.y,b.y)));
  const w=Math.round(Math.min(canvas.width-x,Math.abs(a.x-b.x))),h=Math.round(Math.min(canvas.height-y,Math.abs(a.y-b.y)));
  if(w<8||h<8)return false;
  state.area={x,y,w,h};state.areaPalette=extractPalette(state.area,5);renderAreaPalette();
  restoreSelection();$('loupe').hidden=true;leaveAreaMode();
  toast(t('areaReady'));return true;
}
function chooseCorner(p) { if(!state.tapStart){state.tapStart=p;showTapMarker(p);toast(t('firstCorner'));return}const first=state.tapStart;state.tapStart=null;$('tapMarker').hidden=true;if(!finishArea(first,p)){state.tapStart=first;showTapMarker(first);toast(t('dragLarger'))} }
function removeFile() {
  clearArea();state.file=null;state.type=null;state.pdf=null;state.page=1;state.demo=false;state.scaled=false;state.palette=[];state.pixel=null;state.originalWidth=0;state.originalHeight=0;
  $('loupe').hidden=true;
  canvas.width=1;canvas.height=1;$('fileInput').value='';$('emptyState').hidden=false;$('canvasWrap').hidden=true;$('dropzone').classList.add('empty');$('previewToolbar').hidden=true;
  $('fileStatus').textContent=t('readyForFile');$('inspectorState').textContent=t('noFileLoaded');$('dimensions').textContent=t('dimensionsIdle');$('stageControls').hidden=true;
  $('colorResults').hidden=true;$('colorEmpty').hidden=false;$('paletteList').innerHTML='';$('areaPalette').innerHTML='';updateStageHint();refreshExports();toast(t('fileRemoved'));
}
async function openFile(file) { if(!file)return;if(file.size>25*1024*1024){toast(t('fileTooLarge'));return}const ext=(file.name.split('.').pop()||'').toLowerCase(),isPdf=file.type==='application/pdf'||ext==='pdf',imageExt=['png','jpg','jpeg','webp','avif','gif','bmp','svg'];if(!isPdf&&!file.type.startsWith('image/')&&!imageExt.includes(ext)){toast(t('invalidFile'));return}state.file=file;state.demo=false;state.pdf=null;state.page=1;clearArea();try{if(isPdf){state.type='pdf';state.scaled=false;await loadPdf(file)}else{state.type='image';await loadImage(file)}setLoaded();analyzeColors();pickPixel(canvas.width/2,canvas.height/2);toast(t('fileReady'))}catch(err){console.error(err);toast(t('fileError'))} }
async function loadImage(file) { const url=URL.createObjectURL(file);try{const image=new Image();image.decoding='async';image.src=url;await image.decode();state.originalWidth=image.naturalWidth;state.originalHeight=image.naturalHeight;const scale=Math.min(1,4096/Math.max(image.naturalWidth,image.naturalHeight));state.scaled=scale<1;canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height)}finally{URL.revokeObjectURL(url)} }
async function getPdfLibrary() { if(!pdfLibrary){pdfLibrary=await import('./pdf.min.mjs');pdfLibrary.GlobalWorkerOptions.workerSrc=new URL('./pdf.worker.min.mjs',import.meta.url).href}return pdfLibrary }
async function loadPdf(file) { const library=await getPdfLibrary();const bytes=await file.arrayBuffer();state.pdf=await library.getDocument({data:new Uint8Array(bytes),useSystemFonts:true}).promise;await renderPdfPage() }
async function renderPdfPage() { const page=await state.pdf.getPage(state.page),base=page.getViewport({scale:1}),scale=Math.min(2,1800/Math.max(base.width,base.height)),viewport=page.getViewport({scale});canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);await page.render({canvasContext:ctx,viewport}).promise }
function buildDemo() { state.file=null;state.demo=true;state.type='image';state.scaled=false;state.pdf=null;state.page=1;clearArea();canvas.width=1400;canvas.height=900;const g=ctx.createLinearGradient(0,0,1400,900);g.addColorStop(0,'#e9ddf1');g.addColorStop(1,'#d0b5e4');ctx.fillStyle=g;ctx.fillRect(0,0,1400,900);ctx.fillStyle='#faf7f3';ctx.fillRect(72,65,1256,770);ctx.fillStyle='#5d2d91';ctx.fillRect(72,65,450,770);ctx.fillStyle='#e4a786';ctx.beginPath();ctx.arc(1000,375,222,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b897d0';ctx.beginPath();ctx.arc(895,460,135,0,Math.PI*2);ctx.fill();ctx.fillStyle='#5d2d91';ctx.font='700 102px Arial';ctx.fillText('FORM',555,735);ctx.fillStyle='#faf7f3';ctx.font='italic 140px Georgia';ctx.fillText('color',116,417);ctx.fillStyle='#e4a786';ctx.fillRect(118,563,300,8);ctx.font='24px Arial';ctx.fillStyle='#faf7f3';ctx.fillText('A STUDY IN CONTRAST',118,625);setLoaded();analyzeColors();pickPixel(700,450);toast(t('demoReady')) }

function reportLines() {
  const lines=[t('reportTitle'),t('reportGenerated',{date:new Date().toLocaleString(currentLanguage())})];
  if(state.screenColors.length){lines.push('',t('reportScreen'));state.screenColors.forEach((color,i)=>lines.push(`${i+1}. ${color}`))}
  if(state.type){
    lines.push('',t('reportFile',{file:fileLabel()}),t('reportType',{type:state.type==='pdf'?t('reportPdf',{page:state.page,total:state.pdf.numPages}):t('reportImage')}),t('reportDimensions',{width:canvas.width,height:canvas.height}),'',t('reportPalette'));
    state.palette.forEach((c,i)=>lines.push(`${i+1}. ${hex(c.r,c.g,c.b)}  RGB ${c.r}, ${c.g}, ${c.b}  ${shareLabel(c.share)}`));
    if(state.scaled)lines.push(t('reportScaled',{width:state.originalWidth,height:state.originalHeight}));
    lines.push('',t('reportPixel'));
    if(state.pixel){const p=state.pixel;lines.push(t('reportAt',{color:hex(p.r,p.g,p.b),x:p.x,y:p.y}),`RGB ${p.r}, ${p.g}, ${p.b}`,`HSL ${hsl(p.r,p.g,p.b)}`)}
    if(state.area){lines.push('',t('reportArea'),t('reportAreaSize',{x:state.area.x,y:state.area.y,width:state.area.w,height:state.area.h}));state.areaPalette.forEach((c,i)=>lines.push(`${i+1}. ${hex(c.r,c.g,c.b)}  ${shareLabel(c.share)}`))}
    lines.push('',t('reportEstimates'));if(state.type==='pdf')lines.push(t('reportPdfNote'));
  }
  lines.push(t('reportPrivacy'));
  return lines;
}
function downloadBlob(name,blob) { const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500) }
function safeBaseName() { if(!state.type)return t('screenColorsFile');const base=fileLabel().replace(/\.[^.]+$/,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,40)||'design';return base+'-'+t('fileColorsSuffix') }
function downloadTxt() { downloadBlob(safeBaseName()+'.txt',new Blob([reportLines().join('\n')],{type:'text/plain;charset=utf-8'}));toast(t('txtDownloaded')) }
function pdfEscape(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,'-').replace(/[\\()]/g,'\\$&') }
function makePdf() {
  const lines=reportLines().slice(0,52);
  const headings=new Set([t('reportScreen'),t('reportPalette'),t('reportPixel'),t('reportArea')]);
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
$('screenPickButton').addEventListener('click',pickScreenColor);$('clearScreenColors').addEventListener('click',()=>{state.screenColors=[];renderScreenColors();toast(t('screenCleared'))});
if(typeof window.EyeDropper!=='function'||!window.isSecureContext){$('screenPickButton').disabled=true;$('screenSupport').textContent=t('screenUnsupported')}
refreshExports();
$('selectAreaButton').addEventListener('click',()=>{
  if(!state.type)return;
  if(state.areaMode){leaveAreaMode();$('selectionBox').hidden=true;return}
  if(state.area){clearArea();return}
  state.areaMode=true;state.tapStart=null;$('tapMarker').hidden=true;$('selectionBox').hidden=true;$('loupe').hidden=true;$('dropzone').classList.add('area-mode');
  updateAreaButton();updateStageHint();
});
$('removeFileButton').addEventListener('click',removeFile);
drop.addEventListener('pointerdown',e=>{
  if(!state.type||e.target!==canvas)return;
  if(e.pointerType==='touch'&&!state.areaMode)return;
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
  if(e.target===canvas&&e.pointerType==='touch'&&!state.areaMode)pickPixel(p.x,p.y);
});
drop.addEventListener('pointercancel',()=>{state.selecting=false;state.pointerId=null;if(state.area)restoreSelection();else $('selectionBox').hidden=true});
drop.addEventListener('pointerleave',()=>{$('loupe').hidden=true});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.areaMode){leaveAreaMode();$('selectionBox').hidden=true}});
async function changePage(delta) { if(!state.pdf)return;const next=state.page+delta;if(next<1||next>state.pdf.numPages)return;state.page=next;clearArea();await renderPdfPage();setLoaded();analyzeColors();pickPixel(canvas.width/2,canvas.height/2) }
$('pagePrev').addEventListener('click',()=>changePage(-1));$('pageNext').addEventListener('click',()=>changePage(1));
$('helpButton').addEventListener('click',()=>$('helpDialog').showModal());$('closeHelp').addEventListener('click',()=>$('helpDialog').close());$('helpStart').addEventListener('click',()=>$('helpDialog').close());
$('footerYear').textContent=String(new Date().getFullYear());
function applyLanguage(next) {
  setLanguage(next);
  if(state.type){setLoaded();renderPalette();renderAreaPalette();if(state.pixel)pickPixel(state.pixel.x,state.pixel.y)}
  else updateStageHint();
  if(state.screenColors.length)renderScreenColors();
  if($('screenPickButton').disabled)$('screenSupport').textContent=t('screenUnsupported');
  if(state.area)requestAnimationFrame(restoreSelection);
}
let languagePointerSelection=false;
$('languageSelect').addEventListener('pointerdown',()=>{languagePointerSelection=true});
$('languageSelect').addEventListener('keydown',()=>{languagePointerSelection=false});
$('languageSelect').addEventListener('change',e=>{applyLanguage(e.target.value);if(languagePointerSelection)e.target.blur();languagePointerSelection=false});
if('ResizeObserver' in window)new ResizeObserver(restoreSelection).observe(canvas);
applyLanguage(currentLanguage());
