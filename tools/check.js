/* Sanity checker: verifies local links/assets resolve and tags balance.
   Run: node tools/check.js */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) files.push(p);
  }
})(ROOT);

let errors = 0;
const err = (f, m) => { errors++; console.log('  ✗ ' + path.relative(ROOT, f) + ' — ' + m); };

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');

  // 1. local references
  const refRe = /(?:src|href)="([^"]+)"/g;
  let m;
  while ((m = refRe.exec(html))) {
    const ref = m[1];
    if (/^(https?:|mailto:|tel:|#|data:|javascript:)/.test(ref)) continue;
    const clean = ref.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = path.resolve(path.dirname(file), clean);
    if (!fs.existsSync(target)) err(file, 'missing ' + ref);
  }

  // 2. tag balance
  for (const tag of ['html', 'head', 'body', 'main', 'header', 'footer', 'section', 'article', 'div', 'nav', 'figure', 'ul', 'ol', 'li', 'dl', 'a', 'button', 'span', 'p', 'h1', 'h2', 'h3', 'blockquote']) {
    const open = (html.match(new RegExp('<' + tag + '(?=[\\s>])', 'g')) || []).length;
    const close = (html.match(new RegExp('</' + tag + '>', 'g')) || []).length;
    if (open !== close) err(file, `<${tag}> ${open} open / ${close} close`);
  }

  // 3. structure expectations
  if (!/<title>[^<]+<\/title>/.test(html)) err(file, 'missing title');
  if (!/name="description"/.test(html)) err(file, 'missing meta description');
  if (!/id="siteHeader"/.test(html)) err(file, 'missing header');
  if (!/id="main"/.test(html)) err(file, 'missing main landmark');
}

// 4. asset inventory
const imgs = [];
(function walkImgs(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkImgs(p);
    else imgs.push(p);
  }
})(path.join(ROOT, 'assets'));

const kb = (f) => (fs.statSync(f).size / 1024).toFixed(1);
console.log(`\nchecked ${files.length} HTML pages, ${imgs.length} assets`);
const heavy = imgs.filter((f) => fs.statSync(f).size > 200 * 1024);
if (heavy.length) heavy.forEach((f) => console.log('  ! heavy asset ' + path.relative(ROOT, f) + ' (' + kb(f) + ' KB)'));

console.log(errors ? `\n${errors} problem(s) found` : '\nall checks passed ✅');
process.exit(errors ? 1 : 0);
