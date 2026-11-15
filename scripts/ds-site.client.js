(function () {
  var root = document.body.getAttribute('data-root') || './';
  var html = document.documentElement;

  /* theme: explicit light or dark, remembered; with nothing stored the system wins */
  var btn = document.getElementById('theme');
  function current() {
    var t = html.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function label() {
    if (btn) btn.textContent = current() === 'dark' ? 'Light theme' : 'Dark theme';
  }
  if (btn) btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    try { localStorage.setItem('vy-theme', next); } catch {}
    label();
  });
  label();

  /* mobile menu */
  var menu = document.querySelector('.menu');
  if (menu) menu.addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open');
    menu.setAttribute('aria-expanded', String(open));
  });

  /* search: one JSON file, filtered here. No library, no request beyond that file. */
  var q = document.getElementById('q'), out = document.getElementById('results');
  var index = null, loading = false, sel = -1;
  function load(cb) {
    if (index) return cb();
    if (loading) return;
    loading = true;
    function viaScript() {
      var s = document.createElement('script');
      s.src = root + 'search-index.js';
      s.onload = function () { index = window.__VY_SEARCH || []; cb(); };
      document.head.appendChild(s);
    }
    if (location.protocol === 'file:') return viaScript();
    fetch(root + 'search-index.json').then(function (r) { return r.json(); })
      .then(function (j) { index = j; cb(); }, viaScript);
  }
  function score(e, terms) {
    var t = e.title.toLowerCase(), p = e.path.toLowerCase(), hs = e.headings.join(' \n ').toLowerCase(), s = 0;
    for (var i = 0; i < terms.length; i++) {
      var w = terms[i], hit = 0;
      if (t.indexOf(w) === 0) hit = 6; else if (t.indexOf(w) > -1) hit = 4;
      else if (hs.indexOf(w) > -1) hit = 2; else if (p.indexOf(w) > -1) hit = 1;
      if (!hit) return 0;
      s += hit;
    }
    return s;
  }
  function run() {
    var terms = q.value.toLowerCase().split(/\s+/).filter(Boolean);
    sel = -1;
    if (!terms.length) { out.hidden = true; return; }
    var hits = index.map(function (e) { return { e: e, s: score(e, terms) }; })
      .filter(function (x) { return x.s; })
      .sort(function (a, b) { return b.s - a.s; }).slice(0, 12);
    out.innerHTML = '';
    if (!hits.length) {
      var none = document.createElement('li'); none.className = 'none'; none.textContent = 'No pages match.'; out.appendChild(none);
    }
    hits.forEach(function (x) {
      var li = document.createElement('li'), a = document.createElement('a'), sm = document.createElement('small');
      a.href = root + x.e.path; a.textContent = x.e.title;
      var h = x.e.headings.filter(function (t) { return terms.some(function (w) { return t.toLowerCase().indexOf(w) > -1; }); })[0];
      sm.textContent = h ? h : x.e.path.replace(/\.html$/, '');
      a.appendChild(sm); li.appendChild(a); out.appendChild(li);
    });
    out.hidden = false;
  }
  if (q) {
    q.addEventListener('input', function () { load(run); });
    q.addEventListener('focus', function () { if (q.value) load(run); });
    q.addEventListener('keydown', function (ev) {
      var links = out.querySelectorAll('a');
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        ev.preventDefault();
        if (!links.length) return;
        if (sel > -1) links[sel].classList.remove('on');
        sel = (sel + (ev.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
        links[sel].classList.add('on');
      } else if (ev.key === 'Enter' && links.length) {
        location.href = links[sel > -1 ? sel : 0].href;
      } else if (ev.key === 'Escape') { out.hidden = true; q.blur(); }
    });
    document.addEventListener('click', function (ev) { if (!ev.target.closest('.search')) out.hidden = true; });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === '/' && document.activeElement !== q && !/input|textarea/i.test(document.activeElement.tagName)) {
        ev.preventDefault(); q.focus();
      }
    });
  }
})();

/* ---- live examples ------------------------------------------------------
   Two messages cross the frame, both same-origin:
     in   vy-specimen-height  measured inside, because an iframe has no
                              intrinsic height and a scrollbar around an
                              example reads as our bug
     out  vy-specimen-theme   this page's light/dark choice, forwarded, so the
                              example never disagrees with the page around it.
   The theme is sent when a frame first reports its height, which is also the
   proof that it is listening. */
(function () {
  var frames = document.querySelectorAll('iframe[data-specimen]');
  if (!frames.length) return;

  function tell(frame) {
    var t = document.documentElement.getAttribute('data-theme') || 'light';
    try { frame.contentWindow.postMessage({ type: 'vy-specimen-theme', theme: t }, location.origin); } catch (e) { void e; }
  }

  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin) return;
    var d = e.data;
    if (!d || d.type !== 'vy-specimen-height') return;
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow === e.source) {
        frames[i].style.height = d.height + 'px';
        tell(frames[i]);
      }
    }
  });

  var html = document.documentElement;
  new MutationObserver(function () {
    for (var i = 0; i < frames.length; i++) tell(frames[i]);
  }).observe(html, { attributes: true, attributeFilter: ['data-theme'] });
})();
