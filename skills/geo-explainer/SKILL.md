---
name: geo-explainer
description: Use when the user wants a short vertical explainer video (TikTok/Reels/Shorts style, 9:16, Vietnamese voice-over) told on a satellite map with animated infographics — a place's geography, history or culture, real estate and infrastructure, economy, administrative changes, or any topic explained "on the map" like the user's reference videos. Also use when the user asks to change, re-time, re-cut or re-export such a video, or to add a new effect from a reference video. Not for general video editing of filmed footage, slide decks, or non-map motion graphics.
---

# geo-explainer

Make 20 s – 5 min vertical explainer videos in the user's reference style: a dark satellite map with glowing orange
outlines, routes, pins and flags, inserts of full-screen photos, documents and charts on paper, burnt-in subtitles,
an ElevenLabs Vietnamese voice-over and a code-generated score. Everything is drawn in code on one canvas, frame by
frame (engine copied from the MIT "animate" kit, see `engine/LICENSE-animate`), and rendered with Playwright + ffmpeg.

Talk to the user in Vietnamese. On-screen text and the voice are Vietnamese.

## Requirements

node ≥ 18, Playwright with Chromium (`npm i -g playwright && npx playwright install chromium`), ffmpeg, python3,
curl, npx (mapshaper is fetched on demand). ElevenLabs MCP tools for the voice. Optional: `pip install faster-whisper`.

## Where things go

- Pieces: `<pieces>/<slug>/` on the local disk, finished videos published to Drive — all paths from
  `~/.config/geo-explainer/config.json` (`zsh scripts/gx.sh config`); read `references/storage.md` first time in a session.
- Commands: `scripts/gx.sh` (paths below are relative to this skill's folder). Run `zsh scripts/gx.sh` for usage.
- Scratch images for checking: the session scratchpad.

## Workflow

Copy this checklist into your plan and keep it updated:

- [ ] 1 Intake: topic, length (default ~60 s; the user may give a script, photos, new references)
- [ ] 2 Research facts → brief.md facts table (every number on screen and in the voice has a source)
- [ ] 3 Script (spoken numbers) → **checkpoint 1: script approval**
- [ ] 4 Storyboard: intro (I1–I4) + hook layout, shots, effects + reason, photo/footage inserts, outro (F1–F4) → **checkpoint 2**
- [ ] 5 Piece + map data + media + voice
- [ ] 6 Scenes, score → stills → **checkpoint 3: stills approval**
- [ ] 7 Text check, export (background), contact sheet → **checkpoint 4: final video**

### 1 Intake

New video → `zsh scripts/gx.sh new "$(zsh scripts/gx.sh config pieces)/<slug>" "<Title>" <slug> "<Province>" "<Focus unit>"`.
Existing piece → read its `brief.md` and `LOG.md` first; change only what was asked.
If the topic is not tied to one province (e.g. a national economy story), still pick the place the story is anchored on
for `geo.json` (it sets the zoomed-in textures); national views use `GEO.country`/`GEO.prov`.

### 2–3 Research and script

- Research with web search; prefer official pages (government, GSO, provincial portals) and major press. Write each claim
  with its URL in `brief.md`. If a fact cannot be sourced, drop it or say "khoảng"/"ước tính" and tell the user.
- Script: ~2.6 words/s of voice; one idea per sentence; a hook question or surprising number in the first 3 s; end
  with a short line that closes the loop. Numbers spelled out as spoken (see `references/voice.md`).
- Checkpoint 1: show the script as a table (line, ~seconds, what the viewer sees) and ask with AskUserQuestion
  (Duyệt / Sửa vài câu / Góc nhìn khác).

### 4 Storyboard

Read `references/effects.md` (and look at the thumbnails in `assets/effects/` and the reference strips in `assets/refs/` (file name = effect id) for each effect you pick).
For every shot: time range, the line it covers, map or insert, the effects with the reason. The storyboard must place
the photo and footage inserts the rules below require (list each file to download). Use only effects the
content needs. Write it in `brief.md`; checkpoint 2: show the table and ask.

### 5 Build the inputs

1. Map data: edit `geo.json`, run `zsh scripts/gx.sh geo <piece>` (read `references/geodata.md` if anything fails or
   the topic needs merged/new units).
2. Media: read `references/media.md`; photos into `assets/`, documents via `scripts/doc_capture.mjs`; log each in the
   brief's media table.
3. Voice: read `references/voice.md`; ask the user for the voice (default: the last one used); generate, download,
   `zsh scripts/gx.sh voice <piece>`.

### 6 Scenes

Edit `src/shots.js` (SEC from the voice lines, CAMKEYS, ERA_LIST) and `src/scenes.js`. Read `references/engine.md`
before the first scene of a session. Reuse the LAB examples in `examples/effects-lab/lab.js` and the full Hậu Lộc
piece in `examples/hau-loc/` instead of writing effects from scratch. Build and look:

```
zsh scripts/gx.sh build <piece>
zsh scripts/gx.sh still <piece> 1,3.5,6,9 <scratchpad>/s1.png 0.3
```

Check every cut too (references/review-export.md, Transition check). Fix what you see before showing anything. Checkpoint 3: show 1–2 still strips per section (Read the PNGs, then describe
them) and ask.

### 7 Export

`zsh scripts/gx.sh check <piece>` must PASS and `gx.sh audit` must report 0 errors with every string read. Then run
`zsh scripts/gx.sh export <piece> > <piece>/export.log 2>&1` in the background (≈13 min per minute of video) and **report
progress to the user continuously**: arm a Monitor on `export.log` (lines `progress …%` and `gx:`/errors, see
references/review-export.md, Export) and post each update (percent, frames, time left) as it arrives until the end; make a contact sheet of
`renders/share.mp4`, look at it, append a round to `LOG.md`, and give the user the path of `renders/share.mp4`
(and `final.mp4` for editing); then `zsh scripts/gx.sh publish <piece>` copies it to Drive, and once the user has the
video, `zsh scripts/gx.sh archive <piece>` moves the whole piece folder to Drive (`pieces_out`), verifies every file and
deletes the local copy (the disk is nearly full; the user wants finished work on Drive, not on the Mac). 16:9 only when asked: render with `--format 16:9` after checking stills at that format.

## Rules from the user (do not break)

- On screen: no source lines, no photographer credits, no "ảnh AI / minh hoạ" labels. Sources live in `brief.md` only.
- As little text as possible; when text is needed it is small and never covers the effect. One headline per shot at most.
- Every video opens with a big intro sequence I1–I4 and closes with a big outro F1–F4 (effects.md "Intros … outros"):
  full frame, 3–5 s, the title as a large 3D title. Choose by content and never reuse the previous video's intro or outro
  (read `intro:`/`outro:` in the briefs of the last pieces in `pieces` and `pieces_out`). Not the globe by default.
- Hook text of the first line goes through `hookBlock` (O1–O5 layouts) in the top band — never squeezed around the
  globe or a photo, number and unit as one block.
- Photos may also sit inside callouts, pins and charts (A1–A3) when a real photo of that thing exists and the frame
  stays clean (≤ 2 per shot, same frame style).
- Every video mixes map, photos and video footage — never map only. Minimum: one real photo insert per ~20 s of video
  and at least one footage shot (V01–V13) per video, more for longer videos; every section that has no photo/footage
  insert still needs a reason in the storyboard. Search order: real archive/press footage with a clear licence (Wikimedia
  Commons, national archives — public domain for history topics), then Pixabay stock (media.md), then AI video only with
  the user's credit approval. Plan the inserts at storyboard time (checkpoint 2 lists them).
- Photos full screen or in the reference frames (white frame on the map, TV frame, round satellites, grid). No small
  photo cards.
- Transitions as in the references (effects.md "Transitions"): hard cuts on the first word by default, a ~0.4 s
  diagonal black wipe to open each section, a whip into photos, camera moves between map shots. No long dissolves.
- Every shot is full on its first frame; nothing "builds up" after the cut while the voice is already talking.
- All boundary levels come from one simplified layer (the geodata script guarantees it — do not hand-edit outlines).
- Work in rolling deliveries: when making several clips or versions, export and report each as it finishes.
- Test clips go to a local review folder first; move them to Drive only after the user approves (storage.md).
- Check stills before every export; never announce a render you have not looked at.
- Every on-screen text must be spelled, accented, formatted and worded correctly in Vietnamese, in the intended font:
  run `gx.sh audit` and read every string it lists (references/review-export.md, Text audit) before checkpoint 3 and
  before export. A typo, wrong diacritic, wrong number format or fallback font is a blocking bug.
- Keep the user's earlier decisions (removed effects, length, voice) unless they change them.

## Gotchas

- Stale outputs: a failed export must not leave an old `final.mp4` that looks new — use `gx.sh export`, which deletes it.
- Audio: any sound cue before t = 0 makes the whole score fail (`sweep` starts 0.35 s early) — clamp cue times.
- When shifting or re-timing shots, every hard-coded time in `shots.js` must move too (e.g. the globe's 0–3.6 s);
  cue from the voice wherever possible.
- Overpass (OSM) is often busy; the geodata script retries. Commons rate-limits curl on `w/api.php`; use api.wikimedia.org.
- Do not edit `src/geodata*.js` by hand; change `geo.json` and regenerate.
- Never overwrite the user's files outside the piece folder; move replaced renders to `share-v<N>.mp4` first.

## Resources

- `references/effects.md` — the catalog: 28 + 16 new + 12 photo + 13 video effects (read at storyboard time).
- `references/reference-videos.md` — the look; adding effects from new references.
- `references/geodata.md`, `references/voice.md`, `references/media.md` — the input steps.
- `references/engine.md` — piece structure, timing, drawing API.
- `references/review-export.md` — checks and export details.
- `references/storage.md` — config file, Google Drive folders, disk-space rules.
- `templates/piece/` — copied by `gx.sh new`. `examples/` — Hậu Lộc piece and the effects lab (read-only examples).
