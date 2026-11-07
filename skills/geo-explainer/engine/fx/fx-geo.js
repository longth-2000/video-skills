// =====================================================================
//  FX-GEO — generic effect functions, one per catalog entry (references/effects.md). Data comes in as arguments;
//  nothing here knows about a particular place. Screen space unless a parameter says "world" (km, see geodata).
//  Every function draws for the current time TT and is safe to call before its start time (it draws nothing).
// =====================================================================

// ---- camera and polyline helpers
const camK = (keys) => { GC = gCamAt(keys, TT); };                       // keys [[t, x, y, s, dur], ...] (world km, px/km)
function fitCam(Rs, pad = 120) {                                         // camera {x, y, s} that frames these world rings
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const R of Rs) for (const r of R) for (const p of r) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  const s = Math.min((W - SAFE.right - 2 * pad) / (x1 - x0), (1300 - 300 - pad) / (y1 - y0));
  return { x: (x0 + x1) / 2 + SAFE.right / 2 / s, y: (y0 + y1) / 2 - (GAY() - 800) / s, s };
}
const shiftR = (R, dy) => R.map((r) => r.map((p) => [p[0], p[1] + dy]));
function plLens(P) { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + dist(P[i - 1], P[i])); return L; }
function plSub(P, L, a, b) { const out = []; for (let i = 0; i < P.length - 1; i++) { const l0 = L[i], l1 = L[i + 1]; if (l1 < a || l0 > b) continue;
  const p = (l) => { const k = (l - l0) / Math.max(1e-6, l1 - l0); return [lerp(P[i][0], P[i + 1][0], k), lerp(P[i][1], P[i + 1][1], k)]; };
  if (!out.length) out.push(p(Math.max(a, l0))); out.push(p(Math.min(b, l1))); } return out; }
function plAt(P, L, l) { for (let i = 0; i < P.length - 1; i++) if (L[i + 1] >= l) { const k = (l - L[i]) / Math.max(1e-6, L[i + 1] - L[i]); return [lerp(P[i][0], P[i + 1][0], k), lerp(P[i][1], P[i + 1][1], k)]; } return P[P.length - 1]; }
function strokePl(P, color, lw, glow, alpha = 1) { if (P.length < 2) return; ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
  ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore(); }

// ---- 01 globe dive: the Earth turns from (lon0, lat0) to (lon1, lat1) and grows into the flat map by time T.
//      flat = the flat-map camera at T ({x, y, s}); the flat map must match: R(T) = 6371 * flat.s at the map centre.
function zoomBlur(k, cy = GAY()) {
  if (k <= 0.02) return; const cv = ctx.canvas; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 1; i <= 4; i++) { const s = 1 + 0.02 * i * k; ctx.globalAlpha = 0.11; ctx.drawImage(cv, W / 2 - W * s / 2, cy - cy * s, W * s, H * s); }
  ctx.restore();
}
function globeDive(T, from, to, flat, drawFlat, o = {}) {
  const u = seg(TT, 0, T - 0.7), zu = EZ.io(seg(TT, 0.3, T - 0.7)) ** 1.6;
  const R = Math.exp(lerp(Math.log(380), Math.log(6371 * flat.s), zu));
  const lon = lerp(from[0], to[0], EZ.io(seg(TT, 0, T - 0.8))), lat = lerp(from[1], to[1], EZ.io(seg(TT, 0, T - 0.8)));
  const cy = lerp(H * 0.5, GAY(), EZ.io(u));
  ctx.fillStyle = '#01030a'; ctx.fillRect(0, 0, W, H); fxStars();
  const hand = seg(TT, T - 0.7, T);
  if (hand > 0) { GC = { ...flat }; drawFlat(); }
  ctx.save(); ctx.globalAlpha = 1 - hand; if (hand < 1) fxGlobe(W / 2, cy, R, lon, lat, { vn: o.vn ?? seg(TT, 0.6, 1.2) }); ctx.restore();
  zoomBlur(seg(TT, 0.9, 1.7) * (1 - seg(TT, T - 1.0, T - 0.6)), cy);
}
// ---- 03 a giant 3D word standing on the map over world point p; as the camera dives (GC.s grows past sFade) it is passed through
function flyWord(word, p, s0, sFade, o = {}) {
  const [x, y] = gSP(p), r = GC.s / s0, size = (o.size ?? 150) * Math.pow(r, 0.85), wEst = size * word.length * 0.62;
  const fade = clamp((sFade - GC.s) / (sFade * 0.25)) * EZ.o3(ev(o.t0 ?? 0, 0.5)); if (fade <= 0) return;
  ctx.save(); ctx.translate(clamp(x, 60 + Math.min(wEst / 2, 400), W - 60 - Math.min(wEst / 2, 400)), y - size * 0.75); ctx.transform(1, 0, -0.18, 0.86, 0, 0);
  fx3DText(word, 0, 0, size, '#ffffff', o.side ?? '#5a3a12', { face2: '#ffe2b0', depth: size * 0.12, dx: 0.4, dy: 1, alpha: fade }); ctx.restore();
}
// ---- 06 a raised slab in any colour (world rings R, height h px, k 0..1)
function slab(R, h, k, c, c2) {
  if (k <= 0) return; const hh = h * k, RR = shiftR(R, -hh / GC.s); ctx.save();
  for (let i = Math.ceil(hh); i > 0; i -= 2) { ctx.save(); ctx.translate(0, i); gTrace(RR); ctx.fillStyle = c2; ctx.fill(); ctx.restore(); }
  gTrace(RR); ctx.fillStyle = c; ctx.fill();
  ctx.save(); gTrace(RR); ctx.clip(); ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 3; for (let x = -H; x < W + H; x += 22) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke(); } ctx.restore();
  gTrace(RR); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
}
const darker = (hex, f = 0.5) => { const v = parseInt(hex.slice(1), 16); return `rgb(${((v >> 16) & 255) * f | 0},${((v >> 8) & 255) * f | 0},${(v & 255) * f | 0})`; };

// ---- 07 routes (v9): a world polyline drawing on t0..t1, a white light running along it once drawn, small pins as the head
//      passes (o.pins = fractions). o.thick = the v8 fluorescent look (wide halo). Returns the screen polyline.
function route(world, color, t0, t1, o = {}) {
  const P = world.map(gSP), L = plLens(P), T = L[L.length - 1], f = EZ.io(seg(TT, t0, t1)); if (f <= 0) return null;
  const lw = o.lw ?? 5, vis = plSub(P, L, 0, T * f);
  if (o.thick) strokePl(vis, color, lw * 2.6, 0, 0.18);
  strokePl(vis, color, lw, o.glow ?? 10);
  if (f >= 1 && o.streak !== false) { const u = mod((TT - t1) / (o.sp ?? 1.6), 1), a = T * u; strokePl(plSub(P, L, a, Math.min(T, a + T * 0.16)), '#ffffff', lw * 1.1, 18, 0.95 * Math.sin(Math.PI * u)); }
  else if (f < 1) { const [hx, hy] = plAt(P, L, T * f); ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = color; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(hx, hy, lw * 1.2, 0, TAU); ctx.fill(); ctx.restore(); }
  (o.pins ?? []).forEach((pf) => { if (f < pf) return; const [x, y] = plAt(P, L, T * pf); gPin(x, y, { r: 13, pop: popS(t0 + (t1 - t0) * pf), color: '#fff', dot: color }); });
  return { P, L, T, f };
}
function tinyLegend(items, x, y, k) {   // items [[colour, label], ...]; keep it in a corner, small
  if (k <= 0) return; ctx.save(); ctx.globalAlpha = k * 0.88; ctx.fillStyle = 'rgba(8,12,16,0.75)'; ctx.beginPath(); ctx.roundRect(x, y, 300, 18 + items.length * 34, 8); ctx.fill(); ctx.restore();
  items.forEach(([c, l], i) => { const yy = y + 28 + i * 34; ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 22, yy - 7, 8, 0, TAU); ctx.fill(); ctx.restore(); gText(l, x + 40, yy, 20, '#fff', { weight: 800, alpha: k, shadow: false }); });
}

// ---- photos
function photoFS(name, o = {}) {   // a photo filling the frame with a slow push-in; returns (nx, ny) image fraction -> screen
  const img = asset(name); if (!img) return null;
  const z = (o.z0 ?? 1.04) + (o.dz ?? 0.06) * EZ.io(clamp((TT - (o.t0 ?? 0)) / (o.dur ?? 5)));
  const sc = Math.max(W / img.naturalWidth, H / img.naturalHeight) * z, dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
  const x0 = (W - dw) * (o.fx ?? 0.5), y0 = (H - dh) * (o.fy ?? 0.5);
  ctx.save(); if (o.filter) ctx.filter = o.filter; ctx.drawImage(img, x0, y0, dw, dh); ctx.restore();
  return (nx, ny) => [x0 + nx * dw, y0 + ny * dh];
}
function footShade(a = 0.75) { const g = ctx.createLinearGradient(0, 900, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.45, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0.85)'); ctx.fillStyle = g; ctx.fillRect(0, 900, W, H - 900); }
function framePhoto(name, x, y, w, h, k, label) {   // a photo in a thick white rounded frame
  const img = asset(name); if (!img || k <= 0) return; ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(k, k); ctx.translate(-x - w / 2, -y - h / 2);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 22; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(x - 7, y - 7, w + 14, h + 14, 16); ctx.fill(); ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.clip(); const sc = Math.max(w / img.naturalWidth, h / img.naturalHeight) * 1.05; ctx.drawImage(img, x + (w - img.naturalWidth * sc) / 2, y + (h - img.naturalHeight * sc) / 2, img.naturalWidth * sc, img.naturalHeight * sc);
  if (label) { const g = ctx.createLinearGradient(0, y + h * 0.55, 0, y + h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.75)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); }
  ctx.restore(); if (label && k > 0.6) gText(label, x + w / 2, y + h - 18, 24, '#fff', { align: 'center', weight: 900, alpha: clamp((k - 0.6) / 0.4) });
}
function roundPhoto(name, x, y, r, k, o = {}) {
  const img = asset(name); if (!img || k <= 0) return; ctx.save(); ctx.beginPath(); ctx.arc(x, y, r * k, 0, TAU); ctx.clip(); const sc = (2 * r * k) / Math.min(img.naturalWidth, img.naturalHeight) * 1.05;
  if (o.filter) ctx.filter = o.filter; ctx.drawImage(img, x - img.naturalWidth * sc / 2, y - img.naturalHeight * sc / 2, img.naturalWidth * sc, img.naturalHeight * sc); ctx.restore();
  ctx.save(); ctx.strokeStyle = o.ring ?? '#fff'; ctx.lineWidth = o.lw ?? 6; ctx.beginPath(); ctx.arc(x, y, r * k, 0, TAU); ctx.stroke(); ctx.restore();
}
// ---- 08 light rays from a point (px, py) out to small framed photos: items [[img, x, y, w, h, label], ...]
function raysToPhotos(px, py, items, t0, c) {
  items.forEach(([img, x, y, w, h, label], i) => { const at = t0 + i * 0.35, k = EZ.o3(ev(at, 0.4)); if (k <= 0) return;
    const tx = x + w / 2, ty = y + h / 2; ctx.save(); const g = ctx.createLinearGradient(px, py, tx, ty); g.addColorStop(0, c); g.addColorStop(1, 'rgba(255,255,255,0.9)');
    ctx.strokeStyle = g; ctx.lineWidth = 5; ctx.shadowColor = c; ctx.shadowBlur = 18; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(lerp(px, tx, k), lerp(py, ty, k)); ctx.stroke(); ctx.restore();
    framePhoto(img, x, y, w, h, EZ.back(ev(at + 0.25, 0.4)), label); });
}
// ---- 09 darken everything outside world rings R
function dimOutside(R, a) { if (a <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); for (const r of R) { r.forEach((p, i) => { const [x, y] = gSP(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); } ctx.fillStyle = `rgba(3,6,9,${a})`; ctx.fill('evenodd'); ctx.restore(); }
// ---- 14 an old photo in a curved-TV frame; slideIn gives its path from a corner
function tvPhoto(name, x, y, w, h, rot, k, o = {}) {
  const img = asset(name); if (!img || k <= 0) return;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.globalAlpha = clamp(k * 3);
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16; ctx.fillStyle = '#e9e2d0';
  ctx.beginPath(); ctx.roundRect(-w / 2 - 22, -h / 2 - 22, w + 44, h + 44, 30); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, Math.min(w, h) * 0.16); ctx.clip();
  const sc = Math.max(w / img.naturalWidth, h / img.naturalHeight) * 1.08; ctx.filter = o.filter ?? 'grayscale(1) contrast(1.2) brightness(0.95)';
  ctx.drawImage(img, -img.naturalWidth * sc / 2, -img.naturalHeight * sc / 2, img.naturalWidth * sc, img.naturalHeight * sc); ctx.filter = 'none';
  const g = ctx.createRadialGradient(0, 0, Math.min(w, h) * 0.25, 0, 0, Math.max(w, h) * 0.65); g.addColorStop(0, 'rgba(255,255,255,0.06)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.globalAlpha = 0.08; ctx.fillStyle = '#000'; for (let yy = -h / 2; yy < h / 2; yy += 6) ctx.fillRect(-w / 2, yy, w, 2);
  ctx.restore();
}
function slideIn(from, to, at, d = 0.9) { const u = EZ.o3(ev(at, d)); return [lerp(from[0], to[0], u), lerp(from[1], to[1], u), u]; }

// ---- 16 a 3D word that flies in from far away, turning, and lands at (x, y)
function fly3DWord(word, from, to, t0, size, o = {}) {
  const k = EZ.o3(ev(t0, o.d ?? 1.6)); if (k <= 0) return; const z = lerp(0.08, 1, k), yaw = (1 - k) * 1.3, x = lerp(from[0], to[0], k), y = lerp(from[1], to[1], k);
  ctx.save(); ctx.globalAlpha = 0.45 * k; ctx.fillStyle = '#000'; ctx.filter = 'blur(14px)'; ctx.beginPath(); ctx.ellipse(to[0], to[1] + size * 0.7, size * 2.5 * z, size * 0.23 * z, 0, 0, TAU); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(x, y); ctx.scale(z * Math.cos(yaw), z); ctx.transform(1, 0, -0.16 + 0.3 * Math.sin(yaw), 0.88, 0, 0);
  fx3DText(word, 0, 0, size, o.face ?? '#ffffff', o.side ?? '#7a4a16', { face2: o.face2 ?? '#ffe2b0', depth: size * 0.12, dx: 0.5 + yaw, dy: 1, alpha: clamp(k * 3) }); ctx.restore();
}

// ---- 18 line chart on the map (v7): thin white grid, an orange line drawing on, the last value in red, an optional dashed estimate
//      data [[x, v], ...] in data units; box {x0, x1, yT, yB}; range {xmin, xmax, vmin, vmax}; o.est [x, v]; o.xLabel(x) -> axis text ('' to skip)
function lineChart(data, box, range, t0, o = {}) {
  const X = (x) => lerp(box.x0, box.x1, (x - range.xmin) / (range.xmax - range.xmin)), Y = (v) => lerp(box.yB, box.yT, (v - range.vmin) / (range.vmax - range.vmin));
  const kg = ev(t0, 0.6); ctx.save(); ctx.globalAlpha = kg; ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 1.5;
  for (let i = 0; i <= 7; i++) { const yy = lerp(box.yB, box.yT, i / 7); ctx.beginPath(); ctx.moveTo(box.x0, yy); ctx.lineTo(box.x1, yy); ctx.stroke(); }
  for (let i = 0; i <= 10; i++) { const xx = lerp(box.x0, box.x1, i / 10); ctx.beginPath(); ctx.moveTo(xx, box.yT); ctx.lineTo(xx, box.yB); ctx.stroke(); } ctx.restore();
  (o.yTicks ?? []).forEach((v) => gText(String(v), box.x0 - 14, Y(v) + 6, 18, 'rgba(255,255,255,0.7)', { align: 'right', weight: 700, alpha: kg, shadow: false }));
  data.forEach(([x]) => gText(o.xLabel ? o.xLabel(x) : String(x), X(x), box.yB + 30, 18, 'rgba(255,255,255,0.7)', { align: 'center', weight: 700, alpha: kg, shadow: false }));
  if (o.title) gText(o.title, box.x0, box.yT - 40, 26, G.orange, { weight: 900, alpha: kg });
  const P = data.map(([x, v]) => [X(x), Y(v)]), L = plLens(P), d = o.dur ?? 2.4, f = EZ.io(seg(TT, t0 + 0.5, t0 + 0.5 + d));
  strokePl(plSub(P, L, 0, L[L.length - 1] * f), G.orange, 4, 8);
  if (f > 0 && f < 1) { const [hx, hy] = plAt(P, L, L[L.length - 1] * f); ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = G.orange; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(hx, hy, 6, 0, TAU); ctx.fill(); ctx.restore(); }
  const tEnd = t0 + 0.5 + d;
  if (o.est) { const ke = seg(TT, tEnd + 0.1, tEnd + 0.7); if (ke > 0) { const a = P[P.length - 1], b = [X(o.est[0]), Y(o.est[1])]; ctx.save(); ctx.strokeStyle = '#ff4d4d'; ctx.lineWidth = 3; ctx.setLineDash([8, 7]); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(lerp(a[0], b[0], ke), lerp(a[1], b[1], ke)); ctx.stroke(); ctx.restore(); } }
  if (TT > tEnd) { const [ax, ay] = P[P.length - 1]; ctx.save(); ctx.fillStyle = '#ff4d4d'; ctx.beginPath(); ctx.arc(ax, ay, 7, 0, TAU); ctx.fill(); ctx.restore(); gText(o.endLabel ?? String(data[data.length - 1][1]), ax - 8, ay - 18, 30, '#ff4d4d', { align: 'right', weight: 900, alpha: ev(tEnd, 0.3) }); }
}
// ---- 20 table (v7): white table, thick black lines, orange/red header; pops in, the second column slides open, the key row turns red
//      cols [h1, h2]; rows [[a, b], ...]; hl = index of the key row
function tableV7(cols, rows, hl, t0, o = {}) {
  const k = EZ.o3(ev(t0, 0.7)), z = lerp(0.35, 1, k) * (1 + 0.06 * seg(TT, t0 + 2.4, t0 + 3.8)), cw = lerp(0.62, 1, EZ.io(seg(TT, t0 + 0.7, t0 + 1.3)));
  const w = (o.w ?? 760) * cw, rh = o.rh ?? 84, n = rows.length, h = rh * (n + 1), cx = o.cx ?? CX, cy = o.cy ?? 820, split = o.split ?? 0.62;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-w / 2, -h / 2); ctx.globalAlpha = clamp(k * 2);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(0, 0, w, h, 18); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, w, h, 18); ctx.clip();
  ctx.fillStyle = '#f2a541'; ctx.fillRect(0, 0, w * split, rh); ctx.fillStyle = '#c0393b'; ctx.fillRect(w * split, 0, w * (1 - split), rh);
  const sw = EZ.io(seg(TT, t0 + 1.8, t0 + 2.4)); if (hl != null && sw > 0) { ctx.fillStyle = '#c0393b'; ctx.fillRect(0, rh * (hl + 1), w * sw, rh); }
  ctx.restore();
  ctx.lineWidth = 4; for (let i = 1; i <= n; i++) { ctx.beginPath(); ctx.moveTo(0, rh * i); ctx.lineTo(w, rh * i); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(w * split, 0); ctx.lineTo(w * split, h); ctx.stroke(); ctx.beginPath(); ctx.roundRect(0, 0, w, h, 18); ctx.stroke();
  ctx.font = `900 ${o.fs ?? 30}px ${GFONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const k2 = clamp((cw - 0.9) * 10);
  ctx.fillStyle = '#fff'; ctx.fillText(cols[0], w * split / 2, rh / 2); ctx.globalAlpha = k2 * clamp(k * 2); ctx.fillText(cols[1], w * (1 + split) / 2, rh / 2);
  rows.forEach((r, i) => { const kr = ev(t0 + 0.3 + i * 0.12, 0.25), on = i === hl && sw > 0.5; ctx.fillStyle = on ? '#fff' : '#111';
    ctx.globalAlpha = kr * clamp(k * 2); ctx.fillText(String(r[0]), w * split / 2, rh * (i + 1.5)); ctx.globalAlpha = kr * k2; ctx.fillText(String(r[1]), w * (1 + split) / 2, rh * (i + 1.5)); });
  ctx.restore();
}
// ---- 21 population capsule (v8): a tall capsule fills up, the value written vertically inside, a crowd icon under it
function crowd(x, y, s, c, k) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k); ctx.globalAlpha = clamp(k);
  [[-26, -8], [26, -8], [0, -14], [-40, 14], [40, 14], [-13, 10], [13, 10]].forEach(([dx, dy]) => { ctx.fillStyle = c; ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(dx, dy - 16, 11, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(dx, dy + 10, 17, 14, 0, Math.PI, 0); ctx.fill(); ctx.stroke(); }); ctx.restore(); }
function popCapsule(x, yT, yB, value, label, t0, o = {}) {   // label e.g. ' DÂN'; o.top e.g. '2019'
  const cw = o.w ?? 92, k = EZ.o3(ev(t0, 0.5)), f = EZ.io(seg(TT, t0 + 0.5, t0 + 2.2)); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.roundRect(x, yT, cw, yB - yT, cw / 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(x + 10, yT + 10, cw - 20, yB - yT - 20, (cw - 20) / 2); ctx.clip(); const hh = (yB - yT - 20) * f; ctx.fillStyle = o.color ?? G.orange; ctx.shadowColor = o.color ?? G.orange; ctx.shadowBlur = 20; ctx.fillRect(x + 10, yB - 10 - hh, cw - 20, hh); ctx.restore();
  ctx.save(); ctx.translate(x + cw / 2, (yT + yB) / 2); ctx.rotate(-Math.PI / 2); gText(Math.round(value * f).toLocaleString('de-DE') + (label ?? ''), 0, 14, 40, '#fff', { align: 'center', weight: 900, alpha: k }); ctx.restore();
  if (o.top) gText(o.top, x + cw / 2, yT - 24, 30, '#fff', { align: 'center', weight: 900, alpha: k });
  crowd(x + cw / 2, yB + 80, 1.4, '#ffffff', EZ.back(ev(t0 + 0.2, 0.4)));
}
// ---- 22 comparison arrow between two thermometers (with fxThermo): from (x0, y0) curving to (x1, y1), a pill in the middle
function compareArrow(x0, y0, x1, y1, label, t0) {
  const k = ev(t0, 0.6); if (k <= 0) return; ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.globalAlpha = k;
  const mx = (x0 + x1) / 2 - 60; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, lerp(y0, y1, 0.6), lerp(x0, x1, k), lerp(y0, y1, k)); ctx.stroke();
  if (k >= 1) { const a = Math.atan2(y1 - lerp(y0, y1, 0.6), x1 - mx); ctx.fillStyle = '#fff'; ctx.translate(x1, y1); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-22, -16); ctx.lineTo(-22, 16); ctx.closePath(); ctx.fill(); }
  ctx.restore(); fxPill(label, (x0 + x1) / 2 + 40, (y0 + y1) / 2 - 40, 34, '#15100a', G.yellow, popS(t0 + 0.5));
}
// ---- 23a target with satellites (v6): beige target on paper, an orange arc turning round it, round satellites that fill with photos
//      icon: a draw function (iconTemple, iconPot, ...); sats [[img, x, y, pillText, pillColour], ...]
function targetSatellites(cx, cy, R, icon, sats, t0) {
  const k = fxTarget(cx, cy, R, seg(TT, t0, t0 + 1.2));
  if (k > 0 && icon) { ctx.save(); ctx.translate(cx, cy - 4); ctx.scale(2.2 * k, 2.2 * k); icon('#fff'); ctx.restore(); }
  const ka = ev(t0 + 1.1, 0.4); if (ka > 0) { const a0 = TT * 1.4; ctx.save(); ctx.strokeStyle = G.orange; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.globalAlpha = ka; ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, a0, a0 + 2.2); ctx.stroke(); ctx.restore(); }
  sats.forEach(([img, x, y, pill, c], i) => { const at = t0 + 1.4 + i * 0.6, kd = EZ.o3(ev(at, 0.4)); if (kd <= 0) return;
    ctx.save(); ctx.strokeStyle = 'rgba(90,80,65,0.75)'; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.globalAlpha = kd; ctx.beginPath(); ctx.moveTo(x, y + 100); ctx.lineTo(lerp(x, cx + (x - cx) * 0.3, kd), lerp(y + 100, cy - R * 0.92, kd)); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 100, 0, TAU); ctx.fillStyle = '#f4efe6'; ctx.fill(); ctx.stroke(); ctx.restore();
    roundPhoto(img, x, y, 92, EZ.back(ev(at + 0.4, 0.4)), { ring: '#fff', lw: 5 });
    if (pill) fxPill(pill, x, y + 140, 26, '#fff', c ?? G.orange, popS(at + 0.7)); });
}
// ---- 23a glowing rings (v2): dashed red/orange rings turning opposite ways round a centre drawing; photos join on an orbit
function glowRings(cx, cy, t0, drawCentre, photos) {
  const ring = (r, c, dash, sp, lw, at) => { const k = EZ.o3(ev(at, 0.6)); if (k <= 0) return; ctx.save(); ctx.translate(cx, cy); ctx.rotate(TT * sp); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.shadowColor = c; ctx.shadowBlur = 22; ctx.globalAlpha = k; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU * k); ctx.stroke(); ctx.restore(); };
  ring(150, '#ff3b3b', null, 0, 5, t0); ring(200, '#ff3b3b', [14, 10], 0.5, 4, t0 + 0.2); ring(260, '#ffb02e', [18, 12], -0.35, 5, t0 + 0.5);
  if (drawCentre) drawCentre(EZ.back(ev(t0 + 0.3, 0.5)));
  photos.forEach((img, i) => { const at = t0 + 1.1 + i * 0.3, k = EZ.back(ev(at, 0.45)); if (k <= 0) return; const ang = -Math.PI / 2 + (i - (photos.length - 1) / 2) * 0.8 + TT * 0.08, rr = 380, x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr;
    ctx.save(); ctx.strokeStyle = 'rgba(255,59,59,0.8)'; ctx.lineWidth = 3; ctx.shadowColor = '#ff3b3b'; ctx.shadowBlur = 12; ctx.globalAlpha = clamp(k); ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * 262, cy + Math.sin(ang) * 262); ctx.lineTo(x - Math.cos(ang) * 70, y - Math.sin(ang) * 70); ctx.stroke(); ctx.restore();
    roundPhoto(img, x, y, 70, k, { ring: '#fff', lw: 5 }); });
}
// draw world rings R fitted inside a circle of radius r at (cx, cy) (for a centre shape), scale k
function shapeInCircle(R, cx, cy, r, k, o = {}) {
  if (k <= 0) return; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const q of R) for (const p of q) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  const s = (2 * r * k) / Math.max(x1 - x0, y1 - y0), mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  ctx.save(); ctx.beginPath(); for (const q of R) { q.forEach((p, i) => { const x = cx + (p[0] - mx) * s, y = cy + (p[1] - my) * s; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); }
  ctx.fillStyle = o.fill ?? G.orange; ctx.shadowColor = o.fill ?? G.orange; ctx.shadowBlur = 20; ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = '#fff3d6'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
}
// ---- 23b staircase timeline: year boxes joined by thick elbow arrows, a framed picture beside each (pic = asset name or null)
//      items [[year, line1, line2, pic], ...]; o.light = light paper look (dark boxes, orange arrows)
function timelineStairs(items, t0, dt, o = {}) {
  const bw = o.bw ?? 300, bh = 104, light = !!o.light, box = light ? '#2a1a0a' : '#fff', ink = light ? '#fff' : '#15100a', arrow = light ? '#b5530c' : '#fff', c1 = light ? '#2a1a0a' : '#fff', c2 = light ? '#b5530c' : G.orange;
  items.forEach(([yr, l1, l2, pic], i) => {
    const x = 80 + i * 130, y = (o.y0 ?? 450) + i * 220, at = t0 + i * dt, k = EZ.o3(ev(at, 0.35)); if (k <= 0) return;
    if (i > 0) { const px = 80 + (i - 1) * 130, py = (o.y0 ?? 450) + (i - 1) * 220, ka = ev(at - 0.25, 0.3); if (ka > 0) { const P = [[px + 40, py + bh + 10], [px + 40, y + bh / 2], [x - 18, y + bh / 2]], L = polyLen(P);
      ctx.save(); ctx.strokeStyle = arrow; ctx.lineWidth = 9; ctx.setLineDash([L * ka, L + 10]); ctx.beginPath(); P.forEach(([a, b], j) => (j ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.stroke(); ctx.restore();
      if (ka >= 1) { ctx.save(); ctx.fillStyle = arrow; ctx.beginPath(); ctx.moveTo(x - 2, y + bh / 2); ctx.lineTo(x - 30, y + bh / 2 - 18); ctx.lineTo(x - 30, y + bh / 2 + 18); ctx.closePath(); ctx.fill(); ctx.restore(); } } }
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = box; ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 12); ctx.fill(); ctx.restore();
    gText(yr, x + bw / 2, y + bh / 2 + (yr.length > 6 ? 11 : 20), yr.length > 6 ? 30 : 60, ink, { align: 'center', weight: 900, shadow: false, alpha: k });
    const tx = pic ? x : x + bw + 26, ty = pic ? y - 44 : y + 40;
    if (l1) gText(l1, tx, ty, 26, c1, { weight: 800, alpha: k, shadow: !light }); if (l2) gText(l2, tx, ty + 30, 28, c2, { weight: 900, alpha: k, shadow: !light });
    if (pic) { const fx0 = x + bw + 30, fw = Math.min(220, W - SAFE.right - 20 - fx0); if (fw > 110) framePhoto(pic, fx0, y - 40, fw, 170, k, null); }
  });
}
// ---- 23c flow path (v4): round photo nodes joined by a glowing elbow path, a light running along it, small shield nodes between
//      nodes [[x, y, img, label], ...]; path = screen polyline through them; shields [[x, y, fraction], ...]
function flowPath(nodes, path, shields, t0, o = {}) {
  const L = plLens(path), T = L[L.length - 1], f = EZ.io(seg(TT, t0 + 0.4, t0 + 3.0)), c = o.color ?? '#cfeaff';
  strokePl(plSub(path, L, 0, T * f), c, 5, 18);
  if (f >= 1) { const u = mod((TT - t0 - 3.0) / 1.2, 1); strokePl(plSub(path, L, T * u, Math.min(T, T * u + 120)), '#ffffff', 7, 24, Math.sin(Math.PI * u)); }
  else if (f > 0) { const [hx, hy] = plAt(path, L, T * f); ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = '#9fd8ff'; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(hx, hy, 9, 0, TAU); ctx.fill(); ctx.restore(); }
  shields.forEach(([x, y, pf]) => { if (f < pf) return; const k = EZ.back(clamp((f - pf) * 8)); ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.fillStyle = o.bg ?? '#8e8c87'; ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.shadowColor = '#9fd8ff'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(20, -14); ctx.lineTo(18, 10); ctx.quadraticCurveTo(0, 26, -18, 10); ctx.lineTo(-20, -14); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); });
  nodes.forEach(([x, y, img, l], i) => { const at = t0 + (i / Math.max(1, nodes.length - 1)) * 2.7, k = EZ.back(ev(at, 0.45)); roundPhoto(img, x, y, o.r ?? 120, k, { ring: '#ffffff', lw: 7 }); if (l) gText(l, x, y + (o.r ?? 120) + 40, 26, '#fff', { align: 'center', weight: 900, alpha: ev(at + 0.3, 0.3) }); });
}
// ---- 25 an article shown on a phone: doc = DOCS entry; scroll 0..1 down the page; hk 0..1 highlighter progress
function phoneDoc(doc, cx, cy, k, scroll, hk, o = {}) {
  const img = asset(doc.img); if (!img || k <= 0) return; const pw = 520, ph = 1040;
  ctx.save(); ctx.translate(cx, cy + (1 - k) * 900); ctx.rotate(o.rot ?? -0.05);
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20; ctx.fillStyle = '#0b0b0d'; ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 70); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 4; ctx.stroke();
  const sx = -pw / 2 + 18, sy = -ph / 2 + 18, sw = pw - 36, sh = ph - 36; ctx.save(); ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, 54); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(sx, sy, sw, sh);
  const sc = sw / doc.w, oy = sy + 90 - scroll * Math.max(0, doc.h * sc - sh + 90);
  ctx.drawImage(img, sx, oy, sw, doc.h * sc);
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#ffd84a'; let acc = 0; const tot = doc.rects.reduce((a, r) => a + r[2], 0);
  for (const [x, y, w, h] of doc.rects) { const take = clamp((hk * tot - acc) / w); acc += w; if (take <= 0) break; ctx.fillRect(sx + x * sc - 3, oy + y * sc - 3, w * sc * take + 6, h * sc + 6); }
  ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#f2f2f2'; ctx.fillRect(sx, sy, sw, 80); ctx.fillStyle = '#111'; ctx.font = `700 22px ${GFONT}`; ctx.fillText('9:41', sx + 50, sy + 52);
  ctx.restore(); ctx.fillStyle = '#0b0b0d'; ctx.beginPath(); ctx.roundRect(-80, -ph / 2 + 30, 160, 40, 20); ctx.fill();
  ctx.restore();
}
