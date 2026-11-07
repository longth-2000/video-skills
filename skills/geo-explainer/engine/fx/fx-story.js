// =====================================================================
//  FX-STORY — openings (O1–O5), endings (E01–E03) and photo accents (A1–A3). references/effects.md
//  "Openings", "Endings", "Photo accents". Same rules as the other fx files: screen space unless "world", safe before t0.
// =====================================================================

// ---- layout helper for every opening line of text: a block in a fixed band (never between a globe/photo and the
//      subtitles). lines [{ text, size, color, italic }]; o.y = top of the band (default 300), o.align 'center'|'left',
//      o.maxW. Lines shrink to fit maxW. First line is drawn at t0 (full first frame), the next ones 0.12 s apart.
//      Returns the y under the block.
function hookBlock(lines, t0, o = {}) {
  const align = o.align ?? 'center', x = align === 'center' ? CX : 70, maxW = o.maxW ?? (W - SAFE.right - 140);
  let y = o.y ?? 300;
  lines.forEach((L, i) => {
    let size = L.size ?? 72; ctx.save(); ctx.font = `${L.italic ? 'italic ' : ''}900 ${size}px ${GFONT}`; const w = ctx.measureText(L.text).width; ctx.restore();
    if (w > maxW) size *= maxW / w;
    y += size * (i ? 1.12 : 0.92);
    const k = EZ.o3(ev(t0 + i * (o.stagger ?? 0.12) - (i ? 0 : 0.15), 0.3)); if (k <= 0) return;
    ctx.save(); const s = 1.06 - 0.06 * k; ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y);
    gText(L.text, x, y, size, L.color ?? '#fff', { align, weight: 900, italic: L.italic, alpha: k * (o.alpha ?? 1) }); ctx.restore();
  });
  return y + 20;
}

// ---- O2 number hook: one big exact number with its unit as ONE block in the top band, over any background
//      (draw the background first: a darkened map, footage, paper). str like '70' or '176.418'.
function openNumber(str, unit, t0, o = {}) {
  const size = o.size ?? 200, y = (o.y ?? 300) + size * 0.9;
  if (o.scrim !== false) gScrim((o.y ?? 300) - 80, y + 170, 0.55);
  odometer(str, CX, y, size, t0, { color: o.color ?? '#fff' });
  const k = EZ.o3(ev(t0 + 0.35, 0.3)); if (k > 0) fxPill(unit, CX, y + 70, o.unitSize ?? 36, '#15100a', o.unitBg ?? G.orange, k);
  return y + 110;
}
// ---- O1 cold open on a photo or footage frame (pass vname(...) for footage): full frame, a slow push-in, the hook
//      as a block in the top band over a top shade (the subtitles keep the bottom).
function openPhoto(img, lines, t0, o = {}) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); drawCover(asset(img), 0, 0, W, H, pushZ(t0 - 0.3, 6, 0.08), o.fx ?? 0.5, o.fy ?? 0.5, o.filter);
  const g = ctx.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, 'rgba(0,0,0,0.72)'); g.addColorStop(0.65, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 900);
  return hookBlock(lines, t0, { y: o.y ?? 280, align: o.align ?? 'left' });
}
// ---- O5 globe with text: the globe sits low (centre 0.6 H, R ≤ 340) and the text block above it in the top band.
//      Use globeDive for the dive itself; call this for the held part before it.
function openGlobe(lines, t0, lon, lat, o = {}) {
  ctx.fillStyle = '#01030a'; ctx.fillRect(0, 0, W, H); fxStars();
  const R = (o.R ?? 330) * (1 + 0.04 * seg(TT, t0, t0 + 5)); fxGlobe(W / 2, H * (o.cy ?? 0.6), R, lon + (o.spin ?? 6) * (TT - t0), lat, { vn: o.vn ?? 0 });
  return hookBlock(lines, t0, { y: o.y ?? 300 });
}

// ---- E01 recap: the video's key images come back as framed tiles in a loose row, then gather to the centre while the
//      closing line types in above them; the last 0.8 s fades to black. imgs: 3–6 asset names (stills or vname frames).
function endRecap(imgs, lines, t0, o = {}) {
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, H); if (o.drawBg) { o.drawBg(); ctx.fillStyle = 'rgba(3,6,9,0.72)'; ctx.fillRect(0, 0, W, H); }
  const n = imgs.length, tw = o.w ?? 300, th = tw * 0.72, gather = EZ.io(seg(TT, t0 + (o.tGather ?? 1.6), t0 + (o.tGather ?? 1.6) + 1.0));
  imgs.forEach((im, i) => {
    const k = EZ.back(ev(t0 + i * 0.12, 0.45)); if (k <= 0) return;
    const col = i % 3, row = Math.floor(i / 3), gx = CX + (col - 1) * (tw + 30), gy = 820 + row * (th + 40) - (Math.ceil(n / 3) - 1) * (th + 40) / 2;
    const sx = CX + (i - (n - 1) / 2) * 26, sy = 900 + (i % 2 ? 14 : -14), rot = lerp((i % 2 ? 1 : -1) * 0.05, (i - (n - 1) / 2) * 0.07, gather);
    const x = lerp(gx, sx, gather), y = lerp(gy, sy, gather), s = lerp(1, 0.86, gather) * k;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 26; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-tw / 2 - 8, -th / 2 - 8, tw + 16, th + 16, 14); ctx.fill(); ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.roundRect(-tw / 2, -th / 2, tw, th, 8); ctx.clip(); drawCover(asset(im), -tw / 2, -th / 2, tw, th, 1.05, 0.5, 0.5, o.filter); ctx.restore();
  });
  if (lines) hookBlock(lines, t0 + (o.tGather ?? 1.6) + 0.6, { y: o.y ?? 330 });
  fadeOut(o.end ?? DURATION);
}
// ---- E02 iris: a white ring closes on a world point (the last place of the story), black outside; the closing line
//      sits in the top band; the ring collapses into a dot at the end. Call after drawing the map for the frame.
function endIris(pt, lines, t0, t1, o = {}) {
  const [x, y] = gSP(pt), u = EZ.io(seg(TT, t0, t1)), R = lerp(Math.hypot(W, H), o.r ?? 230, u), fin = EZ.io(seg(TT, t1 + 0.4, (o.end ?? DURATION) - 0.2));
  const r = R * (1 - fin * 0.98);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(x, y, r, 0, TAU, true); ctx.fillStyle = '#030507'; ctx.fill('evenodd');
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.shadowColor = o.color ?? G.orange; ctx.shadowBlur = 24; ctx.globalAlpha = u; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.restore();
  if (lines) hookBlock(lines, t1 - 0.3, { y: o.y ?? 300 });
  fadeOut(o.end ?? DURATION, 0.5);
}
// ---- E03 pull-back card: the camera pulls back over the map (your CAMKEYS) while everything the video drew stays lit;
//      this adds the vignette, the closing block and the fade. Call last in the frame.
function endCard(lines, t0, o = {}) {
  const k = EZ.io(seg(TT, t0, t0 + 1.2)); ctx.save(); const g = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.2, W / 2, H * 0.45, H * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${0.75 * k})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  if (lines) hookBlock(lines, t0 + 0.4, { y: o.y ?? 300 });
  fadeOut(o.end ?? DURATION);
}
function fadeOut(end, d = 0.8) { const a = seg(TT, end - d, end); if (a > 0) { ctx.save(); ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } }

// ---- A1 photo pin: a round photo in a white ring on a short stem, standing on a screen point (a place that has a photo)
function photoPin(img, px, py, t0, o = {}) {
  const k = EZ.back(ev(t0, 0.4)); if (k <= 0 || !asset(img)) return; const r = (o.r ?? 70) * k, h = (o.stem ?? 46) * k, cy = py - h - r;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 16; ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(px - 12 * k, cy + r - 4); ctx.lineTo(px, py); ctx.lineTo(px + 12 * k, cy + r - 4); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(px, cy, r + 7, 0, TAU); ctx.fill(); ctx.restore();
  roundPhoto(img, px, cy, r, 1, { lw: 0, ring: 'rgba(0,0,0,0)', filter: o.filter });
  ctx.save(); ctx.fillStyle = o.color ?? G.orange; ctx.beginPath(); ctx.arc(px, py, 7 * k, 0, TAU); ctx.fill(); ctx.restore();
  if (o.label && k > 0.8) fxPill(o.label, px + (o.ldx ?? 0), cy - r - 30, o.size ?? 24, '#15100a', '#fff', clamp((k - 0.8) * 5));
}
// ---- A2 photo flag: the usual flag callout with a square photo thumbnail at its left (same orange/white box)
function photoFlag(img, x, y, text, o = {}) {
  const k = o.pop ?? 1; if (k <= 0) return; const size = o.size ?? 30, th = size * 2.1, up = o.up ?? 60;
  ctx.save(); ctx.font = `800 ${size}px ${GFONT}`; const tw = ctx.measureText(text).width; ctx.restore();
  const bw = th + tw + size * 1.2, bx = clamp(x - bw / 2 + (o.side ?? 0), 30, W - SAFE.right - bw), by = y - up - th;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y);
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 14; ctx.fillStyle = o.bg ?? '#fff';
  const px = clamp(x, bx + 20, bx + bw - 20); ctx.beginPath(); ctx.moveTo(px - 10, by + th - 1); ctx.lineTo(x, y - 6); ctx.lineTo(px + 10, by + th - 1); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.roundRect(bx, by, bw, th, 8); ctx.fill(); ctx.shadowBlur = 0;
  ctx.save(); ctx.beginPath(); ctx.roundRect(bx + 5, by + 5, th - 10, th - 10, 6); ctx.clip(); drawCover(asset(img), bx + 5, by + 5, th - 10, th - 10, 1.05, 0.5, 0.5, o.filter); ctx.restore();
  ctx.fillStyle = o.fg ?? '#15100a'; ctx.font = `800 ${size}px ${GFONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, bx + th + size * 0.5, by + th / 2 + 1);
  ctx.restore();
}
// ---- A3 photo chips on chart rows: rankBars rows may carry { img } — a round thumbnail before the label (fx-geo2.js)
