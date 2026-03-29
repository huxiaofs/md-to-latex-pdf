#!/usr/bin/env node
/**
 * convert.mjs — Convert a Markdown file to PDF using the typora-latex-theme.
 *
 * Math rendering: MathJax v3 server-side SVG (no external fonts, identical to LaTeX output)
 *
 * Usage:
 *   node convert.mjs <input.md> [options]
 *
 * Options:
 *   --output <path>    Output PDF path (default: same dir as input, .pdf extension)
 *   --dark             Use dark theme instead of light
 *   --no-numbers       Disable automatic heading numbering
 *   --page-break-h2    Force page break before each H2
 */

// ── ESM imports ───────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { marked }   from 'marked';
import puppeteer    from 'puppeteer';

// MathJax is a CJS package — use createRequire to load it reliably
const require        = createRequire(import.meta.url);
const { mathjax }    = require('mathjax-full/js/mathjax.js');
const { TeX }        = require('mathjax-full/js/input/tex.js');
const { SVG }        = require('mathjax-full/js/output/svg.js');
const { liteAdaptor }      = require('mathjax-full/js/adaptors/liteAdaptor.js');
const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html.js');
const { AllPackages }      = require('mathjax-full/js/input/tex/AllPackages.js');

// ── Paths ─────────────────────────────────────────────────────────────────────
const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR   = resolve(SCRIPTS_DIR, '..');
const CACHE_DIR   = resolve(SKILL_DIR, 'cache');
const CSS_LIGHT   = resolve(CACHE_DIR, 'latex-light.css');
const CSS_DARK    = resolve(CACHE_DIR, 'latex-dark.css');

// ── Verify setup ──────────────────────────────────────────────────────────────
if (!existsSync(CSS_LIGHT)) {
  console.error('Error: Theme CSS not found. Run setup first:\n  node setup.mjs');
  process.exit(1);
}

// ── Parse CLI args ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

const darkMode    = args.includes('--dark');
const noNumbers   = args.includes('--no-numbers');
const pageBreakH2 = args.includes('--page-break-h2');

const flagsWithValues = new Set(['--output']);
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    if (flagsWithValues.has(args[i])) i++;
    continue;
  }
  positional.push(args[i]);
}

const inputArg  = positional[0];
const outIdx    = args.indexOf('--output');
const outputArg = outIdx !== -1 ? args[outIdx + 1] : null;

if (!inputArg) {
  console.error('Usage: node convert.mjs <input.md> [--output <out.pdf>] [--dark] [--no-numbers] [--page-break-h2]');
  process.exit(1);
}

const inputPath  = resolve(inputArg);
const outputPath = outputArg
  ? resolve(outputArg)
  : inputPath.replace(/\.md$/i, '') + '.pdf';

if (!existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`);
  process.exit(1);
}

// ── Initialise MathJax (server-side SVG) ──────────────────────────────────────
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const mjDoc = mathjax.document('', {
  InputJax: new TeX({ packages: AllPackages }),
  OutputJax: new SVG({ fontCache: 'none' }), // embed fonts in each SVG — no external files
});

function texToSvg(tex, display) {
  try {
    const node = mjDoc.convert(tex, { display });
    return adaptor.outerHTML(node);
  } catch {
    const esc = tex.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return display
      ? `<div class="math-error">$$${esc}$$</div>`
      : `<span class="math-error">$${esc}$</span>`;
  }
}

// ── MathJax marked extension ──────────────────────────────────────────────────
// Protect and render $...$ and $$...$$ before marked processes them.
marked.use({
  extensions: [
    // Block math  $$\n...\n$$
    {
      name: 'blockMath',
      level: 'block',
      start(src) { return src.indexOf('$$'); },
      tokenizer(src) {
        const m = src.match(/^\$\$([\s\S]+?)\$\$\s*/);
        if (m) return { type: 'blockMath', raw: m[0], text: m[1].trim() };
      },
      renderer(token) {
        return `<div class="mjx-block">${texToSvg(token.text, true)}</div>\n`;
      },
    },
    // Inline math  $...$
    {
      name: 'inlineMath',
      level: 'inline',
      start(src) { return src.indexOf('$'); },
      tokenizer(src) {
        const m = src.match(/^\$([^$\n]+?)\$/);
        if (m) return { type: 'inlineMath', raw: m[0], text: m[1].trim() };
      },
      renderer(token) {
        return texToSvg(token.text, false);
      },
    },
  ],
});
marked.setOptions({ gfm: true, breaks: false });

// ── Read and pre-process Markdown ─────────────────────────────────────────────
let raw = readFileSync(inputPath, 'utf-8');

let frontMatter = {};
const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?/);
if (fmMatch) {
  raw = raw.slice(fmMatch[0].length);
  for (const line of fmMatch[1].split('\n')) {
    const m = line.match(/^(\w+)\s*:\s*(.+)/);
    if (m) frontMatter[m[1].trim()] = m[2].trim();
  }
}

// ── Build HTML ────────────────────────────────────────────────────────────────
const bodyHtml = marked.parse(raw);
const themeCss = readFileSync(darkMode ? CSS_DARK : CSS_LIGHT, 'utf-8');

let extraCss = '';
if (noNumbers) {
  extraCss += `
    #write h2:before, #write h3:before,
    #write h4:before, #write h5:before, #write h6:before {
      content: none !important;
    }`;
}
if (pageBreakH2) {
  extraCss += `
    @media print { h2 { break-before: page !important; }
    h2:first-of-type { break-before: avoid-page !important; } }`;
}

let titleBlock = '';
if (frontMatter.title) {
  const author = frontMatter.author ? `<p class="fm-author">${frontMatter.author}</p>` : '';
  const date   = frontMatter.date   ? `<p class="fm-date">${frontMatter.date}</p>`     : '';
  titleBlock = `<div class="fm-title-block">${author}${date}</div>`;
}

const pageTitle = frontMatter.title ?? basename(inputPath, '.md');

const html = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>${pageTitle}</title>
  <style>
/* ── typora-latex-theme ── */
${themeCss}

/* ── MathJax SVG display ── */
.mjx-block { display: block; text-align: center; margin: 1em 0; overflow-x: auto; }
.mjx-block mjx-container { margin: 0 auto; }
mjx-container[jax="SVG"] { direction: ltr; }
mjx-container[jax="SVG"][display="true"] { display: block; text-align: center; }
.math-error { color: red; font-family: monospace; font-size: 0.85em; }

/* ── skill overrides ── */
body { background: ${darkMode ? '#1e1e1e' : 'white'}; }
.fm-title-block { text-align: center; margin-bottom: 2em;
  font-family: var(--base-latin-font), var(--base-chinese-font), serif; }
.fm-author, .fm-date { font-size: 1em; margin: 0.2em 0; }
@page { size: A4; margin: 1.8cm 2cm 1.2cm 2cm; }
${extraCss}
  </style>
</head>
<body>
  <div id="write">
    ${titleBlock}
    ${bodyHtml}
  </div>
</body>
</html>`;

// ── Render PDF via Puppeteer ──────────────────────────────────────────────────
console.log(`Converting: ${inputPath}`);
console.log(`     Theme: ${darkMode ? 'dark' : 'light'}`);
console.log(`    Output: ${outputPath}`);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
// Math SVGs are inline in the HTML — no external resources needed, setContent is safe
await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });

const pdfBuffer = await page.pdf({
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: 0, bottom: 0, left: 0, right: 0 },
});

await browser.close();
writeFileSync(outputPath, pdfBuffer);
console.log(`\n✓ PDF saved: ${outputPath}`);
