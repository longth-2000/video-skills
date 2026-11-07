// =====================================================================
//  FX-GEO2 — effects N01–N16 (added after the first catalog; references/effects.md "New effects").
//  Same rules as fx-geo.js: data in, screen space unless "world", safe to call before t0.
// =====================================================================

// ---- N01 distance rings: dashed circles (km) spreading from a world point, a small pill on each, the last one orange
function radiusRings(c, radii, t0, o = {}) {
  const [x, y] = gSP(c), col = o.color ?? G.orange; gPulse(x, y, t0, col, 14); gPin(x, y, { pop: popS(t0), color: o.pin ?? '#fff' });
  radii.forEach((r, i) => { const at = t0 + 0.25 + i * (o.stagger ?? 0.45), k = EZ.o3(ev(at, 0.7)); if (k <= 0) return; const R = r * GC.s, last = i === radii.length - 1;
    ctx.save(); ctx.strokeStyle = last ? col : '#ffffff'; ctx.globalAlpha = 0.9; ctx.lineWidth = last ? 4 : 3; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -TT * 24; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(x, y, R, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke(); ctx.restore();
    if (k > 0.85) fxPill((o.unit ? r + o.unit : r + ' KM'), x, y - R, 22, '#15100a', last ? col : '#ffffff', popS(at + 0.55)); });
}
// ---- N02 3D columns standing on the map: items [{ p: world, v: 0..1, c, label, sub }]
function bars3D(items, t0, o = {}) {
  const order = items.map((it, i) => ({ ...it, i })).sort((a, b) => gSP(a.p)[1] - gSP(b.p)[1]);
  for (const it of order) {
    const [x, y] = gSP(it.p), at = t0 + it.i * (o.stagger ?? 0.25); if (TT < at) continue;
    const k = Math.max(0, EZ.back(clamp((TT - at) / 0.7))), h = (o.h ?? 420) * it.v * k, w = o.w ?? 44, c = it.c ?? G.orange, d = w * 0.35;
    ctx.save(); ctx.globalAlpha = 0.45; ctx.fillStyle = '#000'; ctx.filter = 'blur(6px)'; ctx.beginPath(); ctx.ellipse(x + d / 2, y, w * 0.9, w * 0.3, 0, 0, TAU); ctx.fill(); ctx.restore();
    ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 24; const g = ctx.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, c); g.addColorStop(1, darker(c, 0.55)); ctx.fillStyle = g; ctx.fillRect(x - w / 2, y - h, w, h); ctx.shadowBlur = 0;
    ctx.fillStyle = darker(c, 0.4); ctx.beginPath(); ctx.moveTo(x + w / 2, y - h); ctx.lineTo(x + w / 2 + d, y - h - d * 0.7); ctx.lineTo(x + w / 2 + d, y - d * 0.7); ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff3d6'; ctx.beginPath(); ctx.moveTo(x - w / 2, y - h); ctx.lineTo(x + w / 2, y - h); ctx.lineTo(x + w / 2 + d, y - h - d * 0.7); ctx.lineTo(x - w / 2 + d, y - h - d * 0.7); ctx.closePath(); ctx.fill(); ctx.restore();
    const a = clamp((k - 0.8) * 5);
    if (a > 0 && it.sub) gText(it.sub, x + d / 2, y - h - d - 12, o.subSize ?? 26, '#fff', { align: 'center', weight: 900, alpha: a });
    if (a > 0 && it.label) gText(it.label, x, y + 30, 20, '#fff', { align: 'center', weight: 800, alpha: a });
  }
}
// ---- N03 glowing dots / bubbles on the map: pts [{ p: world, r px, c, label, at }] (density or size by value)
function glowDots(pts, t0, o = {}) {
  pts.forEach((d, i) => { const at = t0 + (d.at ?? i * (o.stagger ?? 0.03)); if (TT < at) return; const k = Math.max(0, EZ.back(clamp((TT - at) / 0.5)));
    const [x, y] = gSP(d.p), r = (d.r ?? 6) * k * (1 + 0.08 * Math.sin(TT * 4 + i)), c = d.c ?? G.orange;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4); g.addColorStop(0, '#fff8e0'); g.addColorStop(0.3, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, TAU); ctx.fill(); ctx.restore();
    if (d.label && k > 0.8) gText(d.label, x, y - r * 2.4 - 6, 22, '#fff', { align: 'center', weight: 900 }); });
}
function pointInRings(p, R) { let inside = false; for (const r of R) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const a = r[i], b = r[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside; } return inside; }
function pointsInRings(R, n, seed) {   // n random world points inside rings R (deterministic)
  const rnd = RNG(seed); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const r of R) for (const p of r) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  const out = []; for (let i = 0; out.length < n && i < n * 60; i++) { const p = [lerp(x0, x1, rnd.f()), lerp(y0, y1, rnd.f())]; if (pointInRings(p, R)) out.push(p); } return out;
}
// ---- N04 flow arc with particles between two world points (bend: + left / − right of a→b)
function flowArc(a, b, t0, o = {}) {
  const A = gSP(a), B = gSP(b), d = dist(A, B), nx = -(B[1] - A[1]) / d, ny = (B[0] - A[0]) / d, bend = o.bend ?? 0.3, C = [(A[0] + B[0]) / 2 + nx * d * bend, (A[1] + B[1]) / 2 + ny * d * bend];
  const Q = (u) => [(1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * C[0] + u * u * B[0], (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * C[1] + u * u * B[1]];
  const f = EZ.io(seg(TT, t0, t0 + (o.dur ?? 1.0))); if (f <= 0) return; const col = o.color ?? G.orange, P = []; for (let i = 0; i <= 40; i++) P.push(Q(f * i / 40));
  strokePl(P, col, o.lw ?? 4, 14, 0.9);
  if (f >= 1) { const n = o.particles ?? 5; for (let j = 0; j < n; j++) { const u = mod((TT - t0) * (o.speed ?? 0.5) + j / n, 1), [px, py] = Q(u); ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.globalAlpha = Math.sin(Math.PI * u); ctx.beginPath(); ctx.arc(px, py, (o.lw ?? 4) * 1.4, 0, TAU); ctx.fill(); ctx.restore(); }
    const [ex, ey] = Q(1), [qx, qy] = Q(0.96), an = Math.atan2(ey - qy, ex - qx); ctx.save(); ctx.translate(ex, ey); ctx.rotate(an); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-16, -10); ctx.lineTo(-16, 10); ctx.closePath(); ctx.fill(); ctx.restore(); }
}
// ---- N05 magnifier: a round lens at (cx, cy) showing the world around pt at zoom sBig; drawWorld() draws the map layers
function magnifier(drawWorld, pt, sBig, cx, cy, r, k, o = {}) {
  if (k <= 0) return; const [px, py] = gSP(pt), keep = { ...GC }, rr = r * k;
  ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.globalAlpha = clamp(k * 2); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(lerp(px, cx, 1) - (cx - px) * rr / Math.max(1, dist([px, py], [cx, cy])), cy - (cy - py) * rr / Math.max(1, dist([px, py], [cx, cy]))); ctx.stroke();
  ctx.beginPath(); ctx.arc(px, py, 10, 0, TAU); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.clip();
  GC = { x: pt[0] - (cx - GAX()) / sBig, y: pt[1] - (cy - GAY()) / sBig, s: sBig }; drawWorld(); GC = keep; ctx.restore();
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 24; ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.stroke(); ctx.restore();
  if (o.label && k > 0.8) fxPill(o.label, cx, cy + rr + 34, 26, '#15100a', '#fff', popS(o.t0 ?? 0));
}
// ---- N06 before / after slider: drawBefore fills the frame, drawAfter is revealed left of a sweeping vertical line
function beforeAfter(drawBefore, drawAfter, t0, o = {}) {
  drawBefore();
  const u = seg(TT, t0, t0 + (o.dur ?? 2.4)), x = u < 0.6 ? lerp(0, W, EZ.io(u / 0.6)) : lerp(W, W * (o.rest ?? 0.5), EZ.io((u - 0.6) / 0.4));
  if (x > 1) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, x, H); ctx.clip(); drawAfter(); ctx.restore(); }
  if (u > 0 && u < 1.0001) { ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 16; ctx.fillRect(x - 3, 0, 6, H);
    ctx.beginPath(); ctx.arc(x, H * 0.42, 34, 0, TAU); ctx.fill(); ctx.fillStyle = '#15100a'; ctx.beginPath(); ctx.moveTo(x - 20, H * 0.42); ctx.lineTo(x - 8, H * 0.42 - 10); ctx.lineTo(x - 8, H * 0.42 + 10); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + 20, H * 0.42); ctx.lineTo(x + 8, H * 0.42 - 10); ctx.lineTo(x + 8, H * 0.42 + 10); ctx.fill(); ctx.restore(); }
  const kl = ev(t0, 0.3); fxPill(o.left ?? 'SAU', 50, 300, 26, '#15100a', G.orange, kl, { align: 'left' }); fxPill(o.right ?? 'TRƯỚC', W - SAFE.right - 20, 300, 26, '#15100a', '#ffffff', kl, { align: 'right' });
}
// ---- N07 map layers peeling apart in an isometric view: layers [draw fns] bottom → top, each drawn flat full-frame
const _layerCv = [];
function mapLayers(layers, t0, o = {}) {
  const k = EZ.io(seg(TT, t0, t0 + (o.dur ?? 1.6))), sep = (o.sep ?? 210) * k;
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, H);
  layers.forEach((draw, i) => {
    if (!_layerCv[i]) { _layerCv[i] = document.createElement('canvas'); _layerCv[i].width = W; _layerCv[i].height = W; }
    const cv = _layerCv[i], saved = ctx; ctx = cv.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, W); ctx.translate(0, -(H - W) / 2); draw(); ctx = saved;
    const cy = H * 0.62 - i * sep;
    ctx.save(); ctx.translate(W / 2, cy); ctx.scale(1, 0.5); ctx.rotate(Math.PI / 4); ctx.globalAlpha = i === 0 ? 1 : 0.95;
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.drawImage(cv, -W / 2 * 0.8, -W / 2 * 0.8, W * 0.8, W * 0.8); ctx.shadowBlur = 0;
    ctx.strokeStyle = i === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; ctx.strokeRect(-W / 2 * 0.8, -W / 2 * 0.8, W * 0.8, W * 0.8); ctx.restore();
    if (o.labels && o.labels[i]) fxPill(o.labels[i], W - SAFE.right - 40, cy - 40, 24, '#15100a', i === layers.length - 1 ? G.orange : '#ffffff', ev(t0 + 0.6 + i * 0.2, 0.3), { align: 'right' });
  });
}
// ---- N08 dial gauge: needle sweeps from `from` to `to` on [vmin, vmax]; red zone above o.red; value in the middle
function gauge(cx, cy, R, vmin, vmax, from, to, t0, o = {}) {
  const A0 = Math.PI * 0.85, A1 = Math.PI * 2.15, ang = (v) => lerp(A0, A1, (v - vmin) / (vmax - vmin)), k = EZ.o3(ev(t0 - 0.4, 0.4));
  ctx.save(); ctx.globalAlpha = k; ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 34; ctx.beginPath(); ctx.arc(cx, cy, R, A0, A1); ctx.stroke();
  if (o.red != null) { ctx.strokeStyle = G.red; ctx.shadowColor = G.red; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(cx, cy, R, ang(o.red), A1); ctx.stroke(); ctx.shadowBlur = 0; }
  for (let v = vmin; v <= vmax + 1e-6; v += o.step ?? 1) { const a = ang(v); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (R - 40), cy + Math.sin(a) * (R - 40)); ctx.lineTo(cx + Math.cos(a) * (R - 58), cy + Math.sin(a) * (R - 58)); ctx.stroke();
    gText(String(v).replace('.', ','), cx + Math.cos(a) * (R - 92), cy + Math.sin(a) * (R - 92) + 9, 26, 'rgba(255,255,255,0.8)', { align: 'center', weight: 800, alpha: k, shadow: false }); }
  ctx.restore();
  const u = clamp((TT - t0) / (o.dur ?? 1.4)), e = u < 1 ? EZ.back(u) : 1 + 0.01 * Math.sin(TT * 9) * Math.exp(-(TT - t0 - (o.dur ?? 1.4)) * 3), v = lerp(from, to, e), a = ang(v);
  ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = '#fff'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (R - 70), cy + Math.sin(a) * (R - 70)); ctx.stroke(); ctx.fillStyle = G.orange; ctx.beginPath(); ctx.arc(cx, cy, 22, 0, TAU); ctx.fill(); ctx.restore();
  gText((o.fmt ? o.fmt(clamp(v, Math.min(from, to), Math.max(from, to))) : v.toFixed(1).replace('.', ',')) + (o.unit ?? '%'), cx, cy + 130, 96, o.color ?? '#fff', { align: 'center', weight: 900, alpha: k });
  if (o.label) fxPill(o.label, cx, cy + 200, 28, '#15100a', G.orange, k);
}
// ---- N09 odometer: each digit rolls down to its value (separators stay); str like '176.418'
function odometer(str, x, y, size, t0, o = {}) {
  ctx.save(); ctx.font = `900 ${size}px ${GFONT}`; const chars = [...str], ws = chars.map((c) => ctx.measureText(/\d/.test(c) ? '0' : c).width), tw = ws.reduce((a, b) => a + b, 0);
  let cx = o.align === 'left' ? x : x - tw / 2; const top = y - size * 0.9, h = size * 1.1, k = ev(t0 - 0.2, 0.2);
  chars.forEach((c, i) => {
    if (/\d/.test(c)) {
      const d = +c, roll = EZ.o3(clamp((TT - t0 - i * 0.07) / (o.dur ?? 1.5))) * (d + 20), base = Math.floor(roll), fr = roll - base;
      ctx.save(); ctx.beginPath(); ctx.rect(cx - 4, top, ws[i] + 8, h); ctx.clip(); ctx.globalAlpha = k;
      if (o.box) { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(cx - 4, top, ws[i] + 8, h); }
      ctx.fillStyle = o.color ?? '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 10;
      ctx.fillText(String(base % 10), cx, y - fr * h); ctx.fillText(String((base + 1) % 10), cx, y - fr * h + h); ctx.restore();
    } else { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = o.color ?? '#fff'; ctx.fillText(c, cx, y); ctx.restore(); }
    cx += ws[i];
  });
  ctx.restore();
}
// ---- N10 waffle: 10×10 squares, pct of them fill in order
function waffle(pct, x, y, cell, t0, o = {}) {
  const gap = cell * 0.18, n = Math.round(pct * 1), f = seg(TT, t0, t0 + (o.dur ?? 1.6)) * n;
  for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), c = i % 10, xx = x + c * (cell + gap), yy = y + (9 - r) * (cell + gap), on = i < f, kk = EZ.back(clamp((f - i) * 1.5));
    ctx.save(); ctx.fillStyle = on ? (o.color ?? G.orange) : 'rgba(255,255,255,0.12)'; if (on) { ctx.shadowColor = o.color ?? G.orange; ctx.shadowBlur = 10; }
    const s = on ? 0.7 + 0.3 * kk : 1; ctx.translate(xx + cell / 2, yy + cell / 2); ctx.scale(s, s); ctx.beginPath(); ctx.roundRect(-cell / 2, -cell / 2, cell, cell, cell * 0.15); ctx.fill(); ctx.restore(); }
}
// ---- N11 ranking bars: rows [{ label, v, txt }] sorted high → low; the leader orange
function rankBars(rows, x, y, w, t0, o = {}) {
  const max = Math.max(...rows.map((r) => r.v)), rh = o.rh ?? 86;
  rows.forEach((r, i) => { const at = t0 + i * (o.stagger ?? 0.18), k = EZ.o3(ev(at, 0.7)); if (TT < at) return; const yy = y + i * rh, bw = (w - 260) * (r.v / max) * k, c = i === 0 ? G.orange : '#d8dee3';
    if (r.img) { roundPhoto(r.img, x + 26, yy + 24, 26, clamp(k * 3), { lw: 3 }); }   // A3: a photo chip before the label
    gText(r.label, x + (r.img ? 64 : 0), yy + 34, 28, '#fff', { weight: 900, alpha: clamp(k * 3) });
    ctx.save(); ctx.fillStyle = c; if (i === 0) { ctx.shadowColor = c; ctx.shadowBlur = 18; } ctx.beginPath(); ctx.roundRect(x + 240, yy + 6, Math.max(4, bw), rh - 30, 8); ctx.fill(); ctx.restore();
    gText(r.txt ?? String(r.v), x + 254 + bw, yy + 44, 28, i === 0 ? G.orange : '#fff', { weight: 900, alpha: clamp((k - 0.6) * 3) }); });
}
// ---- N12 rubber stamp slammed onto a document: lines of text, red double frame, a little shake
function stamp(lines, x, y, rot, t0, o = {}) {
  if (TT < t0) return; const u = clamp((TT - t0) / 0.18), s = u < 1 ? lerp(2.4, 1, EZ.i2 ? EZ.i2(u) : u * u) : 1 + 0.03 * Math.exp(-(TT - t0 - 0.18) * 14) * Math.sin((TT - t0) * 60);
  const col = o.color ?? '#d22b2b', size = o.size ?? 54;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = (u < 1 ? u : 1) * 0.92;
  ctx.font = `900 ${size}px ${GFONT}`; const tw = Math.max(...lines.map((l) => ctx.measureText(l).width)), bw = tw + size * 0.9, bh = lines.length * size * 1.15 + size * 0.6;
  ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.beginPath(); ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 14); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(-bw / 2 + 12, -bh / 2 + 12, bw - 24, bh - 24, 8); ctx.stroke();
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; lines.forEach((l, i) => ctx.fillText(l, 0, (i - (lines.length - 1) / 2) * size * 1.15 + 3));
  ctx.globalCompositeOperation = 'destination-out'; const R = RNG('stamp' + lines[0]); for (let i = 0; i < 260; i++) { ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(lerp(-bw / 2, bw / 2, R.f()), lerp(-bh / 2, bh / 2, R.f()), 1 + R.f() * 3, 0, TAU); ctx.fill(); }   // ink gaps
  ctx.restore();
}
// ---- N13 hand-drawn red circle around a screen box (two slightly different loops drawn on)
function handCircle(x, y, w, h, t0, o = {}) {
  const f = clamp((TT - t0) / (o.dur ?? 0.55)); if (f <= 0) return; const cx = x + w / 2, cy = y + h / 2, rx = w / 2 + 26, ry = h / 2 + 22, R = RNG('hc' + x + y), j = [R.f(), R.f(), R.f()];
  ctx.save(); ctx.strokeStyle = o.color ?? '#e5262a'; ctx.lineWidth = o.lw ?? 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  const n = 80, end = Math.floor(n * 2.1 * f); for (let i = 0; i <= end; i++) { const a = -2.2 + (i / n) * TAU, wob = 1 + 0.04 * Math.sin(a * 3 + j[0] * 6) + 0.03 * (i / n); const px = cx + Math.cos(a) * rx * wob * (1 + 0.05 * j[1]), py = cy + Math.sin(a) * ry * wob; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.stroke(); ctx.restore();
}
// ---- N14 hand-drawn arrow from a (label side) curving to b, drawn on; label at the start
function handArrow(a, b, label, t0, o = {}) {
  const f = clamp((TT - t0) / (o.dur ?? 0.6)); if (f <= 0) return; const col = o.color ?? '#ffffff', d = dist(a, b), nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d, c = [(a[0] + b[0]) / 2 + nx * d * (o.bend ?? 0.25), (a[1] + b[1]) / 2 + ny * d * (o.bend ?? 0.25)];
  const Q = (u) => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]], P = []; for (let i = 0; i <= 40; i++) P.push(Q(EZ.o3(f) * i / 40));
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 10; strokePl(P, col, o.lw ?? 7, 0, 1);
  if (f >= 0.98) { const [ex, ey] = Q(1), [qx, qy] = Q(0.93), an = Math.atan2(ey - qy, ex - qx); ctx.translate(ex, ey); ctx.rotate(an); ctx.strokeStyle = col; ctx.lineWidth = o.lw ?? 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-26, -16); ctx.lineTo(0, 0); ctx.lineTo(-26, 16); ctx.stroke(); }
  ctx.restore(); if (label) fxPill(label, a[0], a[1] - 34, 28, '#15100a', o.pill ?? G.orange, popS(t0 + 0.1));
}
// ---- N15 stacked cards sliding up: cards [{ head, title, img, icon(col) }]; earlier cards move up and shrink behind
function stackCards(cards, t0, o = {}) {
  const cw = o.w ?? 700, ch = o.h ?? 380, x = CX - cw / 2, n = cards.length, dt = o.dt ?? 0.9;
  for (let i = 0; i < n; i++) {
    const at = t0 + i * dt, k = EZ.o3(ev(at, 0.5)); if (k <= 0) continue; const later = Math.max(0, Math.min(n - 1, (TT - t0) / dt) - i), sh = EZ.io(clamp(later));
    const y = lerp(H, (o.y ?? 760), k) - 120 * Math.min(later, n), s = 1 - 0.06 * Math.min(later, n), c = cards[i].c ?? G.orange;
    ctx.save(); ctx.translate(CX, y + ch / 2); ctx.scale(s, s); ctx.rotate((i % 2 ? 1 : -1) * 0.02 * (1 - sh)); ctx.translate(-CX, -y - ch / 2);
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.fillStyle = '#f4efe6'; ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 26); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(x, y, cw, 88, [26, 26, 0, 0]); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `900 34px ${GFONT}`; ctx.textBaseline = 'middle'; ctx.fillText(cards[i].head, x + 32, y + 46);
    if (cards[i].img) { const img = asset(cards[i].img); if (img) { ctx.save(); ctx.beginPath(); ctx.roundRect(x + 28, y + 112, 250, ch - 140, 14); ctx.clip(); const sc = Math.max(250 / img.naturalWidth, (ch - 140) / img.naturalHeight); ctx.drawImage(img, x + 28 + (250 - img.naturalWidth * sc) / 2, y + 112 + (ch - 140 - img.naturalHeight * sc) / 2, img.naturalWidth * sc, img.naturalHeight * sc); ctx.restore(); } }
    else if (cards[i].icon) { ctx.save(); ctx.translate(x + 150, y + 112 + (ch - 140) / 2); ctx.scale(2.4, 2.4); cards[i].icon(c); ctx.restore(); }
    ctx.fillStyle = '#1b1b1b'; ctx.font = `900 40px ${GFONT}`; (cards[i].title || '').split('\n').forEach((l, j) => ctx.fillText(l, x + 310, y + 170 + j * 52));
    ctx.restore();
  }
}
// ---- N16 dive through a pin into a photo: zoom the map toward the pin (caller), then a circle opens from the pin onto the photo
function pinDive(pinScreen, img, tc, o = {}) {
  const u = seg(TT, tc - 0.05, tc + 0.4); if (u <= 0) return;
  const [px, py] = pinScreen, R = EZ.i2 ? EZ.i2(u) * Math.hypot(W, H) : u * u * Math.hypot(W, H);
  ctx.save(); ctx.beginPath(); ctx.arc(px, py, Math.max(1, R), 0, TAU); ctx.clip(); photoFS(img, { t0: tc, z0: 1.25 - 0.15 * EZ.o3(u), dz: 0.05, fx: o.fx, fy: o.fy }); ctx.restore();
  if (u < 1) { ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 10 * (1 - u); ctx.shadowColor = '#fff'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(px, py, Math.max(1, R), 0, TAU); ctx.stroke(); ctx.restore(); }
}
