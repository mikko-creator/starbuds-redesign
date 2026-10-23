/* site.js - Star Buds "Starlit Conservatory": reveals, parallax, tilt, magnetic, draw, header, menus, drawer, loops,
   click-to-load, age gate. Vanilla, no dependencies. FOUNDATION lane. */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  root.classList.add('js');
  var RM = w.matchMedia ? w.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var reduced = function () { return !!RM.matches; };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return w.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { w.localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  };

  /* ---------- reveals ---------- */
  function initReveals() {
    $$('[data-stagger]').forEach(function (p) {
      var step = parseFloat(p.getAttribute('data-stagger')) || 0.08, i = 0;
      Array.prototype.forEach.call(p.children, function (c) {
        if (!c.hasAttribute('data-reveal')) c.setAttribute('data-reveal', p.getAttribute('data-stagger-kind') || 'up');
        c.style.setProperty('--d', (i++ * step).toFixed(2) + 's');
      });
    });
    var els = $$('[data-reveal]');
    if (!els.length) return;
    var done = function (el) {
      el.classList.add('is-in');
      var clear = function () { el.removeAttribute('data-reveal'); el.classList.remove('is-in'); el.style.removeProperty('--d'); };
      var t = setTimeout(clear, 1600 + (parseFloat(el.style.getPropertyValue('--d')) || 0) * 1000);
      el.addEventListener('transitionend', function te(ev) { if (ev.target !== el) return; if (ev.propertyName === 'opacity' || ev.propertyName === 'clip-path') { clearTimeout(t); el.removeEventListener('transitionend', te); clear(); } });
    };
    var revealAll = function () { $$('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); el.removeAttribute('data-reveal'); }); };
    w.addEventListener('beforeprint', revealAll);
    if (reduced() || !('IntersectionObserver' in w)) { revealAll(); return; }
    var delivered = false;
    var io = new IntersectionObserver(function (entries) {
      delivered = true;
      entries.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); done(en.target); } });
    }, { threshold: 0, rootMargin: '0px' });
    els.forEach(function (el) { io.observe(el); });
    // failsafe only if the observer never delivered (e.g. a throttled/hidden tab)
    setTimeout(function () { if (!delivered) revealAll(); }, 3500);
  }

  /* ---------- scroll-driven: parallax, header condense, draw ---------- */
  function initScroll() {
    var hdr = d.querySelector('[data-hdr]');
    var depthEls = $$('[data-depth]');
    var drawEls = $$('[data-draw]');
    var ticking = false;
    var parallaxOn = function () { return !reduced() && w.innerWidth >= 768; };
    function frame() {
      ticking = false;
      var vh = w.innerHeight, y = w.scrollY || w.pageYOffset;
      if (hdr) hdr.classList.toggle('is-condensed', y > 24);
      if (parallaxOn()) {
        depthEls.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          var depth = parseFloat(el.getAttribute('data-depth')) || 0.15;
          var mid = r.top + r.height / 2 - vh / 2;
          el.style.setProperty('--py', (-mid * depth).toFixed(1) + 'px');
        });
      } else depthEls.forEach(function (el) { el.style.removeProperty('--py'); });
      drawEls.forEach(function (el) {
        if (el.classList.contains('is-drawn')) return;
        var r = el.getBoundingClientRect();
        if (reduced()) { el.classList.add('is-drawn'); return; }
        if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add('is-drawn');
      });
    }
    var req = function () { if (!ticking) { ticking = true; w.requestAnimationFrame(frame); } };
    w.addEventListener('scroll', req, { passive: true });
    w.addEventListener('resize', req);
    frame();
  }

  /* ---------- tilt + specular, spotlight ---------- */
  function initTilt() {
    var fine = w.matchMedia && w.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return;
    $$('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 5;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        if (reduced() || el.hasAttribute('data-reveal')) return;
        el.classList.add('is-tilting');
        el.style.setProperty('--rx', ((0.5 - y) * max).toFixed(2) + 'deg'); el.style.setProperty('--ry', ((x - 0.5) * max).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('is-tilting'); el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); });
    });
    $$('.spotlight').forEach(function (el) {
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el.style.setProperty('--sx', (e.clientX - r.left) + 'px'); el.style.setProperty('--sy', (e.clientY - r.top) + 'px'); });
    });
  }

  /* ---------- magnetic buttons ---------- */
  function initMagnetic() {
    var fine = w.matchMedia && w.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return;
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        if (reduced()) return;
        var r = el.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (x * 0.18).toFixed(1) + 'px,' + (y * 0.28).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- dropdown / mega menus ---------- */
  function initMenus() {
    var items = $$('.nav__item--has');
    var closeAll = function (except) { items.forEach(function (it) { if (it !== except) setOpen(it, false); }); };
    function setOpen(it, open) {
      it.classList.toggle('is-open', open);
      var b = it.querySelector('.nav__caret'); if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    items.forEach(function (it) {
      var btn = it.querySelector('.nav__caret'), timer = null;
      var hoverable = w.matchMedia && w.matchMedia('(hover: hover)').matches;
      if (hoverable) {
        it.addEventListener('mouseenter', function () { clearTimeout(timer); timer = setTimeout(function () { closeAll(it); setOpen(it, true); }, 110); });
        it.addEventListener('mouseleave', function () { clearTimeout(timer); timer = setTimeout(function () { setOpen(it, false); }, 220); });
      }
      if (btn) btn.addEventListener('click', function (e) {
        e.preventDefault(); clearTimeout(timer);
        var open = !it.classList.contains('is-open'); closeAll(it); setOpen(it, open);
        if (open) { var first = it.querySelector('.nav__panel a'); if (first && e.detail === 0) first.focus(); }
      });
      it.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && it.classList.contains('is-open')) { setOpen(it, false); if (btn) btn.focus(); e.stopPropagation(); }
      });
      it.addEventListener('focusout', function (e) { if (!it.contains(e.relatedTarget)) setOpen(it, false); });
    });
    d.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.nav__item--has')) closeAll(); });
  }

  /* ---------- mobile drawer: focus trap, Esc, scroll lock ---------- */
  function initDrawer() {
    var drawer = d.getElementById('drawer'), opener = d.querySelector('[data-drawer-open]');
    if (!drawer || !opener) return;
    var panel = drawer.querySelector('.drawer__panel'), last = null;
    var focusables = function () { return $$('a[href], button:not([disabled]), summary, input, [tabindex]:not([tabindex="-1"])', panel).filter(function (x) { return x.offsetParent !== null; }); };
    function open() {
      last = d.activeElement; drawer.hidden = false; d.body.classList.add('is-locked'); opener.setAttribute('aria-expanded', 'true');
      w.requestAnimationFrame(function () { w.requestAnimationFrame(function () { drawer.classList.add('is-open'); var f = drawer.querySelector('.drawer__close'); if (f) f.focus(); }); });
    }
    function close() {
      drawer.classList.remove('is-open'); d.body.classList.remove('is-locked'); opener.setAttribute('aria-expanded', 'false');
      setTimeout(function () { drawer.hidden = true; }, reduced() ? 0 : 450);
      if (last && last !== d.body && last.focus) last.focus(); else opener.focus();
    }
    opener.addEventListener('click', open);
    $$('[data-drawer-close]', drawer).forEach(function (b) { b.addEventListener('click', close); });
    drawer.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables(); if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && d.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && d.activeElement === z) { e.preventDefault(); a.focus(); }
    });
    w.addEventListener('resize', function () { if (!drawer.hidden && w.innerWidth >= 1024) close(); });
  }

  /* ---------- video loops: play in view, pause control, never under reduced motion ---------- */
  function initLoops() {
    var vids = $$('video[data-loop]');
    if (!vids.length) return;
    vids.forEach(function (v) {
      v.muted = true; v.setAttribute('muted', ''); v.playsInline = true;
      var wrap = v.closest('.loop'), btn = wrap && wrap.querySelector('.loop__toggle');
      var user = false;
      if (reduced()) { v.removeAttribute('autoplay'); try { v.pause(); } catch (e) {} if (btn) btn.hidden = true; return; }
      var setBtn = function () { if (!btn) return; var p = v.paused; btn.setAttribute('aria-pressed', p ? 'true' : 'false'); btn.setAttribute('aria-label', p ? 'Play' : 'Pause'); btn.innerHTML = p ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>' : '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor"/></svg>'; };
      if (btn) btn.addEventListener('click', function () { user = !v.paused; if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
      v.addEventListener('play', setBtn); v.addEventListener('pause', setBtn);
      if ('IntersectionObserver' in w) {
        new IntersectionObserver(function (en) {
          en.forEach(function (x) { if (x.isIntersecting && !user) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else if (!x.isIntersecting) v.pause(); });
        }, { threshold: 0.15 }).observe(v);
      }
      setBtn();
    });
  }

  /* ---------- click-to-load embeds and videos (no third-party request before the click) ---------- */
  function initClickLoad() {
    d.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-clickload]');
      if (!b) return;
      e.preventDefault();
      var src = b.getAttribute('data-src'); if (!src) return;
      var f = d.createElement('iframe');
      f.src = src; f.title = b.getAttribute('data-title') || 'Embedded content'; f.loading = 'lazy';
      f.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture'; f.setAttribute('allowfullscreen', '');
      var box = b.closest('.clickload') || b;
      box.innerHTML = ''; box.appendChild(f);
    });
  }

  /* ---------- age gate (live copy; a 21+ birth-date check; storage may be blocked) ---------- */
  function initAgeGate() {
    var gate = d.querySelector('[data-agegate]');
    if (!gate) return;
    var ok = store.get('sb-age-ok') === '1';
    if (ok) { root.classList.remove('sb-gate'); return; }
    root.classList.add('sb-gate');
    var form = gate.querySelector('form'), msg = gate.querySelector('.agegate__text');
    var prev = d.activeElement;
    var first = gate.querySelector('input'); if (first) setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }, 60);
    gate.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('input, button, a[href]', gate); if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && d.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && d.activeElement === z) { e.preventDefault(); a.focus(); }
    });
    // numeric fields advance to the next when full
    $$('input', gate).forEach(function (inp, i, all) {
      inp.addEventListener('input', function () { inp.value = inp.value.replace(/[^0-9]/g, ''); if (inp.value.length >= (parseInt(inp.getAttribute('maxlength'), 10) || 2) && all[i + 1]) all[i + 1].focus(); });
    });
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = parseInt(form.elements.m.value, 10), dd = parseInt(form.elements.d.value, 10), y = parseInt(form.elements.y.value, 10);
      var now = new Date(), valid = m >= 1 && m <= 12 && dd >= 1 && dd <= 31 && y > 1900 && y <= now.getFullYear();
      var age = valid ? now.getFullYear() - y - ((now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < dd)) ? 1 : 0) : -1;
      if (age >= 21) {
        store.set('sb-age-ok', '1');
        root.classList.remove('sb-gate');
        if (prev && prev.focus && prev !== d.body) prev.focus();
      } else if (msg) {
        msg.classList.add('is-error'); msg.setAttribute('role', 'alert');
        var f = form.elements.m; if (f) f.focus();
      }
    });
  }

  function boot() {
    var steps = [initAgeGate, initReveals, initScroll, initTilt, initMagnetic, initMenus, initDrawer, initLoops, initClickLoad];
    steps.forEach(function (fn) { try { fn(); } catch (e) { if (w.console) console.error(e); } });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})();
