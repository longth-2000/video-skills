#!/usr/bin/env node
// Capture an article around one sentence for the document effect (24) or the phone effect (25).
//   usage: node scripts/doc_capture.mjs <url> <piece>/assets/col_<key>.jpg "<start of sentence>" ["<end of sentence>"]
// Writes the image (the article's text column around the sentence, 2x) and prints the DOCS entry to paste into
// src/scenes.js:  DOCS.<key> = { img, w, h, rects }  (rects = the sentence's line boxes in image pixels).
// Fixed/sticky bars (menus, cookie banners, ads) are hidden first. If the phrase is not found, it prints NOT FOUND:
// copy the phrase exactly as the page shows it (diacritics, punctuation), or pick a shorter unique start.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const [url, out, phrase, endPhrase] = process.argv.slice(2);
if (!url || !out || !phrase) { console.error('usage: node scripts/doc_capture.mjs <url> <out.jpg> "<start of sentence>" ["<end>"]'); process.exit(2); }
const SCALE = 2, VW = 760, VH = 1100;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: SCALE });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3000);
const r = await page.evaluate(([phrase, endPhrase]) => {
  for (const el of document.querySelectorAll('*')) { const s = getComputedStyle(el); if (s.position === 'fixed' || s.position === 'sticky') el.style.display = 'none'; }
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (x) => (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(x.parentElement?.tagName) || !x.parentElement?.offsetParent ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) }); let n;
  while ((n = w.nextNode())) {
    const t = n.textContent.normalize('NFC'), i = t.indexOf(phrase.normalize('NFC')); if (i < 0) continue;
    n.parentElement.scrollIntoView({ block: 'center' });
    // the text column: the nearest ancestor at least 400 px wide and 700 px tall (cropped to the viewport)
    let col = n.parentElement; while (col.parentElement && (col.getBoundingClientRect().width < 400 || col.getBoundingClientRect().height < 700)) col = col.parentElement;
    col.setAttribute('data-gx-col', '1');
    return { ok: true };
  }
  return { ok: false };
}, [phrase, endPhrase || '']);
if (!r.ok) { console.log('NOT FOUND'); await browser.close(); process.exit(1); }
await page.waitForTimeout(800);
const m = await page.evaluate(([phrase, endPhrase]) => {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (x) => (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(x.parentElement?.tagName) || !x.parentElement?.offsetParent ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) }); let n;
  while ((n = w.nextNode())) { const t = n.textContent.normalize('NFC'), i = t.indexOf(phrase.normalize('NFC')); if (i < 0) continue;
    let j = endPhrase ? t.indexOf(endPhrase.normalize('NFC'), i) : -1; j = j < 0 ? Math.min(t.length, i + 220) : j + endPhrase.length;
    const range = document.createRange(); range.setStart(n, i); range.setEnd(n, j);
    const c = document.querySelector('[data-gx-col]').getBoundingClientRect();
    return { text: t.slice(i, j), col: [c.x, Math.max(0, c.y), c.width, Math.min(innerHeight, c.bottom) - Math.max(0, c.y)], rects: [...range.getClientRects()].map((q) => [q.x, q.y, q.width, q.height]) }; }
}, [phrase, endPhrase || '']);
const [cx, cy, cw, ch] = m.col.map((v) => Math.round(v));
await page.screenshot({ path: out, type: out.endsWith('.png') ? 'png' : 'jpeg', quality: out.endsWith('.png') ? undefined : 88, clip: { x: cx, y: cy, width: cw, height: ch } });
const rects = m.rects.map(([x, y, w, h]) => [Math.round((x - cx) * SCALE), Math.round((y - cy) * SCALE), Math.round(w * SCALE), Math.round(h * SCALE)]);
const key = path.basename(out).replace(/^col_/, '').replace(/\.(jpe?g|png)$/, '');
console.log(`// "${m.text.slice(0, 90)}…" — ${url}`);
console.log(`DOCS.${key} = { img: '${path.basename(out)}', w: ${cw * SCALE}, h: ${ch * SCALE}, rects: ${JSON.stringify(rects)} };`);
await browser.close();
