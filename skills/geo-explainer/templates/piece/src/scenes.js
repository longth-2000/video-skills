// =====================================================================
//  SCENES — one map world (GEO, km) plus inserts (photos, documents, charts). Pick effects from references/effects.md:
//  only the ones the content needs. Little text, small text, never on top of the effect.
// =====================================================================
const TEX = GEO.tex, S0 = (H * 0.85) / TEX[0].span, S1 = (W * 0.9) / TEX[1].span, S2 = (W * 0.9) / TEX[2].span;   // country / region / focus zoom
const FOC = [TEX[2].cx, TEX[2].cy];                                                                               // the focus unit's centre (km)
const REGION = GEO.prov.reduce((a, p) => (!a || dist(p.c, [TEX[1].cx, TEX[1].cy]) < dist(a.c, [TEX[1].cx, TEX[1].cy]) ? p : a), null);
const kmToLonLat = ([x, y]) => [GEO.proj.lon0 + x / (111.32 * Math.cos(GEO.proj.lat0 * Math.PI / 180)), GEO.proj.lat0 - y / 111.32];
function focusOutline(o = {}) { gRegion(GEO.focus, { fill: o.fill ? G.orange : null, fa: o.fa ?? 0.22, line: G.orange, lw: o.lw ?? 5, glow: o.glow ?? 18, frac: o.frac, len: o.len, la: o.la }); }

// ---- 01 the opening: Earth from space dives into the country (globeDive hands over to the flat map at SEC.open)
function sceneGlobe() {
  const flat = { x: TEX[0].cx, y: TEX[0].cy, s: S0 };
  globeDive(SEC.open, [20, 5], kmToLonLat([flat.x, flat.y]), flat, () => { gGround({ dim: 0.28 }); gRegion(GEO.country, { line: '#ffffff', lw: 2.5, la: 0.85 }); });
}
// ---- the map shots share one camera path (CAMKEYS in shots.js); each section adds its overlays
function sceneMap(sec) {
  GC = gCamAt(CAMKEYS, TT); GC.s *= 1 + 0.03 * Math.sin(TT * 0.55);   // a slow breath so held shots never freeze
  gGround({ dim: 0.28 });
  ({ open: mapOpen })[sec]();
}
function mapOpen() {
  const zIn = seg(TT, SEC.open + 1.0, SEC.open + 3.5);
  gRegion(GEO.country, { line: '#ffffff', lw: 2.5, la: 0.85 - zIn * 0.6 });
  gRegion(REGION.r, { fill: G.orange, fa: 0.18 * popS(SEC.open + 0.4), line: G.orangeL, lw: 3, glow: 10, la: popS(SEC.open + 0.4) });
  focusOutline({ fill: true, fa: 0.45, frac: ev(SEC.open + 2.6, 1.0), len: gRingLen(GEO.focus) + 20 });
  const [fx, fy] = gSP(FOC); gFlag(fx, fy, '__FOCUS_UPPER__', { size: 40, pop: popS(SEC.open + 3.2), up: 50 });
}
