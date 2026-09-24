/* Section-by-section screenshots via Chrome DevTools Protocol.
   Usage: node tools/shoot.js <group>   groups: home | category | project | about | dark | mobile | all */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9222;
const OUT = path.join(__dirname, '..', '.shots');
const BASE = 'http://localhost:4173';
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function req(method, p) {
  return new Promise((res, rej) => {
    const r = http.request({ host: 'localhost', port: PORT, path: p, method }, (resp) => {
      let d = '';
      resp.on('data', (c) => (d += c));
      resp.on('end', () => {
        try { res(JSON.parse(d)); } catch (e) { rej(e); }
      });
    });
    r.on('error', rej);
    r.end();
  });
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && this.pending.has(m.id)) {
        const { res, rej } = this.pending.get(m.id);
        this.pending.delete(m.id);
        m.error ? rej(new Error(m.error.message)) : res(m.result);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  waitFor(event, timeout = 7000) {
    return new Promise((res) => {
      const h = (e) => {
        const m = JSON.parse(e.data);
        if (m.method === event) {
          this.ws.removeEventListener('message', h);
          res(true);
        }
      };
      this.ws.addEventListener('message', h);
      setTimeout(() => {
        this.ws.removeEventListener('message', h);
        res(false);
      }, timeout);
    });
  }
}

async function openTab() {
  const tab = await req('PUT', '/json/new?about:blank');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });
  return { tab, cdp: new CDP(ws) };
}

async function shoot(cdp, job) {
  await cdp.send('Page.enable');
  await cdp.send('Page.bringToFront');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: job.w,
    height: job.h,
    deviceScaleFactor: 1,
    mobile: !!job.mobile,
    screenWidth: job.w,
    screenHeight: job.h,
  });
  const features = [{ name: 'prefers-reduced-motion', value: 'reduce' }];
  if (job.dark) features.push({ name: 'prefers-color-scheme', value: 'dark' });
  await cdp.send('Emulation.setEmulatedMedia', { features });

  const loaded = cdp.waitFor('Page.loadEventFired');
  await cdp.send('Page.navigate', { url: BASE + job.url });
  await loaded;
  await sleep(job.wait || 900);

  if (job.eval) {
    await cdp.send('Runtime.evaluate', { expression: job.eval });
    await sleep(700);
  }
  if (job.scroll) {
    await cdp.send('Runtime.evaluate', {
      expression: `(() => { const el = document.querySelector(${JSON.stringify(job.scroll)}); if (el) { el.scrollIntoView({ block: 'start', behavior: 'instant' }); window.scrollBy(0, ${job.shift || 0}); } })()`,
    });
    await sleep(700);
  }

  const shot = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 80, fromSurface: true });
  const file = path.join(OUT, job.name + '.jpg');
  fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
  console.log('shot', job.name);
}

const W = 1600, H = 1000;

const groups = {
  home: [
    { name: '01-home-hero', url: '/', w: W, h: H },
    { name: '02-home-works-head', url: '/', w: W, h: H, scroll: '#work' },
    { name: '03-home-work-1', url: '/', w: W, h: H, scroll: '.works .work:nth-child(1)', shift: -90 },
    { name: '04-home-work-2', url: '/', w: W, h: H, scroll: '.works .work:nth-child(2)', shift: -90 },
    { name: '05-home-cats', url: '/', w: W, h: H, scroll: '#portfolio' },
    { name: '06-home-about', url: '/', w: W, h: H, scroll: '.about-preview', shift: -90 },
    { name: '07-home-contact', url: '/', w: W, h: H, scroll: '#contact' },
    { name: '08-home-footer', url: '/', w: W, h: H, scroll: '.site-footer' },
  ],
  category: [
    { name: '10-cat-hero', url: '/portfolio/graphic-design.html', w: W, h: H },
    { name: '11-cat-gallery', url: '/portfolio/graphic-design.html', w: W, h: H, scroll: '.filter-bar', shift: -80 },
    { name: '12-cat-gallery2', url: '/portfolio/graphic-design.html', w: W, h: H, scroll: '.gallery .g-item:nth-child(3)', shift: -90 },
    { name: '13-cat-frames', url: '/portfolio/graphic-design.html', w: W, h: H, scroll: '.frames' },
  ],
  project: [
    { name: '20-proj-hero', url: '/work/obsidian-sky.html', w: W, h: H },
    { name: '21-proj-cover', url: '/work/obsidian-sky.html', w: W, h: H, scroll: '.project-cover', shift: -70 },
    { name: '22-proj-overview', url: '/work/obsidian-sky.html', w: W, h: H, scroll: '.split', shift: -80 },
    { name: '23-proj-gallery', url: '/work/obsidian-sky.html', w: W, h: H, scroll: '.gallery-2', shift: -80 },
    { name: '24-proj-process', url: '/work/obsidian-sky.html', w: W, h: H, scroll: '.process', shift: -120 },
    { name: '25-proj-ba', url: '/work/obsidian-sky.html', w: W, h: H, scroll: '.ba', shift: -160 },
    { name: '26-proj-bts', url: '/work/obsidian-sky.html', w: W, h: H, scroll: '.bts', shift: -100 },
    { name: '27-proj-next', url: '/work/obsidian-sky.html', w: W, h: H, scroll: '.next-project', shift: -120 },
  ],
  about: [
    { name: '30-about-hero', url: '/about.html', w: W, h: H },
    { name: '31-about-philo', url: '/about.html', w: W, h: H, scroll: '.philosophy', shift: -120 },
    { name: '32-about-skills', url: '/about.html', w: W, h: H, scroll: '.skill-grid', shift: -140 },
    { name: '33-about-timeline', url: '/about.html', w: W, h: H, scroll: '.timeline', shift: -140 },
    { name: '34-about-contact', url: '/about.html', w: W, h: H, scroll: '#contact' },
  ],
  dark: [
    { name: '40-dark-hero', url: '/', w: W, h: H, dark: true },
    { name: '41-dark-works', url: '/', w: W, h: H, dark: true, scroll: '#work' },
    { name: '42-dark-cats', url: '/', w: W, h: H, dark: true, scroll: '#portfolio' },
    { name: '43-dark-contact', url: '/', w: W, h: H, dark: true, scroll: '#contact' },
    { name: '44-dark-cat-page', url: '/portfolio/ai-visual-lab.html', w: W, h: H, dark: true, scroll: '.filter-bar', shift: -80 },
    { name: '45-dark-project', url: '/work/chroma-drift.html', w: W, h: H, dark: true },
    { name: '46-dark-project-ba', url: '/work/chroma-drift.html', w: W, h: H, dark: true, scroll: '.ba', shift: -160 },
    { name: '47-dark-about', url: '/about.html', w: W, h: H, dark: true },
  ],
  mobile: [
    { name: '50-mob-hero', url: '/', w: 402, h: 880, mobile: true },
    { name: '51-mob-works', url: '/', w: 402, h: 880, mobile: true, scroll: '#work' },
    { name: '52-mob-work', url: '/', w: 402, h: 880, mobile: true, scroll: '.works .work:nth-child(1)', shift: -80 },
    { name: '53-mob-cats', url: '/', w: 402, h: 880, mobile: true, scroll: '#portfolio' },
    { name: '54-mob-menu', url: '/', w: 402, h: 880, mobile: true, eval: "document.body.classList.add('menu-open','menu-open-lock')" },
    { name: '55-mob-contact', url: '/', w: 402, h: 880, mobile: true, scroll: '#contact' },
    { name: '56-mob-cat', url: '/portfolio/motion-video.html', w: 402, h: 880, mobile: true },
    { name: '57-mob-cat-gal', url: '/portfolio/motion-video.html', w: 402, h: 880, mobile: true, scroll: '.gallery', shift: -70 },
    { name: '58-mob-proj', url: '/work/nightshift.html', w: 402, h: 880, mobile: true },
    { name: '59-mob-proj-ba', url: '/work/nightshift.html', w: 402, h: 880, mobile: true, scroll: '.ba', shift: -140 },
  ],
};

(async () => {
  const group = process.argv[2] || 'home';
  const names = group === 'all' ? Object.keys(groups) : group.split(',');
  let jobs = [];
  names.forEach((n) => {
    if (!groups[n]) {
      console.error('unknown group: ' + n);
      process.exit(1);
    }
    jobs = jobs.concat(groups[n]);
  });

  for (const job of jobs) {
    const { tab, cdp } = await openTab();
    try {
      await shoot(cdp, job);
    } catch (e) {
      console.log('✗ ' + job.name + ' — ' + e.message);
    }
    try { cdp.ws.close(); } catch (e) {}
    await req('PUT', '/json/close/' + tab.id).catch(() => {});
  }
  console.log('done: ' + jobs.length + ' shots');
  process.exit(0);
})();
