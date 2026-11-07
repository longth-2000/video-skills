// ---- 2 Lịch sử: the names through the dynasties, Bà Triệu, Hòn Nẹ, the 51 relics
const NAMES = [
  { yr: 'BẮC THUỘC', n: 'DƯ PHÁT', sub: 'quận Cửu Chân', at: () => VW('his1', 0.45) },
  { yr: '1428', n: 'THUẦN HỰU', at: () => VW('his2', 0.55) },
  { yr: '1673', n: 'THUẦN LỘC', at: () => VW('his2', 0.75) },
  { yr: '1802', n: 'PHONG LỘC', at: () => VW('his2', 0.92) },
  { yr: '1821', n: 'HẬU LỘC', at: () => VW('his3', 0.55), main: true },
];
function secHis() {
  const cur = NAMES.filter((e) => TT >= e.at()).pop();
  const final = cur && cur.main;
  gRegion(GEO.hl, { fill: final ? G.orange : '#d9c7a0', fa: final ? 0.4 : 0.18, line: final ? G.orange : '#e8dcc0', lw: 5, glow: final ? 22 : 6 });
  // the district's name on the map changes with each era (old parchment colour until it becomes Hậu Lộc)
  if (cur) { const [x, y] = gSP(HLC); gFlag(x, y, cur.n, { bg: final ? G.orange : '#e8dcc0', size: final ? 58 : 50, pop: popS(cur.at()), up: 40, sub: cur.sub }); }
  gTitle([{ text: 'TÊN ĐẤT QUA CÁC TRIỀU ĐẠI', italic: true, color: G.orange, size: 50 }], 70, 330, SEC.his + 0.1, { cps: 40 });
  // a timeline along the bottom
  gScrim(920, 1380, 0.7);
  const x0 = 110, x1 = 850, y = 1060;
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + (x1 - x0) * EZ.o2(ev(SEC.his, 1.2)), y); ctx.stroke(); ctx.restore();
  NAMES.forEach((e, i) => {
    const x = x0 + (x1 - x0) * i / (NAMES.length - 1), k = popS(e.at()); if (k <= 0) return;
    const c = e.main ? G.orange : '#e8dcc0';
    ctx.save(); ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = e.main ? 22 : 0; ctx.beginPath(); ctx.arc(x, y, 14 * k, 0, TAU); ctx.fill(); ctx.restore();
    gText(e.yr, x, y - 38, e.main ? 46 : 32, c, { align: 'center', weight: 900, alpha: k });
    const parts = e.n.split(' ');
    parts.forEach((p, j) => gText(p, x, y + 62 + j * 40, e.main ? 40 : 30, '#fff', { align: 'center', weight: 800, alpha: k }));
  });
  if (TT > VW('his3', 0.75)) gText('vua Minh Mạng đặt tên', x1, 1300, 34, 'rgba(255,255,255,0.85)', { align: 'right', weight: 600, italic: true, alpha: ev(VW('his3', 0.75), 0.4) });
}
function secTri() {
  const t = SEC.tri, [bx, by] = gSP(BATRIEU);
  gRegion(COMM('Triệu Lộc').r, { line: G.red, lw: 4, fill: G.red, fa: 0.16, glow: 10 });
  hlOutline({ fa: 0 });
  gPulse(bx, by, t + 0.8, G.red, 26);
  gPin(bx, by, { color: G.red, dot: '#fff', r: 30, pop: popS(t + 0.7) });
  gCallPhoto('den_ba_trieu.jpg', bx, by - 66, { pop: popS(VW('tri1', 0.3)), t0: VW('tri1', 0.3), w: 540, h: 350, up: 30, label: 'ĐỀN BÀ TRIỆU', sub: 'NÚI GAI · TRIỆU LỘC', size: 44, subColor: '#ffb3a8', credit: 'Ảnh: Mai Trung Dũng · Wikimedia Commons', fy: 0.4 });
  if (TT > VW('tri1', 0.7)) { const n = Math.round(lerp(0, 248, EZ.o3(ev(VW('tri1', 0.7), 1.0)))); gScrim(940, 1360, 0.55); gText('NĂM', 80, 1060, 44, G.red, { weight: 900, italic: true }); gText(String(n), 80, 1230, 180, '#fff', { weight: 900 }); gText('khởi nghĩa của Bà Triệu', 80, 1290, 36, 'rgba(255,255,255,0.85)', { weight: 600 }); }
}
function secMod() {
  const t = SEC.mod;
  hlOutline({ fa: 0 });
  // Hòn Nẹ: about 1 km², drawn as a small rocky island
  const [ix, iy] = gSP(HONNE), r = Math.max(10, 0.55 * GC.s);
  ctx.save(); ctx.fillStyle = '#3b4a30'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath();
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, rr = r * (0.8 + 0.3 * gNoise(i * 0.7, 3, 9)); ctx.lineTo(ix + Math.cos(a) * rr * 1.3, iy + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  gPulse(ix, iy, t + 0.4, '#ffffff', r + 6);
  if (TT < T0('mod2') - 0.3) gCallPhoto('hon_ne.jpg', ix, iy - r - 4, { pop: popS(VW('mod1', 0.35)), t0: VW('mod1', 0.35), w: 500, h: 320, up: 40, side: -160, label: 'ĐẢO HÒN NẸ', sub: 'TIỀN TIÊU TRÊN BIỂN', size: 42, credit: 'Ảnh: Gió Đông · Wikimedia Commons', fy: 0.55 });
  else if (TT > T0('mod2')) gFlag(ix, iy - r, 'HÒN NẸ', { bg: '#ffffff', size: 36, up: 40, side: -120 });
  // 1964: a ship far out at sea, a red track, the ambush lines from the island
  if (TT > T0('mod2')) {
    const u = ev(T0('mod2'), 5.5), sp = [HONNE[0] + 5.5 - u * 2.5, HONNE[1] - 7 + u * 2.5], [sx, sy] = gSP(sp);
    gLine([[HONNE[0] + 9, HONNE[1] - 11], sp], { color: G.red, lw: 4, dash: [14, 12] });
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(Math.atan2(3, -5)); ctx.fillStyle = '#d8d8d8'; ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(-26, -10); ctx.lineTo(-30, 0); ctx.lineTo(-26, 10); ctx.closePath(); ctx.fill(); ctx.restore();
    const blink = (F % 12) < 7; ctx.save(); ctx.strokeStyle = G.red; ctx.lineWidth = 4; ctx.globalAlpha = blink ? 1 : 0.4; ctx.beginPath(); ctx.arc(sx, sy, 44, 0, TAU); ctx.moveTo(sx - 60, sy); ctx.lineTo(sx + 60, sy); ctx.moveTo(sx, sy - 60); ctx.lineTo(sx, sy + 60); ctx.stroke(); ctx.restore();
    gLine([HONNE, sp], { color: G.yellow, lw: 3, dash: [6, 10], glow: 8 });
  }

}
function secRel() {
  const t = SEC.rel;
  hlOutline({ fa: 0.08 });
  const cols = [G.red, G.yellow, G.teal];
  RELIC_DOTS.forEach((d, i) => { const k = popS(t + 0.2 + d.t * 1.6); if (k <= 0) return; const [x, y] = gSP(d.p); ctx.save(); ctx.fillStyle = cols[d.kind]; ctx.shadowColor = cols[d.kind]; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(x, y, (d.kind === 2 ? 7 : 12) * k, 0, TAU); ctx.fill(); ctx.restore(); });
  gScrim(640, 1380, 0.75);
  const cx = 330, cy = 1000, r = 190, u = EZ.io(ev(T0('rel1') + 0.6, 3.6));
  gDonut(cx, cy, r, [{ v: 1, color: G.red, glow: true }, { v: 3, color: G.yellow }, { v: 47, color: G.teal }], u, { lw: 74 });
  gText(String(Math.round(51 * EZ.o3(ev(T0('rel1') + 0.3, 1.2)))), cx, cy + 34, 110, '#fff', { align: 'center', weight: 900 });
  gText('DI TÍCH', cx, cy + 78, 30, 'rgba(255,255,255,0.8)', { align: 'center', weight: 800 });
  const leg = [[G.red, '1', 'QUỐC GIA ĐẶC BIỆT', VW('rel1', 0.45)], [G.yellow, '3', 'QUỐC GIA', VW('rel1', 0.62)], [G.teal, '47', 'CẤP TỈNH', VW('rel1', 0.85)]];
  leg.forEach(([c, n, l, at], i) => { const k = ev(at, 0.3); if (k <= 0) return; const y = 880 + i * 110; ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = c; ctx.fillRect(580, y - 40, 22, 52); ctx.restore(); gText(n, 620, y + 10, 64, c, { weight: 900, alpha: k }); gText(l, 620, y + 48, 28, '#fff', { weight: 800, alpha: k }); });
  gTitle([{ text: 'DI TÍCH ĐƯỢC XẾP HẠNG', italic: true, color: G.orange, size: 52 }], 70, 330, t + 0.1, { cps: 40 });
}
