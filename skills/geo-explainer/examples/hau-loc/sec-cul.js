// ---- 3 Văn hoá: Cầu Ngư and the Long Châu boat, the densest village, mắm tôm; then the five new communes
function longChau(x, y, s, a = 0) {   // the dragon boat (screen space): a red hull, a dragon head, flags
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(255,170,60,0.8)'; ctx.shadowBlur = 24;
  ctx.fillStyle = '#d2302a'; ctx.beginPath(); ctx.moveTo(-90, -6); ctx.quadraticCurveTo(0, 30, 92, -6); ctx.lineTo(80, 8); ctx.quadraticCurveTo(0, 34, -80, 8); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = G.yellow; ctx.fillRect(-60, -30, 120, 22);
  ctx.fillStyle = '#d2302a'; ctx.beginPath(); ctx.moveTo(-40, -30); ctx.lineTo(0, -58); ctx.lineTo(40, -30); ctx.closePath(); ctx.fill();
  ctx.fillStyle = G.yellow; ctx.beginPath(); ctx.moveTo(88, -6); ctx.quadraticCurveTo(112, -40, 96, -54); ctx.quadraticCurveTo(118, -48, 122, -30); ctx.quadraticCurveTo(110, -22, 100, -6); ctx.fill();   // dragon head
  for (let i = 0; i < 3; i++) { const fx = -50 + i * 50, w = Math.sin(TT * 7 + i) * 6; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(fx, -30); ctx.lineTo(fx, -84); ctx.stroke(); ctx.fillStyle = [G.red, G.yellow, G.teal][i]; ctx.beginPath(); ctx.moveTo(fx, -84); ctx.lineTo(fx + 30 + w, -76); ctx.lineTo(fx, -66); ctx.fill(); }
  ctx.restore();
}
function secCul() {
  const t = SEC.cul;
  hlOutline({ fa: 0.06 });
  // Ngư Lộc as a point: rings and a pin (no drawn boat, no commune patch)
  const [px, py] = gSP(NGULOC); gPulse(px, py, t + 0.3, G.teal, 18);
  gPin(px, py, { color: G.teal, dot: '#fff', r: 26, pop: popS(t + 0.4) });
  gFlag(px, py - 70, 'LỄ HỘI CẦU NGƯ', { bg: G.teal, fg: '#fff', size: 46, sub: 'NGƯ LỘC · CUỐI THÁNG HAI ÂM LỊCH', pop: popS(VW('cul1', 0.3)), up: 30, side: -60 });
  // rays from the village to photos of it (9)
  const thumbs = [['g_harbour.jpg', 110, 300, VW('cul1', 0.15)], ['g_dryfish.jpg', 600, 280, VW('cul1', 0.35)], ['g_beach.jpg', 620, 1040, VW('cul1', 0.55)]];
  const [nx, ny] = gSP(NGULOC);
  for (const [img, x, y, at] of thumbs) { const k = EZ.o3(ev(at, 0.5)); if (k <= 0) continue; const w = 320, h = 210, tx = x + w / 2, ty = y + h / 2;
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.shadowColor = '#fff'; ctx.shadowBlur = 10; ctx.globalAlpha = k; ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(lerp(nx, tx, k), lerp(ny, ty, k)); ctx.stroke(); ctx.restore();
    gCallPhoto(img, tx, ty + h / 2 + 8, { pop: k, w, h, up: 8, label: '', t0: at }); }
}
function secMam() {
  const t = SEC.mam;
  hlOutline({ fa: 0.12 });
  // moi (tiny shrimp) shimmering in the coastal sea
  { const R = RNG('moi'); for (let i = 0; i < 90; i++) { const p = [8 + R.f() * 8, -14 + R.f() * 12], [x, y] = gSP([p[0] + Math.sin(TT * 0.8 + i) * 0.3, p[1] + Math.cos(TT * 0.6 + i) * 0.2]); ctx.save(); ctx.globalAlpha = 0.5 + 0.4 * Math.sin(TT * 5 + i); ctx.fillStyle = '#f2c6b0'; ctx.beginPath(); ctx.ellipse(x, y, 7, 3, Math.sin(i), 0, TAU); ctx.fill(); ctx.restore(); } }
  // the photo (a labelled AI illustration: no free photo of Hậu Lộc's mắm tôm exists)
  gPhoto('mam_tom_ai.jpg', 80, 740, 860, 490, { t0: T0('cul4') + 0.2, color: '#c76b9a', cap: TT > VW('cul4', 0.3) ? 'MẮM TÔM HẬU LỘC · TỪ CON MOI BIỂN' : 'MẮM TÔM HẬU LỘC', tag: 'ẢNH MINH HOẠ AI', credit: 'Ảnh minh hoạ tạo bằng AI, không phải ảnh thật', fy: 0.5 });
  if (TT > VW('cul4', 0.7)) { gText('CHỈ DẪN ĐỊA LÝ', 80, 1320, 50, G.orange, { weight: 900, italic: true, alpha: ev(VW('cul4', 0.7), 0.3) }); gText('TỪ NĂM 2010', 80, 1400, 66, '#fff', { weight: 900, alpha: ev(VW('cul4', 0.72), 0.3) }); }
}
const NAMEAT = [0.2, 0.37, 0.53, 0.69, 0.86].map((f) => () => VW('new2', f));   // when new2 names each commune
function secSplit() {
  const t = HIT;
  // the five new communes push apart a little, then settle (the payoff hit)
  const kick = Math.exp(-Math.max(0, TT - t) * 2.2) * (TT >= t ? 1 : 0), push = 0.5 * kick + 0.12 * clamp((TT - t) / 0.4) * (TT >= t ? 1 : 0);
  const lift = seg(TT, SEC.split + 4.6, SEC.split + 5.8);
  NEW5.forEach((n, i) => {
    const g = GRP(n.n), k = TT >= t ? 1 : 0, dx = (g.c[0] - HLC[0]) * push * (1 - lift), dy = (g.c[1] - HLC[1]) * push * (1 - lift);
    const R = g.r.map((r) => r.map((p) => [p[0] + dx, p[1] + dy]));
    const fl = TT > T0('new2') - 0.4 ? Math.exp(-Math.max(0, TT - NAMEAT[i]()) * 3) * (TT >= NAMEAT[i]() ? 1 : 0) : 0;
    if (k) gRegion(R, { fill: n.c, fa: 0.55 + 0.4 * fl, line: fl > 0.05 ? '#ffffff' : n.c, lw: 4 + 4 * fl, glow: 16 + 20 * fl });
  });
  NEW5.forEach((n, i) => {
    const g = GRP(n.n), k = TT >= t ? 1 : 0, dx = (g.c[0] - HLC[0]) * push * (1 - lift), dy = (g.c[1] - HLC[1]) * push * (1 - lift);
    if (k) { const [x, y] = gSP([g.c[0] + dx, g.c[1] + dy]); gFlag(x, y, n.n.toUpperCase(), { bg: n.c, fg: n.c === G.lime || n.c === G.orange ? '#15100a' : '#fff', size: 34, pop: popS(t + 0.25 + i * 0.22), up: n.up ?? 30, side: n.side ?? 0 }); }
  });
  if (TT < t) hlOutline({ fill: true, fa: 0.35, glow: 26 });
  else hlOutline({ fa: 0, la: 1 - clamp((TT - t) / 0.6), glow: 30 });
  if (TT > T0('new1') && TT < T0('new2') - 0.2) gTitle([{ text: '22 XÃ, THỊ TRẤN', italic: true, color: '#fff', size: 52 }, { text: '→ 5 XÃ MỚI', size: 96, color: G.orange }], 70, 330, T0('new1') + 1.2, { cps: 30 });
  // 22 → 5 as a flow diagram (23) while the line says it
  const fk = ev(VW('new1', 0.75), 0.4);
  if (fk > 0 && TT < T0('new2') - 0.2) {
    gScrim(860, 1380, 0.8 * fk);
    ctx.save(); ctx.globalAlpha = fk; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(70, 1000, 230, 240, 14); ctx.fill(); ctx.restore();
    gText('22', 185, 1130, 110, '#15100a', { align: 'center', weight: 900, shadow: false, alpha: fk }); gText('XÃ, THỊ TRẤN', 185, 1190, 28, '#15100a', { align: 'center', weight: 900, shadow: false, alpha: fk });
    NEW5.forEach((n, i) => { const y = 920 + i * 84, k = ev(VW('new1', 0.8) + i * 0.15, 0.3); fxElbow(300, 1120, 560, y + 34, n.c, k);
      if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = n.c; ctx.beginPath(); ctx.roundRect(570, y, 360, 68, 10); ctx.fill(); ctx.restore();
        gText(n.n.toUpperCase(), 590, y + 45, 32, n.fg ?? '#fff', { weight: 900, shadow: false, alpha: k }); gText(String(n.units), 910, y + 45, 34, n.fg ?? '#fff', { align: 'right', weight: 900, shadow: false, alpha: k }); } });
  }
  // the share of old units as a big tilted pie standing on the map (19); each wedge arrives as its name is spoken
  if (TT > T0('new2') - 0.4) {
    const k = ev(T0('new2') - 0.4, 0.4);
    if (TT > T0('new2') + 0.8) gText('SỐ XÃ, THỊ TRẤN CŨ GỘP LẠI', CX, 1300, 36, '#fff', { align: 'center', weight: 900, alpha: ev(T0('new2') + 0.8, 0.4) });
    fxPie3D(CX, 1020, 300, NEW5.map((n, i) => ({ v: n.units, c: n.c, label: n.n.toUpperCase(), sub: n.units + ' đơn vị', fg: n.fg ?? '#fff', at: NAMEAT[i]() })), { sy: 0.58, depth: 40 });
  }
}
function secEnd() {
  const t = SEC.end;
  gRegion(TH_PROV.r, { line: G.orangeL, lw: 2, la: 0.7 * ev(t, 1) });
  NEW5.forEach((n) => gRegion(GRP(n.n).r, { fill: n.c, fa: 0.5 * (1 - ev(t + 1, 1.5)) }));
  hlOutline({ fill: true, fa: 0.45, glow: 22, lw: 4 });
  gRegion(GEO.vn, { line: '#ffffff', lw: 2, la: ev(DURATION - 2.6, 1.5) * 0.8 });
  const [hx, hy] = gSP(HLC); gPulse(hx, hy, t + 0.5, G.orange, 14);
  gTitle([{ text: 'HẬU LỘC', size: 150, gap: 0.62 }, { text: 'BÊN BỜ BIỂN XỨ THANH', italic: true, color: G.orange, size: 56 }], 70, 470, T0('end1') + 0.1, { cps: 30 });
}
