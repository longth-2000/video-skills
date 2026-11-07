# Checks and export

Read at checkpoint 3 (stills) and before every export.

## Stills (checkpoint 3 and after every scene change)

`gx.sh still <piece> t1,t2,… <scratchpad>/x.png 0.3` — 4–6 times per shot: just after it starts, at each cue, near
the end. Look at the strip (Read the png) for: text overlapping effects or other text, labels outside the safe zone,
wrong place names, empty/black frames, outlines not matching, photos showing the wrong thing.

## Transition check (before export)

For every cut, render frames around it: `gx.sh still <piece> tc-0.2,tc,tc+0.05,tc+0.3 …` (tc = the cut time from
`shots.js`). Expect:
- hard cut: the frame at tc+0.05 already shows the new shot's main element (no empty or half-built frame);
- wipe: black at tc, the new shot uncovering at tc+0.2, fully visible by tc+0.3;
- the cut lands on the line's first word (compare tc with `T0(id)` in voice.json: tc ≈ T0 − 0.12 s);
- no shot holds still for more than ~2 s while the voice talks, and no shot runs longer than ~7 s without a new beat.
Root cause of the first complaint (2026-11-03): 0.84 s dissolves that froze the incoming shot's first frame, cut times
rounded to the beat (up to 0.25 s late), and scenes whose content started building 0.3–0.6 s after the cut.

## Text audit (before every checkpoint 3 and every export — required)

1. `zsh scripts/gx.sh audit <piece>` → `<piece>/text_audit.txt`. ERRORs block the export (`gx.sh export` runs the audit
   first and stops). Fix the source, rebuild, re-run until 0 errors; read every WARN and fix or justify it.
2. Then **read every string** in the file's list — it is every text the viewer will see (titles, labels, pills, table
   cells, subtitles) — and check each one:
   - spelling and diacritics (dấu hỏi/ngã, â/ă/ơ/ư, đ); no missing or extra tone marks; no English left over;
   - one tone-mark style in the whole video (old "hoá/thuý" or new "hóa/thúy"); place names always in their official
     form (Thanh Hóa, Hồ Chí Minh, Ngư Lộc) regardless of the style;
   - grammar and wording: short, natural Vietnamese; caps used the same way across labels (ALL CAPS for labels/titles,
     sentence case for subtitles and serif lines); no words split across lines;
   - numbers: decimal comma (143,67), thousands dot (176.418), units (km², %, triệu người) — and every number equals
     the one in brief.md and the voice;
   - names, dates and abbreviations (TP., QL, NQ) correct and consistent with the voice script;
   - subtitles match what is said (they come from voice/script.json: fix typos there, then re-run gx.sh voice).
3. Write "text audit: N strings read, 0 errors" (and any accepted WARN) in LOG.md.
The audit cannot judge spelling or grammar by itself: step 2 is not optional.

## Text check (before export)

`gx.sh check <piece>` → must say `text: PASS`. Overlaps reported inside a wipe window (±0.3 s around a cut) are hidden by the black and may be accepted; say so to
the user.

## Export

`gx.sh export <piece>` renders in 250-frame chunks (the disk cannot hold a full PNG sequence), concatenates, mixes the
voice and score (−14 LUFS), writes `renders/final.mp4` and `renders/share.mp4`. A 3-minute piece takes ~40 min: run it
in the background and keep the user informed the whole time (the user asked for continuous updates, 2026-11-04):

```
zsh scripts/gx.sh export <piece> > <piece>/export.log 2>&1   # background (run_in_background)
# Monitor (timeout 30 min, re-arm until done):
tail -n +1 -f <piece>/export.log | grep -E --line-buffered "progress|gx:|EXIT|rror|fail"
```

`gx.sh export` prints `progress <done>/<total> frames (<pct>%), ~<min> min left` after each chunk and `progress audio`
before the mix. Post every event to the user in one short line (percent + time left); never go quiet until the
`gx:` result or an error arrives. Then make a contact sheet (`gx.sh sheet renders/share.mp4 <scratchpad>/c.jpg`)
and look at it before announcing the result.

## Gotchas

- `export.mjs` captions need ffmpeg with libass: always pass `--no-captions` (subtitles are drawn in the frames).
- Never copy an old `renders/final.mp4` after a failed export: `gx.sh export` deletes it first and fails loudly.
- Re-exports overwrite `share.mp4`; copy the previous one to `share-v<N>.mp4` first if the user may compare.
- Keep the voice file names stable; `voice.json` is regenerated, so re-run `gx.sh voice` after replacing a take.
