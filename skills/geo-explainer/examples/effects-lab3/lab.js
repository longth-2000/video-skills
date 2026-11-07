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
const NG = COMM('Ngư Lộc').c, TR = COMM('Triệu Lộc').c;
// ---- P01 photo callouts on the map
LAB.P01A = () => { camHL(0.95); hlMap();
  photoCallout('den_ba_trieu.jpg', ...gSP(TR), 'ĐỀN BÀ TRIỆU', 0.4, { side: 120 });
  photoCallout('fs_ngu_loc.jpg', ...gSP(NG), 'NGƯ LỘC', 1.4, { side: -120, up: 220 });
  photoCallout('hon_ne.jpg', ...gSP(HONNE), 'HÒN NẸ', 2.4, { side: -160, up: 40 }); };
LAB.P01B = () => { GC = { x: NG[0] - 1.2, y: NG[1] + 0.3, s: 150 * (1 + 0.015 * TT) }; hlMap({ comm: 0.8 }); const c = COMM('Ngư Lộc'); gRegion(c.r, { line: G.red, lw: 4, glow: 12 });
  photoCallout('g_harbour.jpg', ...gSP([NG[0] + 0.5, NG[1] + 0.6]), 'THUYỀN CÁ', 0.4, { side: 100, up: 60 });
  photoCallout('g_dryfish.jpg', ...gSP([NG[0] - 0.4, NG[1] - 0.2]), 'PHƠI CÁ', 1.4, { side: -170, up: 300 });
  photoCallout('g_beach.jpg', ...gSP([NG[0] + 0.2, NG[1] + 1.4]), 'BÃI BIỂN', 2.4, { side: 60, up: 40, fx: 0.3 }); };
// ---- P02 photo with a mini map
LAB.P02A = () => photoMiniMap('den_ba_trieu.jpg', TR, 9, HLM, 0.2, { label: 'ĐỀN BÀ TRIỆU', color: G.red });
LAB.P02B = () => photoMiniMap('hon_ne.jpg', HONNE, 7, HLM, 0.2, { label: 'HÒN NẸ', color: G.teal });
// ---- P03 photos along a route
LAB.P03A = () => { const path = [TR, FOC, NG, HONNE]; GC = { x: FOC[0] + 3, y: FOC[1] - 1.5, s: S2 * 0.95 }; hlMap({ fa: 0.08 });
  photosAlongRoute(path, [{ u: 0.02, img: 'den_ba_trieu.jpg', label: 'ĐỀN BÀ TRIỆU', side: 60 }, { u: 0.45, img: 'de_bien.jpg', label: 'ĐÊ BIỂN', side: -40 }, { u: 0.72, img: 'fs_ngu_loc.jpg', label: 'NGƯ LỘC', side: -120 }, { u: 1, img: 'hon_ne.jpg', label: 'HÒN NẸ', side: -100 }], 0.3, 3.8); };
LAB.P03B = () => { const pts = ['Hòa Lộc', 'Hải Lộc', 'Ngư Lộc', 'Minh Lộc'].map((n) => COMM(n).c), c = pts[2]; GC = { x: c[0] - 0.5, y: c[1] - 1.5, s: 60 }; hlMap({ fa: 0.05 });
  photosAlongRoute(pts, [{ u: 0.05, img: 'g_beach.jpg', label: 'BỜ BIỂN', side: -200 }, { u: 0.5, img: 'g_harbour.jpg', label: 'BẾN THUYỀN', side: 220 }, { u: 0.95, img: 'g_street.jpg', label: 'PHỐ BIỂN', side: -220 }], 0.3, 3.6, { color: G.teal }); };
// ---- P04 split panels
LAB.P04A = () => splitPanels([{ img: 'den_ba_trieu.jpg', label: 'CỔNG ĐỀN', c: G.red }, { img: 'fs_ba_trieu.jpg', label: 'VOI ĐÁ', fx: 0.9 }, { img: 'fs_ba_trieu2.jpg', label: 'CỘT TRỤ', fx: 0.45 }], 0.1);
LAB.P04B = () => splitPanels([{ img: 'g_harbour.jpg', label: 'THUYỀN CÁ', c: G.teal }, { img: 'g_dryfish.jpg', label: 'PHƠI CÁ', fx: 0.45 }, { img: 'fs_mam_tom_ai.jpg', label: 'MẮM TÔM' }], 0.1);
// ---- P05 polaroids fanning
LAB.P05A = () => { darkGround(); fanPolaroids([{ img: 'g_harbour.jpg', label: 'thuyền cá' }, { img: 'g_dryfish.jpg', label: 'phơi cá' }, { img: 'fs_ngu_loc.jpg', label: 'Ngư Lộc' }, { img: 'g_beach.jpg', label: 'bãi biển' }, { img: 'g_street.jpg', label: 'phố biển' }], 2, 0.2); };
LAB.P05B = () => { darkGround(); fanPolaroids([{ img: 'den_ba_trieu.jpg', label: 'cổng đền' }, { img: 'fs_ba_trieu.jpg', label: 'voi đá' }, { img: 'fs_ba_trieu2.jpg', label: 'cột trụ' }], 1, 0.2, { tHero: 1.6 }); };
// ---- P06 mosaic → full screen
const ALL = ['den_ba_trieu.jpg', 'g_harbour.jpg', 'fs_ngu_loc.jpg', 'hon_ne.jpg', 'g_dryfish.jpg', 'fs_ba_trieu.jpg', 'g_beach.jpg', 'de_bien.jpg', 'fs_cau_ngu_ai.jpg', 'g_street.jpg', 'fs_ba_trieu2.jpg', 'fs_mam_tom_ai.jpg'];
LAB.P06A = () => mosaicZoom(ALL, 12, 0.1, 2.0, { label: 'ĐỀN BÀ TRIỆU' });
LAB.P06B = () => mosaicZoom(ALL, 14, 0.1, 2.0, { label: 'BẾN THUYỀN NGƯ LỘC' });
// ---- P07 film strip
LAB.P07A = () => filmStrip(['g_harbour.jpg', 'g_dryfish.jpg', 'fs_ngu_loc.jpg', 'g_beach.jpg', 'g_street.jpg'], 0.1, { title: 'LÀNG BIỂN NGƯ LỘC' });
LAB.P07B = () => filmStrip(['den_ba_trieu.jpg', 'fs_ba_trieu.jpg', 'fs_ba_trieu2.jpg', 'fs_cau_ngu_ai.jpg', 'fs_mam_tom_ai.jpg'], 0.1, { title: 'DI SẢN HẬU LỘC' });
// ---- P08 spotlight
LAB.P08A = () => photoSpotlight('fs_ba_trieu.jpg', 0.85, 0.66, 'VOI ĐÁ', 0.2, { fx: 1.0 });
LAB.P08B = () => photoSpotlight('g_dryfish.jpg', 0.45, 0.66, 'PHƠI CÁ', 0.2, { fx: 0.45 });
// ---- P09 photo through letters
LAB.P09A = () => textReveal('de_bien.jpg', 'HẬU LỘC', 0.2, 2.2, { size: 210, fy: 0.7, label: 'ĐÊ BIỂN HẬU LỘC' });
LAB.P09B = () => textReveal('fs_ngu_loc.jpg', 'NGƯ LỘC', 0.2, 2.2, { size: 210, label: 'XÃ NGƯ LỘC' });
// ---- P10 2.5D parallax
LAB.P10A = () => parallax25('g_harbour.jpg', 0, { cut: 0.56, fx: 0.4, label: 'BẾN THUYỀN' });
LAB.P10B = () => parallax25('hon_ne.jpg', 0, { cut: 0.62, fx: 0.55, dir: -1, label: 'NHÌN RA HÒN NẸ' });
// ---- P11 flip card
LAB.P11A = () => flipCard('den_ba_trieu.jpg', 'fs_ba_trieu.jpg', 0.1, 2.0, { labelA: 'CỔNG ĐỀN', labelB: 'VOI ĐÁ' });
LAB.P11B = () => flipCard('g_harbour.jpg', 'g_dryfish.jpg', 0.1, 2.0, { labelA: 'TRÊN BIỂN', labelB: 'TRÊN BỜ' });
// ---- P12 brand duotone → true colour
LAB.P12A = () => duotone('g_street.jpg', 0, 2.2, { fx: 0.35, label: 'PHỐ BIỂN NGƯ LỘC' });
LAB.P12B = () => duotone('hon_ne.jpg', 0, 2.2, { fx: 0.55, label: 'HÒN NẸ' });
const LAB_SFX = { P01A: [['ping', 0.4], ['ping', 1.4], ['ping', 2.4]], P01B: [['ping', 0.4], ['ping', 1.4], ['ping', 2.4]], P02A: [['whoosh', 0.2], ['ping', 0.7]], P02B: [['whoosh', 0.2], ['ping', 0.7]],
  P03A: [['air', 0.3], ['ping', 1.9], ['ping', 3.8]], P03B: [['air', 0.3], ['ping', 2.0]], P04A: [['whoosh', 0.4], ['whoosh', 0.7]], P04B: [['whoosh', 0.4], ['whoosh', 0.7]], P05A: [['air', 0.3], ['hit', 2.0]], P05B: [['air', 0.3], ['hit', 1.8]],
  P06A: [['air', 0.3], ['whoosh', 2.0]], P06B: [['air', 0.3], ['whoosh', 2.0]], P07A: [['air', 0.3]], P07B: [['air', 0.3]], P08A: [['air', 0.6], ['ping', 1.4]], P08B: [['air', 0.6], ['ping', 1.4]],
  P09A: [['air', 0.3], ['whoosh', 2.2]], P09B: [['air', 0.3], ['whoosh', 2.2]], P10A: [['air', 0.4]], P10B: [['air', 0.4]], P11A: [['whoosh', 2.0]], P11B: [['whoosh', 2.0]], P12A: [['air', 2.2]], P12B: [['air', 2.2]] };

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
