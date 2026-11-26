/*
 * Gravité : la mascotte coach, en pixel art violet.
 * Elle cligne des yeux, s'anime de temps en temps et parle dans une bulle,
 * avec une expression du visage adaptée à chaque phrase.
 */
window.GraviteCoach = (function () {
  'use strict';

  var C = { body: '#9d70ff', hi: '#c4a6ff', shade: '#6f43ea', eye: '#150a33', white: '#ffffff', blush: '#ff8cc6', heart: '#ff5fa2', sweat: '#8fd3ff' };
  function r(x, y, w, h, fill, cls) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"' + (cls ? ' class="' + cls + '"' : '') + '/>';
  }
  /* Dessine un élément à gauche et son reflet à droite (le corps va de x=2 à x=14). */
  function mir(x, y, w, h, fill) { return r(x, y, w, h, fill) + r(16 - x - w, y, w, h, fill); }

  var BODY =
    '<g class="m-legs">' + r(3, 7.6, 1, 2.6, C.body, 'm-leg m-leg-a') + r(5, 7.6, 1, 2.6, C.body, 'm-leg m-leg-b') +
    r(10, 7.6, 1, 2.6, C.body, 'm-leg m-leg-a') + r(12, 7.6, 1, 2.6, C.body, 'm-leg m-leg-b') + '</g>' +
    r(0, 3, 2, 2, C.body, 'm-arm m-arm-l') + r(14, 3, 2, 2, C.body, 'm-arm m-arm-r') +
    r(2, 0, 12, 8, C.body) + r(2, 0, 12, 1, C.hi) + r(2, 7, 12, 1, C.shade);

  function eyes(k) {
    var e = C.eye;
    switch (k) {
      case 'blink': return mir(4.5, 3.1, 2, 0.6, e);
      case 'arc': return mir(4, 3, 1, 1, e) + mir(5, 2, 1, 1, e) + mir(6, 3, 1, 1, e);
      case 'big': return mir(4.5, 1.6, 2, 2.4, e) + mir(5.6, 1.8, 0.7, 0.7, C.white);
      case 'wink': return r(4, 3, 1, 1, e) + r(5, 2, 1, 1, e) + r(6, 3, 1, 1, e) + r(10, 2, 1, 2, e);
      case 'closed': return mir(4.5, 3, 2, 0.6, e);
      case 'heart': return mir(4, 1.5, 1, 1, C.heart) + mir(6, 1.5, 1, 1, C.heart) + mir(4, 2.5, 3, 1, C.heart) + mir(5, 3.5, 1, 1, C.heart);
      case 'shades': return r(3.6, 2, 3.6, 1.8, e) + r(8.8, 2, 3.6, 1.8, e) + r(7.2, 2.3, 1.6, 0.6, e) + r(4, 2.3, 0.9, 0.5, C.white) + r(9.2, 2.3, 0.9, 0.5, C.white);
      case 'effort': return mir(4.5, 1.8, 1, 0.7, e) + mir(5.4, 2.5, 1, 0.7, e) + mir(4.5, 3.2, 1, 0.7, e);
      case 'down': return mir(5, 2.6, 1, 1.4, e);
      default: return mir(5, 2, 1, 2, e);
    }
  }
  function mouth(k) {
    var e = C.eye;
    switch (k) {
      case 'smile': return r(6, 5, 1, 1, e) + r(7, 6, 2, 1, e) + r(9, 5, 1, 1, e);
      case 'open': return r(6, 5, 4, 1, e) + r(6.5, 6, 3, 1, e) + r(7, 6.2, 2, 0.6, C.blush);
      case 'o': return r(7, 5, 2, 1.8, e);
      case 'flat': return r(6.5, 5.6, 3, 0.6, e);
      case 'frown': return r(6, 6, 1, 1, e) + r(7, 5, 2, 1, e) + r(9, 6, 1, 1, e);
      case 'talk1': return r(6.5, 5, 3, 1.8, e) + r(7, 6.1, 2, 0.6, C.blush);
      case 'talk2': return r(7, 5.4, 2, 0.8, e);
      default: return '';
    }
  }
  function brows(k) {
    var e = C.eye;
    if (k === 'angry') return mir(4.4, 0.7, 1.1, 0.5, e) + mir(5.4, 1.1, 1.1, 0.5, e);
    if (k === 'sad') return mir(4.4, 1.1, 1.1, 0.5, e) + mir(5.4, 0.7, 1.1, 0.5, e);
    return '';
  }
  function plus(x, y) { return r(x - 0.3, y - 1, 0.6, 2, C.white) + r(x - 1, y - 0.3, 2, 0.6, C.white); }
  function fx(k) {
    switch (k) {
      case 'spark': return '<g class="m-spark">' + plus(16.4, -1.6) + plus(-0.6, -1.2) + '</g>';
      case 'zzz': return '<g class="m-zzz"><text x="14.2" y="-0.4" font-size="2.8">z</text><text x="15.8" y="-2.2" font-size="3.4">Z</text></g>';
      case 'sweat': return '<g class="m-sweat">' + r(14.7, 0.4, 0.9, 1.4, C.sweat) + r(14.9, -0.1, 0.5, 0.6, C.sweat) + '</g>';
      case 'hearts': return '<g class="m-spark">' + r(15.2, -2.6, 0.8, 0.8, C.heart) + r(16.4, -2.6, 0.8, 0.8, C.heart) + r(15.2, -1.8, 2, 0.8, C.heart) + r(15.8, -1, 0.8, 0.7, C.heart) + '</g>';
      default: return '';
    }
  }

  /* Expressions : yeux, bouche, sourcils, joues et petits effets. */
  var MOODS = {
    neutral: { e: 'tall' },
    happy: { e: 'arc', m: 'smile', blush: 1 },
    excited: { e: 'big', m: 'open', fx: 'spark' },
    determined: { e: 'tall', m: 'flat', brow: 'angry' },
    surprised: { e: 'big', m: 'o' },
    wink: { e: 'wink', m: 'smile' },
    sleepy: { e: 'closed', m: 'flat', fx: 'zzz' },
    love: { e: 'heart', m: 'smile', blush: 1, fx: 'hearts' },
    cool: { e: 'shades', m: 'smile' },
    effort: { e: 'effort', m: 'flat', fx: 'sweat' },
    sad: { e: 'down', m: 'frown', brow: 'sad' },
    proud: { e: 'arc', m: 'open', blush: 1, fx: 'spark' }
  };
  var ANIMS = { hop: 700, wave: 1500, flex: 1500, shake: 520, celebrate: 1300, look: 1600, walk: 1300 };

  function create(opts) {
    opts = opts || {};
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* ignore */ }
    var el = document.createElement('div');
    el.className = 'mascot';
    el.innerHTML = '<button type="button" class="mascot-btn" aria-label="Ton coach : touche-le pour qu’il te parle">' +
      '<svg class="mascot-svg" viewBox="-1.6 -3.6 19.2 15" aria-hidden="true" shape-rendering="crispEdges">' + BODY +
      '<g class="m-face"></g><g class="m-fx"></g></svg></button>' +
      '<div class="mascot-bubble" role="status" aria-live="polite" hidden><span class="m-txt"></span></div>';
    var face = el.querySelector('.m-face'), fxl = el.querySelector('.m-fx');
    var bubble = el.querySelector('.mascot-bubble'), txt = el.querySelector('.m-txt');
    var st = { mood: 'neutral', base: 'neutral', talking: false, mouth: 'talk1', blink: false };
    var T = {};
    function clear(k) { clearTimeout(T[k]); clearInterval(T[k]); }

    function draw() {
      var M = MOODS[st.mood] || MOODS.neutral;
      var eyeKind = st.blink && /^(tall|big|down)$/.test(M.e) ? 'blink' : M.e;
      face.innerHTML = eyes(eyeKind) + brows(M.brow) + (M.blush ? mir(2.8, 4.6, 1.5, 0.8, C.blush) : '') + mouth(st.talking ? st.mouth : M.m);
      fxl.innerHTML = fx(M.fx);
    }
    function anim(name) {
      if (!name || !ANIMS[name] || reduce) return;
      Object.keys(ANIMS).forEach(function (a) { el.classList.remove('a-' + a); });
      void el.offsetWidth;
      el.classList.add('a-' + name);
      clear('anim');
      T.anim = setTimeout(function () { el.classList.remove('a-' + name); }, ANIMS[name]);
    }
    function hide() {
      clear('type'); clear('mouth'); clear('hide');
      st.talking = false;
      if (!bubble.hidden) {
        bubble.classList.add('out');
        T.out = setTimeout(function () { bubble.hidden = true; bubble.classList.remove('out'); }, 240);
      }
      clear('mood');
      T.mood = setTimeout(function () { st.mood = st.base; draw(); }, 500);
      draw();
    }
    /* Dit une phrase : texte, expression, animation. */
    function say(text, mood, a, o) {
      o = o || {};
      if (!text) return;
      ['type', 'mouth', 'hide', 'mood', 'out'].forEach(clear);
      st.mood = MOODS[mood] ? mood : 'happy';
      anim(a);
      bubble.hidden = false;
      bubble.classList.remove('out', 'in');
      void bubble.offsetWidth;
      bubble.classList.add('in');
      var i = 0;
      if (reduce) { txt.textContent = text; st.talking = false; }
      else {
        st.talking = true;
        txt.textContent = '';
        T.type = setInterval(function () {
          i = Math.min(text.length, i + 1);
          txt.textContent = text.slice(0, i);
          if (i >= text.length) { clear('type'); st.talking = false; draw(); }
        }, 24);
        T.mouth = setInterval(function () {
          if (!st.talking) { clear('mouth'); return; }
          st.mouth = st.mouth === 'talk1' ? 'talk2' : 'talk1';
          draw();
        }, 110);
      }
      T.hide = setTimeout(hide, o.hold || 2800 + text.length * 55);
      draw();
    }
    /* Expression et animation sans bulle, avec la bouche qui bouge pendant talkMs (visite guidée). */
    function express(mood, a, talkMs) {
      ['type', 'mouth', 'hide', 'mood', 'out'].forEach(clear);
      bubble.hidden = true;
      st.mood = MOODS[mood] ? mood : 'happy';
      anim(a);
      if (talkMs && !reduce) {
        st.talking = true;
        T.mouth = setInterval(function () { st.mouth = st.mouth === 'talk1' ? 'talk2' : 'talk1'; draw(); }, 110);
        T.type = setTimeout(function () { clear('mouth'); st.talking = false; draw(); }, talkMs);
      }
      draw();
    }
    function setBase(m) { st.base = MOODS[m] ? m : 'neutral'; if (!st.talking && bubble.hidden) { st.mood = st.base; draw(); } }

    // Clignements et petites animations quand il ne parle pas.
    function blinkLoop() {
      T.blink = setTimeout(function () {
        st.blink = true; draw();
        setTimeout(function () { st.blink = false; draw(); blinkLoop(); }, 130);
      }, 2400 + Math.random() * 3200);
    }
    function idleLoop() {
      T.idle = setTimeout(function () {
        if (!st.talking && bubble.hidden && document.visibilityState === 'visible' && el.isConnected) {
          var list = ['hop', 'wave', 'look', 'flex', 'walk'];
          anim(list[Math.floor(Math.random() * list.length)]);
        }
        idleLoop();
      }, 9000 + Math.random() * 9000);
    }

    el.querySelector('.mascot-btn').addEventListener('click', function (e) {
      e.stopPropagation();
      if (opts.onTap) opts.onTap(); else anim('hop');
    });
    bubble.addEventListener('click', function (e) { e.stopPropagation(); hide(); });

    draw();
    if (!reduce) { blinkLoop(); idleLoop(); }
    return { el: el, say: say, hide: hide, anim: anim, setBase: setBase, express: express, isTalking: function () { return st.talking || !bubble.hidden; } };
  }

  return { create: create, moods: Object.keys(MOODS) };
})();
