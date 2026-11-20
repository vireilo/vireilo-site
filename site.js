// Vireilo Ventures — nav state, mobile menu, scroll progress and scroll choreography.
(function () {
  var doc = document.documentElement;
  var nav = document.getElementById('nav');
  var bar = document.getElementById('progress');
  var btn = document.getElementById('menuBtn');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canWatch = 'IntersectionObserver' in window;
  if (!still && canWatch) doc.classList.add('js');

  var heroMain = document.querySelector('.hero-main');
  var verbs = [].slice.call(document.querySelectorAll('.verbs li'));
  var latin = document.querySelector('[data-latin]');
  var sections = [].slice.call(document.querySelectorAll('main section[id]'));
  var links = {};
  [].forEach.call(document.querySelectorAll('.nav-links a[href^="#"]'), function (a) { links[a.getAttribute('href').slice(1)] = a; });

  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    if (nav) nav.classList.toggle('scrolled', y > 24);
    if (bar) {
      var max = doc.scrollHeight - vh;
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
    if (still) return;
    // first screen eases back as the page moves on
    if (heroMain && y < vh) {
      var t = Math.min(y / (vh * 0.8), 1);
      heroMain.style.transform = 'translate3d(0,' + (y * 0.22).toFixed(1) + 'px,0) scale(' + (1 - t * 0.04).toFixed(4) + ')';
      heroMain.style.opacity = (1 - t * 0.85).toFixed(3);
    }
    // verbs light as they cross the middle of the screen
    for (var i = 0; i < verbs.length; i++) {
      verbs[i].classList.toggle('lit', verbs[i].getBoundingClientRect().top < vh * 0.64);
    }
    // the Latin word drifts sideways while its section is on screen
    if (latin) {
      var r = latin.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        var p = (r.top + r.height / 2) / vh - 0.5;
        latin.style.transform = 'translate3d(' + (-p * 4).toFixed(2) + '%,0,0)';
      }
    }
    // mark the section being read in the navigation
    var current = null;
    for (var j = 0; j < sections.length; j++) {
      if (sections[j].getBoundingClientRect().top < vh * 0.4) current = sections[j].id;
    }
    for (var id in links) {
      if (id === current) links[id].setAttribute('aria-current', 'true');
      else links[id].removeAttribute('aria-current');
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();

  if (!still && canWatch) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    [].forEach.call(document.querySelectorAll('[data-r],[data-line],[data-latin],[data-wipe]'), function (el) { io.observe(el); });
  }

  if (btn && nav) {
    function setOpen(open) {
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close' : 'Menu';
    }
    btn.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('.nav-links a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }
})();
