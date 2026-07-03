/* ═══════════════════════════════════════════════════════════════════
   CARESENSE AI — interactie + cinematische scroll
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ── Lenis smooth scroll ── */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    lenis.on('scroll', onScroll);
    window.lenis = lenis;
  }
  function scrollTop(instant) {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }

  /* ── Reveal-on-scroll (blur + rise, gestaffeld) ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

  function bindReveals(root) {
    $$('.stagger', root).forEach((grp) => {
      Array.from(grp.children).forEach((ch, i) => ch.style.setProperty('--i', i));
    });
    $$('[data-reveal]', root).forEach((el) => {
      if (!el.classList.contains('in')) revealObserver.observe(el);
    });
  }

  /* ── Split-text: koppen animeren woord-voor-woord ── */
  const SPLIT_TARGETS = '.hero h1,.phero h1,.sec-head h2,.split-copy h2,.ctaband h2,.whatis-closing';
  function splitText(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    let idx = 0;
    function wrapUnit(contentNode, parent, before) {
      const mask = document.createElement('span'); mask.className = 'sw';
      const w = document.createElement('span'); w.className = 'sww';
      w.style.transitionDelay = (idx * 45) + 'ms'; idx++;
      mask.appendChild(w);
      parent.insertBefore(mask, before);
      w.appendChild(contentNode);
    }
    function walk(node) {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            const mask = document.createElement('span'); mask.className = 'sw';
            const w = document.createElement('span'); w.className = 'sww';
            w.style.transitionDelay = (idx * 45) + 'ms'; idx++;
            w.textContent = p; mask.appendChild(w); frag.appendChild(mask);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          // gradient-spans en <b> als één geheel animeren (behoudt background-clip)
          if (child.classList.contains('grad-w') || child.classList.contains('grad') || child.tagName === 'B') {
            wrapUnit(child, node, child.nextSibling ? child.nextSibling : null);
          } else walk(child);
        }
      });
    }
    walk(el);
  }
  function bindSplits(root) {
    $$(SPLIT_TARGETS, root).forEach((el) => {
      splitText(el);
      el.classList.add('split-target');
      if (!el.classList.contains('in')) revealObserver.observe(el);
    });
  }

  /* ── Parallax op media (subtiel, terminal-industries-stijl) ── */
  let parallaxEls = [];
  function bindParallax(root) {
    $$('.media-frame img,.about-hero-img img', root).forEach((el) => {
      if (!el.dataset.parallax) el.dataset.parallax = '0.09';
    });
    parallaxEls = $$('[data-parallax]', root);
    runParallax();
  }
  function runParallax() {
    for (const el of parallaxEls) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -60 || r.top > window.innerHeight + 60) continue;
      const off = (r.top + r.height / 2 - window.innerHeight / 2) * parseFloat(el.dataset.parallax);
      el.style.transform = 'translateY(' + off.toFixed(1) + 'px) scale(1.14)';
    }
  }

  /* ── Counters ── */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const dur = 1700, start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toLocaleString('nl-NL', {
        minimumFractionDigits: decimals, maximumFractionDigits: decimals
      }) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { animateCount(e.target); countObserver.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  function bindCounters(root) { $$('[data-count]', root).forEach((el) => countObserver.observe(el)); }

  /* ── View switching ── */
  const views = $$('.view');
  const nav = $('#nav');

  function showView(id, push = true) {
    const target = document.getElementById('view-' + id) || document.getElementById('view-home');
    if (!target) return;
    views.forEach((v) => v.classList.remove('active'));
    target.classList.add('active');
    $$('.nav-link').forEach((l) => l.classList.toggle('active', l.dataset.view === id));
    $$('.nav-drawer a[data-view]').forEach((l) => l.classList.toggle('active', l.dataset.view === id));

    scrollTop(true);
    if (lenis) lenis.resize();
    updateNavBg();
    updateProgress();
    bindReveals(target);
    bindSplits(target);
    bindParallax(target);
    bindCounters(target);
    initScrolly(target);
    closeDrawer();

    if (push) history.replaceState(null, '', '#' + id);
    document.title = target.dataset.title || 'CareSense AI';
  }

  document.addEventListener('click', (ev) => {
    const link = ev.target.closest('[data-view]');
    if (link) { ev.preventDefault(); showView(link.dataset.view); }
  });

  /* ── Nav bg + scroll progress ── */
  function updateNavBg() {
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  const progressBar = $('#scrollProgress');
  function updateProgress() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? clamp(window.scrollY / h, 0, 1) : 0;
    if (progressBar) progressBar.style.transform = 'scaleX(' + p + ')';
  }

  function onScroll() {
    updateNavBg();
    updateProgress();
    runScrolly();
    runHeroParallax();
    runParallax();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Mobile drawer ── */
  const drawer = $('#navDrawer');
  const toggle = $('#navToggle');
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    if (lenis) lenis.start();
    document.body.style.overflow = '';
  }
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      if (open) { if (lenis) lenis.stop(); document.body.style.overflow = 'hidden'; }
      else { if (lenis) lenis.start(); document.body.style.overflow = ''; }
    });
  }

  /* ── Pricing toggle ── */
  window.togglePrice = function (yearly, btn) {
    $$('.price-toggle button').forEach((b) => b.classList.remove('on'));
    btn.classList.add('on');
    $$('[data-monthly]').forEach((el) => { el.textContent = yearly ? el.dataset.yearly : el.dataset.monthly; });
    $$('.per-label').forEach((el) => { el.textContent = yearly ? '/maand*' : '/maand'; });
  };

  /* ── FAQ ── */
  window.toggleFaq = function (btn) {
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-a');
    const open = item.classList.toggle('open');
    answer.style.maxHeight = open ? answer.scrollHeight + 'px' : '0';
  };

  /* ── Contact form ── */
  window.submitContact = function (ev) {
    ev.preventDefault();
    ev.target.style.display = 'none';
    const ok = $('#formSuccess');
    if (ok) ok.classList.add('show');
    return false;
  };

  /* ── Hero parallax (subtiel, decoratief) ── */
  let heroGrid = null, heroOrbs = null;
  function cacheHero() {
    const home = $('#view-home');
    heroGrid = home ? $('.hero-grid-bg', home) : null;
    heroOrbs = home ? $('.hero-orbs', home) : null;
  }
  function runHeroParallax() {
    if (!heroGrid || !$('#view-home').classList.contains('active')) return;
    const y = window.scrollY;
    if (y > window.innerHeight) return;
    heroGrid.style.transform = 'translateY(' + (y * 0.18).toFixed(1) + 'px)';
    if (heroOrbs) heroOrbs.style.transform = 'translateY(' + (y * 0.08).toFixed(1) + 'px)';
  }

  /* ═══ Cinematische hub-scrolly (moving landing) ═══
     De video wordt met de scroll "gescrubd", schaalt subtiel, en de
     bijschriften wisselen — als een bewegende landingspagina. */
  let scrollyEl = null, scrollyVideo = null, scrollyStages = [], scrollyBar = null, scrubReady = false;

  function initScrolly(root) {
    scrollyEl = $('.scrolly', root);
    scrollyVideo = scrollyEl ? $('.scrolly-video', scrollyEl) : null;
    scrollyStages = scrollyEl ? $$('.scrolly-stage', scrollyEl) : [];
    scrollyBar = scrollyEl ? $('#scrollyBar', scrollyEl) : null;
    scrubReady = false;

    if (scrollyVideo) {
      const enableScrub = () => {
        if (isFinite(scrollyVideo.duration) && scrollyVideo.duration > 0) {
          scrubReady = true;
          scrollyVideo.pause();
          runScrolly();
        }
      };
      // muted autoplay laat de eerste frame renderen; daarna nemen we de regie
      scrollyVideo.play().catch(() => {});
      if (scrollyVideo.readyState >= 1) enableScrub();
      else scrollyVideo.addEventListener('loadedmetadata', enableScrub, { once: true });
      // fallback: als scrubben niet lukt, laat 'm gewoon loopen
      setTimeout(() => { if (!scrubReady) scrollyVideo.play().catch(() => {}); }, 800);
    }
    runScrolly();
  }

  function runScrolly() {
    if (!scrollyEl || !scrollyEl.offsetParent) return;
    const rect = scrollyEl.getBoundingClientRect();
    const total = scrollyEl.offsetHeight - window.innerHeight;
    const p = clamp(-rect.top / total, 0, 1);

    if (scrollyVideo) {
      const scale = 1.16 - p * 0.16;
      scrollyVideo.style.transform = 'scale(' + scale.toFixed(3) + ')';
      if (scrubReady) {
        const t = clamp(p, 0, 0.999) * scrollyVideo.duration;
        if (Math.abs(scrollyVideo.currentTime - t) > 0.02) {
          try { scrollyVideo.currentTime = t; } catch (e) {}
        }
      }
    }
    if (scrollyBar) scrollyBar.style.transform = 'scaleX(' + p.toFixed(3) + ')';

    const n = scrollyStages.length;
    if (n) {
      const active = Math.min(n - 1, Math.floor(p * n * 0.999));
      scrollyStages.forEach((s, i) => {
        const on = i === active;
        s.style.opacity = on ? '1' : '0';
        s.style.transform = 'translate(-50%,-50%) translateY(' + (on ? 0 : (i < active ? -40 : 40)) + 'px)';
        s.style.filter = on ? 'blur(0)' : 'blur(6px)';
        s.style.pointerEvents = on ? 'auto' : 'none';
      });
    }
  }

  /* ── Init ── */
  function init() {
    cacheHero();
    const hash = (location.hash || '').replace('#', '');
    const start = document.getElementById('view-' + hash) ? hash : 'home';
    showView(start, false);
    updateNavBg();
    updateProgress();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
