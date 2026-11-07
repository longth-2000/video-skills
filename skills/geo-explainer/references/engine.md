# Engine (piece structure and API)

Read when writing scenes beyond the template.

## A piece

```
<piece>/piece.json   build order, style, voice mix      geo.json   map data config
<piece>/brief.md     facts + sources, media, storyboard  LOG.md     what changed each round
<piece>/voice/       script.json, takes, voice.wav       voice.json line/word times (generated)
<piece>/assets/      images (inlined by build)           renders/   final.mp4, share.mp4
<piece>/src/head.html  globals (W, H, FPS, SAFE, VL/VW/T0/T1, DURATION, SUBTITLES)
<piece>/src/geodata.js, geodata2.js (generated)   scenes.js (your scenes)   shots.js (SEC, CAMKEYS, ERA_LIST, TIMELINE)
<piece>/src/score.js   music and sound cues (inside the score function; `to = 'm'` music bus, `'s'` sfx bus)
```

Build order (piece.json): head, kit/core, geodata, geodata2, style (geosat kit), geosat overlay, fx/fx.js, fx/fx-geo.js,
fx/fx-geo2.js, fx/fx-photo.js, fx/fx-video.js, fx/fx-story.js (hooks, endings, photo accents), fx/fx-intro.js (intros/outros),
scenes, shots, fx/transitions.js, kit/morph, kit/board, kit/score-head, score, kit/score-tail.

## Time and shots

- `TT` = current time (s). Cue everything from the voice: `T0('id')`, `T1('id')`, `VW('id', 0.4)` (40 % into the line).
- `ERA_LIST = [[t0, t1, () => draw(), { map: true, tr: 'wipe' }], …]` — one entry per shot. Map→map cuts are camera
  moves; the default is a hard cut; `tr: 'wipe'` (diagonal black, ~0.42 s) or `'whip'` (~0.24 s) on the incoming shot.
  Cut times: `Math.round((T0(id) − 0.12) * FPS) / FPS` (on the first word, frame-aligned; do not round to the beat).
- Map camera: `CAMKEYS [[t, x, y, s, dur], …]` (km, px/km), `GC = gCamAt(CAMKEYS, TT)`; zoom is log-interpolated.
- Envelopes: `ev(t, d)` 0→1 linear from t over d; `popS(t)` springy pop; `seg(TT, a, b)`; easings `EZ.io/o3/back`.

## Drawing API (most used)

- Map: `gGround({dim})`, `gRegion(R, {fill, fa, line, lw, glow, frac, len, la})`, `gSP(worldPt)→[x,y]`, `gRingLen(R)`,
  `gFlag(x, y, text, {bg, fg, size, pop, up, side, sub})`, `gPin`, `gPulse`, `gLine`.
- Text: `gText(str, x, y, size, col, {align, weight, italic, font: SERIF, alpha, shadow})`, `gTitle(lines, x, y, t0)`
  (typed), `fxBlurText`, `fx3DText`, `fxPill(str, x, y, size, fg, bg, k, {align})`.
- Effects: see `effects.md` (fx.js and fx-geo.js).
- Layout: 1080×1920; safe zone top 240, bottom 420 (subtitles live at y≈1440), right 140 (TikTok buttons). Keep content
  above y≈1360. `CX` = horizontal centre of the safe area.

## Gotchas

- Scenes run on every frame from scratch: no state between frames; derive everything from `TT`.
- A scene's first frame is what the viewer sees at the cut: draw the main element fully from `t0` (see effects.md,
  Transitions). Scenes with a continuing camera across several lines are one ERA entry, not several.
- Sounds must never start before t = 0 (`sweep` starts 0.35 s early): clamp cue times with `Math.max(0.4, t)`;
  a negative time makes the whole audio render fail.
- Text width: measure before placing long Vietnamese words; the text check catches overlaps/cut-offs.
