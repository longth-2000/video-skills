# Effect catalog

One version per effect. Pick only the effects the content needs; most videos use 6–12 of them. Record the choice and the
reason per shot in `brief.md` (storyboard table) before building.

- Thumbnail of our version: `assets/effects/` (file name = effect id, e.g. `07.jpg`). Reference strip (4 frames from the source video): `assets/refs/` (same naming).
  Look at both before using an effect for the first time in a session.
- Source videos: the `references` folder from `zsh scripts/gx.sh config references` (Google Drive), numbered v1–v13 in
  file-name order (see `reference-videos.md`, `storage.md`).
- Worked code: `examples/effects-lab/lab.js` — `LAB['<id>']` is a complete 4–7 s shot built with the effect (Hậu Lộc data).
  When two LAB entries exist for an id, the one named in "Example" below is the chosen version.
- Functions: `engine/fx/fx.js` (fx…), `engine/fx/fx-geo.js` (generic), `engine/styles/geosat/overlay.js` (g…).

Universal rules (from user corrections): as little on-screen text as possible; text small (labels 20–34 px, titles ≤ 96 px)
and never covering the effect; no source lines and no "AI image" tags on screen; photos full screen or in the reference
frames (never small photo cards in a corner); every number on screen must be in the brief's facts table.

## Contents

- [Catalog 01–27](#catalog-0127)
- [New effects N01–N16](#new-effects-n01n16)
- [Photo effects P01–P12](#photo-effects-p01p12)
- [Video effects V01–V13](#video-effects-v01v13)
- [Intros I1–I4 and outros F1–F4](#intros-i1i4-and-outros-f1f4)
- [Openings O1–O5](#openings-o1o5)
- [Endings E01–E03](#endings-e01e03)
- [Photo accents A1–A3](#photo-accents-a1a3)
- [Choosing](#choosing)
- [Transitions](#transitions)
- [Effect-specific gotchas](#effect-specific-gotchas)

## Catalog 01–27

| id | Effect | Use when | Function(s) | Example | Ref |
|---|---|---|---|---|---|
| 01 | Globe dive to the country, zoom blur | Opening; the story is about a place | `globeDive(T, fromLonLat, toLonLat, flatCam, drawFlat)` | LAB 01B | v8 0–4 s |
| 02 | Tilted 3D camera, tilt-shift haze | Showing where a place sits among neighbours | `fxTilted(k, drawFlat)` + `gSPt` for labels | hau-loc `secLoc` | v11 6–18 s |
| 03 | Giant 3D word, camera flies through it | A dive between two zoom levels | `flyWord(word, worldPt, s0, sFade)` while the camera dives | LAB 03B | v8 1–4 s |
| 04 | Big vertical region names | Naming 2–4 large regions at once | `fxVName(str, x, y, size, col, k)` | LAB 04B | v9 50–53 s |
| 05 | Photo poured into a region's shape | One region = one strong image | `fxPhotoRegion(img, R, k, {zoom, fy})` | LAB 05A | v8 90–98 s |
| 06 | Region raised as a 3D slab | Area, size, "how big"; or bar-map by region | `slab(R, h, k, col, darker(col))`, `fxSlab` (gold) | LAB 06B | v8 6–18 s |
| 07 | Routes drawing on, light running, pins | Roads, rail, metro, rivers, any route | `route(worldLine, col, t0, t1, {pins, thick})`, `tinyLegend` | LAB 07A (v9 look); `thick:true` + camera on the head = LAB 07B | v9 18–48 s, v8 |
| 08 | Big pin with icon, rays to framed photos | One landmark with several images | `fxBigPin`, `raysToPhotos` | LAB 08A | v11 156–164 s |
| 09 | Darken outside a region, glowing outline/river | Focus on one unit; a border river | `dimOutside(R, a)`, `gRegion(R, {line:'#fff', glow})`, `route` | LAB 09A | v9 49–54 s |
| 11 | Old photo: B&W → colour, blur → sharp | History; "then and now" | `photoFS(img, {filter})` with animated grayscale/blur | LAB 11B | v3 30–38 s |
| 12 | Outlines + labels on objects in a photo | Pointing at things inside a photo | `fxPhotoPan` → map, `fxOutline(map, box, label, k)` | LAB 12B | v3 33–37 s |
| 13 | Photo grid / vertical stack, framed, labelled | 3–4 examples of one thing | `fxGrid(items, t0, {cols})` | LAB 13A (2×2) | v4 150–162 s |
| 14 | Old photo in a curved-TV frame slides onto the map | An archive photo tied to a place | `slideIn`, `tvPhoto` | LAB 14A | v8 2–8 s |
| 15 | Burnt-in subtitles (white, orange bar) | Every video with a voice (default on) | `fxSubtitle` via `SUBTITLES = true` | template | v3 106–114 s |
| 16 | 3D word flying in and landing; serif line; pill | A name or a key word, once per video | `fly3DWord`, `fxPill`, `gText(…,{font: SERIF, italic})` | LAB 16A (redo) | v1 205–225 s |
| 17 | Letters appearing with blur; two-colour question | The hook question, a chapter line | `fxBlurText(str, x, y, size, col, t0)` | LAB 17B | v5 5–8 s |
| 18 | Line chart on the map (thin grid, orange line, red end) | A series over time | `lineChart(data, box, range, t0, {est, title, yTicks})` | LAB 18A (redo) | v7 14–34 s |
| 19 | 3D pie standing on the map | Shares of a whole tied to a place | `fxPie3D(cx, cy, r, parts, {sy, depth})` | hau-loc `secSplit` | v6 6–12 s |
| 20 | Table: thick black lines, orange/red header, key row turns red | 3–6 rows of numbers | `tableV7(cols, rows, hlIndex, t0)` on `fxPaper('#9b9994')` | LAB 20A (redo) | v7 40–68 s |
| 21 | Population capsule + crowd icon beside a region | One headline count (people, units) | `popCapsule(x, yT, yB, value, ' DÂN', t0, {top})` | LAB 21A (redo) | v8 82–94 s |
| 22 | Thermometer columns + comparison arrow | Comparing 2–3 values | `fxThermo`, `compareArrow` | LAB 22B | v1 136–142 s |
| 23a | Target circles with satellites / glowing rings | One core idea with 2–5 related things | `targetSatellites` (paper, v6) or `glowRings` (dark, v2) | LAB 23aA / 23aB (redo) | v6 46–62 s, v2 56–92 s |
| 23b | Staircase timeline with elbow arrows | 3–5 dated events | `timelineStairs(items, t0, dt, {light})` | hau-loc `sceneTimeline`, LAB 23bB | v3 152–168 s |
| 23c | Inset map in a frame | "Where is this in the country" while zoomed in | `fxInset(x, y, w, h, k, {region})` | LAB 23cA | v3 130–150 s |
| 23c | Flow path: nodes joined by a glowing line, light running | A process or chain of steps | `flowPath(nodes, path, shields, t0)` | LAB 23cB (redo) | v4 120–136 s |
| 24 | Article page, highlighter sweeps the key sentence | Proving a claim with an official/press source | `scripts/doc_capture.mjs` → `DOCS.key`; `fxDoc(key, t0, tHl)` | hau-loc `sceneDoc` | v7 233–241 s, v13 |
| 25 | The article on a phone, scrolling, highlighted | Same as 24, more "news" feel | `phoneDoc(DOCS.key, cx, cy, k, scroll, hk)` | LAB 25A | v13 18–24 s |
| 26 | Transitions: hard cut (default), diagonal black wipe, whip | Every cut; see "Transitions" below | `engine/fx/transitions.js` (ERA flags `{map}`, `{tr}`) | template; gia-bds-giam | v6 63.6 s, v7 73.8 s, v8 44 s, v11 36.9 s |
| 27 | Paper texture ground (light or dark) | Charts, tables, diagrams between map shots | `fxPaper()` light, `fxPaper(PAPER, true)` dark | LAB 27A | v7, v4, v6 |

## New effects N01–N16

Functions in `engine/fx/fx-geo2.js`; worked examples in `examples/effects-lab2/lab.js` (`LAB.N01A`…).

| id | Effect | Use when | Function(s) | Ref |
|---|---|---|---|---|
| N01 | Distance rings (dashed km circles spreading from a point) | "how far from the centre", catchment, real estate | `radiusRings(worldPt, [5,10,20], t0)` | v5 "~30 phút" oval |
| N02 | 3D columns standing on the map | comparing several places at once | `bars3D([{p, v 0..1, c, sub, label}], t0, {h})` — keep places ≥ 80 px apart | v8 hatched slab |
| N03 | Glowing dots / bubbles | density or size by place (real data only) | `glowDots(pts, t0)`, `pointsInRings(R, n, seed)` | — |
| N04 | Flow arc with running particles | a link, trip or flow between two places | `flowArc(a, b, t0, {bend, color})` | v8 neon arcs |
| N05 | Magnifier lens on the map | one small place inside a big view | `magnifier(drawWorld, pt, sBig, cx, cy, r, k, {label})` | v3 inset |
| N06 | Before / after slider | merges, plans, then-and-now on the same frame | `beforeAfter(drawBefore, drawAfter, t0, {left, right})` | — |
| N07 | Map layers peeling apart (isometric) | "what makes this place": terrain / borders / roads | `mapLayers([draw…], t0, {labels})` | — |
| N08 | Dial gauge | a rate moving between two values | `gauge(cx, cy, R, vmin, vmax, from, to, t0, {red, label})` | — |
| N09 | Odometer counter | one big exact number | `odometer('176.418', x, y, size, t0, {box})` | — |
| N10 | Waffle 10×10 | one percentage | `waffle(pct, x, y, cell, t0, {color})` | — |
| N11 | Ranking bars | top 3–5 | `rankBars([{label, v, txt}], x, y, w, t0)` | v7 bars |
| N12 | Rubber stamp on a document | a decision / status of a document | `stamp(lines, x, y, rot, t0)` over `docPage` or `fxDoc` | v7 "MATURED" |
| N13 | Hand-drawn red circle | pointing at a date/number in a page | `handCircle(x, y, w, h, t0)` | v4 "U-235" |
| N14 | Hand-drawn arrow with a label | pointing at a thing in a photo | `handArrow(from, to, label, t0)` | v4 arrows |
| N15 | Stacked cards | summing up 2–4 points | `stackCards([{head, title, img or icon, c}], t0)` | v1 cards |
| N16 | Dive through a pin into a photo | map → photo of that place (instead of a whip) | camera zoom to the pin + `pinDive(pinScreen, img, tc)` | v9 zoom blur |

Stamp text must state a true status of that document (e.g. the date it took effect) — it reads as a claim.

## Photo effects P01–P12

Functions in `engine/fx/fx-photo.js`; worked examples in `examples/effects-lab3/lab.js` (`LAB.P01A`…).

| id | Effect | Use when | Function(s) |
|---|---|---|---|
| P01 | Photo callout on the map (white frame, pointer, name under) | introducing 2–3 places on the map | `photoCallout(img, px, py, label, t0, {side, up})` |
| P02 | Full-screen photo + mini map in a corner | the viewer must know where the photo was taken | `photoMiniMap(img, worldPt, s, drawMap, t0, {label})` |
| P03 | Photos popping along a route | a journey, a coast, a road | `photosAlongRoute(path, [{u, img, label, side}], t0, t1)` |
| P04 | Frame split into 2–3 bands sliding in | comparing or listing 2–3 things | `splitPanels([{img, label, fx}], t0)` |
| P05 | Polaroids fanning, the hero lifts | a set of memories / a collection | `fanPolaroids([{img, label}], heroIdx, t0)` |
| P06 | Mosaic, one tile zooms to full frame | opening a "culture / people" section | `mosaicZoom(imgs, heroIdx, t0, tz, {label})` — the hero image is `imgs[heroIdx % imgs.length]` |
| P07 | Film strip drifting sideways | a bridge between sections over music | `filmStrip(imgs, t0, {title})` — 5+ photos |
| P08 | Spotlight inside a photo | pointing at a detail without frames or arrows | `photoSpotlight(img, nx, ny, label, t0, {fx})` |
| P09 | Photo seen through big letters, letters open | the title of a place | `textReveal(img, text, t0, tOpen, {size, label})` |
| P10 | 2.5D parallax (foreground slides over the background) | making a still photo feel filmed | `parallax25(img, t0, {cut or fgPoly, dir, depth})` — `cut` = horizon as image fraction |
| P11 | 3D flip to a second photo | two sides of one place or idea | `flipCard(imgA, imgB, t0, tFlip, {labelA, labelB})` |
| P12 | Brand duotone (navy/orange) → true colours | unifying photos from mixed sources | `duotone(img, t0, tColor, {label})` |

Photo rules: avoid date stamps in camera photos (crop with `fx/fy`); never caption "xưa/nay" unless the two photos
really are the same place at two dates.

## Video effects V01–V13

Functions in `engine/fx/fx-video.js`; worked examples in `examples/effects-lab4/lab.js` (`LAB.V01A`…). Footage: see
`media.md` (Video footage). A clip is drawn from image frames: `vname(key, localSeconds, {v: 'P'|'L'})` returns the frame
asset to pass to any photo function, `vimg()` the image.

| id | Effect | Use when | How |
|---|---|---|---|
| V01 | Full-screen footage + two-colour title | the B-roll between map shots | `videoFull(key, t0, {kicker, lines})` |
| V02 | Video in a callout on the map | showing a place "alive" on the map | `photoCallout(vname(key, TT - t0, {v:'L'}), px, py, label, t0)` |
| V03 | Dive through a pin into the footage | map → real footage of that place | camera zoom + `pinDive(pin, vname(key, TT - tc), tc)` |
| V04 | Video inside a region's shape | one region = one moving image | `fxPhotoRegion(vname(…), R, k)` |
| V05 | Video through big letters | an opening title | `textReveal(vname(…), text, t0, tOpen)` |
| V06 | Split bands of video | comparing 2–3 scenes | `splitPanels([{img: vname(…)}…], t0)` |
| V07 | Video in a curved TV / a phone | archive, news, social-media clip | `videoTV(key, local, …)`, `videoPhone(key, local, cx, cy, k)` |
| V08 | Freeze frame + outlines + labels, then play on | pointing at something moving | `videoFreeze(key, t0, tFreeze, tGo, [[box, label]…])` — boxes measured on the frozen frame |
| V09 | Speed ramp (fast → slow on the beat) | rhythm, an emphasis | `videoRamp(key, t0, [[0, 3], [2.0, 0.5]])` |
| V10 | Picture-in-picture tied to a pin | keeping the map while showing the place | `videoPiP(key, local, pinScreen, k, {label})` |
| V11 | Mosaic of videos, one fills the frame | opening a "people / life" section | `mosaicZoom([vname(k, …)…], hero, t0, tz)` |
| V12 | Old-film grade (grey, grain, weave) → colour | a "then" mood turning to "now" | `videoOldToColour(key, t0, tColor)` — a grade, not archive footage: never caption it as history |
| V13 | Before/after slider: still photo vs footage | then-and-now of the same place (real pairs only) | `beforeAfter(drawPhoto, drawVideo, t0)` |

Footage rules: stock clips are generic — caption them generically ("LÀNG CHÀI", "PHỐ ĐÊM"), never with a specific place
they were not filmed in; use place names only for footage tagged/filmed there.

## Intros I1–I4 and outros F1–F4

The video's own opening and closing sequences (user, 2026-11-04): full frame, 3–5 s, big motion, the video's title as
a large 3D title with a light sweep. **Every video has one intro and one outro**, chosen from the content and different
from the previous video's (record `intro: I<n>` / `outro: F<n>` in brief.md). Functions in `engine/fx/fx-intro.js`;
examples `examples/effects-lab5/lab.js` (`LAB.I1` … `LAB.F4`); clips on Drive in `hieu_ung/12_mo-dau`, `13_ket-thuc`.
Titles here may reach 170 px — the one exception to the small-text rule (nothing else is on screen with them).

| id | Sequence | Use when | How |
|---|---|---|---|
| I1 | 3D title over the map, light sweep, the camera flies through the title into the first shot | place stories (default for maps) | `introTitle3D(title, sub, t0, tGo, drawWorld)` + a camera dive in drawWorld |
| I2 | Mosaic of the video's own photos/footage over the whole frame, changing on the beat, bursts into the title | stories with many images | `introMosaic(imgs, title, sub, t0, tz)` |
| I3 | The map draws itself: glowing outlines out of the dark, satellite ground fades in, the title drops | borders, territory, history | `introMapDraw(rings, title, sub, t0, drawGround)` |
| I4 | Footage/photo inside giant title letters, the letters open into the first shot | one strong image or clip | `introTextVideo(img or vname(…), title, t0, tOpen, {sub})` |
| F1 | Wall: from inside one image the camera pulls back to a wall of all the video's images, title lands, fade | image-rich videos | `outroWall(imgs, title, sub, t0, end)` |
| F2 | Pull back to space: from the last place up to a small Earth among stars, title on top, fade | place and map stories | `outroSpace(drawMap, cam, lonlat, title, sub, t0, end)` |
| F3 | Rewind: the video's images run back fast (blur, tracking lines, ◀◀), stop on the title card | timelines, history | `outroRewind(imgs, title, sub, t0, tStop, end)` |
| F4 | Iris with the title: black closes to a big ring on the last place, the title inside, the ring collapses | the story ends on one place | camera centred on pt, then `outroIris(pt, title, sub, t0, t1, end)` |

Timing: the intro runs under the first voice line (or 2–3 s before it with music only); the hook text of the first line
then uses O1–O5 layouts. The outro starts on the last line's last words and holds 1.5–2 s past the voice (`voice.tail`).

## Openings O1–O5

Hook layouts for the first line, after (or inside) the intro. Functions in `engine/fx/fx-story.js`; examples in
`examples/effects-lab5/lab.js`. The globe is one option among five, never the default.

| id | Opening | Use when | How |
|---|---|---|---|
| O1 | Cold open on a photo or footage, hook in the top band | the place/event has a strong image (most videos) | `openPhoto(img or vname(…), lines, t0)` |
| O2 | One big number + unit as one block over a darkened map | the hook is a surprising figure | draw the map, then `openNumber(str, unit, t0)` |
| O3 | Map already on the place, a 3D word lands (16) or flies through (03) | the name itself is the hook | `fly3DWord` / `flyWord` over `sceneMap` |
| O4 | Document or press page with the key line highlighted (24/25) | news, a decision, a law | `fxDoc` / `phoneDoc` |
| O5 | Globe, the hook block above it, then the dive (01) | world or continent scale stories only | `openGlobe(lines, t0, lon, lat)`, then `globeDive` |

Layout rule for every opening (user correction, 2026-11-04): all hook text goes through `hookBlock(lines, t0, {y})` —
one block in the top band (y ≈ 280–620), lines measured and shrunk to fit, never stacked between the globe/photo and
the subtitles, never a number on one object and its unit on another. The globe in O5 sits low (centre 0.6 H, R ≤ 340).

## Endings E01–E03

Light endings for a closing line inside a shot. The video's own ending is an outro F1–F4 (above); E01–E03 are for
short videos (< 40 s) or a chapter end.

| id | Ending | Use when | How |
|---|---|---|---|
| E01 | Recap: 3–6 key images of the video return as framed tiles, gather into a pile, closing line above, fade | a story told with many photos/footage | `endRecap(imgs, lines, t0, {tGather, end})` |
| E02 | Iris: a white ring closes on the last place, black outside, closing line, collapses to a dot | the story ends on one place | draw the map, then `endIris(worldPt, lines, t0, t1)` |
| E03 | Pull-back card: camera pulls back with every route/outline still lit, vignette, closing block, fade | journeys, maps with several routes | `CAMKEYS` pull-back + `endCard(lines, t0)` |

Closing lines: at most two, the video's own last idea (not "thanks for watching"). The last 0.8 s fades to black (`fadeOut`).

## Photo accents A1–A3

Photos may also appear inside small elements (user, 2026-11-04) — optional, used only when a real photo of that exact
thing exists, and only if the frame stays clean:

| id | Accent | How |
|---|---|---|
| A1 | Round photo pin standing on a place (white ring, stem, pill label) | `photoPin(img, px, py, t0, {label})` |
| A2 | Flag callout with a square photo thumbnail | `photoFlag(img, x, y, text, {pop})` |
| A3 | Photo chips at the start of chart rows | `rankBars([{ label, v, txt, img }], …)` |

Consistency: the same white frame language as the full photos; archive photos grey in grey videos, colour in colour
videos; at most 2 accents per shot; accent photo ≥ 100 px across; never over the main effect or the subtitles.

## Choosing

- Every video needs photos **and** footage (SKILL.md rule): at least one photo insert per ~20 s and at least one
  footage shot. Map shots carry the story; inserts (photos, footage, documents, charts on paper) punctuate it. Alternate them: rarely more
  than two inserts in a row, rarely more than ~12 s of the same map view.
- One "big" effect per section (01, 03, 05, 16, 18–23); small effects (pins, flags, pills, outlines) fill the rest.
- Numbers: one exact number → N09 or 21; one rate moving → N08; one % → N10; two or three → 22; top 3–5 → N11;
  a series → 18; parts of a whole → 19; many rows → 20; values on several places → N02.
- Photos: several places → P01/P03; one photo + where → P02; 2–3 photos → P04/13; a set → P05/P06/P07;
  a detail → P08/12/N14; a title → P09; a still that should move → P10; two sides → P11; mixed sources → P12.
- Places: where → 01/02/23c/N05; how far → N01; how big → 06; what it looks like → 05/08/13/11/N16; a route → 07;
  a link → N04; one unit in focus → 09; before/after → N06; layers of a place → N07.
- Evidence: an official document or press article → 24 (or 25 when the video is news-like), with N12/N13 to point.
- Intro I1–I4 and outro F1–F4 in every video, both different from the previous video's; hook layout O1–O5 for the first line.
- Footage (drone, streets, sea): V01–V13 with stock clips (media.md); without footage use P10 (2.5D) or 11/12/13.

## Transitions

Measured frame by frame on v6, v7, v8, v9, v11.

| Kind | When | Timing | Flag |
|---|---|---|---|
| cut | default between any two shots | on the line's first word (cut = `T0 − 0.12 s`) | none |
| wipe | opening a new section/reason, map ↔ paper/charts | soft black edge from the top right covers in ~2 frames, black ~0.2 s, uncovers the same way; ≈0.42 s | `{ tr: 'wipe' }` |
| whip | into or out of a photo | sideways slide with motion blur, ~0.24 s | `{ tr: 'whip' }` |
| move | map → map | the camera move is the transition | `{ map: true }` on both shots |

No long dissolves (the user found 0.8 s dissolves slow and "delayed"). The new shot must be **full on its first frame**:
its main element already drawn (a 0.15 s settle at most, `EZ.o3(ev(t0, 0.15))`); only secondary items wait for words.
Start continuous animations (chart lines, counters, push-ins) slightly *before* the cut (`t0 − 0.5`) so the first frame
is already in motion. Never hold a frozen first frame. Keep 2–5 s between cuts; a shot longer than ~7 s needs a camera
move or a second beat inside it.

## Effect-specific gotchas

- 01: the flat map at T must equal the globe's last frame: `R(T) = 6371 × flat.s` at the flat camera's centre; mark the
  globe shot `{ map: true }` so no transition doubles the hand-over.
- 02: labels drawn after `fxTilted` must use `gSPt` (tilted screen point), not `gSP`.
- 03/16: keep the word ≤ 10 characters; long words outgrow the frame before they fade.
- 05: pick `fy` so the photo's interesting band (land, not sky) lands inside the shape.
- 07: OSM keys come from `ROADS` (geodata2.js): refs like `QL.1`, `QL.10`, `CT.01`, river names, or `_rail`, `_trunk`;
  join pieces with `joinLines(ROADS[key])` before `route`. Keep the map bright (`gGround({dim: 0.12})`).
- 12: boxes are image fractions `[x0, y0, x1, y1]`; measure them on a gridded preview of the photo first, never guess.
- 20: text in the table is the only text on screen; keep ≤ 6 rows, ≤ 14 characters per cell.
- 24/25: the highlighter rects come from `doc_capture.mjs`; re-capture if the page layout changes.
