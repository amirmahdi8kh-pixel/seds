/* Generates every SVG artwork used by the portfolio into assets/img/.
   Run: node tools/art.js
   Each project gets: portrait card, wide cover, two stills, before/after pair and a BTS frame. */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'img');
fs.mkdirSync(OUT, { recursive: true });

/* ---------------- helpers ---------------- */
function makeRng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const lerp = (a, b, t) => a + (b - a) * t;
const rr = (r, a, b) => a + r() * (b - a);
function hexToRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], t)).toString(16).padStart(2, '0')).join('');
}
const lighten = (c, t) => mix(c, '#ffffff', t);
const darken = (c, t) => mix(c, '#000000', t);
const rgba = (hex, a) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};

/* ---------------- document shell ---------------- */
function doc(w, h, defs, body, o = {}) {
  const vig = o.vig == null ? 0.5 : o.vig;
  const grain = o.grain == null ? 0.15 : o.grain;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">
<defs>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
<radialGradient id="vig" cx="50%" cy="50%" r="78%"><stop offset="50%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="${vig}"/></radialGradient>
${defs}
</defs>
${body}
<rect width="${w}" height="${h}" fill="url(#vig)"/>
<rect width="${w}" height="${h}" filter="url(#grain)" opacity="${grain}" style="mix-blend-mode:overlay"/>
</svg>`;
}

function hairGrid(w, h, n, color, op = 0.14) {
  let s = '';
  for (let i = 1; i < n; i++) {
    const x = (w / n) * i;
    s += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="${color}" stroke-width="1" opacity="${op}"/>`;
  }
  for (let i = 1; i < Math.round((n * h) / w); i++) {
    const y = (h / Math.round((n * h) / w)) * i;
    s += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${color}" stroke-width="1" opacity="${op}"/>`;
  }
  return s;
}

/* ---------------- art styles ---------------- */

/* Cinematic blurred colour field */
function artAurora(w, h, P, r, o = {}) {
  const blend = o.blend || 'screen';
  const soft = Math.round(Math.min(w, h) * 0.14);
  let defs = `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.a}"/><stop offset="1" stop-color="${P.b}"/></linearGradient>
<filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${soft}"/></filter>`;
  let body = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
  const cols = [P.accent, P.c || P.accent, P.d || lighten(P.accent, 0.35), P.e || P.b];
  for (let i = 0; i < 5; i++) {
    body += `<ellipse cx="${rr(r, -0.05, 1.05) * w}" cy="${rr(r, -0.05, 1.05) * h}" rx="${rr(r, 0.18, 0.42) * w}" ry="${rr(r, 0.18, 0.46) * h}" fill="${cols[i % cols.length]}" opacity="${rr(r, 0.3, 0.65).toFixed(2)}" filter="url(#soft)" style="mix-blend-mode:${blend}"/>`;
  }
  if (r() > 0.35) {
    body += `<circle cx="${rr(r, 0.2, 0.8) * w}" cy="${rr(r, 0.2, 0.8) * h}" r="${rr(r, 0.14, 0.3) * w}" fill="none" stroke="${P.accent}" stroke-width="${Math.max(2, w * 0.002)}" opacity="0.75"/>`;
  }
  if (o.bars) body += `<rect width="${w}" height="${h * 0.09}" fill="#08080A"/><rect y="${h * 0.91}" width="${w}" height="${h * 0.09}" fill="#08080A"/>`;
  return { defs, body, grain: 0.17, vig: 0.55 };
}

/* Typographic poster */
function artType(w, h, P, r, o = {}) {
  const word = (o.word || 'FORM');
  const lines = word.split(' ');
  const ink = P.ink || '#0E0E10';
  const bg = P.a;
  let defs = `<linearGradient id="bg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="${lighten(P.b, 0.35)}"/></linearGradient>`;
  let body = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
  body += hairGrid(w, h, 6, ink, 0.1);
  // accent block
  const bx = rr(r, 0.05, 0.45) * w, by = rr(r, 0.5, 0.78) * h;
  body += `<rect x="${bx}" y="${by}" width="${rr(r, 0.3, 0.55) * w}" height="${rr(r, 0.12, 0.22) * h}" fill="${P.accent}" style="mix-blend-mode:multiply" opacity="0.95"/>`;
  if (r() > 0.4) body += `<circle cx="${rr(r, 0.15, 0.85) * w}" cy="${rr(r, 0.15, 0.6) * h}" r="${rr(r, 0.1, 0.2) * w}" fill="${ink}" opacity="0.9"/>`;
  // big word
  const fs = Math.min(h / (lines.length + 0.6), w / (Math.max(...lines.map((l) => l.length)) * 0.66));
  const startY = h / 2 - ((lines.length - 1) * fs * 0.92) / 2 + fs * 0.33;
  lines.forEach((ln, i) => {
    body += `<text x="${w / 2}" y="${startY + i * fs * 0.92}" text-anchor="middle" font-family="'Arial Black', Arial, Helvetica, sans-serif" font-weight="900" font-size="${fs}" letter-spacing="${-fs * 0.045}" fill="${ink}">${ln.toUpperCase()}</text>`;
  });
  // meta
  body += `<text x="${w * 0.06}" y="${h * 0.94}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.max(13, w * 0.018)}" letter-spacing="4" fill="${ink}" opacity="0.8">${(o.meta || 'SERIES').toUpperCase()}</text>`;
  body += `<text x="${w * 0.94}" y="${h * 0.09}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${Math.max(13, w * 0.018)}" letter-spacing="4" fill="${ink}" opacity="0.55">${(o.no || '01')}</text>`;
  body += `<rect x="${w * 0.06}" y="${h * 0.11}" width="${w * 0.14}" height="${Math.max(3, h * 0.006)}" fill="${P.accent}"/>`;
  return { defs, body, grain: 0.12, vig: 0.28 };
}

/* Geometric / editorial composition */
function artGrid(w, h, P, r, o = {}) {
  const ink = P.ink || '#101013';
  const bg = r() > 0.5 ? P.a : P.b;
  let defs = `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="${mix(bg, ink, 0.12)}"/></linearGradient>`;
  let body = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
  body += hairGrid(w, h, 8, ink, 0.09);
  const n = 3 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const cx = rr(r, 0.15, 0.85) * w, cy = rr(r, 0.2, 0.8) * h, rad = rr(r, 0.1, 0.3) * w;
    const kind = r();
    const col = i % 2 ? P.accent : ink;
    if (kind < 0.34) {
      body += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${col}" style="mix-blend-mode:${bg === P.a ? 'multiply' : 'screen'}" opacity="0.92"/>`;
    } else if (kind < 0.67) {
      body += `<path d="M ${cx - rad} ${cy + rad} A ${rad} ${rad} 0 0 1 ${cx + rad} ${cy - rad} Z" fill="${col}" opacity="0.92"/>`;
    } else {
      body += `<rect x="${cx - rad}" y="${cy - rad * 0.4}" width="${rad * 2}" height="${rad * 0.8}" fill="${col}" opacity="0.92"/>`;
    }
  }
  if (r() > 0.5) {
    const cx = rr(r, 0.2, 0.8) * w;
    body += `<line x1="${cx}" y1="0" x2="${cx}" y2="${h}" stroke="${P.accent}" stroke-width="${Math.max(3, w * 0.004)}"/>`;
  }
  return { defs, body, grain: 0.13, vig: 0.35 };
}

/* Long-exposure light streaks (motion) */
function artStreak(w, h, P, r, o = {}) {
  let defs = `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.a}"/><stop offset="1" stop-color="${P.b}"/></linearGradient>
<linearGradient id="ln" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${P.accent}" stop-opacity="0"/><stop offset="0.5" stop-color="${P.accent}"/><stop offset="1" stop-color="${P.d || P.c || P.accent}" stop-opacity="0.1"/></linearGradient>
<filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${Math.round(w * 0.014)}"/></filter>`;
  let body = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
  const n = 7 + Math.floor(r() * 5);
  for (let i = 0; i < n; i++) {
    const y0 = rr(r, 0.05, 0.95) * h;
    const y1 = rr(r, 0.05, 0.95) * h;
    const c1x = rr(r, 0.2, 0.5) * w, c2x = rr(r, 0.5, 0.8) * w;
    const d = `M ${-w * 0.1} ${y0} C ${c1x} ${y0 + rr(r, -0.3, 0.3) * h}, ${c2x} ${y1 + rr(r, -0.3, 0.3) * h}, ${w * 1.1} ${y1}`;
    const sw = rr(r, 1.5, 14) * (w / 1400);
    const col = r() > 0.72 ? (P.d || lighten(P.accent, 0.5)) : 'url(#ln)';
    body += `<path d="${d}" fill="none" stroke="${col}" stroke-width="${(sw * 3).toFixed(1)}" opacity="0.4" filter="url(#glow)"/>`;
    body += `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw.toFixed(1)}" opacity="${rr(r, 0.6, 1).toFixed(2)}" stroke-linecap="round"/>`;
  }
  for (let i = 0; i < 24; i++) {
    const y = rr(r, 0, 1) * h, x = rr(r, -0.1, 0.9) * w, len = rr(r, 0.05, 0.3) * w;
    body += `<line x1="${x}" y1="${y}" x2="${x + len}" y2="${y}" stroke="${lighten(P.accent, 0.6)}" stroke-width="1" opacity="${rr(r, 0.1, 0.4).toFixed(2)}"/>`;
  }
  if (o.bars) body += `<rect width="${w}" height="${h * 0.09}" fill="#08080A"/><rect y="${h * 0.91}" width="${w}" height="${h * 0.09}" fill="#08080A"/>`;
  return { defs, body, grain: 0.18, vig: 0.6 };
}

/* Layered cinematic landscape (documentary) */
function artLand(w, h, P, r, o = {}) {
  const hor = h * rr(r, 0.5, 0.66);
  let defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.a}"/><stop offset="0.7" stop-color="${P.b}"/><stop offset="1" stop-color="${P.c || lighten(P.b, 0.25)}"/></linearGradient>
<radialGradient id="sun" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${lighten(P.accent, 0.5)}" stop-opacity="0.95"/><stop offset="1" stop-color="${P.accent}" stop-opacity="0"/></radialGradient>`;
  let body = `<rect width="${w}" height="${hor * 1.2}" fill="url(#sky)"/>`;
  const sx = rr(r, 0.2, 0.8) * w, sy = rr(r, 0.22, 0.42) * h;
  body += `<circle cx="${sx}" cy="${sy}" r="${w * 0.26}" fill="url(#sun)"/><circle cx="${sx}" cy="${sy}" r="${w * 0.045}" fill="${lighten(P.accent, 0.7)}" opacity="0.95"/>`;
  // ridges
  const layers = 4;
  for (let i = 0; i < layers; i++) {
    const base = hor + ((h - hor) * i) / layers;
    const amp = h * rr(r, 0.05, 0.14);
    let d = `M 0 ${h} L 0 ${base}`;
    const steps = 7;
    for (let s = 1; s <= steps; s++) {
      const x = (w / steps) * s;
      const y = base - amp * rr(r, 0, 1) - (s % 2 ? amp * 0.3 : 0);
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    d += ` L ${w} ${h} Z`;
    const col = mix(P.ink || '#0B0B0D', P.d || P.b, i / (layers + 0.6));
    body += `<path d="${d}" fill="${col}" opacity="${(0.72 + i * 0.09).toFixed(2)}"/>`;
    if (i < layers - 1) {
      body += `<rect x="0" y="${base - amp * 0.4}" width="${w}" height="${h * 0.05}" fill="${lighten(P.c || P.b, 0.35)}" opacity="0.16" style="filter:blur(14px)"/>`;
    }
  }
  body += `<rect width="${w}" height="${h}" fill="url(#sky)" opacity="0" />`;
  // ground haze
  body += `<rect y="${h * 0.7}" width="${w}" height="${h * 0.3}" fill="${mix(P.ink || '#0B0B0D', P.b, 0.55)}" opacity="0.35"/>`;
  if (o.bars) body += `<rect width="${w}" height="${h * 0.1}" fill="#08080A"/><rect y="${h * 0.9}" width="${w}" height="${h * 0.1}" fill="#08080A"/>`;
  return { defs, body, grain: 0.2, vig: 0.62 };
}

/* Latent-space fluid field (AI) */
function artFluid(w, h, P, r, o = {}) {
  let defs = `<radialGradient id="bg" cx="40%" cy="35%" r="85%"><stop offset="0" stop-color="${P.b}"/><stop offset="1" stop-color="${P.a}"/></radialGradient>
<filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${Math.round(Math.min(w, h) * 0.07)}"/></filter>
<pattern id="scan" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="3" fill="#ffffff" opacity="0.5"/></pattern>`;
  let body = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
  const cols = [P.accent, P.c || P.accent, P.d || P.e || lighten(P.accent, 0.4)];
  for (let i = 0; i < 7; i++) {
    body += `<ellipse cx="${rr(r, 0, 1) * w}" cy="${rr(r, 0, 1) * h}" rx="${rr(r, 0.12, 0.4) * w}" ry="${rr(r, 0.1, 0.38) * h}" fill="${cols[i % cols.length]}" opacity="${rr(r, 0.25, 0.6).toFixed(2)}" filter="url(#soft)" style="mix-blend-mode:${o.blend || 'screen'}" transform="rotate(${rr(r, -60, 60).toFixed(0)} ${w / 2} ${h / 2})"/>`;
  }
  const cx = rr(r, 0.3, 0.7) * w, cy = rr(r, 0.3, 0.7) * h, rad = rr(r, 0.14, 0.26) * w;
  body += `<circle cx="${cx - 8}" cy="${cy}" r="${rad}" fill="none" stroke="${P.accent}" stroke-width="${w * 0.004}" opacity="0.85" style="mix-blend-mode:screen"/>`;
  body += `<circle cx="${cx + 8}" cy="${cy}" r="${rad}" fill="none" stroke="${P.d || lighten(P.accent, 0.5)}" stroke-width="${w * 0.004}" opacity="0.85" style="mix-blend-mode:screen"/>`;
  body += `<rect width="${w}" height="${h}" fill="url(#scan)" opacity="0.05"/>`;
  if (o.bars) body += `<rect width="${w}" height="${h * 0.09}" fill="#08080A"/><rect y="${h * 0.91}" width="${w}" height="${h * 0.09}" fill="#08080A"/>`;
  return { defs, body, grain: 0.16, vig: 0.55 };
}

/* Editorial portrait silhouette */
function artPortrait(w, h, P, r, o = {}) {
  let defs = `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.a}"/><stop offset="1" stop-color="${P.b}"/></linearGradient>
<filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${w * 0.05}"/></filter>`;
  const ink = P.ink || '#111114';
  let body = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
  body += `<circle cx="${w * 0.5}" cy="${h * 0.42}" r="${w * 0.42}" fill="${P.accent}" opacity="0.5" filter="url(#soft)"/>`;
  const cx = w * 0.5, headR = w * 0.21, headY = h * 0.4;
  body += `<path d="M ${cx - headR * 2.6} ${h} Q ${cx} ${h * 0.55} ${cx + headR * 2.6} ${h} Z" fill="${ink}"/>`;
  body += `<ellipse cx="${cx}" cy="${headY}" rx="${headR}" ry="${headR * 1.18}" fill="${ink}"/>`;
  body += `<rect x="0" y="${h * 0.78}" width="${w}" height="2" fill="${P.accent}" opacity="0.8"/>`;
  if (o.bars) body += `<rect width="${w}" height="${h * 0.06}" fill="#08080A"/><rect y="${h * 0.94}" width="${w}" height="${h * 0.06}" fill="#08080A"/>`;
  return { defs, body, grain: 0.14, vig: 0.4 };
}

const STYLES = { aurora: artAurora, type: artType, grid: artGrid, streak: artStreak, land: artLand, fluid: artFluid, portrait: artPortrait };

/* ---------------- before / after ---------------- */
function toBefore(svg, w, h) {
  const grid = hairGrid(w, h, 10, '#000000', 0.25);
  const marks = [
    [w * 0.04, h * 0.06], [w * 0.96, h * 0.06], [w * 0.04, h * 0.94], [w * 0.96, h * 0.94],
  ]
    .map(
      ([x, y]) =>
        `<path d="M ${x - 16} ${y} H ${x + 16} M ${x} ${y - 16} V ${y + 16}" stroke="#111" stroke-width="2" opacity="0.75"/>`
    )
    .join('');
  const label = `<text x="${w * 0.04}" y="${h * 0.94}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.max(14, w * 0.014)}" letter-spacing="6" fill="#111" opacity="0.8">DRAFT — V0.3</text>`;
  // wrap the body: inject a desaturate group + draft overlay before the grain layer
  return svg
    .replace('<defs>', '<defs><filter id="desat"><feColorMatrix type="saturate" values="0.06"/></filter>')
    .replace(
      /(<rect width="[^"]+" height="[^"]+" fill="url\(#vig\)")/,
      `<g filter="url(#desat)">$1</g><g>${grid}${marks}${label}</g>$1`
    );
}

/* ---------------- project artwork set ---------------- */
const projects = [
  {
    slug: 'monolith',
    word: 'MONO LITH', meta: 'Poster series', no: '01', seed: 107,
    pal: { a: '#ECE6DA', b: '#D6CDBE', ink: '#101013', accent: '#E8452B', c: '#16161A' },
    blend: 'multiply',
    styles: { card: 'type', cover: 'grid', g1: 'type', g2: 'grid', bts: 'grid' },
  },
  {
    slug: 'signal',
    word: 'SIG NAL', meta: 'Social system', no: '02', seed: 211,
    pal: { a: '#0E0E12', b: '#1A1A22', ink: '#F2EFE9', accent: '#C7F94D', c: '#4F7CFF', d: '#E8452B' },
    blend: 'screen',
    styles: { card: 'grid', cover: 'aurora', g1: 'grid', g2: 'aurora', bts: 'type' },
  },
  {
    slug: 'ferro',
    word: 'FER RO', meta: 'Visual identity', no: '03', seed: 313,
    pal: { a: '#DAD2C4', b: '#C3B9A8', ink: '#0E0E11', accent: '#1B3BFF', c: '#101013' },
    blend: 'multiply',
    styles: { card: 'grid', cover: 'type', g1: 'aurora', g2: 'type', bts: 'grid' },
  },
  {
    slug: 'kinetic-identity',
    word: 'KINET IC', meta: 'Title sequence', no: '04', seed: 419,
    pal: { a: '#0A0A10', b: '#151021', ink: '#F4F1EA', accent: '#7B5CFF', c: '#FF5A2B', d: '#41E0FF' },
    blend: 'screen',
    styles: { card: 'streak', cover: 'streak', g1: 'aurora', g2: 'streak', bts: 'grid' },
  },
  {
    slug: 'nightshift',
    word: 'NIGHT SHIFT', meta: 'Music film', no: '05', seed: 521,
    pal: { a: '#07090C', b: '#101720', ink: '#F0EDE6', accent: '#FFB020', c: '#2E5B7A', d: '#7FD1FF' },
    blend: 'screen',
    styles: { card: 'aurora', cover: 'land', g1: 'streak', g2: 'land', bts: 'type' },
  },
  {
    slug: 'pulse-reels',
    word: 'PUL SE', meta: 'Vertical reels', no: '06', seed: 627,
    pal: { a: '#100A12', b: '#1D1024', ink: '#F6F1EA', accent: '#FF3D8A', c: '#41E0FF', d: '#FFD166' },
    blend: 'screen',
    styles: { card: 'streak', cover: 'fluid', g1: 'streak', g2: 'fluid', bts: 'grid' },
  },
  {
    slug: 'obsidian-sky',
    word: 'OBSID IAN', meta: 'AI short film', no: '07', seed: 731,
    pal: { a: '#070B16', b: '#131E3A', ink: '#EFEDE7', accent: '#FF5A2B', c: '#5C7CFF', d: '#8FB7FF' },
    blend: 'screen',
    styles: { card: 'land', cover: 'land', g1: 'aurora', g2: 'land', bts: 'fluid' },
  },
  {
    slug: 'chroma-drift',
    word: 'CHRO MA', meta: 'AI image series', no: '08', seed: 837,
    pal: { a: '#0B0B10', b: '#141422', ink: '#F2EFE9', accent: '#41E0FF', c: '#FF3D8A', d: '#FFD166' },
    blend: 'screen',
    styles: { card: 'fluid', cover: 'fluid', g1: 'aurora', g2: 'fluid', bts: 'type' },
  },
  {
    slug: 'latent-garden',
    word: 'LATENT GARDEN', meta: 'Latent experiment', no: '09', seed: 937,
    pal: { a: '#06110D', b: '#0E2119', ink: '#EFF2EA', accent: '#4ADE80', c: '#B7F0C8', d: '#D8FF6B' },
    blend: 'screen',
    styles: { card: 'fluid', cover: 'aurora', g1: 'fluid', g2: 'aurora', bts: 'grid' },
  },
  {
    slug: 'dust-and-light',
    word: 'DUST & LIGHT', meta: 'Short documentary', no: '10', seed: 1043,
    pal: { a: '#1A120B', b: '#3A2A19', ink: '#F4EDE1', accent: '#E9A94B', c: '#6E4E2C', d: '#F7E3C2' },
    blend: 'screen',
    styles: { card: 'land', cover: 'land', g1: 'type', g2: 'land', bts: 'grid' },
  },
  {
    slug: 'terra-nova',
    word: 'TERRA NOVA', meta: 'Creative campaign', no: '11', seed: 1149,
    pal: { a: '#0C1410', b: '#1B2B1E', ink: '#F1EFE6', accent: '#D9FF4D', c: '#5A7D5E', d: '#E8E1CE' },
    blend: 'screen',
    styles: { card: 'grid', cover: 'land', g1: 'type', g2: 'grid', bts: 'land' },
  },
  {
    slug: 'set-notes',
    word: 'SET NOTES', meta: 'Behind the scenes', no: '12', seed: 1257,
    pal: { a: '#121216', b: '#1D1D24', ink: '#F2EFE9', accent: '#E8452B', c: '#8A8A96', d: '#F5F2EA' },
    blend: 'screen',
    styles: { card: 'grid', cover: 'streak', g1: 'grid', g2: 'type', bts: 'streak' },
  },
];

function render(style, w, h, pal, seed, opts, styleOpts) {
  const r = makeRng(seed);
  const fn = STYLES[style];
  const { defs, body, grain, vig } = fn(w, h, pal, r, styleOpts || {});
  let out = doc(w, h, defs, body, { grain, vig });
  if (opts === 'before') out = toBefore(out, w, h);
  return out;
}

function save(name, content) {
  fs.writeFileSync(path.join(OUT, name), content);
}

let count = 0;
for (const p of projects) {
  const common = { ...p };
  const s = p.styles;
  save(`${p.slug}-card.svg`, render(s.card, 1200, 1500, p.pal, p.seed, null, { word: p.word, meta: p.meta, no: p.no, blend: p.blend }));
  save(`${p.slug}-cover.svg`, render(s.cover, 1600, 900, p.pal, p.seed + 1, null, { word: p.word, meta: p.meta, no: p.no, blend: p.blend, bars: true }));
  save(`${p.slug}-g1.svg`, render(s.g1, 1500, 1000, p.pal, p.seed + 2, null, { word: p.word, meta: p.meta, no: p.no, blend: p.blend }));
  save(`${p.slug}-g2.svg`, render(s.g2, 1100, 1400, p.pal, p.seed + 3, null, { word: p.word, meta: p.meta, no: p.no, blend: p.blend }));
  save(`${p.slug}-before.svg`, render(s.g1, 1500, 950, p.pal, p.seed + 4, 'before', { word: p.word, meta: p.meta, no: p.no, blend: p.blend }));
  save(`${p.slug}-after.svg`, render(s.g1, 1500, 950, p.pal, p.seed + 4, null, { word: p.word, meta: p.meta, no: p.no, blend: p.blend }));
  save(`${p.slug}-bts.svg`, render(s.bts, 1400, 1000, p.pal, p.seed + 5, null, { word: p.word, meta: 'BTS', no: p.no, blend: p.blend }));
  count += 7;
}

/* Hero + portrait + favicon */
save(
  'hero.svg',
  render('land', 1920, 1200, { a: '#05070F', b: '#0D1526', c: '#26365C', ink: '#05050A', accent: '#FF5A2B', d: '#1A2440' }, 99, null, {})
);
count++;
save(
  'profile.svg',
  render('portrait', 1000, 1250, { a: '#E4DCCF', b: '#CFC5B4', ink: '#141417', accent: '#E8452B' }, 77, null, {})
);
count++;
save(
  'profile-dark.svg',
  render('portrait', 1000, 1250, { a: '#16161B', b: '#0C0C10', ink: '#0A0A0C', accent: '#FF5A2B' }, 78, null, {})
);
count++;
save(
  'favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#101013"/><rect x="14" y="40" width="36" height="6" fill="#E8452B"/><text x="32" y="36" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="26" fill="#F2EFE9">N</text></svg>`
);
count++;

console.log(`generated ${count} SVG files in assets/img/`);
