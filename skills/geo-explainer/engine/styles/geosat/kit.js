// =====================================================================
//  styles/geosat/kit.js — a dark satellite-map infographic look (made from the user's references with new-style.md).
//  The world is a map in km (GEO, from the piece's geodata.js). The ground is procedural "satellite imagery":
//  three levels of detail baked once into offscreen canvases (country / province / district), crossfaded by zoom.
//  On top: glowing boundary lines, translucent region fills, flag callouts, pins, typed two-colour titles, charts.
//  Motion on 1s (camera moves are smooth like the references), springs for pops.
//  Names are prefixed `g` (never a core name).
// =====================================================================
const G = {
  ink: '#ffffff', orange: '#f39a2b', orangeL: '#ffc06a', red: '#e5413a', teal: '#2bb5a8', lime: '#b8e04a',
  blue: '#3f7be0', yellow: '#f2d23c', violet: '#9b6cf0', dark: '#0b1014', paper: '#0c1318',
};
const GFONT = HAND;
// ---------------------------------------------------------------------
//  value noise (integer hash), deterministic
// ---------------------------------------------------------------------
function gH(x, y, s) { let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function gNoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = gH(xi, yi, s), b = gH(xi + 1, yi, s), c = gH(xi, yi + 1, s), d = gH(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function gFbm(x, y, s, oct = 4) { let t = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < oct; i++) { t += a * gNoise(x * f, y * f, s + i * 17); n += a; a *= 0.5; f *= 2.03; } return t / n; }
// ---------------------------------------------------------------------
//  the ground: textures at three levels of detail. Each: world centre (cx, cy), span (km), size (px).
// ---------------------------------------------------------------------
// GEO.tex (written by scripts/geodata.mjs) sets them per piece: country / region / focus area.
const GTEX_DEF = (GEO.tex || [{ cx: 0, cy: 330, span: 2500 }, { cx: -40, cy: -10, span: 380 }, { cx: 0, cy: -5, span: 46 }])
  .map((t, i) => ({ cx: t.cx, cy: t.cy, span: t.span, px: t.px ?? (i === 2 ? 2560 : 2048), lvl: t.lvl ?? i, fade: t.fade || null }));
const GTEX = [];
function gRingsPath(c, R, k, ox, oy) { for (const r of R) { c.moveTo((r[0][0] - ox) * k, (r[0][1] - oy) * k); for (let i = 1; i < r.length; i++) c.lineTo((r[i][0] - ox) * k, (r[i][1] - oy) * k); c.closePath(); } }
function gMask(def, draw, blur) {   // rasterise world rings into a grey mask (0..255), optionally blurred
  const cv = document.createElement('canvas'); cv.width = cv.height = def.px; const c = cv.getContext('2d');
  const k = def.px / def.span, ox = def.cx - def.span / 2, oy = def.cy - def.span / 2;
  c.fillStyle = '#000'; c.fillRect(0, 0, def.px, def.px);
  if (blur) c.filter = `blur(${blur}px)`;
  c.fillStyle = '#fff'; c.beginPath(); draw((R) => gRingsPath(c, R, k, ox, oy)); c.fill('nonzero');
  if (def.lvl > 0 && !blur) { c.strokeStyle = '#fff'; c.lineJoin = 'round'; c.lineWidth = (def.lvl === 1 ? 3 : 0.25) * k; c.stroke(); }   // close slivers between simplified neighbours
  return c.getImageData(0, 0, def.px, def.px).data;
}
// land = every polygon layer the piece has (adjacent polygons of one simplified layer share edges, so no slivers)
function gLandRings(lvl, add) {
  add(GEO.country || GEO.vn || []); add(GEO.nb || []); if (lvl === 0) return;
  for (const p of GEO.prov || []) add(p.r);
  for (const d of GEO.dist || []) add(d.r);
  if (lvl === 2) { for (const c of GEO.comm || []) add(c.r); if (GEO.focus) add(GEO.focus); }
}
function gBuildTex(i) {
  const def = GTEX_DEF[i], N = def.px, kpx = def.span / N;   // km per px
  const land = gMask(def, (f) => gLandRings(def.lvl, f));
  const near = gMask(def, (f) => gLandRings(def.lvl, f), Math.round(N * (def.lvl === 0 ? 0.012 : def.lvl === 1 ? 0.02 : 0.03)));
  const deep = gMask(def, (f) => gLandRings(def.lvl, f), Math.round(N * 0.06));
  const hill = def.lvl === 2 && GEO.hills ? gMask(def, (f) => GEO.hills.forEach((R) => f(R)), 40) : null;   // GEO.hills: rings of hilly units (optional)
  const cv = document.createElement('canvas'); cv.width = cv.height = N; const c = cv.getContext('2d');
  const img = c.createImageData(N, N), d = img.data;
  const ox = def.cx - def.span / 2, oy = def.cy - def.span / 2;
  // noise scales in km
  const sc = def.lvl === 0 ? 1 / 60 : def.lvl === 1 ? 1 / 9 : 1 / 1.2;
  const fieldKm = 0.28;
  for (let py = 0; py < N; py++) for (let px = 0; px < N; px++) {
    const j = (py * N + px) * 4, wx = ox + px * kpx, wy = oy + py * kpx;
    const L = land[j] / 255, nr = near[j] / 255, dp = deep[j] / 255;
    let r, g, b;
    // sea: deep blue, lighter and greener near the coast, a little noise
    const sn = gFbm(wx * sc * 0.7, wy * sc * 0.7, 91, 3);
    const sh = nr * nr;
    r = 10 + 28 * sh + sn * 8; g = 34 + 52 * sh + sn * 10; b = 52 + 48 * sh + sn * 12;
    if (L > 0.02) {
      // relief: mountains rise inland (deep mask), hills in the hill communes
      const inland = clamp((dp - 0.55) / 0.45);
      let amp = def.lvl === 2 ? 0.15 + 0.85 * (hill ? hill[j] / 255 : 0.25) : 0.2 + 1.2 * inland;
      const e = (x, y) => gFbm(x * sc * 2.2, y * sc * 2.2, 7, 5);
      const h0 = e(wx, wy), hx = e(wx + kpx * 2, wy), hy = e(wx, wy + kpx * 2);
      const shade = clamp(0.5 + ((h0 - hx) + (h0 - hy)) * amp * (def.lvl === 2 ? 18 : 26), 0, 1);
      const veg = gFbm(wx * sc, wy * sc, 33, 4), dry = gFbm(wx * sc * 0.5, wy * sc * 0.5, 55, 3);
      // base: dark olive forest .. brown fields
      let lr = 46 + 38 * dry - 10 * veg, lg = 50 + 22 * dry + 4 * veg, lb = 34 + 14 * dry;
      if (def.lvl === 2) {
        // rice-field patchwork, villages, the dense coastal town
        const fx = Math.floor(wx / fieldKm + gNoise(wx * 0.4, wy * 0.4, 5) * 0.8), fy = Math.floor(wy / (fieldKm * 0.6) + gNoise(wx * 0.4, wy * 0.4, 6) * 0.8);
        const fr = gH(fx, fy, 3), lowland = 1 - (hill ? hill[j] / 255 : 0.25);
        lr += lowland * (fr - 0.5) * 22; lg += lowland * ((fr - 0.5) * 18 + 4); lb += lowland * (gH(fx, fy, 4) - 0.5) * 10;
        const vil = gFbm(wx * 2.2, wy * 2.2, 77, 3) + (1 - nr) * 0 + (nr < 0.97 ? 0.08 : 0);
        if (vil > 0.6) { const k2 = clamp((vil - 0.6) * 6); lr = lerp(lr, 92 + gH(px, py, 8) * 50, k2); lg = lerp(lg, 90 + gH(px, py, 9) * 45, k2); lb = lerp(lb, 84 + gH(px, py, 10) * 40, k2); }
        const edge = (Math.abs(wx / fieldKm - Math.round(wx / fieldKm)) < 0.05 || Math.abs(wy / (fieldKm * 0.6) - Math.round(wy / (fieldKm * 0.6))) < 0.06) && lowland > 0.5;
        if (edge) { lr *= 0.92; lg *= 0.93; lb *= 0.95; }
      } else if (def.lvl === 1) {
        const town = gFbm(wx * 0.9, wy * 0.9, 61, 3) * (1 - inland);
        if (town > 0.58) { const k2 = clamp((town - 0.58) * 5); lr = lerp(lr, 96, k2); lg = lerp(lg, 94, k2); lb = lerp(lb, 88, k2); }
      }
      const s2 = 0.45 + shade * 0.9;
      lr *= s2; lg *= s2; lb *= s2;
      // sandy coast line
      const coast = clamp((1 - nr) * 3) * clamp(L);
      lr = lerp(lr, 120, coast * 0.35); lg = lerp(lg, 112, coast * 0.35); lb = lerp(lb, 92, coast * 0.35);
      const k = clamp(L * 1.5);
      r = lerp(r, lr, k); g = lerp(g, lg, k); b = lerp(b, lb, k);
    }
    const gr = (gH(px, py, 2) - 0.5) * 8;
    d[j] = r + gr; d[j + 1] = g + gr; d[j + 2] = b + gr; d[j + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  return { ...def, cv };
}
function gTex(i) { if (!GTEX[i]) GTEX[i] = gBuildTex(i); return GTEX[i]; }
