// ---- 1 Địa lí: the opening zoom, the neighbours, the three landforms, the numbers
function secOpen() {
  // Vietnam outlined white, Thanh Hóa lit, then the district appears as an orange spark
  const zIn = seg(TT, T0('open') + 1.6, T0('open') + 4.6);
  gRegion(GEO.vn, { line: '#ffffff', lw: 2.5, la: 0.85 - zIn * 0.6 });
  gRegion(TH_PROV.r, { fill: G.orange, fa: 0.18 * popS(0.6), line: G.orangeL, lw: 3, glow: 10, la: popS(0.6) });
  for (const d of GEO.dist) gRegion(d.r, { line: 'rgba(255,255,255,0.35)', lw: 1.2, la: zIn });
  hlOutline({ fill: true, fa: 0.5, lw: 3 + zIn * 2, glow: 14 });
  const [hx, hy] = gSP(HLC); gPulse(hx, hy, 1.0, G.orange, 10);
  gFlag(...gS(-45, -25), 'THANH HÓA', { bg: '#ffffff', size: 34, pop: popS(0.9) * (1 - zIn), side: 120 });
  gTitle([{ text: 'VÙNG ĐẤT BÊN BIỂN XỨ THANH', italic: true, color: G.orange, size: 52 }, { text: 'HẬU LỘC', size: 150, gap: 1 }], 70, 1200, 0.25, { cps: 34 });
}
function secTerr() {
  const t = SEC.terr;
  const zones = [
    { list: GHILLS, c: '#b0703f', name: 'ĐỒI THẤP', at: VW('terr', 0.38), lab: [-7.6, -9.6] },
    { list: GEO.comm.map((c) => c.n).filter((n) => !GHILLS.includes(n) && !COAST.includes(n)), c: G.lime, name: 'ĐỒNG BẰNG', at: VW('terr', 0.62), lab: [-1.5, -4.2] },
    { list: COAST, c: G.teal, name: 'VEN BIỂN', at: VW('terr', 0.84), lab: [5.4, -4.4] },
  ];
  for (const z of zones) { const k = popS(z.at); if (k <= 0) continue; for (const n of z.list) { const c = COMM(n); if (c) gRegion(c.r, { fill: z.c, fa: 0.42 * k, line: 'rgba(255,255,255,0.35)', lw: 1.2 }); } }
  hlOutline({ fa: 0.1 });
  const zk = 1 - seg(TT, T0('mang') - 0.6, T0('mang') - 0.1);   // the zone labels leave as the camera dives to Đa Lộc
  for (const z of zones) gFlag(...gSP(z.lab), z.name, { bg: z.c, fg: '#fff', size: 36, pop: popS(z.at + 0.1) * zk, up: 40 });
  // Lạch Trường and the mangroves of Đa Lộc
  const [lx, ly] = gSP(LACH); gPin(lx, ly, { pop: popS(VW('terr', 0.92)) * zk, r: 18 });
  gFlag(lx, ly - 40, 'CỬA LẠCH TRƯỜNG', { bg: '#ffffff', size: 28, pop: popS(VW('terr', 0.95)) * zk, up: 20, side: -110 });
  // the mangroves of Đa Lộc: the commune filled with the dyke photo (5), then the numbers in label boxes (16)
  const mk = ev(T0('mang') + 0.2, 1.0);
  if (mk > 0) {
    gRegion(DALOC.r, { fill: '#3fae5a', fa: 0.3 * mk, line: '#7fdc6a', lw: 5, glow: 16, la: mk });
    const [mx, my] = gSP(DALOC.c); gCallPhoto('de_bien.jpg', mx, my, { pop: popS(T0('mang') + 0.4), t0: T0('mang') + 0.4, w: 540, h: 340, up: 40, side: -150, label: 'RỪNG NGẬP MẶN', sub: 'ĐA LỘC', size: 40, credit: 'Ảnh: Gió Đông · Wikimedia Commons', fy: 0.6 });
  }
}
