# Brief: Hậu Lộc — vùng đất bên biển xứ Thanh

## The idea in one sentence
The district's glowing orange outline stays on the map through geography, history and culture, and at the end splits into the five new communes of 2025.

## Format and spec
- Format: F5 fixed-stage journey: the map is the stage, the camera travels between stations; voice-over is the clock.
- Size: 1080x1920, 24fps, ~125.5s (voice: ElevenLabs "Xuan Hoa - Storyteller", eleven_v4).
- Style: `geosat` (new, from the user's references in ~/Downloads/geo_video): procedural dark satellite ground, glowing boundaries, flag callouts, typed two-colour titles, charts over a dark scrim. Orange = Hậu Lộc only.
- Map data: GADM 4.1 (district/commune boundaries, 27 old units dissolved into 5 new communes per NQ 1686), Natural Earth 50m (neighbouring countries). Built into `src/geodata.js` by `~/references/geo_data/convert.mjs`.

## Beats
See TIMELINE.board in src/head.html (14 panels), approved at the storyboard check.

## Sound plan
D-minor pad bed under the voice; pulse from history on, drums at Cầu Ngư; hard silence after the mắm tôm line; the loudest hit (stab + sub) on the split into five communes, in the pause before the line that names it; fading chord at the end.

## Claims and sources (web-checked)
- 25 km NE of Thanh Hóa city; borders Nga Sơn, Hà Trung (N), Hoằng Hóa (W, S), sea (E); area 143,67 km²; pop. 199.978 (2022), 163.971 (2009); names Dư Phát (Cửu Chân) → Thuần Hựu 1428 → Thuần Lộc 1673 → Phong Lộc 1802 → Hậu Lộc 1821 (Minh Mạng); Lạch Trường estuary — vi.wikipedia.org/wiki/Hậu_Lộc_(huyện)
- Hills in Triệu/Tiến/Thành/Đại/Đồng Lộc; plains; coast communes — same.
- Mangroves at Đa Lộc protect the sea dyke — vjol.info.vn/DHTL/article/view/52260; nongnghiepmoitruong.vn
- Đền Bà Triệu on núi Gai, Triệu Lộc; national special relic; Bà Triệu died 248 — sggp.org.vn, nhandan.vn (year of ranking 2014/2015 disputed: not shown)
- Hòn Nẹ 19°54′46″N 106°00′32″E, ~6 km off Vạn Lộc; 1964 ambush of USS Maddox — vi.wikipedia.org/wiki/Hòn_Nẹ; vietnamteambuilding.net
- Ban Công an xã Triệu Lộc: Anh hùng LLVT nhân dân — conganthanhhoa.gov.vn
- 51 ranked relics: 1 national special, 3 national, 47 provincial; 14 festivals — svhttdl.thanhhoa.gov.vn (27/03/2025)
- Lễ hội Cầu Ngư Ngư Lộc: national intangible heritage 2017 (QĐ 3421/QĐ-BVHTTDL), late 2nd lunar month, Long Châu boat — baoquocte.vn
- Ngư Lộc > 36.000 people/km² of residential land; Monaco ~19.500 — nongnghiepmoitruong.vn (press figure, labelled so on screen)
- Mắm tôm Hậu Lộc: geographical indication 2010 (QĐ 1150, 25/6/2010), made from moi (Acetes) — moit.gov.vn
- From 1/7/2025 no district level; 22 units → 5 communes (Triệu Lộc, Đông Thành, Hậu Lộc, Hoa Lộc, Vạn Lộc) — NQ 1686/NQ-UBTVQH15, xaydungchinhsach.chinhphu.vn
- Five-commune populations: our own sums of the 2022 per-unit figures on vi.wikipedia (labelled "ước tính").
- Illustrative only: the 51 relic dots' positions; the ship's track in 1964.

## Images (v2: photos added at the user's request; files in assets/, originals in ~/references/hau_loc_photos)
- fs_ba_trieu.jpg (full screen): "Đền Bà Triệu, Triệu Lộc, Hậu Lộc, Thanh Hóa.jpeg", Linhcandng, 2016, CC BY-SA 3.0 / GFDL (credited on screen)
- den_ba_trieu.jpg: "Den-tho-ba-trieu.jpg", Mai Trung Dung, 2010, public domain (Wikimedia Commons)
- de_bien.jpg: "De ven bien Hau Loc.JPG" (dyke, mangroves beyond), Gió Đông, 2010, public domain
- hon_ne.jpg: "Đao Hon Ne.JPG" (Hòn Nẹ from the Hậu Lộc shore), Gió Đông, public domain
- maddox.jpg: "USS Maddox (DD-731) underway at sea, circa the early 1960s", U.S. Navy NH 97900, public domain
- ngu_loc.jpg: "Ngu Loc Hau Loc02.JPG" (a village road in Ngư Lộc), Gió Đông, 2011, public domain
- cau_ngu_ai.jpg, mam_tom_ai.jpg: AI illustrations (ElevenLabs, Seedream 5 Pro), labelled on screen "ẢNH MINH HOẠ AI" + "không phải ảnh thật". No free real photo of Cầu Ngư at Ngư Lộc or of Hậu Lộc mắm tôm was found on Commons (the Commons "Lễ cầu ngư" photo is from Khánh Hòa).

## v4: the 5-minute cut (2026-11-02)
Script: 39 lines (22 kept, num2 replaced, 17 new), ElevenLabs Xuân Hoà eleven_v4, ~1.570 credits. Duration 299.5 s.
New claims and sources:
- QL1 (~11,5 km), QL10 (~13 km), Bắc–Nam railway (~6 km) and sông Lèn (~21 km) inside the district; CT.01 expressway just outside the west edge — measured: OpenStreetMap (Overpass, 2026-11-02) against the GADM 4.1 boundary.
- Mangroves at Đa Lộc: since 1989, 500 ha, > 4 km of coast, > 9.000 people — nongnghiepmoitruong.vn "Lá chắn xanh bảo vệ hơn 9.000 dân" (20/11/2022).
- Population (census): 165.742 (2009), 176.418 (2019) — citypopulation.de (GSO census). Replaces the old 163.971/199.978 pair (vi.wikipedia; the 2022 figure did not fit the census trend). Density of the district now 176.418 / 143,67 = 1.228 /km² (2019).
- Hoa Lộc culture site in Hậu Lộc — vi.wikipedia Hậu Lộc (huyện); bát bồng ~4.000–3.800 years, national treasure QĐ 236/QĐ-TTg 3/2/2026 — baovanhoa.vn (26/02/2026). The bowl on screen is a drawing, labelled "hình vẽ minh hoạ".
- Bà Triệu quote "cưỡi cơn gió mạnh, đạp luồng sóng dữ, chém cá kình ở biển Đông" — as handed down (Lịch sử Việt Nam t.1, Phan Huy Lê, per several press sources); labelled "theo tương truyền".
- Đền Bà Triệu built 6th c., 297 di vật cổ vật; special national relic 2014; festival national intangible heritage 2023 — sggp.org.vn (8/3/2023).
- Hòn Nẹ ~6 km offshore — vi.wikipedia Hòn Nẹ.
- 14 festivals — svhttdl.thanhhoa.gov.vn (27/3/2025).
- Cầu Ngư recognised — baoquocte.vn (21/09/2017) screenshot; mắm tôm GI QĐ 1150 25/6/2010 — moit.gov.vn screenshot.
- NQ 1686/NQ-UBTVQH15 (16/6/2025), khoản 8–12 Điều 1: Triệu Lộc 3, Đông Thành 4, Hậu Lộc 4, Hoa Lộc 6, Vạn Lộc 5 old units; Thanh Hóa 166 units (147 xã, 19 phường) — reproduced on thuonghieucongluan.com.vn (screenshot). The old 5-commune population bars (wiki sums) are removed.
Document screenshots: ~/references/hau_loc_docs (captured with Playwright, the key sentence located in the DOM).
Extra photos: g_harbour (Nguloc02.JPG, Gió Đông, PD), g_dryfish (Ngu Loc Hau Loc01.JPG, Gió Đông, PD), g_beach (Diêm Phố.JPG, Trananh1980, PD), g_street (Ngư Lộc.JPG, Trananh1980, PD), fs_ba_trieu2 (Đền Bà Triệu 2…, Linhcandng, CC BY-SA 3.0).
