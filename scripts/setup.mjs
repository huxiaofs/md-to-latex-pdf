#!/usr/bin/env node
/**
 * setup.mjs — First-time setup for md-to-latex-pdf skill
 *
 * Steps:
 *  1. Clone typora-latex-theme (if not present)
 *  2. npm install in scripts/ (includes sass + puppeteer)
 *  3. Compile light + dark CSS from the SCSS sources
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR   = resolve(SCRIPTS_DIR, '..');
const THEME_DIR   = resolve(SKILL_DIR, 'theme');
const CACHE_DIR   = resolve(SKILL_DIR, 'cache');

const REPO_URL = 'https://github.com/Keldos-Li/typora-latex-theme.git';

// ── helpers ─────────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

function step(msg) {
  console.log(`\n▶ ${msg}`);
}

// ── step 1: clone theme ──────────────────────────────────────────────────────

step('Checking typora-latex-theme source…');
if (!existsSync(THEME_DIR)) {
  console.log('  Cloning (shallow)…');
  run(`git clone --depth=1 "${REPO_URL}" "${THEME_DIR}"`);
} else {
  console.log('  Already present, skipping clone.');
}

// ── step 2: install npm deps ─────────────────────────────────────────────────

step('Installing Node.js dependencies in scripts/ …');
console.log('  (puppeteer will download Chromium ~170 MB on first install — one-time only)');
if (!existsSync(resolve(SCRIPTS_DIR, 'node_modules'))) {
  run('npm install', { cwd: SCRIPTS_DIR });
} else {
  console.log('  node_modules already present, skipping.');
}

// ── step 3: compile CSS ──────────────────────────────────────────────────────

step('Compiling theme CSS…');
mkdirSync(CACHE_DIR, { recursive: true });

const sassCmd = resolve(SCRIPTS_DIR, 'node_modules', '.bin', 'sass');

const targets = [
  {
    entry: resolve(THEME_DIR, 'src', 'headers', 'macos', 'light.scss'),
    out:   resolve(CACHE_DIR, 'latex-light.css'),
    label: 'macOS light',
  },
  {
    entry: resolve(THEME_DIR, 'src', 'headers', 'macos', 'dark.scss'),
    out:   resolve(CACHE_DIR, 'latex-dark.css'),
    label: 'macOS dark',
  },
];

for (const { entry, out, label } of targets) {
  if (existsSync(out)) {
    console.log(`  ${label}: already compiled, skipping.`);
  } else {
    console.log(`  Compiling ${label}…`);
    run(`"${sassCmd}" --no-source-map --style expanded "${entry}" "${out}"`);
    console.log(`  → ${out}`);
  }
}

console.log('\n✓ Setup complete!  You can now run convert.mjs to generate PDFs.\n');
