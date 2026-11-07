// one continuous map world: every era boundary is a camera move inside the same world, so no morph bridges
const ERA_BG = ERA_LIST.map(() => '#0c1318');
function pieceCam(era, t) { return null; }
const BRIDGES = [];
// ---- v6 smooth transitions: a real cross-dissolve at every cut that leaves or enters a non-map shot.
//   Both shots are drawn: the outgoing one keeps moving past its end, the incoming one holds its first frame
//   until the cut. Old pushes in a little, new settles from slightly larger, a soft blur peaks at the middle.
//   Map → map cuts are camera moves in one world and stay as they are; globe → map has its own built-in dissolve.
const XD = 0.42;   // half-length (s): the dissolve runs tc - XD .. tc + XD
const XCUTS = [];
for (let i = 2; i < ERA_LIST.length; i++) {
  const geo = (k) => /sceneGeo\(/.test(ERA_LIST[k][2].toString());
  if (geo(i - 1) && geo(i)) continue;
  XCUTS.push([ERA_LIST[i][0], i]);
}
const XOTHER = document.createElement('canvas'); XOTHER.width = W; XOTHER.height = H;
const XCUR = document.createElement('canvas'); XCUR.width = W; XCUR.height = H;
function fxCross(tc, ib) {
  const u = (TT - tc) / XD; if (u <= -1 || u >= 1) return;
  const p = EZ.io((u + 1) / 2);              // 0 = all old shot … 1 = all new shot
  const after = F / FPS >= tc - 1e-6, eo = after ? ib - 1 : ib;
  const keepT = TT, keepE = E0, keepCtx = ctx;
  if (!after) TT = ERA_LIST[ib][0];
  E0 = ERA_LIST[eo][0];
  const q = renderEra(eo, XOTHER);
  ctx = XOTHER.getContext('2d'); ctx.save(); flush(q, eo); ctx.restore();
  ctx = keepCtx; TT = keepT; E0 = keepE;
  const cur = ctx.canvas, xc = XCUR.getContext('2d');
  xc.setTransform(1, 0, 0, 1, 0, 0); xc.globalAlpha = 1; xc.filter = 'none'; xc.drawImage(cur, 0, 0);
  const oldC = after ? XOTHER : XCUR, newC = after ? XCUR : XOTHER;
  const bl = Math.sin(Math.PI * p) * 5;
  const draw = (c, s, a) => {
    ctx.save(); ctx.globalAlpha = a; if (bl > 0.3) ctx.filter = `blur(${bl.toFixed(1)}px)`;
    ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.drawImage(c, -W / 2, -H / 2); ctx.restore();
  };
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#05080b'; ctx.globalAlpha = 1; ctx.fillRect(0, 0, W, H);
  draw(oldC, 1 + 0.05 * p, 1);
  draw(newC, 1.05 - 0.05 * p, p);
  ctx.restore();
}
// ---- after every frame: the transitions at the cuts, then the subtitles (fx.js), then the style's grain
{
  const post0 = STYLE.post;
  STYLE.post = function () {
    for (const [tc, ib] of XCUTS) fxCross(tc, ib);
    fxSubtitle();
    if (post0) post0.call(STYLE);
  };
}
