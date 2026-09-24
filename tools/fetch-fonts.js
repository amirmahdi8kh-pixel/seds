/* Downloads the site's webfonts from Google Fonts and rewrites them as local @font-face rules.
   Run: node tools/fetch-fonts.js  (requires internet; safe to re-run) */
const fs = require('fs');
const path = require('path');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const FONT_DIR = path.join(__dirname, '..', 'assets', 'fonts');
const CSS_OUT = path.join(__dirname, '..', 'assets', 'fonts.css');
const CSS_URL =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Inter:wght@300..900&display=swap';

fs.mkdirSync(FONT_DIR, { recursive: true });

function fail(msg) {
  fs.writeFileSync(CSS_OUT, '/* Fonts unavailable offline — system font stack is used instead. */\n');
  console.warn('! ' + msg);
}

(async () => {
  try {
    const css = await (await fetch(CSS_URL, { headers: { 'User-Agent': UA } })).text();
    const re = /\/\*\s*([a-z0-9-]+)\s*\*\/\s*@font-face\s*{([^}]+)}/g;
    const out = [];
    let m;
    while ((m = re.exec(css))) {
      const subset = m[1];
      const block = m[2];
      if (subset !== 'latin') continue;
      const url = (block.match(/url\((https:[^)]+)\)/) || [])[1];
      const family = (block.match(/font-family:\s*'([^']+)'/) || [])[1];
      if (!url || !family) continue;
      const weight = ((block.match(/font-weight:\s*([^;]+);/) || [])[1] || '400').trim().replace(/\s+/g, '-');
      const style = ((block.match(/font-style:\s*([^;]+);/) || [])[1] || 'normal').trim();
      const name = `${family.toLowerCase().replace(/[^a-z0-9]+/g, '')}-${weight}-${style}.woff2`;
      const buf = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer());
      fs.writeFileSync(path.join(FONT_DIR, name), buf);
      out.push(block.trim().replace(/url\((https:[^)]+)\)/, `url(fonts/${name})`));
      console.log('saved', name, (buf.length / 1024).toFixed(1) + 'KB');
    }
    if (!out.length) return fail('no font faces parsed');
    fs.writeFileSync(
      CSS_OUT,
      '/* Local webfonts (Inter, Instrument Serif, IBM Plex Mono) — self-hosted via tools/fetch-fonts.js */\n\n' +
        out.map((b) => `@font-face{${b}}`).join('\n\n') +
        '\n'
    );
    console.log('wrote assets/fonts.css');
  } catch (e) {
    fail('font download failed: ' + e.message);
  }
})();
