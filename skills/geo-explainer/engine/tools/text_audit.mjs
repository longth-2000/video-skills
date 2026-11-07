#!/usr/bin/env node
// Text audit: every string drawn on screen, with the mechanical checks a reviewer cannot see by eye.
//   usage: node engine/tools/text_audit.mjs <piece dir> [--every 3]
//   writes <piece>/text_audit.txt and prints a summary. Exit code 1 when an ERROR is found.
// Checks: font family missing (fell back), glyphs missing in the font (a letter drawn in a fallback font),
// non-NFC text / combining marks (diacritics drawn detached), characters outside Vietnamese + common punctuation,
// mixed tone-mark styles (hoá / hóa in one video), number formats (decimal comma, thousands dot), stray spaces.
// What it cannot judge — spelling, grammar, wording, facts — is listed for a human/Claude read (review-export.md).
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const args = process.argv.slice(2), ROOT = path.resolve(args[0] || '.'), ei = args.indexOf('--every'), EVERY = ei >= 0 ? +args[ei + 1] : 3;
const browser = await chromium.launch(), page = await browser.newPage();
await page.goto(pathToFileURL(path.join(ROOT, 'index.html')).href + '?export=1');
await page.waitForFunction(() => typeof window.renderFrame === 'function', null, { timeout: 120000 });
await page.evaluate(() => document.fonts.ready);
const res = await page.evaluate((EVERY) => {
  const seen = new Map(), P = CanvasRenderingContext2D.prototype;
  for (const fn of ['fillText', 'strokeText']) { const orig = P[fn]; P[fn] = function (t, ...a) { const s = String(t); if (s.trim()) { const k = s + '\u0000' + this.font; if (!seen.has(k)) seen.set(k, { text: s, font: this.font, t: window.__T }); } return orig.call(this, t, ...a); }; }
  const n = TIMELINE.frames;
  for (let f = 0; f < n; f += EVERY) { window.__T = +(f / TIMELINE.fps).toFixed(2); renderFrame(f / TIMELINE.fps); }
  // font resolution: a family is present when the width does not depend on the generic fallback after it
  const c = document.createElement('canvas').getContext('2d');
  const GEN = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|-apple-system|ui-sans-serif|ui-serif|BlinkMacSystemFont)$/i;
  const stack = (font) => { const m = font.match(/\d+(?:\.\d+)?px\s+(.+)$/); return m ? m[1].split(',').map((x) => x.trim()) : []; };
  const width = (f, s) => { c.font = f; return c.measureText(s).width; };
  // a named family is installed when the width does not depend on the generic fallback written after it
  const present = (fm) => width(`40px ${fm}, monospace`, 'Hậu Lộc ĐỆ 0123') === width(`40px ${fm}, serif`, 'Hậu Lộc ĐỆ 0123');
  const famInfo = {}, glyphMiss = {};
  for (const { text, font } of seen.values()) {
    const st = stack(font), key = st.join(', '); if (!st.length) continue;
    if (!famInfo[key]) { let used = null, skipped = []; for (const f of st) { if (GEN.test(f.replace(/"/g, ''))) { used = f; break; } if (present(f)) { used = f; break; } skipped.push(f); } famInfo[key] = { used, skipped, generic: !!used && GEN.test(used.replace(/"/g, '')) }; }
    const u = famInfo[key].used; if (!u || famInfo[key].generic) continue;
    for (const ch of new Set([...text])) { if (/\s/.test(ch)) continue; if (width(`40px ${u}, monospace`, ch) !== width(`40px ${u}, serif`, ch)) (glyphMiss[u] ||= new Set()).add(ch); }
  }
  return { strings: [...seen.values()], famInfo, glyphMiss: Object.fromEntries(Object.entries(glyphMiss).map(([k, v]) => [k, [...v].join('')])) };
}, EVERY);
await browser.close();
// ---- checks in node
const VI = /^[\p{Script=Latin}0-9\s.,;:!?…'"“”‘’()\[\]{}%°²³+\-–—·•/&|×#@*=<>~^_$€₫→←↑↓]+$/u;
const issues = [], add = (lvl, s, msg) => issues.push(`${lvl}  ${msg}  ← "${s.text}" (t≈${s.t}s, ${s.font})`);
const uniq = new Map(); for (const s of res.strings) if (!uniq.has(s.text)) uniq.set(s.text, s);
for (const s of uniq.values()) {
  const t = s.text;
  if (t !== t.normalize('NFC')) add('ERROR', s, 'not NFC: diacritics stored as separate marks (renders detached)');
  if (/\p{M}/u.test(t.normalize('NFC'))) add('ERROR', s, 'combining mark left after NFC');
  if (!VI.test(t)) add('ERROR', s, 'character outside Vietnamese/Latin + punctuation: ' + [...t].filter((ch) => !VI.test(ch)).join(' '));
  if (/^\s|\s$/.test(t)) add('WARN', s, 'leading/trailing space');
  if (/\s{2,}/.test(t)) add('WARN', s, 'double space');
  if (/\d\.\d{1,2}(?!\d)/.test(t) && !/\d\.\d{3}/.test(t)) add('WARN', s, 'decimal point — Vietnamese uses a comma (143,67)');
  if (/\d,\d{3}(?!\d)/.test(t) && !/\d,\d{1,2}(?!\d)/.test(t)) add('WARN', s, 'thousands comma — Vietnamese uses a dot (176.418)');
  if (/\s[,.;:!?]/.test(t)) add('WARN', s, 'space before punctuation');
}
for (const [st, i] of Object.entries(res.famInfo)) {
  if (!i.used) issues.push(`ERROR  none of the fonts in "${st}" is installed — text falls back to the browser default`);
  else if (i.skipped.length && /^(serif|sans-serif|monospace|cursive|fantasy)$/i.test(i.used)) issues.push(`ERROR  ${i.skipped.join(', ')} not available — text falls back to the generic ${i.used} font`);
  else if (i.skipped.length) issues.push(`WARN   ${i.skipped.join(', ')} not available — text uses ${i.used} (check the look; on another machine it may differ)`);
}
for (const [f, chars] of Object.entries(res.glyphMiss)) issues.push(`ERROR  font ${f} has no glyph for: ${chars} — those letters render in a fallback font`);
// tone-mark style: old (hoá, thuý, khoẻ) vs new (hóa, thúy, khỏe) in the same video
const all = [...uniq.keys()].join(' ').toLowerCase(), oldS = all.match(/\b\p{L}*o[áàảãạ]\p{L}*|\b\p{L}*u[ýỳỷỹỵ]\p{L}*/gu) || [], newS = all.match(/\b\p{L}*[óòỏõọ]a\b|\b\p{L}*[úùủũụ]y\b/gu) || [];
if (oldS.length && newS.length) issues.push(`WARN   mixed tone-mark styles: ${[...new Set(oldS)].slice(0, 5).join(', ')} vs ${[...new Set(newS)].slice(0, 5).join(', ')} — pick one (place names keep their official spelling, e.g. Thanh Hóa)`);
const lines = [`TEXT AUDIT — ${ROOT}`, `${uniq.size} distinct strings (every ${EVERY} frames)`, '', 'ISSUES', ...(issues.length ? issues : ['  none found by the mechanical checks']), '',
  'READ EVERY STRING BELOW (spelling, diacritics, grammar, wording, capitals, numbers vs brief.md, names vs official spelling):',
  ...[...uniq.values()].sort((a, b) => a.t - b.t).map((s) => `  ${String(s.t).padStart(6)}s  ${s.text}`)];
fs.writeFileSync(path.join(ROOT, 'text_audit.txt'), lines.join('\n') + '\n');
const nErr = issues.filter((x) => x.startsWith('ERROR')).length, nWarn = issues.filter((x) => x.startsWith('WARN')).length;
console.log(`text audit: ${uniq.size} strings, ${nErr} error(s), ${nWarn} warning(s) → ${path.join(ROOT, 'text_audit.txt')}`);
process.exit(nErr ? 1 : 0);
