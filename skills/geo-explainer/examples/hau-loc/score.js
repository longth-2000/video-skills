  // =====================================================================
  //  SCORE — a low documentary bed under the voice (mixed at −12 dB and ducked by export).
  //  D minor (Dm – Bb – F – C); thin in geography, a soft pulse in history, fullest in culture,
  //  a hard silence before the split, the loudest hit on the five communes, a long fading chord.
  // =====================================================================
  const T = TIMELINE, cu = T.cues, A = (n) => T.acts.find((a) => a.name.startsWith(n));
  const SIL0 = A('4').t0, HITT = cu.hit, END = T.duration;
  const CH = [['D3', 'A3', 'F4'], ['Bb2', 'F3', 'D4'], ['F3', 'C4', 'A4'], ['C3', 'G3', 'E4']];
  const BAR = 4 * BEAT;   // 2s
  to = 'm';
  // 1-3: the pad cycles through the progression, two bars per chord, a little brighter each act
  for (let t = 0, i = 0; t < SIL0 - 0.6; t += 2 * BAR, i++) {
    const t1 = Math.min(t + 2 * BAR + 0.15, SIL0 - 0.5), act = t < SEC.his ? 0 : t < SEC.cul ? 1 : 2;
    pad(t, t1, CH[i % 4], [0.03, 0.036, 0.042][act], { cut: [700, 1000, 1500][act], att: 0.6, rel: 0.5, send: 0.35 });
    if (act >= 1) bass(t, nz(CH[i % 4][0].replace(/\d/, '2')), 0.12);
  }
  drone(0, SIL0 - 0.5, nz('D2'), 0.02);
  // a soft plucked motif when a new place is named (the map's "ping")
  const ping = [VL('open').t1 - 0.4, SEC.loc + 0.3, SEC.terr + 0.2, SEC.tri + 0.6, SEC.mod + 0.4, SEC.cul + 0.4];
  ping.forEach((t, i) => [['A4', 0], ['D5', E8]].forEach(([n, dt], j) => pluck(t + dt, nz(n), 0.11, j ? 0.2 : -0.2, 0.5, 2800, 0.4)));
  // history and culture: a quiet pulse (8ths on a muted pluck), denser in culture
  for (let t = SEC.his; t < SIL0 - 0.6; t += E8) {
    const beat = Math.round((t - SEC.his) / E8), inCul = t >= SEC.cul;
    if (!inCul && beat % 2) continue;
    pluck(t, nz(['D4', 'F4', 'A4', 'C5'][beat % 4]), inCul ? 0.05 : 0.035, (beat % 2 ? 0.3 : -0.3), 0.18, 1600, 0.15);
    if (inCul && beat % 4 === 0) noiseHit(t, 0.06, 'highpass', 7000, 0.7, 0.03, 0.2);
  }
  // the names of the dynasties: one chime each
  [VW('his1', 0.45), VW('his2', 0.55), VW('his2', 0.75), VW('his2', 0.92)].forEach((t, i) => chime(t, [nz(['A5', 'C6', 'D6', 'E6'][i])], 0.05, 0));
  chime(VW('his3', 0.55), [nz('D6'), nz('A6')], 0.08, 0);
  // Bà Triệu: a low drum
  [0, 0.5, 1.0].forEach((d) => { sub(VW('tri1', 0.35) + d, 0.25); noiseHit(VW('tri1', 0.35) + d, 0.18, 'lowpass', 180, 1, 0.12); });
  // the festival: drums under Cầu Ngư
  for (let t = T0('cul1') + 0.6; t < T1('cul2'); t += BEAT) noiseHit(t, 0.16, 'lowpass', 220, 1.2, 0.09, 0);
  // 4 the silence: everything above ends before SIL0; only a faint room tone
  drone(SIL0, HITT, nz('D2'), 0.004);
  // 5 the payoff: a short stab + sub on the hit, then a flat chord
  pad(HITT, HITT + 0.45, ['D3', 'A3', 'D4', 'F4', 'A4'], 0.16, { att: 0.005, rel: 0.25, cut: 4200, send: 0.5 });
  sub(HITT, 1.0); bass(HITT, nz('D2'), 0.5);
  pad(HITT + 0.4, SEC.end + 0.6, ['D3', 'A3', 'F4', 'A4'], 0.05, { att: 0.8, rel: 0.6, cut: 1400, send: 0.45 });
  NEW5.forEach((n, i) => pluck(HITT + 0.25 + i * 0.22, nz(['D5', 'F5', 'A5', 'C6', 'D6'][i]), 0.12, -0.4 + i * 0.2, 0.6, 3600, 0.4));
  // 6 the goodbye: the opening chord, fading out
  pad(SEC.end, END - 0.3, ['D3', 'A3', 'D4', 'F4'], 0.012, { att: 1.5, rel: 1.6, cut: 1100, send: 0.5 });
  to = 's';
  // camera moves: a soft air sweep on each big move
  for (const k of CAMKEYS.slice(1)) if (k[0] < SIL0 - 0.6 || k[0] > HITT) sweep(k[0], k[0] + Math.min(1.2, k[4]), 0.008, 300, 1800, 0);
  sweep(VL('open').t1 - 1.0, VL('open').t1 + 1.2, 0.014, 200, 3000, 0);   // the dive into Thanh Hóa
  // radar ping for the ship in 1964
  for (let t = T0('mod2') + 0.2; t < T1('mod2'); t += 1.0) blip(t, 1800, 1700, 0.25, 0.03, 0.3);
// photo inserts: a short air whoosh into each full-screen photo and a soft one back out
to = 's';
for (const [a, b] of Object.values(PT)) { sweep(a - 0.35, a + 0.25, 0.012, 600, 5200, 0); noiseHit(a, 0.18, 'highpass', 5000, 0.8, 0.025, 0); if (b !== SEC.split) sweep(b - 0.25, b + 0.2, 0.006, 4000, 700, 0); }
// v4: the globe dive, chapter hits, the document highlighter
to = 's';
sweep(0.2, 3.6, 0.02, 120, 4200, 0); noiseHit(3.5, 0.4, 'lowpass', 300, 1, 0.12, 0); sub(3.5, 0.4);
for (const tc of [SEC.ch1, SEC.tl, SEC.grid]) { sub(tc, 0.35); noiseHit(tc, 0.25, 'lowpass', 240, 1, 0.1, 0); }
for (const [tc, kind] of TRANS) if (kind === 'wipe') sweep(tc - 0.3, tc + 0.25, 0.008, 500, 3800, 0);
for (const th of [PT.doccn[0] + 0.9, VW('cul4', 0.7), VW('new3', 0.1)]) noiseHit(th, 1.2, 'bandpass', 3800, 3, 0.02, 0.3);   // the marker on paper
