# Storage (where references and outputs live)

Read when a path to the reference videos or an output folder is needed, or when the disk is short of space.

All locations come from `~/.config/geo-explainer/config.json` (print with `zsh scripts/gx.sh config`, one key with
`gx.sh config <key>`):

```json
{
  "references":  "<Google Drive>/My Drive/geo-explainer/references",   // the 13 source videos (v1–v13 = names sorted)
  "effects_out": "<Google Drive>/My Drive/geo-explainer/hieu_ung",     // effect test clips, one folder per kind
  "renders_out": "<Google Drive>/My Drive/geo-explainer/renders",      // finished videos (gx.sh publish <piece>)
  "pieces":      "~/geo-videos",                                       // working folders (local disk)
  "pieces_out":  "<Google Drive>/My Drive/geo-explainer/pieces"        // finished piece folders (gx.sh archive)
}
```

`<Google Drive>` = `~/Library/CloudStorage/GoogleDrive-<account>` (Google Drive for desktop, **Stream files** mode).

## Rules

- Pieces are built on the local disk (`pieces`): rendering writes hundreds of MB of PNG frames per chunk; a synced
  folder would upload them. Never put a piece inside the Drive folder.
- Finished work goes to Drive and leaves the Mac (user, 2026-11-04): `gx.sh publish <piece>` copies the video to
  `renders_out`; after delivery `gx.sh archive <piece>` moves the whole folder to `pieces_out/<slug>` (rsync, file-by-file
  compare, then deletes the local folder). Effect test clips: render, then copy each clip to its `hieu_ung/<kind>` folder
  as soon as it is done and delete the local copy (the user approved pushing straight to Drive).
- Reference videos are read in place from Drive (ffmpeg reads the streamed file; Drive downloads it on first open).
  If the path is missing (Drive not running, offline), work from `assets/refs/` stills and the notes in
  `reference-videos.md`; say so instead of failing.
- In Stream mode Drive keeps a local cache while uploading; `df` shows the space only after the upload finishes
  and macOS purges the cache. Before moving more than ~500 MB into Drive, check free space and move file by file.
- Never delete local originals until the Drive menu shows the upload finished ("All files up to date").

## Effect clips on Drive

`hieu_ung/` is sorted by kind: `01_ban-do`, `02_anh`, `03_do-thi-tron`, `04_do-thi-cot`, `05_do-thi-duong`,
`06_con-so-bang`, `07_chu`, `08_van-ban`, `09_so-do`, `10_chuyen-canh-nen`, `11_video`, `12_mo-dau` (openings O1–O5), `13_ket-thuc` (endings E01–E03) (+ `_ban_cu` = versions replaced after a
redo). New test clips are rendered to `<pieces>/_review/<batch>`, then each finished clip is copied into its kind folder
(photo accents A1–A3 → `02_anh`), compared, and removed locally.
