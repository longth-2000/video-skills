  // =====================================================================
  //  SCORE — a low documentary bed under the voice (mixed at piece.json voice.music dB and ducked by export),
  //  an air whoosh on every wipe/whip and every big camera move, a pluck when a place is named (PINGS).
  //  Never schedule a sound before t = 0: sweep() starts 0.35 s before its time, so clamp early cues.
  // =====================================================================
  const T = TIMELINE, END = T.duration, CH = [['D3', 'A3', 'F4'], ['Bb2', 'F3', 'D4'], ['F3', 'C4', 'A4'], ['C3', 'G3', 'E4']], BAR = 4 * BEAT;
  to = 'm';
  for (let t = 0, i = 0; t < END - 0.5; t += 2 * BAR, i++) pad(t, Math.min(t + 2 * BAR + 0.15, END - 0.3), CH[i % 4], 0.032, { cut: 900, att: 0.6, rel: 0.5, send: 0.35 });
  drone(0, END - 0.3, nz('D2'), 0.016);
  to = 's';
  const at = (t) => Math.max(0.4, t);
  if (SEC.globe != null) { sweep(0.2, SEC.open, 0.02, 120, 4200, 0); noiseHit(SEC.open - 0.1, 0.4, 'lowpass', 300, 1, 0.12, 0); sub(SEC.open - 0.1, 0.4); }   // the globe dive (O5 only)
  for (const [tc] of XCUTS) sweep(at(tc) - 0.2, at(tc) + 0.12, 0.012, 600, 5200, 0);   // wipes and whips
  for (const k of CAMKEYS.slice(1)) if (k[4] > 0.5) sweep(at(k[0]), k[0] + Math.min(1.2, k[4]), 0.008, 300, 1800, 0);
  const PINGS = [Math.max(0.6, SEC.open + 3.2)];
  PINGS.forEach((t) => [['A4', 0], ['D5', E8]].forEach(([n, dt], j) => pluck(at(t) + dt, nz(n), 0.11, j ? 0.2 : -0.2, 0.5, 2800, 0.4)));
