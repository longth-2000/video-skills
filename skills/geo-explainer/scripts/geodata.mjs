#!/usr/bin/env node
// Build a piece's map data from GADM 4.1, Natural Earth 50m and OpenStreetMap.
//   usage: node scripts/geodata.mjs <piece-dir> [--no-osm]
//   reads  <piece>/geo.json   (see references/geodata.md)
//   writes <piece>/src/geodata.js  (const GEO: proj, country, nb, prov, dist, comm, focus, grp, tex — km, y grows south)
//          <piece>/src/geodata2.js (const WORLD: land lon/lat for the globe; const ROADS: OSM lines in km)
// Rule: every boundary level inside the province comes from ONE simplified level-3 layer, dissolved upward, so the
// outlines of communes, districts, the focus unit and the province always coincide.
// Needs: node 18+, npx (mapshaper is fetched on first use), curl. Downloads are cached in ~/.cache/geo-explainer.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(process.argv[2] || '.');
const NO_OSM = process.argv.includes('--no-osm');
const CFG = JSON.parse(fs.readFileSync(path.join(ROOT, 'geo.json'), 'utf8'));
const CACHE = path.join(os.homedir(), '.cache', 'geo-explainer'); fs.mkdirSync(CACHE, { recursive: true });
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'geodata-'));
const ISO = CFG.country || 'VNM';
const norm = (s) => String(s || '').normalize('NFC').toLowerCase().replace(/[\s\-_.']/g, '');
const pretty = (s) => String(s).normalize('NFC').replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2');
const die = (m) => { console.error('geodata: ' + m); process.exit(1); };
const run = (cmd, args) => { const r = spawnSync(cmd, args, { encoding: 'utf8' }); if (r.status !== 0) die(`${cmd} ${args.slice(0, 3).join(' ')} failed:\n${(r.stderr || '').slice(-800)}`); return r.stdout; };
const ms = (...args) => run('npx', ['-y', 'mapshaper', ...args, '-quiet']);
const rd = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const wr = (f, j) => fs.writeFileSync(f, JSON.stringify(j));

function fetchCached(url, name) {
  const f = path.join(CACHE, name); if (fs.existsSync(f) && fs.statSync(f).size > 1000) return f;
  console.log('download', url); run('curl', ['-sSL', '--fail', '--max-time', '600', '-o', f, url]); return f;
}
function gadm(level) {
  const json = path.join(CACHE, `gadm41_${ISO}_${level}.json`); if (fs.existsSync(json)) return json;
  const zip = fetchCached(`https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_${ISO}_${level}.json.zip`, `gadm41_${ISO}_${level}.zip`);
  run('unzip', ['-o', '-q', zip, '-d', CACHE]); return json;
}
// ---- 1. the fine layer: level 3 of the province, simplified once
const prov = CFG.province || die('geo.json needs "province" (GADM NAME_1, e.g. "Thanh Hóa")');
const focus = CFG.focus || die('geo.json needs "focus": { "level": 1|2|3, "name": "..." }');
const fineLevel = Math.min(3, Math.max(2, focus.level + 1));
const raw = rd(gadm(fineLevel));
const inProv = raw.features.filter((f) => norm(f.properties.NAME_1) === norm(prov));
if (!inProv.length) die(`no ${ISO} level-${fineLevel} units with NAME_1 = "${prov}". Names look like: ${[...new Set(raw.features.map((f) => f.properties.NAME_1))].slice(0, 12).join(', ')}`);
// groups: new units made of old ones (e.g. communes merged in 2025): { "New name": ["Old 1", "Old 2"] }
const grpOf = {}; for (const [g, list] of Object.entries(CFG.groups || {})) for (const n of list) grpOf[norm(n)] = g;
inProv.forEach((f) => { const p = f.properties, nm = fineLevel === 3 ? p.NAME_3 : p.NAME_2; p.U = pretty(nm); p.D = pretty(p.NAME_2); p.GRP = grpOf[norm(nm)] || ''; });
wr(path.join(TMP, 'raw.json'), { type: 'FeatureCollection', features: inProv });
ms(path.join(TMP, 'raw.json'), '-simplify', `interval=${CFG.simplify_m ?? 140}`, 'keep-shapes', '-clean', '-o', path.join(TMP, 'fine.json'));
ms(path.join(TMP, 'fine.json'), '-dissolve', 'D', '-o', path.join(TMP, 'dist.json'));
ms(path.join(TMP, 'fine.json'), '-dissolve', '-o', path.join(TMP, 'provOutline.json'));
const fine = rd(path.join(TMP, 'fine.json'));
const isFocus = (p) => focus.level === 1 ? true : focus.level === 2 ? norm(p.D) === norm(focus.name) : norm(p.U) === norm(focus.name);
if (!fine.features.some((f) => isFocus(f.properties))) die(`focus "${focus.name}" (level ${focus.level}) not found in ${prov}`);
wr(path.join(TMP, 'focusUnits.json'), { type: 'FeatureCollection', features: fine.features.filter((f) => isFocus(f.properties)) });
ms(path.join(TMP, 'focusUnits.json'), '-dissolve', '-o', path.join(TMP, 'focus.json'));
if (CFG.groups) ms(path.join(TMP, 'focusUnits.json'), '-filter', "GRP !== ''", '-dissolve', 'GRP', '-o', path.join(TMP, 'grp.json'));
// ---- 2. the country (level 1 provinces, coarser), its outline, neighbours (Natural Earth)
ms(gadm(1), '-simplify', '3%', 'keep-shapes', '-o', path.join(TMP, 'prov1.json'));
ms(gadm(0), '-simplify', '3%', 'keep-shapes', '-o', path.join(TMP, 'country.json'));
const ne = fetchCached('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson', 'ne50.geojson');
ms(ne, '-filter', `ISO_A3 !== '${ISO}' && ADM0_A3 !== '${ISO}'`, '-simplify', '20%', 'keep-shapes', '-o', path.join(TMP, 'nb.json'));
ms(ne, '-dissolve', '-simplify', '6%', 'keep-shapes', '-filter-islands', 'min-area=8000km2', '-o', path.join(TMP, 'world.json'));
// ---- 3. projection: equirectangular km around the focus centroid
const geoms = (j) => (j.features ? j.features.map((f) => f.geometry) : j.geometries || [j]).filter(Boolean);
const polysOf = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []);
let sx = 0, sy = 0, sn = 0; for (const g of geoms(rd(path.join(TMP, 'focus.json')))) for (const p of polysOf(g)) for (const [x, y] of p[0]) { sx += x; sy += y; sn++; }
const LON0 = +(CFG.origin ? CFG.origin[0] : sx / sn).toFixed(3), LAT0 = +(CFG.origin ? CFG.origin[1] : sy / sn).toFixed(3), K = 111.32, CL = Math.cos(LAT0 * Math.PI / 180);
const pj = ([lon, lat]) => [+((lon - LON0) * CL * K).toFixed(2), +(-(lat - LAT0) * K).toFixed(2)];
// wrap_lon (world pieces): rings whose mean longitude is west of it move +360° (e.g. -30 puts the Americas and Hawaii east of Asia)
const WRAP = CFG.wrap_lon;
const wrapRing = (r) => { if (WRAP == null) return r; const m = r.reduce((a, p) => a + p[0], 0) / r.length; return m < WRAP ? r.map(([x, y]) => [x + 360, y]) : r; };
const rings = (g, min = 4) => polysOf(g).map((p) => wrapRing(p[0]).map(pj)).filter((r) => r.length >= min);
const allRings = (f) => geoms(rd(f)).flatMap((g) => rings(g));
const cen = (R) => { let a = 0, x = 0, y = 0; for (const r of R) for (let i = 0; i < r.length; i++) { const p = r[i], q = r[(i + 1) % r.length], c = p[0] * q[1] - q[0] * p[1]; a += c; x += (p[0] + q[0]) * c; y += (p[1] + q[1]) * c; } return a ? [+(x / (3 * a)).toFixed(2), +(y / (3 * a)).toFixed(2)] : R[0][0]; };
const units = (f, key) => rd(f).features.map((x) => ({ n: pretty(x.properties[key]), r: rings(x.geometry) })).filter((u) => u.r.length).map((u) => ({ ...u, c: cen(u.r) }));
const GEO = { proj: { lon0: LON0, lat0: LAT0 } };
GEO.country = allRings(path.join(TMP, 'country.json'));
GEO.nb = allRings(path.join(TMP, 'nb.json'));
GEO.prov = units(path.join(TMP, 'prov1.json'), 'NAME_1').map((u) => (norm(u.n) === norm(prov) ? { ...u, r: allRings(path.join(TMP, 'provOutline.json')) } : u));
GEO.dist = units(path.join(TMP, 'dist.json'), 'D');
GEO.comm = rd(path.join(TMP, 'fine.json')).features.filter((f) => isFocus(f.properties)).map((x) => ({ n: x.properties.U, g: x.properties.GRP, r: rings(x.geometry) })).map((u) => ({ ...u, c: cen(u.r) }));
GEO.focus = allRings(path.join(TMP, 'focus.json'));
GEO.grp = CFG.groups ? units(path.join(TMP, 'grp.json'), 'GRP') : [];
// countries: { "KEY": ["ISO3", ...] } → GEO.cty.KEY = rings of those Natural Earth countries dissolved into one
if (CFG.countries) {
  GEO.cty = {};
  for (const [key, isos] of Object.entries(CFG.countries)) {
    const list = isos.map((i) => `'${i}'`).join(',');
    const out = path.join(TMP, `cty_${key}.json`);
    ms(ne, '-filter', `[${list}].indexOf(ADM0_A3) >= 0 || [${list}].indexOf(ISO_A3) >= 0`, '-dissolve', '-simplify', '20%', 'keep-shapes', '-o', out);
    GEO.cty[key] = allRings(out); if (!GEO.cty[key].length) die(`countries.${key}: no Natural Earth country among ${isos.join(', ')}`);
  }
}
const bbox = (R) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const r of R) for (const [x, y] of r) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return { cx: +((x0 + x1) / 2).toFixed(1), cy: +((y0 + y1) / 2).toFixed(1), span: +(Math.max(x1 - x0, y1 - y0) * 1.3).toFixed(1) }; };
GEO.tex = [bbox(GEO.country), bbox(GEO.prov.find((u) => norm(u.n) === norm(prov)).r), bbox(GEO.focus)];
// tex (world pieces): explicit ground-texture boxes [{ lon, lat, span_km, lvl, px, fade: [s0, s1] }] — fade = camera scale (px/km) range
// over which the box fades in; lvl 0 = land from countries only (coarse noise), the right choice for continent-scale boxes
if (CFG.tex) GEO.tex = CFG.tex.map((t) => { const [cx, cy] = pj([t.lon, t.lat]); return { cx, cy, span: t.span_km, lvl: t.lvl ?? 0, px: t.px ?? 2048, fade: t.fade || null }; });
const WORLD = geoms(rd(path.join(TMP, 'world.json'))).flatMap((g) => polysOf(g).map((p) => p[0].map(([x, y]) => [+x.toFixed(1), +y.toFixed(1)])));
// ---- 4. OSM: motorways, trunk and primary roads, railways, rivers in a box around the focus (Overpass)
const ROADS = {};
if (!NO_OSM && CFG.osm !== false) {
  let lo0 = 1e9, la0 = 1e9, lo1 = -1e9, la1 = -1e9; for (const g of geoms(rd(path.join(TMP, 'focus.json')))) for (const p of polysOf(g)) for (const [x, y] of p[0]) { lo0 = Math.min(lo0, x); la0 = Math.min(la0, y); lo1 = Math.max(lo1, x); la1 = Math.max(la1, y); }
  const pad = CFG.osm_pad_deg ?? 0.12, bb = [la0 - pad, lo0 - pad, la1 + pad, lo1 + pad].map((v) => v.toFixed(3)).join(',');
  const q = `[out:json][timeout:120];(way["highway"~"motorway|trunk|primary"](${bb});way["railway"="rail"](${bb});way["waterway"="river"](${bb}););out geom tags;`;
  const f = path.join(TMP, 'osm.json');
  // the public servers are often at capacity (HTTP 502/429 with an HTML page): retry with backoff, then try mirrors
  const servers = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
  let ok = false;
  for (let i = 0; i < 6 && !ok; i++) {
    const url = servers[i % servers.length];
    const r = spawnSync('curl', ['-s', '--max-time', '180', '-A', 'geo-explainer/1.0 (educational map video)', '--data-urlencode', `data=${q}`, url, '-o', f]);
    ok = r.status === 0 && fs.existsSync(f) && fs.readFileSync(f, 'utf8').trimStart().startsWith('{');
    if (!ok) { const wait = 5 * 2 ** Math.floor(i / servers.length); console.log(`overpass busy (${url.split('/')[2]}), retry in ${wait}s`); spawnSync('sleep', [String(wait)]); }
  }
  if (ok) {
    try {
      for (const w of rd(f).elements || []) {
        const t = w.tags || {}, cls = t.railway === 'rail' ? 'rail' : t.waterway === 'river' ? 'river' : t.highway;
        const key = (t.ref ? t.ref.split(';')[0].replace(/\s+/g, '') : '') || (t.name && cls === 'river' ? t.name : cls);
        const line = (w.geometry || []).map((g) => pj([g.lon, g.lat])); if (line.length < 2) continue;
        (ROADS[key] ||= []).push(line); (ROADS['_' + cls] ||= []).push(line);
      }
    } catch { console.warn('geodata: Overpass returned no JSON (rate limit?) — ROADS left empty; re-run later or with --no-osm'); }
  } else console.warn('geodata: Overpass request failed — ROADS left empty');
}
// ---- write
fs.mkdirSync(path.join(ROOT, 'src'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'src', 'geodata.js'), `// geodata.js — generated by scripts/geodata.mjs from GADM 4.1 + Natural Earth (do not edit; edit geo.json and re-run)\n// equirectangular km, origin ${LON0}E ${LAT0}N, y grows south\nconst GEO = ${JSON.stringify(GEO)};\n`);
fs.writeFileSync(path.join(ROOT, 'src', 'geodata2.js'), `// geodata2.js — generated: world land (lon/lat, Natural Earth 50m) and OSM lines (km; keys = ref like "QL1A", or _motorway/_trunk/_primary/_rail/_river)\nconst WORLD = ${JSON.stringify(WORLD)};\nconst ROADS = ${JSON.stringify(ROADS)};\n`);
fs.rmSync(TMP, { recursive: true, force: true });
console.log(`geodata: origin ${LON0},${LAT0}; prov ${GEO.prov.length}, dist ${GEO.dist.length}, comm ${GEO.comm.length}, grp ${GEO.grp.length}; roads ${Object.keys(ROADS).filter((k) => !k.startsWith('_')).join(' ') || '-'}`);
console.log('focus units:', GEO.comm.map((c) => c.n).join(', '));
