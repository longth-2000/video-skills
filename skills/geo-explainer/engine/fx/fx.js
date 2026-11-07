// =====================================================================
//  FX — the techniques taken from the reference videos (refs-techniques.md):
//  globe, 3D type, tilted map, letter-blur reveals, subtitles, documents with a highlighter, charts
//  (line, pie, table, thermometer, pictograms, concentric rings, flow), photo grids, paper. Catalog: references/effects.md
//  Everything is screen space unless it says "world".
// =====================================================================
const SERIF = '"Iowan Old Style", "Palatino", "Times New Roman", Georgia, serif';
const SUBY = 1440;                       // subtitle baseline zone (everything else stays above ~1360)
const PAPER = '#e9e4da';

// ---- paper texture background (27)
let _paper = null;
function fxPaper(tint = PAPER, dark = false) {
  if (!_paper) {
    _paper = document.createElement('canvas'); _paper.width = 540; _paper.height = 960; const c = _paper.getContext('2d'), R = RNG('paper');
    const id = c.createImageData(540, 960);
    for (let y = 0; y < 960; y++) for (let x = 0; x < 540; x++) { const n = gFbm(x * 0.03, y * 0.03, 11) * 0.6 + R.f() * 0.4; const v = Math.round(200 + n * 55); const i = (y * 540 + x) * 4; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    c.putImageData(id, 0, 0);
  }
  ctx.save(); ctx.fillStyle = dark ? '#2a2d30' : tint; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = dark ? 'overlay' : 'multiply'; ctx.globalAlpha = dark ? 0.35 : 0.5; ctx.drawImage(_paper, 0, 0, W, H); ctx.restore();
  ctx.save(); const g = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.45, H * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, dark ? 'rgba(0,0,0,0.55)' : 'rgba(60,40,20,0.28)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}

// ---- letter-by-letter reveal with a blur (17): each glyph fades in from blurred and slightly low
function fxBlurText(str, x, y, size, color, t0, o = {}) {
  if (TT < t0) return 0;
  ctx.save(); ctx.font = `${o.italic ? 'italic ' : ''}${o.weight ?? 900} ${size}px ${o.font ?? GFONT}`; ctx.textBaseline = 'alphabetic';
  const chars = [...str], tw = ctx.measureText(str).width, cps = o.cps ?? 28;
  let cx = o.align === 'center' ? x - tw / 2 : o.align === 'right' ? x - tw : x;
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 14;
  chars.forEach((ch, i) => {
    const k = clamp((TT - t0 - i / cps) / 0.35), w = ctx.measureText(ch).width;
    if (k > 0) { ctx.globalAlpha = k * (o.alpha ?? 1); ctx.filter = k < 1 ? `blur(${(1 - k) * 10}px)` : 'none'; ctx.fillStyle = color; ctx.fillText(ch, cx, y + (1 - k) * 18); }
    cx += w;
  });
  ctx.restore(); return tw;
}

// ---- extruded 3D type (16, 3): depth layers in a darker colour under the face
function fx3DText(str, x, y, size, face, side, o = {}) {
  ctx.save(); ctx.font = `${o.italic ? 'italic ' : ''}900 ${size}px ${o.font ?? GFONT}`; ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = 'middle';
  const d = o.depth ?? Math.max(4, size * 0.09), dx = o.dx ?? 0.55, dy = o.dy ?? 1;
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = size * 0.25; ctx.shadowOffsetY = size * 0.08;
  for (let i = Math.ceil(d); i >= 1; i--) { ctx.fillStyle = i === Math.ceil(d) ? side : side; ctx.fillText(str, x + i * dx, y + i * dy); if (i === Math.ceil(d)) { ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; } }
  const g = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2); g.addColorStop(0, o.face2 ?? face); g.addColorStop(1, face);
  ctx.fillStyle = g; ctx.fillText(str, x, y);
  if (o.stroke) { ctx.lineWidth = 2; ctx.strokeStyle = o.stroke; ctx.strokeText(str, x, y); }
  ctx.restore();
}

let _landPat = null, _cloudPat = null;
function globeTextures() {
  if (_landPat) return;
  const mk = (N, f) => { const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), id = g.createImageData(N, N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = (y * N + x) * 4, v = f(x, y); id.data[i] = v[0]; id.data[i + 1] = v[1]; id.data[i + 2] = v[2]; id.data[i + 3] = v[3]; } g.putImageData(id, 0, 0); return c; };
  // seamless: blend the noise with its copies one tile away so the pattern repeats without seams
  const tile = (f, N) => (x, y) => { const u = x / N, v = y / N; return f(x, y) * (1 - u) * (1 - v) + f(x - N, y) * u * (1 - v) + f(x, y - N) * (1 - u) * v + f(x - N, y - N) * u * v; };
  const nL = tile((x, y) => gFbm(x * 0.012 + 50, y * 0.012 + 50, 5), 512), mL = tile((x, y) => gFbm(x * 0.05 + 59, y * 0.05 + 50, 7), 512), nC = tile((x, y) => gFbm(x * 0.01 + 90, y * 0.018 + 90, 13), 512);
  const land = mk(512, (x, y) => { const n = nL(x, y), m = mL(x, y), d = clamp((n - 0.45) * 2.2);
    const r = lerp(70, 150, d) + m * 25, g = lerp(105, 130, d) + m * 20, b = lerp(50, 80, d) + m * 12; return [r, g, b, 255]; });
  const cloud = mk(512, (x, y) => { const n = nC(x, y), a = clamp((n - 0.55) * 3.5); return [255, 255, 255, a * 200]; });
  _landPat = land; _cloudPat = cloud;
}
// ---- the globe (1): orthographic Earth, land from WORLD (lon/lat), an atmosphere rim and stars
function fxStars(seed = 'stars') { const R = RNG(seed); ctx.save(); for (let i = 0; i < 260; i++) { ctx.globalAlpha = 0.25 + R.f() * 0.6; ctx.fillStyle = '#fff'; const r = R.f() < 0.1 ? 2 : 1; ctx.fillRect(R.f() * W, R.f() * H, r, r); } ctx.restore(); }
function fxGlobe(cx, cy, R, lon0, lat0, o = {}) {
  const l0 = lon0 * Math.PI / 180, p0 = lat0 * Math.PI / 180, sp0 = Math.sin(p0), cp0 = Math.cos(p0);
  const pr = (lon, lat) => { const l = lon * Math.PI / 180, p = lat * Math.PI / 180, cl = Math.cos(l - l0);
    const cz = sp0 * Math.sin(p) + cp0 * Math.cos(p) * cl; return [cx + R * Math.cos(p) * Math.sin(l - l0), cy - R * (cp0 * Math.sin(p) - sp0 * Math.cos(p) * cl), cz]; };
  // ocean
  ctx.save();
  let g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.1, cx, cy, R); g.addColorStop(0, '#1f5f86'); g.addColorStop(0.7, '#0f3550'); g.addColorStop(1, '#071a28');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
  // land: rings with every point on the far side pushed onto the rim
  for (const ring of WORLD) {
    ctx.beginPath(); let vis = false;
    ring.forEach(([lon, lat], i) => { let [x, y, z] = pr(lon, lat); if (z > 0) vis = true; else { const a = Math.atan2(y - cy, x - cx); x = cx + Math.cos(a) * R; y = cy + Math.sin(a) * R; } i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    if (!vis) continue; ctx.closePath(); globeTextures(); const pat = ctx.createPattern(_landPat, 'repeat'); pat.setTransform(new DOMMatrix().translate(cx - R * l0 * 0.9, cy).scale(R / 700)); ctx.fillStyle = pat; ctx.fill();
  }
  // clouds drifting over everything, and the sun's glint on the sea
  { const cp = ctx.createPattern(_cloudPat, 'repeat'); cp.setTransform(new DOMMatrix().translate(cx - R * l0 * 0.9 + TT * 18, cy).scale(R / 520)); ctx.globalAlpha = 0.55 * clamp(1 - (R - 1200) / 1800); ctx.fillStyle = cp; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R); ctx.globalAlpha = 1;
    const sg = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, 0, cx - R * 0.35, cy - R * 0.4, R * 0.5); sg.addColorStop(0, 'rgba(255,255,240,0.28)'); sg.addColorStop(1, 'rgba(255,255,240,0)'); ctx.fillStyle = sg; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R); }
  // relief texture over land: a soft noise pattern
  // (no texture: the land reads cleaner flat)
  // highlight Vietnam
  if (o.vn) { ctx.beginPath(); for (const ring of (GEO.country || GEO.vn)) { ring.forEach((p, i) => { const lon = GEO.proj.lon0 + p[0] / (111.32 * Math.cos(GEO.proj.lat0 * Math.PI / 180)), lat = GEO.proj.lat0 - p[1] / 111.32; const [x, y] = pr(lon, lat); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); }
    ctx.fillStyle = `rgba(243,154,43,${0.22 * o.vn})`; ctx.fill(); ctx.strokeStyle = `rgba(255,255,255,${0.9 * o.vn})`; ctx.lineWidth = 2.5; ctx.stroke(); }
  // night side shading
  g = ctx.createRadialGradient(cx - R * 0.45, cy - R * 0.5, R * 0.2, cx, cy, R * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.75, 'rgba(0,0,0,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  ctx.restore();
  // atmosphere rim
  ctx.save(); g = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.12); g.addColorStop(0, 'rgba(120,190,255,0)'); g.addColorStop(0.45, 'rgba(120,190,255,0.5)'); g.addColorStop(1, 'rgba(120,190,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, 0, TAU); ctx.fill(); ctx.restore();
  return pr;
}

// ---- the tilted map (2): draw a map into an offscreen canvas, then lay it down in perspective strips.
//      tiltPt maps a flat screen point into the tilted frame (for labels drawn after).
let _tiltCv = null, TILT = 0;
const TILT_HC = H * 0.62, TILT_EXTRA = 900, TILT_X = 420;
function tiltPt(x, y) { if (!TILT) return [x, y]; const s = 1 / (1 + TILT * (TILT_HC - y) / H); return [W / 2 + (x - W / 2) * s, TILT_HC + (y - TILT_HC) * s]; }
function fxTilted(k, drawFlat) {
  TILT = 0;
  if (k <= 0.001) { drawFlat(); return; }
  if (!_tiltCv) { _tiltCv = document.createElement('canvas'); _tiltCv.width = W + 2 * TILT_X; _tiltCv.height = H + TILT_EXTRA; }
  const saved = ctx; ctx = _tiltCv.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#0d2433'; ctx.fillRect(0, 0, W + 2 * TILT_X, H + TILT_EXTRA);
  ctx.translate(TILT_X, TILT_EXTRA); drawFlat();
  ctx.fillStyle = 'rgba(5,9,12,0.4)'; ctx.fillRect(-TILT_X, -TILT_EXTRA, TILT_X, H + TILT_EXTRA); ctx.fillRect(W, -TILT_EXTRA, TILT_X, H + TILT_EXTRA); ctx.fillRect(0, -TILT_EXTRA, W, TILT_EXTRA);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx = saved;
  TILT = 1.25 * k;
  ctx.save(); ctx.fillStyle = '#0a141b'; ctx.fillRect(0, 0, W, H);
  const step = 6;
  for (let ys = -TILT_EXTRA; ys < H; ys += step) {
    const [, y0] = tiltPt(0, ys), [, y1] = tiltPt(0, ys + step); if (y1 < -4) continue;
    const s = 1 / (1 + TILT * (TILT_HC - (ys + step / 2)) / H); if (s <= 0) continue;
    const WW = W + 2 * TILT_X, w = WW * s; ctx.drawImage(_tiltCv, 0, ys + TILT_EXTRA, WW, step, W / 2 - w / 2, y0, w, y1 - y0 + 0.6);
  }
  // haze and soft focus toward the horizon (tilt-shift)
  const g = ctx.createLinearGradient(0, 0, 0, H * 0.5); g.addColorStop(0, `rgba(120,160,190,${0.55 * k})`); g.addColorStop(0.35, `rgba(40,70,90,${0.25 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * 0.5);
  ctx.restore();
}
const gSPt = (p) => tiltPt(...gSP(p));

// ---- vertical region name (4): a big rotated label beside or inside a region
function fxVName(str, x, y, size, color, k = 1, o = {}) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.a ?? -Math.PI / 2); ctx.globalAlpha = clamp(k);
  ctx.font = `900 ${size}px ${GFONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const s = [...str].slice(0, Math.ceil([...str].length * clamp(k * 1.4))).join('');
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 14; ctx.fillStyle = color; ctx.fillText(s, 0, 0); ctx.restore();
}

// ---- photo masked into a world region (5)
function fxPhotoRegion(name, R, k = 1, o = {}) {
  const img = asset(name); if (!img || k <= 0) return;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const r of R) for (const p of r) { const [x, y] = gSP(p); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const bw = x1 - x0, bh = y1 - y0, z = (o.zoom ?? 1.1), sc = Math.max(bw / img.naturalWidth, bh / img.naturalHeight) * z, dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
  ctx.save(); gTrace(R); ctx.clip(); ctx.globalAlpha = clamp(k);
  ctx.drawImage(img, x0 + (bw - dw) * (o.fx ?? 0.5), y0 + (bh - dh) * (o.fy ?? 0.5), dw, dh);
  ctx.restore();
}

// ---- extruded 3D region (6): the region raised as a slab, a hatched gold top
function fxSlab(R, h, k, o = {}) {
  if (k <= 0) return; const hh = h * k;
  ctx.save();
  for (let i = Math.ceil(hh); i > 0; i -= 2) { ctx.save(); ctx.translate(0, i); gTrace(R); ctx.fillStyle = i > hh - 2 ? '#3a2410' : '#7a4a16'; ctx.fill(); ctx.restore(); }
  gTrace(R); const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#f6b04a'); g.addColorStop(1, '#c97618'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); gTrace(R); ctx.clip(); ctx.strokeStyle = 'rgba(80,40,0,0.35)'; ctx.lineWidth = 3; for (let x = -H; x < W + H; x += 22) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke(); } ctx.restore();
  gTrace(R); ctx.strokeStyle = '#fff3d6'; ctx.lineWidth = 4; ctx.shadowColor = G.orange; ctx.shadowBlur = 20; ctx.stroke();
  ctx.restore();
}

// ---- neon routes (7) and things moving along them (8)
function fxNeon(lines, color, o = {}) {
  const f = clamp(o.frac ?? 1); if (f <= 0) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const pass = (lw, a, blur) => { ctx.globalAlpha = a; ctx.lineWidth = lw; ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.strokeStyle = color;
    for (const l of lines) { const n = Math.max(2, Math.ceil(l.length * f)); ctx.beginPath(); for (let i = 0; i < n; i++) { const [x, y] = o.tilt ? gSPt(l[i]) : gSP(l[i]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); } };
  if (o.dash) ctx.setLineDash(o.dash);
  pass((o.lw ?? 6) * 2.4, 0.25, 26); pass(o.lw ?? 6, 0.95, 12);
  if (!o.dash) { ctx.strokeStyle = '#fff'; pass((o.lw ?? 6) * 0.35, 0.8, 0); }
  ctx.restore();
}
function polyLen(P) { let L = 0; for (let i = 1; i < P.length; i++) L += dist(P[i - 1], P[i]); return L; }
function polyAt(P, u) { const L = polyLen(P) * clamp(u); let a = 0; for (let i = 1; i < P.length; i++) { const d = dist(P[i - 1], P[i]); if (a + d >= L) { const k = (L - a) / d; return [lerp(P[i - 1][0], P[i][0], k), lerp(P[i - 1][1], P[i][1], k), Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0])]; } a += d; } const n = P.length; return [P[n - 1][0], P[n - 1][1], 0]; }
// join line pieces into one long path (greedy, by nearest ends) — for an icon to ride along
function joinLines(lines) {
  const L = lines.map((l) => l.slice()); let path = L.shift();
  while (L.length) { let best = -1, bd = 1e9, rev = false, front = false; const a = path[0], b = path[path.length - 1];
    L.forEach((l, i) => { const s = l[0], e = l[l.length - 1]; [[dist(b, s), false, false], [dist(b, e), true, false], [dist(a, e), false, true], [dist(a, s), true, true]].forEach(([d, r, f]) => { if (d < bd) { bd = d; best = i; rev = r; front = f; } }); });
    if (bd > 3) break; let l = L.splice(best, 1)[0]; if (rev) l = l.reverse(); path = front ? l.concat(path) : path.concat(l); }
  return path;
}
function fxIcon(kind, x, y, s = 1, a = 0, color = '#fff') {   // small vehicle icons: 'car', 'train', 'boat', 'pot'
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); ctx.fillStyle = color; ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5;
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 8;
  if (kind === 'train') { ctx.beginPath(); ctx.roundRect(-34, -11, 68, 22, 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#29a3ff'; for (let i = -24; i < 24; i += 14) ctx.fillRect(i, -6, 9, 7); }
  else if (kind === 'car') { ctx.beginPath(); ctx.roundRect(-20, -10, 40, 20, 6); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#29a3ff'; ctx.fillRect(2, -7, 10, 14); }
  ctx.restore();
}
// distance oval with a label (8): an ellipse of dashes around two points, and a pill
function fxOval(p, q, label, k, color = '#fff') {
  if (k <= 0) return; const cx = (p[0] + q[0]) / 2, cy = (p[1] + q[1]) / 2, a = Math.atan2(q[1] - p[1], q[0] - p[0]), r = dist(p, q) / 2 + 60;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); ctx.setLineDash([16, 12]); ctx.lineWidth = 4; ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.42, 0, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(k)); ctx.stroke(); ctx.restore();
  if (k > 0.6) fxPill(label, cx, cy - (r * 0.42) - 34, 34, '#15100a', color, EZ.o3(clamp((k - 0.6) / 0.4)));
}
// a label in a coloured box (16)
function fxPill(str, x, y, size, fg, bg, k = 1, o = {}) {
  if (k <= 0) return; ctx.save(); ctx.font = `900 ${size}px ${o.font ?? GFONT}`; const w = ctx.measureText(str).width + size * 0.9, h = size * 1.45;
  const bx = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2; ctx.translate(bx + w / 2, y); ctx.scale(k, k); ctx.translate(-bx - w / 2, -y);
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 12; ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(bx, y - h / 2, w, h, 6); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, bx + w / 2, y + size * 0.04); ctx.restore(); return w;
}
// a big pin with an icon inside (9)
function fxBigPin(x, y, k, color, icon, o = {}) {
  if (k <= 0) return; const r = (o.r ?? 58) * k;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x - r * 1.1, y - r * 1.2, x - r * 1.2, y - r * 2.6, x, y - r * 2.6); ctx.bezierCurveTo(x + r * 1.2, y - r * 2.6, x + r * 1.1, y - r * 1.2, x, y); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y - r * 1.7, r * 0.8, 0, TAU); ctx.fill();
  ctx.translate(x, y - r * 1.7); ctx.scale(r / 58, r / 58); icon(); ctx.restore();
}
function iconPot(c = '#fff') { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-30, -14); ctx.quadraticCurveTo(0, 22, 30, -14); ctx.closePath(); ctx.fill(); ctx.fillRect(-6, 4, 12, 14); ctx.beginPath(); ctx.moveTo(-14, 26); ctx.lineTo(14, 26); ctx.lineTo(8, 16); ctx.lineTo(-8, 16); ctx.closePath(); ctx.fill(); }
function iconTemple(c = '#fff') { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-34, -6); ctx.quadraticCurveTo(0, -30, 34, -6); ctx.lineTo(26, -2); ctx.lineTo(-26, -2); ctx.closePath(); ctx.fill(); ctx.fillRect(-20, 0, 6, 24); ctx.fillRect(14, 0, 6, 24); ctx.fillRect(-26, 22, 52, 6); }
function iconPerson(x, y, s, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y - 22 * s, 8 * s, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.roundRect(x - 10 * s, y - 12 * s, 20 * s, 26 * s, 7 * s); ctx.fill(); }

// ---- the pedestal bowl of the Hoa Lộc culture (drawn, an illustration only)
function fxBatBong(x, y, s, k) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k);
  const g = ctx.createLinearGradient(-120, 0, 120, 0); g.addColorStop(0, '#6b3f22'); g.addColorStop(0.45, '#b9774a'); g.addColorStop(1, '#5a321a');
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-130, -60); ctx.quadraticCurveTo(-120, 30, -26, 44); ctx.lineTo(26, 44); ctx.quadraticCurveTo(120, 30, 130, -60); ctx.closePath(); ctx.fill();   // bowl
  ctx.beginPath(); ctx.moveTo(-26, 40); ctx.lineTo(-40, 120); ctx.quadraticCurveTo(0, 132, 40, 120); ctx.lineTo(26, 40); ctx.closePath(); ctx.fill();                        // pedestal
  ctx.beginPath(); ctx.ellipse(0, 122, 70, 16, 0, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#3d2212'; ctx.beginPath(); ctx.ellipse(0, -60, 130, 20, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(30,15,5,0.7)'; ctx.lineWidth = 3; for (let i = 0; i < 9; i++) { const xx = -96 + i * 24; ctx.beginPath(); ctx.moveTo(xx, -30); ctx.quadraticCurveTo(xx + 12, -12, xx + 24, -30); ctx.stroke(); }   // incised motif
  ctx.restore();
}

// ---- concentric rings (23)
function fxRings(cx, cy, rings, k) {
  rings.forEach((rg, i) => { const u = EZ.o3(clamp((k - i * 0.25) / 0.6)); if (u <= 0) return;
    ctx.save(); ctx.strokeStyle = rg.c; ctx.lineWidth = rg.lw ?? 10; ctx.shadowColor = rg.c; ctx.shadowBlur = 18; ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.arc(cx, cy, rg.r, -Math.PI / 2, -Math.PI / 2 + TAU * u); ctx.stroke(); ctx.restore(); });
}

// ---- line chart (18)
function fxLine(x, y, w, h, pts, ymin, ymax, u, o = {}) {
  const X = (i) => x + w * (pts.length === 1 ? 0.5 : (o.pad ?? 0.12) + (1 - 2 * (o.pad ?? 0.12)) * i / (pts.length - 1)), Y = (v) => y + h - h * (v - ymin) / (ymax - ymin);
  ctx.save(); ctx.strokeStyle = o.axis ?? 'rgba(30,30,30,0.35)'; ctx.lineWidth = 2; for (let j = 0; j <= 4; j++) { ctx.beginPath(); ctx.moveTo(x, y + h * j / 4); ctx.lineTo(x + w, y + h * j / 4); ctx.stroke(); } ctx.restore();
  const n = (pts.length - 1) * clamp(u);
  // area under
  ctx.save(); ctx.beginPath(); ctx.moveTo(X(0), y + h); for (let i = 0; i <= Math.floor(n); i++) ctx.lineTo(X(i), Y(pts[i].v)); if (n % 1) { const i = Math.floor(n), f = n - i; ctx.lineTo(lerp(X(i), X(i + 1), f), lerp(Y(pts[i].v), Y(pts[i + 1].v), f)); ctx.lineTo(lerp(X(i), X(i + 1), f), y + h); } else ctx.lineTo(X(Math.floor(n)), y + h);
  ctx.closePath(); const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, (o.color ?? G.orange) + '88'); g.addColorStop(1, (o.color ?? G.orange) + '00'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
  ctx.save(); ctx.strokeStyle = o.color ?? G.orange; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  for (let i = 0; i <= Math.floor(n); i++) i ? ctx.lineTo(X(i), Y(pts[i].v)) : ctx.moveTo(X(i), Y(pts[i].v));
  if (n % 1) { const i = Math.floor(n), f = n - i; ctx.lineTo(lerp(X(i), X(i + 1), f), lerp(Y(pts[i].v), Y(pts[i + 1].v), f)); } ctx.stroke(); ctx.restore();
  pts.forEach((p, i) => { if (i > n + 1e-6) return; const k = clamp((n - i) * 3 + 1);
    ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = o.color ?? G.orange; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(X(i), Y(p.v), 14 * k, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
    gText(p.label, X(i), y + h + 46, 34, o.ink ?? '#222', { align: 'center', weight: 900, shadow: false, alpha: k });
    gText(p.text, X(i), Y(p.v) - 34, 42, o.ink ?? '#222', { align: 'center', weight: 900, shadow: false, alpha: k }); });
}

// ---- pie (19), drawn on the map at a world point or anywhere on screen
function fxPie(cx, cy, r, parts, u, o = {}) {
  const tot = parts.reduce((a, p) => a + p.v, 0); let a0 = -Math.PI / 2; const end = a0 + TAU * clamp(u);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20;
  for (const p of parts) { const a1 = a0 + TAU * p.v / tot, b = Math.min(a1, end); if (b > a0) { ctx.fillStyle = p.c; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, b); ctx.closePath(); ctx.fill(); }
    if (u >= 1 && o.labels) { const am = (a0 + a1) / 2; gText(p.text ?? String(p.v), cx + Math.cos(am) * r * 0.66, cy + Math.sin(am) * r * 0.66 + 13, 36, p.fg ?? '#fff', { align: 'center', weight: 900 }); }
    a0 = a1; }
  ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); ctx.restore();
}

// ---- a tilted 3D pie standing on the map (19): wedges in their layout order, each sweeping in at its own time,
//      popping out a little then settling; walls on the front half; labels inside
function fxPie3D(cx, cy, r, parts, o = {}) {
  const sy = o.sy ?? 0.6, d = o.depth ?? 38, tot = parts.reduce((a, p) => a + p.v, 0);
  let a = -Math.PI / 2; const W2 = parts.map((p) => { const a0 = a, a1 = a + TAU * p.v / tot; a = a1; const k = EZ.o3(ev(p.at, 0.45)); const off = 26 * Math.sin(Math.PI * clamp((TT - p.at) / 0.8)) * (TT > p.at ? 1 : 0); return { ...p, a0, a1, end: a0 + (a1 - a0) * k, k, off }; });
  const P = (ang, rr, dy = 0, w = null) => { const m = w ? (w.a0 + w.a1) / 2 : 0, ox = w ? Math.cos(m) * w.off : 0, oy = w ? Math.sin(m) * w.off * sy : 0; return [cx + ox + Math.cos(ang) * rr, cy + oy + Math.sin(ang) * rr * sy + dy]; };
  const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * f)); return `rgb(${c.join(',')})`; };
  ctx.save(); const any = W2.some((w) => w.k > 0); if (any) { ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.filter = 'blur(18px)'; ctx.beginPath(); ctx.ellipse(cx, cy + d + 24, r * 1.05, r * sy * 1.05, 0, 0, TAU); ctx.fill(); } ctx.restore();
  // walls (front half only: angles with sin > 0)
  for (const w of W2) { if (w.k <= 0) continue; const s0 = Math.max(w.a0, 0), s1 = Math.min(w.end, Math.PI);
    const segs = []; for (const [lo, hi] of [[w.a0, w.end]]) { const L = Math.max(lo, 0), Hh = Math.min(hi, Math.PI); if (Hh > L) segs.push([L, Hh]); const L2 = Math.max(lo, TAU), H2 = Math.min(hi, TAU + Math.PI); if (H2 > L2) segs.push([L2, H2]); }
    for (const [lo, hi] of segs) { ctx.beginPath(); const n = 24; for (let i = 0; i <= n; i++) { const [x, y] = P(lerp(lo, hi, i / n), r, 0, w); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } for (let i = n; i >= 0; i--) { const [x, y] = P(lerp(lo, hi, i / n), r, d, w); ctx.lineTo(x, y); } ctx.closePath(); ctx.fillStyle = shade(w.c, 0.6); ctx.fill(); } }
  // tops
  for (const w of W2) { if (w.k <= 0) continue; ctx.beginPath(); const [ox, oy] = P(0, 0, 0, w); ctx.moveTo(ox, oy); const n = 40; for (let i = 0; i <= n; i++) { const [x, y] = P(lerp(w.a0, w.end, i / n), r, 0, w); ctx.lineTo(x, y); } ctx.closePath();
    const g = ctx.createLinearGradient(0, cy - r * sy, 0, cy + r * sy); g.addColorStop(0, shade(w.c, 1.08 > 1 ? 1 : 1)); g.addColorStop(1, shade(w.c, 0.85)); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 4; ctx.stroke(); }
  // labels
  for (const w of W2) { if (w.k < 0.6) continue; const m = (w.a0 + w.a1) / 2, [x, y] = P(m, r * 0.6, 0, w), al = clamp((w.k - 0.6) / 0.4);
    gText(w.label, x, y - 6, 26, w.fg ?? '#fff', { align: 'center', weight: 900, alpha: al }); gText(w.sub, x, y + 34, 34, w.fg ?? '#fff', { align: 'center', weight: 900, alpha: al }); }
}

// ---- a table built row by row (20)
function fxTable(x, y, w, cols, rows, t0, o = {}) {
  const rh = o.rh ?? 74, hdr = o.hdr ?? G.orange;
  ctx.save(); const k0 = EZ.o3(ev(t0, 0.35)); ctx.globalAlpha = k0; ctx.fillStyle = hdr; ctx.fillRect(x, y, w * k0, rh); ctx.restore();
  let cx = x; cols.forEach((c) => { gText(c.h, cx + 18, y + rh / 2 + 12, 30, '#15100a', { weight: 900, shadow: false, alpha: k0 }); cx += c.w * w; });
  rows.forEach((r, i) => { const k = EZ.o3(ev(t0 + 0.3 + i * (o.stagger ?? 0.35), 0.35)); if (k <= 0) return; const yy = y + rh * (i + 1);
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = r.hl ? 'rgba(243,154,43,0.25)' : o.dark ? (i % 2 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)') : i % 2 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.35)'; ctx.fillRect(x + (1 - k) * 40, yy, w, rh);
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, yy + rh); ctx.lineTo(x + w, yy + rh); ctx.stroke(); ctx.restore();
    let cx = x; r.c.forEach((v, j) => { gText(String(v), cx + 18 + (1 - k) * 40, yy + rh / 2 + 12, j === 0 ? 30 : 36, r.color && j === 0 ? r.color : o.dark ? '#fff' : '#1b1b1b', { weight: j === 0 ? 800 : 900, shadow: false, alpha: k, align: cols[j].align === 'right' ? 'right' : 'left', ...(cols[j].align === 'right' ? {} : {}) }); cx += cols[j].w * w; });
    if (r.hl) { ctx.save(); ctx.strokeStyle = G.orange; ctx.lineWidth = 5; ctx.globalAlpha = k; ctx.strokeRect(x - 3, yy - 3, w + 6, rh + 6); ctx.restore(); } });
}

// ---- thermometer bars (22): vertical tubes filling up, a bulb at the foot
function fxThermo(x, yTop, yBot, v, max, color, label, txt, k) {
  const r = 34, h = yBot - yTop, f = clamp(v / max) * EZ.o3(clamp(k));
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(x - 22, yTop, 44, h, 22); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(x, yBot + r * 0.6, r, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(x, yBot + r * 0.6, r - 8, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.roundRect(x - 13, yBot - h * f, 26, h * f + 10, 13); ctx.fill(); ctx.restore();
  gText(label, x, yBot + r * 0.6 + 74, 30, '#fff', { align: 'center', weight: 900 });
  if (k > 0.2) gText(txt, x, yBot - h * f - 22, 42, color, { align: 'center', weight: 900, alpha: clamp(k * 2) });
}

// ---- a pictogram grid of people (21)
function fxPeople(x, y, n, perRow, s, color, k, o = {}) {
  const sh = Math.ceil(n * clamp(k)); for (let i = 0; i < sh; i++) { const c = i % perRow, r = Math.floor(i / perRow), a = clamp((k * n - i) * 0.6);
    ctx.save(); ctx.globalAlpha = a; iconPerson(x + c * 46 * s, y + r * 66 * s, s, i >= (o.hiFrom ?? 1e9) ? (o.hi ?? G.orange) : color); ctx.restore(); }
}

// ---- documents (24): a page on a card, a yellow highlighter sweeping across the key lines, a source line
// DOCS lives in the piece (src/scenes.js): { key: { img, w, h, rects: [[x, y, w, h], ...] } } — written by scripts/doc_capture.mjs
if (typeof DOCS === 'undefined') var DOCS = {};
// the page: a white article column, a little tilted, two sheets under it; it pushes in toward the sentence while a
// highlighter sweeps it line by line (multiply, so the ink stays black)
function fxDoc(name, t0, tHl, o = {}) {
  const D = DOCS[name], img = asset(D.img); if (!img) return;
  const k = EZ.o3(ev(t0, 0.55)), u = EZ.io(clamp((TT - t0) / Math.max(1, o.dur ?? 5)));
  const PX = 110, PY = 520, PW = 860, PH = 820, rot = -0.025;
  const rx0 = Math.min(...D.rects.map((r) => r[0])), rx1 = Math.max(...D.rects.map((r) => r[0] + r[2])), ry0 = Math.min(...D.rects.map((r) => r[1])), ry1 = Math.max(...D.rects.map((r) => r[1] + r[3]));
  const fit = (PW - 36) / D.w, z = fit * lerp(1.0, o.zoom ?? 1.08, u), fx = D.w / 2, fy = (ry0 + ry1) / 2;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(PX + PW / 2, PY + PH / 2 + (1 - k) * 260); ctx.rotate(rot * (0.6 + 0.4 * k));
  for (let i = 2; i >= 1; i--) { ctx.save(); ctx.rotate(0.035 * i * (i % 2 ? 1 : -1)); ctx.translate(14 * i, 10 * i); ctx.fillStyle = i === 2 ? '#cfc9bd' : '#e6e1d7'; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.fillRect(-PW / 2, -PH / 2, PW, PH); ctx.restore(); }
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 44; ctx.shadowOffsetY = 14; ctx.fillStyle = '#fff'; ctx.fillRect(-PW / 2, -PH / 2, PW, PH); ctx.restore();
  ctx.beginPath(); ctx.rect(-PW / 2 + 18, -PH / 2 + 18, PW - 36, PH - 36); ctx.clip();
  // keep the sentence at the page's centre while zooming, but never show past the column's edges
  const ox = clamp(-fx * z, PW / 2 - 18 - D.w * z, -PW / 2 + 18), oy = clamp(-fy * z, PH / 2 - 18 - D.h * z, -PH / 2 + 18);
  ctx.drawImage(img, ox, oy, D.w * z, D.h * z);
  const hk = clamp((TT - tHl) / (o.hlDur ?? 1.4)), total = D.rects.reduce((a, r) => a + r[2], 0); let acc = 0;
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = o.hl ?? '#ffd84a';
  for (const [x, y, w, h] of D.rects) { const take = clamp((hk * total - acc) / w); acc += w; if (take <= 0) break; ctx.fillRect(ox + x * z - 6, oy + y * z - 5, w * z * take + 12, h * z + 10); }
  ctx.restore();
  // the source, above the page (as the references put it)
}
// a paper-document icon (for the header above a page)
function iconDoc(x, y, s, c) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-22, -30); ctx.lineTo(10, -30); ctx.lineTo(24, -16); ctx.lineTo(24, 30); ctx.lineTo(-22, 30); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -30); ctx.lineTo(10, -16); ctx.lineTo(24, -16); ctx.stroke(); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-12, -6 + i * 12); ctx.lineTo(14, -6 + i * 12); ctx.stroke(); } ctx.restore(); }

// ---- a flat target of concentric circles (23), as the references draw it: a dashed orbit, a filled disc,
//      an orange ring, a thin dark ring and a core. k builds it from the outside in.
function fxTarget(cx, cy, R, k, o = {}) {
  const c = o.colors ?? { orbit: 'rgba(90,80,65,0.6)', disc: '#d8ccb6', ring: G.orange, thin: '#6b5a45', core: '#b8946a' };
  const st = (i) => EZ.o3(clamp((k - i * 0.14) / 0.45));
  let a = st(0); if (a > 0) { ctx.save(); ctx.strokeStyle = c.orbit; ctx.lineWidth = 3; ctx.setLineDash([10, 9]); ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + TAU * a); ctx.stroke(); ctx.restore(); }
  a = st(1); if (a > 0) { ctx.save(); ctx.fillStyle = c.disc; ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(cx, cy, R * 0.9 * a, 0, TAU); ctx.fill(); ctx.restore(); }
  a = st(2); if (a > 0) { ctx.save(); ctx.strokeStyle = c.ring; ctx.lineWidth = R * 0.07; ctx.beginPath(); ctx.arc(cx, cy, R * 0.72, -Math.PI / 2, -Math.PI / 2 + TAU * a); ctx.stroke(); ctx.restore(); }
  a = st(3); if (a > 0) { ctx.save(); ctx.strokeStyle = c.thin; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R * 0.55 * a, 0, TAU); ctx.stroke(); ctx.restore(); }
  a = st(4); if (a > 0) { ctx.save(); ctx.fillStyle = c.core; ctx.beginPath(); ctx.arc(cx, cy, R * 0.42 * a, 0, TAU); ctx.fill(); ctx.restore(); }
  return st(4);
}

// ---- photo grid (13): 2x2 tiles with orange frames and labels, popping in one by one
function fxGrid(items, t0, o = {}) {
  const gx = o.x ?? 60, gy = o.y ?? 300, gw = o.w ?? 840, gh = o.h ?? 960, gap = 22, cols = o.cols ?? 2, rows = Math.ceil(items.length / cols);
  const tw = (gw - gap * (cols - 1)) / cols, th = (gh - gap * (rows - 1)) / rows;
  items.forEach((it, i) => { const c = i % cols, r = Math.floor(i / cols), k = EZ.o3(ev(t0 + i * (o.stagger ?? 0.3), 0.45)); if (k <= 0) return;
    const x = gx + c * (tw + gap), y = gy + r * (th + gap), img = asset(it.img); if (!img) return;
    ctx.save(); ctx.globalAlpha = k; ctx.translate(x + tw / 2, y + th / 2); ctx.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k); ctx.translate(-x - tw / 2, -y - th / 2);
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 24; ctx.fillStyle = it.c ?? G.orange; ctx.beginPath(); ctx.roundRect(x - 5, y - 5, tw + 10, th + 10, 12); ctx.fill(); ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.roundRect(x, y, tw, th, 8); ctx.clip(); const z = 1.05 + 0.06 * clamp((TT - t0) / 6), sc = Math.max(tw / img.naturalWidth, th / img.naturalHeight) * z, dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
    ctx.drawImage(img, x + (tw - dw) / 2, y + (th - dh) * (it.fy ?? 0.5), dw, dh);
    const g = ctx.createLinearGradient(0, y + th * 0.55, 0, y + th); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.75)'); ctx.fillStyle = g; ctx.fillRect(x, y, tw, th);
    ctx.restore();
    gText(it.label, x + 18, y + th - 22, it.size ?? 30, '#fff', { weight: 900, alpha: k });
  });
}

// ---- photo with outlined objects (12): a photo full screen, panning; outlines + labels in image coordinates
function fxPhotoPan(name, t0, t1, fxa, fxb, o = {}) {
  const img = asset(name); if (!img) return null;
  const u = EZ.io(clamp((TT - t0) / Math.max(1, t1 - t0))), z = (o.zoom ?? 1.05) + (o.zoom2 ?? 0.06) * u;
  const sc = Math.max(W / img.naturalWidth, H / img.naturalHeight) * z, dw = img.naturalWidth * sc, dh = img.naturalHeight * sc, fx = lerp(fxa, fxb, u);
  const x0 = (W - dw) * fx, y0 = (H - dh) * (o.fy ?? 0.5);
  ctx.save(); if (o.filter) ctx.filter = o.filter; ctx.drawImage(img, x0, y0, dw, dh); ctx.restore();
  return (nx, ny) => [x0 + nx * dw, y0 + ny * dh];
}
function fxOutline(map, box, label, k, color = G.orange, o = {}) {
  if (k <= 0) return; const [x0, y0] = map(box[0], box[1]), [x1, y1] = map(box[2], box[3]);
  const vis = clamp(Math.min(x1 - 20, W - 20 - x0) / 120); if (vis <= 0) return; k *= vis;   // fade as the pan carries it off the frame
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.shadowColor = color; ctx.shadowBlur = 16; ctx.setLineDash([]);
  const per = 2 * ((x1 - x0) + (y1 - y0)); ctx.setLineDash([per * clamp(k), per]); ctx.beginPath(); ctx.roundRect(x0, y0, x1 - x0, y1 - y0, 18); ctx.stroke(); ctx.restore();
  if (k > 0.5) fxPill(label, clamp((x0 + x1) / 2 + (o.dx ?? 0), 140, 820), (o.below ? y1 + 40 : y0 - 36), 32, '#15100a', color, EZ.o3(clamp((k - 0.5) * 2)));
}

// ---- flow diagram (23): boxes on the left joined by elbow arrows to boxes on the right
function fxElbow(x0, y0, x1, y1, color, k) {
  if (k <= 0) return; const xm = (x0 + x1) / 2, P = [[x0, y0], [xm, y0], [xm, y1], [x1, y1]];
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.lineJoin = 'round'; const L = polyLen(P); ctx.setLineDash([L * clamp(k), L + 10]);
  ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
  if (k >= 1) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 16, y1 - 9); ctx.lineTo(x1 - 16, y1 + 9); ctx.closePath(); ctx.fill(); ctx.restore(); }
}

// ---- inset map (23): a small framed map of Vietnam with one region lit
function fxInset(x, y, w, h, k, o = {}) {
  if (k <= 0) return; ctx.save(); ctx.globalAlpha = clamp(k); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 20; ctx.fillStyle = '#0c1820'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.clip();
  // fit Vietnam into the box
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const r of (GEO.country || GEO.vn)) for (const p of r) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  const s = Math.min((w - 30) / (x1 - x0), (h - 30) / (y1 - y0)), ox = x + (w - (x1 - x0) * s) / 2 - x0 * s, oy = y + (h - (y1 - y0) * s) / 2 - y0 * s;
  const tr = (R) => { ctx.beginPath(); for (const r of R) { r.forEach((p, i) => (i ? ctx.lineTo(ox + p[0] * s, oy + p[1] * s) : ctx.moveTo(ox + p[0] * s, oy + p[1] * s))); ctx.closePath(); } };
  tr(GEO.country || GEO.vn); ctx.fillStyle = '#4a5a3a'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
  if (o.region) { tr(o.region); ctx.fillStyle = G.orange; ctx.fill(); }
  ctx.restore();
  gText(o.label ?? 'VIỆT NAM', x + 16, y + 36, 22, '#fff', { weight: 900, alpha: clamp(k) });
}

// ---- subtitles (15): the narration, a phrase at a time, white on a soft dark band, an orange bar at the left
const SUBS = (() => {
  const out = [];
  for (const l of VOICE.lines) {
    const words = l.words && l.words.length ? l.words : [{ w: l.text, t0: l.t0, t1: l.t1 }];
    let cur = [], ch = 0;
    const push = () => { if (!cur.length) return; out.push({ t0: cur[0].t0, t1: cur[cur.length - 1].t1, text: cur.map((w) => w.w).join(' ') }); cur = []; ch = 0; };
    words.forEach((w, i) => { cur.push(w); ch += w.w.length + 1; const end = /[,.:;?!]$/.test(w.w); if (ch > 34 || (end && ch > 14)) push(); });
    push();
  }
  for (let i = 0; i < out.length; i++) out[i].t1 = Math.min((out[i + 1] ? out[i + 1].t0 : 1e9), out[i].t1 + 0.35);
  return out;
})();
function fxSubtitle() {
  const s = SUBS.find((q) => TT >= q.t0 - 0.05 && TT < q.t1); if (!s) return;
  const k = clamp((TT - s.t0 + 0.05) / 0.15);
  ctx.save(); ctx.font = `800 40px ${GFONT}`; const tw = ctx.measureText(s.text).width, x = 70, y = SUBY;
  const g = ctx.createLinearGradient(0, y - 90, 0, y + 50); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.4, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.globalAlpha = k; ctx.fillStyle = g; ctx.fillRect(0, y - 90, W, 140);
  ctx.fillStyle = G.orange; ctx.fillRect(x, y - 38, 8, 50);
  ctx.restore();
  gText(s.text, x + 26, y, 40, '#fff', { weight: 800, alpha: k });
}
