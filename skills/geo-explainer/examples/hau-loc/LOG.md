# LOG — hau-loc

## Run 1 (2026-11-02)
- Intake: 9:16, ElevenLabs voice (Xuan Hoa), composed score, style from the user's references (new style `geosat`).
- Story: 10 beats, then 11 after the user asked for more modern history and culture. Look: 5 frames approved. Storyboard: 14 panels approved.
- Fixes during look/board: two-line titles overlapped (gap formula); sliver "lakes" between simplified district polygons (stroke the land mask); ship off-frame at Hòn Nẹ; "1964" lingered into the next line; commune labels hidden under later fills (draw labels in a second pass).
- Dropped claims: "5 aircraft shot down in 1965" (source page unreadable), rượu Chi Nê, Mẹ Tơm (no reliable source).

## Review (final render)
- Cuts on grid: PASS (12). Flat frames: none. Dead beats: PASS (camera "breath" added). Text: PASS (0 overlap, 0 in safe zone) after moving the opening title down, shifting labels, narrowing the density bars.
- Story arc 6/7: gift loudest (p90 −10.6 dB), silence −38 dB, goodbye decays. FAIL "peak has highest cut rate": the only cut in the 1.9s silence is the shot boundary into the split; accepted.
- Sound: loudest 100ms at 111.0s in the payoff act; silence 0.6s before it; −14.2 LUFS, TP −1.5 dBFS.
- Narration density FAIL is an artefact: the check counts Vietnamese syllables as words (3.5–4.8 syll/s is a normal Vietnamese pace).
- Disk: the full PNG export (~3.8 MB/frame) filled the disk; rendered in 500-frame chunks encoded to MP4 and deleted (scratchpad chunked.sh). Review frames were decoded from final.mp4 at half resolution.

| shot | what | result |
|---|---|---|
| 1 open | Việt Nam → Thanh Hóa, title | PASS |
| 2 loc | neighbours, 25 km | PASS |
| 3 terr | three landforms, mangroves | PASS |
| 4 num | area + population bars | PASS |
| 5 his | names through dynasties | PASS |
| 6 tri | Bà Triệu, 248 | PASS |
| 7 mod | Hòn Nẹ 1964, LLVT | PASS (weak: small island, sparse frame) |
| 8 rel | donut 51 relics | PASS |
| 9 cul | Cầu Ngư boat | PASS |
| 10 dens | density bars | PASS (weakest: GADM Ngư Lộc polygon is a thin triangle, map half empty) |
| 11 mam | mắm tôm jar | PASS |
| 12 split | five communes + bars | PASS |
| 13 end | pull back, title | PASS |

## v2: photos (2026-11-02)
- User asked for photos, replacing captions where better. Source chosen: Commons + labelled AI.
- Photo card helper gPhoto (src/scenes.js): dark frame glowing in the scene colour, slow push-in, caption bar, credit; AI images carry a yellow "ẢNH MINH HOẠ AI" tag.
- Replaced: flag sub-lines (Đa Lộc, Bà Triệu) → photo captions; "1964 / phục kích…" text block → Maddox photo + 1964; drawn mắm tôm jar → AI photo; Ngư Lộc roof dots (weakest shot) covered by a real street photo. 248 count moved to the top; Cầu Ngư badge moved to the top.
- Commons API rate-limited plain curl; the file pages and api.wikimedia.org REST worked.
- textcheck: PASS (0/0).

## v3: photos the way the references use them (2026-11-02)
- User wasn't happy with the v2 photo cards and asked for full-screen photos, per 13 new reference videos in ~/Downloads/geo_video.
- References measured (contact sheets in ~/references/geo_video/v2): (1) map photo callouts = photo in a thick white rounded frame, place name in bold caps inside its foot, white pointer to the spot; (2) full-screen B-roll photos with slow push-in and big two-colour pop-in type; old photos in b&w; wide photos in a rounded window over a blurred copy.
- Built gCallPhoto (Đa Lộc mangroves, Đền Bà Triệu, Hòn Nẹ) and scenePhoto inserts as their own shots: Bà Triệu (tri2), Maddox 1964 (b&w window), Cầu Ngư (AI, labelled), Ngư Lộc street, mắm tôm (AI, labelled). Whoosh on each cut into a photo.
- textcheck: PASS (0/0) after shrinking the Bà Triệu headline (it ran into the right safe zone).

## v4: 5 minutes, every reference technique (2026-11-02)
- New code: src/fx.js (globe, 3D type, tilted map, blur reveals, subtitles, documents with highlighter, line/pie/table/thermometer/pictograms/rings/flow/inset, photo grid, outlines in photos, transitions, paper), src/sec-new.js (new scenes), src/geodata2.js (world land + OSM roads/river).
- 37 shots. Transitions (dip/wipe/flash/blur) on 21 cuts; subtitles from the voice's word times.
- Fixes found on stills: globe rim gradient washed the land (inner stop must be transparent); tilted map showed black corners (offscreen canvas made wider than the frame); doc page cut on the left (recaptured at 1100 px viewport); label/pill overlaps.
- textcheck: PASS (0/0) after: the 3D fly-through word kept inside the frame (grows to 1.32×, fades), photo outline labels fade as the pan carries them out, two pills shortened.

## v4.1: user notes on the stills (2026-11-02)
- Ngư Lộc "triangle with roofs" and the commune patch: removed; Ngư Lộc is a pin with rings in both culture shots.
- The drawn Long Châu boat: removed.
- The population chart "not impressive": redone as a big 3D count-up with a year ticker, a glowing line with a running light, and pictograms.
- Mangrove green dots: gone since v4 (the commune is filled with the dyke photo).
- Outline mismatch: every boundary layer now comes from one GADM level-3 Thanh Hóa layer simplified once with mapshaper (interval 140 m, topology kept), then dissolved into districts, province, the five groups and the district outline. Old layers in references/geo_data/v1_backup.
- Rule for the style: build all boundary levels from one simplified layer by dissolving; never simplify levels separately.
- textcheck PASS (0/0). Export chunk size 250 frames (disk).

## v5: 3 minutes + redone effects (2026-11-03)
- Cut to 180,5 s (user): dropped road/river, the two part questions, mangrove numbers, 297 relics (and the outlined-photo shot), Hòn Nẹ 6 km, Anh hùng LLVT, 14 festivals (and the relic table), Thanh Hóa 166 (and the inset map), the outro mosaic. No new voice: the 28 kept takes are re-timed.
- Removed by request: vertical region names, photos masked into regions, neon routes with legend, river glow.
- Redone after re-reading the reference stills (the source videos were gone from ~/Downloads; the extracted sheets in ~/references/geo_video/v2 were used):
  - globe: textured land (seamless noise pattern), clouds, sun glint, finer coast (0.1° simplify); one continuous dive whose end state equals the flat map (R = 6371 × 0.78 px at the map's centre), then a cross-fade; radial zoom blur on the fast part; "VIỆT NAM" stands on the globe and fades before outgrowing the frame.
  - pie: a big tilted 3D pie on the map; wedges arrive as each commune is named, pop out and settle; the matching region flashes.
  - concentric rings: the references' flat target on paper (dashed orbit, disc, orange ring, core), the two heritages as satellites joined to it, the number on top with an orange tag.
  - timeline: dark olive board, white year boxes, thick white elbow arrows building down a staircase, framed pictures beside.
  - documents: only the article column is captured (Playwright, the content column around the sentence), shown as a tilted page over two sheets on a blurred dark background, an icon + title above and the source line; the highlighter kept.
- textcheck PASS (0/0).
