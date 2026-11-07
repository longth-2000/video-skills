// =====================================================================
//  FX-VIDEO — video effects V01–V13. Video clips are image frames in assets/ (scripts/clip_frames.sh):
//  v_<key>_P_0001.jpg (portrait 720×1280) and v_<key>_L_0001.jpg (landscape 1280×720), 24 fps.
//  vname(key, localSeconds, o) → the asset name of the frame to draw; pass it to any photo function.
// =====================================================================
const _vcount = {};
function vcount(key, v = 'P') { const k = key + v; if (_vcount[k] == null) { let n = 0; while (asset(`v_${key}_${v}_${String(n + 1).padStart(4, '0')}.jpg`)) n++; _vcount[k] = n; } return _vcount[k]; }
function vname(key, local, o = {}) {   // o.v 'P'|'L', o.loop (ping-pong when the clip is shorter), o.rate
  const v = o.v ?? 'P', n = vcount(key, v); if (!n) return null; let i = Math.floor(Math.max(0, local) * 24 * (o.rate ?? 1));
  if (i >= n) i = o.loop === false ? n - 1 : (Math.floor(i / (n - 1)) % 2 ? n - 1 - (i % (n - 1)) : i % (n - 1));
  return `v_${key}_${v}_${String(i + 1).padStart(4, '0')}.jpg`;
}
const vimg = (key, local, o) => asset(vname(key, local, o));
function speedRamp(local, segs) {   // time warp: segs [[t, rate], ...] → clip time at `local` (integrates the rate)
  let t = 0, prev = 0, r = segs[0][1]; for (const [ts, rate] of segs) { if (local < ts) break; t += (ts - prev) * r; prev = ts; r = rate; } return t + (local - prev) * r;
}
// ---- V01 full-screen video, a two-colour title popping in at the foot
function videoFull(key, t0, o = {}) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); drawCover(vimg(key, TT - t0, o), 0, 0, W, H, 1.02 + 0.04 * seg(TT, t0, t0 + 6), 0.5, 0.5, o.filter);
  if (o.lines) { footShade(0.7); const big = o.big ?? 96, n = o.lines.length, y0 = 1290 - (n - 1) * big;
    if (o.kicker) gText(o.kicker, 70, y0 - big - 6, 38, o.color ?? G.orange, { italic: true, weight: 900, alpha: ev(t0 + 0.2, 0.3) });
    o.lines.forEach((L, i) => { const k = EZ.o3(ev(t0 + 0.35 + i * 0.12, 0.35)); if (k <= 0) return; ctx.save(); const yy = y0 + i * big, s = 1.1 - 0.1 * k; ctx.translate(70, yy); ctx.scale(s, s); ctx.translate(-70, -yy);
      gText(L, 70, yy, big, i === n - 1 ? (o.color ?? G.orange) : '#fff', { weight: 900, alpha: k }); ctx.restore(); }); }
}
// ---- V02 video in a callout on the map → photoCallout(vname(...)) ; V03 dive into video → pinDive(…, vname(...))
// ---- V04 video poured into a region → fxPhotoRegion(vname(...), R, k) ; V05 video in letters → textReveal(vname(...), …)
// ---- V06 split bands → splitPanels([{ img: vname(...) }]) ; V11 mosaic → mosaicZoom([vname(...)…], …)
// ---- V07 video inside a curved TV / a phone
function videoTV(key, local, x, y, w, h, rot, k, o = {}) { tvPhoto(vname(key, local, { v: 'L' }), x, y, w, h, rot, k, { filter: o.filter ?? 'saturate(0.9) contrast(1.1)' }); }
function videoPhone(key, local, cx, cy, k, o = {}) {
  const im = vimg(key, local, { v: 'P' }); if (!im || k <= 0) return; const pw = 520, ph = 1040;
  ctx.save(); ctx.translate(cx, cy + (1 - k) * 900); ctx.rotate(o.rot ?? -0.05); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20; ctx.fillStyle = '#0b0b0d';
  ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 70); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 4; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.roundRect(-pw / 2 + 18, -ph / 2 + 18, pw - 36, ph - 36, 54); ctx.clip(); drawCover(im, -pw / 2 + 18, -ph / 2 + 18, pw - 36, ph - 36, 1.0);
  if (o.ui) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-pw / 2 + 18, ph / 2 - 160, pw - 36, 142); ctx.fillStyle = '#fff'; ctx.font = `800 24px ${GFONT}`; ctx.fillText(o.ui, -pw / 2 + 50, ph / 2 - 100);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-pw / 2 + 50, ph / 2 - 60, pw - 100, 6); ctx.fillStyle = G.red; ctx.fillRect(-pw / 2 + 50, ph / 2 - 60, (pw - 100) * clamp(local / 5), 6); }
  ctx.restore(); ctx.fillStyle = '#0b0b0d'; ctx.beginPath(); ctx.roundRect(-80, -ph / 2 + 30, 160, 40, 20); ctx.fill(); ctx.restore();
}
// ---- V08 freeze frame: the clip plays, stops at tF (a white flash, a slight grey), outlines + labels, then plays on at tGo
function videoFreeze(key, t0, tF, tGo, boxes, o = {}) {
  const local = TT < tF ? TT - t0 : TT < tGo ? tF - t0 : tF - t0 + (TT - tGo), frozen = TT >= tF && TT < tGo, g = frozen ? EZ.o3(ev(tF, 0.3)) * (1 - ev(tGo - 0.3, 0.3)) : 0;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const im = vimg(key, local, o); if (!im) return; const sc = Math.max(W / im.naturalWidth, H / im.naturalHeight) * (1 + 0.06 * g), dw = im.naturalWidth * sc, dh = im.naturalHeight * sc, x0 = (W - dw) / 2, y0 = (H - dh) / 2;
  ctx.save(); ctx.filter = g > 0 ? `grayscale(${0.7 * g}) contrast(${1 + 0.15 * g})` : 'none'; ctx.drawImage(im, x0, y0, dw, dh); ctx.restore();
  if (TT >= tF && TT < tF + 0.15) { ctx.save(); ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.6 * (1 - (TT - tF) / 0.15); ctx.fillRect(0, 0, W, H); ctx.restore(); }
  if (g > 0.05) { const map = (nx, ny) => [x0 + nx * dw, y0 + ny * dh]; boxes.forEach(([b, label], i) => fxOutline(map, b, label, seg(TT, tF + 0.2 + i * 0.35, tF + 0.8 + i * 0.35) * g, i ? G.teal : G.orange));
    fxPill('II', W - SAFE.right - 60, 300, 30, '#15100a', '#fff', g); }
}
// ---- V09 speed ramp: fast, then slow on the beat (o.segs = [[t, rate], …] in local seconds)
function videoRamp(key, t0, segs, o = {}) {
  const local = speedRamp(TT - t0, segs), r = segs.reduce((a, [t, rate]) => (TT - t0 >= t ? rate : a), segs[0][1]);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); drawCover(vimg(key, local, o), 0, 0, W, H, 1.02 + 0.03 * clamp(r - 1, 0, 3));
  if (r > 1.5) { ctx.save(); ctx.globalAlpha = 0.25; drawCover(vimg(key, local - 0.08, o), 0, 0, W, H, 1.04); ctx.restore(); }   // a little motion smear when fast
  if (o.badge) fxPill(r > 1.5 ? '×' + r : '×' + (Math.round(r * 10) / 10).toString().replace('.', ','), W - SAFE.right - 40, 300, 28, '#15100a', r > 1.5 ? G.orange : '#fff', 1, { align: 'right' });
}
// ---- V10 picture-in-picture: the map keeps moving, a video window in a corner is tied to a pin by a line
function videoPiP(key, local, pinScreen, k, o = {}) {
  if (k <= 0) return; const w = o.w ?? 420, h = o.h ?? 560, x = o.x ?? (W - SAFE.right - w - 30), y = o.y ?? 300, [px, py] = pinScreen;
  ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.globalAlpha = k; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x + w / 2, y + h); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(k, k); ctx.translate(-x - w / 2, -y - h / 2); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 30; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(x - 8, y - 8, w + 16, h + 16, 22); ctx.fill(); ctx.shadowBlur = 0;
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.clip(); drawCover(vimg(key, local, { v: 'P' }), x, y, w, h, 1.0); ctx.restore();
  ctx.fillStyle = G.red; ctx.beginPath(); ctx.arc(x + 30, y + 30, 9 + Math.sin(TT * 6) * 2, 0, TAU); ctx.fill(); ctx.restore();
  if (o.label) fxPill(o.label, x + w / 2, y + h + 46, 26, '#15100a', G.orange, k);
}
// ---- V12 a clip graded as old film (grey, grain, gate weave, dust) that turns to colour at tColor
function videoOldToColour(key, t0, tColor, o = {}) {
  const local = TT - t0, c = EZ.io(seg(TT, tColor, tColor + 0.9)), R = RNG('film' + Math.floor(TT * 24));
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); const wx = (1 - c) * (R.f() - 0.5) * 6, wy = (1 - c) * (R.f() - 0.5) * 6;
  ctx.save(); ctx.translate(wx, wy); drawCover(vimg(key, local, o), 0, 0, W, H, 1.04, 0.5, 0.5, `grayscale(${1 - c}) sepia(${0.35 * (1 - c)}) contrast(${1.25 - 0.25 * c}) brightness(${0.9 + 0.1 * c})`); ctx.restore();
  if (c < 1) { ctx.save(); ctx.globalAlpha = 0.18 * (1 - c); for (let i = 0; i < 900; i++) { ctx.fillStyle = R.f() > 0.5 ? '#fff' : '#000'; ctx.fillRect(R.f() * W, R.f() * H, 2, 2); }
    ctx.globalAlpha = 0.5 * (1 - c); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; for (let i = 0; i < 3; i++) { const x = R.f() * W; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + R.n(4), H); ctx.stroke(); }
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${0.6 * (1 - c) / 0.5})`); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  if (o.label) { footShade(0.5); fxPill(o.label, 80, 1250, 34, '#fff', G.orange, popS(t0 + 0.5), { align: 'left' }); }
}
// ---- V13 before/after slider: a still photo (before) and a playing video (after) → beforeAfter(drawPhoto, drawVideo, t0)
