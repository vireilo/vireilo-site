/* Arenthe Holdings — approved character system v5 (Gates A2 / B / C / D).
 *
 * Two controllers, no external animation runtime, no third-party requests:
 *
 *   HERO   the approved Gate C R2 performance. First visit plays the 10.00 s
 *          active sequence (door, walk, ball spin, double poof, single hidden
 *          swap, house spin, reaction, return, swirl) and then loops the 5.00 s
 *          living idle. Repeat visits open directly on the idle.
 *
 *   STORY  the approved Gate D R2 scroll choreography, driven purely by
 *          normalized scroll progress. Desktop/tablet use the desktop frame set
 *          (params); mobile widths use the independently authored mobile set
 *          (paramsMobile). Nothing accumulates, so it is reversible and correct
 *          after reload or history navigation.
 *
 * Both pause while offscreen. Neither ever displays char-full.webp or the
 * neutral reference: every frame is a render of the approved layered rig.
 */
(function () {
  'use strict';

  /* Tell js/main.js that the character is owned here. main.js keeps the copy
   * entrances and section reveals and leaves the caricature alone — the same
   * handshake the previous rig used, so no change to main.js is required. */
  window.__rigActive = true;

  var BASE = 'assets/char/';
  var ASSET_VER = '?v=7';
  var FPS = 24, FRAME_MS = 1000 / 24;   // v6: generated at 24 frames a second
  var HERO_ACTIVE = 182;          // entrance through the door, 7.6 s
  var HERO_TRICK = 124;           // basketball becomes a house, 5.2 s
  /* Entrance frames carry the door, so they are wider than the others. Every
   * hero frame is painted onto one canvas of the wide size; the narrower sets
   * are drawn at an offset so the character never shifts between them. */
  var WIDE_W = 729, WIDE_OFF = 175;
  var HERO_IDLE = 123;            // 5.1 s loop
  /* v6 interim: the new entrance performance is not produced yet, so the hero
   * opens on the living idle. Set to true once assets/char-v6/entrance exists. */
  var HAS_ENTRANCE = true;
  /* The scroll scene plays the entrance and then the trick, end to end. */
  var STORY_D = HERO_ACTIVE + HERO_TRICK, STORY_M = STORY_D;
  var MOBILE_Q = '(max-width: 700px)';
  var SEEN_KEY = 'arenthe.heroSeen';

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* Session memory: a repeat visit is one where the entrance has already played
   * in this browsing session. Falls back silently if storage is unavailable. */
  function heroSeen() {
    try { return sessionStorage.getItem(SEEN_KEY) === '1'; } catch (e) { return false; }
  }
  function markHeroSeen() {
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
  }

  /* A tiny frame cache. Images are decoded once and reused, so scrubbing back
   * and forth never re-decodes. */
  function FrameSet(dir, prefix, count, width) {
    this.urls = [];
    this.img = [];
    this.loaded = 0;
    for (var i = 0; i < count; i++) {
      this.urls.push(BASE + dir + '/' + prefix + pad(i, width) + '.webp' + ASSET_VER);
    }
  }
  FrameSet.prototype.load = function (from, to, done) {
    var self = this, pending = 0, fired = false;
    from = from || 0; to = (to === undefined) ? this.urls.length : to;
    for (var i = from; i < to; i++) {
      if (this.img[i]) continue;
      pending++;
      (function (k) {
        var im = new Image();
        im.decoding = 'async';
        im.onload = im.onerror = function () {
          self.img[k] = im; self.loaded++;
          if (--pending === 0 && !fired) { fired = true; done && done(); }
        };
        im.src = self.urls[k];
      })(i);
    }
    if (pending === 0 && !fired) { fired = true; done && done(); }
  };
  /* Resolve once frame i is decoded and safe to paint. Never rejects: a decode
   * failure leaves whatever is on screen, which is the poster. */
  FrameSet.prototype.decoded = function (i, cb) {
    var im = this.img[i];
    if (im && im.decode) { im.decode().then(cb, cb); return; }
    cb();
  };
  FrameSet.prototype.src = function (i) {
    i = clamp(i | 0, 0, this.urls.length - 1);
    return (this.img[i] && this.img[i].src) || this.urls[i];
  };

  /* Motion table: how far the drawing moves between each pair of frames,
   * measured offline (assets/char/motion.json). Slow passages are blended
   * between frames at the display's refresh rate, so breathing, settles and
   * scroll scrubbing read as continuous motion. Fast actions keep their drawn
   * poses: blending two distant drawings produces a double image, not motion. */
  var MOTION = null;
  (function () {
    try {
      var x = new XMLHttpRequest();
      x.open('GET', BASE + 'motion.json' + ASSET_VER, true);
      x.onload = function () { try { MOTION = JSON.parse(x.responseText); MOTION.story = (MOTION.entrance || []).concat(MOTION.trick || []); } catch (e) {} };
      x.send();
    } catch (e) {}
  })();
  var BLEND_LO = 1.0, BLEND_HI = 3.5;

  /* Paints a frame set onto a canvas at a fractional position. Falls back to
   * swapping the <img> source if a canvas is unavailable. */
  function Painter(img, dir) {
    this.img = img; this.dir = dir; this.cv = null; this.ctx = null; this.live = false;
    this.wide = false; this.under = null; this.underAlpha = 0;
    try {
      var cv = document.createElement('canvas');
      var ctx = cv.getContext && cv.getContext('2d');
      if (ctx) {
        cv.className = img.className;
        cv.setAttribute('aria-hidden', 'true');
        this.cv = cv; this.ctx = ctx;
      }
    } catch (e) {}
  }
  Painter.prototype.ready = function (im) { return im && im.complete && im.naturalWidth > 0; };
  Painter.prototype.paint = function (set, pos, loop, dir) {
    var n = set.urls.length;
    var i = Math.floor(pos), t = pos - i;
    if (loop) i = ((i % n) + n) % n; else if (i >= n - 1) { i = n - 1; t = 0; }
    var j = loop ? (i + 1) % n : Math.min(i + 1, n - 1);
    var a = set.img[i], b = set.img[j];
    if (!this.ready(a)) return false;
    if (!this.ctx) {                      // fallback: nearest frame on the <img>
      var src = set.src(t >= 0.5 ? j : i);
      if (this.img.getAttribute('src') !== src) this.img.src = src;
      return true;
    }
    var cv = this.cv, ctx = this.ctx;
    var cw = this.wide ? WIDE_W : a.naturalWidth;
    var ox = (this.wide && a.naturalWidth < WIDE_W) ? WIDE_OFF : 0;
    if (cv.width !== cw || cv.height !== a.naturalHeight) {
      cv.width = cw; cv.height = a.naturalHeight;
    }
    if (!this.live) {
      this.img.parentNode.insertBefore(cv, this.img.nextSibling);
      this.img.style.display = 'none';
      this.live = true;
    }
    // how much of the gap between these two drawings may be blended
    var d = (MOTION && MOTION[dir || this.dir] && MOTION[dir || this.dir][i]) || 0;
    var w = MOTION ? clamp(1 - (d - BLEND_LO) / (BLEND_HI - BLEND_LO), 0, 1) : 0;
    var h = 0.5 * w;
    var k = h < 0.01 ? (t >= 0.5 ? 1 : 0) : clamp((t - (0.5 - h)) / (2 * h), 0, 1);
    if (!this.ready(b)) k = 0;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, cv.width, cv.height);
    var under = (this.under && this.underAlpha > 0.004 && this.ready(this.under)) ? this.under : null;
    if (!under) {
      if (k <= 0.001) { ctx.drawImage(a, ox, 0); return true; }
      if (k >= 0.999) { ctx.drawImage(b, ox, 0); return true; }
      ctx.globalAlpha = 1 - k; ctx.drawImage(a, ox, 0);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = k; ctx.drawImage(b, ox, 0);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      return true;
    }
    // with a layer underneath (the door as it fades), draw the nearest frame over it
    ctx.globalAlpha = this.underAlpha; ctx.drawImage(under, 0, 0);
    ctx.globalAlpha = 1; ctx.drawImage(k >= 0.5 ? b : a, ox, 0);
    return true;
  };

  /* ------------------------------------------------------------------ HERO */
  function initHero() {
    var box = document.getElementById('heroChar');
    if (!box) return null;
    var skip = document.getElementById('skipIntro');
    /* The poster is already in the markup with a real src and explicit
     * dimensions, so the hero is painted before this script runs at all. Adopt
     * it as the display element; if it is somehow absent, build an equivalent. */
    var img = document.getElementById('heroPoster');
    if (!img) {
      img = document.createElement('img');
      img.className = 'char-frame';
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      img.decoding = 'async';
      img.width = 470; img.height = 465;
      img.src = BASE + 'door.webp' + ASSET_VER;
      box.appendChild(img);
    }
    box.classList.add('rig-on');

    var legacy = document.getElementById('charLegacy');
    if (legacy && legacy.parentNode) legacy.parentNode.removeChild(legacy);

    var idle = new FrameSet('idle', 'i', HERO_IDLE, 3);
    var entrance = null;
    var state = { mode: 'rest', i: 0, timer: 0, visible: true, done: false };

    var painter = new Painter(img, 'idle');
    painter.wide = true;
    var trick = new FrameSet('trick', 't', HERO_TRICK, 3);
    var door = new Image(); door.decoding = 'async';
    function show(set, pos, loop, dir) { painter.paint(set, pos, loop, dir); }
    function stop() { if (state.timer) { cancelAnimationFrame(state.timer); state.timer = 0; } }

    function runIdle() {
      state.mode = 'idle';
      stop();
      idle.load(0, HERO_IDLE, function () {
        if (state.mode !== 'idle') return;
        show(idle, state.i % HERO_IDLE, true, 'idle');
        if (reduced || !state.visible) return;
        var t0 = performance.now() - state.i * FRAME_MS;
        (function tick(now) {
          if (state.mode !== 'idle') return;
          var pos = ((now - t0) / FRAME_MS) % HERO_IDLE;
          state.i = pos;
          show(idle, pos, true, 'idle');
          state.timer = requestAnimationFrame(tick);
        })(performance.now());
      });
    }

    function finishToIdle() {
      state.done = true;
      markHeroSeen();
      if (skip) skip.hidden = true;
      state.i = 0;
      runIdle();
      /* Release the entrance. It is 120 decoded bitmaps — by far the largest
       * block the page holds — and it can never play again this session. The
       * frame currently on screen stays alive through the <img> itself. */
      if (entrance) { entrance.img.length = 0; entrance = null; }
    }

    /* The trick: the ball goes up, a puff, a house comes down. The door stays
     * for a beat as its own layer, then fades while he performs. */
    function runTrick() {
      state.mode = 'trick';
      state.i = 0;
      var last = performance.now();
      (function tick(now) {
        if (state.mode !== 'trick') return;
        var dt = Math.min(now - last, 100); last = now;
        var next = state.i + dt / FRAME_MS;
        var need = trick.img[Math.min(Math.floor(next) + 1, HERO_TRICK - 1)];
        if (state.visible && need && need.complete) state.i = next;
        painter.under = door;
        painter.underAlpha = clamp(1 - (state.i - 8) / 30, 0, 1);
        if (state.i >= HERO_TRICK - 1) { painter.under = null; show(trick, HERO_TRICK - 1, false, 'trick'); stop(); finishToIdle(); return; }
        show(trick, state.i, false, 'trick');
        state.timer = requestAnimationFrame(tick);
      })(last);
    }

    function runEntrance() {
      state.mode = 'entrance';
      if (skip) skip.hidden = false;
      entrance = new FrameSet('entrance', 'e', HERO_ACTIVE, 3);
      // only the opening second is required before we start; the rest streams in
      /* Load only the opening buffer, then hold the poster until frame 0 has
       * decoded. The remaining frames stream in behind the playhead — the
       * poster is never hidden waiting for all 120. */
      entrance.load(0, 14, function () {
        if (state.mode !== 'entrance') return;
        entrance.decoded(0, function () {
        if (state.mode !== 'entrance') return;
        entrance.load(14, HERO_ACTIVE);
        trick.load(0, HERO_TRICK);
        door.src = BASE + 'door.webp' + ASSET_VER;
        idle.load(0, 6);
        state.i = 0;
        var last = performance.now();
        (function tick(now) {
          if (state.mode !== 'entrance' || !entrance) return;
          var dt = Math.min(now - last, 100); last = now;
          var next = state.i + dt / FRAME_MS;
          // hold the playhead if the frame it needs has not streamed in yet
          var need = entrance.img[Math.min(Math.floor(next) + 1, HERO_ACTIVE - 1)];
          if (state.visible && need && need.complete) state.i = next;
          if (state.i >= HERO_ACTIVE - 1) { show(entrance, HERO_ACTIVE - 1, false, 'entrance'); stop(); runTrick(); return; }
          show(entrance, state.i, false, 'entrance');
          state.timer = requestAnimationFrame(tick);
        })(last);
        });
      });
    }

    /* Abandoning the entrance must resolve to the final layered state, never to
     * a half-played pose. */
    function resolveNow() {
      if (state.mode === 'entrance' || state.mode === 'trick') { stop(); painter.under = null; finishToIdle(); }
    }

    if (skip) skip.addEventListener('click', resolveNow);

    var io = new IntersectionObserver(function (es) {
      var vis = es[0].isIntersecting;
      state.visible = vis;
      if (!vis) {
        stop();
        if (state.mode === 'entrance' || state.mode === 'trick') resolveNow();   // scrolled away mid-entrance
      } else if (state.mode === 'idle' && !state.timer && !reduced) {
        runIdle();                                     // resume only idle motion
      }
    }, { threshold: 0.05 });
    io.observe(box);

    if (reduced) {
      if (skip) skip.hidden = true;
      idle.load(0, 1, function () { show(idle, 0, false, 'idle'); }); markHeroSeen(); return { state: state };
    }
    /* Gate E R2: the complete approved Gate C performance plays on every normal
     * load and reload. (It previously played once per session.) */
    if (HAS_ENTRANCE) runEntrance(); else { if (skip) skip.hidden = true; runIdle(); }

    window.addEventListener('pagehide', stop);
    return { state: state, resolveNow: resolveNow, box: box, img: img };
  }

  /* ----------------------------------------------------------------- STORY */
  function initStory() {
    var section = document.getElementById('transform');
    var box = document.getElementById('tChar');
    if (!section || !box) return null;

    var base = document.getElementById('tCharBase');
    if (base && base.parentNode) base.parentNode.removeChild(base);
    var anchor = document.getElementById('tAnchor');
    if (anchor && anchor.parentNode) anchor.parentNode.removeChild(anchor);

    var img = document.createElement('img');
    img.className = 'char-frame';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.decoding = 'async';
    img.src = BASE + 'door.webp' + ASSET_VER;
    box.appendChild(img);
    box.classList.add('rig-on');

    var mq = window.matchMedia ? window.matchMedia(MOBILE_Q) : { matches: false };
    var combo = new FrameSet('entrance', 'e', HERO_ACTIVE, 3);
    combo.urls = combo.urls.concat(new FrameSet('trick', 't', HERO_TRICK, 3).urls);
    var sets = { desk: combo, mob: combo };
    var door = new Image(); door.decoding = 'async'; door.src = BASE + 'door.webp' + ASSET_VER;
    var lines = ['tLine1', 'tLine2', 'tLine3'].map(function (id) {
      return document.getElementById(id);
    });
    /* Copy beats. `.tline` is absolutely positioned — all three occupy the same
     * coordinates inside one fixed stage — so a beat that never fades out will
     * sit underneath the next headline. Each beat therefore has an explicit in
     * AND out, and an inactive beat is hidden outright rather than left at
     * opacity 0 on top of its successor. */
    var BEAT_D = [0.10, 0.56, 0.80], BEAT_M = [0.10, 0.56, 0.80];
    var T = 0.06;                      // 6% of the timeline per transition

    /* Sequential with a half-transition overlap: beat i is on its way out while
     * beat i+1 arrives, so at most TWO are ever partially visible and never
     * three. The last beat holds to the end of the section. */
    function beatOpacity(starts, i, p) {
      var inA = starts[i], inB = inA + T;
      var outA = (i < starts.length - 1) ? starts[i + 1] - T * 0.5 : Infinity;
      if (p < inA) return 0;
      if (p < inB) return (p - inA) / T;
      if (p < outA) return 1;
      if (p < outA + T) return 1 - (p - outA) / T;
      return 0;
    }

    var st = { active: false, raf: 0, last: -1, loaded: false, pos: -1 };
    var painter = new Painter(img, 'story');
    painter.wide = true;

    function which() { return mq.matches ? 'mob' : 'desk'; }
    function count() { return which() === 'mob' ? STORY_M : STORY_D; }

    /* progress is read from layout every time — never integrated or remembered,
     * so reload and history navigation land on the identical state */
    function progress() {
      var r = section.getBoundingClientRect();
      var span = r.height - window.innerHeight;
      if (span <= 0) return 0;
      return clamp(-r.top / span, 0, 1);
    }

    function apply() {
      st.raf = 0;
      if (!st.active) return;
      var p = progress();
      var set = sets[which()];
      var n = count();
      /* The playhead eases toward the scroll position instead of jumping to it,
       * and lands between frames, so the scrub glides at any scroll speed. */
      var target = clamp(p * (n - 1), 0, n - 1);
      if (st.pos < 0 || st.set !== which() || reduced) st.pos = target;
      else st.pos += (target - st.pos) * 0.16;
      if (Math.abs(target - st.pos) < 0.004) st.pos = target;
      st.set = which();
      var key = which() + st.pos.toFixed(3);
      if (key !== st.last) {
        // past the entrance the door is its own layer, fading while he performs
        painter.under = door;
        painter.underAlpha = st.pos >= HERO_ACTIVE - 1 ? clamp(1 - (st.pos - HERO_ACTIVE - 6) / 30, 0, 1) : 0;
        if (painter.paint(set, st.pos, false, 'story')) st.last = key;
      }
      if (st.pos !== target && !st.raf) st.raf = requestAnimationFrame(apply);
      var starts = which() === 'mob' ? BEAT_M : BEAT_D;
      for (var i = 0; i < 3; i++) {
        var el = lines[i];
        if (!el) continue;
        var o = reduced ? 1 : beatOpacity(starts, i, p);
        var on = o > 0.004;
        // snap below the visibility threshold to exactly 0: a beat that has
        // finished must read 0, not a 0.002 residue of the fade curve
        el.style.opacity = on ? o.toFixed(3) : '0';
        el.style.visibility = on ? 'visible' : 'hidden';
        el.style.pointerEvents = 'none';
        if (reduced) { el.style.transform = 'none'; }
        else if (!on) { el.style.transform = 'translateY(18px)'; }
        else {
          // arriving: rises from below and settles.  leaving: drifts upward.
          var arriving = p < starts[i] + T;
          el.style.transform = 'translateY(' +
            (arriving ? (1 - o) * 18 : -(1 - o) * 14).toFixed(1) + 'px)';
        }
      }
      st.beats = [beatOpacity(starts, 0, p), beatOpacity(starts, 1, p),
                  beatOpacity(starts, 2, p)];
      st.p = p;
    }
    function onScroll() { if (!st.raf) st.raf = requestAnimationFrame(apply); }

    function ensureLoaded() {
      if (st.loaded) return;
      st.loaded = true;
      sets[which()].load(0, count(), apply);
    }

    /* defer the story frames until the section is near the viewport */
    var near = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { ensureLoaded(); near.disconnect(); }
    }, { rootMargin: '2000px 0px' });
    near.observe(section);

    var io = new IntersectionObserver(function (es) {
      var was = st.active;
      st.active = es[0].isIntersecting;
      if (st.active) { ensureLoaded(); if (!was) { st.last = -1; apply(); } }
    }, { threshold: 0 });
    io.observe(section);

    if (reduced) {
      img.src = BASE + 'rest.webp' + ASSET_VER; box.classList.add('rest');
      for (var i = 0; i < 3; i++) if (lines[i]) { lines[i].style.opacity = 1; lines[i].style.transform = 'none'; }
      return { state: st };
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { st.last = -1; st.loaded = false; ensureLoaded(); onScroll(); }, { passive: true });
    if (mq.addEventListener) mq.addEventListener('change', function () { st.last = -1; st.loaded = false; ensureLoaded(); apply(); });
    window.addEventListener('pageshow', function () { st.last = -1; apply(); });
    apply();
    return { state: st, apply: apply, progress: progress, which: which, sets: sets };
  }

  var booted = false;
  function boot() {
    if (booted) return;                 // never initialise twice: a duplicated
    booted = true;                      // include or a re-fired ready event
    document.documentElement.classList.add('char-v5');
    var hero = null, story = null;
    try { hero = initHero(); } catch (e) {}
    try { story = initStory(); } catch (e) {}
    window.__arentheChar = { hero: hero, story: story, reduced: reduced };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
