/* =========================================================
   BUILD — renders every HTML page of the portfolio.
   Run: node tools/build.js
   Content lives in ../content/*.json; layout lives in the
   template functions below. Output is plain static HTML.
   ========================================================= */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'dist');
const cfg = require('../content/site.json');
const cats = require('../content/categories.json');
const projects = require('../content/projects.json');
const about = require('../content/about.json');
const ARROW = '<span class="arrow" aria-hidden="true">&rarr;</span>';





const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));
const catOf = (slug) => cats.find((c) => c.slug === slug);
const inCat = (slug) => projects.filter((p) => p.cat === slug);

/* ------------------------- layout ------------------------- */

function head({ title, desc, r = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#f3f1ec" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0c0c0e" media="(prefers-color-scheme: dark)">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<link rel="icon" href="${r}assets/img/favicon.svg" type="image/svg+xml">
<script>try{var t=localStorage.getItem('nv-theme');if(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)t='dark';if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}</script>
<link rel="stylesheet" href="${r}assets/fonts.css">
<link rel="stylesheet" href="${r}assets/css/core.css">
<link rel="stylesheet" href="${r}assets/css/pages.css">
</head>`;
}

function header(r, active) {
  const nav = [
    ['work', 'index.html#work', 'Work'],
    ['portfolio', 'index.html#portfolio', 'Portfolio'],
    ['about', 'about.html', 'About'],
    ['contact', 'index.html#contact', 'Contact'],
  ];
  const links = nav
    .map(
      ([key, href, label]) =>
        `<a href="${r}${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`
    )
    .join('');

  const menuLinks = [
    ['01', 'Home', 'index.html'],
    ['02', 'Selected Works', 'index.html#work'],
    ['03', 'Portfolio', 'index.html#portfolio'],
    ['04', 'About', 'about.html'],
    ['05', 'Contact', 'index.html#contact'],
  ]
    .map(([i, label, href]) => `<a href="${r}${href}"><span class="idx">${i}</span>${label}</a>`)
    .join('');

  const menuCats = cats
    .map((c) => `<a href="${r}portfolio/${c.slug}.html">${c.name}</a>`)
    .join('');

  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header" id="siteHeader">
  <div class="header-inner">
    <a class="brand" href="${r}index.html" aria-label="${cfg.name} — home">
      <span class="brand-mark" aria-hidden="true">${cfg.name.trim().charAt(0)}</span>
      <span class="brand-text"><strong>${cfg.name}</strong><span>${cfg.shortTitle}</span></span>
    </a>
    <nav class="nav" aria-label="Primary">${links}</nav>
    <div class="header-actions">
      <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle colour theme" aria-pressed="false">
        <svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M19.4 4.6l-2.1 2.1M6.7 17.3l-2.1 2.1"/></svg>
        <svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.2 8.2 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/></svg>
      </button>
      <button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="menuOverlay">
        <span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>Menu
      </button>
    </div>
  </div>
</header>
<div class="menu-overlay" id="menuOverlay" aria-hidden="true">
  <nav class="menu-nav" aria-label="Mobile">${menuLinks}</nav>
  <div class="menu-meta">
    <div class="menu-cats">${menuCats}</div>
    <a class="arrow-link" href="mailto:${cfg.email}">${cfg.email} ${ARROW}</a>
  </div>
</div>`;
}

function footer(r) {
  const menu = [
    ['Home', 'index.html'],
    ['Selected Works', 'index.html#work'],
    ['Portfolio', 'index.html#portfolio'],
    ['About', 'about.html'],
    ['Contact', 'index.html#contact'],
  ]
    .map(([l, h]) => `<li><a href="${r}${h}">${l}</a></li>`)
    .join('');
  const disc = cats
    .map((c) => `<li><a href="${r}portfolio/${c.slug}.html">${c.name}</a></li>`)
    .join('');
  const socials = cfg.socials
    .map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.label}</a></li>`)
    .join('');

  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-cta">
      <span class="eyebrow">Have a project in mind</span>
      <a class="footer-mail" href="mailto:${cfg.email}">${cfg.email} ${ARROW}</a>
      <p class="mono">${cfg.availability}</p>
    </div>
    <div class="footer-grid">
      <div class="footer-col">
        <h4>Menu</h4>
        <ul>${menu}</ul>
      </div>
      <div class="footer-col">
        <h4>Disciplines</h4>
        <ul>${disc}</ul>
      </div>
      <div class="footer-col">
        <h4>Connect</h4>
        <ul>${socials}</ul>
      </div>
      <div class="footer-col">
        <h4>Studio</h4>
        <ul>
          <li>${cfg.location}</li>
          <li data-clock>--:--</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="mono">&copy; <span data-year>2026</span> ${cfg.name} &mdash; ${cfg.title}</p>
      <p class="mono">Design &amp; code by the studio</p>
      <a class="mono to-top" href="#main">Back to top &uarr;</a>
    </div>
  </div>
</footer>`;
}

/* Right-hand column of any contact section, driven by site.config.js */
function contactSide() {
  const socials = cfg.socials
    .map((s) => `<a href="${s.url}" target="_blank" rel="noopener"><span>${s.label}</span><span aria-hidden="true">&nearr;</span></a>`)
    .join('\n          ');
  return `<div class="contact__side" data-reveal style="--d:.12s">
      <div>
        <h4>Social</h4>
        <div class="social-list">
          ${socials}
        </div>
      </div>
      <div>
        <h4>Based in</h4>
        <p>${cfg.location}<br>Local time <span data-clock>--:--</span></p>
      </div>
    </div>`;
}

function layout({ title, desc, r = '', active = '', main, progress = false }) {
  return `${head({ title, desc, r })}
<body>
${header(r, active)}
${progress ? '<div class="page-progress" aria-hidden="true"></div>' : ''}
<main id="main">
${main}
</main>
${footer(r)}
<script src="${r}assets/js/main.js" defer></script>
</body>
</html>`;
}

/* ------------------------- fragments ------------------------- */

function workCard(p, i, r) {
  const c = catOf(p.cat);
  return `<article class="work" data-reveal>
    <a class="work__media" href="${r}work/${p.slug}.html" aria-label="${p.title} — view project">
      <span class="work__index">${String(i + 1).padStart(2, '0')}</span>
      <div class="media media--zoom"><img src="${r}assets/img/${p.slug}-card.svg" alt="${p.title} — ${c.name} project" loading="lazy" width="1200" height="1500"></div>
      <span class="work__view">View project ${ARROW}</span>
    </a>
    <div class="work__info">
      <div class="work__meta"><span class="tag">${p.tags[0]}</span><span>${c.name}</span><span>${p.year}</span></div>
      <h3 class="work__title"><a href="${r}work/${p.slug}.html">${p.title}</a></h3>
      <p class="work__desc">${p.summary}</p>
      <a class="arrow-link" href="${r}work/${p.slug}.html">Case study ${ARROW}</a>
    </div>
  </article>`;
}

function galleryItem(p, span, r) {
  const c = catOf(p.cat);
  return `<article class="g-item" data-span="${span}" data-tags="${p.tags.join('|')}" data-reveal>
    <a href="${r}work/${p.slug}.html" aria-label="${p.title} — view project">
      <div class="g-item__media">
        <img src="${r}assets/img/${p.slug}-card.svg" alt="${p.title} — ${c.name}" loading="lazy" width="1200" height="1500">
        <span class="g-item__badge">${p.tags.join(' · ')}</span>
        <span class="g-item__view" aria-hidden="true">${ARROW}</span>
      </div>
    </a>
    <div class="g-item__info">
      <div class="work__meta"><span class="tag">${p.year}</span><span>${p.client}</span></div>
      <h3 class="g-item__title"><a href="${r}work/${p.slug}.html">${p.title}</a></h3>
      <p class="g-item__desc">${p.summary}</p>
    </div>
  </article>`;
}

function marquee(words) {
  const group = `<div>${words
    .map((w) => `<span>${w}</span><span class="sep" aria-hidden="true">&#10022;</span>`)
    .join('')}</div>`;
  return `<div class="marquee" aria-hidden="true"><div class="marquee__track">${group}${group}</div></div>`;
}

/* ------------------------- pages ------------------------- */

function homePage() {
  const r = '';
  const featured = projects.filter((p) => p.featured).slice(0, 6);
  const heroProject = bySlug['obsidian-sky'];

  const catRows = cats
    .map((c, i) => {
      const n = inCat(c.slug).length;
      const lead = inCat(c.slug)[0];
      return `<a class="cat-row" href="portfolio/${c.slug}.html" data-img="assets/img/${lead.slug}-card.svg" data-reveal style="--d:${i * 0.06}s">
        <span class="cat-row__no">${c.no}</span>
        <span class="cat-row__body">
          <span class="cat-row__name display-m">${c.name}</span>
          <span class="cat-row__subs">${c.subs.join(' <span aria-hidden="true">/</span> ')}</span>
        </span>
        <span class="cat-row__right"><span>${String(n).padStart(2, '0')} projects</span><span class="cat-row__arrow" aria-hidden="true">&rarr;</span></span>
      </a>`;
    })
    .join('');

  const main = `<section class="hero" id="top">
  <div class="hero__bg"><img src="assets/img/hero.svg" alt="" fetchpriority="high"></div>
  <div class="hero__inner">
    <div class="hero__top">
      <span class="eyebrow">${cfg.heroEyebrow}</span>
      <span class="eyebrow">Portfolio &mdash; 2026</span>
    </div>
    <h1 class="display-xl">
${cfg.heroLines
  .map((line, i) => `      <span class="line-mask"><span style="--d:${(0.18 + i * 0.12).toFixed(2)}s">${line}</span></span>`)
  .join('\n')}
    </h1>
    <div class="hero__statement">
      <div class="stack">
        <p>${cfg.heroStatement}</p>
        <div class="flex flex-wrap">
          <a class="btn btn--light" href="#work">Selected works ${ARROW}</a>
          <a class="btn btn--light" href="#contact">Start a project</a>
        </div>
      </div>
      <a class="hero__featured" href="work/${heroProject.slug}.html" aria-label="Featured project: ${heroProject.title}">
        <span class="mono" style="color:rgba(245,242,236,.7)">Featured &mdash; ${heroProject.year}</span>
        <span class="thumb"><img src="assets/img/${heroProject.slug}-g1.svg" alt="" loading="lazy"></span>
        <span class="cap"><strong>${heroProject.title}</strong><span>${heroProject.tags[0]} ${ARROW}</span></span>
      </a>
    </div>
    <div class="hero__foot">
      <span class="scroll-hint"><span class="bar" aria-hidden="true"></span>Scroll to explore</span>
      <span class="avail">Available for freelance &mdash; <span data-clock>--:--</span> local</span>
    </div>
  </div>
</section>

${marquee(['Graphic Design', 'Poster Design', 'Typography', 'Social Media', 'Motion Graphics', 'Video Editing', 'AI Films', 'Documentaries', 'Creative Campaigns'])}

<section class="section" id="work">
  <div class="container">
    <div class="section-head">
      <div class="section-head__text">
        <span class="eyebrow">01 &mdash; Selected Works</span>
        <h2 class="display-l">The work I <span class="serif">stand</span> behind</h2>
        <p class="lede">A tight edit of recent projects across design, motion, film and the AI visual lab.</p>
      </div>
      <a class="arrow-link" href="#portfolio">Explore the portfolio ${ARROW}</a>
    </div>
    <div class="works">
      ${featured.map((p, i) => workCard(p, i, r)).join('\n')}
    </div>
    <div class="works__more"><a class="btn" href="portfolio/graphic-design.html">View all projects ${ARROW}</a></div>
  </div>
</section>

<section class="section cats" id="portfolio">
  <div class="container">
    <div class="section-head">
      <div class="section-head__text">
        <span class="eyebrow">02 &mdash; Portfolio</span>
        <h2 class="display-l">Four disciplines, <span class="serif">one</span> visual language</h2>
      </div>
      <p class="lede">Every project below lives inside a category &mdash; open one to browse the full gallery.</p>
    </div>
    <div class="cat-list" data-cat-list>
      ${catRows}
    </div>
    <div class="cat-preview" data-cat-preview aria-hidden="true"><img src="assets/img/${projects[0].slug}-card.svg" alt=""></div>
  </div>
</section>

<section class="section section--tight">
  <div class="container about-preview">
    <div class="about-preview__media" data-reveal>
      <div class="media media--zoom"><img src="assets/img/profile.svg" alt="Portrait of ${cfg.name}" loading="lazy" width="1000" height="1250"></div>
      <span class="about-preview__badge">Studio of one</span>
    </div>
    <div class="about-preview__text" data-reveal style="--d:.1s">
      <span class="eyebrow">03 &mdash; About</span>
      <blockquote class="quote">${cfg.about.home.quote}</blockquote>
      <div class="prose">
        ${cfg.about.home.paragraphs.map((t) => `<p>${t}</p>`).join('\n        ')}
      </div>
      <ul class="skills-row">${cfg.about.skills.map((s) => `<li>${s}</li>`).join('')}</ul>
      <div><a class="btn" href="about.html">More about me ${ARROW}</a></div>
    </div>
  </div>
</section>

<section class="section contact" id="contact">
  <div class="container contact__grid">
    <div data-reveal>
      <span class="eyebrow">04 &mdash; Contact</span>
      <h2 class="contact__title">Let&rsquo;s create <span class="serif">something</span> worth watching</h2>
      <a class="contact__mail" href="mailto:${cfg.email}">${cfg.email} ${ARROW}</a>
      <p class="mono" style="margin-top:1.75rem;opacity:.7">${cfg.availability}</p>
    </div>
    ${contactSide()}
  </div>
</section>`;

  return layout({
    title: `${cfg.name} — ${cfg.title}`,
    desc: cfg.description,
    main,
  });
}

function categoryPage(cat) {
  const r = '../';
  const list = inCat(cat.slug);
  const frames = [];
  list.forEach((p) => {
    frames.push({ src: `${p.slug}-g1.svg`, cap: p.title, no: 'Frame 01', slug: p.slug });
    frames.push({ src: `${p.slug}-g2.svg`, cap: p.title, no: 'Frame 02', slug: p.slug });
  });

  const filterBtns = ['all', ...cat.subs]
    .map(
      (t, i) =>
        `<button class="filter-btn${i === 0 ? ' is-active' : ''}" type="button" data-filter="${t}" aria-pressed="${i === 0}">${t === 'all' ? 'All work' : t}</button>`
    )
    .join('');

  const main = `<section class="page-hero">
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="${r}index.html">Home</a><span aria-hidden="true">/</span>
      <a href="${r}index.html#portfolio">Portfolio</a><span aria-hidden="true">/</span>
      <span aria-current="page">${cat.name}</span>
    </nav>
    <div class="page-hero__grid">
      <div class="stack">
        <span class="eyebrow">${cat.no} &mdash; Category</span>
        <h1 class="display-xl">${cat.name}</h1>
      </div>
      <p class="lede">${cat.lede}</p>
    </div>
    <div class="page-hero__stats">
      <div class="stat"><b>${String(list.length).padStart(2, '0')}</b><span>Projects</span></div>
      <div class="stat"><b>${cat.subs.length}</b><span>Disciplines</span></div>
      <div class="stat"><b>2024&ndash;26</b><span>Timeline</span></div>
      <div class="stat"><b>Worldwide</b><span>Remote friendly</span></div>
    </div>
    <p class="prose" style="margin-top:2rem">${cat.intro}</p>
  </div>
</section>

<section class="section--tight">
  <div class="container">
    <div class="filter-bar" data-filters>
      <div class="filters">${filterBtns}</div>
      <span class="mono">${String(list.length).padStart(2, '0')} projects</span>
    </div>
    <div class="gallery" data-gallery>
      ${list.map((p, i) => galleryItem(p, ['7', '5', '12'][i % 3], r)).join('\n')}
    </div>
  </div>
</section>

<section class="section frames">
  <div class="container">
    <div class="section-head">
      <div class="section-head__text">
        <span class="eyebrow">Selected frames</span>
        <h2 class="display-m">Stills &amp; details from this category</h2>
      </div>
      <p class="mono">Drag / scroll &rarr;</p>
    </div>
    <div class="frames__track">
      ${frames
        .map(
          (f) => `<figure class="frame" data-reveal>
        <a href="${r}work/${f.slug}.html" class="media media--zoom ratio-43"><img src="${r}assets/img/${f.src}" alt="${f.cap} — ${f.no}" loading="lazy"></a>
        <figcaption><span>${f.cap}</span><span>${f.no}</span></figcaption>
      </figure>`
        )
        .join('\n')}
    </div>
  </div>
</section>`;

  return layout({
    title: `${cat.name} — ${cfg.name}`,
    desc: `${cat.name} portfolio by ${cfg.name} — ${cat.lede}`,
    r,
    active: 'portfolio',
    main,
  });
}

function projectPage(p) {
  const r = '../';
  const c = catOf(p.cat);
  const idx = projects.indexOf(p);
  const next = projects[(idx + 1) % projects.length];

  const meta = [
    ['Client', p.client],
    ['Year', p.year],
    ['Role', p.role],
    ['Category', `${c.name} — ${p.tags[0]}`],
  ]
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join('');

  const process = p.process
    .map(
      (s, i) => `<li data-reveal style="--d:${i * 0.07}s">
      <span class="no">${String(i + 1).padStart(2, '0')}</span>
      <h4>${s.t}</h4>
      <p>${s.d}</p>
    </li>`
    )
    .join('');

  const tools = p.tools.map((t) => `<li>${t}</li>`).join('');

  const main = `<article>
<section class="project-hero">
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="${r}index.html">Home</a><span aria-hidden="true">/</span>
      <a href="${r}portfolio/${c.slug}.html">${c.name}</a><span aria-hidden="true">/</span>
      <span aria-current="page">${p.title}</span>
    </nav>
    <span class="eyebrow">${p.tags.join(' &mdash; ')}</span>
    <h1 class="display-xl" style="margin-top:1.25rem">${p.title}</h1>
    <p class="lede">${p.lede}</p>
    <dl class="project-meta">${meta}</dl>
  </div>
</section>

<div class="project-cover" data-parallax>
  <img src="${r}assets/img/${p.slug}-cover.svg" alt="${p.title} — cover" width="1600" height="900">
  <div class="project-cover__tag"><span>${c.name}</span><span>${p.year}</span><span>${p.role}</span></div>
</div>

<section class="section">
  <div class="container split">
    <div class="split__label">
      <span class="eyebrow">Overview</span>
      <p class="mono">${p.client}</p>
    </div>
    <div class="stack-lg">
      <div class="prose">${p.overview.map((t) => `<p>${t}</p>`).join('')}</div>
      <blockquote class="quote">${p.quote}</blockquote>
    </div>
  </div>
</section>

<section class="section--tight">
  <div class="container gallery-2">
    <figure data-reveal>
      <div class="media media--zoom"><img src="${r}assets/img/${p.slug}-g1.svg" alt="${p.title} — still 01" loading="lazy"></div>
      <figcaption><span>Still 01</span><span>${p.title}</span></figcaption>
    </figure>
    <figure class="tall" data-reveal style="--d:.1s">
      <div class="media media--zoom"><img src="${r}assets/img/${p.slug}-g2.svg" alt="${p.title} — still 02" loading="lazy"></div>
      <figcaption><span>Still 02</span><span>${p.title}</span></figcaption>
    </figure>
  </div>
</section>

<section class="section">
  <div class="container split">
    <div class="split__label">
      <span class="eyebrow">Creative process</span>
      <p class="mono">Four moves, every project</p>
    </div>
    <ol class="process">${process}</ol>
  </div>
</section>

<section class="section--tight">
  <div class="container split">
    <div class="split__label">
      <span class="eyebrow">Before &amp; after</span>
      <p class="mono">Drag the handle &mdash; draft vs. final</p>
    </div>
    <div class="ba" data-ba data-reveal>
      <img class="ba__before" src="${r}assets/img/${p.slug}-before.svg" alt="${p.title} — draft stage" loading="lazy">
      <img class="ba__after" src="${r}assets/img/${p.slug}-after.svg" alt="${p.title} — final stage" loading="lazy">
      <span class="ba__handle" aria-hidden="true"></span>
      <span class="ba__label ba__label--l">Before</span>
      <span class="ba__label ba__label--r">After</span>
    </div>
  </div>
</section>

<section class="section--tight">
  <div class="container split">
    <div class="split__label">
      <span class="eyebrow">Tools used</span>
      <p class="mono">Software &amp; craft</p>
    </div>
    <ul class="tools">${tools}</ul>
  </div>
</section>

<section class="section">
  <div class="container bts">
    <div class="stack-lg" data-reveal>
      <span class="eyebrow">Behind the scenes</span>
      <h2 class="display-m">How it actually happened</h2>
      <div class="prose"><p>${p.bts}</p></div>
      <a class="arrow-link" href="${r}portfolio/documentary.html">More behind the scenes ${ARROW}</a>
    </div>
    <div class="media media--zoom ratio-169" data-reveal style="--d:.1s">
      <img src="${r}assets/img/${p.slug}-bts.svg" alt="${p.title} — behind the scenes" loading="lazy">
    </div>
  </div>
</section>

<a class="next-project" href="${r}work/${next.slug}.html">
  <div class="container">
    <span class="np-eyebrow">Next project</span>
    <h3>${next.title} <span class="np-arrow" aria-hidden="true">&rarr;</span></h3>
  </div>
</a>
</article>`;

  return layout({
    title: `${p.title} — ${c.name} — ${cfg.name}`,
    desc: p.summary,
    r,
    active: 'work',
    progress: true,
    main,
  });
}

function aboutPage() {
  const r = '';

  const philosophy = [
    { t: 'Direction over decoration', d: 'Concept first. If the idea cannot be said in one sentence, no amount of polish will save it.' },
    { t: 'Systems scale', d: 'Grids, type scales and timing rules keep work consistent long after the launch adrenaline fades.' },
    { t: 'Motion with meaning', d: 'Movement should explain hierarchy or emotion — never merely fill silence.' },
    { t: 'AI as material', d: 'Generative tools are a new kind of camera: powerful, opinionated, and useless without direction.' },
  ]
    .map(
      (item, i) => `<li data-reveal style="--d:${i * 0.07}s">
      <span class="no">${String(i + 1).padStart(2, '0')}</span>
      <h4>${item.t}</h4>
      <p>${item.d}</p>
    </li>`
    )
    .join('');

  const skills = [
    { h: 'Design', items: [['Art direction', '7 yrs'], ['Poster & print', '7 yrs'], ['Typography', '6 yrs'], ['Brand systems', '5 yrs'], ['Social formats', '5 yrs']] },
    { h: 'Motion & Video', items: [['Motion graphics', '6 yrs'], ['Video editing', '6 yrs'], ['Colour grading', '4 yrs'], ['Reels & vertical', '4 yrs'], ['Title sequences', '3 yrs']] },
    { h: 'AI & Experiment', items: [['AI filmmaking', '3 yrs'], ['Image prompting', '3 yrs'], ['Node workflows', '2 yrs'], ['Upscaling & repair', '2 yrs'], ['Creative research', 'ongoing']] },
    { h: 'Film & Story', items: [['Documentary', '4 yrs'], ['Campaign films', '4 yrs'], ['Story structure', '5 yrs'], ['Sound-first editing', '3 yrs'], ['On-set direction', '3 yrs']] },
  ]
    .map(
      (card) => `<div class="skill-card" data-reveal>
      <h4>${card.h}</h4>
      <ul>${card.items.map(([n, l]) => `<li><span style="font-family:inherit;font-size:.95rem;letter-spacing:0;text-transform:none;color:var(--ink)">${n}</span><span>${l}</span></li>`).join('')}</ul>
    </div>`
    )
    .join('');

  const timeline = [
    { y: '2023 — Now', h: 'Independent Creative Designer', p: 'Design, motion and AI-driven film for cultural and commercial clients worldwide.', place: 'Freelance / Studio of one' },
    { y: '2021 — 2023', h: 'Senior Designer & Motion Lead', p: 'Led visual systems, campaign films and social design for launching brands.', place: 'Creative agency' },
    { y: '2019 — 2021', h: 'Graphic Designer', p: 'Posters, editorial layouts and identity work across print and screen.', place: 'Design studio' },
    { y: '2018 — 2019', h: 'Junior Designer / Intern', p: 'Learned the grid, the deadline and the discipline of daily production.', place: 'First studio' },
  ]
    .map(
      (e) => `<li data-reveal>
      <span class="year">${e.y}</span>
      <div><h4>${e.h}</h4><p>${e.p}</p></div>
      <span class="place">${e.place}</span>
    </li>`
    )
    .join('');

  const main = `<section class="page-hero">
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">About</span>
    </nav>
    <div class="about-hero">
      <div class="stack">
        <span class="eyebrow">About &mdash; Nima Vale</span>
        <h1 class="display-xl">Designer, editor, <span class="serif">image</span> maker</h1>
        <p class="lede">I design visual experiences that move — across posters, screens, films and the strange new territory of artificial intelligence.</p>
        <div class="flex flex-wrap">
          <a class="btn btn--solid" href="index.html#contact">Work with me ${ARROW}</a>
          <a class="btn" href="index.html#portfolio">See the portfolio</a>
        </div>
      </div>
      <div class="media" data-reveal="clip"><img src="assets/img/profile.svg" alt="Portrait of Nima Vale" width="1000" height="1250"></div>
    </div>
    <div class="page-hero__stats">
      <div class="stat"><b>07</b><span>Years creating</span></div>
      <div class="stat"><b>60+</b><span>Projects shipped</span></div>
      <div class="stat"><b>04</b><span>Disciplines</span></div>
      <div class="stat"><b>12</b><span>Countries served</span></div>
    </div>
  </div>
</section>

<section class="section--tight">
  <div class="container split">
    <div class="split__label">
      <span class="eyebrow">Creative philosophy</span>
      <p class="mono">Why the work looks like this</p>
    </div>
    <div class="stack-lg">
      <blockquote class="quote">Design is direction — the craft is knowing what to leave out.</blockquote>
      <div class="prose">
        <p>I started in print, moved into motion, and now spend a large part of my week directing generative tools. The through-line is editorial thinking: hierarchy, rhythm, restraint, and a stubborn belief that whitespace is a feature.</p>
        <p>Whether the deliverable is a poster, a title sequence or a four-minute AI film, the process is the same — <strong>define the system, find the tension, then cut everything that is not earning its place.</strong></p>
      </div>
    </div>
  </div>
</section>

<section class="section--tight">
  <div class="container">
    <div class="section-head">
      <div class="section-head__text">
        <span class="eyebrow">Principles</span>
        <h2 class="display-m">Four rules I keep coming back to</h2>
      </div>
    </div>
    <ul class="philosophy">${philosophy}</ul>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head">
      <div class="section-head__text">
        <span class="eyebrow">Skills &amp; experience</span>
        <h2 class="display-m">What I bring to a project</h2>
      </div>
      <p class="lede">From concept and art direction through to final grade and export.</p>
    </div>
    <div class="skill-grid">${skills}</div>
  </div>
</section>

<section class="section--tight">
  <div class="container">
    <div class="section-head">
      <div class="section-head__text">
        <span class="eyebrow">Experience</span>
        <h2 class="display-m">Seven years, briefly</h2>
      </div>
    </div>
    <ul class="timeline">${timeline}</ul>
  </div>
</section>

${marquee(['Nocturne Festival', 'Aether Audio', 'Ferro Architects', 'Format Conference', 'Rova', 'Verdant', 'Lowbeam', 'Crafted Series'])}

<section class="section contact" id="contact">
  <div class="container contact__grid">
    <div data-reveal>
      <span class="eyebrow">Contact</span>
      <h2 class="contact__title">Say <span class="serif">hello</span></h2>
      <a class="contact__mail" href="mailto:${cfg.email}">${cfg.email} ${ARROW}</a>
      <p class="mono" style="margin-top:1.75rem;opacity:.7">${cfg.availability}</p>
    </div>
    ${contactSide()}
  </div>
</section>`;

  return layout({
    title: 'About — Nima Vale, Visual Designer',
    desc: 'About Nima Vale — visual designer, editor and AI image maker. Skills, experience and creative philosophy.',
    main,
    active: 'about',
  });
}

/* ------------------------- write ------------------------- */

function write(rel, html) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log('wrote', rel);
}

write('index.html', homePage());
write('about.html', aboutPage());
cats.forEach((c) => write(`portfolio/${c.slug}.html`, categoryPage(c)));
projects.forEach((p) => write(`work/${p.slug}.html`, projectPage(p)));
console.log('build complete.');

/* Copy assets folder to dist */
const srcAssets = path.join(__dirname, '..', 'assets');
const dstAssets = path.join(ROOT, 'assets');
require('fs').mkdirSync(dstAssets, { recursive: true });
const { mkdirSync, readdirSync, copyFileSync } = require('fs');
const { join } = require('path');
function copyDir(src, dst) {
  mkdirSync(dst, { recursive: true });
  for (const file of readdirSync(src)) {
    const srcPath = join(src, file);
    const dstPath = join(dst, file);
    const stat = require('fs').statSync(srcPath);
    if (stat.isDirectory()) { copyDir(srcPath, dstPath); }
    else { copyFileSync(srcPath, dstPath); }
  }
}
copyDir(srcAssets, dstAssets);
console.log('assets copied to dist/assets');
