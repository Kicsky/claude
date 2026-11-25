/* Gravité : application de calisthenics. Aucune dépendance. */
(function () {
  'use strict';

  var D = window.GRAVITE_DATA;
  var FAM = {}; D.FAMILIES.forEach(function (f) { FAM[f.id] = f; });
  var EXM = {}; D.EX.forEach(function (e) { EXM[e.id] = e; });

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var fmtInt = function (n) { return new Intl.NumberFormat('fr-FR').format(Math.round(n)); };
  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* ignore */ }

  /* ================= Dates ================= */
  var DAY = 864e5;
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var dayKey = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var startOfDay = function (d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
  var addDays = function (d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; };
  var weekStart = function (d) { var s = startOfDay(d); s.setDate(s.getDate() - ((s.getDay() + 6) % 7)); return s; };
  var daysBetween = function (a, b) { return Math.round((startOfDay(b) - startOfDay(a)) / DAY); };
  var fmtDate = function (d, o) { return new Intl.DateTimeFormat('fr-FR', o).format(d); };
  var DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  /* ================= Icônes ================= */
  function svg(body) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }
  var I = {
    home: svg('<path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.2v-5.8H9.2v5.8H5A1.5 1.5 0 0 1 3.5 19z"/>'),
    plan: svg('<rect x="3.5" y="4.5" width="17" height="16" rx="3"/><path d="M8 2.8v3.4M16 2.8v3.4M3.5 9.5h17M8 13.5h3M8 17h6"/>'),
    chart: svg('<path d="M4 20.5h16"/><rect x="5.5" y="11" width="3.2" height="7" rx="1"/><rect x="10.4" y="6.5" width="3.2" height="11.5" rx="1"/><rect x="15.3" y="3.5" width="3.2" height="14.5" rx="1"/>'),
    user: svg('<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1.2-4 4.1-6 7.5-6s6.3 2 7.5 6"/>'),
    play: svg('<path d="M8 5.2v13.6a.8.8 0 0 0 1.2.7l11-6.8a.8.8 0 0 0 0-1.4l-11-6.8A.8.8 0 0 0 8 5.2z" fill="currentColor" stroke="none"/>'),
    check: svg('<path d="M5 12.5l4.5 4.5L19 7.5" stroke-width="2.6"/>'),
    close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    flame: svg('<path d="M12 2.8c.6 3.3 5.2 5.4 5.2 10.4A5.2 5.2 0 0 1 6.8 13.4c0-2.3 1.1-3.9 2.5-5.1.2 1.7.9 2.8 2 3.3-.5-2.9-.2-5.9.7-8.8z" fill="currentColor" stroke="none"/>'),
    trophy: svg('<path d="M8 4.5h8v5a4 4 0 0 1-8 0z"/><path d="M8 6.5H5.5a2.5 2.5 0 0 0 2.7 3.6M16 6.5h2.5a2.5 2.5 0 0 1-2.7 3.6M12 13.5V17M8.5 20.5h7M9.5 17h5v3.5h-5z"/>'),
    star: svg('<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" fill="currentColor" stroke="none"/>'),
    lock: svg('<rect x="5.5" y="10.5" width="13" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
    timer: svg('<circle cx="12" cy="13.5" r="7"/><path d="M12 13.5V10M9.5 2.8h5M18.5 7l1.3-1.3"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    minus: svg('<path d="M5 12h14"/>'),
    chevR: svg('<path d="m9.5 6 6 6-6 6"/>'),
    bolt: svg('<path d="M13 2.8 5.5 13.5h5.5l-1 7.7 7.5-10.7H12z" fill="currentColor" stroke="none"/>'),
    quote: svg('<path d="M10 7.5H6.5A1.5 1.5 0 0 0 5 9v3.5A1.5 1.5 0 0 0 6.5 14H9v.5c0 1.4-.9 2.5-2.5 3M19 7.5h-3.5A1.5 1.5 0 0 0 14 9v3.5a1.5 1.5 0 0 0 1.5 1.5H18v.5c0 1.4-.9 2.5-2.5 3"/>'),
    cloud: svg('<path d="M7 18.5a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 9.8a4.4 4.4 0 0 1-.5 8.7z"/>'),
    device: svg('<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>'),
    skip: svg('<path d="M5.5 5.5v13l9-6.5zM18.5 5.5v13"/>'),
    info: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>'),
    refresh: svg('<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4.2h-4.2"/>'),
    copy: svg('<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 8.5V6A2.5 2.5 0 0 0 13 3.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>'),
    trash: svg('<path d="M4.5 6.5h15M9.5 6.5V4h5v2.5M6.5 6.5l1 13h9l1-13"/>'),
    target: svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12h.01" stroke-width="3"/>'),
    up: svg('<path d="M12 19V5M6 11l6-6 6 6"/>'),
    easy: svg('<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14c1 1.5 2.1 2.2 3.5 2.2s2.5-.7 3.5-2.2"/><path d="M9 9.5h.01M15 9.5h.01" stroke-width="2.8"/>'),
    ok: svg('<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14.5h7"/><path d="M9 9.5h.01M15 9.5h.01" stroke-width="2.8"/>'),
    hard: svg('<circle cx="12" cy="12" r="8.5"/><path d="M8.5 16c1-1.4 2.1-2 3.5-2s2.5.6 3.5 2M8.5 9l1.8 1M15.5 9l-1.8 1"/>')
  };

  /* Pictogrammes des familles (silhouettes au trait). */
  function pic(body) {
    return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }
  var PIC_BODY = {
    push: '<path d="M3 26h26" stroke-opacity=".3"/><circle cx="6.8" cy="13" r="2.6"/><path d="M10 15.2 28 23.6M10.6 15.4v10"/>',
    pull: '<path d="M3.5 4.5h25"/><path d="M10.5 4.5 13.4 12.2M21.5 4.5 18.6 12.2M13.4 12.2h5.2M16 12.2V21M16 21l-2.4 7M16 21l2.4 7"/><circle cx="16" cy="8.6" r="2.3"/>',
    legs: '<path d="M3 27.5h26" stroke-opacity=".3"/><circle cx="11" cy="6.4" r="2.6"/><path d="M12 9.6 15.2 18h7.6l-1 8.8M13 12.4h9.5"/>',
    core: '<path d="M3 26h26" stroke-opacity=".3"/><circle cx="6.6" cy="15.4" r="2.6"/><path d="M10.4 17.6 28 23.6M10.4 17.6v6.6h-5"/>',
    atr: '<path d="M3 28.2h26" stroke-opacity=".3"/><path d="M12.4 27.6 14 19.6M19.6 27.6 18 19.6M14 19.6h4M16 19.6v-9.2M16 10.4 14.6 3.4M16 10.4l1.4-7"/><circle cx="16" cy="23.4" r="2.2"/>'
  };
  var PIC = {}; Object.keys(PIC_BODY).forEach(function (k) { PIC[k] = pic(PIC_BODY[k]); });

  function picto(f, cls) {
    return '<span class="picto ' + (cls || '') + '" style="--fc:' + FAM[f].color + '">' + PIC[f] + '</span>';
  }
  var BRAND = '<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="bmg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b993ff"/><stop offset="1" stop-color="#5b2fe0"/></linearGradient></defs><rect width="40" height="40" rx="12" fill="url(#bmg)"/><g transform="translate(4 3)" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' + PIC_BODY.atr.replace('stroke-opacity=".3"', 'stroke-opacity=".45"') + '</g></svg>';

  function emblem(i) {
    return '<svg class="rank-emblem" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="emb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4bcff"/><stop offset="1" stop-color="#5b2fe0"/></linearGradient></defs>' +
      '<path d="M32 3 57 17.5v29L32 61 7 46.5v-29z" fill="url(#emb)"/><path d="M32 10 51 21v22L32 54 13 43V21z" fill="#140b30" fill-opacity=".55"/>' +
      '<text x="32" y="39.5" text-anchor="middle" font-family="Archivo, Arial Black, sans-serif" font-weight="900" font-size="19" fill="#fff">' + (i + 1) + '</text></svg>';
  }
  function badgeIcon(on) {
    if (on) {
      return '<svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="bdg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d0b6ff"/><stop offset="1" stop-color="#6a3bf0"/></linearGradient></defs><circle cx="20" cy="20" r="17" fill="url(#bdg)"/><circle cx="20" cy="20" r="12.5" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.5"/><path d="m20 12 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z" fill="#fff"/></svg>';
    }
    return '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#ffffff" fill-opacity=".04" stroke="#cebeff" stroke-opacity=".2" stroke-width="1.5"/><g transform="translate(12 11)" fill="none" stroke="#8a82a8" stroke-width="1.8" stroke-linecap="round"><rect x="2.5" y="8" width="11" height="8.5" rx="2"/><path d="M5 8V6a3 3 0 0 1 6 0v2"/></g></svg>';
  }

  /* ================= État & sauvegarde ================= */
  var KEY = 'gravite.v1';
  var RESUME_KEY = 'gravite.seance';

  function blankState() {
    return {
      v: 1, createdAt: Date.now(), updatedAt: 0, onboarded: false,
      profile: { name: '', goal: 'muscle', days: 3, bar: true, sound: true },
      prog: { push: 'pompes', pull: 'rowing-australien', legs: 'squats', core: 'planche', atr: 'pompes-pike' },
      targets: {}, xp: 0, rot: 0,
      totals: { sessions: 0, reps: 0, secs: 0 },
      history: [], unlocks: [], badges: {}, prs: {}
    };
  }
  function normalize(s) {
    if (!s || typeof s !== 'object' || !s.profile) return null;
    var b = blankState();
    var out = Object.assign(b, s);
    out.profile = Object.assign(blankState().profile, s.profile || {});
    if (!D.GOALS[out.profile.goal]) out.profile.goal = 'muscle';
    if (!D.WEEK_PLANS[out.profile.days]) out.profile.days = 3;
    out.prog = Object.assign(blankState().prog, s.prog || {});
    Object.keys(out.prog).forEach(function (f) { if (!EXM[out.prog[f]]) out.prog[f] = blankState().prog[f]; });
    out.targets = s.targets || {};
    out.totals = Object.assign({ sessions: 0, reps: 0, secs: 0 }, s.totals || {});
    out.history = Array.isArray(s.history) ? s.history.filter(function (h) { return h && h.at; }) : [];
    out.history.sort(function (a, b) { return a.at < b.at ? -1 : 1; });
    out.unlocks = Array.isArray(s.unlocks) ? s.unlocks : [];
    out.badges = s.badges || {};
    out.prs = s.prs || {};
    out.xp = +s.xp || 0;
    out.rot = +s.rot || 0;
    return out;
  }

  /* Sauvegarde : toujours sur l'appareil ; et sur le compte quand l'app tourne dans un Artifact Claude. */
  var Store = {
    mode: 'local', ref: null, timer: null, chain: Promise.resolve(),
    readLocal: function () {
      try { var raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
    },
    writeLocal: function (s) {
      try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* stockage indisponible */ }
    },
    queueRemote: function (s) {
      var self = this;
      if (!self.ref) return;
      clearTimeout(self.timer);
      self.timer = setTimeout(function () {
        var body = { v: 1, updatedAt: s.updatedAt, json: JSON.stringify(s) };
        self.chain = self.chain.then(function () { return self.ref ? self.ref.set(body) : null; }).catch(function (err) {
          if (err && (err.code === 'invalid_argument' || err.code === 'revoked' || err.code === 'not_granted')) {
            self.ref = null; self.mode = 'local';
          }
        });
      }, 800);
    },
    connect: function () {
      var self = this;
      if (!window.claude || typeof window.claude.use !== 'function') return Promise.resolve(null);
      return Promise.all([window.claude.use('db'), window.claude.use('user')]).then(function (r) {
        var db = r[0], user = r[1];
        if (!db || !user) return null;
        return user.id().then(function (uid) {
          if (!uid) return null;
          var ref = db.doc('data/users/' + uid + '/state');
          var timeout = new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, 10000); });
          return Promise.race([ref.get(), timeout]).then(function (snap) {
            self.ref = ref; self.mode = 'cloud';
            if (snap && snap.exists) {
              var d = snap.data();
              if (d && typeof d.json === 'string') return JSON.parse(d.json);
            }
            return null;
          });
        });
      }).catch(function () { return null; });
    }
  };

  var REAL = normalize(Store.readLocal()) || blankState();
  var S = REAL;
  var demo = false;

  function save() {
    if (demo) return;
    S.updatedAt = Date.now();
    Store.writeLocal(S);
    Store.queueRemote(S);
  }

  /* ================= Logique du programme ================= */
  function fullChain(f) { return D.EX.filter(function (e) { return e.f === f; }); }
  function chain(f, s) { return D.EX.filter(function (e) { return e.f === f && (s.profile.bar || !e.bar); }); }
  function curEx(f, s) {
    var c = chain(f, s), full = fullChain(f), id = s.prog[f];
    for (var k = 0; k < c.length; k++) if (c[k].id === id) return c[k];
    var idx = full.findIndex(function (x) { return x.id === id; });
    var below = c.filter(function (x) { return full.indexOf(x) <= idx; });
    return below.length ? below[below.length - 1] : c[0];
  }
  function targetOf(e, s) {
    if (s.targets[e.id] != null) return s.targets[e.id];
    var c = chain(e.f, s);
    return c.indexOf(e) < c.indexOf(curEx(e.f, s)) ? e.unlock : e.start;
  }
  function stepOf(e) { return e.type === 'time' ? 5 : 1; }
  function unitShort(e) { return e.type === 'time' ? ' s' : ''; }
  function unitLong(e, n) {
    var u = e.type === 'time' ? (n > 1 ? 'secondes' : 'seconde') : (n > 1 ? 'répétitions' : 'répétition');
    return e.side ? u + ' par côté' : u;
  }
  function planOf(s) { return D.WEEK_PLANS[s.profile.days] || D.WEEK_PLANS[3]; }
  function nextTpl(s) { var p = planOf(s); return p[s.rot % p.length]; }

  function buildSession(tplId, s) {
    var tpl = D.TEMPLATES[tplId], g = D.GOALS[s.profile.goal] || D.GOALS.muscle, items = [];
    tpl.slots.forEach(function (slot) {
      var f = slot[0], off = slot[1], c = chain(f, s), cur = curEx(f, s), i = c.indexOf(cur) + off;
      if (i < 0) {
        var main = items.find(function (it) { return it.ex.f === f && it.main; });
        if (main) { main.sets += 1; return; }
        i = 0;
      }
      var e = c[i];
      var dup = items.find(function (it) { return it.ex.id === e.id; });
      if (dup) { dup.sets += 1; return; }
      items.push({
        ex: e, sets: off === 0 ? g.sets : Math.max(2, g.sets - 1), target: targetOf(e, s),
        rest: off === 0 ? g.rest : Math.round(g.rest * 0.75), main: off === 0 && e.id === cur.id
      });
    });
    return { tpl: tplId, name: tpl.name, items: items };
  }
  function estimate(sess) {
    var t = 180;
    sess.items.forEach(function (it, k) {
      var work = it.ex.type === 'time' ? it.target : it.target * (it.ex.side ? 6 : 3.2);
      t += it.sets * work + (it.sets - 1) * it.rest + (k < sess.items.length - 1 ? it.rest : 0);
    });
    return Math.max(10, Math.round(t / 60));
  }

  function sessionsInWeek(ws, s) {
    var a = ws.getTime(), b = addDays(ws, 7).getTime();
    return s.history.filter(function (h) { var t = new Date(h.at).getTime(); return t >= a && t < b; });
  }
  function streakWeeks(s, now) {
    now = now || new Date();
    var goal = s.profile.days, ws = weekStart(now), n = 0;
    if (!s.history.length) return 0;
    if (sessionsInWeek(ws, s).length >= goal) n = 1;
    var first = weekStart(new Date(s.history[0].at)), w = addDays(ws, -7);
    while (w >= first) {
      if (sessionsInWeek(w, s).length >= goal) { n++; w = addDays(w, -7); } else break;
    }
    return n;
  }
  function weekNumber(s) {
    var first = s.history.length ? new Date(s.history[0].at) : new Date(s.createdAt);
    return Math.max(1, Math.floor(daysBetween(weekStart(first), weekStart(new Date())) / 7) + 1);
  }
  function rankOf(xp) {
    var i = 0;
    D.RANKS.forEach(function (r, k) { if (xp >= r.xp) i = k; });
    var cur = D.RANKS[i], nxt = D.RANKS[i + 1];
    return { i: i, cur: cur, nxt: nxt, pct: nxt ? (xp - cur.xp) / (nxt.xp - cur.xp) : 1 };
  }
  function reached(s, f, id) {
    var full = fullChain(f);
    return full.indexOf(curEx(f, s)) >= full.findIndex(function (e) { return e.id === id; });
  }
  function badgeTests(s, when) {
    var n = s.totals.sessions, r = s.totals.reps, st = streakWeeks(s, when), u = s.unlocks.length, h = when.getHours();
    return {
      first: n >= 1, s10: n >= 10, s30: n >= 30, s100: n >= 100,
      w2: st >= 2, w4: st >= 4, w12: st >= 12, r1k: r >= 1000, r10k: r >= 10000,
      lvl1: u >= 1, lvl5: u >= 5,
      pushup: reached(s, 'push', 'pompes'), pullup: s.profile.bar && reached(s, 'pull', 'chin-ups'),
      handstand: reached(s, 'atr', 'atr-libre'), early: h < 8, night: h >= 21
    };
  }

  /*
   * Enregistre une séance et fait progresser les objectifs.
   * Toutes les séries réussies : +1 rép (+5 s), +2 si « trop facile », +0 si « difficile ».
   * Objectif de déblocage tenu sur toutes les séries de l'exercice principal : niveau suivant.
   */
  function applySession(sess, log, fb, when, s, opts) {
    opts = opts || {};
    var res = { xp: 0, unlocks: [], prs: [], badges: [], changes: [], reps: 0, secs: 0, sets: 0 };
    var rec = { id: 'h' + when.getTime().toString(36), at: when.toISOString(), tpl: sess.tpl, name: sess.name, dur: opts.dur || 0, fb: fb, ex: [] };
    sess.items.forEach(function (it, i) {
      var done = (log[i] || []).filter(function (v) { return v != null; });
      if (!done.length) return;
      var e = it.ex, sum = done.reduce(function (a, b) { return a + b; }, 0);
      rec.ex.push({ id: e.id, t: it.target, d: done });
      res.sets += done.length;
      if (e.type === 'time') res.secs += sum; else res.reps += sum;
      var hits = done.filter(function (v) { return v >= it.target; }).length;
      res.xp += done.length * 10 + hits * 5;
      var best = Math.max.apply(null, done);
      if (best > (s.prs[e.id] || 0)) { if (s.prs[e.id]) res.prs.push({ id: e.id, v: best }); s.prs[e.id] = best; }

      var hit = done.length >= it.sets && hits === done.length;
      var c = chain(e.f, s), next = c[c.indexOf(e) + 1], isCur = curEx(e.f, s).id === e.id, st = stepOf(e), t = it.target;
      if (hit && isCur && next && t >= e.unlock) {
        s.prog[e.f] = next.id;
        s.targets[e.id] = t;
        if (s.targets[next.id] == null) s.targets[next.id] = next.start;
        s.unlocks.push({ f: e.f, id: next.id, at: when.toISOString() });
        res.unlocks.push(next.id);
        res.xp += 150;
        return;
      }
      var inc = 0;
      if (hit) inc = fb === 'easy' ? 2 * st : fb === 'hard' ? 0 : st;
      else if (sum / done.length < it.target * 0.7) inc = -st;
      var cap = isCur && next ? e.unlock : e.unlock * 2;
      var nt = clamp(t + inc, e.type === 'time' ? 5 : 1, Math.max(cap, t));
      if (nt !== t) res.changes.push({ id: e.id, from: t, to: nt });
      s.targets[e.id] = nt;
    });
    if (!rec.ex.length) return null;
    res.xp += 50;
    s.totals.sessions += 1; s.totals.reps += res.reps; s.totals.secs += res.secs;
    rec.reps = res.reps; rec.secs = res.secs; rec.sets = res.sets; rec.unl = res.unlocks.slice();
    s.history.push(rec);
    if (s.history.length > 600) s.history.splice(0, s.history.length - 600);
    if (opts.advance) s.rot += 1;
    var tests = badgeTests(s, when);
    D.BADGES.forEach(function (b) {
      if (tests[b.id] && !s.badges[b.id]) { s.badges[b.id] = when.toISOString(); res.badges.push(b.id); }
    });
    res.xp += res.badges.length * 100;
    rec.xp = res.xp;
    s.xp += res.xp;
    return res;
  }

  function nextUnlocks(s) {
    return D.FAMILIES.map(function (f) {
      var c = chain(f.id, s), e = curEx(f.id, s), nx = c[c.indexOf(e) + 1], t = targetOf(e, s);
      return { f: f, e: e, nx: nx, t: t, pct: clamp((t - e.start) / Math.max(1, e.unlock - e.start), 0, 1) };
    }).filter(function (x) { return x.nx; }).sort(function (a, b) { return b.pct - a.pct; });
  }

  /* Petit générateur pseudo-aléatoire pour une démo reproductible. */
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function makeDemo() {
    var s = blankState(), rand = rng(7), now = new Date();
    s.onboarded = true;
    s.profile = { name: 'Alex', goal: 'muscle', days: 3, bar: true, sound: true };
    s.prog = { push: 'pompes-genoux', pull: 'rowing-australien', legs: 'squats', core: 'planche', atr: 'pompes-pike' };
    s.targets = { 'pompes-genoux': 11, 'rowing-australien': 11, squats: 18, planche: 40, 'pompes-pike': 9 };
    var start = addDays(weekStart(now), -7 * 9);
    s.createdAt = start.getTime();
    for (var w = 0; w < 10; w++) {
      [0, 2, 4].forEach(function (off, k) {
        var d = addDays(start, w * 7 + off);
        d.setHours(k === 0 ? 7 : 18, 20 + k * 7, 0, 0);
        if (d > now) return;
        if ((w === 3 && off === 4) || (w === 6 && off === 2)) return;
        var sess = buildSession(nextTpl(s), s);
        var log = sess.items.map(function (it) {
          var arr = [];
          for (var j = 0; j < it.sets; j++) arr.push(rand() < 0.82 ? it.target : Math.max(1, it.target - 1 - Math.floor(rand() * 3)));
          return arr;
        });
        applySession(sess, log, rand() < 0.35 ? 'easy' : 'ok', d, s, { advance: true, dur: estimate(sess) * 60 });
      });
    }
    return s;
  }

  /* ================= Rendu : coque & navigation ================= */
  var VIEWS = ['accueil', 'programme', 'progres', 'profil'];
  var view = VIEWS.indexOf(location.hash.slice(1)) >= 0 ? location.hash.slice(1) : 'accueil';
  var ui = { fam: 'push', histAll: false };
  var OB = { active: false, step: 0, name: '', goal: null, push: null, pull: null, atr: null, days: 3, retake: false };

  var appEl = $('#app');
  var tabbar = $('#tabbar');
  tabbar.innerHTML = '<span class="tab-lens" aria-hidden="true"></span>' + [
    ['accueil', 'Accueil', I.home], ['programme', 'Programme', I.plan], ['progres', 'Progrès', I.chart], ['profil', 'Profil', I.user]
  ].map(function (t) {
    return '<button class="tab" type="button" data-act="nav" data-view="' + t[0] + '">' + t[2] + '<span>' + t[1] + '</span></button>';
  }).join('');

  function moveLens(animate) {
    var btn = tabbar.querySelector('[data-view="' + view + '"]'), lens = tabbar.querySelector('.tab-lens');
    if (!btn || !lens) return;
    lens.style.width = btn.offsetWidth + 'px';
    lens.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
    if (animate && !reduceMotion) { lens.classList.remove('stretch'); void lens.offsetWidth; lens.classList.add('stretch'); }
  }
  function go(v) {
    if (VIEWS.indexOf(v) < 0) v = 'accueil';
    var changed = v !== view;
    view = v;
    render(changed);
    try { if (location.hash.slice(1) !== v) location.hash = v; } catch (e) { /* ignore */ }
    if (changed) window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', function () {
    var v = location.hash.slice(1);
    if (VIEWS.indexOf(v) >= 0 && v !== view) { view = v; render(true); }
  });
  window.addEventListener('resize', function () { moveLens(false); });

  function render(animateLens) {
    if (!S.onboarded || OB.active) {
      tabbar.hidden = true;
      appEl.classList.add('no-tabs');
      appEl.innerHTML = renderOnboarding();
      return;
    }
    tabbar.hidden = false;
    appEl.classList.remove('no-tabs');
    var body = { accueil: renderHome, programme: renderProgram, progres: renderProgress, profil: renderProfile }[view]();
    appEl.innerHTML = (demo ? '<div class="demo-banner"><span>Mode exemple : données fictives</span><button class="btn" type="button" data-act="demo-exit">Créer mon programme</button></div>' : '') + body;
    $$('.tab', tabbar).forEach(function (t) {
      if (t.dataset.view === view) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
    requestAnimationFrame(function () { moveLens(animateLens); });
  }

  function exRow(it) {
    var e = it.ex;
    return '<div class="ex-row">' + picto(e.f) +
      '<div class="name">' + esc(e.name) + '<small>' + FAM[e.f].name + (e.side ? ' · par côté' : '') + '</small></div>' +
      '<div class="dose">' + it.sets + ' × ' + it.target + unitShort(e) + '</div></div>';
  }

  /* ================= Accueil ================= */
  function renderHome() {
    var s = S, now = new Date(), goal = s.profile.days;
    var ws = weekStart(now), week = sessionsInWeek(ws, s), weekDone = week.length;
    var tplId = nextTpl(s), sess = buildSession(tplId, s), complete = weekDone >= goal;
    var rank = rankOf(s.xp), last = s.history[s.history.length - 1];
    var since = last ? daysBetween(new Date(last.at), now) : null;
    var hour = now.getHours();
    var hello = (hour < 5 || hour >= 18 ? 'Bonsoir' : 'Bonjour') + (s.profile.name ? ' ' + esc(s.profile.name) : '');
    var mood;
    if (since === null) mood = 'Ta première séance t’attend.';
    else if (since === 0) mood = 'Séance faite aujourd’hui. Bien joué.';
    else if (since <= 2) mood = 'Prêt pour la suite ?';
    else if (since <= 6) mood = since + ' jours sans séance. On s’y remet ?';
    else mood = 'Ça fait un moment. On reprend en douceur.';
    var resume = readResume();
    var streak = streakWeeks(s);
    var trainedDays = {};
    week.forEach(function (h) { trainedDays[dayKey(new Date(h.at))] = true; });
    var idxInWeek = Math.min(weekDone + 1, goal);

    var html = '<section class="view">';
    html += '<header class="topbar"><div class="hello"><p class="eyebrow">' + fmtDate(now, { weekday: 'long', day: 'numeric', month: 'long' }) + '</p>' +
      '<h1 class="title-lg">' + hello + '</h1><p class="muted">' + mood + '</p></div>' +
      '<button class="chip violet" type="button" data-act="nav" data-view="progres" aria-label="Rang ' + rank.cur.name + ', ' + fmtInt(s.xp) + ' XP">' + I.bolt + rank.cur.name + '</button></header>';

    if (resume) {
      html += '<div class="card tight" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">' +
        '<div><b>Séance en cours</b><p class="faint" style="font-size:13px">' + esc(resume.sess.name) + ', commencée ' + fmtDate(new Date(resume.startedAt), { hour: '2-digit', minute: '2-digit' }) + '</p></div>' +
        '<div style="display:flex;gap:8px"><button class="btn ghost" type="button" data-act="resume-drop">Effacer</button><button class="btn primary" type="button" data-act="resume">' + I.play + 'Reprendre</button></div></div>';
    }

    html += '<article class="card-hero"><div class="hero-top"><div><p class="eyebrow" style="color:var(--violet-2)">' +
      (complete ? 'Objectif de la semaine atteint' : 'Séance du jour · semaine ' + weekNumber(s)) + '</p>' +
      '<h2 class="hero-title">' + esc(sess.name) + '</h2></div></div>' +
      '<div class="hero-meta"><span class="chip">' + I.timer + '≈ ' + estimate(sess) + ' min</span>' +
      '<span class="chip">' + sess.items.length + ' exercices</span>' +
      (complete ? '<span class="chip good">' + I.check + weekDone + '/' + goal + ' faites</span>' : '<span class="chip violet">Séance ' + idxInWeek + '/' + goal + '</span>') + '</div>' +
      '<div class="ex-list">' + sess.items.map(exRow).join('') + '</div>' +
      '<button class="btn primary lg block" type="button" data-act="start" data-tpl="' + tplId + '">' + I.play + (complete ? 'Faire une séance bonus' : 'Commencer la séance') + '</button></article>';

    html += '<div class="card"><div class="section-head" style="margin:0"><h2>Cette semaine</h2><span class="num" style="font-weight:800;color:var(--violet-2)">' + weekDone + ' / ' + goal + '</span></div>' +
      '<div class="week-strip">' + DOW.map(function (l, k) {
        var d = addDays(ws, k), key = dayKey(d), done = trainedDays[key], today = key === dayKey(now);
        return '<div class="wday' + (done ? ' done' : '') + (today ? ' today' : '') + '"><span class="dot">' + (done ? I.check : '') + '</span>' + l + '</div>';
      }).join('') + '</div></div>';

    html += '<div class="stats">' +
      '<div class="stat flame"><div class="v">' + I.flame + streak + '</div><div class="l">semaine' + (streak > 1 ? 's' : '') + ' d’affilée</div></div>' +
      '<div class="stat"><div class="v">' + fmtInt(s.totals.sessions) + '</div><div class="l">séances terminées</div></div>' +
      '<div class="stat"><div class="v">' + fmtInt(s.totals.reps) + '</div><div class="l">répétitions au total</div></div></div>';

    var nu = nextUnlocks(s).slice(0, 2);
    if (nu.length) {
      html += '<div class="section-head"><h2>Prochains paliers</h2><button class="link" type="button" data-act="nav" data-view="progres">Voir le parcours</button></div>';
      html += '<div class="card" style="display:grid;gap:16px">' + nu.map(function (x) {
        return '<div class="next-level">' + picto(x.f.id) + '<div><div class="row"><b>' + esc(x.e.name) + ' → ' + esc(x.nx.name) + '</b></div>' +
          '<div class="progress fc" style="--fc:' + x.f.color + '"><i style="width:' + Math.round(x.pct * 100) + '%"></i></div>' +
          '<div class="row faint" style="margin:6px 0 0;font-size:12px"><span>Objectif ' + x.t + unitShort(x.e) + ' sur ' + x.e.unlock + unitShort(x.e) + '</span><span>' + Math.round(x.pct * 100) + ' %</span></div></div></div>';
      }).join('') + '</div>';
    }

    var q = D.QUOTES[Math.floor(startOfDay(now).getTime() / DAY) % D.QUOTES.length];
    html += '<p class="quote">' + I.quote + '<span>' + q + '</span></p>';
    html += '</section>';
    return html;
  }

  /* ================= Programme ================= */
  function renderProgram() {
    var s = S, plan = planOf(s), g = D.GOALS[s.profile.goal], ws = weekStart(new Date());
    var doneTpl = {};
    sessionsInWeek(ws, s).forEach(function (h) { doneTpl[h.tpl] = true; });
    var nt = nextTpl(s);
    var html = '<section class="view"><header class="topbar"><div><p class="eyebrow">Semaine ' + weekNumber(s) + '</p><h1 class="title-xl">Programme</h1></div></header>';
    html += '<div class="summary-chips"><span class="chip violet">' + I.target + g.name + '</span><span class="chip">' + s.profile.days + ' séances / semaine</span>' +
      '<span class="chip">' + I.timer + 'Repos ' + g.rest + ' s</span><span class="chip">' + (s.profile.bar ? 'Avec barre' : 'Sans barre') + '</span></div>';
    html += '<p class="muted" style="font-size:14px">Les séances tournent dans cet ordre. Les objectifs montent tout seuls quand tu réussis toutes tes séries.</p>';

    html += plan.map(function (tplId, k) {
      var sess = buildSession(tplId, s), isDone = doneTpl[tplId], isNext = tplId === nt;
      return '<article class="card plan-item' + (isDone ? ' is-done' : '') + (isNext ? ' is-next' : '') + '"><div class="plan-head">' +
        '<span class="plan-idx">' + (isDone ? I.check : (k + 1)) + '</span><div style="min-width:0"><h3 class="title-md">' + esc(sess.name) + '</h3>' +
        '<p class="faint" style="font-size:12.5px">≈ ' + estimate(sess) + ' min · ' + (isDone ? 'faite cette semaine' : isNext ? 'prochaine séance' : 'à venir') + '</p></div>' +
        '<button class="btn icon sm' + (isNext ? ' primary' : '') + '" type="button" data-act="start" data-tpl="' + tplId + '" aria-label="Lancer ' + esc(sess.name) + '">' + I.play + '</button></div>' +
        '<div class="ex-list">' + sess.items.map(exRow).join('') + '</div></article>';
    }).join('');

    html += '<div class="section-head"><h2>Tes niveaux actuels</h2></div><div class="fam-grid">' + D.FAMILIES.map(function (f) {
      var c = chain(f.id, s), e = curEx(f.id, s);
      return '<button class="fam-row" type="button" data-act="fam-open" data-f="' + f.id + '">' + picto(f.id) +
        '<span class="t"><b>' + esc(e.name) + '</b><span>' + f.name + ' · objectif ' + targetOf(e, s) + unitShort(e) + '</span></span>' +
        '<span class="lvl">Niv. ' + (c.indexOf(e) + 1) + '/' + c.length + '</span></button>';
    }).join('') + '</div></section>';
    return html;
  }

  /* ================= Progrès ================= */
  function renderProgress() {
    var s = S, r = rankOf(s.xp);
    var html = '<section class="view"><header class="topbar"><div><p class="eyebrow">Ton parcours</p><h1 class="title-xl">Progrès</h1></div></header>';

    html += '<article class="card rank-card"><div class="rank-top">' + emblem(r.i) + '<div style="min-width:0"><p class="eyebrow">Rang ' + (r.i + 1) + ' sur ' + D.RANKS.length + '</p>' +
      '<h2 class="rank-name">' + r.cur.name + '</h2><p class="faint" style="font-size:13px"><span class="num">' + fmtInt(s.xp) + '</span> XP</p></div></div>' +
      '<div class="progress"><i style="width:' + Math.round(r.pct * 100) + '%"></i></div>' +
      '<div class="rank-foot"><span>' + (r.nxt ? 'Encore ' + fmtInt(r.nxt.xp - s.xp) + ' XP pour ' + r.nxt.name : 'Rang maximum atteint') + '</span><span>Série +10 · Séance +50 · Palier +150</span></div>' +
      '<div class="rank-steps">' + D.RANKS.map(function (_, k) { return '<i class="' + (k <= r.i ? 'on' : '') + '"></i>'; }).join('') + '</div></article>';

    html += '<div class="card"><div class="section-head" style="margin:0 0 12px"><h2>Activité</h2><span class="faint" style="font-size:12.5px">16 dernières semaines</span></div>' + heatmap(s) + '</div>';
    html += '<div class="card"><div class="section-head" style="margin:0 0 6px"><h2>Répétitions par semaine</h2><span class="faint" style="font-size:12.5px">8 semaines</span></div>' + weeklyChart(s) + '</div>';

    // Parcours
    var f = FAM[ui.fam], c = chain(f.id, s), cur = curEx(f.id, s), ci = c.indexOf(cur);
    var full = fullChain(f.id);
    html += '<div class="section-head"><h2>Parcours</h2><span class="faint" style="font-size:12.5px">' + s.unlocks.length + ' palier' + (s.unlocks.length > 1 ? 's' : '') + ' débloqué' + (s.unlocks.length > 1 ? 's' : '') + '</span></div>';
    html += '<div class="card"><div class="fam-tabs" role="group" aria-label="Familles">' + D.FAMILIES.map(function (x) {
      return '<button class="fam-tab" type="button" style="--fc:' + x.color + '" data-act="fam" data-f="' + x.id + '" aria-pressed="' + (x.id === ui.fam) + '">' + PIC[x.id] + x.name + '</button>';
    }).join('') + '</div>';
    html += '<p class="faint" style="font-size:12.5px;margin-top:10px">' + f.muscles + ' · niveau ' + (ci + 1) + ' sur ' + c.length + '</p>';
    html += '<div class="path" style="--fc:' + f.color + '">' + full.map(function (e) {
      var k = c.indexOf(e);
      if (k < 0) {
        return '<button class="path-node locked" type="button" data-act="ex-info" data-id="' + e.id + '"><span class="path-dot">' + I.lock + '</span><span class="t"><b>' + esc(e.name) + '</b><span>Nécessite une barre de traction</span></span><span class="tag">Barre</span></button>';
      }
      var st = k < ci ? 'done' : k === ci ? 'current' : 'locked';
      var t = targetOf(e, s), pct = clamp((t - e.start) / Math.max(1, e.unlock - e.start), 0, 1);
      var date = '';
      if (st === 'done') {
        var u = s.unlocks.filter(function (x) { return x.id === (c[k + 1] && c[k + 1].id); }).pop();
        date = u ? 'Validé le ' + fmtDate(new Date(u.at), { day: 'numeric', month: 'short' }) : 'Acquis';
      }
      var sub = st === 'done' ? date : st === 'current' ? 'Objectif ' + t + unitShort(e) + ' · déblocage à ' + e.unlock + unitShort(e) : 'Déblocage à ' + e.unlock + unitShort(e) + ' sur le niveau précédent';
      if (st === 'locked') sub = 'Niveau ' + (k + 1);
      return '<button class="path-node ' + st + '" type="button" data-act="ex-info" data-id="' + e.id + '"><span class="path-dot">' + (st === 'done' ? I.check : st === 'locked' ? I.lock : (k + 1)) + '</span>' +
        '<span class="t"><b>' + esc(e.name) + '</b><span>' + sub + '</span>' + (st === 'current' && c[k + 1] ? '<span class="progress fc" style="display:block;margin-top:7px;--fc:' + f.color + '"><i style="width:' + Math.round(pct * 100) + '%"></i></span>' : '') + '</span>' +
        '<span class="tag">' + (st === 'done' ? 'Acquis' : st === 'current' ? 'En cours' : '') + '</span></button>';
    }).join('') + '</div></div>';

    // Records
    var prIds = Object.keys(s.prs).filter(function (id) { return EXM[id]; });
    prIds.sort(function (a, b) {
      var fa = D.FAMILIES.findIndex(function (x) { return x.id === EXM[a].f; }), fb = D.FAMILIES.findIndex(function (x) { return x.id === EXM[b].f; });
      return fa - fb || D.EX.indexOf(EXM[b]) - D.EX.indexOf(EXM[a]);
    });
    html += '<div class="section-head"><h2>Records personnels</h2></div><div class="card">';
    if (!prIds.length) html += '<div class="empty">' + I.trophy + '<span>Tes meilleures séries apparaîtront ici après ta première séance.</span></div>';
    else html += '<div class="pr-list">' + prIds.slice(0, 10).map(function (id) {
      var e = EXM[id];
      return '<div class="pr-row">' + picto(e.f) + '<b>' + esc(e.name) + '</b><span class="v">' + s.prs[id] + '<small>' + (e.type === 'time' ? 's' : 'reps') + '</small></span></div>';
    }).join('') + '</div>';
    html += '</div>';

    // Badges
    var got = D.BADGES.filter(function (b) { return s.badges[b.id]; }).length;
    html += '<div class="section-head"><h2>Badges</h2><span class="faint num" style="font-size:13px">' + got + ' / ' + D.BADGES.length + '</span></div>';
    html += '<div class="badges">' + D.BADGES.map(function (b) {
      var on = !!s.badges[b.id];
      return '<button class="badge' + (on ? ' on' : '') + '" type="button" data-act="badge" data-id="' + b.id + '" style="font:inherit;color:inherit">' + badgeIcon(on) + '<b>' + b.name + '</b></button>';
    }).join('') + '</div>';

    // Historique
    var hist = s.history.slice().reverse();
    html += '<div class="section-head"><h2>Historique</h2>' + (hist.length > 8 ? '<button class="link" type="button" data-act="hist-toggle">' + (ui.histAll ? 'Réduire' : 'Tout voir (' + hist.length + ')') + '</button>' : '') + '</div><div class="card">';
    if (!hist.length) html += '<div class="empty">' + I.plan + '<span>Aucune séance pour l’instant. Lance ta première depuis l’accueil.</span></div>';
    else html += '<div class="hist">' + hist.slice(0, ui.histAll ? 200 : 8).map(function (h) {
      var d = new Date(h.at), dur = h.dur ? Math.round(h.dur / 60) + ' min · ' : '';
      var extra = (h.unl && h.unl.length) ? ' · ' + h.unl.length + ' palier' + (h.unl.length > 1 ? 's' : '') : '';
      return '<div class="hist-row"><div class="hist-date"><b>' + d.getDate() + '</b><span>' + fmtDate(d, { month: 'short' }).replace('.', '') + '</span></div>' +
        '<div class="t"><b>' + esc(h.name) + '</b><span>' + dur + (h.sets || 0) + ' séries · ' + fmtInt(h.reps || 0) + ' reps' + extra + '</span></div><span class="xp">+' + fmtInt(h.xp || 0) + ' XP</span></div>';
    }).join('') + '</div>';
    html += '</div></section>';
    return html;
  }

  function dayStats(s) {
    var m = {};
    s.history.forEach(function (h) {
      var k = dayKey(new Date(h.at));
      var o = m[k] || (m[k] = { n: 0, sets: 0, reps: 0, secs: 0 });
      o.n++; o.sets += h.sets || 0; o.reps += h.reps || 0; o.secs += h.secs || 0;
    });
    return m;
  }
  function heatmap(s) {
    var now = new Date(), today = dayKey(now), start = addDays(weekStart(now), -7 * 15), m = dayStats(s);
    var months = '', cells = '', lastMonth = -1;
    for (var w = 0; w < 16; w++) {
      var colStart = addDays(start, w * 7), mo = colStart.getMonth();
      months += '<span>' + (mo !== lastMonth ? fmtDate(colStart, { month: 'short' }).replace('.', '') : '') + '</span>';
      lastMonth = mo;
      for (var d = 0; d < 7; d++) {
        var day = addDays(start, w * 7 + d), key = dayKey(day), st = m[key];
        var future = day > now && key !== today;
        var l = !st ? 0 : st.sets <= 8 ? 1 : st.sets <= 14 ? 2 : st.sets <= 20 ? 3 : 4;
        var label = fmtDate(day, { weekday: 'short', day: 'numeric', month: 'short' }) + ' : ' + (st ? st.n + ' séance' + (st.n > 1 ? 's' : '') + ', ' + st.sets + ' séries, ' + st.reps + ' reps' + (st.secs ? ', ' + st.secs + ' s de gainage' : '') : 'repos');
        cells += '<button type="button" class="heat-cell' + (future ? ' future' : '') + (key === today ? ' today' : '') + '" data-l="' + l + '" data-tip="' + esc(label) + '" aria-label="' + esc(label) + '"' + (future ? ' tabindex="-1" disabled' : '') + '></button>';
      }
    }
    return '<div class="chart-wrap" data-tipwrap>' +
      '<div class="heat"><span></span><div class="heat-months" style="display:grid;grid-template-columns:repeat(16,minmax(0,1fr));gap:3px;font-size:10px;color:var(--ink-3);font-weight:700;height:14px;white-space:nowrap">' + months + '</div>' +
      '<div class="heat-days">' + ['L', '', 'M', '', 'V', '', 'D'].map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div>' +
      '<div class="heat-grid">' + cells + '</div></div>' +
      '<div class="heat-legend">Moins <i style="background:var(--heat-0)"></i><i style="background:var(--heat-1)"></i><i style="background:var(--heat-2)"></i><i style="background:var(--heat-3)"></i><i style="background:var(--heat-4)"></i> Plus</div></div>';
  }
  function niceMax(v) {
    if (v <= 0) return 100;
    var p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  }
  function weeklyChart(s) {
    var ws = weekStart(new Date()), vals = [];
    for (var k = 7; k >= 0; k--) {
      var w = addDays(ws, -7 * k), hs = sessionsInWeek(w, s);
      vals.push({ w: w, v: hs.reduce(function (a, h) { return a + (h.reps || 0); }, 0), n: hs.length });
    }
    var W = 340, H = 170, L = 34, R = 6, T = 18, B = 24, max = niceMax(Math.max.apply(null, vals.map(function (x) { return x.v; })));
    var pw = W - L - R, ph = H - T - B, band = pw / vals.length, bw = Math.min(26, band * 0.58);
    var y = function (v) { return T + ph - (v / max) * ph; };
    var out = '<div class="chart-wrap" data-tipwrap><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Répétitions par semaine sur 8 semaines">';
    [0, 0.5, 1].forEach(function (f) {
      var v = max * f, yy = y(v);
      out += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '"/>';
      out += '<text class="axis" x="' + (L - 6) + '" y="' + (yy + 3.5) + '" text-anchor="end">' + fmtInt(v) + '</text>';
    });
    vals.forEach(function (d, i) {
      var x = L + band * i + (band - bw) / 2, yy = y(d.v), h = T + ph - yy, last = i === vals.length - 1;
      var tip = (last ? 'Cette semaine' : 'Semaine du ' + fmtDate(d.w, { day: 'numeric', month: 'short' })) + ' : ' + fmtInt(d.v) + ' reps, ' + d.n + ' séance' + (d.n > 1 ? 's' : '');
      out += '<rect class="bar-hit" x="' + (L + band * i) + '" y="' + T + '" width="' + band + '" height="' + ph + '" data-tip="' + esc(tip) + '"/>';
      if (h > 0) out += '<path class="bar' + (last ? ' last' : '') + '" d="' + barPath(x, yy, bw, h, 4) + '"/>';
      else out += '<line x1="' + x + '" x2="' + (x + bw) + '" y1="' + (T + ph) + '" y2="' + (T + ph) + '" stroke="rgba(206,190,255,.25)" stroke-width="2" stroke-linecap="round"/>';
      if (last && d.v > 0) out += '<text class="val" x="' + (x + bw / 2) + '" y="' + (yy - 6) + '" text-anchor="middle">' + fmtInt(d.v) + '</text>';
      out += '<text class="axis" x="' + (x + bw / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' + (last ? 'Auj.' : fmtDate(d.w, { day: 'numeric', month: 'numeric' })) + '</text>';
    });
    out += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + (T + ph) + '" y2="' + (T + ph) + '" stroke="rgba(206,190,255,.18)"/></svg></div>';
    return out;
  }
  function barPath(x, y, w, h, r) {
    r = Math.min(r, w / 2, h);
    return 'M' + x + ',' + (y + h) + 'V' + (y + r) + 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + 'V' + (y + h) + 'Z';
  }

  /* Infobulles des graphiques (survol et toucher). */
  var tipEl = null;
  function showTip(target) {
    var wrap = target.closest('[data-tipwrap]');
    if (!wrap) return;
    hideTip();
    var wr = wrap.getBoundingClientRect(), tr = target.getBoundingClientRect();
    tipEl = document.createElement('div');
    tipEl.className = 'tooltip';
    tipEl.textContent = target.getAttribute('data-tip');
    wrap.appendChild(tipEl);
    var x = tr.left + tr.width / 2 - wr.left, half = tipEl.offsetWidth / 2;
    x = clamp(x, half, wr.width - half);
    tipEl.style.left = x + 'px';
    tipEl.style.top = (tr.top - wr.top) + 'px';
    $$('.bar.hot', wrap).forEach(function (b) { b.classList.remove('hot'); });
    if (target.classList.contains('bar-hit') && target.nextElementSibling && target.nextElementSibling.classList.contains('bar')) target.nextElementSibling.classList.add('hot');
  }
  function hideTip() {
    if (tipEl) { tipEl.remove(); tipEl = null; }
    $$('.bar.hot').forEach(function (b) { b.classList.remove('hot'); });
  }
  document.addEventListener('pointerover', function (e) {
    var t = e.target.closest && e.target.closest('[data-tip]');
    if (t && e.pointerType === 'mouse') showTip(t);
  });
  document.addEventListener('pointerout', function (e) {
    var t = e.target.closest && e.target.closest('[data-tip]');
    if (t && e.pointerType === 'mouse' && !(e.relatedTarget && t.contains(e.relatedTarget))) hideTip();
  });
  document.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches('[data-tip]')) showTip(e.target); });
  document.addEventListener('focusout', function (e) { if (e.target.matches && e.target.matches('[data-tip]')) hideTip(); });

  /* ================= Profil ================= */
  function renderProfile() {
    var s = S, p = s.profile;
    var html = '<section class="view"><header class="topbar"><div><p class="eyebrow">Réglages</p><h1 class="title-xl">Profil</h1></div></header>';
    html += '<div class="card" style="display:grid;gap:18px"><div class="field"><label for="pf-name">Prénom</label><input id="pf-name" class="input" maxlength="30" autocomplete="given-name" placeholder="Ton prénom" value="' + esc(p.name) + '"></div>' +
      '<div class="field"><span class="label">Objectif</span><div class="seg" role="group" aria-label="Objectif">' + Object.keys(D.GOALS).map(function (k) {
        return '<button type="button" data-act="pf-goal" data-v="' + k + '" aria-pressed="' + (p.goal === k) + '">' + D.GOALS[k].name.replace(' & skills', '').replace('Prise de muscle', 'Muscle').replace('Remise en forme', 'Forme') + '</button>';
      }).join('') + '</div><p class="faint" id="pf-goal-desc" style="font-size:12.5px">' + D.GOALS[p.goal].desc + '</p></div>' +
      '<div class="field"><span class="label">Séances par semaine</span><div class="seg" role="group" aria-label="Séances par semaine">' + [2, 3, 4, 5, 6].map(function (n) {
        return '<button type="button" data-act="pf-days" data-v="' + n + '" aria-pressed="' + (p.days === n) + '">' + n + '</button>';
      }).join('') + '</div></div></div>';

    html += '<div class="card"><div class="toggle-row"><span class="t"><b>Barre de traction</b><span>Débloque les tractions et les relevés suspendus</span></span>' +
      '<button class="switch" type="button" role="switch" aria-label="Barre de traction" aria-checked="' + p.bar + '" data-act="pf-bar"></button></div>' +
      '<div class="toggle-row"><span class="t"><b>Sons et vibrations</b><span>Signal à la fin des repos et des chronos</span></span>' +
      '<button class="switch" type="button" role="switch" aria-label="Sons et vibrations" aria-checked="' + p.sound + '" data-act="pf-sound"></button></div></div>';

    html += '<div class="card" style="display:grid;gap:10px"><button class="btn block" type="button" data-act="retake">' + I.refresh + 'Refaire le test de niveau</button>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button class="btn" type="button" data-act="export">' + I.copy + 'Exporter</button><button class="btn" type="button" data-act="import">Importer</button></div>' +
      '<button class="btn block danger ghost" type="button" data-act="reset">' + I.trash + 'Tout effacer</button></div>';

    var cloud = Store.mode === 'cloud';
    html += '<p class="storage-note">' + (cloud ? I.cloud : I.device) + '<span>' + (cloud ? 'Ta progression est enregistrée sur ton compte et sur cet appareil.' : 'Ta progression est enregistrée sur cet appareil. Utilise Exporter pour la garder ailleurs.') + '</span></p>';
    html += '<p class="faint" style="font-size:12px;text-align:center">Gravité · calisthenics au poids du corps. Échauffe-toi, écoute ton corps et arrête en cas de douleur.</p>';
    html += '</section>';
    return html;
  }

  /* ================= Onboarding ================= */
  var PUSH_OPTS = [['0', '0–3', 'Pas encore, ou sur les genoux'], ['1', '4–10', 'Quelques-unes propres'], ['2', '11–20', 'À l’aise'], ['3', '21+', 'Facile']];
  var PULL_OPTS = [['nobar', '—', 'Je n’ai pas de barre'], ['0', '0', 'Aucune pour l’instant'], ['1', '1–4', 'Quelques-unes'], ['2', '5–10', 'Une bonne série'], ['3', '11+', 'Beaucoup']];
  var ATR_OPTS = [['never', '1', 'Jamais essayé', 'On commence par les épaules'], ['wall', '2', 'Contre un mur', 'Je tiens quelques secondes au mur'], ['free', '3', 'En libre', 'Je tiens quelques secondes sans appui']];

  function optBtn(k, v, big, title, sub) {
    return '<button class="option" type="button" data-act="ob-pick" data-k="' + k + '" data-v="' + v + '" aria-pressed="' + (String(OB[k]) === String(v)) + '">' +
      '<span class="o-big">' + big + '</span><span class="o-t"><b>' + title + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</span><span class="check">' + I.check + '</span></button>';
  }
  function obReady() {
    return { 1: !!OB.goal, 2: OB.push != null, 3: OB.pull != null, 4: OB.atr != null, 5: !!OB.days }[OB.step];
  }
  function renderOnboarding() {
    var st = OB.step, html = '';
    if (st === 0) {
      html = '<section class="view welcome"><div class="brand">' + BRAND + '<b>GRAVITÉ</b></div>' +
        '<h1 class="welcome-title">Plus fort que la <em>gravité</em></h1>' +
        '<p class="muted" style="font-size:16px;max-width:34ch">Un programme de calisthenics qui grandit avec toi : des premières pompes jusqu’à l’ATR, un niveau après l’autre.</p>' +
        '<div class="ladder">' + D.FAMILIES.map(function (f, i) {
          var n = fullChain(f.id).length, on = [3, 4, 1, 2, 0][i];
          var ex = fullChain(f.id)[on];
          return '<div class="ladder-row" style="--fc:' + f.color + '">' + picto(f.id) + '<span class="t"><b>' + f.name + '</b><span>' + n + ' niveaux, jusqu’à ' + esc(fullChain(f.id)[n - 1].name.toLowerCase()) + '</span></span>' +
            '<span class="steps" aria-hidden="true">' + fullChain(f.id).slice(0, 6).map(function (_, k) { return '<i class="' + (k <= on ? 'on' : '') + '"></i>'; }).join('') + '</span></div>';
        }).join('') + '</div>' +
        '<div class="feature-list">' +
        '<div class="feature"><span class="ic">' + I.target + '</span><div><b>Un programme à ton niveau</b><span>Trois questions, et tes séances sont prêtes.</span></div></div>' +
        '<div class="feature"><span class="ic">' + I.up + '</span><div><b>Des objectifs qui montent</b><span>Réussis tes séries : la séance suivante est un peu plus dure.</span></div></div>' +
        '<div class="feature"><span class="ic">' + I.trophy + '</span><div><b>Ta progression sous les yeux</b><span>Paliers débloqués, séries de semaines, records et badges.</span></div></div></div>' +
        '<div style="display:grid;gap:10px"><button class="btn primary lg block" type="button" data-act="ob-next">Créer mon programme</button>' +
        '<button class="btn block ghost" type="button" data-act="demo-start">Voir un exemple</button></div></section>';
      return html;
    }
    if (st === 6) {
      var s = S;
      html = '<section class="view ob"><div class="brand">' + BRAND + '<b>GRAVITÉ</b></div><div><p class="eyebrow" style="color:var(--violet-2)">C’est prêt</p><h1 class="title-xl" style="margin-top:6px">Ton programme</h1>' +
        '<p class="muted" style="margin-top:8px">' + s.profile.days + ' séances par semaine, objectif ' + D.GOALS[s.profile.goal].name.toLowerCase() + '. Voici ton point de départ :</p></div>' +
        '<div class="ladder">' + D.FAMILIES.map(function (f) {
          var c = chain(f.id, s), e = curEx(f.id, s), k = c.indexOf(e);
          return '<div class="ladder-row" style="--fc:' + f.color + '">' + picto(f.id) + '<span class="t"><b>' + esc(e.name) + '</b><span>' + f.name + ' · niveau ' + (k + 1) + ' sur ' + c.length + '</span></span>' +
            '<span class="steps" aria-hidden="true">' + c.slice(0, Math.min(c.length, 8)).map(function (_, j) { return '<i class="' + (j <= k ? 'on' : '') + '"></i>'; }).join('') + '</span></div>';
        }).join('') + '</div>' +
        '<p class="faint" style="font-size:13px">Tu pourras changer de niveau à tout moment depuis l’onglet Progrès.</p>' +
        '<button class="btn primary lg block" type="button" data-act="ob-done">' + I.play + 'C’est parti</button></section>';
      return html;
    }
    html = '<section class="view ob"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><div class="brand">' + BRAND + '<b>GRAVITÉ</b></div><span class="faint num" style="font-size:13px">' + st + ' / 5</span></div>' +
      '<div class="ob-steps">' + [1, 2, 3, 4, 5].map(function (k) { return '<i class="' + (k <= st ? 'on' : '') + '"></i>'; }).join('') + '</div>';
    if (st === 1) {
      html += '<div><h1 class="title-lg">Faisons connaissance</h1><p class="muted" style="margin-top:6px">Ton prénom est facultatif. Ton objectif règle le nombre de séries et les temps de repos.</p></div>' +
        '<div class="field"><label for="ob-name">Prénom</label><input id="ob-name" class="input" maxlength="30" autocomplete="given-name" placeholder="Ton prénom" value="' + esc(OB.name) + '"></div>' +
        '<div class="options" data-group="goal">' + Object.keys(D.GOALS).map(function (k, i) {
          var g = D.GOALS[k];
          return optBtn('goal', k, ['F', 'M', 'E'][i], g.name, g.desc + ' ' + g.sets + ' séries, ' + g.rest + ' s de repos.');
        }).join('') + '</div>';
    } else if (st === 2) {
      html += '<div><h1 class="title-lg">Combien de pompes d’affilée ?</h1><p class="muted" style="margin-top:6px">Des pompes classiques, poitrine près du sol, sans t’arrêter.</p></div>' +
        '<div class="options" data-group="push">' + PUSH_OPTS.map(function (o) { return optBtn('push', o[0], o[1], o[2]); }).join('') + '</div>';
    } else if (st === 3) {
      html += '<div><h1 class="title-lg">Et les tractions ?</h1><p class="muted" style="margin-top:6px">Sans barre, tu travailleras le dos avec des rowings sous une table solide.</p></div>' +
        '<div class="options" data-group="pull">' + PULL_OPTS.map(function (o) { return optBtn('pull', o[0], o[1], o[2]); }).join('') + '</div>';
    } else if (st === 4) {
      html += '<div><h1 class="title-lg">Ton niveau en ATR</h1><p class="muted" style="margin-top:6px">L’ATR, c’est l’équilibre sur les mains. On le construit pas à pas.</p></div>' +
        '<div class="options" data-group="atr">' + ATR_OPTS.map(function (o) { return optBtn('atr', o[0], o[1], o[2], o[3]); }).join('') + '</div>';
    } else if (st === 5) {
      html += '<div><h1 class="title-lg">Combien de séances par semaine ?</h1><p class="muted" style="margin-top:6px">Mieux vaut 3 séances tenues que 6 abandonnées. Tu pourras changer ensuite.</p></div>' +
        '<div class="options" data-group="days">' + [2, 3, 4, 5, 6].map(function (n) {
          var names = D.WEEK_PLANS[n].map(function (t) { return D.TEMPLATES[t].name; }).join(', ');
          return optBtn('days', n, n, n === 3 ? 'Recommandé pour débuter' : n <= 2 ? 'Le minimum efficace' : n >= 5 ? 'Pour les motivés' : 'Rythme soutenu', names);
        }).join('') + '</div>';
    }
    html += '<div class="ob-nav"><button class="btn icon" type="button" data-act="ob-back" aria-label="Retour" style="transform:scaleX(-1)">' + I.chevR + '</button>' +
      '<button class="btn primary lg" type="button" data-act="' + (st === 5 ? 'ob-finish' : 'ob-next') + '" id="ob-next"' + (obReady() ? '' : ' disabled') + '>' + (st === 5 ? 'Générer mon programme' : 'Continuer') + '</button></div></section>';
    return html;
  }
  function applyOnboarding() {
    var s = S, pi = +OB.push;
    s.profile.name = OB.name.trim().slice(0, 30);
    s.profile.goal = OB.goal;
    s.profile.days = +OB.days;
    s.profile.bar = OB.pull !== 'nobar';
    s.prog.push = ['pompes-inclinees', 'pompes', 'pompes-diamant', 'pompes-declinees'][pi];
    s.prog.legs = ['squats', 'fentes', 'squats-bulgares', 'squats-sautes'][pi];
    s.prog.core = ['planche', 'genoux-sol', 'hollow', 'jambes-sol'][pi];
    s.prog.pull = { nobar: 'rowing-incline', '0': 'rowing-australien', '1': 'chin-ups', '2': 'tractions', '3': 'tractions-archer' }[OB.pull];
    s.prog.atr = { never: 'pompes-pike', wall: 'atr-mur', free: 'atr-libre' }[OB.atr];
    if (!s.createdAt) s.createdAt = Date.now();
    s.onboarded = true;
    save();
  }

  /* ================= Feuilles modales & toasts ================= */
  function openSheet(html, label) {
    closeSheet();
    var sc = document.createElement('div');
    sc.className = 'scrim';
    sc.id = 'sheet';
    sc.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(label || 'Détails') + '"><span class="grab" aria-hidden="true"></span>' + html + '</div>';
    sc.addEventListener('click', function (e) { if (e.target === sc) closeSheet(); });
    document.body.appendChild(sc);
    var f = sc.querySelector('button, input, textarea');
    if (f) { try { f.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
  }
  function closeSheet() { var s = $('#sheet'); if (s) s.remove(); }
  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast');
    if (t) t.remove();
    t = document.createElement('div');
    t.className = 'toast'; t.id = 'toast'; t.setAttribute('role', 'status');
    t.textContent = msg;
    document.body.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.remove(); }, 2600);
  }

  function exSheet(id) {
    var e = EXM[id], f = FAM[e.f], c = chain(e.f, S), cur = curEx(e.f, S), idx = c.indexOf(e), ci = c.indexOf(cur), next = c[idx + 1];
    var g = D.GOALS[S.profile.goal];
    var status = idx < 0 ? 'Nécessite une barre de traction' : idx < ci ? 'Niveau acquis' : idx === ci ? 'Ton niveau actuel' : 'Pas encore débloqué';
    var html = '<div style="display:flex;gap:14px;align-items:center">' + picto(e.f, 'lg') + '<div style="min-width:0"><p class="eyebrow">' + f.name + (idx >= 0 ? ' · niveau ' + (idx + 1) + ' sur ' + c.length : '') + '</p><h2 class="title-lg" style="margin-top:4px">' + esc(e.name) + '</h2></div></div>' +
      '<div class="summary-chips"><span class="chip violet">' + status + '</span><span class="chip">' + (e.type === 'time' ? 'Chrono' : 'Répétitions') + (e.side ? ', par côté' : '') + '</span>' +
      (idx >= 0 ? '<span class="chip">Objectif ' + targetOf(e, S) + unitShort(e) + '</span>' : '') + '</div>' +
      '<div class="cues">' + e.cues.map(function (q) { return '<div>' + I.check + '<span>' + esc(q) + '</span></div>'; }).join('') + '</div>' +
      '<p class="muted" style="font-size:14px">' + (next ? 'Pour débloquer <b>' + esc(next.name) + '</b> : tiens ' + e.unlock + unitShort(e) + ' sur tes ' + g.sets + ' séries principales.' : idx >= 0 ? 'C’est le dernier niveau de cette famille. Continue de monter l’objectif.' : 'Active la barre de traction dans ton profil pour ce niveau.') + '</p>' +
      '<div class="sheet-actions">' + (idx >= 0 && idx !== ci ? '<button class="btn primary block" type="button" data-act="set-level" data-id="' + e.id + '">' + (idx < ci ? 'Revenir à ce niveau' : 'Je maîtrise déjà : passer à ce niveau') + '</button>' : '') +
      '<button class="btn block ghost" type="button" data-act="sheet-close">Fermer</button></div>';
    openSheet(html, e.name);
  }

  /* ================= Effet verre liquide ================= */
  var LIQUID = '.btn, .option, .fb, .seg button, .fam-tab';
  document.addEventListener('pointerdown', function (e) {
    var el = e.target.closest && e.target.closest(LIQUID);
    if (!el || el.disabled) return;
    var r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    var d = Math.max(r.width, r.height) * (el.classList.contains('btn') ? 1.5 : 1.1);
    var drop = document.createElement('span');
    drop.className = 'lg-drop';
    drop.style.setProperty('--x', x + 'px');
    drop.style.setProperty('--y', y + 'px');
    drop.style.setProperty('--d', Math.min(d, 520) + 'px');
    el.appendChild(drop);
    setTimeout(function () { drop.remove(); }, 900);
    if (el.classList.contains('btn')) {
      el.style.setProperty('--mx', x + 'px'); el.style.setProperty('--my', y + 'px');
      el.classList.remove('squish');
      el.classList.add('is-pressed');
    }
  }, { passive: true });
  function release(e) {
    var el = e.target.closest && e.target.closest('.btn.is-pressed');
    $$('.btn.is-pressed').forEach(function (b) {
      b.classList.remove('is-pressed');
      if (b === el && !reduceMotion) { void b.offsetWidth; b.classList.add('squish'); }
    });
  }
  document.addEventListener('pointerup', release, { passive: true });
  document.addEventListener('pointercancel', release, { passive: true });
  document.addEventListener('animationend', function (e) { if (e.animationName === 'squish') e.target.classList.remove('squish'); });
  document.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var el = e.target.closest && e.target.closest('.btn');
    if (!el) return;
    var r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ================= Actions ================= */
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-act]');
    var tipT = e.target.closest && e.target.closest('[data-tip]');
    if (tipT && !el) { showTip(tipT); return; }
    if (!tipT) hideTip();
    if (!el || el.disabled) return;
    var act = el.getAttribute('data-act');
    // Laisse la goutte de verre s'afficher avant de changer d'écran.
    var delayed = /^(start|resume|nav|ob-next|ob-back|ob-finish|ob-done|demo-start|demo-exit|pl-next|pl-set-done|pl-skip|pl-finish|pl-exit|pl-hold-start)$/.test(act) && el.matches(LIQUID) && !reduceMotion;
    if (delayed) setTimeout(function () { handle(act, el); }, 120); else handle(act, el);
  });

  function handle(act, el) {
    var ds = el.dataset;
    if (act.indexOf('pl-') === 0) return playerAction(act, el);
    switch (act) {
      case 'nav': go(ds.view); break;
      case 'start': startWorkout(ds.tpl); break;
      case 'resume': var r = readResume(); if (r) startWorkout(r.sess.tpl, r); break;
      case 'resume-drop': clearResume(); render(); break;
      case 'fam': ui.fam = ds.f; render(); break;
      case 'fam-open': ui.fam = ds.f; go('progres'); setTimeout(function () { var p = $('.fam-tabs'); if (p) p.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }); }, 60); break;
      case 'ex-info': exSheet(ds.id); break;
      case 'set-level':
        var e = EXM[ds.id];
        S.prog[e.f] = e.id; save(); closeSheet(); render(); toast('Niveau mis à jour : ' + e.name); break;
      case 'badge':
        var b = D.BADGES.find(function (x) { return x.id === ds.id; }), at = S.badges[b.id];
        openSheet('<div style="display:grid;justify-items:center;gap:10px;text-align:center"><div style="width:84px">' + badgeIcon(!!at) + '</div><h2 class="title-lg">' + b.name + '</h2><p class="muted">' + b.desc + '</p>' +
          '<span class="chip ' + (at ? 'good' : '') + '">' + (at ? 'Obtenu le ' + fmtDate(new Date(at), { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pas encore obtenu') + '</span></div>' +
          '<button class="btn block ghost" type="button" data-act="sheet-close">Fermer</button>', b.name);
        break;
      case 'hist-toggle': ui.histAll = !ui.histAll; render(); break;
      case 'sheet-close': closeSheet(); break;

      case 'pf-goal':
        S.profile.goal = ds.v; save();
        $$('[data-act="pf-goal"]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === el)); });
        var gd = $('#pf-goal-desc'); if (gd) gd.textContent = D.GOALS[ds.v].desc;
        break;
      case 'pf-days':
        S.profile.days = +ds.v; save();
        $$('[data-act="pf-days"]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === el)); });
        break;
      case 'pf-bar':
        S.profile.bar = !S.profile.bar; save(); el.setAttribute('aria-checked', String(S.profile.bar));
        toast(S.profile.bar ? 'Exercices à la barre activés' : 'Programme adapté sans barre');
        break;
      case 'pf-sound':
        S.profile.sound = !S.profile.sound; save(); el.setAttribute('aria-checked', String(S.profile.sound));
        if (S.profile.sound) { ensureAudio(); beep(880, 0.12); }
        break;
      case 'retake':
        OB = { active: true, step: 2, name: S.profile.name, goal: S.profile.goal, push: null, pull: null, atr: null, days: S.profile.days, retake: true };
        render(); window.scrollTo(0, 0); break;
      case 'export':
        openSheet('<h2 class="title-lg">Exporter ma progression</h2><p class="muted" style="font-size:14px">Copie ce texte et garde-le en lieu sûr. Tu pourras le coller dans Importer sur un autre appareil.</p>' +
          '<textarea id="ex-data" class="input" readonly>' + esc(JSON.stringify(S)) + '</textarea>' +
          '<div class="sheet-actions"><button class="btn primary block" type="button" data-act="copy-export">' + I.copy + 'Copier</button><button class="btn block ghost" type="button" data-act="sheet-close">Fermer</button></div>', 'Exporter');
        break;
      case 'copy-export':
        var ta = $('#ex-data');
        var fallback = function () { ta.focus(); ta.select(); toast('Texte sélectionné : copie-le avec ton clavier'); };
        try {
          navigator.clipboard.writeText(ta.value).then(function () { toast('Progression copiée'); }, fallback);
        } catch (err) { fallback(); }
        break;
      case 'import':
        openSheet('<h2 class="title-lg">Importer une progression</h2><p class="muted" style="font-size:14px">Colle ici le texte exporté. Il remplacera la progression actuelle de cet appareil.</p>' +
          '<label class="sr-only" for="im-data">Texte exporté</label><textarea id="im-data" class="input" placeholder="{&quot;v&quot;:1, …}"></textarea><p id="im-err" class="faint" style="font-size:13px;color:var(--bad)" hidden></p>' +
          '<div class="sheet-actions"><button class="btn primary block" type="button" data-act="do-import">Importer</button><button class="btn block ghost" type="button" data-act="sheet-close">Annuler</button></div>', 'Importer');
        break;
      case 'do-import':
        var parsed = null;
        try { parsed = normalize(JSON.parse($('#im-data').value)); } catch (err) { parsed = null; }
        if (!parsed) { var er = $('#im-err'); er.hidden = false; er.textContent = 'Ce texte n’est pas une progression Gravité valide. Vérifie que tu as tout copié, du premier { au dernier }.'; break; }
        parsed.onboarded = true;
        REAL = S = parsed; demo = false; save(); closeSheet(); render(); toast('Progression importée');
        break;
      case 'reset':
        openSheet('<h2 class="title-lg">Tout effacer ?</h2><p class="muted">Ton historique, tes niveaux, tes records et tes badges seront supprimés. Cette action est définitive.</p>' +
          '<div class="sheet-actions"><button class="btn block danger" type="button" data-act="do-reset">' + I.trash + 'Oui, tout effacer</button><button class="btn primary block" type="button" data-act="sheet-close">Garder ma progression</button></div>', 'Tout effacer');
        break;
      case 'do-reset':
        REAL = S = blankState(); demo = false; clearResume(); save(); closeSheet();
        OB = { active: false, step: 0, name: '', goal: null, push: null, pull: null, atr: null, days: 3, retake: false };
        render(); window.scrollTo(0, 0);
        break;

      case 'demo-start':
        demo = true; S = makeDemo(); view = 'accueil'; render(); window.scrollTo(0, 0); toast('Exemple chargé : 10 semaines fictives'); break;
      case 'demo-exit':
        demo = false; S = REAL;
        if (!S.onboarded) OB = { active: false, step: 1, name: '', goal: null, push: null, pull: null, atr: null, days: 3, retake: false };
        render(); window.scrollTo(0, 0); break;

      case 'ob-pick':
        OB[ds.k] = ds.k === 'days' ? +ds.v : ds.v;
        $$('[data-act="ob-pick"][data-k="' + ds.k + '"]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === el)); });
        var nb = $('#ob-next'); if (nb) nb.disabled = !obReady();
        break;
      case 'ob-next':
        if (OB.step > 0 && !obReady()) break;
        OB.active = true; OB.step = Math.min(5, OB.step + 1); render(); window.scrollTo(0, 0); break;
      case 'ob-back':
        if (OB.retake && OB.step <= 2) { OB.active = false; render(); break; }
        OB.step = Math.max(0, OB.step - 1); if (OB.step === 0) OB.active = false; render(); break;
      case 'ob-finish':
        if (!obReady()) break;
        applyOnboarding(); OB.step = 6; OB.active = true; render(); window.scrollTo(0, 0); break;
      case 'ob-done':
        OB.active = false; OB.step = 0; view = 'accueil'; render(); window.scrollTo(0, 0); break;
    }
  }

  document.addEventListener('input', function (e) {
    if (e.target.id === 'ob-name') OB.name = e.target.value;
    if (e.target.id === 'pf-name') {
      S.profile.name = e.target.value.trim().slice(0, 30);
      clearTimeout(document._nameT);
      document._nameT = setTimeout(save, 500);
    }
  });

  /* ================= Audio, vibrations, écran allumé ================= */
  var audioCtx = null;
  function ensureAudio() {
    try {
      if (!audioCtx) { var AC = window.AudioContext || window.webkitAudioContext; if (AC) audioCtx = new AC(); }
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) { audioCtx = null; }
  }
  function beep(freq, dur, when) {
    if (!S.profile.sound || !audioCtx) return;
    try {
      var t = audioCtx.currentTime + (when || 0), o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* ignore */ }
  }
  function signalEnd() {
    beep(660, 0.14); beep(880, 0.14, 0.16); beep(1175, 0.25, 0.32);
    if (S.profile.sound) { try { navigator.vibrate && navigator.vibrate([90, 60, 90, 60, 160]); } catch (e) { /* ignore */ } }
  }
  var wakeLock = null;
  function requestWake() {
    try {
      if (navigator.wakeLock && navigator.wakeLock.request) {
        navigator.wakeLock.request('screen').then(function (l) { wakeLock = l; }, function () { wakeLock = null; });
      }
    } catch (e) { wakeLock = null; }
  }
  function releaseWake() { try { if (wakeLock) wakeLock.release(); } catch (e) { /* ignore */ } wakeLock = null; }
  document.addEventListener('visibilitychange', function () { if (PL && document.visibilityState === 'visible') requestWake(); });

  /* ================= Lecteur de séance ================= */
  var PL = null;
  var playerRoot = $('#player-root');

  function serializeSess(sess) {
    return { tpl: sess.tpl, name: sess.name, items: sess.items.map(function (it) { return { id: it.ex.id, sets: it.sets, target: it.target, rest: it.rest, main: it.main }; }) };
  }
  function reviveSess(o) {
    return { tpl: o.tpl, name: o.name, items: o.items.filter(function (it) { return EXM[it.id]; }).map(function (it) { return { ex: EXM[it.id], sets: it.sets, target: it.target, rest: it.rest, main: it.main }; }) };
  }
  function readResume() {
    if (demo) return null;
    try {
      var r = JSON.parse(localStorage.getItem(RESUME_KEY) || 'null');
      if (!r || !r.sess || Date.now() - r.startedAt > 4 * 3600e3) return null;
      return r;
    } catch (e) { return null; }
  }
  function writeResume() {
    if (demo || !PL || PL.steps[PL.i].k === 'done') return;
    try { localStorage.setItem(RESUME_KEY, JSON.stringify({ sess: serializeSess(PL.sess), log: PL.log, i: PL.i, startedAt: PL.startedAt, advance: PL.advance })); } catch (e) { /* ignore */ }
  }
  function clearResume() { try { localStorage.removeItem(RESUME_KEY); } catch (e) { /* ignore */ } }

  function buildSteps(sess) {
    var steps = [{ k: 'warm' }];
    sess.items.forEach(function (it, i) {
      for (var s = 0; s < it.sets; s++) {
        steps.push({ k: 'set', i: i, s: s });
        var lastSet = s === it.sets - 1, lastItem = i === sess.items.length - 1;
        if (!(lastSet && lastItem)) steps.push({ k: 'rest', i: i, s: s, dur: it.rest, ni: lastSet ? i + 1 : i, ns: lastSet ? 0 : s + 1 });
      }
    });
    steps.push({ k: 'done' });
    return steps;
  }

  function startWorkout(tplId, resume) {
    var sess = resume ? reviveSess(resume.sess) : buildSession(tplId, S);
    if (!sess.items.length) return;
    PL = {
      sess: sess, steps: buildSteps(sess), i: resume ? Math.min(resume.i, 9999) : 0,
      log: resume ? resume.log : sess.items.map(function (it) { var a = []; for (var k = 0; k < it.sets; k++) a.push(null); return a; }),
      startedAt: resume ? resume.startedAt : Date.now(),
      advance: resume ? !!resume.advance : tplId === nextTpl(S),
      endAt: 0, hold: null, value: 0, phase: 'fb', fb: null, result: null, lastBeep: null, tick: null
    };
    if (PL.i >= PL.steps.length) PL.i = PL.steps.length - 1;
    ensureAudio(); requestWake();
    document.body.style.overflow = 'hidden';
    PL.tick = setInterval(tick, 200);
    enterStep();
  }
  function closePlayer() {
    if (!PL) return;
    clearInterval(PL.tick);
    PL = null;
    releaseWake();
    playerRoot.innerHTML = '';
    document.body.style.overflow = '';
    closeSheet();
    render();
    window.scrollTo(0, 0);
  }
  function curStep() { return PL.steps[PL.i]; }
  function enterStep() {
    var st = curStep();
    PL.lastBeep = null;
    if (st.k === 'set') {
      var it = PL.sess.items[st.i];
      PL.value = PL.log[st.i][st.s] != null ? PL.log[st.i][st.s] : it.target;
      PL.hold = it.ex.type === 'time' ? { state: 'idle', endAt: 0 } : null;
    } else if (st.k === 'rest') {
      PL.endAt = Date.now() + st.dur * 1000;
    } else if (st.k === 'done') {
      PL.phase = 'fb';
      clearResume();
    }
    writeResume();
    renderPlayer();
  }
  function nextStep() { if (PL.i < PL.steps.length - 1) { PL.i++; enterStep(); } }
  function fmtClock(ms) { var t = Math.max(0, Math.round(ms / 1000)); return Math.floor(t / 60) + ':' + pad(t % 60); }

  function ring(pct, big, label) {
    var R = 54, C = 2 * Math.PI * R;
    return '<div class="ring"><svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d4bcff"/><stop offset="1" stop-color="#6a3bf0"/></linearGradient></defs>' +
      '<circle class="track" cx="60" cy="60" r="' + R + '" fill="none" stroke-width="7"/>' +
      '<circle class="meter" id="ring-meter" cx="60" cy="60" r="' + R + '" fill="none" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + C.toFixed(2) + '" stroke-dashoffset="' + (C * (1 - pct)).toFixed(2) + '"/></svg>' +
      '<div class="center"><span class="num" id="ring-num">' + big + '</span><span>' + label + '</span></div></div>';
  }
  function setRing(pct, big) {
    var m = $('#ring-meter'), n = $('#ring-num');
    if (m) { var C = 2 * Math.PI * 54; m.setAttribute('stroke-dashoffset', (C * (1 - clamp(pct, 0, 1))).toFixed(2)); }
    if (n) n.textContent = big;
  }

  function renderPlayer() {
    var st = curStep(), sess = PL.sess, body = '', actions = '';
    var seg = '<div class="segbar" aria-hidden="true">' + sess.items.map(function (it, i) {
      var n = PL.log[i].filter(function (v) { return v != null; }).length;
      return '<i><b style="--p:' + Math.round(n / it.sets * 100) + '%"></b></i>';
    }).join('') + '</div>';
    var top = '<div><div class="player-top"><button class="btn icon sm ghost" type="button" data-act="pl-close" aria-label="Quitter la séance">' + I.close + '</button>' +
      '<span class="ttl">' + esc(sess.name) + '</span><span class="clock" id="pl-clock">' + fmtClock(Date.now() - PL.startedAt) + '</span></div>' + seg + '</div>';

    if (st.k === 'warm') {
      body = '<div class="stage"><span class="set-label">Échauffement · 3 min</span><h2 class="ex-title">Réveille tes articulations</h2>' +
        '<div class="warm-list">' + D.WARMUP.map(function (w, k) { return '<div class="warm-row"><span class="n">' + (k + 1) + '</span><span>' + w.name + '</span><span class="d">' + w.dose + '</span></div>'; }).join('') + '</div>' +
        '<p class="faint" style="font-size:13px">Au programme : ' + sess.items.map(function (it) { return esc(it.ex.name); }).join(', ') + '.</p></div>';
      actions = '<button class="btn primary lg block" type="button" data-act="pl-next">' + I.play + 'Échauffement terminé</button>';
    } else if (st.k === 'set') {
      var it = sess.items[st.i], e = it.ex, isTime = e.type === 'time';
      body = '<div class="stage">' + picto(e.f, 'lg') + '<span class="set-label">Série ' + (st.s + 1) + ' / ' + it.sets + (it.main ? '' : ' · volume') + '</span>' +
        '<h2 class="ex-title">' + esc(e.name) + '</h2>';
      if (!isTime) {
        body += '<div><div class="big-target">' + it.target + '</div><div class="big-unit">' + unitLong(e, it.target) + '</div></div>';
      } else {
        var h = PL.hold, left = h.state === 'run' ? Math.max(0, (h.endAt - Date.now()) / 1000) : h.state === 'end' ? 0 : it.target;
        body += ring(h.state === 'idle' ? 1 : left / it.target, h.state === 'end' ? it.target : Math.ceil(left), h.state === 'run' ? 'Tiens bon' : h.state === 'end' ? 'objectif (s)' : 'secondes' + (e.side ? ' par côté' : ''));
      }
      body += '<div class="cues">' + e.cues.map(function (q) { return '<div>' + I.check + '<span>' + esc(q) + '</span></div>'; }).join('') + '</div>';
      if (!isTime || PL.hold.state === 'end') {
        body += '<div class="stepper"><button class="btn icon" type="button" data-act="pl-minus" aria-label="Moins">' + I.minus + '</button>' +
          '<div class="val" aria-live="polite"><span id="pl-val">' + PL.value + '</span><small>' + (isTime ? 'SECONDES TENUES' : 'RÉPÉTITIONS FAITES') + '</small></div>' +
          '<button class="btn icon" type="button" data-act="pl-plus" aria-label="Plus">' + I.plus + '</button></div>';
      }
      body += '</div>';
      if (isTime && PL.hold.state === 'idle') {
        actions = '<button class="btn primary lg block" type="button" data-act="pl-hold-start">' + I.timer + 'Lancer le chrono</button>' +
          '<div class="row"><button class="btn ghost" type="button" data-act="pl-hold-manual">Saisir mon temps</button><button class="btn ghost" type="button" data-act="pl-skip">' + I.skip + 'Passer</button></div>';
      } else if (isTime && PL.hold.state === 'run') {
        actions = '<button class="btn lg block" type="button" data-act="pl-hold-stop">J’arrête ici</button>';
      } else {
        actions = '<button class="btn primary lg block" type="button" data-act="pl-set-done">' + I.check + 'Série validée</button>' +
          '<div class="row"><button class="btn ghost" type="button" data-act="pl-info">' + I.info + 'Niveaux</button><button class="btn ghost" type="button" data-act="pl-skip">' + I.skip + 'Passer</button></div>';
      }
    } else if (st.k === 'rest') {
      var nx = sess.items[st.ni], left2 = Math.max(0, (PL.endAt - Date.now()) / 1000);
      body = '<div class="stage"><span class="set-label">Récupération</span>' + ring(left2 / st.dur, fmtClock(left2 * 1000), 'repos') +
        '<div class="next-up">' + picto(nx.ex.f) + '<div><span>' + (st.ni !== st.i ? 'Exercice suivant' : 'Série suivante') + '</span><b>' + esc(nx.ex.name) + '</b><span>Série ' + (st.ns + 1) + ' / ' + nx.sets + ' · objectif ' + nx.target + unitShort(nx.ex) + (nx.ex.side ? ' par côté' : '') + '</span></div></div>' +
        '<p class="faint" style="font-size:13px">Respire, secoue les bras, bois une gorgée d’eau.</p></div>';
      actions = '<div class="row"><button class="btn" type="button" data-act="pl-rest-add">+15 s</button><button class="btn primary" type="button" data-act="pl-next">' + I.skip + 'Passer</button></div>';
    } else if (st.k === 'done') {
      var tot = totalsOf(PL);
      if (PL.phase === 'fb') {
        if (!tot.sets) {
          body = '<div class="stage"><h2 class="ex-title">Aucune série enregistrée</h2><p class="muted">Rien à sauvegarder pour cette fois. Ta prochaine séance t’attend.</p></div>';
          actions = '<button class="btn primary lg block" type="button" data-act="pl-exit">Retour à l’accueil</button>';
        } else {
          body = '<div class="stage"><span class="set-label">Séance terminée</span><h2 class="ex-title">Bien joué' + (S.profile.name ? ' ' + esc(S.profile.name) : '') + ' !</h2>' +
            '<div class="summary-grid"><div class="stat"><div class="v">' + Math.max(1, Math.round((Date.now() - PL.startedAt) / 60000)) + '</div><div class="l">minutes</div></div>' +
            '<div class="stat"><div class="v">' + tot.sets + '</div><div class="l">séries</div></div><div class="stat"><div class="v">' + fmtInt(tot.reps) + '</div><div class="l">répétitions' + (tot.secs ? ' · ' + tot.secs + ' s' : '') + '</div></div></div>' +
            '<p style="font-weight:800;margin-top:6px">Comment c’était ?</p><div class="fb-options">' +
            [['easy', I.easy, 'Trop facile'], ['ok', I.ok, 'Parfait'], ['hard', I.hard, 'Difficile']].map(function (o) {
              return '<button class="fb" type="button" data-act="pl-fb" data-v="' + o[0] + '" aria-pressed="' + (PL.fb === o[0]) + '">' + o[1] + o[2] + '</button>';
            }).join('') + '</div><p class="faint" style="font-size:12.5px">Ta réponse règle la vitesse de progression de tes objectifs.</p></div>';
          actions = '<button class="btn primary lg block" type="button" data-act="pl-finish" id="pl-finish"' + (PL.fb ? '' : ' disabled') + '>' + I.check + 'Enregistrer la séance</button>';
        }
      } else {
        var R = PL.result, rw = [];
        if (R.rankUp) rw.push(reward(I.bolt, 'Nouveau rang : ' + R.rankUp, 'Ton expérience te fait monter en grade.'));
        R.unlocks.forEach(function (id) { var x = EXM[id]; rw.push(reward(PIC[x.f], 'Niveau débloqué : ' + esc(x.name), FAM[x.f].name + ' · nouvel objectif ' + targetOf(x, S) + unitShort(x))); });
        R.badges.forEach(function (id) { var b = D.BADGES.find(function (y) { return y.id === id; }); rw.push(reward(I.star, 'Badge : ' + b.name, b.desc)); });
        R.prs.forEach(function (p) { var x = EXM[p.id]; rw.push(reward(I.trophy, 'Record : ' + esc(x.name), p.v + (x.type === 'time' ? ' s' : ' répétitions') + ' en une série')); });
        var ups = R.changes.filter(function (c) { return c.to > c.from; });
        if (ups.length) rw.push(reward(I.up, 'Objectifs relevés', ups.map(function (c) { var x = EXM[c.id]; return esc(x.name) + ' ' + c.from + ' → ' + c.to + unitShort(x); }).join(' · ')));
        if (!rw.length) rw.push(reward(I.target, 'Objectifs maintenus', 'Garde les mêmes objectifs à la prochaine séance pour les réussir en entier.'));
        var rank = rankOf(S.xp);
        body = '<div class="stage"><span class="set-label">Expérience gagnée</span><div class="xp-burst" id="xp-burst">+0 XP</div>' +
          '<div style="width:100%;display:grid;gap:6px"><div class="progress"><i style="width:' + Math.round(rank.pct * 100) + '%"></i></div><div class="rank-foot"><span>' + rank.cur.name + '</span><span>' + (rank.nxt ? fmtInt(rank.nxt.xp - S.xp) + ' XP pour ' + rank.nxt.name : 'Rang max') + '</span></div></div>' +
          '<div class="reward-list">' + rw.join('') + '</div></div>';
        actions = '<button class="btn primary lg block" type="button" data-act="pl-exit">Retour à l’accueil</button>';
      }
    }
    playerRoot.innerHTML = '<div class="player" role="dialog" aria-modal="true" aria-label="Séance en cours"><div class="player-inner">' + top + body + '<div class="player-actions">' + actions + '</div></div></div>';
    if (st.k === 'done' && PL.phase === 'res') animateXp(PL.result.xp);
  }
  function reward(icon, title, sub) {
    return '<div class="reward"><span class="ic">' + icon + '</span><div><b>' + title + '</b><span>' + sub + '</span></div></div>';
  }
  function totalsOf(pl) {
    var t = { sets: 0, reps: 0, secs: 0 };
    pl.sess.items.forEach(function (it, i) {
      pl.log[i].forEach(function (v) { if (v == null) return; t.sets++; if (it.ex.type === 'time') t.secs += v; else t.reps += v; });
    });
    return t;
  }
  function animateXp(xp) {
    var el = $('#xp-burst'), t0 = performance.now(), dur = reduceMotion ? 1 : 1100;
    (function frame(t) {
      if (!el.isConnected) return;
      var p = clamp((t - t0) / dur, 0, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = '+' + fmtInt(xp * eased) + ' XP';
      if (p < 1) requestAnimationFrame(frame);
    })(t0);
    confetti();
  }

  function tick() {
    if (!PL) return;
    var c = $('#pl-clock');
    if (c) c.textContent = fmtClock(Date.now() - PL.startedAt);
    var st = curStep(), left;
    if (st.k === 'rest') {
      left = (PL.endAt - Date.now()) / 1000;
      setRing(left / st.dur, fmtClock(Math.max(0, left) * 1000));
      countdownBeeps(left);
      if (left <= 0) { signalEnd(); nextStep(); }
    } else if (st.k === 'set' && PL.hold && PL.hold.state === 'run') {
      var it = PL.sess.items[st.i];
      left = (PL.hold.endAt - Date.now()) / 1000;
      setRing(left / it.target, Math.max(0, Math.ceil(left)));
      countdownBeeps(left);
      if (left <= 0) { signalEnd(); PL.hold.state = 'end'; PL.value = it.target; renderPlayer(); }
    }
  }
  function countdownBeeps(left) {
    var s = Math.ceil(left);
    if (s <= 3 && s >= 1 && PL.lastBeep !== s) { PL.lastBeep = s; beep(520, 0.08); }
  }

  function playerAction(act, el) {
    if (!PL && act !== 'pl-exit') return;
    var st = PL ? curStep() : null;
    switch (act) {
      case 'pl-next': nextStep(); break;
      case 'pl-minus':
      case 'pl-plus':
        var e = PL.sess.items[st.i].ex, step = e.type === 'time' ? 1 : 1;
        PL.value = clamp(PL.value + (act === 'pl-plus' ? step : -step), 0, 999);
        var v = $('#pl-val'); if (v) v.textContent = PL.value;
        break;
      case 'pl-set-done':
        PL.log[st.i][st.s] = PL.value;
        nextStep();
        break;
      case 'pl-skip':
        PL.log[st.i][st.s] = null;
        nextStep();
        if (curStep().k === 'rest') nextStep();
        break;
      case 'pl-hold-start':
        PL.hold.state = 'run';
        PL.hold.endAt = Date.now() + PL.sess.items[st.i].target * 1000;
        PL.hold.startedAt = Date.now();
        renderPlayer();
        break;
      case 'pl-hold-stop':
        PL.hold.state = 'end';
        PL.value = Math.max(1, Math.round((Date.now() - PL.hold.startedAt) / 1000));
        renderPlayer();
        break;
      case 'pl-hold-manual':
        PL.hold.state = 'end'; PL.value = PL.sess.items[st.i].target; renderPlayer();
        break;
      case 'pl-rest-add': PL.endAt += 15000; break;
      case 'pl-info': exSheet(PL.sess.items[st.i].ex.id); break;
      case 'pl-fb':
        PL.fb = el.dataset.v;
        $$('[data-act="pl-fb"]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === el)); });
        var fbtn = $('#pl-finish'); if (fbtn) fbtn.disabled = false;
        break;
      case 'pl-finish':
        if (!PL.fb || PL.result) break;
        var before = rankOf(S.xp).i;
        var res = applySession(PL.sess, PL.log, PL.fb, new Date(), S, { advance: PL.advance, dur: Math.round((Date.now() - PL.startedAt) / 1000) });
        if (!res) { closePlayer(); break; }
        save(); clearResume();
        var after = rankOf(S.xp).i;
        res.rankUp = after > before ? D.RANKS[after].name : null;
        PL.result = res; PL.phase = 'res';
        renderPlayer();
        break;
      case 'pl-close':
        if (st.k === 'done') { closePlayer(); break; }
        var any = totalsOf(PL).sets > 0;
        openSheet('<h2 class="title-lg">Quitter la séance ?</h2><p class="muted">' + (any ? 'Tu peux terminer maintenant et enregistrer les séries déjà faites.' : 'Aucune série n’est encore enregistrée.') + '</p>' +
          '<div class="sheet-actions">' + (any ? '<button class="btn primary block" type="button" data-act="pl-end-now">' + I.check + 'Terminer et enregistrer</button>' : '') +
          '<button class="btn block" type="button" data-act="sheet-close">Continuer la séance</button>' +
          '<button class="btn block danger ghost" type="button" data-act="pl-abandon">Abandonner sans enregistrer</button></div>', 'Quitter la séance');
        break;
      case 'pl-end-now':
        closeSheet(); PL.i = PL.steps.length - 1; enterStep(); break;
      case 'pl-abandon':
        clearResume(); closePlayer(); break;
      case 'pl-exit':
        closePlayer(); break;
    }
  }

  /* Confettis violets à la fin d'une séance. */
  function confetti() {
    if (reduceMotion) return;
    var cv = document.createElement('canvas');
    cv.className = 'confetti';
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    document.body.appendChild(cv);
    var ctx = cv.getContext('2d'), cols = ['#c7aaff', '#9d70ff', '#e07bff', '#ffffff', '#7f8dff', '#ffb35c'], parts = [];
    for (var k = 0; k < 140; k++) {
      parts.push({ x: innerWidth / 2 + (Math.random() - 0.5) * 80, y: innerHeight * 0.32, vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 13 - 4,
        r: Math.random() * 5 + 3, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4, c: cols[k % cols.length], life: 0 });
    }
    var t0 = performance.now();
    (function frame(t) {
      var el = (t - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach(function (p) {
        p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
        ctx.globalAlpha = Math.max(0, 1 - el / 2.6);
        ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        ctx.restore();
      });
      if (el < 2.6) requestAnimationFrame(frame); else cv.remove();
    })(t0);
  }

  /* ================= Démarrage ================= */
  render();
  Store.connect().then(function (remote) {
    var r = remote ? normalize(remote) : null;
    if (r && (r.updatedAt || 0) > (REAL.updatedAt || 0)) {
      REAL = r; Store.writeLocal(REAL);
      if (!demo && !PL) { S = REAL; render(); }
      else if (!demo) S = REAL;
    } else if (Store.ref && REAL.onboarded && (!r || (REAL.updatedAt || 0) > (r.updatedAt || 0))) {
      Store.queueRemote(REAL);
    }
    if (view === 'profil' && !PL && !demo && S.onboarded) render();
  });

  // Application installable (hors Artifact) : cache hors ligne.
  try {
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && window.top === window && !window.claude) {
      window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* ignore */ }); });
    }
  } catch (e) { /* ignore */ }
})();
