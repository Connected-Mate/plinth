/* Plinth site — "Choose your background".
   Every [data-bg-canvas] (the hero + the preview) cross-fades between Alex's backgrounds.
   The dotted grid stays the default. Images load only on demand (AVIF when the browser
   decodes it and it is the smaller file, else WebP), are decoded before the fade, and a
   stale or failed load never replaces the current background. Choice remembered in
   localStorage (try/catch: private mode or blocked storage just means no memory). */
(function () {
  'use strict';
  var cfgEl = document.getElementById('bg-config');
  if (!cfgEl) return;
  var cfg;
  try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; }
  var KEY = 'plinth-bg';
  var canvases = Array.prototype.slice.call(document.querySelectorAll('[data-bg-canvas]'));
  var famInputs = Array.prototype.slice.call(document.querySelectorAll('input[name="bg-family"]'));
  var variantsBox = document.querySelector('[data-bg-variants]');
  var swatches = document.querySelector('[data-bg-swatches]');
  var statusEl = document.querySelector('[data-bg-status]');
  var T = cfg.t;
  var byId = {}, famOf = {};
  cfg.families.forEach(function (f) {
    f.items.forEach(function (it, i) { byId[it.id] = it; famOf[it.id] = f; it.n = i + 1; });
  });

  var avifOK = null;
  function supportsAvif() {
    if (avifOK !== null) return Promise.resolve(avifOK);
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { avifOK = img.width > 0; resolve(avifOK); };
      img.onerror = function () { avifOK = false; resolve(false); };
      img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  }
  function urlFor(it) {
    return supportsAvif().then(function (ok) {
      var useAvif = ok && it.kb[0] <= it.kb[1];
      return cfg.base + it.id + (useAvif ? '.avif' : '.webp');
    });
  }
  function load(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () { (img.decode ? img.decode() : Promise.resolve()).then(resolve, resolve); };
      img.onerror = reject;
      img.src = url;
    });
  }

  function paint(url, tone) {
    canvases.forEach(function (c) {
      var layers = c.querySelectorAll('.bgfx i');
      if (layers.length < 2) return;
      var on = c.querySelector('.bgfx i.is-on');
      var next = on === layers[0] ? layers[1] : layers[0];
      if (url) {
        next.style.backgroundImage = 'url("' + url + '")';
        next.classList.add('is-on');
      }
      if (on) on.classList.remove('is-on');
      if (url) { c.setAttribute('data-tone', tone); c.classList.add('has-bg'); }
      else { c.removeAttribute('data-tone'); c.classList.remove('has-bg'); }
    });
  }
  function say(msg) {
    if (!statusEl) return;
    statusEl.textContent = '';
    setTimeout(function () { statusEl.textContent = msg; }, 30);
  }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  var token = 0, current = 'grid';
  function apply(id, opts) {
    opts = opts || {};
    var my = ++token;                       // rapid clicks: only the last one wins
    if (id === 'grid' || !byId[id]) {
      current = 'grid'; paint(null); save('grid');
      if (!opts.silent) say(T.bg_set.replace('{name}', T.bg_grid));
      return;
    }
    var it = byId[id], fam = famOf[id];
    canvases.forEach(function (c) { c.setAttribute('aria-busy', 'true'); });
    if (!opts.silent) say(T.bg_loading);
    urlFor(it).then(function (url) {
      return load(url).then(function () {
        if (my !== token) return;
        current = id; paint(url, it.tone); save(id);
        if (!opts.silent) say(T.bg_set.replace('{name}', fam.label[cfg.lang] + ' ' + it.n));
      });
    }).catch(function () {
      if (my !== token) return;
      say(T.bg_fail);
      syncInputs(current);                 // put the radios back on what is really shown
    }).then(function () {
      if (my === token) canvases.forEach(function (c) { c.removeAttribute('aria-busy'); });
    });
  }

  function renderSwatches(fam, selectedId) {
    if (!swatches || !variantsBox) return;
    swatches.textContent = '';
    if (!fam) { variantsBox.hidden = true; return; }
    variantsBox.hidden = false;
    fam.items.forEach(function (it) {
      var label = document.createElement('label');
      label.className = 'swatch';
      var input = document.createElement('input');
      input.type = 'radio'; input.name = 'bg-variant'; input.value = it.id;
      input.checked = it.id === selectedId;
      input.setAttribute('aria-label', fam.label[cfg.lang] + ' ' + it.n);
      var img = document.createElement('img');
      img.src = cfg.base + it.id + '-t.webp'; img.alt = ''; img.width = 56; img.height = 56;
      img.loading = 'lazy'; img.decoding = 'async';
      img.style.backgroundColor = it.avg;
      label.appendChild(input); label.appendChild(img);
      input.addEventListener('change', function () { if (input.checked) apply(it.id); });
      swatches.appendChild(label);
    });
  }
  function syncInputs(id) {
    var fam = byId[id] ? famOf[id] : null;
    famInputs.forEach(function (i) { i.checked = i.value === (fam ? fam.key : 'grid'); });
    renderSwatches(fam, id);
  }

  var lastInFamily = {};
  famInputs.forEach(function (input) {
    input.addEventListener('change', function () {
      if (!input.checked) return;
      if (input.value === 'grid') { renderSwatches(null); apply('grid'); return; }
      var fam = cfg.families.filter(function (f) { return f.key === input.value; })[0];
      if (!fam) return;
      var id = lastInFamily[fam.key] || fam.items[0].id;
      renderSwatches(fam, id);
      apply(id);
    });
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t && t.name === 'bg-variant' && t.checked && famOf[t.value]) lastInFamily[famOf[t.value].key] = t.value;
  });

  // Restore a previous choice; the grid stays the default for everyone else.
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved && byId[saved]) { syncInputs(saved); apply(saved, { silent: true }); }
})();
