// =====================================================================
//  FX-INTRO — the video's own opening and closing sequences (I1–I4, F1–F4): full frame, 3–5 s, big motion.
//  references/effects.md "Intros" / "Outros". Screen space; safe to call before t0. Titles may reach 170 px here — the
//  one exception to the small-text rule — because the title IS the effect; nothing else is on screen with them.
// =====================================================================
function titleSize(text, maxW, size) { ctx.save(); ctx.font = `900 ${size}px ${GFONT}`; const w = ctx.measureText(text).width; ctx.restore(); return w > maxW ? size * maxW / w : size; }
// a big extruded title with a light sweep running across the face (u = sweep position 0..1, < 0 = none)
function bigTitle(text, x, y, size, u, o = {}) {
  fx3DText(text, x, y, size, o.face ?? '#ffffff', o.side ?? '#5a3a12', { face2: o.face2 ?? '#ffe2b0', depth: size * 0.11, dx: 0.45, dy: 1, alpha: o.alpha ?? 1 });
  if (u < 0 || u > 1) return; ctx.save(); ctx.font = `900 ${size}px ${GFONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width, x0 = x - w / 2 - 200, sx = x0 + (w + 400) * u, g = ctx.createLinearGradient(sx - 140, y - size, sx + 140, y + size);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,255,255,${0.85 * (o.alpha ?? 1)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillText(text, x, y); ctx.restore();
}
function subPill(text, y, t, o = {}) { fxPill(text, CX, y, o.size ?? 36, '#15100a', o.bg ?? G.orange, EZ.back(ev(t, 0.4))); }

// ---- I1 3D title over the map, a light sweep, then the camera flies through the title into the first shot.
//      drawWorld(): draws the map for the current GC (the caller dives the camera); tGo = start of the fly-through.
function introTitle3D(title, sub, t0, tGo, drawWorld, o = {}) {
  drawWorld(); ctx.save(); ctx.fillStyle = 'rgba(3,6,9,0.35)'; ctx.fillRect(0, 0, W, H); ctx.restore();
  const size = titleSize(title, W - SAFE.right - 120, o.size ?? 170), y = o.y ?? H * 0.4, k = EZ.o3(ev(t0, 0.45)), go = EZ.i3(seg(TT, tGo, tGo + 0.75));
  if (go >= 1) return;
  ctx.save(); const s = (1.25 - 0.25 * k) * Math.exp(Math.log(14) * go); ctx.translate(CX, y); ctx.scale(s, s); ctx.translate(-CX, -y);
  bigTitle(title, CX, y, size, seg(TT, t0 + 0.4, t0 + 1.6), { alpha: k * (1 - go) ** 1.5 }); ctx.restore();
  if (sub && go < 0.2) subPill(sub, y + size * 0.85, t0 + 0.5);
  zoomBlur(go * 1.4, y);
}
// ---- I2 mosaic: tiles of the video's own photos/footage flip in across the whole frame and keep changing on the beat,
//      then burst outwards (tz) leaving the 3D title. imgs: 4+ asset names (vname(...) frames work too).
function introMosaic(imgs, title, sub, t0, tz, o = {}) {
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, H); const cols = 4, rows = 7, gap = 8, tw = (W - gap * (cols + 1)) / cols, th = (H - gap * (rows + 1)) / rows, z = EZ.i3(seg(TT, tz, tz + 0.7));
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c, at = t0 + (r + c) * 0.035, k = EZ.o3(ev(at, 0.25)); if (k <= 0) continue;
    const pick = imgs[(i * 7 + Math.floor(Math.max(0, TT - at) / (o.beat ?? 0.25)) * 3) % imgs.length];
    const x = gap + c * (tw + gap) + tw / 2, y = gap + r * (th + gap) + th / 2, dx = (x - W / 2) * z * 1.6, dy = (y - H / 2) * z * 1.6;
    ctx.save(); ctx.globalAlpha = 1 - z; ctx.translate(x + dx, y + dy); ctx.scale(k * (1 + 0.6 * z), 1 + 0.6 * z);
    drawCover(asset(pick), -tw / 2, -th / 2, tw, th, 1.08, 0.5, 0.5, o.filter); ctx.restore();
  }
  if (z > 0) { const size = titleSize(title, W - SAFE.right - 120, o.size ?? 160), y = o.y ?? H * 0.42, k = EZ.back(seg(TT, tz + 0.1, tz + 0.6));
    ctx.save(); ctx.translate(CX, y); ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k); ctx.translate(-CX, -y); bigTitle(title, CX, y, size, seg(TT, tz + 0.5, tz + 1.5), { alpha: clamp(k) }); ctx.restore();
    if (sub) subPill(sub, y + size * 0.85, tz + 0.6); }
}
// ---- I3 the map draws itself: glowing outlines run out of the dark, the satellite ground fades in under them, the title
//      drops in (and leaves at o.out). rings: world ring sets (e.g. [GEO.country, CTY.JPN]); drawGround(): the map ground for the current GC.
function introMapDraw(rings, title, sub, t0, drawGround, o = {}) {
  const d = o.draw ?? 1.8, g = EZ.io(seg(TT, t0 + d * 0.55, t0 + d + 0.6));
  if (g > 0) { drawGround(); } ctx.save(); ctx.fillStyle = `rgba(1,3,6,${1 - g * 0.75})`; ctx.fillRect(0, 0, W, H); ctx.restore();
  rings.forEach((R, i) => { const f = EZ.io(seg(TT, t0 + i * 0.15, t0 + d + i * 0.15)); if (f <= 0) return; const L = gRingLen(R) + 20;
    gRegion(R, { line: o.color ?? G.orange, lw: 4, glow: 18, frac: f, len: L }); });
  const ta = t0 + d + 0.2, k = EZ.back(seg(TT, ta, ta + 0.55)), out = o.out != null ? 1 - seg(TT, o.out, o.out + 0.4) : 1; if (k <= 0 || out <= 0) return;
  const size = titleSize(title, W - SAFE.right - 120, o.size ?? 160), y = (o.y ?? H * 0.4) - (1 - clamp(k)) * 260;
  ctx.save(); ctx.globalAlpha = out; bigTitle(title, CX, y, size, seg(TT, ta + 0.4, ta + 1.4), { alpha: clamp(k * 1.5) }); if (sub) subPill(sub, (o.y ?? H * 0.4) + size * 0.85, ta + 0.4); ctx.restore();
}
// ---- I4 footage or a photo running inside giant letters, which then open into the first shot (P09/V05, sized for a title)
function introTextVideo(img, title, t0, tOpen, o = {}) {
  textReveal(img, title, t0, tOpen, { size: titleSize(title, W - 220, o.size ?? 300), y: o.y ?? H * 0.42, fx: o.fx, fy: o.fy, bg: '#05080b' });
  if (o.sub) { const a = 1 - seg(TT, tOpen, tOpen + 0.3); if (a > 0) { ctx.save(); ctx.globalAlpha = a; subPill(o.sub, (o.y ?? H * 0.42) + 210, t0 + 0.5); ctx.restore(); } }
}

// ---- F1 wall: starts inside one image filling the frame, pulls back to a wall of every image of the video (3 × 6),
//      the wall dims, the title lands in the middle, fade to black at `end`.
function outroWall(imgs, title, sub, t0, end, o = {}) {
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, H); const cols = 3, rows = 6, gap = 10, tw = (W - gap * (cols + 1)) / cols, th = (H - gap * (rows + 1)) / rows;
  const hero = o.hero ?? 7, hc = hero % cols, hr = Math.floor(hero / cols), hx = gap + hc * (tw + gap) + tw / 2, hy = gap + hr * (th + gap) + th / 2;
  const u = EZ.io(seg(TT, t0, t0 + (o.pull ?? 1.8))), zs = Math.max(W / tw, H / th) * 1.02, s = Math.exp(lerp(Math.log(zs), 0, u));
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-lerp(hx, W / 2, u), -lerp(hy, H / 2, u));
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const i = r * cols + c, x = gap + c * (tw + gap), y = gap + r * (th + gap);
    ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, tw, th, 10); ctx.clip(); drawCover(asset(imgs[(i + (imgs.length - hero % imgs.length)) % imgs.length]), x, y, tw, th, 1.05 + 0.04 * u, 0.5, 0.5, o.filter); ctx.restore(); }
  ctx.restore();
  const dim = EZ.io(seg(TT, t0 + 1.4, t0 + 2.2)); ctx.save(); ctx.fillStyle = `rgba(3,6,9,${0.62 * dim})`; ctx.fillRect(0, 0, W, H); ctx.restore();
  const ta = t0 + 1.7, k = EZ.back(seg(TT, ta, ta + 0.5));
  if (k > 0) { const size = titleSize(title, W - SAFE.right - 120, o.size ?? 150), y = o.y ?? H * 0.42; ctx.save(); ctx.translate(CX, y); ctx.scale(0.7 + 0.3 * k, 0.7 + 0.3 * k); ctx.translate(-CX, -y);
    bigTitle(title, CX, y, size, seg(TT, ta + 0.4, ta + 1.4), { alpha: clamp(k) }); ctx.restore(); if (sub) subPill(sub, y + size * 0.85, ta + 0.3); }
  fadeOut(end, 0.8);
}
// ---- F2 pull back to space: the map camera leaves the last place (cam {x, y, s}) and rises to a small Earth among stars;
//      lonlat = that place; the title sits in the top band; fade at `end`.
function outroSpace(drawMap, cam, lonlat, title, sub, t0, end, o = {}) {
  const tA = t0 + (o.mapDur ?? 1.6), u = EZ.i3(seg(TT, t0, tA)), sEnd = cam.s * 0.1;
  const hand = seg(TT, tA - 0.3, tA + 0.1), Rg = Math.exp(lerp(Math.log(Math.min(6371 * sEnd, 900)), Math.log(o.R ?? 300), EZ.o3(seg(TT, tA - 0.3, end - 0.6))));
  if (hand < 1) { GC = { x: cam.x, y: cam.y, s: Math.exp(lerp(Math.log(cam.s), Math.log(sEnd), u)) }; drawMap(); }
  if (hand > 0) { ctx.save(); ctx.globalAlpha = hand; ctx.fillStyle = '#01030a'; ctx.fillRect(0, 0, W, H); fxStars(); fxGlobe(W / 2, H * 0.6, Rg, lonlat[0] + 8 * seg(TT, tA, end), lonlat[1] * 0.6, { vn: 0 });
    const [px, py] = [W / 2, H * 0.6]; gPulse(px, py, tA, o.color ?? G.orange, 8); ctx.restore(); }
  zoomBlur(seg(TT, t0, tA) * (1 - seg(TT, tA - 0.2, tA + 0.3)) * 0.8, GAY());
  if (TT > tA) { const size = titleSize(title, W - SAFE.right - 120, o.size ?? 120); ctx.save(); const k = EZ.o3(ev(tA + 0.2, 0.5)); bigTitle(title, CX, 420, size, seg(TT, tA + 0.6, tA + 1.6), { alpha: k }); ctx.restore(); if (sub) subPill(sub, 420 + size * 0.85, tA + 0.5); }
  fadeOut(end, 0.8);
}
// ---- F3 rewind: the video's images play back fast in reverse (motion blur, tracking lines, a rewind sign), decelerate and stop on
//      the title card at tStop; fade at `end`. imgs in story order (they run last → first).
function outroRewind(imgs, title, sub, t0, tStop, end, o = {}) {
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, H); const n = imgs.length, u = seg(TT, t0, tStop), p = EZ.o3(u) * (n - 0.001), i = Math.floor(p), f = p - i;
  const speed = (1 - u) ** 1.2, img = asset(imgs[n - 1 - (i % n)]), off = -f * W * 0.9 * speed;
  if (u < 1) { ctx.save(); ctx.filter = `blur(${10 * speed}px) grayscale(${o.grey ? 1 : 0.3})`; drawCover(img, off, 0, W, H, 1.05); drawCover(asset(imgs[n - 1 - ((i + 1) % n)]), off + W, 0, W, H, 1.05); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.35 * speed + 0.1; for (let k = 0; k < 4; k++) { const y = mod(TT * 900 + k * 517, H); ctx.fillStyle = '#fff'; ctx.fillRect(0, y, W, 4 + 10 * speed); } ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.08; ctx.fillStyle = '#000'; for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.9 * (Math.floor(TT * 4) % 2 ? 1 : 0.5); ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 10;   // the rewind sign, drawn (no glyph)
    for (const x0 of [80, 122]) { ctx.beginPath(); ctx.moveTo(x0, 300); ctx.lineTo(x0 + 42, 276); ctx.lineTo(x0 + 42, 324); ctx.closePath(); ctx.fill(); } ctx.restore(); }
  const k = EZ.back(seg(TT, tStop - 0.15, tStop + 0.4)); if (k > 0) { ctx.save(); ctx.fillStyle = `rgba(3,6,9,${0.8 * clamp(k)})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    const size = titleSize(title, W - SAFE.right - 120, o.size ?? 150), y = o.y ?? H * 0.42; ctx.save(); ctx.translate(CX, y); ctx.scale(1.1 - 0.1 * k, 1.1 - 0.1 * k); ctx.translate(-CX, -y);
    bigTitle(title, CX, y, size, seg(TT, tStop + 0.3, tStop + 1.3), { alpha: clamp(k) }); ctx.restore(); if (sub) subPill(sub, y + size * 0.85, tStop + 0.3); }
  fadeOut(end, 0.8);
}
// ---- F4 iris with the title: black closes around the last place to a big ring; the title sits inside the ring; the ring
//      then collapses to nothing at `end`. Draw the map first with the camera centred on pt (the ring must fit the frame).
function outroIris(pt, title, sub, t0, t1, end, o = {}) {
  const [x, y] = gSP(pt), R1 = o.r ?? 380, u = EZ.io(seg(TT, t0, t1)), fin = EZ.i3(seg(TT, end - 1.0, end - 0.15)), r = lerp(Math.hypot(W, H), R1, u) * (1 - fin);
  ctx.save(); ctx.fillStyle = `rgba(3,6,9,${0.45 * u})`; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(x, y, Math.max(0, r), 0, TAU, true); ctx.fillStyle = '#030507'; ctx.fill('evenodd');
  if (r > 1) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.shadowColor = o.color ?? G.orange; ctx.shadowBlur = 30; ctx.globalAlpha = u; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); }
  ctx.restore();
  const k = EZ.back(seg(TT, t1 - 0.2, t1 + 0.4)); if (k > 0 && fin < 0.6) { const size = titleSize(title, R1 * 1.7, o.size ?? 120);
    ctx.save(); ctx.translate(x, y); ctx.scale(k * (1 - fin), k * (1 - fin)); ctx.translate(-x, -y); bigTitle(title, x, y - 10, size, seg(TT, t1 + 0.3, t1 + 1.3), { alpha: clamp(k) }); ctx.restore();
    if (sub && fin < 0.2) fxPill(sub, x, y + size * 0.8, 32, '#15100a', G.orange, EZ.back(ev(t1 + 0.3, 0.4)) * (1 - fin)); }
}
