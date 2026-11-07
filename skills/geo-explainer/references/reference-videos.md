# Reference videos

The look of every geo-explainer video comes from 13 short TikTok explainers (Vietnamese economy/real-estate/geography
channels) the user supplied. Originals stay outside the skill, in the `references` folder of the user config (`zsh scripts/gx.sh config references`,
see `storage.md`); v1–v13 = file names sorted. Do not copy them into the skill or a piece. Per-effect stills: `assets/refs/` (file name = effect id; see `effects.md`).

Read this file when starting a new piece (the look), when the user brings new reference videos, or when an effect has to
be redone "like the references".

## The shared look

- Ground: real-looking satellite map, slightly darkened, never flat colour. Charts and tables sit on grey or beige
  textured paper; quotes and documents on dark or blurred photo grounds.
- One accent colour for the subject (orange), red for warnings/history, teal for sea and secondary items, white for lines,
  frames and small tags. Glow on outlines and routes, never on text.
- Type: heavy sans (SF Pro Display Black / Inter Black style) in caps for titles; a serif italic for quotes and soft lines;
  numbers big only when they are the shot. Labels are small flags/pills with a pointer.
- Motion: the camera never stops (slow push or drift); pops overshoot slightly (`popS`, `EZ.back`); lines draw on;
  a white light runs along finished lines; photos push in slowly.
- Every video has burnt-in subtitles: white, left orange bar, lower third.
- Pace: a new visual idea every 2–4 s; cuts land on the voice.
- Many references cut to a presenter on camera; geo-explainer has no presenter (out of scope) and uses map shots instead.

## Per video (what to look at)

| v | Topic | Best for |
|---|---|---|
| v1 | Vĩnh Long real estate | photo cards on routes, rays to a project, 3D type, thermometers (~138 s) |
| v2 | HDBank | glowing dashed rings, icons on dark grey (~56–92 s) |
| v3 | Takashimaya Saigon | B&W → colour (30 s), outlined objects (34 s), timeline 2013→2016 (~152 s), flow with circles (~88 s) |
| v4 | Uranium enrichment | paper look, photo grid (~150 s), glowing flow with icons (~120 s) |
| v5 | Bangkok / HCMC metro | blur-letter question (5 s), photo callouts, routes (~66–84 s) |
| v6 | Japanese century-old firms | pie on map (6 s), bar chart and target circles on paper (~38–62 s) |
| v7 | Japanese public debt | line chart on map (~14–34 s), paper table (~40–68 s), highlighted documents (~233 s) |
| v8 | Petaling Jaya | globe + 3D country name (0–4 s), hatched slab, population capsule (~82 s), photo-in-region (~90 s), neon rings |
| v9 | HCMC south / Mizuki Park | routes drawing with running light, pins, small legends, vertical "TP.HCM" |
| v10 | Investment capital | donut charts, line chart on map |
| v11 | Vũng Tàu Qtopia | tilted camera, big logo pins (~156 s) |
| v12 | Bắc Ninh / 3D blocks | 3D blocks for quantities, documents |
| v13 | Bắc Ninh tourism | article cards and phone (~18–24 s) |

## Adding an effect from a new reference

1. Sample the video: `ffmpeg -i <v> -vf "fps=1/6,scale=200:-1,tile=10x3" sheet.jpg`, then 2–3 frames/s around the moment.
2. Describe what moves, in what order, how long, what colour, how much text — in this file's table and in `effects.md`.
3. Implement it as a generic function in `engine/fx/fx-geo.js` (data in, no place names inside), with a LAB example.
4. Save a 4-frame strip to `assets/refs/` and a thumbnail of our version to `assets/effects/` (file name = the new id).
