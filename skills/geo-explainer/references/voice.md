# Voice-over (ElevenLabs)

Read at the voice step.

1. Script → `voice/script.json` (subtitles are drawn from this text: spell-check it like on-screen text, NFC, correct
   diacritics; numbers there are words for the voice, so the subtitle shows them as spoken): one line per sentence, `id`, `text`, `file`, `after` (pause, s). Write numbers, units
   and abbreviations as spoken Vietnamese: "một trăm bốn mươi ba ki lô mét vuông", "quốc lộ một A", "năm hai nghìn
   không trăm mười chín". TTS misreads digits, "km²", "QL1A", "%".
2. Voice choice (ask every video, default = the last one used, recorded in memory/brief): load the ElevenLabs tools in
   one ToolSearch (`creative_list_voices, creative_create_flow, creative_generate_speech, creative_get_flow_run_status`),
   list voices, make **one** audition line with 2–3 candidate Vietnamese voices on one flow, let the user pick
   (AskUserQuestion with the file paths). Known good: "Xuân Hoà" (deep, northern, documentary), "Tuấn Anh – Storyteller"
   (warm, history), "Quang Tiến" (news). Model `eleven_v4`.
3. Generate every line on one flow (one call per line, **`generations_count: 1`** — the tool's default is 2 takes, which doubles
   the cost for no gain; the user asked for one take per line, 2026-11-04), poll `creative_get_flow_run_status` until all complete, download
   each take to `voice/<file>` with curl (URLs expire — download right away). Never re-run a generation to retry: it
   charges again; regenerate only the lines that are actually bad.
4. `scripts/gx.sh voice <piece>` → `voice/voice.wav` + `voice.json` (line and word times). Word times come from
   faster-whisper when installed (`pip install faster-whisper`; pass `--model small` for Vietnamese, the default
   `small.en` is English-only); otherwise they are estimated from letters — fine for cues, slightly loose for subtitles. In practice faster-whisper
   matched 0 of 82 Vietnamese words on ElevenLabs takes (2026-11): expect estimates and cue from line times (`T0`, `VW`).
5. Before the real voice exists, `gx.sh voice <piece> --scratch` makes placeholder takes (macOS `say`) so the picture
   can be timed; swap in the real takes, re-run, rebuild — scenes cued from `VOICE` follow.

Credits: ~60–125 credits per line per take (English ≈ 1 credit per character). Tell the user the estimate (1 take) before
generating a whole script; regenerate only lines that are actually bad.
