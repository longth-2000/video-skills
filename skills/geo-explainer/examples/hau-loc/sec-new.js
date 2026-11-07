// =====================================================================
//  v4 scenes for the 5-minute cut: the globe opening, the hook, chapter cards, roads and the river,
//  the census chart, the timeline, the Hoa Lộc bowl, the quote, the annotated temple, the heritage rings,
//  the relic table, the photo grid, the documents, the density thermometers, the inset map, the outro.
//  Layout rule: nothing below y 1360 except subtitles (fx.js SUBY) and source notes.
// =====================================================================


// ---- 0 the globe: Earth from space turning to Vietnam, a 3D "VIỆT NAM" the camera flies through
function sceneGlobe() {
  // one continuous dive: the globe turns to Vietnam and grows until it is the flat map's Vietnam (s = 0.78 px/km,
  // R = 6371 × 0.78), then the flat map fades in under it. A radial zoom blur rides the fast part.
  const T = SEC.open, u = seg(TT, 0, T - 0.7), zu = EZ.io(seg(TT, 0.4, T - 0.7)) ** 1.6;
  const R = Math.exp(lerp(Math.log(380), Math.log(6371 * 0.78), zu));
  const lon = lerp(84, 105.9, EZ.io(seg(TT, 0, T - 0.8))), lat = lerp(6, 19.88 - 380 / 111.32, EZ.io(seg(TT, 0, T - 0.8)));
  const cy = lerp(H * 0.5, GAY(), EZ.io(u));
  ctx.fillStyle = '#01030a'; ctx.fillRect(0, 0, W, H); fxStars();
  const hand = seg(TT, T - 0.7, T);
  if (hand > 0) { GC = gCamAt(CAMKEYS, T); gGround({ dim: 0.28 }); gRegion(GEO.vn, { line: '#ffffff', lw: 2.5, la: 0.85 }); }
  ctx.save(); ctx.globalAlpha = 1 - hand;
  if (hand < 1) fxGlobe(W / 2, cy, R, lon, lat, { vn: seg(TT, 0.9, 1.6) });
  ctx.restore();
  // radial zoom blur: the frame redrawn a little larger a few times, faint
  const zb = seg(TT, 1.3, 2.1) * (1 - seg(TT, T - 1.1, T - 0.7));
  if (zb > 0) { const cv = ctx.canvas; ctx.save(); for (let i = 1; i <= 4; i++) { const s = 1 + 0.025 * i * zb; ctx.globalAlpha = 0.22; ctx.drawImage(cv, W / 2 - W * s / 2, cy - cy * s, W * s, H * s); } ctx.restore(); }
  // "VIỆT NAM" stands on the globe over the country, grows with the dive and is passed through (fades before it outgrows the frame)
  const vk = seg(TT, 0.9, 1.4);
  if (vk > 0 && hand < 1) {
    const l0 = lon * Math.PI / 180, p0 = lat * Math.PI / 180, l = 106 * Math.PI / 180, p = 15.5 * Math.PI / 180;
    const x = W / 2 + R * Math.cos(p) * Math.sin(l - l0), y = cy - R * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l - l0));
    const size = clamp(R * 0.16, 70, 400), wEst = size * 5.2, fade = clamp((1000 - wEst) / 300);
    if (fade > 0) { ctx.save(); ctx.translate(clamp(x, wEst / 2 + 30, W - wEst / 2 - 30), y - size * 0.9); ctx.transform(1, 0, -0.18, 0.86, 0, 0);
      fx3DText('VIỆT NAM', 0, 0, size, '#ffffff', '#5a3a12', { face2: '#ffe2b0', depth: size * 0.12, dx: 0.4, dy: 1, alpha: EZ.o3(vk) * fade }); ctx.restore(); }
  }
}
// ---- 1b the hook: the district filled with the sea photo, the claim revealed letter by letter
function sceneHook() {
  GC = gCamAt(CAMKEYS, TT); gGround({ dim: 0.5 });
  hlOutline({ fill: true, fa: 0.3 * ev(T0('hook'), 0.8), lw: 6, glow: 24, frac: ev(SEC.hook, 1.6), len: gRingLen(GEO.hl) + 20 });
  const [hx, hy] = gSP(HLC); gPulse(hx, hy, SEC.hook + 0.4, G.orange, 18);
  fxBlurText('CHƯA ĐẦY', 70, 330, 52, '#fff', VW('hook', 0.08), { italic: true });
  fxBlurText('150 KM²', 70, 450, 120, G.orange, VW('hook', 0.25));
  fxBlurText('DẤU VẾT', 70, 1150, 52, '#fff', VW('hook', 0.62), { italic: true });
  fxBlurText('4.000 NĂM', 70, 1280, 130, G.yellow, VW('hook', 0.8));
}

// ---- chapter cards: a 3D chapter word on paper, the part number in a box
function sceneChapter(n, word, t0) {
  fxPaper(PAPER, true);
  const k = EZ.o3(ev(t0, 0.5)), s = 1.25 - 0.25 * k;
  fxPill('PHẦN ' + n, W / 2 - 70, 760, 40, '#15100a', G.orange, k);
  ctx.save(); ctx.translate(W / 2 - 70, 900); ctx.scale(s, s); fx3DText(word, 0, 0, 150, '#ffffff', '#7a4a16', { face2: '#ffe9c4', depth: 14, alpha: k }); ctx.restore();
}

// ---- 2 location on a tilted map (2): neighbours named with flags, the distance as an oval (8)
function secLoc() {
  const t = SEC.loc, k = EZ.io(seg(TT, t, t + 1.6)) * (1 - EZ.io(seg(TT, T1('loc2') + 0.4, T1('loc2') + 1.6)));
  fxTilted(0.55 * k, () => {
    gGround({ dim: 0.28 });
    for (const n of ['Nga Sơn', 'Hà Trung', 'Hoằng Hóa', 'Thanh Hóa', 'Bỉm Sơn']) { const d = DIST(n); if (d) gRegion(d.r, { line: 'rgba(255,255,255,0.55)', lw: 2 }); }
    const nb = [['Nga Sơn', G.teal, VW('loc2', 0.12)], ['Hà Trung', G.teal, VW('loc2', 0.27)], ['Hoằng Hóa', G.red, VW('loc2', 0.55)]];
    for (const [n, c, tc] of nb) { const d = DIST(n), kk = popS(tc); if (kk > 0) gRegion(d.r, { fill: c, fa: 0.32 * kk, line: c, lw: 3, la: kk }); }
    hlOutline({ fill: true, fa: 0.35, frac: ev(t, 1.4), len: gRingLen(GEO.hl) + 20 });
  });
  const [cx, cy] = gSPt(TPTH), [hx, hy] = gSPt(COMM('Hậu Lộc').c);
  gPin(cx, cy, { pop: popS(t + 0.6) });
  gFlag(cx, cy - 50, 'TP. THANH HÓA', { bg: '#ffffff', size: 32, pop: popS(t + 0.7), up: 20 });
  fxOval([cx, cy], [hx, hy], '~25 KM', ev(VW('loc1', 0.45), 1.0), G.yellow);
  const fl = [['NGA SƠN', DIST('Nga Sơn').c, G.teal, VW('loc2', 0.12), 0], ['HÀ TRUNG', DIST('Hà Trung').c, G.teal, VW('loc2', 0.27), -40], ['HOẰNG HÓA', [-4.5, 2.2], G.red, VW('loc2', 0.55), 120], ['BIỂN ĐÔNG', [13.5, -9], '#ffffff', VW('loc2', 0.85), -60]];
  for (const [n, p, c, tc, side] of fl) { const [x, y] = gSPt(p); gFlag(clamp(x, 120, 880), clamp(y, 420, 1250), n, { bg: c, fg: c === '#ffffff' ? '#15100a' : '#fff', size: 32, pop: popS(tc), side }); }
  gFlag(hx, hy, 'HẬU LỘC', { size: 40, pop: popS(t + 0.3), up: 60 });
}

// ---- 3 the area as a raised slab (6)
function secNum() {
  const k = EZ.o3(ev(T0('num1') - 0.1, 1.0));
  fxSlab(GEO.hl, 46, k);
  const k1 = popS(T0('num1') + 0.4);
  if (k1 > 0) {
    const area = Math.round(143.67 * EZ.o3(ev(T0('num1') + 0.4, 1.4)) * 100) / 100;
    fxPill('DIỆN TÍCH', 80, 300, 36, '#15100a', G.orange, k1, { align: 'left' });
    fx3DText(area.toFixed(2).replace('.', ',') + ' KM²', 80, 420, 104, '#ffffff', '#7a4a16', { align: 'left', depth: 9, face2: '#ffe9c4' });
  }
}

// ---- 3b the census on paper: a line chart and a pictogram row (18, 21)
function scenePop() {
  GC = gCamAt(CAMKEYS, TT); gGround({ dim: 0.86 });
  const t = SEC.pop, u = EZ.io(seg(TT, VW('num2', 0.25), VW('num2', 0.8)));
  fxBlurText('DÂN SỐ HẬU LỘC', 70, 320, 56, G.orange, t + 0.1, { italic: true });
  fxBlurText('theo tổng điều tra', 70, 370, 32, '#fff', t + 0.4, { weight: 700 });
  // the big number counts up while the year ticks from 2009 to 2019
  const v = Math.round(lerp(165742, 176418, u)), yr = Math.round(lerp(2009, 2019, u));
  if (TT > VW('num2', 0.15)) {
    const k = EZ.o3(ev(VW('num2', 0.15), 0.5));
    fx3DText(v.toLocaleString('de-DE'), 70, 520, 150, '#ffffff', '#7a4a16', { align: 'left', depth: 12, face2: '#ffe9c4', alpha: k });
    fxPill('NĂM ' + yr, 70, 640, 36, '#15100a', G.orange, k, { align: 'left' });
    gText('người', 330, 652, 34, '#fff', { weight: 800, alpha: k });
  }
  // a glowing line with a light running along it
  const x0 = 110, x1 = 930, y0 = 1010, y1 = 760, P = [[x0, y0], [x1, y1]];
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2; for (let j = 0; j <= 3; j++) { ctx.beginPath(); ctx.moveTo(x0, 720 + j * 100); ctx.lineTo(x1, 720 + j * 100); ctx.stroke(); } ctx.restore();
  if (u > 0) {
    const xe = lerp(x0, x1, u), ye = lerp(y0, y1, u);
    ctx.save(); const g = ctx.createLinearGradient(0, y1, 0, 1020); g.addColorStop(0, 'rgba(243,154,43,0.55)'); g.addColorStop(1, 'rgba(243,154,43,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, 1020); ctx.lineTo(x0, y0); ctx.lineTo(xe, ye); ctx.lineTo(xe, 1020); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = G.orange; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.shadowColor = G.orange; ctx.shadowBlur = 30; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(xe, ye); ctx.stroke();
    ctx.shadowBlur = 40; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(xe, ye, 14 + 4 * Math.sin(TT * 8), 0, TAU); ctx.fill(); ctx.restore();
  }
  [[x0, y0, '2009', '165.742', VW('num2', 0.25)], [x1, y1, '2019', '176.418', VW('num2', 0.8)]].forEach(([x, y, l, n, at]) => { const k = ev(at, 0.3); if (k <= 0) return;
    gText(l, x, 1070, 34, '#fff', { align: x > 500 ? 'right' : 'left', weight: 900, alpha: k }); gText(n, x, y - 34, 38, G.yellow, { align: x > 500 ? 'right' : 'left', weight: 900, alpha: k }); });
  if (TT > VW('num2', 0.82)) fxPill('+6,4% / 10 NĂM', 930, 1150, 34, '#fff', '#2f9e4a', popS(VW('num2', 0.82)), { align: 'right' });
  // pictograms: one figure = 10.000 people
  gText('1 HÌNH = 10.000 NGƯỜI', 110, 1150, 26, 'rgba(255,255,255,0.75)', { weight: 800 });
  fxPeople(130, 1250, 18, 18, 0.95, '#cfd6dc', seg(TT, VW('num2', 0.25), VW('num2', 0.85)), { hiFrom: 17, hi: G.orange });
}

// ---- the history timeline on paper: year boxes joined by elbow arrows (23)
function sceneTimeline() {
  // as in the references: a dark olive board, white year boxes, thick white elbow arrows, framed pictures beside
  ctx.fillStyle = '#2a2a24'; ctx.fillRect(0, 0, W, H); fxPaper('#2a2a24', true);
  const t = SEC.tl, dt = (SEC.pre - t - 0.6) / 4;
  fxPill('PHẦN 2', 80, 300, 30, '#15100a', G.orange, EZ.o3(ev(t, 0.3)), { align: 'left' });
  fx3DText('LỊCH SỬ', 230, 300, 60, '#ffffff', '#6b5a45', { align: 'left', depth: 5, alpha: EZ.o3(ev(t, 0.3)) });
  const items = [['~4.000 NĂM TRƯỚC', 'Di chỉ', 'văn hóa Hoa Lộc', 'pot'], ['248', 'Khởi nghĩa', 'Bà Triệu', 'den_ba_trieu.jpg'], ['1821', 'Vua Minh Mạng', 'đặt tên Hậu Lộc', null], ['1964', 'Hải quân phục kích', 'tàu Mỹ từ Hòn Nẹ', 'fs_maddox.jpg']];
  const bw = 330, bh = 104;
  items.forEach(([yr, c1, c2, pic], i) => {
    const x = 80 + i * 120, y = 450 + i * 220, at = t + 0.2 + i * dt, k = EZ.o3(ev(at, 0.35)); if (k <= 0) return;
    if (i > 0) { const px = 80 + (i - 1) * 120, py = 450 + (i - 1) * 220, ka = ev(at - 0.25, 0.3); if (ka > 0) {
      const P = [[px + 40, py + bh + 10], [px + 40, y + bh / 2], [x - 18, y + bh / 2]], L = polyLen(P);
      ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 9; ctx.lineJoin = 'miter'; ctx.setLineDash([L * ka, L + 10]); ctx.beginPath(); P.forEach(([a, b], j) => (j ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.stroke(); ctx.restore();
      if (ka >= 1) { ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x - 2, y + bh / 2); ctx.lineTo(x - 30, y + bh / 2 - 18); ctx.lineTo(x - 30, y + bh / 2 + 18); ctx.closePath(); ctx.fill(); ctx.restore(); } } }
    gText(c1, x, y - 44, 26, '#fff', { weight: 800, alpha: k }); gText(c2, x, y - 14, 28, G.orange, { weight: 900, alpha: k });
    ctx.save(); ctx.globalAlpha = k; ctx.translate(x + bw / 2, y + bh / 2); ctx.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k); ctx.translate(-x - bw / 2, -y - bh / 2);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 18; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 12); ctx.fill(); ctx.restore();
    gText(yr, x + bw / 2, y + bh / 2 + (yr.length > 6 ? 11 : 19), yr.length > 6 ? 30 : 60, '#15100a', { align: 'center', weight: 900, shadow: false, alpha: k });
    if (pic) { const fx0 = x + bw + 30, fy0 = y - 40, fw = Math.min(220, 920 - fx0), fh = 170; if (fw > 120) {
      ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 18; ctx.fillRect(fx0 - 6, fy0 - 6, fw + 12, fh + 12); ctx.restore();
      if (pic === 'pot') { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#efe6d4'; ctx.fillRect(fx0, fy0, fw, fh); ctx.restore(); fxBatBong(fx0 + fw / 2, fy0 + fh / 2 - 6, 0.5, k); }
      else { const img = asset(pic); if (img) { ctx.save(); ctx.globalAlpha = k; ctx.beginPath(); ctx.rect(fx0, fy0, fw, fh); ctx.clip(); if (pic.includes('maddox')) ctx.filter = 'grayscale(1)'; const sc = Math.max(fw / img.naturalWidth, fh / img.naturalHeight); ctx.drawImage(img, fx0 + (fw - img.naturalWidth * sc) / 2, fy0 + (fh - img.naturalHeight * sc) / 2, img.naturalWidth * sc, img.naturalHeight * sc); ctx.restore(); } } } }
  });
}
// ---- 4a the Hoa Lộc culture: a big pin with an icon (9), the bowl and rings (illustration)
function secPre() {
  hlOutline({ fa: 0.08 });
  const c = COMM('Hoa Lộc'); gRegion(c.r, { fill: G.yellow, fa: 0.25, line: G.yellow, lw: 4, glow: 12 });
  const [x, y] = gSP(HOA); gPulse(x, y, T0('pre1'), G.yellow, 20);
  fxBigPin(x, y, popS(VW('pre1', 0.3)), '#8a4b22', () => iconPot('#fff'));
  gFlag(x, y - 190, 'DI CHỈ VĂN HÓA HOA LỘC', { bg: G.yellow, size: 36, pop: popS(VW('pre1', 0.55)), up: 10 });
  const k = ev(T0('pre2') - 0.2, 0.6);
  if (k > 0) {
    gScrim(760, 1380, 0.8 * k);
    fxTarget(300, 1060, 250, seg(TT, T0('pre2') - 0.2, T0('pre2') + 1.2), { colors: { orbit: 'rgba(255,220,150,0.6)', disc: 'rgba(60,40,20,0.85)', ring: G.yellow, thin: 'rgba(255,255,255,0.5)', core: 'rgba(0,0,0,0)' } });
    fxBatBong(300, 1040, 0.95, EZ.o3(k));
    gText('BÁT BỒNG GỐM', 560, 930, 40, '#fff', { weight: 900, alpha: k });
    if (TT > VW('pre2', 0.35)) fx3DText('~4.000', 560, 1060, 84, G.yellow, '#7a4a16', { align: 'left', depth: 7, alpha: ev(VW('pre2', 0.35), 0.3) });
    if (TT > VW('pre2', 0.4)) gText('NĂM TUỔI', 562, 1130, 34, '#fff', { weight: 900, alpha: ev(VW('pre2', 0.4), 0.3) });
    fxPill('BẢO VẬT QUỐC GIA · 2026', 540, 1220, 26, '#15100a', G.yellow, popS(VW('pre2', 0.75)), { align: 'left' });
  }
}

// ---- 5b the quote: the temple photo from black-and-white to colour, out of focus to sharp (11); serif type (16)
function sceneQuote() {
  const t = SEC.quote, c = seg(TT, t + 0.3, t + 2.6), b = 1 - seg(TT, t, t + 1.6);
  fxPhotoPan('fs_ba_trieu2.jpg', t, SEC.tri2, 0.55, 0.45, { filter: `grayscale(${1 - c}) blur(${b * 14}px) brightness(${0.75 + 0.15 * c})` });
  ctx.save(); const g = ctx.createLinearGradient(0, 300, 0, 1400); g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0.75)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  gText('“', 60, 520, 260, G.orange, { weight: 700, font: SERIF });
  const L = ['Tôi muốn cưỡi cơn gió mạnh,', 'đạp luồng sóng dữ,', 'chém cá kình ở biển Đông.'], at = [VW('quote', 0.3), VW('quote', 0.58), VW('quote', 0.78)];
  L.forEach((s, i) => fxBlurText(s, 80, 640 + i * 96, 62, i === 2 ? '#ffd08a' : '#fff', at[i], { italic: true, weight: 600, font: SERIF, cps: 36 }));
  if (TT > VW('quote', 0.15)) gText('— Lời Bà Triệu, theo tương truyền', 80, 980, 34, 'rgba(255,255,255,0.85)', { italic: true, weight: 500, alpha: ev(VW('quote', 0.15), 0.4) });
}

// ---- 5d two national heritages as concentric rings (23)
function sceneRings() {
  // the references' flat target on paper: the number on top with an orange tag, the two heritages as satellites
  fxPaper(); const t = SEC.rings;
  fx3DText('2', 90, 360, 190, '#2a1a0a', '#b5530c', { align: 'left', depth: 8, alpha: EZ.o3(ev(t, 0.3)) });
  fxPill('DI SẢN CẤP QUỐC GIA', 230, 340, 38, '#15100a', G.orange, popS(t + 0.2), { align: 'left' });
  gText('ở cùng một di tích', 236, 410, 30, '#5a4a38', { weight: 700, shadow: false, alpha: ev(t + 0.4, 0.3) });
  const cx = CX, cy = 1010, R = 270;
  const k = fxTarget(cx, cy, R, seg(TT, t + 0.2, t + 1.6));
  if (k > 0) { ctx.save(); ctx.translate(cx, cy - 6); ctx.scale(2.6 * k, 2.6 * k); iconTemple('#fff'); ctx.restore(); }
  gText('ĐỀN BÀ TRIỆU', cx, cy + R * 0.42 * 0.6 + 40, 30, '#fff', { align: 'center', weight: 900, alpha: k });
  // two satellites joined to the target
  [[230, 600, '2014', 'Di tích quốc gia', 'đặc biệt', G.red, t + 0.9], [710, 600, '2023', 'Lễ hội: di sản', 'phi vật thể', '#c98a00', VW('tri4', 0.3)]].forEach(([x, y, yr, l1, l2, c, at]) => {
    const a = EZ.o3(ev(at, 0.45)); if (a <= 0) return;
    const ex = cx + (x - cx) * 0.28, ey = cy - R * 0.95;
    ctx.save(); ctx.strokeStyle = 'rgba(90,80,65,0.8)'; ctx.lineWidth = 3; ctx.globalAlpha = a; ctx.beginPath(); ctx.moveTo(x, y + 90); ctx.lineTo(lerp(x, ex, a), lerp(y + 90, ey, a)); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([9, 8]); ctx.strokeStyle = 'rgba(90,80,65,0.7)'; ctx.lineWidth = 3; ctx.fillStyle = '#f4efe6'; ctx.beginPath(); ctx.arc(x, y, 90 * a, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
    gText(yr, x, y + 18, 50, c, { align: 'center', weight: 900, shadow: false, alpha: a });
    gText(l1, x, y + 140, 28, '#2a1a0a', { align: 'center', weight: 800, shadow: false, alpha: a }); gText(l2, x, y + 174, 28, '#2a1a0a', { align: 'center', weight: 800, shadow: false, alpha: a });
  });
}
// ---- 8a the photo grid of the fishing village (13)
function sceneGrid() {
  fxPaper(PAPER, true); const t = SEC.grid;
  fxPill('PHẦN 3', 70, 290, 32, '#15100a', G.orange, EZ.o3(ev(t, 0.4)), { align: 'left' });
  fx3DText('VĂN HÓA', 260, 290, 64, '#fff', '#7a4a16', { align: 'left', depth: 6, alpha: EZ.o3(ev(t, 0.4)) });
  fxGrid([
    { img: 'g_harbour.jpg', label: 'THUYỀN CÁ · DIÊM PHỐ' }, { img: 'g_dryfish.jpg', label: 'PHƠI CÁ · DIÊM PHỐ', c: G.teal },
    { img: 'g_beach.jpg', label: 'BỜ BIỂN NGƯ LỘC', c: G.teal }, { img: 'g_street.jpg', label: 'PHỐ NGƯ LỘC' },
  ], t + 0.2, { x: 60, y: 360, w: 840, h: 940, stagger: 0.35 });
}

// ---- 9 documents (24)
function sceneDoc(name, t0, tHl, o = {}) {
  if (o.bg) { const img = asset(o.bg); if (img) { const sc = Math.max(W / img.naturalWidth, H / img.naturalHeight) * 1.1; ctx.save(); ctx.filter = 'blur(18px) brightness(0.35) saturate(0.7)'; ctx.drawImage(img, (W - img.naturalWidth * sc) / 2, (H - img.naturalHeight * sc) / 2, img.naturalWidth * sc, img.naturalHeight * sc); ctx.restore(); } }
  else { ctx.fillStyle = '#16181b'; ctx.fillRect(0, 0, W, H); fxPaper('#16181b', true); }
  const k = EZ.o3(ev(t0, 0.4));
  iconDoc(CX, 300, 1.3 * k, G.orange);
  if (o.title) gText(o.title, CX, 400, 46, '#fff', { align: 'center', weight: 900, alpha: k });
  if (o.title2) gText(o.title2, CX, 450, 34, G.orange, { align: 'center', weight: 900, alpha: k });
  fxDoc(name.replace('doc_', ''), t0, tHl, { dur: o.dur ?? 5, zoom: o.zoom });
}
// ---- 10b density as thermometers (22)
function secDens() {
  const t = PT.ngu[1];
  hlOutline({ fa: 0.06 }); const [px, py] = gSP(NGULOC); gPulse(px, py, t, G.red, 16); gPin(px, py, { color: G.red, dot: '#fff', r: 24, pop: popS(t + 0.1) });
  gFlag(px, py - 64, 'NGƯ LỘC', { bg: G.red, fg: '#fff', size: 34, pop: popS(t + 0.2), up: 20 });
  gScrim(560, 1400, 0.82);
  gTitle([{ text: 'MẬT ĐỘ DÂN SỐ', italic: true, color: G.orange, size: 50 }, { text: 'NGƯỜI / KM²', size: 32, color: '#fff' }], 80, 650, t + 0.1, { cps: 40 });
  const rows = [
    { l: 'NGƯ LỘC', v: 36000, c: G.red, txt: '>36.000', at: VW('cul3', 0.55) },
    { l: 'MONACO', v: 19500, c: '#e8e2d6', txt: '~19.500', at: VW('cul3', 0.75) },
    { l: 'CẢ HẬU LỘC', v: 1228, c: G.orange, txt: '1.228', at: VW('cul3', 0.88) },
  ];
  rows.forEach((r, i) => fxThermo(220 + i * 270, 840, 1180, r.v, 36000, r.c, r.l, r.txt, seg(TT, r.at, r.at + 1.0)));
}
