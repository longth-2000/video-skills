// =====================================================================
//  SCENES — one map world; sceneGeo(section) sets the camera and draws that section's overlays.
//  Colour rule: ORANGE = Hậu Lộc itself (its outline, its name). Red = history / heroes. Teal = sea and coast.
//  Five new communes get five colours only at the payoff.
// =====================================================================
const T0 = (id) => VL(id).t0, T1 = (id) => VL(id).t1;
const HLC = [-1.3, -6.0];                                   // the district's centre (km)
const TH_PROV = GEO.prov.find((p) => /^Thanh/.test(p.n));
const DIST = (n) => GEO.dist.find((d) => d.n === n);
const COMM = (n) => GEO.comm.find((c) => c.n === n);
const GRP = (n) => GEO.grp.find((g) => g.n === n);
const TPTH = [-13.0, 8.1];                                  // Thanh Hóa city centre (19.807N 105.776E)
const HONNE = [11.4, -3.65];                                // Hòn Nẹ (19°54'46"N 106°00'32"E, vi.wikipedia)
const BATRIEU = COMM('Triệu Lộc').c;
const NGULOC = COMM('Ngư Lộc').c;
const HOA = COMM('Hoa Lộc').c, DALOC = COMM('Đa Lộc');
const COAST = ['Hòa Lộc', 'Ngư Lộc', 'Hải Lộc', 'Minh Lộc', 'Hưng Lộc', 'Đa Lộc'];
const NEW5 = [   // the five communes from 1 July 2025 and how many old units each joined (NQ 1686/NQ-UBTVQH15, khoản 8–12 Điều 1)
  { n: 'Triệu Lộc', c: G.red, units: 3, side: -40 }, { n: 'Đông Thành', c: G.violet, units: 4 }, { n: 'Hậu Lộc', c: G.orange, units: 4, side: -90, up: -10, fg: '#15100a' },
  { n: 'Hoa Lộc', c: G.lime, units: 6, side: 70, up: 70, fg: '#15100a' }, { n: 'Vạn Lộc', c: G.teal, units: 5, side: 60, up: 110 },
];
// the camera through the whole piece: [t, x, y, s, dur]
const CAMKEYS = [
  [0, 0, 380, 0.78, 0],
  [SEC.open, 0, 380, 0.78, 0.01],                                  // Vietnam, after the globe
  [T0('open') + 1.4, -40, -10, 3.4, 3.0],                           // into Thanh Hóa
  [SEC.hook - 0.6, -0.4, -6.2, 34, 1.4],                            // the district fills the frame (the hook)
  [SEC.loc, -4, -1.5, 24, 0.01],                                    // Hậu Lộc and the city (tilted)
  [SEC.terr, -0.4, -6.2, 34, 0.01],                                 // the three landforms
  [T0('mang') - 0.2, DALOC.c[0] - 1.0, DALOC.c[1] + 3.0, 60, 1.4],  // Đa Lộc
  [SEC.num, -0.4, -4.5, 32, 0.01],                                  // the slab
  [SEC.pre, HOA[0] + 0.4, HOA[1] - 2.2, 60, 0.01],                  // Hoa Lộc
  [SEC.his, -1.3, -1.0, 22, 0.01],
  [SEC.tri - 0.3, BATRIEU[0], BATRIEU[1] + 0.6, 150, 2.2],           // push into Triệu Lộc
  [SEC.mod - 0.3, 5.5, -4.5, 36, 2.0],                               // out to the sea and Hòn Nẹ
  [SEC.rel - 0.2, -0.6, -12.0, 28, 1.4],
  [SEC.cul - 0.3, NGULOC[0] + 0.6, NGULOC[1] + 0.2, 120, 2.0],       // the fishing village
  [PT.ngu[1], NGULOC[0] - 3, NGULOC[1] + 10, 46, 0.01],
  [SEC.split - 0.1, -0.4, -6.2, 34, 0.01],                           // the district alone in the silence
  [T0('new2') - 0.4, -0.4, 2.5, 30, 1.2],                            // lift: the pie goes below
  [SEC.end, -0.4, -6.2, 34, 0.01],
  [SEC.end + 0.6, -25, -2, 6, 2.2],                                  // pull back out
  [DURATION - 2.0, -30, 60, 2.2, 2.0],
];
// the 51 relics, scattered across the communes (illustrative positions, not their real sites)
const RELIC_DOTS = (() => { const R = RNG('relics'), out = []; const all = GEO.comm; for (let i = 0; i < 51; i++) { const c = all[i % all.length], p = [c.c[0] + R.n(0.9), c.c[1] + R.n(0.7)]; out.push({ p, kind: i === 0 ? 0 : i < 4 ? 1 : 2, t: R.f() }); } out[0].p = BATRIEU.slice(); return out; })();
const LACH = (() => { let best = null; for (const r of GEO.hl) for (const p of r) if (p[0] > 1 && (!best || p[1] > best[1])) best = p; return best; })();   // the south-east corner: the Lạch Trường mouth

function hlOutline(o = {}) {
  gRegion(GEO.hl, { fill: o.fill ? G.orange : null, fa: o.fa ?? 0.22, line: G.orange, lw: o.lw ?? 5, glow: o.glow ?? 18, frac: o.frac, len: o.len, la: o.la });
}
function capLine(str, t0, y = 1430) {   // a lower caption, typed (screen space)
  if (TT < t0) return; ctx.save(); ctx.font = `800 46px ${GFONT}`; ctx.textAlign = 'center';
  const s = gType(str, t0, 40), w = ctx.measureText(str).width;
  ctx.globalAlpha = 0.72; ctx.fillStyle = '#05090c'; ctx.beginPath(); ctx.roundRect(CX - w / 2 - 26, y - 52, w + 52, 74, 8); ctx.fill();
  ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 8; ctx.fillText(s, CX, y); ctx.restore();
}
function sceneGeo(sec) {
  GC = gCamAt(CAMKEYS, TT); GC.s *= 1 + 0.03 * Math.sin(TT * 0.55); GC.x += Math.sin(TT * 0.31) * 0.012 * 1080 / GC.s;
  if (sec === 'loc') { secLoc(); return; }   // these two draw their own (tilted) ground
  gGround({ dim: sec === 'rel' || sec === 'dens' ? 0.45 : sec === 'num' ? 0.5 : 0.28 });
  ({ open: secOpen, terr: secTerr, num: secNum, pre: secPre, his: secHis, tri: secTri, mod: secMod, rel: secRel, cul: secCul, dens: secDens, split: secSplit, end: secEnd })[sec]();
}

// ---- photo callout on the map (as in the references): a photo in a thick white rounded frame, the place's name
//      in bold caps inside its foot, a white pointer down to the spot. Screen space; (px, py) = the spot.
function gCallPhoto(name, px, py, o = {}) {
  const img = asset(name), k = o.pop ?? 1; if (!img || k <= 0) return;
  const w = o.w ?? 480, h = o.h ?? 320, up = o.up ?? 60, bw = 7;
  const x = clamp(px + (o.side ?? 0) - w / 2, 40, W - SAFE.right - w), y = py - up - h;
  ctx.save(); ctx.translate(px, py); ctx.scale(k, k); ctx.translate(-px, -py);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 6; ctx.fillStyle = '#fff';
  const qx = clamp(px, x + 40, x + w - 40);
  ctx.beginPath(); ctx.moveTo(qx - 26, y + h - 2); ctx.lineTo(px, py - 4); ctx.lineTo(qx + 26, y + h - 2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 22); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  const ix = x + bw, iy = y + bw, iw = w - 2 * bw, ih = h - 2 * bw, iw0 = img.naturalWidth, ih0 = img.naturalHeight;
  const z = 1 + 0.06 * clamp((TT - (o.t0 ?? TT)) / 6), sc = Math.max(iw / iw0, ih / ih0) * z, dw = iw0 * sc, dh = ih0 * sc;
  ctx.save(); ctx.beginPath(); ctx.roundRect(ix, iy, iw, ih, 16); ctx.clip();
  ctx.drawImage(img, ix + (iw - dw) * (o.fx ?? 0.5), iy + (ih - dh) * (o.fy ?? 0.5), dw, dh);
  const gr = ctx.createLinearGradient(0, iy + ih * 0.5, 0, iy + ih); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.78)'); ctx.fillStyle = gr; ctx.fillRect(ix, iy, iw, ih);
  ctx.restore();
  const ls = o.size ?? 40, sub = o.sub;
  gText(o.label, x + w / 2, iy + ih - (sub ? 44 : 20), ls, '#fff', { align: 'center', weight: 900 });
  if (sub) gText(sub, x + w / 2, iy + ih - 16, ls * 0.5, o.subColor ?? G.yellow, { align: 'center', weight: 800 });
  ctx.restore();
}

// ---- full-screen photo inserts (B-roll, as in the references): the photo fills the frame with a slow push-in,
//      big two-colour type over a dark foot; old photos in black and white; AI illustrations carry a label.
const PH = {
  tri: { img: 'fs_ba_trieu2.jpg', fx: 0.5, fy: 0.5, c: G.red, l1: 'ĐỀN BÀ TRIỆU · NÚI GAI', l2: ['DI TÍCH QUỐC GIA', 'ĐẶC BIỆT'], big: 90, at2: () => VW('tri2', 0.2), credit: 'Ảnh: Linhcandng · Wikimedia Commons · CC BY-SA 3.0' },
  m64: { img: 'fs_maddox.jpg', fx: 0.5, fy: 0.5, gray: true, window: true, c: G.red, l1: 'PHỤC KÍCH TÀU KHU TRỤC MỸ', l2: ['1964'], big: 230, at2: () => VW('mod2', 0.02), credit: 'Tàu USS Maddox (DD-731), đầu thập niên 1960 · Ảnh: Hải quân Hoa Kỳ (NH 97900)' },
  fest: { img: 'fs_cau_ngu_ai.jpg', fx: 0.72, fy: 0.5, c: G.teal, ai: true, l1: 'LỄ HỘI CẦU NGƯ · NGƯ LỘC', l2: ['DI SẢN VĂN HÓA', 'PHI VẬT THỂ', 'QUỐC GIA · 2017'], big: 84, at2: () => VW('cul2', 0.05) },
  ngu: { img: 'fs_ngu_loc.jpg', fx: 0.5, fy: 0.5, c: G.red, l1: 'XÃ NGƯ LỘC', l2: ['LÀNG BIỂN', 'ĐÔNG ĐÚC'], at2: () => VW('cul3', 0.15), credit: 'Một con đường làng ở Ngư Lộc · Ảnh: Gió Đông · Wikimedia Commons' },
  mam: { img: 'fs_mam_tom_ai.jpg', fx: 0.5, fy: 0.5, c: '#e57aa9', ai: true, l1: 'TỪ CON MOI BIỂN', at1: () => VW('cul4', 0.3), l2: ['MẮM TÔM', 'HẬU LỘC'], at2: () => VW('cul4', 0.05) },
};
function scenePhoto(id, t0, t1) {
  const P = PH[id.replace('ph_', '')], img = asset(P.img);
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, H);
  if (img) {
    const u = clamp((TT - t0) / Math.max(1, t1 - t0)), z = 1.04 + 0.08 * EZ.io(u);
    const iw0 = img.naturalWidth, ih0 = img.naturalHeight, sc = Math.max(W / iw0, H / ih0) * z, dw = iw0 * sc, dh = ih0 * sc;
    ctx.save(); if (P.gray) ctx.filter = 'grayscale(1) contrast(1.15)' + (P.window ? ' blur(18px) brightness(0.45)' : '');
    ctx.drawImage(img, (W - dw) * (P.fx + (u - 0.5) * 0.04), (H - dh) * P.fy, dw, dh); ctx.restore();
    if (P.window) {   // the whole photo in a rounded window over its own blurred copy (wide photos)
      const ww = W - 180, wh = ww * ih0 / iw0, wx = 90, wy = 270 - 20 * EZ.io(u), z2 = 1 + 0.06 * EZ.io(u);
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 40; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(wx - 6, wy - 6, ww + 12, wh + 12, 30); ctx.fill(); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.roundRect(wx, wy, ww, wh, 24); ctx.clip(); if (P.gray) ctx.filter = `grayscale(1) contrast(1.15) blur(${(1 - seg(TT, t0, t0 + 1.2)) * 12}px)`;
      ctx.drawImage(img, wx - ww * (z2 - 1) / 2, wy - wh * (z2 - 1) / 2, ww * z2, wh * z2); ctx.restore();
    }
  }
  // dark top and foot so type reads
  let g = ctx.createLinearGradient(0, 0, 0, 520); g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 520);
  g = ctx.createLinearGradient(0, 900, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.45, 'rgba(0,0,0,0.72)'); g.addColorStop(1, 'rgba(0,0,0,0.85)'); ctx.fillStyle = g; ctx.fillRect(0, 900, W, H - 900);
  const k1 = popS((P.at1 ? P.at1() : t0 + 0.15)), big = P.big ?? 104;
  // the big lines pop in (scale from 1.25, as in the references), stacked up from the foot
  const n = P.l2.length, lh = big * 1.02, yLast = P.l3 ? 1200 : 1290, y0 = yLast - (n - 1) * lh;
  if (k1 > 0) gText(P.l1, 70, y0 - big - 8, 40, P.c, { italic: true, weight: 900, alpha: clamp(k1) });
  P.l2.forEach((L, i) => {
    const k = EZ.o3(ev(P.at2() + i * 0.12, 0.35)); if (k <= 0) return;
    ctx.save(); const yy = y0 + i * lh, s = 1.1 - 0.1 * k; ctx.translate(70, yy); ctx.scale(s, s); ctx.translate(-70, -yy);
    gText(L, 70, yy, big, i === n - 1 ? P.c : '#fff', { weight: 900, alpha: k }); ctx.restore();
  });
  if (P.l3 && TT > P.at3()) gText(P.l3, 70, 1290, 50, G.yellow, { weight: 900, alpha: ev(P.at3(), 0.3) });
}
