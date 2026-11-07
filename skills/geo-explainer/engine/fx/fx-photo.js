// =====================================================================
//  FX-PHOTO — photo display effects P01–P12 (references/effects.md "Photo effects").
//  Same look as the rest: white rounded frames, orange labels, small type, a slow push-in on every photo.
// =====================================================================
function drawCover(img, x, y, w, h, z = 1, fx = 0.5, fy = 0.5, filter) {   // draw img covering the box (x,y,w,h)
  if (!img) return; const sc = Math.max(w / img.naturalWidth, h / img.naturalHeight) * z, dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); if (filter) ctx.filter = filter; ctx.drawImage(img, x + (w - dw) * fx, y + (h - dh) * fy, dw, dh); ctx.restore();
}
const pushZ = (t0, d = 6, a = 0.07) => 1.03 + a * EZ.io(clamp((TT - t0) / d));

// ---- P01 photo callout on the map: white frame, pointer to the spot, name under the photo; pops then grows slowly
function photoCallout(img, px, py, label, t0, o = {}) {
  const k = EZ.back(clamp((TT - t0) / 0.45)); if (TT < t0) return; const im = asset(img); if (!im) return;
  const w = (o.w ?? 360) * (1 + 0.04 * seg(TT, t0, t0 + 5)), h = (o.h ?? 250) * (1 + 0.04 * seg(TT, t0, t0 + 5)), up = o.up ?? 90;
  const x = clamp(px + (o.side ?? 0) - w / 2, 30, W - SAFE.right - w - 10), y = py - up - h - 56;
  ctx.save(); ctx.translate(px, py); ctx.scale(k, k); ctx.translate(-px, -py);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 24; ctx.fillStyle = '#fff';
  const qx = clamp(px, x + 40, x + w - 40); ctx.beginPath(); ctx.moveTo(qx - 22, y + h + 54); ctx.lineTo(px, py - 4); ctx.lineTo(qx + 22, y + h + 54); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.roundRect(x - 8, y - 8, w + 16, h + 62, 18); ctx.fill(); ctx.shadowBlur = 0;
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.clip(); drawCover(im, x, y, w, h, pushZ(t0), o.fx, o.fy); ctx.restore();
  ctx.fillStyle = '#15100a'; ctx.font = `900 ${o.size ?? 28}px ${GFONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x + w / 2, y + h + 27);
  ctx.restore(); ctx.save(); ctx.fillStyle = o.color ?? G.orange; ctx.beginPath(); ctx.arc(px, py, 9 * k, 0, TAU); ctx.fill(); ctx.restore();
}
// ---- P02 full-screen photo with a small map in a corner showing where it was taken
//      drawMap(): draws the map layers for GC (set here to centre on pt at scale s)
function photoMiniMap(img, pt, s, drawMap, t0, o = {}) {
  const im = asset(img); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); drawCover(im, 0, 0, W, H, pushZ(t0), o.fx ?? 0.5, o.fy ?? 0.5);
  footShade(0.55);
  const k = EZ.back(ev(t0 + 0.5, 0.45)); if (k <= 0) return; const bw = 330, bh = 330, bx = 60, by = 1040;
  ctx.save(); ctx.translate(bx + bw / 2, by + bh / 2); ctx.scale(k, k); ctx.translate(-bx - bw / 2, -by - bh / 2);
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 30; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(bx - 7, by - 7, bw + 14, bh + 14, 22); ctx.fill(); ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 16); ctx.clip();
  const keep = { ...GC }; GC = { x: pt[0] - (bx + bw / 2 - GAX()) / s, y: pt[1] - (by + bh / 2 - GAY()) / s, s }; drawMap(); const [px, py] = gSP(pt); GC = keep;
  gPulse(px, py, t0 + 0.6, o.color ?? G.orange, 8); ctx.fillStyle = o.color ?? G.orange; ctx.beginPath(); ctx.arc(px, py, 10, 0, TAU); ctx.fill(); ctx.restore();
  if (o.label) fxPill(o.label, bx + bw + 30, by + bh - 30, 34, '#fff', o.color ?? G.orange, popS(t0 + 0.8), { align: 'left' });
}
// ---- P03 photos popping along a route as the head passes: path world pts, items [{ u, img, label, side }]
function photosAlongRoute(path, items, t0, t1, o = {}) {
  const P = path.map(gSP), L = plLens(P), T = L[L.length - 1], f = EZ.io(seg(TT, t0, t1));
  strokePl(plSub(P, L, 0, T * f), o.color ?? G.orange, 6, 14);
  if (f > 0 && f < 1) { const [hx, hy] = plAt(P, L, T * f); ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = o.color ?? G.orange; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(hx, hy, 9, 0, TAU); ctx.fill(); ctx.restore(); }
  for (const it of items) { const at = t0 + (t1 - t0) * it.u; if (TT < at) continue; const [x, y] = plAt(P, L, T * it.u); photoCallout(it.img, x, y, it.label, at, { w: 280, h: 190, up: 40, side: it.side ?? 0, size: 24 }); }
}
// ---- P04 the frame split into 2–3 horizontal bands, each sliding in from alternate sides, white rules between
function splitPanels(items, t0, o = {}) {
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, H); const n = items.length, top = o.top ?? 0, hh = (H - top) / n;
  items.forEach((it, i) => { const k = EZ.o3(ev(t0 + i * (o.stagger ?? 0.3), 0.55)), dx = (i % 2 ? 1 : -1) * W * (1 - k), y = top + i * hh;
    ctx.save(); ctx.translate(dx, 0); drawCover(asset(it.img), 0, y, W, hh, pushZ(t0 + i * 0.3, 6, 0.08), it.fx ?? 0.5, it.fy ?? 0.5);
    const g = ctx.createLinearGradient(0, y + hh * 0.55, 0, y + hh); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = g; ctx.fillRect(0, y, W, hh);
    if (it.label) fxPill(it.label, 50, y + hh - 50, 28, '#15100a', it.c ?? G.orange, popS(t0 + i * 0.3 + 0.5), { align: 'left' }); ctx.restore(); });
  ctx.fillStyle = '#fff'; for (let i = 1; i < n; i++) { const k = EZ.o3(ev(t0 + 0.5, 0.4)); ctx.fillRect(0, top + i * hh - 4, W * k, 8); }
}
// ---- P05 polaroids fanning out like cards, then the hero lifts to the front and grows
function polaroid(img, x, y, w, rot, s = 1, o = {}) {
  const im = asset(img); if (!im) return; const h = w * 0.82, pad = w * 0.06;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#f7f4ee'; ctx.fillRect(-w / 2 - pad, -h / 2 - pad, w + 2 * pad, h + pad * 4.2); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  drawCover(im, -w / 2, -h / 2, w, h, 1.04); if (o.label) { ctx.fillStyle = '#2a2a2a'; ctx.font = `700 ${Math.round(w * 0.07)}px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.label, 0, h / 2 + pad * 1.9); }
  ctx.restore();
}
function fanPolaroids(items, hero, t0, o = {}) {
  const n = items.length, f = EZ.o3(ev(t0, 0.9)), lift = EZ.io(seg(TT, t0 + (o.tHero ?? 1.8), t0 + (o.tHero ?? 1.8) + 0.8));
  const order = items.map((it, i) => i).filter((i) => i !== hero).concat([hero]);
  for (const i of order) { const a = (i - (n - 1) / 2) * (n > 3 ? 0.36 : 0.5) * f, isH = i === hero;
    const x = CX + Math.sin(a) * 560 * f, y = 1000 - Math.cos(a) * 560 * f + 560 * f, rot = a * 0.9;
    if (isH) polaroid(items[i].img, lerp(x, CX, lift), lerp(y, 860, lift), 420, lerp(rot, -0.03, lift), 1 + 0.45 * lift, { label: items[i].label });
    else polaroid(items[i].img, x, y + 60 * lift, 420, rot, 1 - 0.1 * lift, { label: items[i].label }); }
}
// ---- P06 mosaic of many small photos; one tile zooms out to fill the frame
function mosaicZoom(imgs, heroIdx, t0, tz, o = {}) {
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, H); const cols = o.cols ?? 4, rows = o.rows ?? 7, gap = 10, tw = (W - gap * (cols + 1)) / cols, th = (H - gap * (rows + 1)) / rows;
  const z = EZ.io(seg(TT, tz, tz + 0.9)), hc = heroIdx % cols, hr = Math.floor(heroIdx / cols);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const i = r * cols + c; if (i === heroIdx) continue; const k = EZ.back(ev(t0 + ((r + c) % 7) * 0.06, 0.4)); if (k <= 0) continue;
    const x = gap + c * (tw + gap), y = gap + r * (th + gap); ctx.save(); ctx.globalAlpha = 1 - 0.7 * z; ctx.translate(x + tw / 2, y + th / 2); ctx.scale(k * (1 + 0.3 * z), k * (1 + 0.3 * z)); drawCover(asset(imgs[i % imgs.length]), -tw / 2, -th / 2, tw, th, 1.05); ctx.restore(); }
  const k = EZ.back(ev(t0 + 0.2, 0.4)); if (k <= 0) return; const x0 = gap + hc * (tw + gap), y0 = gap + hr * (th + gap);
  const x = lerp(x0, 0, z), y = lerp(y0, 0, z), w = lerp(tw, W, z), h = lerp(th, H, z);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 30 * (1 - z); ctx.strokeStyle = G.orange; ctx.lineWidth = 6 * (1 - z); ctx.strokeRect(x, y, w, h); ctx.restore();
  drawCover(asset(imgs[heroIdx % imgs.length]), x, y, w, h, 1.05 + 0.05 * z);
  if (o.label && z > 0.9) { footShade(0.6); fxPill(o.label, 80, 1250, 34, '#fff', G.orange, popS(tz + 0.9), { align: 'left' }); }
}
// ---- P07 a film strip drifting sideways; the frame at the centre is lit and slightly larger
function filmStrip(imgs, t0, o = {}) {
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, H); const fw = 560, fh = 420, gap = 40, y = o.y ?? 720, speed = o.speed ?? 170, k = EZ.o3(ev(t0, 0.5));
  ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#121416'; ctx.fillRect(0, y - 70, W, fh + 140); ctx.fillStyle = '#2b2e31';
  const off = mod((TT - t0) * speed, 60); for (let x = -off; x < W; x += 60) { ctx.fillRect(x, y - 52, 30, 22); ctx.fillRect(x, y + fh + 30, 30, 22); } ctx.restore();
  const n = imgs.length, period = n * (fw + gap), shift = (TT - t0) * speed;
  for (let i = -1; i < n + 2; i++) { let x = mod(i * (fw + gap) - shift, period) - fw; if (x > W + fw) continue; const cx = x + fw / 2, d = clamp(1 - Math.abs(cx - W / 2) / (W * 0.6)), s = 0.88 + 0.14 * d;
    ctx.save(); ctx.globalAlpha = k * (0.35 + 0.65 * d); ctx.translate(cx, y + fh / 2); ctx.scale(s, s); drawCover(asset(imgs[mod(i, n)]), -fw / 2, -fh / 2, fw, fh, 1.05); ctx.restore(); }
  if (o.title) gText(o.title, CX, y - 120, 34, '#fff', { align: 'center', weight: 900, alpha: k });
}
// ---- P08 spotlight inside a photo: the photo darkens except a round light that moves in and zooms on (nx, ny)
function photoSpotlight(img, nx, ny, label, t0, o = {}) {
  const im = asset(img); if (!im) return; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const zk = EZ.io(seg(TT, t0 + 0.6, t0 + 2.0)), z = (o.z0 ?? 1.05) + (o.zoom ?? 0.6) * zk;
  const sc = Math.max(W / im.naturalWidth, H / im.naturalHeight), dw0 = im.naturalWidth * sc, dh0 = im.naturalHeight * sc;
  const base = [(W - dw0) * (o.fx ?? 0.5), (H - dh0) * (o.fy ?? 0.5)], fxS = base[0] + nx * dw0, fyS = base[1] + ny * dh0;   // the focus on screen at z = 1
  const tx = lerp(0, W / 2 - fxS, zk * 0.7), ty = lerp(0, H * 0.45 - fyS, zk * 0.7);
  ctx.save(); ctx.translate(fxS + tx, fyS + ty); ctx.scale(z, z); ctx.translate(-fxS, -fyS); ctx.drawImage(im, base[0], base[1], dw0, dh0); ctx.restore();
  const cx = fxS + tx, cy = fyS + ty, r = (o.r ?? 170) * (1 + 0.4 * zk), d = EZ.o3(ev(t0, 0.6));
  ctx.save(); const g = ctx.createRadialGradient(cx, cy, r * 0.75, cx, cy, r * 1.25); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${0.78 * d})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3; ctx.globalAlpha = d; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.arc(cx, cy, r * 1.02, 0, TAU); ctx.stroke(); ctx.restore();
  if (label) fxPill(label, cx, cy + r + 50, 30, '#15100a', G.orange, popS(t0 + 1.4));
}
// ---- P09 the photo seen through big letters, then the letters open into the full photo
const _txtCv = document.createElement('canvas'); _txtCv.width = W; _txtCv.height = H;
function textReveal(img, text, t0, tOpen, o = {}) {
  ctx.fillStyle = o.bg ?? '#0b0d10'; ctx.fillRect(0, 0, W, H); const im = asset(img); if (!im) return;
  const open = EZ.i3(seg(TT, tOpen, tOpen + 0.9)), s = 1 + 26 * open, k = EZ.o3(ev(t0, 0.5));
  const c = _txtCv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H);
  const saved = ctx; ctx = c; drawCover(im, 0, 0, W, H, pushZ(t0, 4, 0.1), o.fx, o.fy); ctx = saved;
  if (open < 1) { c.globalCompositeOperation = 'destination-in'; c.save(); c.translate(CX, o.y ?? 860); c.scale(s * (0.9 + 0.1 * k), s * (0.9 + 0.1 * k)); c.font = `900 ${o.size ?? 230}px ${GFONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#000'; c.fillText(text, 0, 0); c.restore(); }
  ctx.save(); ctx.globalAlpha = k; ctx.drawImage(_txtCv, 0, 0); ctx.restore();
  if (open > 0.95 && o.label) { footShade(0.55); fxPill(o.label, 80, 1250, 34, '#fff', G.orange, popS(tOpen + 0.9), { align: 'left' }); }
}
// ---- P10 2.5D: the photo split at a soft horizon into a background and a foreground that slide at different speeds
//      o.cut = image-fraction y of the split (feathered), o.fgPoly = optional [[nx, ny], …] foreground polygon instead
const _fgCv = document.createElement('canvas'); _fgCv.width = W; _fgCv.height = H;
function parallax25(img, t0, o = {}) {
  const im = asset(img); if (!im) return; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const u = EZ.io(clamp((TT - t0) / (o.dur ?? 5))), sc = Math.max(W / im.naturalWidth, H / im.naturalHeight) * 1.18, dw = im.naturalWidth * sc, dh = im.naturalHeight * sc;
  const bx = (W - dw) * (o.fx ?? 0.5) + lerp(-25, 25, u) * (o.dir ?? 1), by = (H - dh) * (o.fy ?? 0.5);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(1 + 0.03 * u, 1 + 0.03 * u); ctx.translate(-W / 2, -H / 2); ctx.filter = `blur(${1.5 * u}px)`; ctx.drawImage(im, bx, by, dw, dh); ctx.restore();
  const c = _fgCv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); c.globalCompositeOperation = 'source-over';
  const fx2 = bx + lerp(-25, 25, u) * (o.dir ?? 1) * (o.depth ?? 4);   // the foreground travels further
  c.save(); c.translate(W / 2, H / 2); c.scale(1 + 0.12 * u, 1 + 0.12 * u); c.translate(-W / 2, -H / 2); c.drawImage(im, fx2, by, dw, dh); c.restore();
  c.globalCompositeOperation = 'destination-in';
  if (o.fgPoly) { c.save(); c.translate(W / 2, H / 2); c.scale(1 + 0.12 * u, 1 + 0.12 * u); c.translate(-W / 2, -H / 2); c.filter = 'blur(10px)'; c.fillStyle = '#000'; c.beginPath(); o.fgPoly.forEach(([nx, ny], i) => (i ? c.lineTo(fx2 + nx * dw, by + ny * dh) : c.moveTo(fx2 + nx * dw, by + ny * dh))); c.closePath(); c.fill(); c.restore(); c.filter = 'none'; }
  else { const yc = by + (o.cut ?? 0.6) * dh, g = c.createLinearGradient(0, yc - 30, 0, yc + 30); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, '#000'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20; ctx.drawImage(_fgCv, 0, 0); ctx.restore();
  if (o.label) { footShade(0.5); fxPill(o.label, 80, 1250, 34, '#fff', G.orange, popS(t0 + 0.6), { align: 'left' }); }
}
// ---- P11 a framed photo flips round its vertical axis to show a second photo on the back
function flipCard(imgA, imgB, t0, tFlip, o = {}) {
  ctx.fillStyle = '#16181b'; ctx.fillRect(0, 0, W, H); fxPaper('#16181b', true);
  const a = Math.PI * EZ.io(seg(TT, tFlip, tFlip + 0.8)), cs = Math.cos(a), front = cs >= 0, k = EZ.back(ev(t0, 0.5));
  const w = 760, h = 980, x = CX, y = 860; if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(0.02, Math.abs(cs)) * k, k * (1 + 0.06 * Math.sin(a))); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24, 26); ctx.fill(); ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 18); ctx.clip(); drawCover(asset(front ? imgA : imgB), -w / 2, -h / 2, w, h, pushZ(front ? t0 : tFlip, 4));
  ctx.fillStyle = `rgba(0,0,0,${0.5 * (1 - Math.abs(cs))})`; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
  const lab = front ? o.labelA : o.labelB, at = front ? t0 + 0.4 : tFlip + 0.8; if (lab) fxPill(lab, CX, y + h / 2 + 70, 32, '#15100a', front ? G.orange : G.teal, popS(at));
}
// ---- P12 brand duotone (navy shadows, orange highlights) that gives way to the true colours at tColor
const _duoCv = document.createElement('canvas'); _duoCv.width = W; _duoCv.height = H;
function duotone(img, t0, tColor, o = {}) {
  const im = asset(img); if (!im) return; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); const z = pushZ(t0, 5, 0.08);
  drawCover(im, 0, 0, W, H, z, o.fx, o.fy);
  const c = _duoCv.getContext('2d'), saved = ctx; ctx = c; c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; drawCover(im, 0, 0, W, H, z, o.fx, o.fy, 'grayscale(1) contrast(1.25)'); ctx = saved;
  c.globalCompositeOperation = 'multiply'; c.fillStyle = o.light ?? '#f6a640'; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'screen'; c.fillStyle = o.dark ?? '#0d2a44'; c.fillRect(0, 0, W, H);
  const m = 1 - EZ.io(seg(TT, tColor, tColor + 0.8)); ctx.save(); ctx.globalAlpha = m; ctx.drawImage(_duoCv, 0, 0); ctx.restore();
  if (o.label) { footShade(0.5); fxPill(o.label, 80, 1250, 34, '#fff', G.orange, popS(t0 + 0.5), { align: 'left' }); }
}
