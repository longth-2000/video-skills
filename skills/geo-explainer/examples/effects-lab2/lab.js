// =====================================================================
//  LAB 2 — two clips for each new effect N01–N16 (fx/fx-geo2.js). CLIP comes from src/clip.js.
//  Topics: Hậu Lộc / Thanh Hóa (map data of this lab), Việt Nam's largest provinces (2019 census), interest rates,
//  the documents already captured. Little text, small text.
// =====================================================================
const TEX = GEO.tex, S0 = (H * 0.85) / TEX[0].span, S1 = (W * 0.9) / TEX[1].span, S2 = (W * 0.9) / TEX[2].span;
const FOC = [TEX[2].cx, TEX[2].cy];
const nrm = (s) => String(s).normalize('NFC').toLowerCase().replace(/\s/g, '');
const COMM = (n) => GEO.comm.find((c) => nrm(c.n) === nrm(n));
const PROV = (n) => GEO.prov.find((p) => nrm(p.n) === nrm(n));
const DIST = (n) => GEO.dist.find((d) => nrm(d.n) === nrm(n));
const ll = (lon, lat) => [(lon - GEO.proj.lon0) * Math.cos(GEO.proj.lat0 * Math.PI / 180) * 111.32, -(lat - GEO.proj.lat0) * 111.32];
const kmBetween = (a, b) => Math.round(dist(a, b));
const TPTH = ll(105.776, 19.807), HONNE = ll(106.0089, 19.9128);
// the five communes of 1 July 2025 and their old units (NQ 1686/NQ-UBTVQH15)
const NEW5 = [
  { n: 'Triệu Lộc', c: G.red, units: ['Triệu Lộc', 'Đại Lộc', 'Tiến Lộc', 'Châu Lộc'] },
  { n: 'Đông Thành', c: G.violet, units: ['Đồng Lộc', 'Thành Lộc', 'Cầu Lộc', 'Tuy Lộc', 'Phong Lộc'] },
  { n: 'Hậu Lộc', c: G.orange, units: ['Hậu Lộc', 'Thuần Lộc', 'Mỹ Lộc', 'Lộc Sơn', 'Văn Lộc', 'Thịnh Lộc', 'Lộc Tân'] },
  { n: 'Hoa Lộc', c: G.lime, units: ['Xuân Lộc', 'Liên Lộc', 'Quang Lộc', 'Phú Lộc', 'Hòa Lộc', 'Hoa Lộc'] },
  { n: 'Vạn Lộc', c: G.teal, units: ['Minh Lộc', 'Hải Lộc', 'Hưng Lộc', 'Ngư Lộc', 'Đa Lộc'] },
].map((g) => { const cs = g.units.map(COMM).filter(Boolean); return { ...g, cs, c0: [cs.reduce((a, c) => a + c.c[0], 0) / cs.length, cs.reduce((a, c) => a + c.c[1], 0) / cs.length] }; });
const UNITS = { 'Triệu Lộc': 3, 'Đông Thành': 4, 'Hậu Lộc': 4, 'Hoa Lộc': 6, 'Vạn Lộc': 5 };   // old units merged (NQ 1686), as in the Hậu Lộc video
const POP19 = [['Hồ Chí Minh', 'TP.HCM', 8.99], ['Hà Nội', 'HÀ NỘI', 8.05], ['Thanh Hóa', 'THANH HÓA', 3.64], ['Nghệ An', 'NGHỆ AN', 3.33], ['Đồng Nai', 'ĐỒNG NAI', 3.10]];   // 2019 census, million
const DOCS_ = {
  caungu: { img: 'col_caungu.jpg', w: 1600, h: 2000, rects: [[950, 624, 585, 38], [0, 665, 1077, 38]] },
  mamtom: { img: 'col_mamtom.jpg', w: 1128, h: 2000, rects: [[0, 760, 1128, 34], [0, 811, 1128, 34], [0, 862, 152, 34]] },
  nq1686: { img: 'col_nq1686.jpg', w: 1608, h: 2000, rects: [[0, 760, 1576, 44], [0, 822, 966, 44]] },
  nd65: { img: 'col_nd65.jpg', w: 1216, h: 1948, rects: [[0, 650, 926, 44]] },
};
Object.assign(DOCS, DOCS_);
// ---- shared drawing
function hlMap(o = {}) { gGround({ dim: o.dim ?? 0.3 }); for (const c of GEO.comm) gRegion(c.r, { line: 'rgba(255,255,255,0.28)', lw: 1.2, la: o.comm ?? 1 }); gRegion(GEO.focus, { fill: G.orange, fa: o.fa ?? 0.15, line: G.orange, lw: 4, glow: 14 }); }
function thMap(o = {}) { gGround({ dim: o.dim ?? 0.3 }); for (const d of GEO.dist) gRegion(d.r, { line: 'rgba(255,255,255,0.35)', lw: 1.4 }); gRegion(GEO.focus, { fill: G.orange, fa: o.fa ?? 0.35, line: G.orange, lw: 3, glow: 12 }); }
function vnMap(o = {}) { gGround({ dim: o.dim ?? 0.32 }); for (const p of GEO.prov) gRegion(p.r, { line: 'rgba(255,255,255,0.18)', lw: 1 }); gRegion(GEO.country, { line: '#ffffff', lw: 2.5, la: 0.85 }); }
const camHL = (z = 1) => { GC = { x: FOC[0], y: FOC[1], s: S2 * z * (1 + 0.015 * TT) }; };
const camVN = () => { GC = { x: TEX[0].cx + 120 / S0, y: TEX[0].cy, s: S0 * (1 + 0.015 * TT) }; };
function docPage(D, cx, cy, ri, z, k = 1) {   // a static page with rect ri centred at (cx, cy); returns img px → screen
  const img = asset(D.img); if (!img) return null; const PW = 880, PH = 860, sc = (PW - 40) / D.w * z, r = D.rects[ri];
  const ox = clamp(cx - (r[0] + r[2] / 2) * sc, cx + PW / 2 - 20 - D.w * sc, cx - PW / 2 + 20), oy = cy - (r[1] + r[3] / 2) * sc;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 200); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.fillStyle = '#fff'; ctx.fillRect(cx - PW / 2, cy - PH / 2, PW, PH); ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.rect(cx - PW / 2 + 20, cy - PH / 2 + 20, PW - 40, PH - 40); ctx.clip(); ctx.drawImage(img, ox, oy, D.w * sc, D.h * sc); ctx.restore();
  return (x, y) => [ox + x * sc, oy + y * sc];
}
function darkGround() { ctx.fillStyle = '#16181b'; ctx.fillRect(0, 0, W, H); fxPaper('#16181b', true); }

const LAB = {};
// ---- N01 distance rings
LAB.N01A = () => { const c = [(TPTH[0] + FOC[0]) / 2, (TPTH[1] + FOC[1]) / 2]; GC = { x: c[0], y: c[1] - 4, s: 15 * (1 + 0.015 * TT) }; thMap({ fa: 0.3 });
  radiusRings(TPTH, [5, 10, 20, 25], 0.2); const [hx, hy] = gSP(FOC); gFlag(hx, hy, 'HẬU LỘC', { size: 28, pop: popS(2.4), up: 40 }); const [tx, ty] = gSP(TPTH); gFlag(tx, ty - 50, 'TP. THANH HÓA', { bg: '#fff', size: 24, pop: popS(0.4), up: 16 }); };
LAB.N01B = () => { const c = [(HONNE[0] + COMM('Ngư Lộc').c[0]) / 2, (HONNE[1] + COMM('Ngư Lộc').c[1]) / 2]; GC = { x: c[0], y: c[1], s: 55 * (1 + 0.015 * TT) }; hlMap();
  radiusRings(HONNE, [2, 4, 6], 0.2, { color: G.teal }); const [nx, ny] = gSP(HONNE); gFlag(nx, ny - 50, 'HÒN NẸ', { bg: '#fff', size: 24, pop: popS(0.4), up: 16 }); };
// ---- N02 3D columns on the map
LAB.N02A = () => { camHL(1.05); hlMap({ fa: 0.08 }); NEW5.forEach((g) => gRegion(g.cs.flatMap((c) => c.r), { fill: g.c, fa: 0.28, line: g.c, lw: 2 }));
  bars3D(NEW5.map((g) => ({ p: g.c0, v: UNITS[g.n] / 6, c: g.c, sub: String(UNITS[g.n]), label: g.n.toUpperCase() })), 0.4, { h: 360, w: 50 });
  gText('số đơn vị cũ gộp lại', 80, 330, 34, '#ffd08a', { italic: true, font: SERIF, weight: 500, alpha: ev(0.2, 0.4) }); };
const POP4 = [['Hà Nội', 'HÀ NỘI', 8.05], ['Thanh Hóa', 'THANH HÓA', 3.64], ['Đà Nẵng', 'ĐÀ NẴNG', 1.13], ['Hồ Chí Minh', 'TP.HCM', 8.99]];   // 2019 census
LAB.N02B = () => { camVN(); vnMap();
  bars3D(POP4.map(([n, l, v], i) => ({ p: PROV(n).c, v: v / 9, c: v > 5 ? G.orange : '#e8e2d6', sub: String(v).replace('.', ','), label: l })), 0.3, { h: 300, w: 38, subSize: 24 });
  gText('dân số 2019 · triệu người', 80, 1330, 34, '#ffd08a', { italic: true, font: SERIF, weight: 500, alpha: ev(0.2, 0.4) }); };
// ---- N03 glowing dots
const DOTS_HL = (() => { const out = []; for (const c of GEO.comm) { const n = c.n === 'Ngư Lộc' ? 70 : 9; pointsInRings(c.r, n, 'd' + c.n).forEach((p, i) => out.push({ p, r: c.n === 'Ngư Lộc' ? 4 : 5, at: (c.n === 'Ngư Lộc' ? 1.6 : 0.2) + i * 0.012 })); } return out; })();
LAB.N03A = () => { camHL(1.0); hlMap({ fa: 0.05, dim: 0.45 }); glowDots(DOTS_HL, 0); const [x, y] = gSP(COMM('Ngư Lộc').c); gFlag(x, y - 30, 'NGƯ LỘC', { bg: G.red, fg: '#fff', size: 26, pop: popS(2.6), up: 40 }); };
LAB.N03B = () => { camVN(); vnMap({ dim: 0.45 }); glowDots(POP19.map(([n, l, v], i) => ({ p: PROV(n).c, r: 14 * Math.sqrt(v), label: l, at: 0.3 + i * 0.35 })), 0); };
// ---- N04 flow arcs
LAB.N04A = () => { const hn = PROV('Hà Nội').c, hcm = PROV('Hồ Chí Minh').c; camVN(); vnMap(); gRegion(GEO.focus, { fill: G.orange, fa: 0.9, line: G.orange, lw: 3, glow: 12 });
  flowArc(FOC, hn, 0.3, { bend: -0.35 }); flowArc(FOC, hcm, 1.1, { bend: 0.25, color: G.teal, dur: 1.4 });
  const [ax, ay] = gSP(hn), [bx, by] = gSP(hcm); fxPill('~' + kmBetween(FOC, hn) + ' KM', ax + 90, ay - 20, 24, '#15100a', G.orange, popS(1.3)); fxPill('~' + kmBetween(FOC, hcm) + ' KM', bx + 110, by - 40, 24, '#15100a', G.teal, popS(2.5));
  gFlag(ax, ay, 'HÀ NỘI', { bg: '#fff', size: 22, pop: popS(1.2), up: 30 }); gFlag(bx, by, 'TP.HCM', { bg: '#fff', size: 22, pop: popS(2.4), up: 30 }); };
LAB.N04B = () => { const ng = COMM('Ngư Lộc').c, c = [(ng[0] + TPTH[0] + HONNE[0]) / 3, (ng[1] + TPTH[1] + HONNE[1]) / 3]; GC = { x: c[0] + 1, y: c[1] - 2, s: 26 * (1 + 0.015 * TT) }; hlMap();
  flowArc(ng, HONNE, 0.3, { bend: -0.4, color: G.teal }); flowArc(FOC, TPTH, 1.2, { bend: 0.3 });
  const [nx, ny] = gSP(HONNE), [tx, ty] = gSP(TPTH); fxPill('~' + kmBetween(ng, HONNE) + ' KM', nx - 40, ny - 70, 24, '#15100a', G.teal, popS(1.3)); fxPill('~' + kmBetween(FOC, TPTH) + ' KM', tx + 60, ty + 40, 24, '#15100a', G.orange, popS(2.4));
  gFlag(nx, ny, 'HÒN NẸ', { bg: '#fff', size: 22, pop: popS(1.2), up: 30 }); gFlag(tx, ty, 'TP. THANH HÓA', { bg: '#fff', size: 22, pop: popS(2.3), up: 30 }); };
// ---- N05 magnifier
LAB.N05A = () => { camHL(1.0); hlMap(); const ng = COMM('Ngư Lộc'); gRegion(ng.r, { fill: G.red, fa: 0.4, line: G.red, lw: 3 });
  magnifier(() => { gGround({ dim: 0.2 }); for (const c of GEO.comm) gRegion(c.r, { line: 'rgba(255,255,255,0.6)', lw: 2 }); gRegion(ng.r, { fill: G.red, fa: 0.2, line: G.red, lw: 6, glow: 16 }); }, ng.c, 260, 640, 520, 230, EZ.back(ev(0.6, 0.6)), { label: 'NGƯ LỘC', t0: 1.2 }); };
LAB.N05B = () => { GC = { x: TEX[1].cx, y: TEX[1].cy, s: S1 * 0.95 * (1 + 0.015 * TT) }; thMap({ fa: 0.5 });
  magnifier(() => { gGround({ dim: 0.2 }); for (const c of GEO.comm) gRegion(c.r, { line: 'rgba(255,255,255,0.5)', lw: 1.5 }); gRegion(GEO.focus, { fill: G.orange, fa: 0.2, line: G.orange, lw: 5, glow: 16 }); }, FOC, 22, 560, 470, 250, EZ.back(ev(0.6, 0.6)), { label: 'HẬU LỘC', t0: 1.2 }); };
// ---- N06 before / after slider
LAB.N06A = () => { camHL(1.05);
  beforeAfter(() => { gGround({ dim: 0.35 }); for (const c of GEO.comm) gRegion(c.r, { line: '#ffffff', lw: 2, la: 0.8 }); gRegion(GEO.focus, { line: G.orange, lw: 4, glow: 12 }); },
    () => { gGround({ dim: 0.35 }); NEW5.forEach((g) => gRegion(g.cs.flatMap((c) => c.r), { fill: g.c, fa: 0.55, line: '#fff', lw: 2 })); gRegion(GEO.focus, { line: G.orange, lw: 4, glow: 12 });
      NEW5.forEach((g) => { const [x, y] = gSP(g.c0); gText(g.n.toUpperCase(), x, y + 8, 22, '#fff', { align: 'center', weight: 900 }); }); },
    0.4, { left: 'SAU 1/7/2025 · 5 XÃ', right: 'TRƯỚC · 27 XÃ' }); };
LAB.N06B = () => { const v = NEW5.find((g) => g.n === 'Vạn Lộc'); GC = { x: v.c0[0], y: v.c0[1], s: 95 * (1 + 0.015 * TT) };
  beforeAfter(() => { gGround({ dim: 0.35 }); v.cs.forEach((c) => { gRegion(c.r, { line: '#ffffff', lw: 3 }); const [x, y] = gSP(c.c); gText(c.n.toUpperCase(), x, y + 8, 22, '#fff', { align: 'center', weight: 900 }); }); },
    () => { gGround({ dim: 0.35 }); gRegion(v.cs.flatMap((c) => c.r), { fill: G.teal, fa: 0.55, line: '#fff', lw: 3 }); const [x, y] = gSP(v.c0); gText('VẠN LỘC', x, y + 14, 46, '#fff', { align: 'center', weight: 900 }); },
    0.4, { left: 'SAU', right: 'TRƯỚC', rest: 0.5 }); };
// ---- N07 map layers
LAB.N07A = () => { const cam = () => { GC = { x: FOC[0], y: FOC[1], s: S2 * 0.8 }; };
  mapLayers([() => { cam(); gGround({ dim: 0.2 }); }, () => { cam(); for (const c of GEO.comm) gRegion(c.r, { line: '#ffffff', lw: 2.5 }); gRegion(GEO.focus, { fill: G.orange, fa: 0.25, line: G.orange, lw: 5, glow: 12 }); },
    () => { cam(); for (const [k, c] of [['QL.1', '#ff3b3b'], ['QL.10', '#ffd400'], ['_rail', '#ffffff'], ['Sông Lèn', '#3fd0ff']]) if (ROADS[k]) for (const l of ROADS[k]) strokePl(l.map(gSP), c, 5, 10); }],
    0.3, { labels: ['ĐỊA HÌNH', 'RANH GIỚI', 'GIAO THÔNG'] }); };
LAB.N07B = () => { const cam = () => { GC = { x: TEX[1].cx, y: TEX[1].cy, s: S1 * 0.8 }; };
  mapLayers([() => { cam(); gGround({ dim: 0.2 }); }, () => { cam(); for (const d of GEO.dist) gRegion(d.r, { line: '#ffffff', lw: 2 }); },
    () => { cam(); gRegion(GEO.focus, { fill: G.orange, fa: 0.8, line: G.orange, lw: 4, glow: 16 }); const [x, y] = gSP(FOC); gPin(x, y, { r: 30 }); }],
    0.3, { labels: ['THANH HÓA', '27 HUYỆN, THỊ, THÀNH', 'HẬU LỘC'] }); };
// ---- N08 gauge
LAB.N08A = () => { darkGround(); gauge(CX, 860, 330, 3, 7, 4, 6, 0.5, { red: 5.5, step: 1, label: 'LÃI SUẤT TÁI CẤP VỐN · CUỐI 2022', dur: 1.8 }); };
LAB.N08B = () => { darkGround(); gauge(CX, 860, 330, 3, 7, 6, 4.5, 0.5, { red: 5.5, step: 1, label: 'SAU 4 LẦN GIẢM · 6/2023', color: '#7fdc6a', dur: 1.8 }); };
// ---- N09 odometer
LAB.N09A = () => { camHL(0.9); hlMap({ dim: 0.6, fa: 0.3 }); odometer('176.418', CX, 860, 150, 0.4, { box: true }); fxPill('DÂN SỐ HẬU LỘC · 2019', CX, 960, 30, '#15100a', G.orange, ev(0.2, 0.3)); };
LAB.N09B = () => { camVN(); vnMap({ dim: 0.6 }); odometer('96.208.984', CX, 860, 110, 0.4, { box: true }); fxPill('DÂN SỐ VIỆT NAM · 2019', CX, 960, 30, '#15100a', G.orange, ev(0.2, 0.3)); };
// ---- N10 waffle
LAB.N10A = () => { darkGround(); waffle(39, 210, 640, 56, 0.4, { color: G.red }); gText('39%', 210, 600, 84, G.red, { weight: 900, alpha: ev(0.3, 0.3) }); gText('giao dịch giảm · quý I/2023 so với cùng kỳ', 210, 1360, 30, '#ffd08a', { italic: true, font: SERIF, weight: 500, alpha: ev(0.5, 0.4) }); };
LAB.N10B = () => { darkGround(); waffle(3.8, 210, 640, 56, 0.4, { dur: 0.8 }); gText('3,8%', 210, 600, 84, G.orange, { weight: 900, alpha: ev(0.3, 0.3) }); gText('dân số cả nước sống ở Thanh Hóa · 2019', 210, 1360, 30, '#ffd08a', { italic: true, font: SERIF, weight: 500, alpha: ev(0.5, 0.4) }); };
// ---- N11 ranking bars
LAB.N11A = () => { darkGround(); gText('DÂN SỐ 2019 · TRIỆU NGƯỜI', 80, 520, 32, G.orange, { weight: 900, alpha: ev(0, 0.3) });
  rankBars(POP19.map(([n, l, v]) => ({ label: l, v, txt: String(v).replace('.', ',') })), 80, 600, 900, 0.3); };
LAB.N11B = () => { darkGround(); gText('SỐ ĐƠN VỊ CŨ GỘP THÀNH XÃ MỚI', 80, 520, 32, G.orange, { weight: 900, alpha: ev(0, 0.3) });
  rankBars(Object.entries(UNITS).sort((a, b) => b[1] - a[1]).map(([n, v]) => ({ label: n.toUpperCase(), v })), 80, 600, 900, 0.3); };
// ---- N12 stamp on a document
LAB.N12A = () => { darkGround(); docPage(DOCS.nq1686, CX, 860, 0, 1.0, EZ.o3(ev(0, 0.4))); stamp(['CÓ HIỆU LỰC', '1/7/2025'], 640, 1080, -0.18, 1.4); };
LAB.N12B = () => { darkGround(); docPage(DOCS.caungu, CX, 860, 0, 1.0, EZ.o3(ev(0, 0.4))); stamp(['DI SẢN QUỐC GIA', '2017'], 600, 1060, 0.14, 1.4, { size: 48 }); };
// ---- N13 hand-drawn circle on a document
LAB.N13A = () => { darkGround(); const D = DOCS.mamtom, m = docPage(D, CX, 860, 0, 1.0, EZ.o3(ev(0, 0.4))); if (m) { const r = D.rects[0], [x0, y0] = m(r[0], r[1]), [x1, y1] = m(r[0] + 330, r[1] + r[3]); handCircle(x0 + 30, y0, x1 - x0 - 30, y1 - y0, 1.2); } };
LAB.N13B = () => { darkGround(); const D = DOCS.nd65, m = docPage(D, CX, 860, 0, 1.25, EZ.o3(ev(0, 0.4))); if (m) { const r = D.rects[0], [x0, y0] = m(r[0], r[1]), [x1, y1] = m(r[0] + r[2], r[1] + r[3]); handCircle(x0, y0, x1 - x0, y1 - y0, 1.2); } };
// ---- N14 hand-drawn arrow in a photo
LAB.N14A = () => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); const m = photoFS('fs_ba_trieu.jpg', { fx: 1.0, dur: 5 }); footShade(0.5); if (m) handArrow([260, 520], m(0.80, 0.60), 'VOI ĐÁ', 1.0, { bend: -0.25 }); };
LAB.N14B = () => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); const m = photoFS('g_harbour.jpg', { fx: 0.45, dur: 5 }); if (m) handArrow([300, 520], m(0.47, 0.66), 'THUYỀN CÁ', 1.0, { bend: 0.3 }); };
// ---- N15 stacked cards
const icoPct = (c) => { ctx.fillStyle = c; ctx.font = `900 64px ${GFONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('%', 0, 2); };
const icoLock = (c) => { ctx.strokeStyle = c; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -10, 16, Math.PI, 0); ctx.stroke(); ctx.fillStyle = c; ctx.fillRect(-24, -10, 48, 38); };
const icoWait = (c) => { ctx.strokeStyle = c; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 26, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -16); ctx.moveTo(0, 0); ctx.lineTo(12, 8); ctx.stroke(); };
LAB.N15A = () => { darkGround(); stackCards([{ head: 'LÝ DO 1', title: 'Lãi suất\ntăng', icon: icoPct, c: G.red }, { head: 'LÝ DO 2', title: 'Vốn chủ đầu tư\nbị siết', icon: icoLock, c: G.orange }, { head: 'LÝ DO 3', title: 'Tâm lý\nchờ giá giảm', icon: icoWait, c: '#5a6068' }], 0.2); };
LAB.N15B = () => { darkGround(); stackCards([{ head: 'DI TÍCH QG ĐẶC BIỆT', title: 'Đền\nBà Triệu', img: 'den_ba_trieu.jpg', c: G.red }, { head: 'DI SẢN PHI VẬT THỂ', title: 'Lễ hội\nCầu Ngư', img: 'fs_cau_ngu_ai.jpg', c: G.teal }, { head: 'CHỈ DẪN ĐỊA LÝ', title: 'Mắm tôm\nHậu Lộc', img: 'fs_mam_tom_ai.jpg', c: G.orange }], 0.2); };
// ---- N16 dive through a pin into a photo
function diveClip(pt, img, label, col) { const tc = 2.0, z = Math.exp(lerp(Math.log(S2), Math.log(S2 * 14), EZ.i3(seg(TT, 0.6, tc)))); GC = { x: pt[0], y: pt[1], s: z }; hlMap();
  const [x, y] = gSP(pt); gPin(x, y, { r: 26, pop: popS(0.2), color: col, dot: '#fff' }); gPulse(x, y, 0.2, col, 20); zoomBlur(seg(TT, 1.2, tc) * 1.5, y);
  pinDive([x, y - 40], img, tc); if (TT > tc + 0.5) { footShade(0.6); fxPill(label, 80, 1250, 34, '#fff', col, popS(tc + 0.5), { align: 'left' }); } }
LAB.N16A = () => diveClip(COMM('Triệu Lộc').c, 'den_ba_trieu.jpg', 'ĐỀN BÀ TRIỆU', G.red);
LAB.N16B = () => diveClip(COMM('Ngư Lộc').c, 'fs_ngu_loc.jpg', 'NGƯ LỘC', G.teal);

const LAB_SFX = { N01A: [['ping', 0.5], ['air', 1.0]], N01B: [['ping', 0.5]], N02A: [['hit', 0.5], ['ping', 1.2]], N02B: [['hit', 0.4]], N03A: [['air', 0.3], ['ping', 1.7]], N03B: [['ping', 0.4], ['ping', 1.4]],
  N04A: [['air', 0.4], ['air', 1.2]], N04B: [['air', 0.4], ['air', 1.3]], N05A: [['whoosh', 0.7]], N05B: [['whoosh', 0.7]], N06A: [['air', 0.5]], N06B: [['air', 0.5]], N07A: [['air', 0.4]], N07B: [['air', 0.4]],
  N08A: [['air', 0.5], ['hit', 2.0]], N08B: [['air', 0.5], ['hit', 2.0]], N09A: [['air', 0.4]], N09B: [['air', 0.4]], N10A: [['air', 0.4]], N10B: [['air', 0.4]], N11A: [['ping', 0.4]], N11B: [['ping', 0.4]],
  N12A: [['hit', 1.45]], N12B: [['hit', 1.45]], N13A: [['marker', 1.2]], N13B: [['marker', 1.2]], N14A: [['marker', 1.0]], N14B: [['marker', 1.0]], N15A: [['whoosh', 0.3], ['whoosh', 1.2], ['whoosh', 2.1]], N15B: [['whoosh', 0.3], ['whoosh', 1.2], ['whoosh', 2.1]],
  N16A: [['dive', 0.6], ['hit', 2.0]], N16B: [['dive', 0.6], ['hit', 2.0]] };

// ---- shot list and TIMELINE (one shot)
const SEC = {}, CAMKEYS = [[0, FOC[0], FOC[1], S2, 0]];
const ERA_LIST = [[0, DURATION, () => LAB[CLIP](), {}]];
const SHOT_TITLES = [CLIP];
const TIMELINE = {
  width: W, height: H, fps: FPS, bpm: BPM, gridOffset: GRID0, duration: DURATION, frames: NFRAMES, loop: LOOP_T, safe: SAFE, aspect: FORMAT, format: 'journey',
  shots: [{ id: 1, key: CLIP, era: 0, t0: 0, t1: DURATION, title: CLIP }], cuts: [], morphs: [], cues: {}, acts: [{ name: '1', role: 'build', t0: 0, t1: DURATION }],
  board: [{ t: DURATION * 0.6, title: CLIP, sound: '', next: '' }], narration: [],
};
window.TIMELINE = TIMELINE;
