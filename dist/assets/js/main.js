/* =========================================================
   MAIN — theme, navigation, reveals, filters, micro-interactions
   ========================================================= */
(function () {
  'use strict';

  const root = document.documentElement;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- theme ---------- */
  const THEME_KEY = 'nv-theme';
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.setAttribute('data-theme', 'dark');
  }

  function bindThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const sync = () => btn.setAttribute('aria-pressed', String(root.getAttribute('data-theme') === 'dark'));
    sync();
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      sync();
    });
  }

  /* ---------- header hide / show on scroll ---------- */
  function header() {
    const el = document.getElementById('siteHeader');
    if (!el) return;
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      el.classList.toggle('is-scrolled', y > 24);
      const menuOpen = document.body.classList.contains('menu-open-lock');
      if (!menuOpen) {
        if (y > last && y > 380) el.classList.add('is-hidden');
        else el.classList.remove('is-hidden');
      }
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- fullscreen menu ---------- */
  function menu() {
    const btn = document.getElementById('menuBtn');
    const overlay = document.getElementById('menuOverlay');
    if (!btn || !overlay) return;

    const setOpen = (open) => {
      document.body.classList.toggle('menu-open-lock', open);
      document.body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      overlay.setAttribute('aria-hidden', String(!open));
      if (open) document.getElementById('siteHeader').classList.remove('is-hidden');
    };

    btn.addEventListener('click', () => setOpen(!document.body.classList.contains('menu-open-lock')));
    overlay.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  /* ---------- reveal on scroll ---------- */
  function reveals() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ---------- custom cursor ---------- */
  function cursor() {
    if (!window.matchMedia('(pointer: fine)').matches || prefersReduced) return;
    const dot = document.createElement('div');
    dot.className = 'cursor';
    document.body.appendChild(dot);

    let x = window.innerWidth / 2, y = window.innerHeight / 2, tx = x, ty = y;
    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      dot.classList.add('is-on');
    });
    document.addEventListener('mouseleave', () => dot.classList.remove('is-on'));

    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    const grow = 'a, button, .ba, [data-cursor]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(grow)) dot.classList.add('is-big');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(grow)) dot.classList.remove('is-big');
    });
  }

  /* ---------- category hover preview ---------- */
  function catPreview() {
    const list = document.querySelector('[data-cat-list]');
    const preview = document.querySelector('[data-cat-preview]');
    if (!list || !preview || !window.matchMedia('(pointer: fine)').matches) return;
    const img = preview.querySelector('img');
    let px = 0, py = 0, cx = 0, cy = 0, active = false;

    list.querySelectorAll('[data-img]').forEach((row) => {
      row.addEventListener('mouseenter', () => {
        img.src = row.getAttribute('data-img');
        preview.classList.add('is-on');
        active = true;
      });
      row.addEventListener('mouseleave', () => {
        preview.classList.remove('is-on');
        active = false;
      });
    });

    const section = list.closest('.cats');
    section.addEventListener('mousemove', (e) => {
      const r = section.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
    });

    const loop = () => {
      cx += (px - cx) * 0.12;
      cy += (py - cy) * 0.12;
      if (active || preview.classList.contains('is-on')) {
        preview.style.left = cx + 'px';
        preview.style.top = cy + 'px';
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- category filters ---------- */
  function filters() {
    const bar = document.querySelector('[data-filters]');
    const grid = document.querySelector('[data-gallery]');
    if (!bar || !grid) return;
    const buttons = bar.querySelectorAll('.filter-btn');
    const items = grid.querySelectorAll('.g-item');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        const val = btn.getAttribute('data-filter');
        items.forEach((item) => {
          const tags = (item.getAttribute('data-tags') || '').split('|');
          const show = val === 'all' || tags.includes(val);
          item.classList.toggle('is-hidden', !show);
          if (show) {
            item.style.opacity = 0;
            item.style.transform = 'translateY(18px)';
            requestAnimationFrame(() => {
              item.style.opacity = 1;
              item.style.transform = 'none';
            });
          }
        });
      });
    });
  }

  /* ---------- before / after slider ---------- */
  function beforeAfter() {
    document.querySelectorAll('[data-ba]').forEach((el) => {
      let dragging = false;
      const set = (clientX) => {
        const r = el.getBoundingClientRect();
        const pct = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
        el.style.setProperty('--pos', pct + '%');
      };
      el.addEventListener('pointerdown', (e) => {
        dragging = true;
        el.setPointerCapture(e.pointerId);
        set(e.clientX);
      });
      el.addEventListener('pointermove', (e) => {
        if (dragging || e.pointerType === 'mouse' && e.buttons === 0) {
          if (dragging) set(e.clientX);
        }
      });
      el.addEventListener('pointerup', () => (dragging = false));
      el.addEventListener('pointercancel', () => (dragging = false));
      // hover-follow on desktop for effortless exploring
      if (window.matchMedia('(pointer: fine)').matches) {
        el.addEventListener('mousemove', (e) => { if (!dragging) set(e.clientX); });
      }
      el.style.setProperty('--pos', '50%');
    });
  }

  /* ---------- cover parallax + progress ---------- */
  function parallax() {
    const covers = document.querySelectorAll('[data-parallax] img');
    const bar = document.querySelector('.page-progress');
    if (!covers.length && !bar) return;
    if (prefersReduced) return;

    const onScroll = () => {
      const vh = window.innerHeight;
      covers.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
        img.style.transform = `translateY(${(-p * 7).toFixed(2)}%)`;
      });
      if (bar) {
        const h = document.documentElement.scrollHeight - vh;
        bar.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ---------- local time + year ---------- */
  function meta() {
    const clock = document.querySelectorAll('[data-clock]');
    if (clock.length) {
      const tick = () => {
        const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        clock.forEach((el) => (el.textContent = t));
      };
      tick();
      setInterval(tick, 15000);
    }
    document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
  }

  /* ---------- boot ---------- */
  function init() {
    root.classList.add('js');
    bindThemeToggle();
    header();
    menu();
    reveals();
    cursor();
    catPreview();
    filters();
    beforeAfter();
    parallax();
    meta();
    requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
