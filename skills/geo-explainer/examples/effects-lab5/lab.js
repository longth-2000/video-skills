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

// ---- openings
LAB.O1 = () => openPhoto('g_harbour.jpg', [{ text: 'VÌ SAO NGƯ LỘC', size: 66 }, { text: 'ĐÔNG DÂN NHẤT?', size: 84, color: G.orange }], 0.15, { fx: 0.4 });
LAB.O2 = () => { camHL(0.9); hlMap({ dim: 0.45 }); openNumber('143,67', 'KM² DIỆN TÍCH', 0.2); };
LAB.O5 = () => openGlobe([{ text: 'HẬU LỘC', size: 96 }, { text: 'NHÌN TỪ VỆ TINH', size: 48, color: G.orange }], 0.15, 100, 18);
// ---- endings
LAB.E01 = () => endRecap(['den_ba_trieu.jpg', 'g_harbour.jpg', 'de_bien.jpg', 'g_dryfish.jpg', 'hon_ne.jpg', 'g_street.jpg'], [{ text: 'MỘT VÙNG ĐẤT', size: 64 }, { text: 'HAI MẶT BIỂN', size: 80, color: G.orange }], 0.2, { tGather: 1.6, end: DURATION });
LAB.E02 = () => { camHL(0.95); hlMap(); endIris(NG, [{ text: 'NGƯ LỘC', size: 88 }], 0.3, 2.2, { end: DURATION }); };
LAB.E03 = () => { GC = { x: FOC[0], y: FOC[1], s: S2 * lerp(1, 0.25, EZ.io(seg(TT, 0.1, 3.0))) }; HLM(); route([TR, FOC, NG, HONNE], G.orange, -1, 0, { thick: true }); endCard([{ text: 'HẬU LỘC', size: 96 }, { text: 'HẸN GẶP LẠI', size: 44, color: G.orange }], 1.6, { end: DURATION }); };
// ---- photo accents
LAB.A1 = () => { camHL(0.95); hlMap(); const [x1, y1] = gSP(TR), [x2, y2] = gSP(NG); photoPin('den_ba_trieu.jpg', x1, y1, 0.3, { label: 'ĐỀN BÀ TRIỆU' }); photoPin('g_harbour.jpg', x2, y2, 0.8, { label: 'CẢNG NGƯ LỘC' }); };
LAB.A2 = () => { camHL(0.95); hlMap(); const [x1, y1] = gSP(TR), [x2, y2] = gSP(NG); photoFlag('den_ba_trieu.jpg', x1, y1, 'ĐỀN BÀ TRIỆU', { pop: popS(0.3) }); photoFlag('g_harbour.jpg', x2, y2, 'NGƯ LỘC', { pop: popS(0.8) }); };
LAB.A3 = () => { camHL(0.9); hlMap({ dim: 0.55 }); gScrim(560, 1180, 0.6); rankBars([{ label: 'NGƯ LỘC', v: 9, txt: '9 KM', img: 'g_harbour.jpg' }, { label: 'HẢI LỘC', v: 6, txt: '6 KM', img: 'de_bien.jpg' }, { label: 'ĐA LỘC', v: 4, txt: '4 KM', img: 'hon_ne.jpg' }], 80, 640, 860, 0.3); };
const LAB_SFX = { O1: [['air', 0.2]], O2: [['air', 0.2]], O5: [['air', 0.2]], E01: [['air', 0.2], ['whoosh', 1.6]], E02: [['air', 0.3]], E03: [['air', 0.2]], A1: [['ping', 0.3], ['ping', 0.8]], A2: [['ping', 0.3], ['ping', 0.8]], A3: [['air', 0.3]] };


// ---- big intros / outros (fx-intro.js)
const IMGS = ['g_harbour.jpg', 'den_ba_trieu.jpg', 'de_bien.jpg', 'g_dryfish.jpg', 'hon_ne.jpg', 'g_street.jpg', 'fs_ngu_loc.jpg', 'g_beach.jpg', 'fs_ba_trieu.jpg'];
const I1K = [[0, FOC[0], FOC[1], S1 * 0.85, 0], [0.1, FOC[0], FOC[1], S1 * 1.0, 2.2], [2.4, FOC[0], FOC[1], S2, 1.1]];
LAB.I1 = () => introTitle3D('HẬU LỘC', 'THANH HÓA', 0.1, 2.4, () => { GC = gCamAt(I1K, TT); thMap(); });
LAB.I2 = () => introMosaic(IMGS, 'HẬU LỘC', 'THANH HÓA', 0.05, 2.3);
LAB.I3 = () => { GC = { x: TEX[1].cx, y: TEX[1].cy, s: S1 * 1.05 * (1 + 0.02 * TT) }; introMapDraw([GEO.prov.find((p) => nrm(p.n) === nrm('Thanh Hóa')).r, GEO.focus], 'HẬU LỘC', 'THANH HÓA', 0.1, () => thMap()); };
LAB.I4 = () => introTextVideo('g_harbour.jpg', 'NGƯ LỘC', 0.1, 2.6, { sub: 'LÀNG BIỂN', fx: 0.4 });
LAB.F1 = () => outroWall(IMGS, 'HẬU LỘC', 'THANH HÓA', 0.1, DURATION);
LAB.F2 = () => outroSpace(() => HLM(), { x: NG[0], y: NG[1], s: 60 }, [105.95, 19.92], 'HẬU LỘC', 'THANH HÓA', 0.1, DURATION);
LAB.F3 = () => outroRewind(IMGS, 'HẬU LỘC', 'THANH HÓA', 0.05, 2.6, DURATION);
LAB.F4 = () => { GC = { x: NG[0], y: NG[1], s: S2 * 1.6 * (1 + 0.02 * TT) }; hlMap(); outroIris(NG, 'NGƯ LỘC', 'HẬU LỘC', 0.2, 1.7, DURATION); };
Object.assign(LAB_SFX, { I1: [['air', 0.2], ['whoosh', 2.4]], I2: [['air', 0.2], ['hit', 2.3]], I3: [['air', 0.2], ['hit', 2.1]], I4: [['air', 0.2], ['whoosh', 2.6]], F1: [['air', 0.3], ['hit', 1.8]], F2: [['whoosh', 0.3], ['air', 1.8]], F3: [['whoosh', 0.2], ['hit', 2.6]], F4: [['air', 0.3], ['hit', 1.7]] });

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
