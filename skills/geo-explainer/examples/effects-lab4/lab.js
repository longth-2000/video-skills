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
const HLM = () => { gGround({ dim: 0.25 }); for (const c of GEO.comm) gRegion(c.r, { line: 'rgba(255,255,255,0.45)', lw: 1.5 }); gRegion(GEO.focus, { line: G.orange, lw: 3, glow: 10 }); };
const NG = COMM('Ngư Lộc').c, HCM = PROV('Hồ Chí Minh').c;
const vn = (k, t0, o = {}) => vname(k, TT - t0, o);
// ---- V01 full-screen video + title
LAB.V01A = () => videoFull('boat', 0, { kicker: 'LÀNG CHÀI', lines: ['THUYỀN', 'VỀ BẾN'] });
LAB.V01B = () => videoFull('city', 0, { kicker: 'ĐÔ THỊ', lines: ['NHÌN TỪ', 'TRÊN CAO'], color: G.teal });
// ---- V02 video callouts on the map
LAB.V02A = () => { camHL(0.95); hlMap(); photoCallout(vn('sea', 0.4, { v: 'L' }), ...gSP(NG), 'NGOÀI KHƠI', 0.4, { side: -150, up: 120 }); photoCallout(vn('rice', 1.6, { v: 'L' }), ...gSP(COMM('Triệu Lộc').c), 'ĐỒNG LÚA', 1.6, { side: 120 }); };
LAB.V02B = () => { GC = { x: HCM[0] - 60, y: HCM[1] - 120, s: 2.2 * (1 + 0.015 * TT) }; vnMap(); gRegion(PROV('Hồ Chí Minh').r, { fill: G.orange, fa: 0.5, line: G.orange, lw: 3, glow: 10 });
  const [x, y] = gSP(HCM); photoCallout(vn('river', 0.4, { v: 'L' }), x, y, 'SÔNG SÀI GÒN', 0.4, { side: -160, up: 360 }); photoCallout(vn('street', 1.6, { v: 'L' }), x, y, 'PHỐ SÀI GÒN', 1.6, { side: 160, up: 40 }); };
// ---- V03 dive through a pin into the video
function diveVideo(pt, key, label, col, map) { const tc = 2.0, z = Math.exp(lerp(Math.log(map.s0), Math.log(map.s0 * 14), EZ.i3(seg(TT, 0.6, tc)))); GC = { x: pt[0], y: pt[1], s: z }; map.draw();
  const [x, y] = gSP(pt); gPin(x, y, { r: 26, pop: popS(0.2), color: col, dot: '#fff' }); gPulse(x, y, 0.2, col, 20); zoomBlur(seg(TT, 1.2, tc) * 1.5, y);
  pinDive([x, y - 40], vn(key, tc), tc); if (TT > tc + 0.5) { footShade(0.6); fxPill(label, 80, 1250, 34, '#fff', col, popS(tc + 0.5), { align: 'left' }); } }
LAB.V03A = () => diveVideo(NG, 'boat', 'LÀNG CHÀI', G.teal, { s0: S2, draw: () => hlMap() });
LAB.V03B = () => diveVideo(HCM, 'night', 'SÀI GÒN VỀ ĐÊM', G.orange, { s0: S0 * 1.4, draw: () => vnMap() });
// ---- V04 video inside a region's shape
LAB.V04A = () => { camHL(1.0); gGround({ dim: 0.45 }); fxPhotoRegion(vn('beach', 0.3, { v: 'L' }), GEO.focus, EZ.o3(ev(0.3, 0.8)), { zoom: 1.3 }); gRegion(GEO.focus, { line: '#fff', lw: 5, glow: 18, frac: ev(0, 0.9), len: gRingLen(GEO.focus) + 20 }); fxPill('VÙNG BIỂN', 80, 330, 32, '#15100a', G.orange, popS(1.2), { align: 'left' }); };
LAB.V04B = () => { GC = { x: TEX[1].cx, y: TEX[1].cy, s: S1 * 0.95 * (1 + 0.015 * TT) }; gGround({ dim: 0.45 }); const th = PROV('Thanh Hóa').r; fxPhotoRegion(vn('rice', 0.3, { v: 'P' }), th, EZ.o3(ev(0.3, 0.8)), { zoom: 1.15 }); gRegion(th, { line: '#fff', lw: 4, glow: 16 }); fxPill('ĐỒNG LÚA', 80, 330, 32, '#15100a', G.lime, popS(1.2), { align: 'left' }); };
// ---- V05 video through big letters
LAB.V05A = () => textReveal(vn('wave', 0), 'BIỂN', 0.2, 2.2, { size: 330, label: 'SÓNG VỖ BỜ' });
LAB.V05B = () => textReveal(vn('night', 0), 'ĐÊM', 0.2, 2.2, { size: 330, label: 'PHỐ VỀ ĐÊM' });
// ---- V06 split video bands
LAB.V06A = () => splitPanels([{ img: vn('boat', 0, { v: 'L' }), label: 'TRÊN BỜ', c: G.teal }, { img: vn('sea', 0, { v: 'L' }), label: 'NGOÀI KHƠI' }, { img: vn('market', 0, { v: 'L' }), label: 'CHỢ NỔI', c: G.yellow }], 0.1);
LAB.V06B = () => splitPanels([{ img: vn('street', 0, { v: 'L' }), label: 'BAN NGÀY' }, { img: vn('night', 0, { v: 'L' }), label: 'BAN ĐÊM', c: G.red }], 0.1);
// ---- V07 video in a curved TV / a phone
LAB.V07A = () => { darkGround(); const [x, y, u] = slideIn([W + 200, -400], [100, 560], 0.2, 0.9); videoTV('market', TT, x, y, 740, 460, lerp(0.4, -0.03, u), u); fxPill('CHỢ NỔI', 140, 1160, 40, '#fff', G.orange, popS(1.3), { align: 'left' }); };
LAB.V07B = () => { darkGround(); videoPhone('night', TT, CX, 860, EZ.o3(ev(0.1, 0.8)), { ui: 'Phố đêm' }); };
// ---- V08 freeze frame + annotations
LAB.V08A = () => videoFreeze('street', 0, 2.0, 3.8, [[[0.05, 0.33, 0.42, 0.82], 'XE MÁY'], [[0.6, 0.2, 1.0, 0.6], 'XE TẢI']]);
LAB.V08B = () => videoFreeze('market', 0, 2.0, 3.8, [[[0.0, 0.22, 0.72, 0.42], 'GHE CHỞ HÀNG'], [[0.15, 0.52, 0.75, 0.95], 'GHE CHỞ HÀNG']]);
// ---- V09 speed ramp
LAB.V09A = () => videoRamp('night', 0, [[0, 3], [2.0, 0.5]], { badge: true });
LAB.V09B = () => videoRamp('crane', 0, [[0, 2.5], [2.2, 0.4]], { badge: true });
// ---- V10 picture-in-picture over the map
LAB.V10A = () => { camHL(0.95); hlMap(); const [x, y] = gSP(NG); gPin(x, y, { r: 22, color: G.teal, dot: '#fff', pop: popS(0.2) }); videoPiP('sea', TT, [x, y - 50], EZ.back(ev(0.6, 0.5)), { x: 520, y: 330, label: 'NGOÀI KHƠI' }); };
LAB.V10B = () => { GC = { x: HCM[0] - 120, y: HCM[1] - 60, s: 1.8 * (1 + 0.015 * TT) }; vnMap(); gRegion(PROV('Hồ Chí Minh').r, { fill: G.orange, fa: 0.6, line: G.orange, lw: 3 }); const [x, y] = gSP(HCM); gPin(x, y, { r: 22, pop: popS(0.2) }); videoPiP('river', TT, [x, y - 50], EZ.back(ev(0.6, 0.5)), { x: 520, y: 330, label: 'SÔNG SÀI GÒN' }); };
// ---- V11 mosaic of videos → one fills the frame
const VK = ['boat', 'street', 'rice', 'night', 'sea', 'city'];
LAB.V11A = () => mosaicZoom(Array.from({ length: 28 }, (_, i) => vn(VK[i % VK.length], -i * 0.2, { v: 'L' })), 12, 0.1, 2.0, { label: 'LÀNG CHÀI' });
LAB.V11B = () => mosaicZoom(Array.from({ length: 28 }, (_, i) => vn(VK[i % VK.length], -i * 0.2, { v: 'L' })), 17, 0.1, 2.0, { label: 'ĐÔ THỊ' });
// ---- V12 old-film grade → colour
LAB.V12A = () => videoOldToColour('street', 0, 2.2, { label: 'PHỐ SÀI GÒN' });
LAB.V12B = () => videoOldToColour('market', 0, 2.2, { label: 'CHỢ NỔI' });
// ---- V13 before/after: a still photo vs the playing video
LAB.V13A = () => beforeAfter(() => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); drawCover(asset('g_harbour.jpg'), 0, 0, W, H, 1.05, 0.45); }, () => drawCover(vimg('boat', TT), 0, 0, W, H, 1.03), 0.4, { left: 'VIDEO', right: 'ẢNH' });
LAB.V13B = () => beforeAfter(() => drawCover(vimg('crane', 0), 0, 0, W, H, 1.03, 0.5, 0.5, 'grayscale(1) contrast(1.1)'), () => drawCover(vimg('crane', TT), 0, 0, W, H, 1.03), 0.4, { left: 'ĐANG CHẠY', right: 'DỪNG HÌNH' });
const LAB_SFX = { V01A: [['hit', 0.4]], V01B: [['hit', 0.4]], V02A: [['ping', 0.4], ['ping', 1.6]], V02B: [['ping', 0.4], ['ping', 1.6]], V03A: [['dive', 0.6], ['hit', 2.0]], V03B: [['dive', 0.6], ['hit', 2.0]],
  V04A: [['air', 0.3]], V04B: [['air', 0.3]], V05A: [['air', 0.3], ['whoosh', 2.2]], V05B: [['air', 0.3], ['whoosh', 2.2]], V06A: [['whoosh', 0.4], ['whoosh', 0.7]], V06B: [['whoosh', 0.4]],
  V07A: [['whoosh', 0.4]], V07B: [['whoosh', 0.3]], V08A: [['hit', 2.0], ['ping', 2.3]], V08B: [['hit', 2.0], ['ping', 2.3]], V09A: [['air', 0.4], ['hit', 2.0]], V09B: [['air', 0.4], ['hit', 2.2]],
  V10A: [['ping', 0.6]], V10B: [['ping', 0.6]], V11A: [['air', 0.3], ['whoosh', 2.0]], V11B: [['air', 0.3], ['whoosh', 2.0]], V12A: [['air', 2.2]], V12B: [['air', 2.2]], V13A: [['air', 0.4]], V13B: [['air', 0.4]] };

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
