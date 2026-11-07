// =====================================================================
//  LAB — two clips per reference technique (Downloads/geo_ref/hieu_ung). CLIP picks the clip (make.py).
//  Excerpt clips reuse the Hậu Lộc scenes, time-shifted through voice.json; custom clips draw here from t = 0.
// =====================================================================
const LAB = {};
const LAB_SFX = {
  '01': [['dive', 0.2], ['hit', 3.5]], '02': [['air', 0.0], ['ping', 0.5]], '06': [['hit', 0.3]], '13': [['hit', 0]],
  '19': [['ping', 0.6], ['ping', 1.8], ['ping', 3.0]], '22': [['air', 0.2]], '23a': [['ping', 0.3]], '23b': [['hit', 0]],
  '24': [['marker', 1.1]], '26': [['whoosh', 1.5], ['whoosh', 3.75]],
};
// ---- helpers
const camK = (keys) => { GC = gCamAt(keys, TT); };
function zoomBlur(k, cy = GAY()) {   // radial zoom blur: the frame redrawn a little larger a few times, faint
  if (k <= 0.02) return; const cv = ctx.canvas; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 1; i <= 4; i++) { const s = 1 + 0.02 * i * k; ctx.globalAlpha = 0.11; ctx.drawImage(cv, W / 2 - W * s / 2, cy - cy * s, W * s, H * s); }
  ctx.restore();
}
function labGlobe(T, lon0, lat0) {   // the globe turns from (lon0, lat0) to Vietnam and grows into the flat map by T
  const u = seg(TT, 0, T - 0.7), zu = EZ.io(seg(TT, 0.3, T - 0.7)) ** 1.6;
  const R = Math.exp(lerp(Math.log(380), Math.log(6371 * 0.78), zu));
  const lon = lerp(lon0, 105.9, EZ.io(seg(TT, 0, T - 0.8))), lat = lerp(lat0, 19.88 - 380 / 111.32, EZ.io(seg(TT, 0, T - 0.8)));
  const cy = lerp(H * 0.5, GAY(), EZ.io(u));
  ctx.fillStyle = '#01030a'; ctx.fillRect(0, 0, W, H); fxStars();
  const hand = seg(TT, T - 0.7, T);
  if (hand > 0) { GC = { x: 0, y: 380, s: 0.78 }; gGround({ dim: 0.28 }); gRegion(GEO.vn, { line: '#ffffff', lw: 2.5, la: 0.85 }); }
  ctx.save(); ctx.globalAlpha = 1 - hand; if (hand < 1) fxGlobe(W / 2, cy, R, lon, lat, { vn: seg(TT, 0.6, 1.2) }); ctx.restore();
  zoomBlur(seg(TT, 0.9, 1.7) * (1 - seg(TT, T - 1.0, T - 0.6)), cy);
}
// a giant 3D word standing on the map over a world point; the camera dives through it
function flyWord(word, p, s0, sFade, o = {}) {
  const [x, y] = gSP(p), r = GC.s / s0, size = (o.size ?? 150) * Math.pow(r, 0.85), wEst = size * word.length * 0.62;
  const fade = clamp((sFade - GC.s) / (sFade * 0.25)) * EZ.o3(ev(o.t0 ?? 0, 0.5)); if (fade <= 0) return;
  ctx.save(); ctx.translate(clamp(x, 60 + Math.min(wEst / 2, 400), W - 60 - Math.min(wEst / 2, 400)), y - size * 0.75); ctx.transform(1, 0, -0.18, 0.86, 0, 0);
  fx3DText(word, 0, 0, size, '#ffffff', o.side ?? '#5a3a12', { face2: '#ffe2b0', depth: size * 0.12, dx: 0.4, dy: 1, alpha: fade }); ctx.restore();
}
const DVIEW = [-0.4, -6.2, 34];   // the district fills the frame
function grpR(n) { return GRP(n).r; }
// a raised slab in any colour (06 B)
function slabC(R, h, k, c, c2) {
  if (k <= 0) return; const hh = h * k; ctx.save();
  for (let i = Math.ceil(hh); i > 0; i -= 2) { ctx.save(); ctx.translate(0, i); gTrace(R); ctx.fillStyle = c2; ctx.fill(); ctx.restore(); }
  gTrace(R); ctx.translate(0, 0); ctx.fillStyle = c; ctx.fill();
  ctx.save(); gTrace(R); ctx.clip(); ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 3; for (let x = -H; x < W + H; x += 22) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke(); } ctx.restore();
  gTrace(R); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
}
const shiftR = (R, dy) => R.map((r) => r.map((p) => [p[0], p[1] + dy]));

// ---- 01 B: one dive from the whole Earth (turning from Africa) straight down to Hậu Lộc
LAB['01B'] = () => {
  const T = 3.0; if (TT < T) { labGlobe(T, 20, 5); return; }
  camK([[0, 0, 380, 0.78, 0], [T + 0.05, -40, -10, 3.4, 1.3], [T + 1.45, DVIEW[0], DVIEW[1], DVIEW[2], 1.5]]);
  gGround({ dim: 0.3 });
  gRegion(GEO.vn, { line: '#ffffff', lw: 2.5, la: 0.85 * (1 - seg(GC.s, 3, 9)) });
  gRegion(TH_PROV.r, { fill: G.orange, fa: 0.22 * (1 - seg(GC.s, 8, 22)), line: G.orange, lw: 3, la: 1 - seg(GC.s, 14, 30) });
  hlOutline({ fill: true, fa: 0.3 * ev(T + 2.4, 0.6), frac: ev(T + 2.2, 1.0), len: gRingLen(GEO.hl) + 20, glow: 22 });
  zoomBlur(seg(TT, T + 0.3, T + 0.7) * (1 - seg(TT, T + 1.6, T + 2.2)));
  const [hx, hy] = gSP(HLC); if (TT > T + 2.6) gPulse(hx, hy, T + 2.6, G.orange, 18);
  fxBlurText('HẬU LỘC', 70, 420, 120, '#fff', T + 2.7);
  fxBlurText('THANH HÓA · VIỆT NAM', 74, 480, 40, G.orange, T + 3.0, { weight: 800 });
};
// ---- 02 B: the coast on a tilted camera that pans south along the shore
LAB['02B'] = () => {
  const k = EZ.io(seg(TT, 0.2, 1.8));
  camK([[0, DVIEW[0], DVIEW[1], DVIEW[2], 0], [0.6, 3.5, -6.0, 62, 3.6]]);
  const coast = COAST.map((n) => COMM(n)).filter(Boolean);
  fxTilted(1.0 * k, () => {
    gGround({ dim: 0.3 }); hlOutline({ fa: 0.06, lw: 4 });
    coast.forEach((c, i) => { const kk = popS(1.4 + i * 0.35); if (kk > 0) gRegion(c.r, { fill: G.teal, fa: 0.4 * clamp(kk), line: '#ffffff', lw: 2, la: clamp(kk) }); });
  });
  coast.forEach((c, i) => { const [x, y] = gSPt(c.c); gFlag(clamp(x, 120, 880), clamp(y, 420, 1300), c.n.toUpperCase(), { bg: G.teal, fg: '#fff', size: 30, pop: popS(1.5 + i * 0.35), up: 40, side: i % 2 ? 60 : -60 }); });
  const [nx, ny] = gSPt(HONNE); gPin(nx, ny, { pop: popS(3.6) }); gFlag(nx, ny - 50, 'HÒN NẸ', { bg: '#fff', size: 30, pop: popS(3.7), up: 20 });
  gTitle([{ text: 'BỜ BIỂN', italic: true, color: G.teal, size: 50 }, { text: '6 XÃ VEN BIỂN', size: 80 }], 70, 330, 0.4, { cps: 34 });
};
// ---- 03 A: "THANH HÓA" stands on the province; the camera flies through it into Hậu Lộc
LAB['03A'] = () => {
  camK([[0, -40, -10, 3.4, 0], [0.8, DVIEW[0], DVIEW[1], DVIEW[2], 3.0]]);
  gGround({ dim: 0.3 });
  gRegion(TH_PROV.r, { fill: G.orange, fa: 0.18 * (1 - seg(GC.s, 8, 22)), line: G.orange, lw: 3, la: 1 - seg(GC.s, 14, 30) });
  for (const d of GEO.dist) gRegion(d.r, { line: 'rgba(255,255,255,0.4)', lw: 1.5, la: 1 - seg(GC.s, 10, 25) });
  hlOutline({ fill: true, fa: 0.28 * ev(3.6, 0.6), frac: ev(3.2, 1.0), len: gRingLen(GEO.hl) + 20, glow: 22 });
  flyWord('THANH HÓA', HLC, 3.4, 14, { size: 130, t0: 0.1 });
  zoomBlur(seg(TT, 1.4, 1.9) * (1 - seg(TT, 2.6, 3.2)));
  const [hx, hy] = gSP(HLC); gFlag(hx, hy, 'HẬU LỘC', { size: 44, pop: popS(4.0), up: 50 });
};
// ---- 03 B: "HẬU LỘC" over the district; the camera flies through it down to Ngư Lộc
LAB['03B'] = () => {
  camK([[0, DVIEW[0], DVIEW[1], DVIEW[2], 0], [0.8, NGULOC[0], NGULOC[1], 210, 3.0]]);
  gGround({ dim: 0.3 });
  hlOutline({ fill: true, fa: 0.25 * (1 - seg(GC.s, 60, 140)), glow: 20 });
  for (const c of GEO.comm) gRegion(c.r, { line: 'rgba(255,255,255,0.45)', lw: 2, la: seg(GC.s, 50, 90) });
  const ng = COMM('Ngư Lộc'); gRegion(ng.r, { fill: G.red, fa: 0.3 * ev(3.5, 0.5), line: G.red, lw: 5, glow: 18, la: ev(3.3, 0.4) });
  flyWord('HẬU LỘC', NGULOC, 34, 120, { size: 150, t0: 0.1, side: '#7a2a12' });
  zoomBlur(seg(TT, 1.2, 1.8) * (1 - seg(TT, 3.0, 3.6)));
  const [px, py] = gSP(NGULOC); gPulse(px, py, 3.7, G.red, 18); gFlag(px, py, 'NGƯ LỘC', { bg: G.red, fg: '#fff', size: 44, pop: popS(3.8), up: 50 });
};
// fit the camera to a set of regions (pad in px)
function fitCam(Rs, pad = 120, dy = 0) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const R of Rs) for (const r of R) for (const p of r) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  const s = Math.min((W - SAFE.right - 2 * pad) / (x1 - x0), (1300 - 300 - pad) / (y1 - y0));
  return [(x0 + x1) / 2 + SAFE.right / 2 / s, (y0 + y1) / 2 - (GAY() - 800) / s + dy / s, s];
}
// ---- 04 A: Hậu Lộc's neighbours named in big vertical type inside their regions
LAB['04A'] = () => {
  const nb = [['NGA SƠN', 'Nga Sơn', G.teal, 0.3], ['HÀ TRUNG', 'Hà Trung', G.violet, 0.8], ['HOẰNG HÓA', 'Hoằng Hóa', G.red, 1.3]];
  const [cx, cy, s] = fitCam([GEO.hl, ...nb.map((n) => DIST(n[1]).r)], 60);
  GC = { x: cx, y: cy, s: s * (1 + 0.02 * TT) };
  gGround({ dim: 0.35 });
  for (const [, n, c, at] of nb) { const d = DIST(n); gRegion(d.r, { fill: c, fa: 0.25 * ev(at, 0.4), line: c, lw: 3, la: ev(at, 0.4) }); }
  hlOutline({ fill: true, fa: 0.35, glow: 20 });
  for (const [l, n, c, at] of nb) { const [x, y] = gSP(DIST(n).c); fxVName(l, clamp(x, 90, 860), clamp(y, 420, 1250), 70, '#ffffff', ev(at, 0.8)); }
  const [bx, by] = gSP([16, -2]); fxVName('BIỂN ĐÔNG', clamp(bx, 120, 880), clamp(by, 500, 1200), 90, '#9fd8ff', ev(1.8, 0.9));
  const [hx, hy] = gSP([4.5, -6.5]); fxVName('HẬU LỘC', hx, hy, 56, '#ffffff', ev(2.3, 0.8), { a: 0 });
};
// ---- 04 B: the provinces around Thanh Hóa, named vertically inside their shapes
LAB['04B'] = () => {
  const PV = (n) => GEO.prov.find((p) => p.n === n);
  const L = [['THANH HÓA', 'Thanh Hóa', G.orange, 0.3, 110], ['NINH BÌNH', 'Ninh Bình', G.teal, 0.9, 60], ['NGHỆ AN', 'Nghệ An', G.red, 1.4, 90]];
  GC = { x: -70, y: 10, s: 3.2 * (1 + 0.02 * TT) };
  gGround({ dim: 0.35 });
  for (const p of GEO.prov) gRegion(p.r, { line: 'rgba(255,255,255,0.35)', lw: 1.5 });
  for (const [, n, c, at] of L) { const p = PV(n); if (p) gRegion(p.r, { fill: c, fa: 0.3 * ev(at, 0.4), line: c, lw: 3, la: ev(at, 0.4) }); }
  for (const [l, n, c, at, sz] of L) { const p = PV(n); if (!p) continue; const [x, y] = gSP(p.c); fxVName(l, clamp(x, 90, 860), clamp(y, 420, 1250), sz, '#ffffff', ev(at, 0.8)); }
  const [bx, by] = gSP([60, 10]); fxVName('VỊNH BẮC BỘ', clamp(bx, 120, 880), clamp(by, 500, 1200), 76, '#9fd8ff', ev(2.0, 0.9));
};
// ---- 05 A: the sea photo poured into the district's shape
LAB['05A'] = () => {
  camK([[0, DVIEW[0], DVIEW[1], DVIEW[2], 0], [0, DVIEW[0], DVIEW[1], DVIEW[2] * 1.08, 5]]); GC.s *= 1 + 0.03 * TT;
  gGround({ dim: 0.45 });
  fxPhotoRegion('de_bien.jpg', GEO.hl, EZ.o3(ev(1.0, 0.9)), { zoom: 1.5 + 0.08 * TT / 5, fy: 0.8 });
  hlOutline({ fa: 0, lw: 6, glow: 26, frac: ev(0.1, 1.0), len: gRingLen(GEO.hl) + 20 });
  gTitle([{ text: 'VÙNG ĐẤT BÊN BIỂN', italic: true, color: G.orange, size: 46 }, { text: 'HẬU LỘC', size: 120 }], 70, 330, 1.6, { cps: 30 });
};
// ---- 05 B: two communes filled with their own photos, one after the other
LAB['05B'] = () => {
  camK([[0, -2.5, -6.5, 40, 0], [0.2, -6.5, -6.8, 70, 1.4], [2.0, 4.0, -6.0, 70, 1.4]]);
  gGround({ dim: 0.45 });
  NEW5.forEach((n) => gRegion(grpR(n.n), { line: 'rgba(255,255,255,0.7)', lw: 2 }));
  hlOutline({ fa: 0, glow: 18 });
  const P = [['Triệu Lộc', 'den_ba_trieu.jpg', 'TRIỆU LỘC', 'ĐỀN BÀ TRIỆU', G.red, 0.5], ['Vạn Lộc', 'g_harbour.jpg', 'VẠN LỘC', 'THUYỀN CÁ VEN BIỂN', G.teal, 2.3]];
  for (const [n, img, l, sub, c, at] of P) {
    fxPhotoRegion(img, grpR(n), EZ.o3(ev(at, 0.8)), { zoom: 1.2 });
    gRegion(grpR(n), { line: c, lw: 6, glow: 20, la: ev(at, 0.5) });
    const [x, y] = gSP(GRP(n).c); gFlag(x, y - 20, l, { bg: c, fg: '#fff', size: 38, pop: popS(at + 0.5), up: 70, sub });
  }
};
// ---- 06 B: the five new communes rise as slabs, height = how many old units each joined
LAB['06B'] = () => {
  camK([[0, -0.6, -4.0, 40, 0]]); GC.s *= 1 + 0.015 * TT;
  gGround({ dim: 0.5 });
  const order = NEW5.map((n) => ({ ...n, cy: GRP(n.n).c[1] })).sort((a, b) => a.cy - b.cy);   // back to front
  order.forEach((n) => { const i = NEW5.indexOf(NEW5.find((m) => m.n === n.n)), at = 0.4 + i * 0.4, k = EZ.back(clamp((TT - at) / 0.6));
    const h = n.units * 22 * Math.max(0, k), R = shiftR(grpR(n.n), -h / GC.s);
    const dark = (hex) => { const v = parseInt(hex.slice(1), 16); return `rgb(${((v >> 16) & 255) * 0.5 | 0},${((v >> 8) & 255) * 0.5 | 0},${(v & 255) * 0.5 | 0})`; };
    slabC(R, h, 1, n.c, dark(n.c));
  });
  NEW5.forEach((n, i) => { const at = 0.4 + i * 0.4, [x, y] = gSP(GRP(n.n).c), h = n.units * 22;
    gFlag(x, y - h, n.n.toUpperCase(), { bg: n.c, fg: n.fg ?? '#fff', size: 30, pop: popS(at + 0.5), up: 40, sub: n.units + ' đơn vị cũ', side: n.side ?? 0 }); });
  gTitle([{ text: 'SỐ ĐƠN VỊ CŨ GỘP LẠI', italic: true, color: G.orange, size: 46 }, { text: 'CAO = NHIỀU', size: 80 }], 70, 330, 0.2, { cps: 34 });
};
Object.assign(LAB_SFX, {
  '01B': [['dive', 0.2], ['air', 3.0], ['hit', 5.6]], '02B': [['air', 0.2], ['ping', 1.5], ['ping', 3.6]], '03A': [['dive', 0.8], ['ping', 4.0]], '03B': [['dive', 0.8], ['ping', 3.8]],
  '04A': [['ping', 0.3], ['ping', 1.3]], '04B': [['ping', 0.4], ['ping', 1.6]], '05A': [['whoosh', 1.0]], '05B': [['whoosh', 0.5], ['whoosh', 2.3]], '06B': [['hit', 0.4], ['hit', 2.0]],
});

// ---- photo helpers
function photoFS(name, o = {}) {   // a photo filling the frame, slow push-in; returns a mapper image (0..1) -> screen
  const img = asset(name); if (!img) return null;
  const z = (o.z0 ?? 1.04) + (o.dz ?? 0.06) * EZ.io(clamp(TT / (o.dur ?? 5)));
  const sc = Math.max(W / img.naturalWidth, H / img.naturalHeight) * z, dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
  const fx = o.fx ?? 0.5, x0 = (W - dw) * fx, y0 = (H - dh) * (o.fy ?? 0.5);
  ctx.save(); if (o.filter) ctx.filter = o.filter; ctx.drawImage(img, x0, y0, dw, dh); ctx.restore();
  return (nx, ny) => [x0 + nx * dw, y0 + ny * dh];
}
function footShade(a = 0.75) { const g = ctx.createLinearGradient(0, 900, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.45, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0.85)'); ctx.fillStyle = g; ctx.fillRect(0, 900, W, H - 900); }
function popLines(lines, at, big, color, y1 = 1290) {   // big lines popping in from 1.1x, stacked up from y1; last line coloured
  const n = lines.length, lh = big * 1.02, y0 = y1 - (n - 1) * lh;
  lines.forEach((L, i) => { const k = EZ.o3(ev(at + i * 0.12, 0.35)); if (k <= 0) return; ctx.save(); const yy = y0 + i * lh, s = 1.1 - 0.1 * k; ctx.translate(70, yy); ctx.scale(s, s); ctx.translate(-70, -yy);
    gText(L, 70, yy, big, i === n - 1 ? color : '#fff', { weight: 900, alpha: k }); ctx.restore(); });
}
// legend box (07)
function legend(items, x, y, k) {
  if (k <= 0) return; const h = 30 + items.length * 52; ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(5,10,14,0.82)'; ctx.beginPath(); ctx.roundRect(x, y, 430, h, 14); ctx.fill(); ctx.restore();
  items.forEach(([c, l, dash], i) => { const yy = y + 42 + i * 52, kk = ev(0.1 * i, 0.3) * k; ctx.save(); ctx.globalAlpha = kk; ctx.strokeStyle = c; ctx.lineWidth = 8; ctx.shadowColor = c; ctx.shadowBlur = 12; if (dash) ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.moveTo(x + 24, yy); ctx.lineTo(x + 94, yy); ctx.stroke(); ctx.restore(); gText(l, x + 116, yy + 11, 30, '#fff', { weight: 800, alpha: kk }); });
}
// ---- 07 A: roads as neon lines with a legend, a car running along QL10
LAB['07A'] = () => {
  GC = { x: -3, y: -3, s: 25 * (1 + 0.02 * TT) };
  gGround({ dim: 0.55 }); hlOutline({ fa: 0.08, lw: 4 });
  fxNeon(ROADS.ql1, '#ff4d4d', { frac: seg(TT, 0.3, 1.6), lw: 6 });
  fxNeon(ROADS.ql10, '#ffd23f', { frac: seg(TT, 0.9, 2.2), lw: 6 });
  fxNeon(ROADS.rail, '#4dd8ff', { frac: seg(TT, 1.5, 2.8), lw: 5, dash: [16, 12] });
  const path = joinLines(ROADS.ql10); if (TT > 2.2) { const u = seg(TT, 2.2, 4.8), [x, y, a] = polyAt(path.map(gSP), u); fxIcon('car', x, y, 1.2, a, '#ffd23f'); }
  legend([['#ff4d4d', 'QUỐC LỘ 1A'], ['#ffd23f', 'QUỐC LỘ 10'], ['#4dd8ff', 'ĐƯỜNG SẮT BẮC NAM', true]], 70, 1140, ev(0.6, 0.4));
  gTitle([{ text: 'GIAO THÔNG', italic: true, color: G.orange, size: 46 }, { text: 'HẬU LỘC', size: 96 }], 70, 330, 0.1, { cps: 34 });
};
// ---- 07 B: the railway in neon with a train, a distance oval to Thanh Hóa city
LAB['07B'] = () => {
  GC = { x: -7, y: 1, s: 30 * (1 + 0.02 * TT) };
  gGround({ dim: 0.55 }); hlOutline({ fa: 0.1, lw: 4 });
  fxNeon(ROADS.ct, '#b06cff', { frac: seg(TT, 0.2, 1.4), lw: 6 });
  fxNeon(ROADS.rail, '#4dd8ff', { frac: seg(TT, 0.6, 1.8), lw: 6 });
  const path = joinLines(ROADS.rail); if (TT > 1.8) { const u = seg(TT, 1.8, 4.6), [x, y, a] = polyAt(path.map(gSP), u); fxIcon('train', x, y, 1.1, a, '#ffffff'); }
  const [cx, cy] = gSP(TPTH), [hx, hy] = gSP(COMM('Hậu Lộc').c);
  gPin(cx, cy, { pop: popS(0.5) }); gFlag(cx, cy - 50, 'TP. THANH HÓA', { bg: '#fff', size: 30, pop: popS(0.6), up: 20 });
  gFlag(hx, hy, 'HẬU LỘC', { size: 34, pop: popS(0.3), up: 40 });
  fxOval([cx, cy], [hx, hy], '~25 KM', ev(2.4, 1.0), G.yellow);
  legend([['#b06cff', 'CAO TỐC BẮC NAM'], ['#4dd8ff', 'ĐƯỜNG SẮT BẮC NAM']], 70, 1190, ev(0.4, 0.4));
};
// a photo in a white frame (08)
function framePhoto(name, x, y, w, h, k, label) {
  const img = asset(name); if (!img || k <= 0) return; ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(k, k); ctx.translate(-x - w / 2, -y - h / 2);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 22; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(x - 7, y - 7, w + 14, h + 14, 16); ctx.fill(); ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.clip(); const sc = Math.max(w / img.naturalWidth, h / img.naturalHeight) * 1.05; ctx.drawImage(img, x + (w - img.naturalWidth * sc) / 2, y + (h - img.naturalHeight * sc) / 2, img.naturalWidth * sc, img.naturalHeight * sc);
  if (label) { const g = ctx.createLinearGradient(0, y + h * 0.55, 0, y + h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.75)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); }
  ctx.restore(); if (label && k > 0.6) gText(label, x + w / 2, y + h - 18, 26, '#fff', { align: 'center', weight: 900, alpha: clamp((k - 0.6) / 0.4) });
}
function raysToPhotos(px, py, items, t0, c) {   // light rays from a point out to small framed photos
  items.forEach(([img, x, y, w, h, label], i) => { const at = t0 + i * 0.35, k = EZ.o3(ev(at, 0.4)); if (k <= 0) return;
    const tx = x + w / 2, ty = y + h / 2; ctx.save(); const g = ctx.createLinearGradient(px, py, tx, ty); g.addColorStop(0, c); g.addColorStop(1, 'rgba(255,255,255,0.9)');
    ctx.strokeStyle = g; ctx.lineWidth = 5; ctx.shadowColor = c; ctx.shadowBlur = 18; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(lerp(px, tx, k), lerp(py, ty, k)); ctx.stroke(); ctx.restore();
    framePhoto(img, x, y, w, h, EZ.back(ev(at + 0.25, 0.4)), label); });
}
// ---- 08 A: a big pin with a temple icon on Triệu Lộc, rays out to three photos
LAB['08A'] = () => {
  GC = { x: BATRIEU[0] + 1.5, y: BATRIEU[1] - 4, s: 50 * (1 + 0.02 * TT) };
  gGround({ dim: 0.45 }); hlOutline({ fa: 0.05 }); gRegion(COMM('Triệu Lộc').r, { fill: G.red, fa: 0.25, line: G.red, lw: 4, glow: 14 });
  const [x, y] = gSP(BATRIEU); gPulse(x, y, 0.3, G.red, 20);
  fxBigPin(x, y, popS(0.2), '#b02a2a', () => iconTemple('#fff'), { r: 64 });
  raysToPhotos(x, y - 180, [['den_ba_trieu.jpg', 70, 330, 300, 220, 'CỔNG ĐỀN'], ['fs_ba_trieu.jpg', 400, 280, 300, 220, 'VOI ĐÁ'], ['fs_ba_trieu2.jpg', 640, 560, 280, 200, 'CỘT TRỤ']], 0.9, G.red);
  gFlag(x, y + 120, 'TRIỆU LỘC', { bg: G.red, fg: '#fff', size: 36, pop: popS(0.5), up: -60 });
};
// ---- 08 B: a big pin with a jar icon on Ngư Lộc, rays out to three photos of the fishing village
LAB['08B'] = () => {
  GC = { x: NGULOC[0] - 2.5, y: NGULOC[1] - 3, s: 60 * (1 + 0.02 * TT) };
  gGround({ dim: 0.45 }); hlOutline({ fa: 0.05 }); gRegion(COMM('Ngư Lộc').r, { fill: G.teal, fa: 0.3, line: G.teal, lw: 4, glow: 14 });
  const [x, y] = gSP(NGULOC); gPulse(x, y, 0.3, G.teal, 20);
  fxBigPin(x, y, popS(0.2), '#1f7f86', () => iconPot('#fff'), { r: 64 });
  raysToPhotos(x, y - 180, [['g_harbour.jpg', 70, 300, 320, 220, 'THUYỀN CÁ'], ['g_dryfish.jpg', 90, 600, 300, 210, 'PHƠI CÁ'], ['fs_mam_tom_ai.jpg', 420, 300, 280, 220, 'MẮM TÔM']], 0.9, G.teal);
  gFlag(x, y + 120, 'NGƯ LỘC', { bg: G.teal, fg: '#fff', size: 36, pop: popS(0.5), up: -60 });
};
// darken everything outside a region (09)
function dimOutside(R, a) { if (a <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); for (const r of R) { r.forEach((p, i) => { const [x, y] = gSP(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); } ctx.fillStyle = `rgba(3,6,9,${a})`; ctx.fill('evenodd'); ctx.restore(); }
// ---- 09 A: the district lit, everything outside darkened, the Lèn river glowing along its north edge
LAB['09A'] = () => {
  GC = { x: -1.5, y: -7.5, s: 36 * (1 + 0.02 * TT) };
  gGround({ dim: 0.25 });
  dimOutside(GEO.hl, 0.72 * EZ.io(ev(0.3, 1.0)));
  gRegion(GEO.hl, { line: '#ffffff', lw: 8, glow: 18, frac: ev(0.3, 1.0), len: gRingLen(GEO.hl) + 20 });
  fxNeon(ROADS.len, '#3fd0ff', { frac: seg(TT, 1.4, 3.0), lw: 9 });
  const L = ROADS.len[0], [rx, ry] = gSP(L[Math.floor(L.length * 0.55)]); gFlag(rx, ry, 'SÔNG LÈN', { bg: '#3fd0ff', fg: '#06222c', size: 34, pop: popS(3.0), up: 50 });
  gTitle([{ text: 'RANH GIỚI PHÍA BẮC', italic: true, color: '#3fd0ff', size: 44 }, { text: 'SÔNG LÈN', size: 96 }], 70, 330, 1.6, { cps: 34 });
};
// ---- 09 B: the spotlight narrows from the district to Ngư Lộc
LAB['09B'] = () => {
  camK([[0, DVIEW[0], DVIEW[1], DVIEW[2], 0], [1.6, NGULOC[0] - 0.3, NGULOC[1] + 0.3, 130, 1.8]]);
  gGround({ dim: 0.25 });
  const ng = COMM('Ngư Lộc'), sw = seg(TT, 1.6, 2.6);
  if (sw < 1) { dimOutside(GEO.hl, 0.7 * EZ.io(ev(0.2, 0.8)) * (1 - sw)); gRegion(GEO.hl, { line: '#ffffff', lw: 7, glow: 16, la: 1 - sw }); }
  if (sw > 0) { dimOutside(ng.r, 0.75 * sw); gRegion(ng.r, { line: '#ffffff', lw: 8, glow: 20, la: sw }); }
  const [px, py] = gSP(NGULOC); gFlag(px, py, 'NGƯ LỘC', { bg: G.red, fg: '#fff', size: 40, pop: popS(2.8), up: 60 });
  gTitle([{ text: 'TÂM ĐIỂM', italic: true, color: G.orange, size: 44 }, { text: 'LÀNG BIỂN', size: 96 }], 70, 330, 2.9, { cps: 34 });
};
// ---- 11 B: the harbour from black-and-white to colour, out of focus to sharp
LAB['11B'] = () => {
  const c = seg(TT, 0.6, 2.6), b = 1 - seg(TT, 0.0, 1.6);
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, H);
  photoFS('g_harbour.jpg', { fx: 0.35 + 0.1 * EZ.io(seg(TT, 0, 5)), filter: `grayscale(${1 - c}) sepia(${0.35 * (1 - c)}) blur(${b * 14}px) brightness(${0.8 + 0.15 * c})` });
  footShade(0.75);
  gText('DIÊM PHỐ', 70, 1030, 40, G.teal, { italic: true, weight: 900, alpha: ev(2.4, 0.4) });
  popLines(['THUYỀN CÁ', 'VỀ BẾN'], 2.7, 110, G.teal);
};
// ---- 12: outlines around objects in a photo, a label pointing at each, while the photo pans
LAB['12A'] = () => {
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, H);
  const map = photoFS('fs_ba_trieu2.jpg', { fx: lerp(0.28, 0.62, EZ.io(seg(TT, 0, 5))), z0: 1.0, dz: 0.03, filter: 'brightness(0.85)' });
  if (!map) return;
  fxOutline(map, [0.253, 0.28, 0.333, 0.95], 'CỘT TRỤ', seg(TT, 0.4, 1.4));
  fxOutline(map, [0.417, 0.10, 0.508, 0.96], 'CỘT TRỤ CHÍNH', seg(TT, 1.4, 2.4), G.yellow, { below: false });
  fxOutline(map, [0.658, 0.19, 0.742, 0.86], 'CỘT TRỤ', seg(TT, 2.8, 3.8));
  footShade(0.7); gText('ĐỀN BÀ TRIỆU', 70, 1290, 80, '#fff', { weight: 900, alpha: ev(0.2, 0.4) });
};
LAB['12B'] = () => {
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, H);
  const map = photoFS('g_dryfish.jpg', { fx: lerp(0.05, 0.92, EZ.io(seg(TT, 0, 5.5))), z0: 1.0, dz: 0.03, dur: 5.5 });
  if (!map) return;
  fxOutline(map, [0.10, 0.54, 0.17, 0.77], 'NGƯỜI DÂN', seg(TT, 0.3, 1.1), G.yellow);
  fxOutline(map, [0.24, 0.55, 0.71, 0.76], 'PHƠI CÁ', seg(TT, 1.5, 2.6));
  fxOutline(map, [0.82, 0.39, 0.89, 0.61], 'XE MÁY', seg(TT, 3.6, 4.4), G.teal);
  footShade(0.7); gText('PHỐ BIỂN NGƯ LỘC', 70, 1290, 70, '#fff', { weight: 900, alpha: ev(0.2, 0.4) });
};
Object.assign(LAB_SFX, {
  '07A': [['ping', 0.3], ['air', 2.2]], '07B': [['ping', 0.3], ['air', 1.8]], '08A': [['hit', 0.2], ['ping', 0.9], ['ping', 1.6]], '08B': [['hit', 0.2], ['ping', 0.9], ['ping', 1.6]],
  '09A': [['air', 0.3], ['ping', 3.0]], '09B': [['air', 1.6], ['ping', 2.8]], '11B': [['whoosh', 0.1], ['hit', 2.7]], '12A': [['ping', 0.4], ['ping', 1.4], ['ping', 2.8]], '12B': [['ping', 0.3], ['ping', 1.5], ['ping', 3.6]],
});

// ---- 13 B: three photos stacked vertically, framed and labelled
LAB['13B'] = () => {
  fxPaper(PAPER, true);
  fx3DText('BA ĐIỂM ĐẾN', 70, 300, 64, '#fff', '#7a4a16', { align: 'left', depth: 6, alpha: EZ.o3(ev(0, 0.4)) });
  fxGrid([{ img: 'den_ba_trieu.jpg', label: 'ĐỀN BÀ TRIỆU', c: G.red }, { img: 'hon_ne.jpg', label: 'ĐẢO HÒN NẸ', c: G.teal }, { img: 'fs_mam_tom_ai.jpg', label: 'MẮM TÔM HẬU LỘC' }],
    0.3, { x: 110, y: 380, w: 760, h: 920, cols: 1, stagger: 0.45 });
};
// ---- 14: an old photo in a curved-TV frame slides out of a corner and lands on the map
function tvPhoto(name, x, y, w, h, rot, k, o = {}) {
  const img = asset(name); if (!img || k <= 0) return;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.globalAlpha = clamp(k * 3);
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16; ctx.fillStyle = '#e9e2d0';
  ctx.beginPath(); ctx.roundRect(-w / 2 - 22, -h / 2 - 22, w + 44, h + 44, 30); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  const R = Math.min(w, h) * 0.16; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, R); ctx.clip();
  const sc = Math.max(w / img.naturalWidth, h / img.naturalHeight) * 1.08; ctx.filter = o.filter ?? 'grayscale(1) contrast(1.2) brightness(0.95)';
  ctx.drawImage(img, -img.naturalWidth * sc / 2, -img.naturalHeight * sc / 2, img.naturalWidth * sc, img.naturalHeight * sc); ctx.filter = 'none';
  const g = ctx.createRadialGradient(0, 0, Math.min(w, h) * 0.25, 0, 0, Math.max(w, h) * 0.65); g.addColorStop(0, 'rgba(255,255,255,0.06)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);   // bulge
  ctx.globalAlpha = 0.08; ctx.fillStyle = '#000'; for (let yy = -h / 2; yy < h / 2; yy += 6) ctx.fillRect(-w / 2, yy, w, 2);   // scanlines
  ctx.restore();
}
function slideIn(from, to, at, d = 0.9) { const u = EZ.o3(ev(at, d)); return [lerp(from[0], to[0], u), lerp(from[1], to[1], u), u]; }
LAB['14A'] = () => {
  GC = { x: 6.5, y: -5.0, s: 40 * (1 + 0.02 * TT) }; gGround({ dim: 0.4 }); hlOutline({ fa: 0.08 });
  const [nx, ny] = gSP(HONNE); gPulse(nx, ny, 0.2, G.red, 16); gPin(nx, ny, { color: G.red, dot: '#fff', pop: popS(0.2) });
  const [x, y, u] = slideIn([W + 200, -500], [130, 380], 0.5, 1.0), rot = lerp(0.5, -0.04, u);
  if (u > 0.95) { ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.setLineDash([12, 10]); ctx.globalAlpha = ev(1.6, 0.4); ctx.beginPath(); ctx.moveTo(x + 360, y + 480); ctx.lineTo(nx, ny - 50); ctx.stroke(); ctx.restore(); }
  tvPhoto('fs_maddox.jpg', x, y, 720, 440, rot, u);
  fxPill('1964', 150, 940, 64, '#fff', G.red, popS(1.8), { align: 'left' });
  gText('Tàu khu trục Mỹ ngoài khơi Hòn Nẹ', 150, 1040, 38, '#fff', { weight: 800, alpha: ev(2.1, 0.4) });
};
LAB['14B'] = () => {
  GC = { x: BATRIEU[0] + 2, y: BATRIEU[1] - 2.5, s: 55 * (1 + 0.02 * TT) }; gGround({ dim: 0.4 }); hlOutline({ fa: 0.06 });
  gRegion(COMM('Triệu Lộc').r, { fill: G.red, fa: 0.2, line: G.red, lw: 4 });
  const [bx, by] = gSP(BATRIEU); gPulse(bx, by, 0.2, G.red, 16); gPin(bx, by, { color: G.red, dot: '#fff', pop: popS(0.2) });
  const [x, y, u] = slideIn([-900, H + 100], [200, 360], 0.5, 1.0), rot = lerp(-0.45, 0.035, u);
  if (u > 0.95) { ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.setLineDash([12, 10]); ctx.globalAlpha = ev(1.6, 0.4); ctx.beginPath(); ctx.moveTo(x + 330, y + 470); ctx.lineTo(bx, by - 50); ctx.stroke(); ctx.restore(); }
  tvPhoto('den_ba_trieu.jpg', x, y, 660, 440, rot, u, { filter: 'sepia(0.75) contrast(1.1) brightness(0.9)' });
  fxPill('ĐỀN BÀ TRIỆU', 220, 940, 48, '#fff', G.red, popS(1.8), { align: 'left' });
  gText('Núi Gai, Triệu Lộc', 220, 1030, 38, '#fff', { weight: 800, alpha: ev(2.1, 0.4) });
};
// ---- 16: 3D type turning in, serif italic beside it, labels in coloured boxes
function yaw3D(str, x, y, size, k, o = {}) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(0.02, Math.cos((1 - k) * Math.PI / 2)), 1); fx3DText(str, 0, 0, size, o.face ?? '#fff', o.side ?? '#7a4a16', { align: 'center', depth: size * 0.1, face2: o.face2 ?? '#ffe9c4', alpha: clamp(k * 2) }); ctx.restore(); }
LAB['16A'] = () => {
  GC = { x: DVIEW[0], y: DVIEW[1] + 4, s: 34 * (1 + 0.02 * TT) }; gGround({ dim: 0.6 }); hlOutline({ fa: 0.15, glow: 18 });
  gText('vùng đất bên biển', CX, 520, 64, '#ffd08a', { align: 'center', italic: true, weight: 500, font: SERIF, alpha: ev(0.2, 0.5) });
  yaw3D('HẬU LỘC', CX, 680, 190, EZ.o3(ev(0.6, 0.9)));
  fxPill('THANH HÓA', CX - 190, 860, 40, '#15100a', G.orange, popS(1.6));
  fxPill('143,67 KM²', CX + 170, 860, 40, '#fff', G.teal, popS(1.9));
  gText('xứ Thanh', CX, 1000, 50, '#fff', { align: 'center', italic: true, weight: 500, font: SERIF, alpha: ev(2.4, 0.5) });
};
LAB['16B'] = () => {
  fxPaper();
  gText('dấu vết văn hóa Hoa Lộc', CX, 430, 58, '#5a3a1a', { align: 'center', italic: true, weight: 500, font: SERIF, shadow: false, alpha: ev(0.2, 0.5) });
  yaw3D('~4.000', CX, 610, 200, EZ.o3(ev(0.5, 0.9)), { face: '#2a1a0a', side: '#b5530c', face2: '#5a3a1a' });
  fxPill('NĂM', CX, 780, 54, '#fff', '#2a1a0a', popS(1.3));
  fxBatBong(CX, 1010, 0.9, EZ.o3(ev(1.6, 0.5)));
  fxPill('GỐM', CX - 220, 1230, 38, '#15100a', G.orange, popS(2.2)); fxPill('BÁT BỒNG', CX + 120, 1230, 38, '#fff', '#8a4b22', popS(2.5));
};
// ---- 17 B: a two-colour question revealed letter by letter with blur, over a blurred photo
LAB['17B'] = () => {
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, H);
  photoFS('fs_ngu_loc.jpg', { filter: 'blur(16px) brightness(0.4) saturate(0.8)' });
  fxBlurText('VÌ SAO', 80, 560, 70, '#fff', 0.3, { italic: true });
  fxBlurText('NGƯ LỘC', 80, 700, 130, G.orange, 0.7);
  fxBlurText('ĐÔNG DÂN', 80, 840, 110, '#fff', 1.5);
  fxBlurText('BẬC NHẤT CẢ NƯỚC?', 80, 940, 70, G.orange, 2.2);
};
// ---- 18 B: Vietnam's census line and area chart on paper, a dashed estimate after the last census
LAB['18B'] = () => {
  fxPaper();
  const D = [[1979, 52.7], [1989, 64.4], [1999, 76.3], [2009, 85.8], [2019, 96.2]], E = [2023, 100.3];
  const x0 = 120, x1 = 900, yB = 1150, yT = 650, X = (yr) => lerp(x0, x1, (yr - 1979) / (2023 - 1979)), Y = (v) => lerp(yB, yT, (v - 40) / 65);
  gText('DÂN SỐ VIỆT NAM', 80, 330, 64, '#2a1a0a', { weight: 900, shadow: false, alpha: ev(0, 0.4) });
  gText('qua các kỳ tổng điều tra (triệu người)', 82, 385, 34, '#5a4a38', { italic: true, weight: 600, font: SERIF, shadow: false, alpha: ev(0.2, 0.4) });
  ctx.save(); ctx.strokeStyle = 'rgba(60,40,20,0.2)'; ctx.lineWidth = 2; for (let v = 50; v <= 100; v += 25) { ctx.beginPath(); ctx.moveTo(x0, Y(v)); ctx.lineTo(x1, Y(v)); ctx.stroke(); } ctx.restore();
  const u = EZ.io(seg(TT, 0.5, 3.2)), n = (D.length - 1) * u, i0 = Math.floor(n), f = n - i0;
  const P = D.slice(0, i0 + 1).map(([yr, v]) => [X(yr), Y(v)]); if (i0 < D.length - 1) P.push([lerp(X(D[i0][0]), X(D[i0 + 1][0]), f), lerp(Y(D[i0][1]), Y(D[i0 + 1][1]), f)]);
  if (P.length > 1) {
    ctx.save(); const g = ctx.createLinearGradient(0, yT, 0, yB); g.addColorStop(0, 'rgba(243,154,43,0.45)'); g.addColorStop(1, 'rgba(243,154,43,0.05)'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(P[0][0], yB); P.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(P[P.length - 1][0], yB); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#d9731a'; ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.beginPath(); P.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
  }
  D.forEach(([yr, v], j) => { const k = ev(0.5 + 2.7 * j / (D.length - 1), 0.3); if (k <= 0) return; ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#2a1a0a'; ctx.beginPath(); ctx.arc(X(yr), Y(v), 11, 0, TAU); ctx.fill(); ctx.restore();
    gText(String(v).replace('.', ','), X(yr), Y(v) - 26, 32, '#2a1a0a', { align: 'center', weight: 900, shadow: false, alpha: k }); gText(String(yr), X(yr), yB + 46, 28, '#5a4a38', { align: 'center', weight: 800, shadow: false, alpha: k }); });
  const ke = seg(TT, 3.4, 4.2); if (ke > 0) { const [xa, ya] = [X(2019), Y(96.2)], [xb, yb] = [X(E[0]), Y(E[1])];
    ctx.save(); ctx.strokeStyle = '#d9731a'; ctx.lineWidth = 6; ctx.setLineDash([14, 12]); ctx.beginPath(); ctx.moveTo(xa, ya); ctx.lineTo(lerp(xa, xb, ke), lerp(ya, yb, ke)); ctx.stroke(); ctx.restore();
    if (ke >= 1) { gText('~100', xb, yb - 26, 32, '#b5530c', { align: 'right', weight: 900, shadow: false }); fxPill('ƯỚC TÍNH 2023', xb, yb + 130, 26, '#fff', '#b5530c', popS(4.2), { align: 'right' }); } }
};
// ---- 19 B: a pie standing on the Vietnam map at Thanh Hóa: its share of the population (2019)
LAB['19B'] = () => {
  GC = { x: -30, y: 60, s: 1.5 * (1 + 0.02 * TT) }; gGround({ dim: 0.45 });
  gRegion(GEO.vn, { line: '#fff', lw: 2, la: 0.7 }); gRegion(TH_PROV.r, { fill: G.orange, fa: 0.6, line: G.orange, lw: 3, glow: 14 });
  const [tx, ty] = gSP(TH_PROV.c); gPulse(tx, ty, 0.2, G.orange, 14);
  gTitle([{ text: 'DÂN SỐ 2019', italic: true, color: G.orange, size: 46 }, { text: 'THANH HÓA', size: 96 }], 70, 330, 0.1, { cps: 34 });
  const k = ev(0.8, 0.4); if (k > 0) { ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.globalAlpha = k; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(CX, 880); ctx.stroke(); ctx.restore(); }
  fxPie3D(CX, 1060, 250, [{ v: 3.64, c: G.orange, label: 'THANH HÓA', sub: '3,8%', fg: '#15100a', at: 1.0 }, { v: 92.56, c: '#3d5260', label: 'CẢ NƯỚC CÒN LẠI', sub: '96,2%', fg: '#fff', at: 1.6 }], { sy: 0.55, depth: 36 });
  gText('3,64 / 96,2 TRIỆU NGƯỜI', CX, 1330, 34, '#fff', { align: 'center', weight: 900, alpha: ev(2.4, 0.4) });
};
// ---- 20: tables built row by row, the key row lit
LAB['20A'] = () => {
  fxPaper(); gText('5 XÃ MỚI', 80, 360, 96, '#2a1a0a', { weight: 900, shadow: false, alpha: ev(0, 0.4) }); gText('từ 1/7/2025', 84, 420, 40, '#5a4a38', { italic: true, font: SERIF, weight: 600, shadow: false, alpha: ev(0.2, 0.4) });
  fxTable(80, 520, 840, [{ h: 'XÃ MỚI', w: 0.62 }, { h: 'ĐƠN VỊ CŨ GỘP LẠI', w: 0.38 }], NEW5.map((n) => ({ c: [n.n.toUpperCase(), n.units], color: n.c === G.lime ? '#5a7a10' : n.c, hl: n.n === 'Hoa Lộc' })), 0.5, { rh: 96, stagger: 0.4 });
};
LAB['20B'] = () => {
  fxPaper(PAPER, true); fx3DText('HẬU LỘC', 80, 330, 80, '#fff', '#7a4a16', { align: 'left', depth: 7, alpha: EZ.o3(ev(0, 0.4)) });
  gText('qua các con số', 84, 410, 40, '#ffd08a', { italic: true, font: SERIF, weight: 500, alpha: ev(0.2, 0.4) });
  fxTable(80, 500, 840, [{ h: 'CHỈ SỐ', w: 0.55 }, { h: 'GIÁ TRỊ', w: 0.45 }], [
    { c: ['Diện tích', '143,67 km²'] }, { c: ['Dân số 2009', '165.742'] }, { c: ['Dân số 2019', '176.418'], hl: true }, { c: ['Mật độ', '1.228 /km²'] }], 0.5, { rh: 100, stagger: 0.45, dark: true });
};
// ---- 21 B: big pictograms stacked row by row, one figure = 10.000 people
LAB['21B'] = () => {
  fxPaper(PAPER, true);
  const u = seg(TT, 0.4, 3.2), v = Math.round(lerp(0, 176418, EZ.o3(u)));
  fx3DText(v.toLocaleString('de-DE'), CX, 330, 130, '#fff', '#7a4a16', { depth: 11, face2: '#ffe9c4', alpha: ev(0.2, 0.3) });
  gText('NGƯỜI · 2019', CX, 450, 44, G.orange, { align: 'center', weight: 900, alpha: ev(0.3, 0.3) });
  for (let i = 0; i < 18; i++) { const r = 2 - Math.floor(i / 6), c = i % 6, at = 0.4 + i * 0.15, k = EZ.back(ev(at, 0.3)); if (k <= 0) continue;
    const x = 175 + c * 125, y = 1180 - r * 190; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); iconPerson(0, 0, 4.0, i === 17 ? G.orange : '#d8dee3'); ctx.restore(); }
  gText('1 HÌNH = 10.000 NGƯỜI', CX, 1330, 34, 'rgba(255,255,255,0.8)', { align: 'center', weight: 800, alpha: ev(1.0, 0.4) });
};
// ---- 22 B: two thermometers and a comparison arrow: density of Hậu Lộc vs the Vietnam average (2019)
LAB['22B'] = () => {
  GC = { x: DVIEW[0], y: DVIEW[1] + 5, s: 30 }; gGround({ dim: 0.7 });
  gTitle([{ text: 'MẬT ĐỘ DÂN SỐ 2019', italic: true, color: G.orange, size: 46 }, { text: 'NGƯỜI / KM²', size: 60 }], 70, 330, 0.1, { cps: 40 });
  fxThermo(330, 620, 1150, 1228, 1300, G.orange, 'HẬU LỘC', '1.228', seg(TT, 0.6, 1.8));
  fxThermo(700, 620, 1150, 290, 1300, '#9fd8ff', 'CẢ NƯỚC', '290', seg(TT, 1.2, 2.2));
  const k = ev(2.6, 0.6); if (k > 0) { const y0 = 1150 - 530 * 290 / 1300 - 20, y1 = 1150 - 530 * 1228 / 1300 + 10;
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.globalAlpha = k; ctx.beginPath(); ctx.moveTo(640, y0); ctx.quadraticCurveTo(520, lerp(y0, y1, 0.6), lerp(640, 400, k), lerp(y0, y1, k)); ctx.stroke();
    if (k >= 1) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(392, y1); ctx.lineTo(420, y1 - 24); ctx.lineTo(430, y1 + 12); ctx.closePath(); ctx.fill(); } ctx.restore();
    fxPill('GẤP ~4 LẦN', 560, (y0 + y1) / 2 - 40, 38, '#15100a', G.yellow, popS(3.1)); }
};
// ---- 23a B: three nested areas as concentric rings: Hậu Lộc inside Thanh Hóa inside Vietnam
LAB['23aB'] = () => {
  fxPaper(PAPER, true); const cx = CX, cy = 900;
  const L = [[440, '#3d5260', 'VIỆT NAM', '~331.000 km²', 0.3], [250, G.teal, 'THANH HÓA', '~11.100 km²', 0.9], [90, G.orange, 'HẬU LỘC', '143,67 km²', 1.5]];
  L.forEach(([r, c, n, a, at]) => { const k = EZ.o3(ev(at, 0.6)); if (k <= 0) return; ctx.save(); ctx.fillStyle = c; ctx.globalAlpha = 0.9; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(cx, cy, r * k, 0, TAU); ctx.fill(); ctx.restore();
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.globalAlpha = k; ctx.beginPath(); ctx.arc(cx, cy, r * k, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke(); ctx.restore(); });
  L.forEach(([r, c, n, a, at]) => { const k = ev(at + 0.4, 0.3); const y = r > 100 ? cy - r + 70 : cy + 10; gText(n, cx, y, r > 100 ? 40 : 30, '#fff', { align: 'center', weight: 900, alpha: k }); gText(a, cx, y + (r > 100 ? 44 : 36), r > 100 ? 32 : 24, r > 100 ? '#ffd08a' : '#15100a', { align: 'center', weight: 800, alpha: k, shadow: r > 100 }); });
  gText('LỒNG TRONG NHAU', 80, 330, 64, '#fff', { weight: 900, alpha: ev(0, 0.4) });
};
// ---- 23b B: a staircase timeline on light paper with dark boxes
LAB['23bB'] = () => {
  fxPaper();
  fxPill('DI SẢN & MỐC MỚI', 80, 300, 34, '#fff', '#2a1a0a', EZ.o3(ev(0, 0.3)), { align: 'left' });
  const items = [['2010', 'Mắm tôm Hậu Lộc', 'chỉ dẫn địa lý'], ['2014', 'Đền Bà Triệu', 'di tích QG đặc biệt'], ['2017', 'Lễ hội Cầu Ngư', 'di sản phi vật thể'], ['2025', 'Huyện thành', '5 xã mới']];
  const bw = 260, bh = 100;
  items.forEach(([yr, c1, c2], i) => { const x = 80 + i * 150, y = 430 + i * 220, at = 0.3 + i * 0.75, k = EZ.o3(ev(at, 0.35)); if (k <= 0) return;
    if (i > 0) { const px = 80 + (i - 1) * 150, py = 430 + (i - 1) * 220, ka = ev(at - 0.3, 0.3); if (ka > 0) { const P = [[px + 40, py + bh + 8], [px + 40, y + bh / 2], [x - 16, y + bh / 2]], Lp = polyLen(P);
      ctx.save(); ctx.strokeStyle = '#b5530c'; ctx.lineWidth = 9; ctx.setLineDash([Lp * ka, Lp + 10]); ctx.beginPath(); P.forEach(([a, b], j) => (j ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.stroke(); ctx.restore();
      if (ka >= 1) { ctx.save(); ctx.fillStyle = '#b5530c'; ctx.beginPath(); ctx.moveTo(x, y + bh / 2); ctx.lineTo(x - 28, y + bh / 2 - 18); ctx.lineTo(x - 28, y + bh / 2 + 18); ctx.closePath(); ctx.fill(); ctx.restore(); } } }
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#2a1a0a'; ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 12); ctx.fill(); ctx.restore();
    gText(yr, x + bw / 2, y + 70, 60, '#fff', { align: 'center', weight: 900, shadow: false, alpha: k });
    gText(c1, x + bw + 26, y + 42, 32, '#2a1a0a', { weight: 900, shadow: false, alpha: k }); gText(c2, x + bw + 26, y + 82, 30, '#b5530c', { weight: 800, shadow: false, alpha: k }); });
};
// ---- 23c: an inset map in a frame; a flow diagram with elbow arrows
LAB['23cA'] = () => {
  camK([[0, DVIEW[0], DVIEW[1], DVIEW[2], 0]]); GC.s *= 1 + 0.02 * TT; gGround({ dim: 0.35 }); hlOutline({ fill: true, fa: 0.3, glow: 20, frac: ev(0.1, 1.0), len: gRingLen(GEO.hl) + 20 });
  const k = EZ.back(ev(1.0, 0.5)); fxInset(560, 260, 340, 520, k, { label: 'VIỆT NAM' });
  if (k > 0.9) { const [hx, hy] = gSP(HLC); ctx.save(); ctx.strokeStyle = G.orange; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.globalAlpha = ev(1.6, 0.4); ctx.beginPath(); ctx.moveTo(700, 500); ctx.lineTo(hx, hy); ctx.stroke(); ctx.restore(); }
  gTitle([{ text: 'TỈNH THANH HÓA', italic: true, color: G.orange, size: 42 }, { text: 'HẬU LỘC', size: 96 }], 70, 330, 0.3, { cps: 30 });
};
LAB['23cB'] = () => {
  fxPaper(); gText('TỪ BIỂN ĐẾN BÀN ĂN', 80, 330, 60, '#2a1a0a', { weight: 900, shadow: false, alpha: ev(0, 0.4) });
  const B = [[80, 520, 'CON MOI BIỂN', '#1f7f86', 0.3], [560, 520, 'TRỘN MUỐI', '#8a4b22', 1.1], [80, 900, 'Ủ & PHƠI NẮNG', '#b5530c', 1.9], [560, 900, 'MẮM TÔM', '#c73a3a', 2.7]];
  B.forEach(([x, y, l, c, at], i) => { const k = EZ.back(ev(at, 0.35)); if (k <= 0) return; ctx.save(); ctx.translate(x + 170, y + 70); ctx.scale(k, k); ctx.translate(-x - 170, -y - 70);
    ctx.fillStyle = c; ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 18; ctx.beginPath(); ctx.roundRect(x, y, 340, 140, 18); ctx.fill(); ctx.restore();
    gText(l, x + 170, y + 84, 36, '#fff', { align: 'center', weight: 900, shadow: false, alpha: clamp(k) });
    if (i > 0) { const [px, py] = B[i - 1]; const ka = ev(at - 0.4, 0.4); if (i === 2) fxElbow(px + 170, py + 140, x + 170 + 0.01, y, '#2a1a0a', ka); else fxElbow(px + 340, py + 70, x, y + 70, '#2a1a0a', ka); } });
  framePhoto('fs_mam_tom_ai.jpg', 590, 1100, 280, 190, EZ.back(ev(3.2, 0.4)), null);
};
// ---- 25: an article shown on a phone in the hand of the frame
function phone(name, cx, cy, k, scroll, o = {}) {
  const img = asset(name); if (!img || k <= 0) return; const pw = 520, ph = 1040;
  ctx.save(); ctx.translate(cx, cy + (1 - k) * 900); ctx.rotate(o.rot ?? -0.05);
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20; ctx.fillStyle = '#0b0b0d'; ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 70); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 4; ctx.stroke();
  const sx = -pw / 2 + 18, sy = -ph / 2 + 18, sw = pw - 36, sh = ph - 36; ctx.save(); ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, 54); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(sx, sy, sw, sh);
  const sc = sw / img.naturalWidth, oy = sy + 90 - scroll * (img.naturalHeight * sc - sh + 90);
  ctx.drawImage(img, sx, oy, sw, img.naturalHeight * sc);
  if (o.hl) { const D = o.hl, hk = o.hk ?? 0; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#ffd84a'; let acc = 0; const tot = D.reduce((a, r) => a + r[2], 0);
    for (const [x, y, w, h] of D) { const take = clamp((hk * tot - acc) / w); acc += w; if (take <= 0) break; ctx.fillRect(sx + x * sc * (img.naturalWidth / o.iw) - 3, oy + y * sc * (img.naturalWidth / o.iw) - 3, w * sc * (img.naturalWidth / o.iw) * take + 6, h * sc * (img.naturalWidth / o.iw) + 6); } ctx.globalCompositeOperation = 'source-over'; }
  ctx.fillStyle = '#f2f2f2'; ctx.fillRect(sx, sy, sw, 80); ctx.fillStyle = '#111'; ctx.font = `700 22px ${GFONT}`; ctx.fillText('9:41', sx + 50, sy + 52);
  ctx.restore(); ctx.fillStyle = '#0b0b0d'; ctx.beginPath(); ctx.roundRect(-80, -ph / 2 + 30, 160, 40, 20); ctx.fill();
  ctx.restore();
}
LAB['25A'] = () => {
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, H); photoFS('fs_cau_ngu_ai.jpg', { filter: 'blur(18px) brightness(0.4)' });
  const D = DOCS.caungu, sc = seg(TT, 1.2, 2.6);
  phone(D.img, CX, 850, EZ.o3(ev(0.1, 0.8)), EZ.io(sc) * ((D.rects[0][1] - 300) / D.h), { hl: D.rects, hk: seg(TT, 2.8, 4.0), iw: D.w });
  gText('LỄ HỘI CẦU NGƯ', CX, 300, 50, '#fff', { align: 'center', weight: 900, alpha: ev(0.6, 0.4) });
};
LAB['25B'] = () => {
  fxPaper(PAPER, true);
  const D = DOCS.mamtom, sc = seg(TT, 1.2, 2.6);
  phone(D.img, CX + 30, 870, EZ.o3(ev(0.1, 0.8)), EZ.io(sc) * ((D.rects[0][1] - 300) / D.h), { hl: D.rects, hk: seg(TT, 2.8, 4.0), iw: D.w, rot: 0.06 });
  gText('MẮM TÔM HẬU LỘC', CX, 300, 50, G.orange, { align: 'center', weight: 900, alpha: ev(0.6, 0.4) });
};
// ---- 27: paper textures as the ground for graphics: light (A) and dark (B)
LAB['27A'] = () => {
  fxPaper();
  fx3DText('HẬU LỘC', CX, 340, 120, '#2a1a0a', '#b5530c', { depth: 9, face2: '#5a3a1a', alpha: EZ.o3(ev(0, 0.4)) });
  gText('trên một trang giấy', CX, 440, 46, '#5a4a38', { align: 'center', italic: true, font: SERIF, weight: 500, shadow: false, alpha: ev(0.3, 0.4) });
  const T = [[230, 700, () => iconTemple('#2a1a0a'), 'ĐỀN BÀ TRIỆU', 0.6], [CX, 700, () => iconPot('#2a1a0a'), 'MẮM TÔM', 0.9], [700, 700, null, 'NGƯ LỘC', 1.2]];
  T.forEach(([x, y, ic, l, at]) => { const k = EZ.back(ev(at, 0.4)); if (k <= 0) return; ctx.save(); ctx.fillStyle = '#e1d6c2'; ctx.shadowColor = 'rgba(60,40,20,0.3)'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(x, y, 110 * k, 0, TAU); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(x, y); ctx.scale(1.6 * k, 1.6 * k); if (ic) ic(); else { iconPerson(-16, 14, 1.4, '#2a1a0a'); iconPerson(16, 14, 1.4, '#b5530c'); } ctx.restore(); gText(l, x, y + 170, 32, '#2a1a0a', { align: 'center', weight: 900, shadow: false, alpha: clamp(k) }); });
  fxPeople(150, 1150, 14, 14, 1.2, '#5a4a38', seg(TT, 1.6, 3.2), { hiFrom: 13, hi: G.orange });
};
LAB['27B'] = () => { sceneChapter(3, 'VĂN HÓA', 0.2); gText('nền giấy tối có vân', CX - 70, 1080, 44, '#ffd08a', { align: 'center', italic: true, font: SERIF, weight: 500, alpha: ev(1.0, 0.5) }); };
Object.assign(LAB_SFX, {
  '13B': [['hit', 0], ['ping', 0.3]], '14A': [['whoosh', 0.6], ['hit', 1.4]], '14B': [['whoosh', 0.6], ['hit', 1.4]], '16A': [['air', 0.6], ['hit', 1.6]], '16B': [['air', 0.5], ['hit', 1.3]],
  '17B': [['air', 0.3], ['hit', 0.7]], '18B': [['air', 0.5], ['ping', 3.4]], '19B': [['ping', 1.0], ['ping', 1.6]], '20A': [['ping', 0.5]], '20B': [['ping', 0.5]], '21B': [['air', 0.4]], '22B': [['air', 0.6], ['hit', 3.1]],
  '23aB': [['ping', 0.3], ['ping', 0.9], ['ping', 1.5]], '23bB': [['hit', 0.3]], '23cA': [['ping', 1.0]], '23cB': [['ping', 0.3], ['ping', 1.9]], '25A': [['whoosh', 0.1], ['marker', 2.8]], '25B': [['whoosh', 0.1], ['marker', 2.8]],
  '27A': [['ping', 0.6]], '27B': [['hit', 0.2]], '15B': [], '17A': [['air', 0.4]], '24B': [['marker', 1.0]], '26B': [['whoosh', 1.0], ['whoosh', 3.5]],
});

// =====================================================================
//  v2 redo (user notes): follow the references closely, as little type as possible, small type that never covers the effect
// =====================================================================
// polyline helpers in screen space
function plLens(P) { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + dist(P[i - 1], P[i])); return L; }
function plSub(P, L, a, b) { const out = []; for (let i = 0; i < P.length - 1; i++) { const l0 = L[i], l1 = L[i + 1]; if (l1 < a || l0 > b) continue;
  const p = (l) => { const k = (l - l0) / Math.max(1e-6, l1 - l0); return [lerp(P[i][0], P[i + 1][0], k), lerp(P[i][1], P[i + 1][1], k)]; };
  if (!out.length) out.push(p(Math.max(a, l0))); out.push(p(Math.min(b, l1))); } return out; }
function plAt(P, L, l) { for (let i = 0; i < P.length - 1; i++) if (L[i + 1] >= l) { const k = (l - L[i]) / Math.max(1e-6, L[i + 1] - L[i]); return [lerp(P[i][0], P[i + 1][0], k), lerp(P[i][1], P[i + 1][1], k)]; } return P[P.length - 1]; }
function strokePl(P, color, lw, glow, alpha = 1) { if (P.length < 2) return; ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
  ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore(); }
// a route that draws on, a white light running along it once drawn, small pins popping as the head passes
function route(world, color, t0, t1, o = {}) {
  const P = world.map(gSP), L = plLens(P), T = L[L.length - 1], f = EZ.io(seg(TT, t0, t1)); if (f <= 0) return null;
  const vis = plSub(P, L, 0, T * f);
  if (o.thick) strokePl(vis, color, o.lw * 2.6, 0, 0.18);
  strokePl(vis, color, o.lw ?? 5, o.glow ?? 10);
  if (f >= 1 && o.streak !== false) { const u = mod((TT - t1) / (o.sp ?? 1.6), 1), a = T * u, b = Math.min(T, a + T * 0.16); strokePl(plSub(P, L, a, b), '#ffffff', (o.lw ?? 5) * 1.1, 18, 0.95 * Math.sin(Math.PI * u)); }
  else if (f < 1) { const [hx, hy] = plAt(P, L, T * f); ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = color; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(hx, hy, (o.lw ?? 5) * 1.2, 0, TAU); ctx.fill(); ctx.restore(); }
  (o.pins ?? []).forEach((pf) => { if (f < pf) return; const [x, y] = plAt(P, L, T * pf); gPin(x, y, { r: 13, pop: popS(t0 + (t1 - t0) * pf), color: '#fff', dot: color }); });
  return { P, L, T, f };
}
function tinyLegend(items, x, y, k) { if (k <= 0) return; ctx.save(); ctx.globalAlpha = k * 0.88; ctx.fillStyle = 'rgba(8,12,16,0.75)'; ctx.beginPath(); ctx.roundRect(x, y, 300, 18 + items.length * 34, 8); ctx.fill(); ctx.restore();
  items.forEach(([c, l], i) => { const yy = y + 28 + i * 34; ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 22, yy - 7, 8, 0, TAU); ctx.fill(); ctx.restore(); gText(l, x + 40, yy, 20, '#fff', { weight: 800, alpha: k, shadow: false }); }); }
const PATH = (k) => joinLines(ROADS[k]);
// ---- 07 A (v9): bright map, thin lines drawing on, white light running, pins along the routes, a tiny legend
LAB['07A'] = () => {
  camK([[0, -2, -3, 22, 0], [0.2, -2.5, -3.5, 30, 4.6]]);
  gGround({ dim: 0.12 }); hlOutline({ fa: 0.06, lw: 3, glow: 8 });
  route(PATH('ql1'), '#ff3b3b', 0.3, 1.8, { lw: 5, pins: [0.25, 0.7] });
  route(PATH('ql10'), '#ffd400', 1.1, 2.6, { lw: 5, pins: [0.3, 0.75] });
  route(PATH('rail'), '#ffffff', 1.9, 3.3, { lw: 4, glow: 6, pins: [0.5], sp: 1.3 });
  const tag = (k, txt, c, fg, at) => { const P = PATH(k), [x, y] = gSP(P[Math.floor(P.length * 0.45)]); gFlag(x, y, txt, { bg: c, fg, size: 22, pop: popS(at), up: 34 }); };
  tag('ql1', 'QL1A', '#ff3b3b', '#fff', 1.6); tag('ql10', 'QL10', '#ffd400', '#15100a', 2.4);
  tinyLegend([['#ff3b3b', 'Quốc lộ 1A'], ['#ffd400', 'Quốc lộ 10'], ['#ffffff', 'Đường sắt Bắc Nam']], 600, 1210, ev(2.8, 0.4));
};
// ---- 07 B (v8): fluorescent thick lines on a darker map, the camera rides the head of the line, then pulls back
LAB['07B'] = () => {
  const yel = PATH('rail'), u = EZ.io(seg(TT, 0.3, 3.0)), pull = EZ.io(seg(TT, 3.0, 4.2));
  const Lw = []; let acc = 0; yel.forEach((p, i) => { if (i) acc += dist(yel[i - 1], p); Lw.push(acc); });
  const head = plAt(yel, Lw, acc * u);
  GC = { x: lerp(head[0], -7, pull), y: lerp(head[1], 0, pull), s: lerp(70, 26, pull) };
  gGround({ dim: 0.45 }); hlOutline({ fa: 0.05, lw: 3, glow: 8 });
  route(PATH('ct'), '#ff2bd6', 0.6, 3.2, { lw: 8, glow: 26, thick: true, sp: 1.4 });
  route(yel, '#d8ff2b', 0.3, 3.0, { lw: 8, glow: 26, thick: true, sp: 1.4 });
  const [cx, cy] = gSP(TPTH), [hx, hy] = gSP(COMM('Hậu Lộc').c);
  gPin(cx, cy, { pop: popS(3.4) }); gFlag(cx, cy - 46, 'TP. THANH HÓA', { bg: '#fff', size: 22, pop: popS(3.5), up: 16 });
  gPin(hx, hy, { pop: popS(3.7), color: G.orange }); gFlag(hx, hy - 46, 'HẬU LỘC', { size: 22, pop: popS(3.8), up: 16 });
  tinyLegend([['#ff2bd6', 'Cao tốc Bắc Nam'], ['#d8ff2b', 'Đường sắt Bắc Nam']], 600, 1240, ev(3.6, 0.4));
};
// ---- 16 A (v1, v8): a 3D word flies in from deep space, turning, and lands standing on the map; one small serif line
LAB['16A'] = () => {
  GC = { x: DVIEW[0], y: DVIEW[1] - 1, s: 30 * (1 + 0.025 * TT) }; gGround({ dim: 0.3 }); hlOutline({ fill: true, fa: 0.22, glow: 18 });
  const k = EZ.o3(ev(0.3, 1.6)), [hx, hy] = gSP(HLC), z = lerp(0.08, 1, k), yaw = (1 - k) * 1.3, x = lerp(W * 0.8, hx, k), y = lerp(300, hy - 150, k);
  if (k > 0) { ctx.save(); ctx.globalAlpha = 0.45 * k; ctx.fillStyle = '#000'; ctx.filter = 'blur(14px)'; ctx.beginPath(); ctx.ellipse(hx, hy - 60, 330 * z, 30 * z, 0, 0, TAU); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(x, y); ctx.scale(z * Math.cos(yaw), z); ctx.transform(1, 0, -0.16 + 0.3 * Math.sin(yaw), 0.88, 0, 0);
    fx3DText('HẬU LỘC', 0, 0, 130, '#ffffff', '#7a4a16', { face2: '#ffe2b0', depth: 16, dx: 0.5 + yaw, dy: 1, alpha: clamp(k * 3) }); ctx.restore(); }
  gText('vùng đất bên biển', hx, hy - 30, 36, '#ffd08a', { align: 'center', italic: true, weight: 500, font: SERIF, alpha: ev(2.2, 0.5) });
  fxPill('THANH HÓA', hx, hy + 70, 24, '#15100a', G.orange, popS(2.6));
};
// ---- 18 A (v7): a thin chart on the map: white grid, an orange line drawing on, the last value in red, a dashed estimate
LAB['18A'] = () => {
  GC = { x: 20, y: 420, s: 0.95 * (1 + 0.02 * TT) }; gGround({ dim: 0.25 });
  gRegion(GEO.vn, { fill: G.orange, fa: 0.18, line: G.orange, lw: 2.5 });
  const g = ctx.createLinearGradient(0, 700, 0, H); g.addColorStop(0, 'rgba(4,10,16,0)'); g.addColorStop(0.25, 'rgba(4,10,16,0.75)'); g.addColorStop(1, 'rgba(4,10,16,0.85)'); ctx.fillStyle = g; ctx.fillRect(0, 700, W, H - 700);
  const D = [[1979, 52.7], [1989, 64.4], [1999, 76.3], [2009, 85.8], [2019, 96.2]], E = [2023, 100.3];
  const x0 = 150, x1 = 880, yB = 1270, yT = 900, X = (yr) => lerp(x0, x1, (yr - 1979) / 44), Y = (v) => lerp(yB, yT, (v - 40) / 70);
  const kg = ev(0.3, 0.6);
  ctx.save(); ctx.globalAlpha = kg; ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 1.5;
  for (let v = 40; v <= 110; v += 10) { ctx.beginPath(); ctx.moveTo(x0, Y(v)); ctx.lineTo(x1, Y(v)); ctx.stroke(); }
  for (let yr = 1979; yr <= 2023; yr += 4.4) { ctx.beginPath(); ctx.moveTo(X(yr), yT); ctx.lineTo(X(yr), yB); ctx.stroke(); } ctx.restore();
  for (let v = 50; v <= 100; v += 25) gText(String(v), x0 - 14, Y(v) + 6, 18, 'rgba(255,255,255,0.7)', { align: 'right', weight: 700, alpha: kg, shadow: false });
  D.forEach(([yr]) => gText(String(yr), X(yr), yB + 30, 18, 'rgba(255,255,255,0.7)', { align: 'center', weight: 700, alpha: kg, shadow: false }));
  gText('DÂN SỐ VIỆT NAM · TRIỆU NGƯỜI', x0, yT - 40, 26, G.orange, { weight: 900, alpha: kg });
  const P = D.map(([yr, v]) => [X(yr), Y(v)]), L = plLens(P), f = EZ.io(seg(TT, 0.8, 3.2));
  strokePl(plSub(P, L, 0, L[L.length - 1] * f), G.orange, 4, 8);
  if (f > 0 && f < 1) { const [hx, hy] = plAt(P, L, L[L.length - 1] * f); ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = G.orange; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(hx, hy, 6, 0, TAU); ctx.fill(); ctx.restore(); }
  const ke = seg(TT, 3.3, 3.9); if (ke > 0) { const a = P[P.length - 1], b = [X(E[0]), Y(E[1])]; ctx.save(); ctx.strokeStyle = '#ff4d4d'; ctx.lineWidth = 3; ctx.setLineDash([8, 7]); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(lerp(a[0], b[0], ke), lerp(a[1], b[1], ke)); ctx.stroke(); ctx.restore(); }
  if (TT > 3.2) { const [ax, ay] = P[P.length - 1]; ctx.save(); ctx.fillStyle = '#ff4d4d'; ctx.beginPath(); ctx.arc(ax, ay, 7, 0, TAU); ctx.fill(); ctx.restore(); gText('96,2', ax - 8, ay - 18, 30, '#ff4d4d', { align: 'right', weight: 900, alpha: ev(3.2, 0.3) }); }
};
// ---- 18 B (v6): light paper, pale blue bars growing, the last one dark, a counter above, a line over the tops
LAB['18B_v6'] = () => {
  fxPaper('#e8e6e1');
  const D = [[1979, 52.7], [1989, 64.4], [1999, 76.3], [2009, 85.8], [2019, 96.2]];
  const x0 = 140, bw = 120, gap = 38, yB = 1220, sc = 6.2;
  gText('DÂN SỐ VIỆT NAM', 100, 360, 30, '#1b1b1b', { weight: 900, shadow: false, alpha: ev(0, 0.3) }); gText('triệu người, các kỳ tổng điều tra', 100, 396, 22, '#5a5a5a', { weight: 600, shadow: false, alpha: ev(0.1, 0.3) });
  const n = seg(TT, 0.4, 3.0) * D.length, cur = D[Math.min(D.length - 1, Math.max(0, Math.ceil(n) - 1))];
  const val = n <= 0 ? 0 : lerp(n >= 1 ? D[Math.min(D.length - 1, Math.floor(n) - 1)][1] : 0, D[Math.min(D.length - 1, Math.floor(n))][1], n % 1 || 1);
  gText(val.toFixed(1).replace('.', ','), 100, 520, 96, '#1b1b1b', { weight: 900, shadow: false, alpha: ev(0.3, 0.3) });
  fxPill(String(cur[0]), 100, 570, 22, '#15100a', '#f2b54a', ev(0.4, 0.3), { align: 'left' });
  const tops = [];
  D.forEach(([yr, v], i) => { const k = EZ.o3(clamp(n - i)); const h = v * sc * k, x = x0 + i * (bw + gap);
    ctx.save(); ctx.fillStyle = i === D.length - 1 ? '#1f6fb5' : '#9cc9ef'; ctx.fillRect(x, yB - h, bw, h); ctx.restore();
    gText(String(yr), x + bw / 2, yB + 36, 22, '#5a5a5a', { align: 'center', weight: 800, shadow: false, alpha: k }); if (k > 0) tops.push([x + bw / 2, yB - h]); });
  if (tops.length > 1) strokePl(tops, '#1f3f66', 3, 0, 0.8);
  ctx.save(); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 - 20, yB); ctx.lineTo(x0 + 5 * (bw + gap), yB); ctx.stroke(); ctx.restore();
};
// ---- 20 A (v7): grey paper, a white table with thick black lines and an orange header pops in and grows; the key row turns red
LAB['20A'] = () => {
  fxPaper('#9b9994');
  const k = EZ.o3(ev(0.2, 0.7)), z = lerp(0.35, 1, k) * (1 + 0.06 * seg(TT, 2.6, 4.0)), cw = lerp(0.62, 1, EZ.io(seg(TT, 0.9, 1.5)));
  const w = 760 * cw, rh = 84, n = NEW5.length, h = rh * (n + 1), cx = CX, cy = 820;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-w / 2, -h / 2); ctx.globalAlpha = clamp(k * 2);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(0, 0, w, h, 18); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, w, h, 18); ctx.clip();
  ctx.fillStyle = '#f2a541'; ctx.fillRect(0, 0, w * 0.62, rh); ctx.fillStyle = '#c0393b'; ctx.fillRect(w * 0.62, 0, w * 0.38, rh);
  const hr = NEW5.findIndex((m) => m.n === 'Hoa Lộc'), sw = EZ.io(seg(TT, 2.0, 2.6));
  if (sw > 0) { ctx.fillStyle = '#c0393b'; ctx.fillRect(0, rh * (hr + 1), w * sw, rh); }
  ctx.restore();
  ctx.lineWidth = 4; for (let i = 1; i <= n; i++) { ctx.beginPath(); ctx.moveTo(0, rh * i); ctx.lineTo(w, rh * i); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(w * 0.62, 0); ctx.lineTo(w * 0.62, h); ctx.stroke(); ctx.beginPath(); ctx.roundRect(0, 0, w, h, 18); ctx.stroke();
  ctx.font = `900 30px ${GFONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff'; ctx.fillText('XÃ MỚI', w * 0.31, rh / 2); if (cw > 0.9) { ctx.globalAlpha = clamp((cw - 0.9) * 10) * clamp(k * 2); ctx.fillText('ĐƠN VỊ CŨ', w * 0.81, rh / 2); ctx.globalAlpha = clamp(k * 2); }
  NEW5.forEach((m, i) => { const kr = ev(0.5 + i * 0.12, 0.25); ctx.globalAlpha = kr * clamp(k * 2); const on = i === hr && sw > 0.5;
    ctx.fillStyle = on ? '#fff' : '#111'; ctx.font = `900 30px ${GFONT}`; ctx.fillText(m.n.toUpperCase(), w * 0.31, rh * (i + 1.5));
    if (cw > 0.9) { ctx.globalAlpha = kr * clamp((cw - 0.9) * 10); ctx.fillStyle = on ? '#fff' : '#111'; ctx.fillText(String(m.units), w * 0.81, rh * (i + 1.5)); } });
  ctx.restore();
};
// ---- 21 A (v8): next to the region a tall capsule fills up, the number written vertically inside, a crowd icon under it
function crowd(x, y, s, c, k) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k); ctx.globalAlpha = clamp(k);
  [[-26, -8], [26, -8], [0, -14], [-40, 14], [40, 14], [-13, 10], [13, 10]].forEach(([dx, dy]) => { ctx.fillStyle = c; ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(dx, dy - 16, 11, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(dx, dy + 10, 17, 14, 0, Math.PI, 0); ctx.fill(); ctx.stroke(); }); ctx.restore(); }
LAB['21A'] = () => {
  GC = { x: DVIEW[0] + 3, y: DVIEW[1] + 1, s: 32 * (1 + 0.02 * TT) }; gGround({ dim: 0.3 });
  gRegion(GEO.hl, { fill: '#c98a3a', fa: 0.7 * ev(0.2, 0.6), line: '#ffd08a', lw: 4, glow: 10 });
  const x = 120, yT = 420, yB = 1060, cw = 92, k = EZ.o3(ev(0.4, 0.5)), f = EZ.io(seg(TT, 0.9, 2.6));
  if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.roundRect(x, yT, cw, yB - yT, cw / 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(x + 10, yT + 10, cw - 20, yB - yT - 20, (cw - 20) / 2); ctx.clip(); const hh = (yB - yT - 20) * f; ctx.fillStyle = G.orange; ctx.shadowColor = G.orange; ctx.shadowBlur = 20; ctx.fillRect(x + 10, yB - 10 - hh, cw - 20, hh); ctx.restore();
    const v = Math.round(176418 * f); ctx.save(); ctx.translate(x + cw / 2, (yT + yB) / 2); ctx.rotate(-Math.PI / 2); gText(v.toLocaleString('de-DE') + ' DÂN', 0, 14, 40, '#fff', { align: 'center', weight: 900, alpha: k }); ctx.restore();
    gText('2019', x + cw / 2, yT - 24, 30, '#fff', { align: 'center', weight: 900, alpha: k }); }
  crowd(x + cw / 2, yB + 80, 1.4, '#ffffff', EZ.back(ev(0.6, 0.4)));
};
// ---- 23a A (v6): a beige target on paper, an orange arc turning round it, two satellites that fill with photos
function roundPhoto(name, x, y, r, k, o = {}) { const img = asset(name); if (!img || k <= 0) return; ctx.save(); ctx.beginPath(); ctx.arc(x, y, r * k, 0, TAU); ctx.clip(); const sc = (2 * r * k) / Math.min(img.naturalWidth, img.naturalHeight) * 1.05;
  if (o.filter) ctx.filter = o.filter; ctx.drawImage(img, x - img.naturalWidth * sc / 2, y - img.naturalHeight * sc / 2, img.naturalWidth * sc, img.naturalHeight * sc); ctx.restore();
  ctx.save(); ctx.strokeStyle = o.ring ?? '#fff'; ctx.lineWidth = o.lw ?? 6; ctx.beginPath(); ctx.arc(x, y, r * k, 0, TAU); ctx.stroke(); ctx.restore(); }
LAB['23aA'] = () => {
  fxPaper('#e2ddd3'); const cx = CX, cy = 1000, R = 250;
  const k = fxTarget(cx, cy, R, seg(TT, 0.2, 1.4));
  if (k > 0) { ctx.save(); ctx.translate(cx, cy - 4); ctx.scale(2.2 * k, 2.2 * k); iconTemple('#fff'); ctx.restore(); }
  const ka = ev(1.3, 0.4); if (ka > 0) { const a0 = TT * 1.4; ctx.save(); ctx.strokeStyle = G.orange; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.globalAlpha = ka; ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, a0, a0 + 2.2); ctx.stroke(); ctx.restore(); }
  [[250, 560, 'den_ba_trieu.jpg', '2014', G.red, 1.6], [710, 560, 'fs_cau_ngu_ai.jpg', '2023', '#c98a00', 2.2]].forEach(([x, y, img, yr, c, at]) => {
    const kd = EZ.o3(ev(at, 0.4)); if (kd <= 0) return;
    ctx.save(); ctx.strokeStyle = 'rgba(90,80,65,0.75)'; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.globalAlpha = kd; ctx.beginPath(); ctx.moveTo(x, y + 100); ctx.lineTo(lerp(x, cx + (x - cx) * 0.3, kd), lerp(y + 100, cy - R * 0.92, kd)); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 100, 0, TAU); ctx.fillStyle = '#f4efe6'; ctx.fill(); ctx.stroke(); ctx.restore();
    roundPhoto(img, x, y, 92, EZ.back(ev(at + 0.4, 0.4)), { ring: '#fff', lw: 5 });
    fxPill(yr, x, y + 140, 26, '#fff', c, popS(at + 0.7)); });
};
// ---- 23a B (v2): dark ground, glowing dashed rings turning in opposite ways round the district's shape, round photos joining
LAB['23aB'] = () => {
  fxPaper('#1a1a1a', true); const cx = CX, cy = 900;
  const ring = (r, c, dash, sp, lw, at) => { const k = EZ.o3(ev(at, 0.6)); if (k <= 0) return; ctx.save(); ctx.translate(cx, cy); ctx.rotate(TT * sp); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.shadowColor = c; ctx.shadowBlur = 22; ctx.globalAlpha = k; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU * k); ctx.stroke(); ctx.restore(); };
  ring(150, '#ff3b3b', null, 0, 5, 0.2); ring(200, '#ff3b3b', [14, 10], 0.5, 4, 0.4); ring(260, '#ffb02e', [18, 12], -0.35, 5, 0.7);
  // the district's shape in the centre
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const r of GEO.hl) for (const p of r) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  const s = 230 / (x1 - x0), kc = EZ.back(ev(0.5, 0.5)); GC = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 - (GAY() - cy) / (s * Math.max(0.01, kc)), s: s * Math.max(0.01, kc) };
  if (kc > 0) gRegion(GEO.hl, { fill: G.orange, fa: 0.9, line: '#fff3d6', lw: 3, glow: 20 });
  const P = [['den_ba_trieu.jpg', -0.9], ['hon_ne.jpg', -0.1], ['g_harbour.jpg', 0.7], ['fs_mam_tom_ai.jpg', 1.5], ['g_street.jpg', 2.3]];
  P.forEach(([img, a], i) => { const at = 1.3 + i * 0.3, k = EZ.back(ev(at, 0.45)); if (k <= 0) return; const ang = a - Math.PI / 2 + TT * 0.08, rr = 380, x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr;
    ctx.save(); ctx.strokeStyle = 'rgba(255,59,59,0.8)'; ctx.lineWidth = 3; ctx.shadowColor = '#ff3b3b'; ctx.shadowBlur = 12; ctx.globalAlpha = clamp(k); ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * 262, cy + Math.sin(ang) * 262); ctx.lineTo(x - Math.cos(ang) * 70, y - Math.sin(ang) * 70); ctx.stroke(); ctx.restore();
    roundPhoto(img, x, y, 70, k, { ring: '#fff', lw: 5 }); });
  gText('HẬU LỘC', cx, cy + 320 + 0 * TT, 30, '#fff', { align: 'center', weight: 900, alpha: ev(1.0, 0.4) });
};
// ---- 23c B (v4): nodes joined by glowing lines on grey paper, a light running along the path, small shield nodes between
LAB['23cB'] = () => {
  fxPaper('#8e8c87');
  const N = [[240, 430, 'g_harbour.jpg', 'ĐÁNH BẮT'], [760, 760, 'g_dryfish.jpg', 'PHƠI'], [300, 1120, 'fs_mam_tom_ai.jpg', 'MẮM TÔM']];
  const path = [[240, 430], [240, 600], [760, 600], [760, 760], [760, 940], [300, 940], [300, 1120]], L = plLens(path), T = L[L.length - 1];
  const f = EZ.io(seg(TT, 0.6, 3.2));
  strokePl(plSub(path, L, 0, T * f), '#cfeaff', 5, 18);
  if (f >= 1) { const u = mod((TT - 3.2) / 1.2, 1); strokePl(plSub(path, L, T * u, Math.min(T, T * u + 120)), '#ffffff', 7, 24, Math.sin(Math.PI * u)); }
  else if (f > 0) { const [hx, hy] = plAt(path, L, T * f); ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = '#9fd8ff'; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(hx, hy, 9, 0, TAU); ctx.fill(); ctx.restore(); }
  [[500, 600, 0.3], [760, 860, 0.6], [530, 940, 0.82]].forEach(([x, y, pf]) => { if (f < pf) return; const k = EZ.back(clamp((f - pf) * 8)); ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.fillStyle = '#8e8c87'; ctx.strokeStyle = '#cfeaff'; ctx.lineWidth = 4; ctx.shadowColor = '#9fd8ff'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(20, -14); ctx.lineTo(18, 10); ctx.quadraticCurveTo(0, 26, -18, 10); ctx.lineTo(-20, -14); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); });
  N.forEach(([x, y, img, l], i) => { const at = [0.2, 1.7, 2.9][i], k = EZ.back(ev(at, 0.45)); roundPhoto(img, x, y, 120, k, { ring: '#ffffff', lw: 7 }); gText(l, x, y + 160, 26, '#fff', { align: 'center', weight: 900, alpha: ev(at + 0.3, 0.3) }); });
};
Object.assign(LAB_SFX, { '07A': [['ping', 0.6], ['air', 1.9]], '07B': [['air', 0.4], ['whoosh', 3.0]], '16A': [['whoosh', 0.5], ['hit', 1.9]], '18A': [['air', 0.8], ['ping', 3.2]], '18B': [['ping', 0.6], ['ping', 1.6], ['ping', 2.6]],
  '20A': [['whoosh', 0.4], ['hit', 2.0]], '21A': [['air', 0.9], ['ping', 2.6]], '23aA': [['ping', 0.3], ['ping', 1.6], ['ping', 2.2]], '23aB': [['air', 0.3], ['ping', 1.3]], '23cB': [['air', 0.6], ['ping', 1.7], ['ping', 2.9]] });
