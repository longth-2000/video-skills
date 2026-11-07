// =====================================================================
//  styles/geosat/overlay.js — camera, ground, boundaries, callouts, titles, charts and the STYLE hooks.
// =====================================================================
// ---- the map camera: world point (x, y) km at screen anchor, s px per km. Keys: [t, x, y, s, dur]
let GC = { x: 0, y: 0, s: 1 };
const GAX = () => W / 2, GAY = () => H * 0.45;
function gCamAt(keys, t) {
  let c = { x: keys[0][1], y: keys[0][2], s: keys[0][3] };
  for (let i = 1; i < keys.length; i++) {
    const [t0, x, y, s, d] = keys[i]; if (t < t0) break;
    const u = EZ.io(seg(t, t0, t0 + d));
    // zoom moves interpolate scale in log space and keep the path pleasant: centre follows the scale
    const ls = lerp(Math.log(c.s), Math.log(s), u), sc = Math.exp(ls);
    const w = (Math.abs(s - c.s) < 1e-6) ? u : (1 / c.s - 1 / sc) / (1 / c.s - 1 / s);
    c = { x: lerp(c.x, x, w), y: lerp(c.y, y, w), s: sc };
  }
  return c;
}
const gS = (x, y) => [GAX() + (x - GC.x) * GC.s, GAY() + (y - GC.y) * GC.s];
const gSP = (p) => gS(p[0], p[1]);
function gTrace(R) { ctx.beginPath(); for (const r of R) { r.forEach((p, i) => { const [x, y] = gSP(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); } }
// ---- the ground
function gFeather(t) {   // fade a texture's border so a finer level of detail blends into the coarser one
  const c = t.cv.getContext('2d'), N = t.px, f = N * 0.1;
  c.globalCompositeOperation = 'destination-in';
  const gx = c.createLinearGradient(0, 0, N, 0); gx.addColorStop(0, 'rgba(0,0,0,0)'); gx.addColorStop(f / N, '#000'); gx.addColorStop(1 - f / N, '#000'); gx.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = gx; c.fillRect(0, 0, N, N);
  const gy = c.createLinearGradient(0, 0, 0, N); gy.addColorStop(0, 'rgba(0,0,0,0)'); gy.addColorStop(f / N, '#000'); gy.addColorStop(1 - f / N, '#000'); gy.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = gy; c.fillRect(0, 0, N, N); c.globalCompositeOperation = 'source-over'; t.feathered = true;
}
function gGround(o = {}) {
  ctx.fillStyle = '#0d2433'; ctx.fillRect(0, 0, W, H);
  const lv = GTEX_DEF.some((d) => d.fade) ? GTEX_DEF.map((d, i) => [i, d.fade ? seg(GC.s, d.fade[0], d.fade[1]) : 1])
    : [[0, 1], [1, seg(GC.s, 1.3, 3.2)], [2, seg(GC.s, 9, 20)]];   // world pieces: per-box fade from geo.json "tex"
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  for (const [i, a] of lv) {
    if (a <= 0) continue;
    const t = gTex(i); if (i > 0 && !t.feathered) gFeather(t); if (a < 1e-3) continue;
    const [x0, y0] = gS(t.cx - t.span / 2, t.cy - t.span / 2), sz = t.span * GC.s;
    ctx.globalAlpha = a; ctx.drawImage(t.cv, x0, y0, sz, sz);
  }
  ctx.restore();
  // the references' grade: darker, a little desaturated, darker still where the overlays need contrast
  ctx.save(); ctx.globalAlpha = o.dim ?? 0.28; ctx.fillStyle = '#05090c'; ctx.fillRect(0, 0, W, H); ctx.restore();
}
// ---- boundaries and regions
function gRegion(R, o = {}) {
  ctx.save();
  if (o.fill) { gTrace(R); ctx.globalAlpha = o.fa ?? 0.55; ctx.fillStyle = o.fill; ctx.fill(); ctx.globalAlpha = 1; }
  if (o.line) {
    gTrace(R); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (o.frac != null && o.frac < 1) { const L = o.len ?? 9000; ctx.setLineDash([L * clamp(o.frac), L]); }
    if (o.glow) { ctx.shadowColor = o.line; ctx.shadowBlur = o.glow; }
    ctx.globalAlpha = o.la ?? 1; ctx.strokeStyle = o.line; ctx.lineWidth = o.lw ?? 4; ctx.stroke();
    if (o.glow) { ctx.shadowBlur = 0; ctx.lineWidth = (o.lw ?? 4) * 0.45; ctx.strokeStyle = o.core ?? '#fff3d6'; ctx.globalAlpha = (o.la ?? 1) * 0.7; ctx.stroke(); }
  }
  ctx.restore();
}
function gRingLen(R) { let L = 0; for (const r of R) for (let i = 0; i < r.length; i++) L += dist(gSP(r[i]), gSP(r[(i + 1) % r.length])); return L; }
function gLine(P, o = {}) {   // a route or arrow in world coords, written on by o.frac
  const S2 = P.map(gSP); let L = 0; for (let i = 1; i < S2.length; i++) L += dist(S2[i - 1], S2[i]);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); S2.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  const f = clamp(o.frac ?? 1);
  if (o.dash) ctx.setLineDash(o.dash); else ctx.setLineDash([L * f, L + 10]);
  if (o.glow) { ctx.shadowColor = o.color; ctx.shadowBlur = o.glow; }
  ctx.strokeStyle = o.color ?? G.orange; ctx.lineWidth = o.lw ?? 6; ctx.stroke();
  ctx.restore();
  return S2;
}
// ---- callouts (screen space): a flag box with a pointer down to the point, like the references
function gFlag(x, y, text, o = {}) {
  const k = o.pop ?? 1; if (k <= 0) return;
  const size = (o.size ?? 34), pad = size * 0.42, up = o.up ?? 70;
  ctx.save(); ctx.font = `800 ${size}px ${GFONT}`;
  const lines = String(text).split('\n'), tw = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const sub = o.sub ? (ctx.font = `600 ${size * 0.5}px ${GFONT}`, ctx.measureText(o.sub).width) : 0;
  const bw = Math.max(tw, sub) + pad * 2, bh = size * 1.25 * lines.length + (o.sub ? size * 0.7 : 0) + pad * 0.8;
  const side = o.side ?? 0;   // horizontal offset of the box relative to the point
  const bx = clamp(x + side - bw / 2, 30, W - SAFE.right - bw), by = y - up - bh;
  ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y);
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
  ctx.fillStyle = o.bg ?? G.orange;
  // pointer
  const px = clamp(x, bx + size * 0.4, bx + bw - size * 0.4);
  ctx.beginPath(); ctx.moveTo(px - size * 0.32, by + bh - 1); ctx.lineTo(x, y - 6); ctx.lineTo(px + size * 0.32, by + bh - 1); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 5); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = o.fg ?? '#15100a'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = `800 ${size}px ${GFONT}`;
  lines.forEach((l, i) => ctx.fillText(l, bx + bw / 2, by + pad * 0.4 + size * 1.02 + i * size * 1.25));
  if (o.sub) { ctx.font = `600 ${size * 0.5}px ${GFONT}`; ctx.globalAlpha = 0.85; ctx.fillText(o.sub, bx + bw / 2, by + bh - pad * 0.55); }
  ctx.restore();
}
function gPin(x, y, o = {}) {   // a map pin (screen space)
  const k = o.pop ?? 1; if (k <= 0) return; const r = (o.r ?? 22) * k;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 10;
  ctx.fillStyle = o.color ?? '#fff';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x - r * 1.1, y - r * 1.2, x - r, y - r * 2.4, x, y - r * 2.4); ctx.bezierCurveTo(x + r, y - r * 2.4, x + r * 1.1, y - r * 1.2, x, y); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = o.dot ?? '#1b1b1b'; ctx.beginPath(); ctx.arc(x, y - r * 1.55, r * 0.38, 0, TAU); ctx.fill();
  ctx.restore();
}
function gPulse(x, y, t0, color = G.orange, r0 = 20) {   // expanding rings on a point (life in held shots)
  ctx.save(); for (let i = 0; i < 2; i++) { const u = mod(TT - t0 + i * 0.6, 1.2) / 1.2; if (TT < t0) break; ctx.globalAlpha = (1 - u) * 0.8; ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, r0 + u * 70, 0, TAU); ctx.stroke(); } ctx.restore();
}
// ---- titles: a two-colour heavy title that types on letter by letter (the references type their titles)
function gType(str, t0, cps = 26) { const n = Math.floor(Math.max(0, TT - t0) * cps); return [...str].slice(0, n).join(''); }
function gTitle(lines, x, y, t0, o = {}) {
  ctx.save(); ctx.textAlign = o.align ?? 'left'; ctx.textBaseline = 'alphabetic';
  let tt = t0, yy = y;
  for (const [li, L] of lines.entries()) {
    if (li > 0) yy += (lines[li - 1].size ?? 74) * 0.28 + (L.size ?? 74) * 0.95 + 10;
    const size = L.size ?? 74; ctx.font = `${L.italic ? 'italic ' : ''}900 ${size}px ${GFONT}`;
    const s = gType(L.text, tt, o.cps ?? 30); tt += [...L.text].length / (o.cps ?? 30) + 0.08;
    ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 3;
    ctx.fillStyle = L.color ?? '#fff'; ctx.fillText(s, x, yy);
  }
  ctx.restore();
}
function gText(str, x, y, size, color = '#fff', o = {}) {
  ctx.save(); ctx.font = `${o.italic ? 'italic ' : ''}${o.weight ?? 800} ${size}px ${GFONT}`; ctx.textAlign = o.align ?? 'left'; ctx.textBaseline = o.base ?? 'alphabetic';
  if (o.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 2; }
  ctx.globalAlpha = o.alpha ?? 1; ctx.fillStyle = color; ctx.fillText(str, x, y); ctx.restore();
  ctx.save(); ctx.font = `${o.italic ? 'italic ' : ''}${o.weight ?? 800} ${size}px ${GFONT}`; const w = ctx.measureText(str).width; ctx.restore(); return w;
}
// a dark panel behind a chart (the references darken the map under their charts)
function gScrim(y0, y1, a = 0.6) {
  ctx.save(); const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, 'rgba(5,10,14,0)'); g.addColorStop(0.18, `rgba(5,10,14,${a})`); g.addColorStop(0.82, `rgba(5,10,14,${a})`); g.addColorStop(1, 'rgba(5,10,14,0)');
  ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0); ctx.restore();
}
// ---- charts (screen space), written on by progress u
function gGrid(x, y, w, h, nx, ny, a = 0.35) {
  ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 2;
  for (let i = 0; i <= nx; i++) { ctx.beginPath(); ctx.moveTo(x + w * i / nx, y); ctx.lineTo(x + w * i / nx, y + h); ctx.stroke(); }
  for (let j = 0; j <= ny; j++) { ctx.beginPath(); ctx.moveTo(x, y + h * j / ny); ctx.lineTo(x + w, y + h * j / ny); ctx.stroke(); }
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h); ctx.stroke();
  ctx.restore();
}
// vertical bars: items [{ label, v, color, text }], max, u per bar via o.t0 + i * o.stagger
function gBars(x, y, w, h, items, max, o = {}) {
  const n = items.length, gap = w / n, bw = gap * (o.bw ?? 0.56);
  items.forEach((it, i) => {
    const u = EZ.o3(seg(TT, (o.t0 ?? 0) + i * (o.stagger ?? 0.3), (o.t0 ?? 0) + i * (o.stagger ?? 0.3) + (o.dur ?? 0.9)));
    const bh = h * it.v / max * u, bx = x + gap * i + (gap - bw) / 2;
    ctx.save(); ctx.shadowColor = it.color; ctx.shadowBlur = it.glow ? 26 : 0;
    ctx.fillStyle = it.color; ctx.fillRect(bx, y + h - bh, bw, bh); ctx.restore();
    gText(it.label, bx + bw / 2, y + h + (o.ls ?? 36) + 12, o.ls ?? 36, '#fff', { align: 'center', weight: 700 });
    if (u > 0.05) gText(it.text ?? String(Math.round(it.v * u)), bx + bw / 2, y + h - bh - 16, o.vs ?? 40, it.tc ?? it.color, { align: 'center', weight: 900, alpha: clamp(u * 1.5) });
  });
}
function gDonut(x, y, r, parts, u, o = {}) {   // parts [{ v, color }], drawn clockwise from the top to u
  const tot = parts.reduce((a, p) => a + p.v, 0); let a0 = -Math.PI / 2;
  ctx.save(); ctx.lineWidth = o.lw ?? r * 0.36; ctx.lineCap = 'butt';
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  for (const p of parts) {
    const span = TAU * p.v / tot, end = Math.min(a0 + span, -Math.PI / 2 + TAU * clamp(u));
    if (end > a0) { ctx.strokeStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = p.glow ? 24 : 0; ctx.beginPath(); ctx.arc(x, y, r, a0, end + 0.004); ctx.stroke(); }
    a0 += span;
  }
  ctx.restore();
}
// ---- after every frame: vignette and a fine film grain (keyed on the frame)
let GGRAIN = null;
function gGrainTex() {
  if (GGRAIN) return GGRAIN; const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d'), im = c.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) { const v = gH(i % 256, Math.floor(i / 256), 444) * 255; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
  c.putImageData(im, 0, 0); GGRAIN = cv; return cv;
}
const STYLE = {
  name: 'geosat',
  paper: G.paper,
  backdrop(c) { fillAll(c); },
  window(P, key, src) { ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); },
  blob(P, c) { ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore(); },
  hero(x, y, r) { gPin(x, y + r, { r: r * 0.6 }); },
  heroColor: G.orange,
  post() {
    ctx.save();
    const g = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.28, W / 2, H * 0.5, H * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const gt = gGrainTex(), R = RNG('grain', F); ctx.globalAlpha = 0.05; ctx.globalCompositeOperation = 'overlay';
    const ox = Math.floor(R.f() * 256), oy = Math.floor(R.f() * 256);
    for (let y = -oy; y < H; y += 256) for (let x = -ox; x < W; x += 256) ctx.drawImage(gt, x, y);
    ctx.restore();
  },
  ones: true,
};
