# Map data

Read when preparing a new piece (step "map data") or when outlines look wrong.

## geo.json (in the piece folder)

```json
{
  "country": "VNM",                                   // GADM ISO3 code
  "province": "Thanh Hóa",                            // GADM NAME_1 (spaces/diacritics/case ignored when matching)
  "focus": { "level": 2, "name": "Hậu Lộc" },        // 1 = province, 2 = district, 3 = commune
  "groups": { "Vạn Lộc": ["Minh Lộc", "Hải Lộc", "Ngư Lộc"] },   // optional: new units dissolved from old ones
  "simplify_m": 140,                                  // one simplification for the fine layer (metres)
  "osm": true,                                        // roads, rail, rivers around the focus (Overpass)
  "origin": [105.9, 19.88]                            // optional projection origin (default: focus centroid)
}
```

Run `scripts/gx.sh geo <piece>`. Output `src/geodata.js` (`GEO`) and `src/geodata2.js` (`WORLD`, `ROADS`).

## What GEO holds

`proj {lon0, lat0}`; `country` (rings); `nb` (neighbour countries); `prov` `[{n, r, c}]` (all provinces; the chosen
province's outline is replaced by the dissolved fine layer); `dist` (units of the province); `comm` (units inside the
focus, with `g` = group); `focus` (rings); `grp` (dissolved groups); `tex` (three ground-texture boxes: country, province,
focus). Coordinates: km, equirectangular, y grows **south**. `c` = centroid.

`ROADS` keys: OSM refs without spaces (`QL.1`, `QL.10`, `CT.01`, `ĐT.508`), river names (`Sông Lèn`), and classes
`_motorway _trunk _primary _rail _river`. Each value = list of lines; join with `joinLines` before `route`.

## Gotchas

- **One simplified layer.** Every level inside the province (communes → districts → focus → province outline) is
  dissolved from the same simplified level-3 layer. Never simplify levels separately: outlines stop matching (the user
  noticed this immediately).
- GADM 4.1 is **before** Vietnam's 2025 reorganisation (34 provinces, no districts, merged communes). For new units,
  list their old parts in `groups` (source: the Nghị quyết of the Ủy ban Thường vụ Quốc hội for that province) and
  draw `GEO.grp`. Name the source in the brief.
- GADM names have no spaces (`ThanhHóa`, `HậuLộc`); the script restores spaces and matches loosely. If a name is not
  found, the error lists the names it has: copy one of those.
- Overpass is often at capacity (HTTP 502/429 HTML). The script retries with backoff and two mirrors; if ROADS is still
  empty, run again later or use `--no-osm`.
- The ground textures cover the three `tex` boxes only; a camera far outside them shows plain sea colour.
- For another country, set `country` (ISO3) and `province`; neighbours and world land come from Natural Earth.
