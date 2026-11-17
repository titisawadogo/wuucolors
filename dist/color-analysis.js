const COLOR_COUNT = 0x1000000;
const BIN_COUNT = 0x8000;

export function createColorAnalysis() {
  return {
    exact: new Uint32Array(COLOR_COUNT),
    bins: new Uint32Array(BIN_COUNT),
    red: new Float64Array(BIN_COUNT),
    green: new Float64Array(BIN_COUNT),
    blue: new Float64Array(BIN_COUNT),
    maxTile: new Uint16Array(BIN_COUNT),
    total: 0,
    unique: 0
  };
}

export function addColorTile(analysis, data) {
  const local = new Uint16Array(BIN_COUNT);
  const touched = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const exact = (r << 16) | (g << 8) | b;
    if (analysis.exact[exact]++ === 0) analysis.unique++;
    const bin = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    if (local[bin]++ === 0) touched.push(bin);
    analysis.bins[bin]++;
    analysis.red[bin] += r;
    analysis.green[bin] += g;
    analysis.blue[bin] += b;
    analysis.total++;
  }
  for (const bin of touched) {
    if (local[bin] > analysis.maxTile[bin]) analysis.maxTile[bin] = local[bin];
  }
}

function colorOf(analysis, bin) {
  const n = analysis.bins[bin];
  return {r: analysis.red[bin] / n, g: analysis.green[bin] / n, b: analysis.blue[bin] / n, n};
}

function distance(a, b) {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

export function buildFullPalettes(analysis) {
  if (!analysis.total) return {dominant: [], accents: []};
  const occupied = [];
  for (let bin = 0; bin < BIN_COUNT; bin++) if (analysis.bins[bin]) occupied.push(bin);
  occupied.sort((a, b) => analysis.bins[b] - analysis.bins[a]);

  const seeds = [];
  for (const bin of occupied) {
    const color = colorOf(analysis, bin);
    if (seeds.every(seed => distance(seed, color) >= 32)) seeds.push(color);
    if (seeds.length === 8) break;
  }
  const points = occupied.map(bin => colorOf(analysis, bin));
  let groups = [];
  for (let round = 0; round < 7; round++) {
    groups = seeds.map(() => ({r: 0, g: 0, b: 0, n: 0}));
    for (const point of points) {
      let best = 0, nearest = Infinity;
      for (let i = 0; i < seeds.length; i++) {
        const d = distance(point, seeds[i]);
        if (d < nearest) { nearest = d; best = i; }
      }
      const group = groups[best];
      group.r += point.r * point.n;
      group.g += point.g * point.n;
      group.b += point.b * point.n;
      group.n += point.n;
    }
    groups.forEach((group, i) => {
      if (group.n) seeds[i] = {r: group.r / group.n, g: group.g / group.n, b: group.b / group.n};
    });
  }
  const grouped = groups.filter(group => group.n).map(group => ({
    r: Math.round(group.r / group.n),
    g: Math.round(group.g / group.n),
    b: Math.round(group.b / group.n),
    share: group.n / analysis.total
  })).sort((a, b) => b.share - a.share);
  const dominant = grouped.filter(color => color.share >= 0.01);

  const anchors = dominant.filter(color => color.share >= 0.1).slice(0, 3);
  if (!anchors.length) anchors.push(...dominant.slice(0, 3));
  const represented = dominant.filter(color => color.share >= 0.02);
  const candidates = occupied.filter(bin => analysis.maxTile[bin] >= 4 && analysis.bins[bin] / analysis.total <= 0.05)
    .map(bin => {
      const color = colorOf(analysis, bin);
      const contrast = Math.min(...anchors.map(anchor => distance(color, anchor)));
      const local = analysis.maxTile[bin];
      return {bin, color, score: contrast * Math.sqrt(local) * Math.log2(color.n + 1)};
    }).filter(candidate => represented.every(color => distance(color, candidate.color) >= 48))
    .sort((a, b) => b.score - a.score);
  const accents = [];
  for (const candidate of candidates) {
    if (accents.every(existing => distance(existing, candidate.color) >= 48)) {
      accents.push({
        r: Math.round(candidate.color.r),
        g: Math.round(candidate.color.g),
        b: Math.round(candidate.color.b),
        share: candidate.color.n / analysis.total,
        n: candidate.color.n
      });
    }
    if (accents.length === 6) break;
  }
  return {dominant, accents};
}

export function exactColorPage(analysis, start, prefix, limit = 40) {
  const rows = [];
  for (let cursor = start; cursor < COLOR_COUNT; cursor++) {
    const count = analysis.exact[cursor];
    if (!count) continue;
    const color = cursor.toString(16).padStart(6, '0').toUpperCase();
    if (prefix && !color.startsWith(prefix)) continue;
    if (rows.length === limit) return {rows, next: cursor};
    rows.push({color: `#${color}`, count});
  }
  return {rows, next: null};
}

export function exactCsvChunks(analysis, start, end) {
  const rows = [];
  for (let color = start; color < end; color++) {
    const count = analysis.exact[color];
    if (count) rows.push(`#${color.toString(16).padStart(6, '0').toUpperCase()},${count},${(count / analysis.total * 100).toFixed(6)}\n`);
  }
  return rows.join('');
}
