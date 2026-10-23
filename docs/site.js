/* Plinth site — behaviour. Every feature fails safe: no JS, no storage, no clipboard → the page still reads. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Entrance choreography: next frame so the initial state paints first.
  requestAnimationFrame(function () { requestAnimationFrame(function () { document.body.classList.add('is-ready'); }); });

  // Remember an explicit language choice (the auto-redirect in <head> never overrides it).
  document.querySelectorAll('[data-lang-key]').forEach(function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem(a.getAttribute('data-lang-key'), a.getAttribute('data-lang')); } catch (e) {}
    });
  });

  // ---- copy the prompt ----
  var toast = document.querySelector('.toast');
  var live = document.getElementById('live');
  var toastTimer;
  function announce(msg) {
    if (live) { live.textContent = ''; setTimeout(function () { live.textContent = msg; }, 40); }
    if (toast) {
      toast.querySelector('span').textContent = msg;
      toast.classList.add('is-on');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2200);
    }
  }
  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta); ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }
  function selectPrompt() {
    var pre = document.getElementById('prompt-text');
    if (!pre || !window.getSelection) return;
    var r = document.createRange(); r.selectNodeContents(pre);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    pre.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var busy = false;
    btn.addEventListener('click', function () {
      if (busy) return;                       // double-click → one copy, one toast
      busy = true;
      var src = document.getElementById(btn.getAttribute('data-copy'));
      var text = src ? src.textContent.trim() : '';
      var ok = function () {
        btn.classList.add('is-done');
        announce(btn.getAttribute('data-copied'));
        setTimeout(function () { btn.classList.remove('is-done'); busy = false; }, 1600);
      };
      var fail = function () {
        busy = false;
        selectPrompt();
        announce(btn.getAttribute('data-fail'));
      };
      if (!text) return fail();
      if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(ok, function () { legacyCopy(text) ? ok() : fail(); });
      } else {
        legacyCopy(text) ? ok() : fail();
      }
    });
  });

  // ---- "what your agent can push": tabs with a live stage ----
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  var auto = null, current = 0;
  function show(i, focus) {
    current = (i + tabs.length) % tabs.length;
    tabs.forEach(function (t, k) {
      var on = k === current;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute('aria-controls'));
      if (!p) return;
      if (on) { p.hidden = false; p.classList.remove('is-in'); void p.offsetWidth; p.classList.add('is-in'); }
      else { p.hidden = true; }
    });
    if (focus) tabs[current].focus();
  }
  function stopAuto() { if (auto) { clearInterval(auto); auto = null; } }
  if (tabs.length) {
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { stopAuto(); show(k); });
      t.addEventListener('keydown', function (e) {
        var d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (d) { e.preventDefault(); stopAuto(); show(current + d, true); }
        else if (e.key === 'Home') { e.preventDefault(); stopAuto(); show(0, true); }
        else if (e.key === 'End') { e.preventDefault(); stopAuto(); show(tabs.length - 1, true); }
      });
    });
    var stage = document.querySelector('.push');
    // Auto-cycle only while visible, never with reduced motion, stops forever on first interaction.
    if (!reduce && stage && 'IntersectionObserver' in window) {
      var touched = false;
      ['pointerdown', 'keydown', 'focusin'].forEach(function (ev) {
        stage.addEventListener(ev, function () { touched = true; stopAuto(); });
      });
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting && !touched && !auto) auto = setInterval(function () { show(current + 1); }, 3800);
        else if (!en[0].isIntersecting) stopAuto();
      }, { threshold: .4 }).observe(stage);
    }
  }

  // Timer panel: a real countdown, started when its panel is shown, paused otherwise.
  var timerEl = document.querySelector('[data-timer]');
  var timerBtn = document.querySelector('[data-timer-toggle]');
  if (timerEl) {
    var left = 25 * 60, running = true, tick;
    var fmt = function (s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
    tick = setInterval(function () {
      var panel = timerEl.closest('[role="tabpanel"]');
      if (!running || (panel && panel.hidden) || document.hidden) return;
      left = left > 0 ? left - 1 : 25 * 60;
      timerEl.textContent = fmt(left);
    }, 1000);
    if (timerBtn) timerBtn.addEventListener('click', function () {
      running = !running;
      timerBtn.textContent = running ? timerBtn.getAttribute('data-pause') : timerBtn.getAttribute('data-play');
      timerBtn.setAttribute('aria-pressed', running ? 'false' : 'true');
    });
  }
  // Widget panel: tap to nudge the progress (micro-feedback).
  var w = document.querySelector('[data-widget]');
  if (w) w.addEventListener('click', function () {
    var bar = w.querySelector('.bar i'), out = w.querySelector('[data-pct]');
    var v = parseFloat(bar.style.getPropertyValue('--v') || '0.4');
    v = v >= 1 ? 0.1 : Math.min(1, Math.round((v + 0.15) * 100) / 100);
    bar.style.setProperty('--v', v);
    if (out) out.textContent = Math.round(v * 100) + ' %';
  });

  // Scroll reveals.
  var reveals = document.querySelectorAll('[data-reveal]');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
