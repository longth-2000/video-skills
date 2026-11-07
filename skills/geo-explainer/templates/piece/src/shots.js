// =====================================================================
//  SHOTS — section times from the voice, the map camera path, the shot list (ERA_LIST) and TIMELINE.
//  ERA_LIST entry: [t0, t1, draw, { map: true, tr: 'cut'|'wipe'|'whip' }]. Map → map = camera move; default = hard cut;
//  'wipe' (diagonal black, ~0.4 s) for section changes, 'whip' into/out of photos (fx/transitions.js).
// =====================================================================
const S = (id) => Math.round((T0(id) - 0.12) * FPS) / FPS;   // cut 0.12 s before the line's first word (references cut on the word)
// opening: pick O1–O5 (effects.md "Openings") — not the previous video's. The template opens on the map (O3 style);
// for O5 put [0, SEC.open, () => sceneGlobe(), { map: true }] first and set SEC.globe = 0, SEC.open ≈ 3.6.
const SEC = { open: 0, l2: S('l2') };
// camera keys [t, x, y, s, dur] (world km, px/km)
const CAMKEYS = [
  [0, TEX[0].cx, TEX[0].cy, S0, 0],
  [SEC.open + 1.2, TEX[1].cx, TEX[1].cy, S1, 2.4],
  [SEC.open + 3.4, FOC[0], FOC[1], S2, 1.6],
];
const ERA_LIST = [
  [SEC.open, DURATION, () => sceneMap('open'), { map: true }],
];
const SHOT_TITLES = ['mở đầu (O3: bản đồ)', '__FOCUS__'];
const SHOTS = ERA_LIST.map(([t0, t1, f], i) => [(f.toString().match(/'(\w+)'/) || [0, 'shot' + i])[1], i, t0, t1, SHOT_TITLES[i] || 'shot ' + i]);
const TIMELINE = {
  width: W, height: H, fps: FPS, bpm: BPM, gridOffset: GRID0, duration: DURATION, frames: NFRAMES, loop: LOOP_T, safe: SAFE, aspect: FORMAT,
  format: 'journey',
  shots: SHOTS.map(([key, era, t0, t1, title], i) => ({ id: i + 1, key, era, t0, t1, title })),
  cuts: ERA_LIST.slice(1).map((e) => e[0]),
  morphs: [], cues: {}, acts: [{ name: '1', role: 'build', t0: 0, t1: DURATION }],
  board: ERA_LIST.map((e, i) => ({ t: Math.min(e[1] - 0.2, e[0] + 2.5), title: (i + 1) + ' ' + (SHOT_TITLES[i] || ''), sound: '', next: '' })),
  narration: VOICE.lines.map((l) => ({ t0: l.t0, t1: l.t1, text: l.text })),
};
window.TIMELINE = TIMELINE;
