// =====================================================================
//  TRANSITIONS (26) + post pass. Load after the scenes, before kit/morph.js (it defines ERA_BG, pieceCam, BRIDGES).
//  Measured on the reference videos (frame by frame at 30 fps), they use four kinds — never long dissolves:
//    cut   (default) a hard cut on the first word of the new line; the new shot is already full at its first frame.
//    wipe  section change (map → paper, "Thứ nhất / Thứ hai"…): a soft-edged black edge sweeps diagonally from the top
//          right and covers the old shot in ~2 frames, black holds ~0.2 s, the new shot is uncovered the same way.
//          ≈ 0.42 s in all, centred so the black straddles the cut.
//    whip  into or out of a photo: the frame slides sideways with a motion blur, ~0.24 s.
//    move  map → map: no effect, the camera move inside the one map world is the transition (set automatically when
//          both shots are { map: true }).
//  ERA_LIST entry 4th item: { map: true, tr: 'cut' | 'wipe' | 'whip' } — `tr` is the transition INTO that shot.
//  Post order: subtitles (fx.js, when SUBTITLES is true), then the transitions over everything, then the style's grain.
// =====================================================================
const ERA_BG = ERA_LIST.map(() => '#0c1318');
function pieceCam(era, t) { return null; }
const BRIDGES = [];
const XTR = [];   // [time, kind]
for (let i = 1; i < ERA_LIST.length; i++) {
  const a = ERA_LIST[i - 1][3] || {}, b = ERA_LIST[i][3] || {};
  const kind = b.tr || (a.map && b.map ? 'move' : 'cut');
  if (kind === 'wipe' || kind === 'whip') XTR.push([ERA_LIST[i][0], kind]);
}
const XCUTS = XTR.map(([t]) => [t]);   // the score adds a whoosh on each
const WIPE = { cover: [-0.17, -0.09], hold: 0.12, reveal: [0.12, 0.26], feather: 170 };
const XTMP = document.createElement('canvas'); XTMP.width = W; XTMP.height = H;
function fxWipe(tc) {
  const t = TT - tc; if (t < WIPE.cover[0] || t > WIPE.reveal[1]) return;
  const D = (W + H) / Math.SQRT2, F = WIPE.feather, ex = W - (W + H) / 2, ey = (W + H) / 2;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (t > WIPE.cover[1] && t < WIPE.reveal[0]) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); return; }
  const cover = t <= WIPE.cover[1], u = cover ? seg(t, ...WIPE.cover) : seg(t, ...WIPE.reveal), L = lerp(-F, D + F, EZ.io(u));
  const g = ctx.createLinearGradient(W, 0, ex, ey), a = clamp((L - F / 2) / D), b = clamp((L + F / 2) / D);
  if (cover) { g.addColorStop(0, '#000'); g.addColorStop(a, '#000'); g.addColorStop(b, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0)'); }
  else { g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(a, 'rgba(0,0,0,0)'); g.addColorStop(b, '#000'); g.addColorStop(1, '#000'); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function fxWhip(tc) {
  const t = TT - tc, d = 0.12; if (t < -d || t > d) return;
  const before = t < 0, u = before ? 1 + t / d : 1 - t / d;   // 0 far from the cut … 1 at the cut
  const off = (before ? -1 : 1) * W * 0.4 * u * u, blur = 60 * u;
  const tc2 = XTMP.getContext('2d'); tc2.setTransform(1, 0, 0, 1, 0, 0); tc2.globalAlpha = 1; tc2.filter = 'none'; tc2.drawImage(ctx.canvas, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 7; i++) { ctx.globalAlpha = i ? 0.14 : 0.5; ctx.drawImage(XTMP, off + (i - 3) * blur / 3, 0); }
  ctx.restore();
}
{
  const post0 = STYLE.post;
  STYLE.post = function () {
    if (typeof SUBTITLES === 'undefined' || SUBTITLES) fxSubtitle();   // under the transitions: the black covers them too
    for (const [tc, kind] of XTR) (kind === 'wipe' ? fxWipe : fxWhip)(tc);
    if (post0) post0.call(STYLE);
  };
}
