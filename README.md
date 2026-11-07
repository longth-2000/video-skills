# video-skills

Agent skills for making videos in code.

## geo-explainer

Short vertical (9:16) explainer videos told on a satellite map. The skill covers:

- glowing outlines, routes, pins and flags
- photo, footage and chart inserts
- big intros and outros
- burnt-in subtitles
- an ElevenLabs voice-over and a code-generated score

Each frame is drawn on a canvas and rendered with Playwright and ffmpeg.

Entry point: [`skills/geo-explainer/SKILL.md`](skills/geo-explainer/SKILL.md).

### Install (Claude Code)

```sh
git clone git@github.com:longth-2000/video-skills.git ~/video-skills
ln -s ~/video-skills/skills/geo-explainer ~/.claude/skills/geo-explainer
```

Requirements: node ≥ 18, Playwright with Chromium, ffmpeg, python3, and the ElevenLabs MCP tools for the voice.
Personal settings such as API keys live in `~/.config/geo-explainer/config.json`. They are never stored in this repo.

The engine is derived from the MIT-licensed "animate" kit; see `skills/geo-explainer/engine/LICENSE-animate`.
