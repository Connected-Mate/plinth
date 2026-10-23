/* Plinth feedback log: public GitHub issues labelled agent-feedback, rendered client-side.
   No token: the unauthenticated REST API allows 60 requests/hour per IP, so responses are
   cached 10 minutes in localStorage and a rate-limited state is shown instead of an error.
   Every string from GitHub is inserted with textContent (never innerHTML). */
(function () {
  'use strict';
  var cfgEl = document.getElementById('logs-config');
  var root = document.querySelector('[data-logs]');
  if (!cfgEl || !root) return;
  var cfg;
  try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; }
  var T = cfg.t, lang = cfg.lang;
  var statusEl = root.querySelector('[data-logs-status]');
  var listEl = root.querySelector('[data-logs-list]');
  var KEY = 'plinth-logs-v1', TTL = 10 * 60 * 1000;
  var API = 'https://api.github.com/repos/' + cfg.repo + '/issues?state=all&sort=created&direction=desc&per_page=100&labels=' + encodeURIComponent(cfg.label);
  var KINDS = ['bug', 'missing', 'idea', 'other'];

  var dateFmt, timeFmt;
  try {
    dateFmt = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric' });
    timeFmt = new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    dateFmt = timeFmt = { format: function (d) { return d.toISOString().slice(0, 16).replace('T', ' '); } };
  }
  function fill(s, k, v) { return s.replace('{' + k + '}', v); }

  function readCache() {
    try { var c = JSON.parse(localStorage.getItem(KEY) || 'null'); return c && Array.isArray(c.items) ? c : null; } catch (e) { return null; }
  }
  function writeCache(items) {
    try { localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), items: items })); } catch (e) { /* storage full or blocked: fine */ }
  }

  // Keep only what we render: smaller cache, nothing private.
  function slim(raw) {
    return raw.filter(function (i) { return !i.pull_request; }).map(function (i) {
      var labels = (i.labels || []).map(function (l) { return typeof l === 'string' ? l : l.name; });
      return { n: i.number, t: i.title || '', u: i.html_url, c: i.created_at, s: i.state, k: kindOf(labels, i.body || ''), a: field(i.body || '', 'Agent kind') };
    });
  }
  function field(body, name) {
    var m = body.match(new RegExp('###\\s*' + name + '\\s*\\n+([^\\n#][^\\n]*)', 'i'));
    var v = m ? m[1].trim() : '';
    return /^_?no response_?$/i.test(v) ? '' : v.slice(0, 60);
  }
  function kindOf(labels, body) {
    for (var i = 0; i < labels.length; i++) {
      var m = /^kind:(bug|missing|idea)$/.exec(labels[i]);
      if (m) return m[1];
    }
    var f = field(body, 'Kind').toLowerCase();
    return KINDS.indexOf(f) > -1 ? f : 'other';
  }

  function el(tag, cls, text) {
    var x = document.createElement(tag);
    if (cls) x.className = cls;
    if (text != null) x.textContent = text;
    return x;
  }
  function setStatus(msg, retry) {
    statusEl.textContent = '';
    statusEl.appendChild(document.createTextNode(msg));
    if (retry) {
      var b = el('button', 'btn btn--ghost logs__retry', T.retry);
      b.type = 'button';
      b.addEventListener('click', function () { load(true); });
      statusEl.appendChild(document.createTextNode(' '));
      statusEl.appendChild(b);
    }
  }

  function render(items, at) {
    listEl.textContent = '';
    if (!items.length) { setStatus(T.empty); return; }
    var groups = {};
    items.forEach(function (i) { (groups[i.k] = groups[i.k] || []).push(i); });
    KINDS.forEach(function (k) {
      var g = groups[k];
      if (!g) return;
      g.sort(function (a, b) { return a.c < b.c ? 1 : -1; });
      var sec = el('section', 'logs__group');
      var id = 'kind-' + k;
      var h = el('h2', 'logs__h', T[k]);
      h.id = id;
      sec.setAttribute('aria-labelledby', id);
      h.appendChild(el('span', 'logs__n', ' ' + g.length));
      sec.appendChild(h);
      var ul = el('ul', 'logs__list');
      g.forEach(function (i) {
        var li = el('li', 'logs__item');
        var a = el('a', 'logs__title', i.t);
        a.href = /^https:\/\/github\.com\//.test(i.u) ? i.u : 'https://github.com/' + cfg.repo + '/issues/' + i.n;
        li.appendChild(a);
        var meta = el('p', 'logs__meta');
        var d = new Date(i.c);
        var time = el('time', null, isNaN(d) ? '' : dateFmt.format(d));
        time.dateTime = i.c;
        meta.appendChild(time);
        meta.appendChild(el('span', 'logs__state logs__state--' + (i.s === 'closed' ? 'closed' : 'open'), i.s === 'closed' ? T.closed : T.open));
        if (i.a) meta.appendChild(el('span', 'logs__agent', T.agent + ' · ' + i.a));
        meta.appendChild(el('span', 'logs__num', '#' + i.n));
        li.appendChild(meta);
        ul.appendChild(li);
      });
      sec.appendChild(ul);
      listEl.appendChild(sec);
    });
    setStatus((items.length === 1 ? T.count1 : fill(T.count, 'n', items.length)) + ' · ' + fill(T.updated, 'time', timeFmt.format(new Date(at))));
  }

  var busy = false;
  function load(force) {
    if (busy) return;
    var cache = readCache();
    if (!force && cache && Date.now() - cache.at < TTL) { render(cache.items, cache.at); return; }
    busy = true;
    if (!cache) setStatus(T.loading);
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 10000);
    fetch(API, { headers: { Accept: 'application/vnd.github+json' }, signal: ctrl ? ctrl.signal : undefined })
      .then(function (res) {
        clearTimeout(timer);
        if (res.status === 403 || res.status === 429) {
          var reset = parseInt(res.headers.get('x-ratelimit-reset') || '0', 10) * 1000 || Date.now() + 60 * 60 * 1000;
          var err = new Error('rate'); err.reset = reset; throw err;
        }
        if (!res.ok) throw new Error('http ' + res.status);
        return res.json();
      })
      .then(function (raw) {
        var items = slim(Array.isArray(raw) ? raw : []);
        writeCache(items);
        render(items, Date.now());
      })
      .catch(function (err) {
        clearTimeout(timer);
        var msg = err && err.message === 'rate' ? fill(T.limited, 'time', timeFmt.format(new Date(err.reset))) : T.error;
        if (cache) { render(cache.items, cache.at); msg += ' ' + fill(T.stale, 'time', timeFmt.format(new Date(cache.at))); }
        setStatus(msg, true);
      })
      .then(function () { busy = false; });
  }
  load(false);
})();
