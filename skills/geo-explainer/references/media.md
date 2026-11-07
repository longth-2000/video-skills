# Photos, documents, AI images

Read at the media step.

## Order of preference

1. Real photos with a clear licence: Wikimedia Commons (search `api.wikimedia.org/core/v1/commons/search/page?q=…`,
   file info `…/core/v1/commons/file/File:<name>`; send a descriptive User-Agent; plain `commons.wikimedia.org/w/api.php`
   rate-limits curl — use the api.wikimedia.org REST endpoints and wait 1 s between calls).
2. Official or press pages for documents (effect 24/25): `scripts/doc_capture.mjs <url> <piece>/assets/col_<key>.jpg
   "<sentence start>" "<sentence end>"` → paste the printed `DOCS.<key>` into `src/scenes.js`.
3. AI images only when nothing real fits (food close-ups, festivals without free photos, illustrations): ElevenLabs
   `creative_generate_image` (or the image tool available). Photorealistic, no text in the image.

Never put a source line, photographer credit or "AI" label on screen. Record every file in `brief.md` (media table):
origin page, author, licence, or the AI prompt. Keep originals in `~/references/<slug>_photos/`, resized copies
(≤ 2000 px long side, JPEG q85) in `<piece>/assets/` (`build.mjs` inlines them).

## Photo rules from the user

- Full screen (`photoFS`) or in the reference frames (white rounded frame on the map, TV frame, round satellites,
  grids). Never small cards with captions.
- B&W only for archive photos. Slow push-in on every still.
- Check the photo shows what the label says before labelling (look at it).

## Video footage

Every video uses footage (SKILL.md rule). History and news topics: first look for real archive footage on Wikimedia
Commons (`api.wikimedia.org/core/v1/commons/search/page?q=<event> film` — files are `.webm`/`.ogv`, mostly public domain
US/UK government newsreels; check the licence on the file page) and convert with ffmpeg before `clip_frames.sh`.
Never present generic stock as a specific historical event.

1. Search Pixabay (free licence, no attribution required; key `pixabay_key` in the user config):
   `curl -G https://pixabay.com/api/videos/ --data-urlencode key=… --data-urlencode q="vietnam fishing boats"`.
   Prefer `medium` (≈2560×1440 or 1920×1080, enough for a vertical crop). Python's urllib fails on this Mac's SSL
   certificates: use curl.
2. Before downloading, list the files for the user (id, content, length, author, size) and wait for approval.
3. Save originals to the Drive `stock` folder (`<references>/../stock`), with `sources.tsv` (file, id, author, page).
4. Cut the stretch you need into frames: `zsh scripts/clip_frames.sh <clip.mp4> <key> <start> <dur> <frames dir> [fx]`
   (24 fps, portrait 720×1280 crop at fx + landscape 1280×720). Link only the frames a piece uses into `assets/`
   (every asset is inlined into index.html; 5.5 s of one variant ≈ 10 MB).
5. Missing scenes: AI video (Higgsfield / ElevenLabs) only after the user approves the credit estimate.
