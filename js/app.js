/* Calisthenics : application de musculation au poids du corps. Aucune dépendance. */
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
  I.eye = svg('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>');
  I.bell = svg('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>');
  I.trend = svg('<path d="M3.5 17.5 9 12l4 4 7.5-8"/><path d="M15 8h5.5v5.5"/>');
  /* Icônes du matériel. */
  var EQI = {
    bar: svg('<path d="M3.5 6.5h17M6 4v16M18 4v16"/>'),
    table: svg('<path d="M3 8.5h18M5.5 8.5V19M18.5 8.5V19M8 8.5v3.5h8V8.5"/>'),
    chair: svg('<path d="M7 3.5v17M7 12.5h9.5v8"/>'),
    dips: svg('<path d="M3.5 9h7M13.5 9h7M5.5 9v11M8.5 9v11M15.5 9v11M18.5 9v11"/>'),
    band: svg('<path d="M4 12c0-2.6 3.6-4.6 8-4.6s8 2 8 4.6-3.6 4.6-8 4.6S4 14.6 4 12z"/><path d="M8.5 12h7"/>'),
    none: svg('<circle cx="12" cy="12" r="8.5"/><path d="M6 18 18 6"/>')
  };

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
      profile: { name: '', goal: 'muscle', days: 3, sound: true, coach: true, equip: { bar: true, table: true, chair: true, dips: false, band: false } },
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
    // Anciennes sauvegardes : seule la barre était connue, table et chaise étaient supposées.
    out.profile.equip = Object.assign({ bar: true, table: true, chair: true, dips: false, band: false },
      s.profile.equip || (s.profile.bar === false ? { bar: false } : {}));
    delete out.profile.bar;
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
    if (window.GraviteCloud && window.GraviteCloud.user()) window.GraviteCloud.queueSave(S);
    if (S.profile.rem && S.profile.rem.on) scheduleRemSync();
  }

  /* ================= Logique du programme ================= */
  var EQ = {}; D.EQUIP.forEach(function (q) { EQ[q.id] = q; });
  function has(s, id) { return !!(s.profile.equip && s.profile.equip[id]); }
  function skipped(e, s) { return (e.skipIf || []).some(function (q) { return has(s, q); }); }
  function missing(e, s) { return (e.req || []).filter(function (q) { return !has(s, q); }); }
  function equipName(id) { return EQ[id] ? EQ[id].name.toLowerCase() : id; }
  function fullChain(f) { return D.EX.filter(function (e) { return e.f === f; }); }
  /* Parcours affiché : tout sauf les variantes rendues inutiles par ton matériel. */
  function pathChain(f, s) { return D.EX.filter(function (e) { return e.f === f && !skipped(e, s); }); }
  /* Parcours jouable : ce que ton matériel permet vraiment. */
  function chain(f, s) { return pathChain(f, s).filter(function (e) { return !missing(e, s).length; }); }
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
    // Sans barre ni table, les exercices de dos sont plus légers : une série de plus pour compenser.
    if (!has(s, 'bar') && !has(s, 'table')) {
      items.forEach(function (it) { if (it.ex.f === 'pull' && it.main) it.sets += 1; });
    }
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
      pushup: reached(s, 'push', 'pompes'), pullup: reached(s, 'pull', 'chin-ups'),
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
      return { f: f, e: e, nx: nx, t: t, pct: progOf(e, t) };
    }).filter(function (x) { return x.nx; }).sort(function (a, b) { return b.pct - a.pct; });
  }
  function progOf(e, t) { return clamp((t - e.start) / Math.max(1, e.unlock - e.start), 0, 1); }

  /* ---------- Projection : ce que tu sauras faire si tu tiens ton programme ---------- */

  /* Part des exercices réussis en entier sur les dernières séances (0,75 par défaut). */
  function successRate(s) {
    var tot = 0, ok = 0;
    s.history.slice(-24).forEach(function (h) {
      (h.ex || []).forEach(function (x) {
        tot++;
        if (x.d && x.d.length && x.d.every(function (v) { return v >= x.t; })) ok++;
      });
    });
    return tot < 8 ? { p: 0.75, measured: false } : { p: clamp(ok / tot, 0.5, 0.92), measured: true };
  }

  /*
   * Estimation des capacités maximales en une série, à partir du niveau atteint.
   * Ce sont des ordres de grandeur : 4 × 10 pompes réussies ≈ 13-14 pompes d'affilée.
   */
  function capacities(s) {
    var out = {}, c, e, t, pr, i, idx = function (id) { return c.findIndex(function (x) { return x.id === id; }); };

    c = chain('push', s); e = curEx('push', s); t = targetOf(e, s); pr = progOf(e, t); i = c.indexOf(e);
    if (e.id === 'pompes-mur') out.push = 0;
    else if (e.id === 'pompes-inclinees') out.push = Math.round(pr);
    else if (e.id === 'pompes-genoux') out.push = 1 + Math.round(3 * pr);
    else if (e.id === 'pompes') out.push = Math.round(t * 1.25) + 1;
    else out.push = Math.min(60, 15 + 5 * (i - idx('pompes')) + Math.round(5 * pr));

    out.pull = null;
    if (has(s, 'bar')) {
      c = chain('pull', s); e = curEx('pull', s); t = targetOf(e, s); pr = progOf(e, t); i = c.indexOf(e);
      if (i < idx('tractions-negatives')) out.pull = 0;
      else if (e.id === 'tractions-negatives') out.pull = Math.round(pr);
      else if (e.id === 'tractions-elastique') out.pull = 1 + Math.round(2 * pr);
      else if (e.id === 'chin-ups') out.pull = Math.round(t * 1.25);
      else if (e.id === 'tractions') out.pull = Math.round(t * 1.2) + 1;
      else out.pull = Math.min(30, 15 + 3 * (i - idx('tractions')) + Math.round(3 * pr));
    }

    c = chain('atr', s); e = curEx('atr', s); t = targetOf(e, s); pr = progOf(e, t); i = c.indexOf(e);
    var iw = idx('atr-mur'), it = idx('atr-tentatives');
    if (e.id === 'pompes-pike') out.wall = 0;
    else if (e.id === 'montee-mur') out.wall = Math.round(5 + 10 * pr);
    else if (e.id === 'atr-mur') out.wall = Math.round(t * 1.2);
    else out.wall = Math.min(90, 55 + 5 * (i - iw));
    if (i < it) out.free = 0;
    else if (e.id === 'atr-tentatives') out.free = Math.round(t * 0.4);
    else if (e.id === 'atr-libre') out.free = Math.round(t * 1.15);
    else out.free = Math.min(90, 35 + Math.round(25 * pr));
    return out;
  }

  /*
   * Rejoue ton programme semaine après semaine avec les mêmes règles de progression.
   * Chaque exercice réussit avec ta probabilité de réussite, un peu moins aux niveaux élevés.
   */
  var simCache = {};
  function simulate(s, weeks, days) {
    var key = JSON.stringify([s.prog, s.targets, s.profile, s.rot, s.history.length, weeks, days || 0]);
    if (simCache.key === key) return simCache.val;
    var prof = Object.assign({}, s.profile, days ? { days: days } : {});
    var sim = { profile: prof, prog: Object.assign({}, s.prog), targets: Object.assign({}, s.targets), rot: s.rot };
    var sr = successRate(s), credit = {}, plan = planOf(sim), events = [];
    var snap = function (w) {
      var lv = {};
      D.FAMILIES.forEach(function (f) { var e = curEx(f.id, sim); lv[f.id] = { id: e.id, t: targetOf(e, sim) }; });
      return { w: w, cap: capacities(sim), lv: lv };
    };
    var snaps = [snap(0)];
    for (var w = 1; w <= weeks; w++) {
      for (var k = 0; k < plan.length; k++) {
        var sess = buildSession(plan[sim.rot % plan.length], sim);
        sim.rot++;
        sess.items.forEach(function (it) {
          var e = it.ex, c = chain(e.f, sim), idx = c.indexOf(e);
          credit[e.id] = (credit[e.id] || 0) + sr.p * (1 - 0.35 * idx / Math.max(1, c.length - 1));
          if (credit[e.id] < 1) return;
          credit[e.id] -= 1;
          var next = c[idx + 1], isCur = curEx(e.f, sim).id === e.id, t = it.target;
          if (isCur && next && t >= e.unlock) {
            sim.prog[e.f] = next.id;
            if (sim.targets[next.id] == null) sim.targets[next.id] = next.start;
            events.push({ w: w, f: e.f, id: next.id });
            return;
          }
          var cap = isCur && next ? e.unlock : e.unlock * 2;
          sim.targets[e.id] = Math.min(Math.max(cap, t), t + stepOf(e));
        });
      }
      snaps.push(snap(w));
    }
    var val = { snaps: snaps, events: events, p: sr.p, measured: sr.measured, days: prof.days };
    if (!days) simCache = { key: key, val: val };
    return val;
  }

  var MILESTONES = [
    { key: 'push', f: 'push', marks: [1, 5, 10, 15, 20, 30, 40, 50], txt: function (m) { return m === 1 ? 'Ta première pompe classique' : m + ' pompes d’affilée'; } },
    { key: 'pull', f: 'pull', marks: [1, 3, 5, 10, 15, 20], txt: function (m) { return m === 1 ? 'Ta première traction' : m + ' tractions d’affilée'; } },
    { key: 'wall', f: 'atr', marks: [15, 30, 60], txt: function (m) { return m + ' s d’ATR contre le mur'; } },
    { key: 'free', f: 'atr', marks: [3, 10, 20, 30, 60], txt: function (m) { return m + ' s d’ATR sans appui'; } }
  ];
  function milestones(sim, H) {
    var out = [], c0 = sim.snaps[0].cap;
    MILESTONES.forEach(function (d) {
      if (c0[d.key] == null) return;
      d.marks.forEach(function (m) {
        if (c0[d.key] >= m) return;
        for (var w = 1; w < sim.snaps.length && w <= H; w++) {
          if (sim.snaps[w].cap[d.key] >= m) { out.push({ w: w, f: d.f, txt: d.txt(m), kind: 'cap' }); break; }
        }
      });
    });
    sim.events.forEach(function (ev) {
      if (ev.w <= H) out.push({ w: ev.w, f: ev.f, txt: 'Nouveau niveau : ' + EXM[ev.id].name, kind: 'lvl' });
    });
    out.sort(function (a, b) { return a.w - b.w || (a.kind === 'cap' ? -1 : 1); });
    return out;
  }
  function unlockWeeks(sim) {
    var m = {};
    sim.events.forEach(function (ev) { if (m[ev.id] == null) m[ev.id] = ev.w; });
    return m;
  }
  function inWeeks(w) {
    if (w <= 0) return 'cette semaine';
    if (w < 9) return 'dans ' + w + ' semaine' + (w > 1 ? 's' : '');
    var m = Math.round(w / 4.35);
    return m >= 12 ? 'dans 1 an environ' : 'dans ' + m + ' mois';
  }
  function atWeek(w) {
    var d = addDays(new Date(), w * 7), o = { day: 'numeric', month: 'short' };
    if (d.getFullYear() !== new Date().getFullYear()) o.year = 'numeric';
    return 'vers le ' + fmtDate(d, o);
  }
  /* Les capacités les plus parlantes pour ce profil, au format affichable. */
  function capView(cap) {
    var v = [{ k: 'push', f: 'push', n: cap.push, unit: cap.push > 1 ? 'pompes d’affilée' : 'pompe classique' }];
    if (cap.pull != null) v.push({ k: 'pull', f: 'pull', n: cap.pull, unit: cap.pull > 1 ? 'tractions d’affilée' : 'traction' });
    if (cap.free > 0) v.push({ k: 'atr', f: 'atr', n: cap.free, sfx: ' s', unit: 'd’ATR sans appui' });
    else v.push({ k: 'atr', f: 'atr', n: cap.wall, sfx: ' s', unit: 'd’ATR contre le mur' });
    return v;
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
    s.profile = { name: 'Alex', goal: 'muscle', days: 3, sound: true, equip: { bar: true, table: true, chair: true, dips: false, band: false } };
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
  var ui = { fam: 'push', histAll: false, progTab: 'semaine', h: 26, metric: 'push', msAll: false };
  var OB = newOB();

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
    if (changed) coachView();
    try { if (location.hash.slice(1) !== v) location.hash = v; } catch (e) { /* ignore */ }
    if (changed) window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', function () {
    var v = location.hash.slice(1);
    if (VIEWS.indexOf(v) >= 0 && v !== view) { view = v; render(true); }
  });
  window.addEventListener('resize', function () { moveLens(false); });

  function render(animateLens) {
    applyA11y();
    if (!S.onboarded || OB.active) {
      tabbar.hidden = true;
      appEl.classList.add('no-tabs');
      appEl.innerHTML = renderOnboarding();
      dockMascot();
      return;
    }
    tabbar.hidden = false;
    appEl.classList.remove('no-tabs');
    var body = { accueil: renderHome, programme: renderProgram, progres: renderProgress, profil: renderProfile }[view]();
    appEl.innerHTML = (demo ? '<div class="demo-banner"><span>Mode exemple : données fictives</span><button class="btn" type="button" data-act="demo-exit">Créer mon programme</button></div>' : '') + body;
    $$('.tab', tabbar).forEach(function (t) {
      if (t.dataset.view === view) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
    dockMascot();
    requestAnimationFrame(function () { moveLens(animateLens); });
  }

  function exRow(it) {
    var e = it.ex;
    return '<button class="ex-row" type="button" data-act="ex-info" data-id="' + e.id + '" aria-label="Tuto : ' + esc(e.name) + '">' + picto(e.f) +
      '<span class="name">' + esc(e.name) + '<small>' + FAM[e.f].name + (e.side ? ' · par côté' : '') + '</small></span>' +
      '<span class="dose">' + it.sets + ' × ' + it.target + unitShort(e) + '</span></button>';
  }

  /* ================= Accueil ================= */
  function teaserGrid(cap) {
    var v = capView(cap);
    return '<div class="teaser-grid n' + v.length + '">' + v.map(function (x) {
      return '<div><b>' + (x.k === 'atr' ? '' : '≈ ') + x.n + (x.sfx || '') + '</b><span>' + x.unit + '</span></div>';
    }).join('') + '</div>';
  }
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
    var sim = simulate(s, 52), uw = unlockWeeks(sim);

    var html = '<section class="view">';
    html += '<header class="topbar">' + SLOT + '<div class="hello"><p class="eyebrow">' + fmtDate(now, { weekday: 'long', day: 'numeric', month: 'long' }) + '</p>' +
      '<h1 class="title-lg">' + hello + '</h1><p class="muted">' + mood + '</p></div>' +
      '<button class="chip violet" type="button" data-act="nav" data-view="progres" aria-label="Rang ' + rank.cur.name + ', ' + fmtInt(s.xp) + ' XP">' + I.bolt + rank.cur.name + '</button></header>';

    if (resume) {
      html += '<div class="card tight" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">' +
        '<div><b>Séance en cours</b><p class="faint" style="font-size:13px">' + esc(resume.sess.name) + ', commencée à ' + fmtDate(new Date(resume.startedAt), { hour: '2-digit', minute: '2-digit' }) + '</p></div>' +
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

    if (cloudOn() && !cloudUser() && !demo && s.totals.sessions >= 1 && !s.profile.nudgeOff) {
      html += '<div class="card equip-tip"><span class="eq-ic">' + I.cloud + '</span><div><b>Ne perds pas ta progression</b>' +
        '<p class="faint" style="font-size:13px">Crée un compte gratuit avec ton e-mail pour la retrouver sur tous tes appareils.</p>' +
        '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn primary" type="button" data-act="acc-open" data-v="signup">Créer un compte</button>' +
        '<button class="btn ghost" type="button" data-act="nudge-off">Plus tard</button></div></div></div>';
    }
    // Projection à 3 mois
    var ms = milestones(sim, 52)[0];
    html += '<div class="section-head"><h2>Dans 3 mois</h2><button class="link" type="button" data-act="go-traj">Voir mon planning</button></div>' +
      '<button class="card traj-teaser" type="button" data-act="go-traj" aria-label="Voir mon planning de progression">' +
      '<span class="muted" style="font-size:13.5px;display:block">Si tu tiens tes ' + goal + ' séances par semaine, tu devrais tenir :</span>' + teaserGrid(sim.snaps[13].cap) +
      (ms ? '<span class="teaser-next">' + I.trend + '<span>Prochaine étape : <b>' + esc(ms.txt) + '</b>, ' + atWeek(ms.w) + '</span></span>' : '') + '</button>';

    var nu = nextUnlocks(s).slice(0, 2);
    if (nu.length) {
      html += '<div class="section-head"><h2>Prochains paliers</h2><button class="link" type="button" data-act="nav" data-view="progres">Voir le parcours</button></div>';
      html += '<div class="card" style="display:grid;gap:16px">' + nu.map(function (x) {
        var w = uw[x.nx.id];
        return '<div class="next-level">' + picto(x.f.id) + '<div><div class="row"><b>' + esc(x.e.name) + ' → ' + esc(x.nx.name) + '</b></div>' +
          '<div class="progress fc" style="--fc:' + x.f.color + '"><i style="width:' + Math.round(x.pct * 100) + '%"></i></div>' +
          '<div class="row faint" style="margin:6px 0 0;font-size:12px"><span>Objectif ' + x.t + unitShort(x.e) + ' sur ' + x.e.unlock + unitShort(x.e) + '</span><span>' + (w != null ? 'estimé ' + inWeeks(w) : Math.round(x.pct * 100) + ' %') + '</span></div></div></div>';
      }).join('') + '</div>';
    }

    var q = D.QUOTES[Math.floor(startOfDay(now).getTime() / DAY) % D.QUOTES.length];
    html += '<p class="quote">' + I.quote + '<span>' + q + '</span></p>';
    html += '</section>';
    return html;
  }

  /* ================= Programme ================= */
  function renderProgram() {
    var s = S;
    var html = '<section class="view"><header class="topbar">' + SLOT + '<div class="topbar-text"><p class="eyebrow">Semaine ' + weekNumber(s) + '</p><h1 class="title-xl">Programme</h1></div></header>';
    html += '<div class="seg" role="group" aria-label="Affichage du programme">' +
      '<button type="button" data-act="prog-tab" data-v="semaine" aria-pressed="' + (ui.progTab === 'semaine') + '">Ma semaine</button>' +
      '<button type="button" data-act="prog-tab" data-v="trajectoire" aria-pressed="' + (ui.progTab === 'trajectoire') + '">Mon planning</button></div>';
    html += ui.progTab === 'trajectoire' ? renderTrajectory(s) : renderWeek(s);
    return html + '</section>';
  }

  /* Ce que chaque matériel manquant débloquerait. */
  function equipGains(s) {
    return D.EQUIP.filter(function (q) { return !has(s, q.id); }).map(function (q) {
      var ex = D.EX.filter(function (e) { var m = missing(e, s); return !skipped(e, s) && m.length === 1 && m[0] === q.id; });
      return { q: q, ex: ex };
    }).filter(function (x) { return x.ex.length; }).sort(function (a, b) { return b.ex.length - a.ex.length; });
  }

  function renderWeek(s) {
    var plan = planOf(s), g = D.GOALS[s.profile.goal], ws = weekStart(new Date());
    var doneTpl = {};
    sessionsInWeek(ws, s).forEach(function (h) { doneTpl[h.tpl] = true; });
    var nt = nextTpl(s), owned = D.EQUIP.filter(function (q) { return has(s, q.id); });
    var html = '<div class="summary-chips"><span class="chip violet">' + I.target + g.name + '</span><span class="chip">' + s.profile.days + ' séances / semaine</span>' +
      '<span class="chip">' + I.timer + 'Repos ' + g.rest + ' s</span></div>';
    html += '<p class="muted" style="font-size:14px">Les séances tournent dans cet ordre. Les objectifs montent tout seuls quand tu réussis toutes tes séries.</p>';

    html += plan.map(function (tplId, k) {
      var sess = buildSession(tplId, s), isDone = doneTpl[tplId], isNext = tplId === nt;
      return '<article class="card plan-item' + (isDone ? ' is-done' : '') + (isNext ? ' is-next' : '') + '"><div class="plan-head">' +
        '<span class="plan-idx">' + (isDone ? I.check : (k + 1)) + '</span><div style="min-width:0"><h3 class="title-md">' + esc(sess.name) + '</h3>' +
        '<p class="faint" style="font-size:12.5px">≈ ' + estimate(sess) + ' min · ' + (isDone ? 'faite cette semaine' : isNext ? 'prochaine séance' : 'à venir') + '</p></div>' +
        '<button class="btn icon sm' + (isNext ? ' primary' : '') + '" type="button" data-act="start" data-tpl="' + tplId + '" aria-label="Lancer ' + esc(sess.name) + '">' + I.play + '</button></div>' +
        '<div class="ex-list">' + sess.items.map(exRow).join('') + '</div></article>';
    }).join('');

    // Matériel
    var gains = equipGains(s);
    html += '<div class="section-head"><h2>Ton matériel</h2><button class="link" type="button" data-act="nav" data-view="profil">Modifier</button></div>';
    html += '<div class="card" style="display:grid;gap:14px"><div class="summary-chips">' +
      (owned.length ? owned.map(function (q) { return '<span class="chip">' + EQI[q.id] + q.name + '</span>'; }).join('') : '<span class="chip">' + EQI.none + 'Aucun matériel</span>') + '</div>';
    if (!owned.length || !has(s, 'bar')) {
      html += '<p class="muted" style="font-size:13.5px">' + (owned.length ? 'Sans barre' : 'Sans matériel') + ', ton dos travaille avec ' +
        chain('pull', s).map(function (e) { return e.name.toLowerCase(); }).join(', ') + '. Le reste du programme se fait au sol et contre un mur.</p>';
    }
    if (gains.length) {
      html += '<div style="display:grid;gap:12px">' + gains.slice(0, 3).map(function (x) {
        var names = x.ex.slice(0, 3).map(function (e) { return e.name.toLowerCase(); }).join(', ') + (x.ex.length > 3 ? '…' : '');
        return '<div class="equip-tip"><span class="eq-ic">' + EQI[x.q.id] + '</span><div><b>Avec ' + x.q.name.toLowerCase() + ' : +' + x.ex.length + ' niveau' + (x.ex.length > 1 ? 'x' : '') + '</b><p class="faint" style="font-size:12.5px">' + names + '</p></div></div>';
      }).join('') + '</div>';
    }
    html += '</div>';

    html += '<div class="section-head"><h2>Tes niveaux actuels</h2></div><div class="fam-grid">' + D.FAMILIES.map(function (f) {
      var c = chain(f.id, s), e = curEx(f.id, s);
      return '<button class="fam-row" type="button" data-act="fam-open" data-f="' + f.id + '">' + picto(f.id) +
        '<span class="t"><b>' + esc(e.name) + '</b><span>' + f.name + ' · objectif ' + targetOf(e, s) + unitShort(e) + '</span></span>' +
        '<span class="lvl">Niv. ' + (c.indexOf(e) + 1) + '/' + c.length + '</span></button>';
    }).join('') + '</div>';
    return html;
  }

  var HORIZONS = [[13, '3 mois'], [26, '6 mois'], [52, '1 an']];
  function renderTrajectory(s) {
    var H = ui.h, sim = simulate(s, 52), now = sim.snaps[0].cap, end = sim.snaps[H].cap;
    var hName = HORIZONS.find(function (x) { return x[0] === H; })[1];
    var html = '<div class="card-hero traj-hero"><p class="eyebrow" style="color:var(--violet-2)">Si tu tiens ton programme</p>' +
      '<h2 class="hero-title" style="font-size:clamp(24px,7vw,30px)">Dans ' + hName + '</h2>' +
      '<div class="seg" role="group" aria-label="Horizon" style="margin-top:14px">' + HORIZONS.map(function (x) {
        return '<button type="button" data-act="traj-h" data-v="' + x[0] + '" aria-pressed="' + (x[0] === H) + '">' + x[1] + '</button>';
      }).join('') + '</div>';
    var cv = capView(end);
    html += '<div class="cap-grid n' + cv.length + '">' + cv.map(function (x) {
      var before = x.k === 'atr' ? (end.free > 0 ? now.free : now.wall) : now[x.k];
      var gain = x.n - before;
      return '<div class="cap-card">' + picto(x.f) + '<div class="big">' + (x.k === 'atr' ? '' : '≈ ') + x.n + (x.sfx || '') + '</div><div class="unit">' + x.unit + '</div>' +
        '<div class="from">Aujourd’hui : ' + before + (x.sfx || '') + '</div>' + (gain > 0 ? '<div class="delta">+' + gain + (x.sfx || '') + '</div>' : '') + '</div>';
    }).join('') + '</div></div>';

    // Courbe
    var metrics = [['push', 'Pompes']];
    if (now.pull != null) metrics.push(['pull', 'Tractions']);
    metrics.push(['atr', 'ATR']);
    if (!metrics.some(function (m) { return m[0] === ui.metric; })) ui.metric = 'push';
    html += '<div class="card"><div class="section-head" style="margin:0 0 10px"><h2>Ta courbe estimée</h2></div>' +
      '<div class="fam-tabs" role="group" aria-label="Capacité affichée">' + metrics.map(function (m) {
        return '<button class="fam-tab" type="button" style="--fc:' + FAM[m[0]].color + '" data-act="traj-metric" data-v="' + m[0] + '" aria-pressed="' + (ui.metric === m[0]) + '">' + PIC[m[0]] + m[1] + '</button>';
      }).join('') + '</div>' + trajChart(sim, ui.metric, H) + '</div>';

    // Étapes
    var ms = milestones(sim, H), shown = ui.msAll ? ms : ms.slice(0, 7);
    html += '<div class="section-head"><h2>Tes prochaines étapes</h2>' + (ms.length > 7 ? '<button class="link" type="button" data-act="ms-toggle">' + (ui.msAll ? 'Réduire' : 'Tout voir (' + ms.length + ')') + '</button>' : '') + '</div>';
    html += '<div class="card">' + (shown.length ? '<div class="ms-list">' + shown.map(function (m) {
      return '<div class="ms-row">' + picto(m.f) + '<div><b>' + esc(m.txt.charAt(0).toUpperCase() + m.txt.slice(1)) + '</b><span class="s">' + atWeek(m.w) + ' · ' + inWeeks(m.w) + '</span></div>' +
        '<span class="ms-w">S' + m.w + '</span></div>';
    }).join('') + '</div>' : '<div class="empty">' + I.trend + '<span>Pas de nouveau palier estimé sur cette période. Essaie un horizon plus long.</span></div>') + '</div>';

    // Une séance de plus ?
    if (s.profile.days < 6) {
      var more = simulate(s, H, s.profile.days + 1).snaps[H].cap, k = now.pull != null ? 'pull' : 'push';
      var a = end[k], b = more[k], label = k === 'pull' ? 'tractions' : 'pompes';
      if (b > a) {
        html += '<div class="card equip-tip"><span class="eq-ic">' + I.up + '</span><div><b>Avec ' + (s.profile.days + 1) + ' séances par semaine</b>' +
          '<p class="faint" style="font-size:13px">≈ ' + b + ' ' + label + ' d’affilée dans ' + hName + ' au lieu de ' + a + '. À régler dans ton profil.</p></div></div>';
      }
    }
    var gains = equipGains(s).filter(function (x) { return x.q.id === 'bar'; });
    if (gains.length) {
      html += '<div class="card equip-tip"><span class="eq-ic">' + EQI.bar + '</span><div><b>Avec une barre de traction</b>' +
        '<p class="faint" style="font-size:13px">Tu suivrais aussi tes tractions, et ' + gains[0].ex.length + ' niveaux de plus s’ouvriraient, jusqu’au muscle-up.</p></div></div>';
    }
    html += '<p class="storage-note">' + I.info + '<span>Estimation : tes ' + sim.days + ' séances par semaine, avec ' + Math.round(sim.p * 100) + ' % d’exercices réussis en entier' +
      (sim.measured ? ' (ton taux sur tes dernières séances)' : ' (un rythme courant au début)') + '. La progression ralentit aux niveaux avancés. Sommeil, alimentation et récupération comptent aussi : elle se recalcule après chaque séance.</span></p>';
    return html;
  }

  function trajChart(sim, metric, H) {
    var snaps = sim.snaps.slice(0, H + 1);
    var series = metric === 'atr'
      ? [{ k: 'free', name: 'Sans appui', cls: '' }, { k: 'wall', name: 'Contre le mur', cls: ' alt' }]
      : [{ k: metric, name: metric === 'pull' ? 'Tractions' : 'Pompes', cls: '' }];
    var unit = metric === 'atr' ? ' s' : '';
    var W = 340, Hh = 190, L = 32, R = 26, T = 20, B = 24, pw = W - L - R, ph = Hh - T - B;
    var max = niceMax(Math.max(5, Math.max.apply(null, snaps.map(function (sn) { return Math.max.apply(null, series.map(function (se) { return sn.cap[se.k] || 0; })); }))));
    var x = function (w) { return L + (w / H) * pw; }, y = function (v) { return T + ph - (v / max) * ph; };
    var out = '<div class="chart-wrap" data-tipwrap><svg viewBox="0 0 ' + W + ' ' + Hh + '" role="img" aria-label="Courbe estimée sur ' + H + ' semaines">' +
      '<defs><linearGradient id="trajFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9d70ff" stop-opacity=".35"/><stop offset="1" stop-color="#9d70ff" stop-opacity="0"/></linearGradient></defs>';
    [0, 0.5, 1].forEach(function (f) {
      var v = max * f, yy = y(v);
      out += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '"/><text class="axis" x="' + (L - 6) + '" y="' + (yy + 3.5) + '" text-anchor="end">' + fmtInt(v) + '</text>';
    });
    var ticks = H === 13 ? [[0, 'Auj.'], [4, '1 mois'], [9, '2 mois'], [13, '3 mois']] : H === 26 ? [[0, 'Auj.'], [9, '2 mois'], [17, '4 mois'], [26, '6 mois']] : [[0, 'Auj.'], [13, '3 mois'], [26, '6 mois'], [39, '9 mois'], [52, '1 an']];
    ticks.forEach(function (t) {
      out += '<text class="axis" x="' + x(t[0]) + '" y="' + (Hh - 6) + '" text-anchor="' + (t[0] === 0 ? 'start' : t[0] === H ? 'end' : 'middle') + '">' + t[1] + '</text>';
    });
    series.slice().reverse().forEach(function (se) {
      var d = '';
      snaps.forEach(function (sn, i) {
        var v = sn.cap[se.k] || 0;
        d += i === 0 ? 'M' + x(0) + ',' + y(v) : 'H' + x(i) + 'V' + y(v);
      });
      if (!se.cls) out += '<path class="area" d="' + d + 'V' + y(0) + 'H' + x(0) + 'Z"/>';
      out += '<path class="line' + se.cls + '" d="' + d + '"/>';
    });
    // Paliers débloqués sur la courbe
    sim.events.forEach(function (ev) {
      if (ev.f !== metric || ev.w > H) return;
      var v = snaps[ev.w].cap[series[0].k] || 0;
      if (metric === 'atr' && !v) v = snaps[ev.w].cap.wall;
      out += '<circle class="mile" cx="' + x(ev.w) + '" cy="' + y(v) + '" r="4.5" style="--fc:' + FAM[ev.f].color + '"/>';
    });
    // Aujourd'hui et point d'arrivée
    var s0 = series.map(function (se) { return snaps[0].cap[se.k] || 0; }), sH = series.map(function (se) { return snaps[H].cap[se.k] || 0; });
    out += '<circle class="now" cx="' + x(0) + '" cy="' + y(Math.max.apply(null, s0)) + '" r="4"/>';
    series.forEach(function (se, i) {
      if (metric === 'atr' && i === 1 && sH[0] > 0 && Math.abs(y(sH[1]) - y(sH[0])) < 12) return;
      out += '<circle class="end" cx="' + x(H) + '" cy="' + y(sH[i]) + '" r="4.5"/><text class="val" x="' + (x(H) + 7) + '" y="' + (y(sH[i]) + 4) + '">' + sH[i] + unit + '</text>';
    });
    // Zones de survol par semaine
    var labelOf = function (sn) {
      var lv = sn.lv[metric === 'atr' ? 'atr' : metric], e = EXM[lv.id];
      var vals = series.map(function (se) { return se.name + ' ' + (sn.cap[se.k] || 0) + unit; }).join(', ');
      return (sn.w === 0 ? 'Aujourd’hui' : 'Semaine ' + sn.w + ' · ' + atWeek(sn.w).replace('vers le ', '')) + ' : ' + vals + ' · niveau ' + e.name.toLowerCase();
    };
    snaps.forEach(function (sn, i) {
      var x0 = i === 0 ? L : (x(i - 1) + x(i)) / 2, x1 = i === H ? W - R : (x(i) + x(i + 1)) / 2;
      out += '<rect class="bar-hit" x="' + x0 + '" y="' + T + '" width="' + Math.max(1, x1 - x0) + '" height="' + ph + '" data-tip="' + esc(labelOf(sn)) + '"/>';
    });
    out += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + (T + ph) + '" y2="' + (T + ph) + '" stroke="rgba(206,190,255,.18)"/></svg>';
    if (series.length > 1) out += '<div class="legend"><span><i></i>Sans appui</span><span><i class="alt"></i>Contre le mur</span></div>';
    out += '<p class="faint" style="font-size:12px;margin-top:8px">' + (metric === 'atr' ? 'Secondes tenues en ATR' : metric === 'pull' ? 'Tractions d’affilée' : 'Pompes classiques d’affilée') + '. Les ronds marquent les niveaux débloqués.</p></div>';
    return out;
  }

  /* ================= Progrès ================= */
  function renderProgress() {
    var s = S, r = rankOf(s.xp);
    var html = '<section class="view"><header class="topbar">' + SLOT + '<div class="topbar-text"><p class="eyebrow">Ton parcours</p><h1 class="title-xl">Progrès</h1></div></header>';

    html += '<article class="card rank-card"><div class="rank-top">' + emblem(r.i) + '<div style="min-width:0"><p class="eyebrow">Rang ' + (r.i + 1) + ' sur ' + D.RANKS.length + '</p>' +
      '<h2 class="rank-name">' + r.cur.name + '</h2><p class="faint" style="font-size:13px"><span class="num">' + fmtInt(s.xp) + '</span> XP</p></div></div>' +
      '<div class="progress"><i style="width:' + Math.round(r.pct * 100) + '%"></i></div>' +
      '<div class="rank-foot"><span>' + (r.nxt ? 'Encore ' + fmtInt(r.nxt.xp - s.xp) + ' XP pour ' + r.nxt.name : 'Rang maximum atteint') + '</span><span>Série +10 · Séance +50 · Palier +150</span></div>' +
      '<div class="rank-steps">' + D.RANKS.map(function (_, k) { return '<i class="' + (k <= r.i ? 'on' : '') + '"></i>'; }).join('') + '</div></article>';

    html += '<div class="card"><div class="section-head" style="margin:0 0 12px"><h2>Activité</h2><span class="faint" style="font-size:12.5px">16 dernières semaines</span></div>' + heatmap(s) + '</div>';
    html += '<div class="card"><div class="section-head" style="margin:0 0 6px"><h2>Répétitions par semaine</h2><span class="faint" style="font-size:12.5px">8 semaines</span></div>' + weeklyChart(s) + '</div>';

    // Parcours
    var f = FAM[ui.fam], c = chain(f.id, s), cur = curEx(f.id, s), ci = c.indexOf(cur), path = pathChain(f.id, s);
    var uw = unlockWeeks(simulate(s, 52));
    html += '<div class="section-head"><h2>Parcours</h2><span class="faint" style="font-size:12.5px">' + s.unlocks.length + ' palier' + (s.unlocks.length > 1 ? 's' : '') + ' débloqué' + (s.unlocks.length > 1 ? 's' : '') + '</span></div>';
    html += '<div class="card"><div class="fam-tabs" role="group" aria-label="Familles">' + D.FAMILIES.map(function (x) {
      return '<button class="fam-tab" type="button" style="--fc:' + x.color + '" data-act="fam" data-f="' + x.id + '" aria-pressed="' + (x.id === ui.fam) + '">' + PIC[x.id] + x.name + '</button>';
    }).join('') + '</div>';
    html += '<p class="faint" style="font-size:12.5px;margin-top:10px">' + f.muscles + ' · niveau ' + (ci + 1) + ' sur ' + c.length + ' avec ton matériel</p>';
    html += '<div class="path" style="--fc:' + f.color + '">' + path.map(function (e) {
      var k = c.indexOf(e);
      if (k < 0) {
        return '<button class="path-node locked" type="button" data-act="ex-info" data-id="' + e.id + '"><span class="path-dot">' + I.lock + '</span><span class="t"><b>' + esc(e.name) + '</b><span>Nécessite : ' + missing(e, s).map(equipName).join(' + ') + '</span></span><span class="tag">Matériel</span></button>';
      }
      var st = k < ci ? 'done' : k === ci ? 'current' : 'locked';
      var t = targetOf(e, s), pct = progOf(e, t), sub;
      if (st === 'done') {
        var u = s.unlocks.filter(function (x) { return x.id === (c[k + 1] && c[k + 1].id); }).pop();
        sub = u ? 'Validé le ' + fmtDate(new Date(u.at), { day: 'numeric', month: 'short' }) : 'Acquis';
      } else if (st === 'current') {
        sub = 'Objectif ' + t + unitShort(e) + ' · déblocage à ' + e.unlock + unitShort(e);
      } else {
        sub = uw[e.id] != null ? 'Estimé ' + atWeek(uw[e.id]) + ' (' + inWeeks(uw[e.id]) + ')' : 'Niveau ' + (k + 1) + ' · plus d’un an';
      }
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
    var out = '<div class="chart-wrap" data-tipwrap><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc('Répétitions par semaine : ' + vals.map(function (d, i) { return (i === vals.length - 1 ? 'cette semaine' : 'semaine du ' + fmtDate(d.w, { day: 'numeric', month: 'long' })) + ' ' + d.v; }).join(', ')) + '">';
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
    var html = '<section class="view"><header class="topbar">' + SLOT + '<div class="topbar-text"><p class="eyebrow">Réglages</p><h1 class="title-xl">Profil</h1></div></header>';
    html += '<div class="card" style="display:grid;gap:18px"><div class="field"><label for="pf-name">Prénom</label><input id="pf-name" class="input" maxlength="30" autocomplete="given-name" placeholder="Ton prénom" value="' + esc(p.name) + '"></div>' +
      '<div class="field"><span class="label">Objectif</span><div class="seg" role="group" aria-label="Objectif">' + Object.keys(D.GOALS).map(function (k) {
        return '<button type="button" data-act="pf-goal" data-v="' + k + '" aria-pressed="' + (p.goal === k) + '">' + { force: 'Force', muscle: 'Muscle', forme: 'Forme' }[k] + '</button>';
      }).join('') + '</div><p class="faint" id="pf-goal-desc" style="font-size:12.5px">' + D.GOALS[p.goal].desc + '</p></div>' +
      '<div class="field"><span class="label">Séances par semaine</span><div class="seg" role="group" aria-label="Séances par semaine">' + [2, 3, 4, 5, 6].map(function (n) {
        return '<button type="button" data-act="pf-days" data-v="' + n + '" aria-pressed="' + (p.days === n) + '">' + n + '</button>';
      }).join('') + '</div></div></div>';

    html += '<div class="section-head"><h2>Mon matériel</h2></div><div class="card" id="equip-card">' + D.EQUIP.map(function (q) {
      return '<div class="toggle-row"><span class="t eq-t"><span class="eq-ic">' + EQI[q.id] + '</span><span><b>' + q.name + '</b><span>' + q.desc + '</span></span></span>' +
        '<button class="switch" type="button" role="switch" aria-label="' + q.name + '" aria-checked="' + has(s, q.id) + '" data-act="pf-equip" data-id="' + q.id + '"></button></div>';
    }).join('') + '</div>';
    html += '<p class="faint" style="font-size:12.5px;margin-top:-8px">Ton programme et ton planning s’adaptent dès que tu changes ton matériel.</p>';

    html += '<div class="card"><div class="toggle-row"><span class="t"><b>Sons et vibrations</b><span>Signal à la fin des repos et des chronos</span></span>' +
      '<button class="switch" type="button" role="switch" aria-label="Sons et vibrations" aria-checked="' + p.sound + '" data-act="pf-sound"></button></div>' +
      '<div class="toggle-row"><span class="t"><b>Coach bavard</b><span>La mascotte te parle d’elle-même (touche-la pour l’entendre)</span></span>' +
      '<button class="switch" type="button" role="switch" aria-label="Coach bavard" aria-checked="' + (p.coach !== false) + '" data-act="pf-coach"></button></div></div>';

    html += remCard() + accountCard() + a11yCard();
    html += '<div class="card" style="display:grid;gap:10px"><button class="btn block" type="button" data-act="tour">' + I.play + 'Revoir la visite guidée</button>' +
      '<button class="btn block" type="button" data-act="retake">' + I.refresh + 'Refaire le test de niveau</button>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button class="btn" type="button" data-act="export">' + I.copy + 'Exporter</button><button class="btn" type="button" data-act="import">Importer</button></div>' +
      '<button class="btn block danger ghost" type="button" data-act="reset">' + I.trash + 'Tout effacer</button></div>';

    var cloud = Store.mode === 'cloud' || !!cloudUser();
    html += '<p class="storage-note">' + (cloud ? I.cloud : I.device) + '<span>' + (cloud ? 'Ta progression est enregistrée sur ton compte et sur cet appareil.' : 'Ta progression est enregistrée sur cet appareil. Utilise Exporter pour la garder ailleurs.') + '</span></p>';
    html += '<p class="faint" style="font-size:12px;text-align:center">Calisthenics · musculation au poids du corps. Échauffe-toi, écoute ton corps et arrête en cas de douleur.</p>';
    html += '</section>';
    return html;
  }

  /* ================= Onboarding ================= */
  function newOB(o) {
    return Object.assign({ active: false, screen: 'welcome', qi: 0, name: '', goal: null, equip: { bar: false, table: false, chair: false, dips: false, band: false }, push: null, pull: null, atr: null, days: 3, retake: false }, o || {});
  }
  function obQuestions() {
    var q = ['goal', 'equip', 'push'];
    if (OB.equip.bar) q.push('pull');
    return q.concat(['atr', 'days']);
  }
  var PUSH_OPTS = [['0', '0–3', 'Pas encore, ou sur les genoux'], ['1', '4–10', 'Quelques-unes propres'], ['2', '11–20', 'À l’aise'], ['3', '21+', 'Facile']];
  var PULL_OPTS = [['0', '0', 'Aucune pour l’instant'], ['1', '1–4', 'Quelques-unes'], ['2', '5–10', 'Une bonne série'], ['3', '11+', 'Beaucoup']];
  var ATR_OPTS = [['never', '1', 'Jamais essayé', 'On commence par les épaules'], ['wall', '2', 'Contre un mur', 'Je tiens quelques secondes au mur'], ['free', '3', 'En libre', 'Je tiens quelques secondes sans appui']];

  function optBtn(k, v, big, title, sub) {
    return '<button class="option" type="button" data-act="ob-pick" data-k="' + k + '" data-v="' + v + '" aria-pressed="' + (String(OB[k]) === String(v)) + '">' +
      '<span class="o-big">' + big + '</span><span class="o-t"><b>' + title + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</span><span class="check">' + I.check + '</span></button>';
  }
  function equipOpt(id, title, sub, on) {
    return '<button class="option" type="button" data-act="ob-equip" data-v="' + id + '" aria-pressed="' + on + '">' +
      '<span class="o-big o-ic">' + EQI[id] + '</span><span class="o-t"><b>' + title + '</b><span>' + sub + '</span></span><span class="check">' + I.check + '</span></button>';
  }
  function obReady() {
    var q = obQuestions()[OB.qi];
    return { goal: !!OB.goal, equip: true, push: OB.push != null, pull: OB.pull != null, atr: OB.atr != null, days: !!OB.days }[q];
  }
  function ladder(s) {
    return '<div class="ladder">' + D.FAMILIES.map(function (f) {
      var c = chain(f.id, s), e = curEx(f.id, s), k = c.indexOf(e);
      return '<div class="ladder-row" style="--fc:' + f.color + '">' + picto(f.id) + '<span class="t"><b>' + esc(e.name) + '</b><span>' + f.name + ' · niveau ' + (k + 1) + ' sur ' + c.length + '</span></span>' +
        '<span class="steps" aria-hidden="true">' + c.slice(0, Math.min(c.length, 8)).map(function (_, j) { return '<i class="' + (j <= k ? 'on' : '') + '"></i>'; }).join('') + '</span></div>';
    }).join('') + '</div>';
  }
  function renderOnboarding() {
    var html = '';
    if (OB.screen === 'welcome') {
      html = '<section class="view welcome"><div class="brand">' + SLOT + '</div>' +
        '<h1 class="welcome-title"><em>Calisthenics</em></h1>' +
        '<p class="muted" style="font-size:16px;max-width:36ch">Ton programme de musculation au poids du corps : pompes, tractions, squats, gainage et ATR. Il s’adapte à ton niveau et à ton matériel, et progresse avec toi, un niveau après l’autre.</p>' +
        '<div class="ladder">' + D.FAMILIES.map(function (f, i) {
          var full = fullChain(f.id), on = [3, 4, 1, 2, 0][i];
          return '<div class="ladder-row" style="--fc:' + f.color + '">' + picto(f.id) + '<span class="t"><b>' + f.name + '</b><span>Jusqu’à ' + esc(full[full.length - 1].name.toLowerCase()) + '</span></span>' +
            '<span class="steps" aria-hidden="true">' + full.slice(0, 6).map(function (_, k) { return '<i class="' + (k <= on ? 'on' : '') + '"></i>'; }).join('') + '</span></div>';
        }).join('') + '</div>' +
        '<div class="feature-list">' +
        '<div class="feature"><span class="ic">' + I.target + '</span><div><b>Un programme à ton niveau</b><span>Quelques questions, et tes séances sont prêtes, adaptées à ton matériel.</span></div></div>' +
        '<div class="feature"><span class="ic">' + I.trend + '</span><div><b>Ton évolution estimée</b><span>Combien de pompes, de tractions et de secondes en ATR dans 3, 6 ou 12 mois.</span></div></div>' +
        '<div class="feature"><span class="ic">' + I.trophy + '</span><div><b>Ta progression sous les yeux</b><span>Paliers débloqués, semaines tenues, records et badges.</span></div></div></div>' +
        '<div style="display:grid;gap:10px"><button class="btn primary lg block" type="button" data-act="ob-next">Créer mon programme</button>' +
        '<button class="btn block ghost" type="button" data-act="demo-start">Voir un exemple</button>' +
        (cloudOn() ? '<button class="link-btn" type="button" data-act="acc-open" data-v="login">J’ai déjà un compte : me connecter</button>' : '') + '</div></section>';
      return html;
    }
    if (OB.screen === 'ready') {
      var s = S, sim = simulate(s, 52), first = milestones(sim, 52)[0];
      html = '<section class="view ob"><div class="brand">' + SLOT + '<b>CALISTHENICS</b></div><div><p class="eyebrow" style="color:var(--violet-2)">C’est prêt</p><h1 class="title-xl" style="margin-top:6px">Ton programme</h1>' +
        '<p class="muted" style="margin-top:8px">' + s.profile.days + ' séances par semaine, objectif ' + D.GOALS[s.profile.goal].name.toLowerCase() + '. Voici ton point de départ :</p></div>' + ladder(s) +
        '<div class="card-hero" style="padding:18px"><p class="eyebrow" style="color:var(--violet-2)">Dans 3 mois, si tu tiens le rythme</p>' + teaserGrid(sim.snaps[13].cap) +
        (first ? '<p class="teaser-next">' + I.trend + '<span>Première étape : <b>' + esc(first.txt) + '</b>, ' + atWeek(first.w) + '</span></p>' : '') + '</div>';
      if (!has(s, 'bar')) {
        var g = equipGains(s).filter(function (x) { return x.q.id === 'bar'; })[0];
        html += '<p class="storage-note">' + EQI.bar + '<span>Sans barre, ton dos travaille avec ' + esc(chain('pull', s)[0].name.toLowerCase()) + ' et ses variantes.' +
          (g ? ' Une barre de traction ajouterait ' + g.ex.length + ' niveaux, à activer dans ton profil quand tu veux.' : '') + '</span></p>';
      }
      html += '<button class="btn primary lg block" type="button" data-act="ob-done">' + I.play + 'C’est parti</button></section>';
      return html;
    }
    var qs = obQuestions(), q = qs[OB.qi], last = OB.qi === qs.length - 1;
    html = '<section class="view ob"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><div class="brand">' + SLOT + '<b>CALISTHENICS</b></div><span class="faint num" style="font-size:13px">' + (OB.qi + 1) + ' / ' + qs.length + '</span></div>' +
      '<div class="ob-steps" style="grid-template-columns:repeat(' + qs.length + ',1fr)">' + qs.map(function (_, k) { return '<i class="' + (k <= OB.qi ? 'on' : '') + '"></i>'; }).join('') + '</div>';
    if (q === 'goal') {
      html += '<div><h1 class="title-lg">Faisons connaissance</h1><p class="muted" style="margin-top:6px">Ton prénom est facultatif. Ton objectif règle le nombre de séries et les temps de repos.</p></div>' +
        '<div class="field"><label for="ob-name">Prénom</label><input id="ob-name" class="input" maxlength="30" autocomplete="given-name" placeholder="Ton prénom" value="' + esc(OB.name) + '"></div>' +
        '<div class="options">' + Object.keys(D.GOALS).map(function (k, i) {
          var g = D.GOALS[k];
          return optBtn('goal', k, ['F', 'M', 'E'][i], g.name, g.desc + ' ' + g.sets + ' séries, ' + g.rest + ' s de repos.');
        }).join('') + '</div>';
    } else if (q === 'equip') {
      var none = !D.EQUIP.some(function (x) { return OB.equip[x.id]; });
      html += '<div><h1 class="title-lg">Qu’as-tu à disposition ?</h1><p class="muted" style="margin-top:6px">Coche tout ce que tu peux utiliser. Sans rien, ton programme reste complet : le sol, un mur et une porte suffisent.</p></div>' +
        '<div class="options">' + D.EQUIP.map(function (x) { return equipOpt(x.id, x.name, x.desc, !!OB.equip[x.id]); }).join('') +
        equipOpt('none', 'Rien de tout ça', 'Programme 100 % poids du corps', none) + '</div>';
    } else if (q === 'push') {
      html += '<div><h1 class="title-lg">Combien de pompes d’affilée ?</h1><p class="muted" style="margin-top:6px">Des pompes classiques, poitrine près du sol, sans t’arrêter.</p></div>' +
        '<div class="options">' + PUSH_OPTS.map(function (o) { return optBtn('push', o[0], o[1], o[2]); }).join('') + '</div>';
    } else if (q === 'pull') {
      html += '<div><h1 class="title-lg">Et les tractions ?</h1><p class="muted" style="margin-top:6px">Combien de tractions complètes d’affilée, bras tendus en bas, menton au-dessus de la barre.</p></div>' +
        '<div class="options">' + PULL_OPTS.map(function (o) { return optBtn('pull', o[0], o[1], o[2]); }).join('') + '</div>';
    } else if (q === 'atr') {
      html += '<div><h1 class="title-lg">Ton niveau en ATR</h1><p class="muted" style="margin-top:6px">L’ATR, c’est l’équilibre sur les mains. On le construit pas à pas.</p></div>' +
        '<div class="options">' + ATR_OPTS.map(function (o) { return optBtn('atr', o[0], o[1], o[2], o[3]); }).join('') + '</div>';
    } else if (q === 'days') {
      html += '<div><h1 class="title-lg">Combien de séances par semaine ?</h1><p class="muted" style="margin-top:6px">Mieux vaut 3 séances tenues que 6 abandonnées. Tu pourras changer ensuite.</p></div>' +
        '<div class="options">' + [2, 3, 4, 5, 6].map(function (n) {
          var names = D.WEEK_PLANS[n].map(function (t) { return D.TEMPLATES[t].name; }).join(', ');
          return optBtn('days', n, n, n === 3 ? 'Recommandé pour débuter' : n <= 2 ? 'Le minimum efficace' : n >= 5 ? 'Pour les motivés' : 'Rythme soutenu', names);
        }).join('') + '</div>';
    }
    html += '<div class="ob-nav"><button class="btn icon" type="button" data-act="ob-back" aria-label="Retour" style="transform:scaleX(-1)">' + I.chevR + '</button>' +
      '<button class="btn primary lg" type="button" data-act="ob-next" id="ob-next"' + (obReady() ? '' : ' disabled') + '>' + (last ? 'Générer mon programme' : 'Continuer') + '</button></div></section>';
    return html;
  }
  function applyOnboarding() {
    var s = S, pi = +OB.push;
    s.profile.name = OB.name.trim().slice(0, 30);
    s.profile.goal = OB.goal;
    s.profile.days = +OB.days;
    s.profile.equip = Object.assign({}, OB.equip);
    s.prog.push = ['pompes-inclinees', 'pompes', 'pompes-diamant', 'pompes-declinees'][pi];
    s.prog.legs = ['squats', 'fentes', 'squats-bulgares', 'squats-sautes'][pi];
    s.prog.core = ['planche', 'genoux-sol', 'hollow', 'jambes-sol'][pi];
    s.prog.pull = OB.equip.bar
      ? { '0': 'rowing-australien', '1': 'chin-ups', '2': 'tractions', '3': 'tractions-archer' }[OB.pull]
      : ['superman', 'rowing-serviette', 'rowing-australien', 'rowing-pieds'][pi];
    s.prog.atr = { never: 'pompes-pike', wall: 'atr-mur', free: 'atr-libre' }[OB.atr];
    // Fige le point de départ sur un exercice réellement disponible.
    D.FAMILIES.forEach(function (f) { s.prog[f.id] = curEx(f.id, s).id; });
    if (!s.createdAt) s.createdAt = Date.now();
    s.onboarded = true;
    save();
  }

  /* ================= Feuilles modales & toasts ================= */
  function openSheet(html, label) {
    closeSheet();
    sheetOpener = document.activeElement;
    var sc = document.createElement('div');
    sc.className = 'scrim';
    sc.id = 'sheet';
    sc.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(label || 'Détails') + '"><span class="grab" aria-hidden="true"></span>' + html + '</div>';
    sc.addEventListener('click', function (e) { if (e.target === sc) closeSheet(); });
    document.body.appendChild(sc);
    var f = sc.querySelector('button, input, textarea');
    if (f) { try { f.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
  }
  function closeSheet() {
    var s = $('#sheet');
    if (!s) return;
    s.remove();
    if (sheetOpener && sheetOpener.isConnected) { try { sheetOpener.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    sheetOpener = null;
  }
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
    var g = D.GOALS[S.profile.goal], miss = missing(e, S);
    var status = idx < 0 ? 'Nécessite : ' + miss.map(equipName).join(' + ') : idx < ci ? 'Niveau acquis' : idx === ci ? 'Ton niveau actuel' : 'Pas encore débloqué';
    var w = idx > ci ? unlockWeeks(simulate(S, 52))[e.id] : null;
    var html = '<div style="display:flex;gap:14px;align-items:center">' + picto(e.f, 'lg') + '<div style="min-width:0"><p class="eyebrow">' + f.name + (idx >= 0 ? ' · niveau ' + (idx + 1) + ' sur ' + c.length : '') + '</p><h2 class="title-lg" style="margin-top:4px">' + esc(e.name) + '</h2></div></div>' +
      '<div class="summary-chips"><span class="chip violet">' + status + '</span><span class="chip">' + (e.type === 'time' ? 'Chrono' : 'Répétitions') + (e.side ? ', par côté' : '') + '</span>' +
      (idx >= 0 ? '<span class="chip">Objectif ' + targetOf(e, S) + unitShort(e) + '</span>' : '') +
      (w != null ? '<span class="chip">' + I.trend + 'Estimé ' + atWeek(w) + '</span>' : '') + '</div>' +
      tutoBlock(e) +
      '<p class="muted" style="font-size:14px">' + (idx < 0 ? 'Ajoute ce matériel dans ton profil pour intégrer ce niveau à ton parcours.' : next ? 'Pour débloquer <b>' + esc(next.name) + '</b> : tiens ' + e.unlock + unitShort(e) + ' sur tes ' + g.sets + ' séries principales.' : 'C’est le dernier niveau de cette famille avec ton matériel. Continue de monter l’objectif.') + '</p>' +
      '<div class="sheet-actions">' + (idx >= 0 && idx !== ci ? '<button class="btn primary block" type="button" data-act="set-level" data-id="' + e.id + '">' + (idx < ci ? 'Revenir à ce niveau' : 'Je maîtrise déjà : passer à ce niveau') + '</button>' : '') +
      (idx < 0 ? '<button class="btn primary block" type="button" data-act="nav" data-view="profil">Gérer mon matériel</button>' : '') +
      '<button class="btn block ghost" type="button" data-act="sheet-close">Fermer</button></div>';
    openSheet(html, e.name);
    mountTuto($('#sheet .tv-host'), e);
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
    var delayed = /^(start|resume|nav|go-traj|ob-next|ob-back|ob-done|demo-start|demo-exit|pl-next|pl-set-done|pl-skip|pl-finish|pl-exit|pl-hold-start)$/.test(act) && el.matches(LIQUID) && !reduceMotion;
    if (delayed) setTimeout(function () { handle(act, el); }, 120); else handle(act, el);
  });

  function handle(act, el) {
    var ds = el.dataset;
    if (act.indexOf('pl-') === 0) return playerAction(act, el);
    switch (act) {
      case 'nav': closeSheet(); go(ds.view); break;
      case 'go-traj': ui.progTab = 'trajectoire'; go('programme'); break;
      case 'prog-tab': ui.progTab = ds.v; render(); coachView(); break;
      case 'traj-h': ui.h = +ds.v; ui.msAll = false; render(); coachView(true); break;
      case 'traj-metric': ui.metric = ds.v; render(); break;
      case 'ms-toggle': ui.msAll = !ui.msAll; render(); break;
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
      case 'pf-equip':
        S.profile.equip = Object.assign({}, S.profile.equip);
        S.profile.equip[ds.id] = !S.profile.equip[ds.id];
        save(); el.setAttribute('aria-checked', String(S.profile.equip[ds.id]));
        toast(EQ[ds.id].name + (S.profile.equip[ds.id] ? ' ajouté : programme adapté' : ' retiré : programme adapté'));
        break;
      case 'rem-toggle':
        var rp = remPrefs();
        if (!rp.on) {
          el.disabled = true;
          window.GravitePush.enable(rp, remCtx()).then(function () {
            S.profile.rem = { on: true, days: rp.days, hour: rp.hour };
            save(); render(); toast('Rappels activés');
            coachSay({ t: 'Je te ferai signe les jours de séance !', m: 'happy', a: 'hop' }, true);
          }, function (x) { toast(x.message); render(); });
        } else {
          S.profile.rem = Object.assign({}, S.profile.rem, { on: false });
          save(); render();
          window.GravitePush.disable().then(function () { toast('Rappels désactivés'); });
        }
        break;
      case 'rem-day':
        var rd = remPrefs(), dv = +ds.v, di = rd.days.indexOf(dv);
        if (di >= 0 && rd.days.length === 1) { toast('Garde au moins un jour'); break; }
        if (di >= 0) rd.days.splice(di, 1); else rd.days.push(dv);
        S.profile.rem = { on: true, days: rd.days.sort(function (a, b) { return a - b; }), hour: rd.hour };
        save();
        el.setAttribute('aria-pressed', String(di < 0));
        var rs = $('#rem-sum'); if (rs) rs.textContent = remSummary(remPrefs());
        break;
      case 'rem-test':
        window.GravitePush.test().then(function () { toast('Notification d’essai envoyée'); }, function (x) { toast(x && x.message ? x.message : 'Impossible d’afficher la notification.'); });
        break;
      case 'tour': startTour(); break;
      case 'tour-next':
        if (!TOUR) break;
        var tst = TOUR.steps[TOUR.i];
        if (tst.wait && TOUR.target) TOUR.target.click(); else nextTour();
        break;
      case 'tour-skip': endTour(false); break;
      case 'pf-a11y':
        S.profile.a11y = Object.assign({}, a11y());
        S.profile.a11y[ds.k] = !S.profile.a11y[ds.k];
        save(); applyA11y(); el.setAttribute('aria-checked', String(S.profile.a11y[ds.k]));
        if (ds.k === 'voice' && S.profile.a11y.voice) speak('Lecture à voix haute activée.');
        break;
      case 'acc-open': accountSheet(ds.v); break;
      case 'pw-toggle':
        var pwi = $('#acc-pw'), show = pwi.type === 'password';
        pwi.type = show ? 'text' : 'password';
        el.setAttribute('aria-pressed', String(show));
        el.setAttribute('aria-label', show ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
        break;
      case 'acc-logout':
        window.GraviteCloud.signOut().then(function () { toast('Déconnecté. Ta progression reste sur cet appareil.'); render(); }, function (x) { toast(x.message); });
        break;
      case 'acc-delete':
        openSheet('<h2 class="title-lg">Supprimer ton compte ?</h2><p class="muted">Ton compte et la progression enregistrée en ligne seront supprimés définitivement. La copie sur cet appareil est conservée.</p>' +
          '<div class="sheet-actions"><button class="btn block danger" type="button" data-act="acc-delete-yes">' + I.trash + 'Oui, supprimer mon compte</button>' +
          '<button class="btn primary block" type="button" data-act="sheet-close">Garder mon compte</button></div>', 'Supprimer le compte');
        break;
      case 'acc-delete-yes':
        window.GraviteCloud.deleteAccount().then(function () { closeSheet(); toast('Compte supprimé'); render(); }, function (x) { closeSheet(); toast(x.message); });
        break;
      case 'conflict':
        if (ds.v === 'cloud' && pendingRemote) adoptCloud(pendingRemote); else window.GraviteCloud.queueSave(REAL, true);
        pendingRemote = null; closeSheet();
        break;
      case 'nudge-off': S.profile.nudgeOff = true; save(); render(); break;
      case 'pf-coach':
        S.profile.coach = S.profile.coach === false; save(); el.setAttribute('aria-checked', String(S.profile.coach));
        if (S.profile.coach) coachSay({ t: 'Super, je reste avec toi !', m: 'happy', a: 'hop' }, true); else if (coach) coach.hide();
        break;
      case 'tv-mode':
        if (sheetTv) sheetTv.setMode(ds.v);
        $$('[data-act="tv-mode"]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === el)); });
        break;
      case 'pf-sound':
        S.profile.sound = !S.profile.sound; save(); el.setAttribute('aria-checked', String(S.profile.sound));
        if (S.profile.sound) { ensureAudio(); beep(880, 0.12); }
        break;
      case 'retake':
        OB = newOB({ active: true, screen: 'q', qi: 1, name: S.profile.name, goal: S.profile.goal, equip: Object.assign({}, S.profile.equip), days: S.profile.days, retake: true });
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
        if (!parsed) { var er = $('#im-err'); er.hidden = false; er.textContent = 'Ce texte n’est pas une progression Calisthenics valide. Vérifie que tu as tout copié, du premier { au dernier }.'; break; }
        parsed.onboarded = true;
        REAL = S = parsed; demo = false; save(); closeSheet(); render(); toast('Progression importée');
        break;
      case 'reset':
        openSheet('<h2 class="title-lg">Tout effacer ?</h2><p class="muted">Ton historique, tes niveaux, tes records et tes badges seront supprimés. Cette action est définitive.</p>' +
          '<div class="sheet-actions"><button class="btn block danger" type="button" data-act="do-reset">' + I.trash + 'Oui, tout effacer</button><button class="btn primary block" type="button" data-act="sheet-close">Garder ma progression</button></div>', 'Tout effacer');
        break;
      case 'do-reset':
        REAL = S = blankState(); demo = false; clearResume(); save(); closeSheet();
        OB = newOB();
        render(); window.scrollTo(0, 0);
        break;

      case 'demo-start':
        demo = true; S = makeDemo(); view = 'accueil'; render(); window.scrollTo(0, 0); coachView(true); toast('Exemple chargé : 10 semaines fictives'); break;
      case 'demo-exit':
        demo = false; S = REAL;
        if (!S.onboarded) OB = newOB({ active: true, screen: 'q', qi: 0 });
        render(); window.scrollTo(0, 0); break;

      case 'ob-pick':
        OB[ds.k] = ds.k === 'days' ? +ds.v : ds.v;
        $$('[data-act="ob-pick"][data-k="' + ds.k + '"]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === el)); });
        var nb = $('#ob-next'); if (nb) nb.disabled = !obReady();
        break;
      case 'ob-equip':
        if (ds.v === 'none') D.EQUIP.forEach(function (x) { OB.equip[x.id] = false; });
        else OB.equip[ds.v] = !OB.equip[ds.v];
        var none = !D.EQUIP.some(function (x) { return OB.equip[x.id]; });
        $$('[data-act="ob-equip"]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.v === 'none' ? none : !!OB.equip[x.dataset.v])); });
        break;
      case 'ob-next':
        if (OB.screen === 'welcome') { OB.active = true; OB.screen = 'q'; OB.qi = 0; }
        else {
          if (!obReady()) break;
          if (OB.qi < obQuestions().length - 1) OB.qi++;
          else { applyOnboarding(); OB.screen = 'ready'; }
        }
        render(); window.scrollTo(0, 0); coachView(); break;
      case 'ob-back':
        if (OB.retake && OB.qi <= 1) { OB = newOB(); render(); break; }
        if (OB.qi === 0) OB = newOB(); else OB.qi--;
        render(); break;
      case 'ob-done':
        OB = newOB(); view = 'accueil'; render(); window.scrollTo(0, 0);
        if (!S.profile.tourDone) setTimeout(startTour, 700); else coachView(true);
        break;
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
    if (coach) coach.hide();
    document.body.style.overflow = 'hidden';
    PL.tick = setInterval(tick, 200);
    enterStep();
  }
  function closePlayer() {
    if (!PL) return;
    clearInterval(PL.tick);
    PL = null;
    releaseWake();
    if (coach) coach.hide();
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
    coachStep();
    playerSpeak();
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
    var top = '<div><div class="player-top"><button class="btn icon sm ghost" type="button" data-act="pl-close" aria-label="Quitter la séance">' + I.close + '</button>' + SLOT +
      '<span class="ttl">' + esc(sess.name) + '</span><span class="clock" id="pl-clock">' + fmtClock(Date.now() - PL.startedAt) + '</span></div>' + seg + '</div>';

    if (st.k === 'warm') {
      body = '<div class="stage"><span class="set-label">Échauffement · 3 min</span><h2 class="ex-title">Réveille tes articulations</h2>' +
        '<div class="warm-list">' + D.WARMUP.map(function (w, k) { return '<div class="warm-row"><span class="n">' + (k + 1) + '</span><span>' + w.name + '</span><span class="d">' + w.dose + '</span></div>'; }).join('') + '</div>' +
        '<p class="faint" style="font-size:13px">Au programme : ' + sess.items.map(function (it) { return esc(it.ex.name); }).join(', ') + '.</p></div>';
      actions = '<button class="btn primary lg block" type="button" data-act="pl-next">' + I.play + 'Échauffement terminé</button>';
    } else if (st.k === 'set') {
      var it = sess.items[st.i], e = it.ex, isTime = e.type === 'time';
      body = '<div class="stage"><div class="tv-host tv-mini" data-act="pl-info" role="button" tabindex="0" aria-label="Voir le tuto complet"></div><span class="set-label">Série ' + (st.s + 1) + ' / ' + it.sets + (it.main ? '' : ' · volume') + '</span>' +
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
          '<div class="row"><button class="btn ghost" type="button" data-act="pl-info">' + I.play + 'Tuto</button><button class="btn ghost" type="button" data-act="pl-skip">' + I.skip + 'Passer</button></div>';
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
    dockMascot();
    if (st.k === 'set') mountTuto(playerRoot.querySelector('.tv-mini'), sess.items[st.i].ex, true);
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
        coachSay({ t: 'Tiens bon, respire !', m: 'effort' });
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
        coachResult(res);
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
    if (calm()) return;
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

  /* ================= Coach (mascotte) et tutos ================= */
  var SLOT = '<div class="mascot-slot"></div>';
  var coach = window.GraviteCoach ? window.GraviteCoach.create({ onTap: coachTap }) : null;
  var coachSeen = {}, lastAuto = 0, tapIdx = 0, sheetTv = null;

  /* Place la mascotte en haut à gauche de l'écran affiché (page ou séance). */
  function dockMascot() {
    if (!coach) return;
    var slot = (PL && playerRoot.querySelector('.mascot-slot')) || appEl.querySelector('.mascot-slot');
    if (slot && coach.el.parentNode !== slot) slot.appendChild(coach.el);
    if (slot) {
      // Sous l'en-tête de l'écran : bloc de la page (ou haut du lecteur de séance).
      var host = slot, top = slot.closest('.player-top');
      if (top) top.parentNode.appendChild(coach.bubble);
      else {
        while (host.parentNode && !(host.parentNode.classList && host.parentNode.classList.contains('view'))) host = host.parentNode;
        if (host.parentNode && host.nextSibling !== coach.bubble) host.parentNode.insertBefore(coach.bubble, host.nextSibling);
      }
    }
    var last = S.history[S.history.length - 1];
    coach.setBase(S.onboarded && last && daysBetween(new Date(last.at), new Date()) >= 7 ? 'sleepy' : 'neutral');
  }
  /* force : quand on touche la mascotte, elle répond toujours. */
  /* urgent : phrase attendue (nouvel écran, étape de séance), sans délai minimal. */
  function coachSay(line, force, urgent) {
    if (!coach || !line) return;
    if (!force) {
      if (S.profile.coach === false) return;
      if (!urgent && Date.now() - lastAuto < (PL ? 3500 : 9000)) return;
    }
    if (TOUR && !force) return;
    lastAuto = Date.now();
    coach.say(line.t, line.m, line.a);
    if (!PL) speak(line.t);
  }
  function lc(t) { return t.charAt(0).toLowerCase() + t.slice(1); }
  function firstName() { return S.profile.name ? ' ' + S.profile.name : ''; }

  function nearLine() {
    var x = nextUnlocks(S).filter(function (n) { return n.pct >= 0.7; })[0];
    if (!x) return null;
    var left = x.e.unlock - x.t;
    if (left <= 0) return { t: 'Tu peux débloquer ' + x.nx.name + ' à la prochaine séance !', m: 'excited', a: 'hop' };
    return { t: 'Plus que ' + left + (x.e.type === 'time' ? ' s' : ' rép.') + ' avant ' + x.nx.name + ' !', m: 'excited', a: 'hop' };
  }
  function homeLine() {
    var s = S, now = new Date(), last = s.history[s.history.length - 1], since = last ? daysBetween(new Date(last.at), now) : null;
    var goal = s.profile.days, weekDone = sessionsInWeek(weekStart(now), s).length, sess = buildSession(nextTpl(s), s), nm = firstName();
    if (since === null) return { t: 'Salut' + nm + ' ! Prêt pour ta première séance ?', m: 'happy', a: 'wave' };
    if (since === 0) return { t: 'Séance faite aujourd’hui, bravo' + nm + ' !', m: 'love', a: 'hop' };
    if (weekDone >= goal) return { t: 'Objectif de la semaine atteint !', m: 'cool', a: 'flex' };
    var near = nearLine();
    if (near && since <= 4) return near;
    if (since <= 2) return { t: 'On enchaîne ? ' + estimate(sess) + ' min aujourd’hui.', m: 'determined', a: 'flex' };
    if (since <= 6) return { t: since + ' jours sans séance… on s’y remet ?', m: 'surprised', a: 'shake' };
    return { t: 'Tu m’as manqué' + nm + ' ! On reprend en douceur ?', m: 'sad', a: 'wave' };
  }
  function viewLine() {
    var s = S;
    if (view === 'accueil') return homeLine();
    if (view === 'programme') {
      if (ui.progTab === 'trajectoire') {
        var v = capView(simulate(s, 52).snaps[ui.h].cap)[0];
        return { t: 'Dans ' + { 13: '3 mois', 26: '6 mois', 52: '1 an' }[ui.h] + ' : ' + v.n + (v.sfx || '') + ' ' + v.unit + ' !', m: 'excited', a: 'hop' };
      }
      return { t: 'Touche un exercice pour voir son tuto.', m: 'happy', a: 'wave' };
    }
    if (view === 'progres') {
      var r = rankOf(s.xp), n = s.unlocks.length;
      return { t: 'Rang ' + r.cur.name + (r.nxt ? ' · encore ' + fmtInt(r.nxt.xp - s.xp) + ' XP' : '') + (n ? ' · ' + n + ' niveau' + (n > 1 ? 'x' : '') : ''), m: 'cool', a: 'flex' };
    }
    return { t: 'Dis-moi ton matériel, j’adapte tout.', m: 'wink', a: 'wave' };
  }
  var TIPS = [
    { t: 'Serre les fessiers pendant les pompes.', m: 'wink' },
    { t: 'Lent à la descente, contrôlé à la montée.', m: 'determined' },
    { t: 'Dors 7 à 9 h : c’est là que tu progresses.', m: 'sleepy' },
    { t: 'Bois un peu d’eau pendant les repos.', m: 'happy' },
    { t: 'Une séance courte vaut mieux que rien.', m: 'proud' },
    { t: 'Échauffe tes poignets avant l’ATR.', m: 'surprised' },
    { t: 'Touche un exercice pour son tuto animé.', m: 'excited' },
    { t: 'Des protéines à chaque repas !', m: 'happy' }
  ];
  function obLine() {
    if (OB.screen === 'welcome') return { t: 'Salut ! Je te prépare un programme sur mesure.', m: 'happy', a: 'wave' };
    if (OB.screen === 'ready') {
      var v = capView(simulate(S, 52).snaps[13].cap)[0];
      return { t: 'C’est prêt ! On y va ?', m: 'excited', a: 'celebrate' };
    }
    return {
      goal: { t: 'Ton prénom, pour mieux t’encourager !', m: 'wink', a: 'wave' },
      equip: { t: 'Pas de matériel ? Le sol et une porte suffisent.', m: 'happy', a: 'hop' },
      push: { t: 'Sois honnête, je ne juge pas !', m: 'wink' },
      pull: { t: 'Zéro traction ? Normal au début.', m: 'determined', a: 'flex' },
      atr: { t: 'L’ATR, on y va pas à pas.', m: 'excited', a: 'hop' },
      days: { t: '3 séances par semaine, c’est idéal.', m: 'happy' }
    }[obQuestions()[OB.qi]];
  }
  function playerTapPool() {
    var st = curStep();
    if (st.k === 'rest') return [{ t: 'Respire, on repart bientôt !', m: 'happy' }, { t: 'Détends les épaules.', m: 'wink' }];
    if (st.k === 'set') { var e = PL.sess.items[st.i].ex; return [{ t: e.cues[0], m: 'determined', a: 'flex' }, { t: e.cues[1], m: 'wink' }]; }
    return [{ t: 'Je suis fier de toi !', m: 'love', a: 'hop' }];
  }
  function tapPool() {
    if (PL) return playerTapPool();
    if (!S.onboarded || OB.active) return [obLine()];
    var s = S, lines = [viewLine()], sim = simulate(s, 52), ms = milestones(sim, 52)[0], x = nextUnlocks(s)[0], streak = streakWeeks(s), near = nearLine();
    if (near) lines.push(near);
    if (ms) lines.push({ t: 'Bientôt : ' + lc(ms.txt) + ' !', m: 'excited', a: 'hop' });
    if (x) lines.push({ t: 'Prochain niveau : ' + x.nx.name + ' (' + Math.round(x.pct * 100) + ' %)', m: 'determined', a: 'flex' });
    if (streak >= 1) lines.push({ t: streak + ' semaine' + (streak > 1 ? 's' : '') + ' d’affilée, continue !', m: 'proud', a: 'flex' });
    lines.push(TIPS[Math.floor(Math.random() * TIPS.length)]);
    return lines;
  }
  function coachTap() {
    var pool = tapPool().filter(Boolean);
    if (pool.length) coachSay(pool[tapIdx++ % pool.length], true);
  }
  /* Une phrase la première fois qu'on ouvre chaque écran. */
  function coachView(force) {
    if (!coach) return;
    var inOb = !S.onboarded || OB.active;
    var key = inOb ? 'ob-' + OB.screen + '-' + OB.qi : view + (view === 'programme' ? '-' + ui.progTab : '');
    if (coachSeen[key] && !force) return;
    coachSeen[key] = true;
    var line = inOb ? obLine() : viewLine();
    setTimeout(function () { coachSay(line, false, true); }, 450);
  }
  var REST_LINES = ['Bien joué ! Respire.', 'Propre !', 'Belle série !', 'Ça avance bien !', 'Tu gères !'];
  /* Le coach pendant la séance. */
  function coachStep() {
    if (!coach || !PL) return;
    var st = curStep(), line = null;
    if (st.k === 'warm') line = { t: 'On s’échauffe d’abord !', m: 'happy', a: 'wave' };
    else if (st.k === 'set') {
      var it = PL.sess.items[st.i], e = it.ex, c = chain(e.f, S), next = c[c.indexOf(e) + 1];
      if (st.i === PL.sess.items.length - 1 && st.s === it.sets - 1) line = { t: 'Dernière série, donne tout !', m: 'effort', a: 'flex' };
      else if (st.s === 0 && it.main && next && it.target >= e.unlock) line = { t: 'Réussis tout et tu débloques ' + next.name + ' !', m: 'excited', a: 'hop' };
      else if (st.s === 0) line = { t: 'Allez, je compte avec toi !', m: 'determined', a: 'flex' };
    } else if (st.k === 'rest') {
      var prev = PL.log[st.i][st.s], tgt = PL.sess.items[st.i].target;
      if (prev != null && prev < tgt) line = { t: 'Pas grave, la prochaine sera mieux !', m: 'love' };
      else if (prev != null && prev > tgt) line = { t: 'Au-dessus de l’objectif, bravo !', m: 'surprised', a: 'hop' };
      else if (Math.random() < 0.35) line = { t: REST_LINES[Math.floor(Math.random() * REST_LINES.length)], m: 'happy' };
    } else if (st.k === 'done' && totalsOf(PL).sets) {
      lastAuto = 0;
      line = { t: 'Terminé ! Je suis fier de toi.', m: 'love', a: 'celebrate' };
    }
    coachSay(line, false, st.k !== 'rest');
  }
  function coachResult(R) {
    var line;
    if (R.unlocks.length) line = { t: 'Niveau débloqué : ' + EXM[R.unlocks[0]].name + ' !', m: 'cool', a: 'celebrate' };
    else if (R.rankUp) line = { t: 'Tu passes ' + R.rankUp + ' !', m: 'proud', a: 'celebrate' };
    else if (R.badges.length) line = { t: 'Nouveau badge : ' + D.BADGES.find(function (b) { return b.id === R.badges[0]; }).name + ' !', m: 'excited', a: 'hop' };
    else line = { t: 'Bien joué ! Objectifs ajustés.', m: 'proud', a: 'flex' };
    coachSay(line, false, true);
  }

  /* Tuto d'un exercice : mini vidéo, muscles, intérêt, points clés, erreurs. */
  function mountTuto(host, e, mini) {
    if (!host || !window.GraviteTuto) return null;
    var ctl = window.GraviteTuto.mount(host, e.id, { color: FAM[e.f].color, mini: !!mini, calm: calm() });
    if (!mini) sheetTv = ctl;
    return ctl;
  }
  function tutoBlock(e) {
    var info = window.GraviteTuto && window.GraviteTuto.info(e.id);
    var cues = '<div class="cues">' + e.cues.map(function (q) { return '<div>' + I.check + '<span>' + esc(q) + '</span></div>'; }).join('') + '</div>';
    if (!info) return cues;
    var chips = function (str, cls) { return str ? str.split(', ').map(function (m) { return '<span class="chip ' + cls + '">' + esc(m.charAt(0).toUpperCase() + m.slice(1)) + '</span>'; }).join('') : ''; };
    return '<div class="tuto"><div class="tv-host"></div>' +
      '<div class="seg tv-seg" role="group" aria-label="Exemple montré"><button type="button" data-act="tv-mode" data-v="good" aria-pressed="true">' + I.check + 'Bonne exécution</button>' +
      '<button type="button" data-act="tv-mode" data-v="bad" aria-pressed="false">' + I.close + 'À éviter</button></div>' +
      '<div class="tuto-sec"><h3>Muscles travaillés</h3><div class="summary-chips">' + chips(info.m, 'violet') + chips(info.s, 'dim') + '</div></div>' +
      '<div class="tuto-sec"><h3>Pourquoi le faire</h3><p>' + esc(info.why) + '</p></div>' +
      '<div class="tuto-sec"><h3>Points clés</h3>' + cues + '</div>' +
      '<div class="tuto-sec"><h3>Erreurs à éviter</h3><ul class="errs">' + info.err.map(function (x) { return '<li>' + I.close + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul></div></div>';
  }

  /* ================= Accessibilité ================= */
  var sheetOpener = null;
  function a11y() { return S.profile.a11y || {}; }
  function calm() { return reduceMotion || !!a11y().calm; }
  function applyA11y() {
    var a = a11y(), r = document.documentElement;
    r.lang = 'fr';
    r.classList.toggle('a11y-large', !!a.large);
    r.classList.toggle('a11y-contrast', !!a.contrast);
    r.classList.toggle('a11y-calm', !!a.calm);
  }
  var voiceOk = 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
  /* Lecture à voix haute (synthèse vocale du navigateur, en français). */
  function speak(text) {
    if (!voiceOk || !a11y().voice || !text) return;
    try {
      window.speechSynthesis.cancel();
      var u = new window.SpeechSynthesisUtterance(text);
      u.lang = 'fr-FR'; u.rate = 1.03;
      var v = window.speechSynthesis.getVoices().filter(function (x) { return /^fr/i.test(x.lang); })[0];
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }
  function playerSpeak() {
    if (!PL || !a11y().voice) return;
    var st = curStep();
    if (st.k === 'warm') speak('Échauffement. ' + D.WARMUP.map(function (w) { return w.name; }).join('. ') + '.');
    else if (st.k === 'set') {
      var it = PL.sess.items[st.i], e = it.ex;
      speak(e.name + '. Série ' + (st.s + 1) + ' sur ' + it.sets + '. Objectif : ' + it.target + ' ' + unitLong(e, it.target) + '.');
    } else if (st.k === 'rest') {
      var nx = PL.sess.items[st.ni];
      speak('Repos, ' + st.dur + ' secondes. Ensuite : ' + nx.ex.name + '.');
    } else if (st.k === 'done') speak('Séance terminée. Bravo !');
  }
  function a11yCard() {
    var a = a11y();
    var row = function (k, title, sub) {
      return '<div class="toggle-row"><span class="t"><b>' + title + '</b><span>' + sub + '</span></span>' +
        '<button class="switch" type="button" role="switch" aria-label="' + title + '" aria-checked="' + !!a[k] + '" data-act="pf-a11y" data-k="' + k + '"></button></div>';
    };
    return '<div class="section-head"><h2>Accessibilité</h2></div><div class="card" id="a11y-card">' +
      row('large', 'Texte plus grand', 'Agrandit les textes et les boutons') +
      row('contrast', 'Contraste renforcé', 'Textes plus lisibles sur fond uni') +
      row('calm', 'Réduire les animations', 'Coupe les mouvements et les effets visuels') +
      (voiceOk ? row('voice', 'Lecture à voix haute', 'Le coach, la visite et les consignes de séance sont lus') : '') + '</div>';
  }
  function trapFocus(e) {
    var root = TOUR ? $('.tour-card') : ($('#sheet .sheet') || (PL ? $('.player') : null));
    if (!root) return;
    var f = $$('button:not([disabled]), input, textarea, select, [tabindex="0"]', root).filter(function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (!root.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (TOUR) { e.preventDefault(); endTour(false); return; }
      if ($('#sheet')) { e.preventDefault(); closeSheet(); return; }
      if (PL) { e.preventDefault(); playerAction('pl-close', document.body); return; }
      if (coach) coach.hide();
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[role="button"][data-act]')) { e.preventDefault(); e.target.click(); }
    if (e.key === 'Tab') trapFocus(e);
  });

  /* ================= Comptes (e-mail) ================= */
  var cloudUid = null, pendingRemote = null;
  function cloudOn() { return !!(window.GraviteCloud && window.GraviteCloud.enabled()); }
  function cloudUser() { return cloudOn() ? window.GraviteCloud.user() : null; }
  function savedLabel() {
    var C = window.GraviteCloud, st = C.status(), t = C.savedAt();
    if (st === 'saving' || st === 'pending') return 'Sauvegarde en cours…';
    if (st === 'error') return 'Sauvegarde impossible pour le moment. Nouvel essai à la prochaine modification.';
    return t ? 'Progression sauvegardée à ' + fmtDate(t, { hour: '2-digit', minute: '2-digit' }) : 'Progression sauvegardée sur ton compte';
  }
  function accountCard() {
    if (!cloudOn() || demo) return '';
    var u = cloudUser(), head = '<div class="section-head"><h2>Mon compte</h2></div><div class="card" id="account-card" style="display:grid;gap:14px">';
    if (!u) {
      return head + '<div class="equip-tip"><span class="eq-ic">' + I.cloud + '</span><div><b>Sauvegarde ta progression</b>' +
        '<p class="faint" style="font-size:13px">Crée un compte gratuit avec ton e-mail : tes séances, niveaux et badges te suivent sur tous tes appareils.</p></div></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button class="btn primary" type="button" data-act="acc-open" data-v="signup">Créer un compte</button>' +
        '<button class="btn" type="button" data-act="acc-open" data-v="login">Se connecter</button></div></div>';
    }
    return head + '<div class="equip-tip"><span class="eq-ic">' + I.cloud + '</span><div><b class="acc-email">' + esc(u.email || 'Compte connecté') + '</b>' +
      '<p class="faint" id="acc-status" role="status" style="font-size:13px">' + savedLabel() + '</p></div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button class="btn" type="button" data-act="acc-logout">Se déconnecter</button>' +
      '<button class="btn" type="button" data-act="acc-open" data-v="newpw">Mot de passe</button></div>' +
      '<button class="btn block danger ghost" type="button" data-act="acc-delete">' + I.trash + 'Supprimer mon compte</button></div>';
  }
  var ACC = {
    signup: { t: 'Créer un compte', p: 'C’est gratuit. Ton e-mail sert uniquement à te connecter et à récupérer ton mot de passe.', btn: 'Créer mon compte', ac: 'new-password', email: 1, pass: 1 },
    login: { t: 'Se connecter', p: 'Retrouve ta progression sur cet appareil.', btn: 'Me connecter', ac: 'current-password', email: 1, pass: 1 },
    forgot: { t: 'Mot de passe oublié', p: 'Indique ton e-mail : tu recevras un lien pour choisir un nouveau mot de passe.', btn: 'Envoyer le lien', email: 1 },
    newpw: { t: 'Nouveau mot de passe', p: 'Choisis un nouveau mot de passe de 8 caractères minimum.', btn: 'Enregistrer', ac: 'new-password', pass: 1 }
  };
  function accountSheet(mode) {
    var M = ACC[mode];
    var html = '<form id="acc-form" data-mode="' + mode + '" novalidate style="display:grid;gap:14px"><h2 class="title-lg">' + M.t + '</h2><p class="muted" style="font-size:14px">' + M.p + '</p>' +
      (M.email ? '<div class="field"><label for="acc-email">Adresse e-mail</label><input id="acc-email" class="input" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" required></div>' : '') +
      (M.pass ? '<div class="field"><label for="acc-pw">Mot de passe</label><div class="pw-wrap"><input id="acc-pw" class="input" type="password" autocomplete="' + M.ac + '" minlength="8" required aria-describedby="acc-pw-help">' +
        '<button class="pw-toggle" type="button" data-act="pw-toggle" aria-label="Afficher le mot de passe" aria-pressed="false">' + I.eye + '</button></div>' +
        '<p id="acc-pw-help" class="faint" style="font-size:12.5px">8 caractères minimum.</p></div>' : '') +
      '<p id="acc-err" class="form-err" role="alert" hidden></p>' +
      '<button class="btn primary block" type="submit" id="acc-submit">' + M.btn + '</button>' +
      (mode === 'signup' ? '<button class="link-btn" type="button" data-act="acc-open" data-v="login">J’ai déjà un compte</button>' : '') +
      (mode === 'login' ? '<div class="link-row"><button class="link-btn" type="button" data-act="acc-open" data-v="forgot">Mot de passe oublié ?</button><button class="link-btn" type="button" data-act="acc-open" data-v="signup">Créer un compte</button></div>' : '') +
      '</form><button class="btn block ghost" type="button" data-act="sheet-close">Annuler</button>';
    openSheet(html, M.t);
    var first = $('#acc-email') || $('#acc-pw');
    if (first) { try { first.focus(); } catch (e) { /* ignore */ } }
  }
  function infoSheet(title, text) {
    openSheet('<div style="display:grid;gap:12px;text-align:center;justify-items:center"><span class="eq-ic" style="width:56px;height:56px;border-radius:18px">' + I.cloud + '</span>' +
      '<h2 class="title-lg">' + esc(title) + '</h2><p class="muted">' + esc(text) + '</p></div>' +
      '<button class="btn primary block" type="button" data-act="sheet-close">Compris</button>', title);
  }
  document.addEventListener('submit', function (e) {
    if (!e.target || e.target.id !== 'acc-form') return;
    e.preventDefault();
    var f = e.target, mode = f.dataset.mode, C = window.GraviteCloud;
    var emailEl = $('#acc-email', f), pwEl = $('#acc-pw', f), email = emailEl ? emailEl.value.trim() : '', pw = pwEl ? pwEl.value : '';
    var err = $('#acc-err'), btn = $('#acc-submit'), label = btn.textContent;
    function fail(m, field) {
      err.hidden = false; err.textContent = m; btn.disabled = false; btn.textContent = label;
      if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
    }
    if (emailEl) emailEl.removeAttribute('aria-invalid');
    if (pwEl) pwEl.removeAttribute('aria-invalid');
    if (emailEl && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Entre une adresse e-mail valide, par exemple prenom@exemple.fr.', emailEl);
    if (pwEl && pw.length < 8) return fail('Le mot de passe doit faire au moins 8 caractères.', pwEl);
    if (!C || !C.enabled()) return fail('Les comptes ne sont pas disponibles sur cette version de l’appli.');
    err.hidden = true; btn.disabled = true; btn.textContent = 'Un instant…';
    var p;
    if (mode === 'signup') {
      p = C.signUp(email, pw).then(function (r) {
        if (r.needsConfirm) infoSheet('Vérifie ta boîte mail', 'On t’a envoyé un lien de confirmation à ' + email + '. Clique dessus pour activer ton compte : ta progression sera alors sauvegardée.');
        else { closeSheet(); toast('Compte créé : ta progression est sauvegardée'); }
      });
    } else if (mode === 'login') {
      p = C.signIn(email, pw).then(function () { closeSheet(); toast('Connecté'); });
    } else if (mode === 'forgot') {
      p = C.resetPassword(email).then(function () { infoSheet('Regarde tes e-mails', 'Si un compte existe pour ' + email + ', tu vas recevoir un lien pour choisir un nouveau mot de passe.'); });
    } else {
      p = C.updatePassword(pw).then(function () { closeSheet(); toast('Mot de passe enregistré'); });
    }
    p.catch(function (x) { fail(x.message); });
  });

  /* Au moment de la connexion : on réunit la progression du compte et celle de l'appareil. */
  function cloudPull(interactive) {
    window.GraviteCloud.load().then(function (data) {
      var r = data ? normalize(data) : null, L = REAL;
      var lHas = L.onboarded && L.totals.sessions > 0, rHas = !!(r && r.onboarded && r.totals.sessions > 0);
      if (!r || !r.onboarded) { if (L.onboarded) window.GraviteCloud.queueSave(L, true); return; }
      if (!L.onboarded) return adoptCloud(r);
      if ((r.updatedAt || 0) === (L.updatedAt || 0)) return;
      if (lHas && rHas && interactive) return conflictSheet(r);
      if (rHas && !lHas) return adoptCloud(r);
      if (lHas && !rHas) return window.GraviteCloud.queueSave(L, true);
      if ((r.updatedAt || 0) > (L.updatedAt || 0)) adoptCloud(r); else window.GraviteCloud.queueSave(L, true);
    }).catch(function (x) { toast(x.message); });
  }
  function adoptCloud(r) {
    r.onboarded = true;
    REAL = r; Store.writeLocal(REAL);
    if (!demo) S = REAL;
    applyA11y();
    if (!PL) { OB = newOB(); render(); }
    toast('Progression récupérée depuis ton compte');
  }
  function conflictSheet(r) {
    var d = function (s) { return s.totals.sessions + ' séance' + (s.totals.sessions > 1 ? 's' : '') + ', ' + fmtInt(s.xp) + ' XP'; };
    pendingRemote = r;
    openSheet('<h2 class="title-lg">Quelle progression garder ?</h2><p class="muted">Ton compte et cet appareil ont chacun une progression différente. L’autre sera remplacée.</p>' +
      '<div class="sheet-actions"><button class="btn primary block" type="button" data-act="conflict" data-v="cloud">Celle du compte (' + d(r) + ')</button>' +
      '<button class="btn block" type="button" data-act="conflict" data-v="local">Celle de cet appareil (' + d(REAL) + ')</button></div>', 'Choisir la progression');
  }
  function initCloud() {
    if (!window.GraviteCloud || window.claude || !window.GraviteCloud.init()) return;
    window.GraviteCloud.on(function (event, user) {
      if (event === 'STATUS') { var el = $('#acc-status'); if (el) el.textContent = savedLabel(); return; }
      if (event === 'PASSWORD_RECOVERY') accountSheet('newpw');
      var uid = user ? user.id : null;
      if (uid && uid !== cloudUid) { cloudUid = uid; cloudPull(event === 'SIGNED_IN'); }
      else if (!uid) cloudUid = null;
      if (!PL && !TOUR && (view === 'profil' || !S.onboarded)) render();
    });
  }

  /* ================= Visite guidée ================= */
  var TOUR = null, tourType = null, tourRaf = null;
  function tourSteps() {
    return [
      { view: 'accueil', intro: true, text: 'Bienvenue' + firstName() + ' ! Une visite rapide en 5 étapes ?', mood: 'happy', anim: 'wave' },
      { view: 'accueil', target: '.card-hero', text: 'Ta séance du jour. Touche un exercice pour son tuto, ou « Commencer » pour démarrer.', mood: 'excited', anim: 'hop' },
      { view: 'accueil', target: '.tab[data-view="programme"]', wait: true, text: '« Programme » : ta semaine et ton planning de progrès. Touche-le !', mood: 'happy', anim: 'walk' },
      { view: 'programme', target: '.tab[data-view="progres"]', wait: true, text: '« Progrès » : ton rang, tes niveaux et tes badges. Touche-le !', mood: 'determined', anim: 'walk' },
      { view: 'progres', target: '.tab[data-view="profil"]', wait: true, text: '« Profil » : rappels, matériel, compte et accessibilité. Touche-le !', mood: 'wink', anim: 'walk' },
      { view: 'accueil', target: '#app .mascot', final: true, text: 'Et moi, je reste ici. Touche-moi pour un conseil !', mood: 'love', anim: 'celebrate' }
    ];
  }
  function startTour() {
    if (TOUR || PL || !S.onboarded) return;
    closeSheet();
    if (coach) coach.hide();
    var el = document.createElement('div');
    el.className = 'tour'; el.id = 'tour';
    el.innerHTML = ['t', 'b', 'l', 'r', 'h'].map(function (k) { return '<div class="tour-block" data-b="' + k + '"></div>'; }).join('') +
      '<div class="tour-ring empty" aria-hidden="true"></div>' +
      '<div class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-live"><div class="tour-mascot"></div>' +
      '<div class="tour-body"><p class="tour-step"></p><p class="tour-text" aria-hidden="true"></p><p class="sr-only" id="tour-live" aria-live="polite"></p><div class="tour-foot"></div></div></div>';
    document.body.appendChild(el);
    var m = window.GraviteCoach ? window.GraviteCoach.create({ onTap: function () { if (TOUR && TOUR.mascot) TOUR.mascot.express('happy', 'hop', 500); } }) : null;
    if (m) el.querySelector('.tour-mascot').appendChild(m.el);
    TOUR = { i: 0, steps: tourSteps(), el: el, mascot: m, target: null };
    showTourStep();
  }
  function showTourStep() {
    var step = TOUR.steps[TOUR.i], changeView = step.view && step.view !== view;
    if (step.before) step.before();
    if (changeView) { view = step.view; try { location.hash = view; } catch (e) { /* ignore */ } }
    if (changeView || step.before) { render(changeView); window.scrollTo(0, 0); }
    TOUR.target = null;
    TOUR.el.classList.add('moving');
    setTimeout(function () {
      if (!TOUR) return;
      var t = step.target ? document.querySelector(step.target) : null;
      TOUR.target = t;
      if (t && !t.closest('.tabbar')) t.scrollIntoView({ block: 'center', behavior: calm() ? 'auto' : 'smooth' });
      setTimeout(function () {
        if (!TOUR) return;
        placeTour();
        fillTourCard(step);
        TOUR.el.classList.remove('moving');
      }, t ? 450 : 30);
    }, changeView || step.before ? 140 : 40);
  }
  function placeTour() {
    var step = TOUR.steps[TOUR.i], t = TOUR.target, el = TOUR.el, W = innerWidth, H = innerHeight, pad = 8, h;
    if (t && t.isConnected) {
      var r = t.getBoundingClientRect();
      h = { x: Math.max(4, r.left - pad), y: Math.max(4, r.top - pad) };
      h.w = Math.min(W - 4, r.right + pad) - h.x; h.h = Math.min(H - 4, r.bottom + pad) - h.y;
    } else h = { x: W / 2, y: H / 2, w: 0, h: 0 };
    var ring = el.querySelector('.tour-ring');
    ring.style.cssText = 'left:' + h.x + 'px;top:' + h.y + 'px;width:' + h.w + 'px;height:' + h.h + 'px';
    ring.classList.toggle('empty', !t);
    var b = function (k, x, y, w, hh) { el.querySelector('[data-b="' + k + '"]').style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + Math.max(0, w) + 'px;height:' + Math.max(0, hh) + 'px'; };
    b('t', 0, 0, W, h.y); b('b', 0, h.y + h.h, W, H - h.y - h.h); b('l', 0, h.y, h.x, h.h); b('r', h.x + h.w, h.y, W - h.x - h.w, h.h);
    b('h', h.x, h.y, step.wait ? 0 : h.w, step.wait ? 0 : h.h);
    el.querySelector('.tour-card').classList.toggle('at-top', !!t && h.y + h.h / 2 > H * 0.5);
  }
  function fillTourCard(step) {
    var el = TOUR.el, n = TOUR.steps.length, txt = el.querySelector('.tour-text');
    el.querySelector('.tour-step').textContent = step.intro ? 'Visite guidée' : 'Étape ' + TOUR.i + ' sur ' + (n - 1);
    el.querySelector('#tour-live').textContent = step.text;
    clearInterval(tourType);
    if (calm()) txt.textContent = step.text;
    else {
      var i = 0;
      txt.textContent = '';
      tourType = setInterval(function () { i += 2; txt.textContent = step.text.slice(0, i); if (i >= step.text.length) clearInterval(tourType); }, 22);
    }
    if (TOUR.mascot) TOUR.mascot.express(step.mood, step.anim, Math.min(4200, step.text.length * 24));
    el.querySelector('.tour-foot').innerHTML = step.intro
      ? '<button class="btn ghost" type="button" data-act="tour-skip">Plus tard</button><button class="btn primary" type="button" data-act="tour-next">C’est parti</button>'
      : '<button class="btn ghost" type="button" data-act="tour-skip">Passer</button><button class="btn primary" type="button" data-act="tour-next">' + (step.final ? 'Terminer' : 'Suivant') + '</button>';
    speak(step.text);
    var nb = el.querySelector('[data-act="tour-next"]');
    if (nb) { try { nb.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
  }
  function nextTour() {
    if (!TOUR) return;
    var step = TOUR.steps[TOUR.i];
    if (step.after) step.after();
    if (step.final || TOUR.i >= TOUR.steps.length - 1) { endTour(true); return; }
    TOUR.i++;
    showTourStep();
  }
  function endTour(done) {
    if (!TOUR) return;
    clearInterval(tourType);
    TOUR.el.remove();
    TOUR = null;
    closeSheet();
    S.profile.tourDone = true;
    save();
    if (done) { coachSay({ t: 'À toi de jouer !', m: 'proud', a: 'celebrate' }, true); confetti(); }
    else coachSay({ t: 'La visite reste dans ton profil.', m: 'wink', a: 'wave' }, true);
  }
  /* Les étapes « touche ici » avancent dès que la personne touche la zone en surbrillance. */
  document.addEventListener('click', function (e) {
    if (!TOUR || TOUR.waiting) return;
    var step = TOUR.steps[TOUR.i];
    if (step.wait && TOUR.target && TOUR.target.contains(e.target)) {
      TOUR.waiting = true;
      setTimeout(function () { if (TOUR) { TOUR.waiting = false; nextTour(); } }, 560);
    }
  }, true);
  function tourReflow() {
    if (!TOUR || tourRaf) return;
    tourRaf = requestAnimationFrame(function () { tourRaf = null; if (TOUR && !TOUR.el.classList.contains('moving')) placeTour(); });
  }
  window.addEventListener('resize', tourReflow);
  document.addEventListener('scroll', tourReflow, true);

  /* ================= Rappels (notifications) ================= */
  var remT = null, DAYS_FR = ['L', 'M', 'M', 'J', 'V', 'S', 'D'], DAYS_LONG = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  function remOk() { return !!(window.GravitePush && window.GravitePush.ready()) && !demo; }
  function remDefaultDays(n) { return { 2: [2, 5], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6] }[n] || [1, 3, 5]; }
  function remPrefs() {
    var r = S.profile.rem || {};
    var days = (r.days && r.days.length ? r.days : remDefaultDays(S.profile.days)).slice().sort(function (a, b) { return a - b; });
    return { on: !!r.on, days: days, hour: r.hour != null ? +r.hour : 18 };
  }
  /* Ce que le serveur sait pour personnaliser le rappel (aucune donnée personnelle). */
  function remCtx() {
    var s = S, last = s.history[s.history.length - 1];
    return { next: D.TEMPLATES[nextTpl(s)].name, goal: s.profile.days, weekDone: sessionsInWeek(weekStart(new Date()), s).length, streak: streakWeeks(s), last: last ? dayKey(new Date(last.at)) : null };
  }
  function scheduleRemSync() {
    clearTimeout(remT);
    remT = setTimeout(function () {
      var p = remPrefs();
      if (p.on && remOk()) window.GravitePush.update(p, remCtx()).catch(function () { /* nouvel essai à la prochaine modification */ });
    }, 2500);
  }
  function listDays(days) {
    var n = days.map(function (d) { return DAYS_LONG[d - 1]; });
    return n.length > 1 ? n.slice(0, -1).join(', ') + ' et ' + n[n.length - 1] : n[0];
  }
  function remSummary(p) { return p.on ? 'Le ' + listDays(p.days) + ', à ' + p.hour + ' h' : 'Une notification les jours d’entraînement'; }
  function remCard() {
    if (!remOk()) return '';
    var p = remPrefs(), P = window.GravitePush, html = '<div class="section-head"><h2>Rappels</h2></div><div class="card" id="rem-card" style="display:grid;gap:14px">';
    if (P.needsInstall()) {
      return html + '<div class="equip-tip"><span class="eq-ic">' + I.bell + '</span><div><b>Ajoute l’appli à ton écran d’accueil</b>' +
        '<p class="faint" style="font-size:13px">Sur iPhone, les rappels ne marchent que depuis l’appli installée : touche Partager, puis « Sur l’écran d’accueil », et ouvre l’appli depuis son icône.</p></div></div></div>';
    }
    html += '<div class="toggle-row"><span class="t"><b>Me rappeler mes séances</b><span id="rem-sum">' + remSummary(p) + '</span></span>' +
      '<button class="switch" type="button" role="switch" aria-label="Me rappeler mes séances" aria-checked="' + p.on + '" data-act="rem-toggle"></button></div>';
    if (P.permission() === 'denied') html += '<p class="form-err">Les notifications sont bloquées pour ce site. Autorise-les dans les réglages du navigateur.</p>';
    if (p.on) {
      var hours = '';
      for (var h = 6; h <= 22; h++) hours += '<option value="' + h + '"' + (h === p.hour ? ' selected' : '') + '>' + h + ' h 00</option>';
      html += '<div class="field"><span class="label" id="rem-days-label">Jours</span><div class="day-picks" role="group" aria-labelledby="rem-days-label">' +
        DAYS_FR.map(function (l, i) {
          return '<button type="button" class="day-pick" data-act="rem-day" data-v="' + (i + 1) + '" aria-pressed="' + (p.days.indexOf(i + 1) >= 0) + '" aria-label="' + DAYS_LONG[i] + '">' + l + '</button>';
        }).join('') + '</div></div>' +
        '<div class="field"><label for="rem-hour">Heure du rappel</label><select id="rem-hour" class="input">' + hours + '</select></div>' +
        '<button class="btn block ghost" type="button" data-act="rem-test">' + I.bell + 'M’envoyer un essai</button>' +
        '<p class="faint" style="font-size:12.5px">Pas de rappel si ta séance du jour est déjà faite.</p>';
    }
    return html + '</div>';
  }
  /* Au démarrage : si l'autorisation a été retirée, on désactive ; sinon on met à jour le serveur. */
  function remBoot() {
    if (!remOk()) return;
    window.GravitePush.current().then(function (s) {
      var p = remPrefs();
      if (!s && p.on) { S.profile.rem = Object.assign({}, S.profile.rem, { on: false }); save(); if (view === 'profil' && !PL) render(); }
      else if (s && p.on) scheduleRemSync();
    });
  }
  document.addEventListener('change', function (e) {
    if (e.target.id !== 'rem-hour') return;
    var p = remPrefs();
    S.profile.rem = { on: p.on, days: p.days, hour: +e.target.value };
    save();
    var sum = $('#rem-sum'); if (sum) sum.textContent = remSummary(remPrefs());
    toast('Rappel à ' + e.target.value + ' h');
  });

  /* ================= Démarrage ================= */
  applyA11y();
  (function () {
    var skip = document.createElement('button');
    skip.type = 'button'; skip.className = 'skip-link'; skip.textContent = 'Aller au contenu';
    skip.addEventListener('click', function () { appEl.setAttribute('tabindex', '-1'); appEl.focus(); });
    document.body.insertBefore(skip, document.body.firstChild);
  })();
  render();
  initCloud();
  remBoot();
  setTimeout(function () {
    if (S.onboarded && !demo && !S.profile.tourDone && !readResume()) startTour(); else coachView();
  }, 900);
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
