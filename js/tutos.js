/*
 * Gravité : tutos des exercices.
 * - INFO : muscles, intérêt et erreurs fréquentes de chaque exercice.
 * - Mini vidéos : un personnage animé (silhouette au trait) qui montre la bonne
 *   exécution et l'erreur la plus courante. Les poses sont générées par familles
 *   de mouvements, les coudes et genoux sont placés par cinématique inverse.
 */
window.GraviteTuto = (function () {
  'use strict';

  /* ================= Fiches ================= */
  // m : muscles principaux · s : muscles secondaires · why : intérêt · err : erreurs (la 1re est animée)
  var INFO = {
    'pompes-mur': { m: 'Pectoraux, triceps, épaules', s: 'Gainage', why: 'La porte d’entrée des pompes : tu apprends le gainage et le trajet des coudes sans porter tout ton poids.', err: ['Bassin qui part en arrière', 'Coudes écartés en croix'] },
    'pompes-inclinees': { m: 'Pectoraux, triceps, épaules', s: 'Gainage', why: 'Plus les mains sont hautes, plus c’est facile : idéal pour accumuler des répétitions propres.', err: ['Bassin qui s’affaisse', 'Amplitude incomplète'] },
    'pompes-genoux': { m: 'Pectoraux, triceps, épaules', s: 'Gainage', why: 'Toute l’amplitude d’une vraie pompe, avec un levier plus court.', err: ['Fesses en l’air', 'Tête qui plonge avant la poitrine'] },
    'pompes': { m: 'Pectoraux, triceps, deltoïdes avant', s: 'Abdos, dentelés', why: 'Le mouvement de base du haut du corps : force de poussée et gainage en même temps.', err: ['Bassin qui s’affaisse', 'Demi-répétitions sans descendre'] },
    'dips-chaise': { m: 'Triceps, bas des pectoraux, épaules', s: '', why: 'Cible les triceps et prépare aux dips aux barres.', err: ['Descendre trop bas et forcer sur les épaules', 'Pousser avec les jambes'] },
    'pompes-diamant': { m: 'Triceps, pectoraux', s: 'Épaules, gainage', why: 'Mains rapprochées : les triceps font l’essentiel du travail.', err: ['Bassin qui s’affaisse', 'Coudes qui s’écartent'] },
    'pompes-declinees': { m: 'Haut des pectoraux, épaules, triceps', s: 'Gainage', why: 'Pieds surélevés : plus de poids sur les bras et le haut des pectoraux.', err: ['Bassin qui tombe', 'Cou tendu vers l’avant'] },
    'dips': { m: 'Triceps, pectoraux, épaules', s: 'Gainage', why: 'Un des meilleurs exercices de poussée au poids du corps, et la base du muscle-up.', err: ['Descente trop profonde, épaules en avant', 'Épaules qui remontent vers les oreilles'] },
    'pompes-archer': { m: 'Pectoraux, triceps, un côté à la fois', s: 'Gainage, épaules', why: 'Charge un bras après l’autre : la transition vers la pompe à un bras.', err: ['Bassin qui s’affaisse', 'Buste qui tourne'] },
    'pompes-pseudo': { m: 'Épaules avant, pectoraux, avant-bras', s: 'Gainage, poignets', why: 'Le corps penché en avant prépare à la planche, la figure de gymnastique.', err: ['Bassin qui s’affaisse', 'Épaules qui reculent derrière les mains'] },
    'pompes-un-bras': { m: 'Pectoraux, triceps, obliques', s: 'Gainage complet', why: 'Le sommet du parcours poussée : force maximale et gainage anti-rotation.', err: ['Bassin qui s’affaisse', 'Bassin qui tourne'] },

    'superman': { m: 'Lombaires, fessiers, haut du dos', s: 'Ischios', why: 'Renforce toute la chaîne arrière du corps, sans aucun matériel.', err: ['Nuque cassée vers l’arrière', 'À-coups au lieu de tenir'] },
    'ytw': { m: 'Trapèzes moyens et inférieurs, deltoïdes arrière', s: 'Rhomboïdes', why: 'Muscle le haut du dos et protège les épaules, sans matériel.', err: ['Buste trop relevé', 'Mouvements rapides et bâclés'] },
    'rowing-serviette': { m: 'Dorsaux, rhomboïdes, biceps', s: 'Avant-bras, gainage', why: 'Un vrai tirage horizontal avec seulement une porte et une serviette.', err: ['Bassin qui casse', 'Tirer avec les bras sans serrer les omoplates'] },
    'suspension': { m: 'Avant-bras (poigne), dorsaux, épaules', s: 'Gainage', why: 'Construit la poigne et habitue les épaules à la barre.', err: ['Balancement', 'Épaules relâchées vers les oreilles'] },
    'rowing-elastique': { m: 'Dorsaux, rhomboïdes, biceps', s: 'Deltoïdes arrière', why: 'L’élastique permet de tirer horizontalement n’importe où.', err: ['Élan avec le buste', 'Épaules qui remontent'] },
    'rowing-incline': { m: 'Dorsaux, rhomboïdes, biceps', s: 'Gainage', why: 'Version facile du rowing australien : la base du tirage.', err: ['Bassin qui tombe', 'Coudes trop écartés'] },
    'rowing-australien': { m: 'Dorsaux, rhomboïdes, biceps', s: 'Gainage, fessiers', why: 'Le tirage horizontal de référence, partenaire idéal des pompes.', err: ['Bassin qui tombe', 'Amplitude incomplète'] },
    'rowing-serviette-uni': { m: 'Dorsaux, biceps, obliques', s: 'Avant-bras', why: 'Un bras à la fois : plus dur, et excellent pour le gainage.', err: ['Bassin qui casse', 'Buste qui tourne'] },
    'tirage-elastique': { m: 'Grand dorsal, biceps', s: 'Trapèzes inférieurs', why: 'Reproduit le geste des tractions avec un simple élastique.', err: ['Dos qui se cambre en arrière', 'Tirer avec les mains au lieu des coudes'] },
    'rowing-pieds': { m: 'Dorsaux, rhomboïdes, biceps', s: 'Fessiers, gainage', why: 'Pieds surélevés : tu tires une plus grande part de ton poids.', err: ['Bassin qui tombe', 'Tirer trop vite'] },
    'rowing-archer': { m: 'Dorsaux, biceps, un côté à la fois', s: 'Gainage', why: 'Charge un bras après l’autre et prépare aux tractions archer.', err: ['Bassin qui tombe', 'Bras tendu qui plie'] },
    'tractions-scap': { m: 'Trapèzes inférieurs, dentelés, dorsaux', s: 'Poigne', why: 'Apprend à engager les épaules : la base de toute traction.', err: ['Plier les bras', 'Balancement'] },
    'tractions-negatives': { m: 'Dorsaux, biceps', s: 'Poigne, gainage', why: 'La descente lente construit la force de ta première traction.', err: ['Descendre trop vite', 'Lâcher en bas sans contrôle'] },
    'tractions-elastique': { m: 'Dorsaux, biceps', s: 'Poigne', why: 'L’élastique t’allège pour faire des tractions complètes.', err: ['Demi-amplitude', 'Rebondir sur l’élastique'] },
    'chin-ups': { m: 'Dorsaux, biceps', s: 'Avant-bras, abdos', why: 'Paumes vers toi : la traction la plus accessible grâce aux biceps.', err: ['Élan avec les jambes', 'Demi-amplitude'] },
    'tractions': { m: 'Grand dorsal, biceps, trapèzes', s: 'Avant-bras, abdos', why: 'Le roi des exercices de dos au poids du corps.', err: ['Élan avec les jambes', 'Menton qui ne passe pas la barre'] },
    'tractions-archer': { m: 'Dorsaux, biceps, un côté à la fois', s: 'Poigne', why: 'Une étape vers la traction à un bras.', err: ['Élan avec les jambes', 'Bras tendu qui plie'] },
    'tractions-explosives': { m: 'Dorsaux, biceps', s: 'Puissance, poigne', why: 'Développe la vitesse de tirage nécessaire au muscle-up.', err: ['Élan avec les jambes', 'Descente non contrôlée'] },
    'muscle-up': { m: 'Dorsaux, pectoraux, triceps', s: 'Abdos, avant-bras', why: 'Enchaîne traction et dips : une figure emblématique du street workout.', err: ['Grand balancement des jambes', 'Passer un bras après l’autre'] },

    'squats-assistes': { m: 'Quadriceps, fessiers', s: 'Mollets', why: 'Le support permet de descendre profond en gardant l’équilibre.', err: ['Tirer avec les bras', 'Talons qui décollent'] },
    'squats': { m: 'Quadriceps, fessiers, ischios', s: 'Mollets, gainage', why: 'Le mouvement de base des jambes, utile tous les jours.', err: ['Dos arrondi, buste trop penché', 'Genoux qui rentrent vers l’intérieur'] },
    'fentes': { m: 'Quadriceps, fessiers', s: 'Équilibre, adducteurs', why: 'Une jambe à la fois : corrige les déséquilibres entre les côtés.', err: ['Genou avant qui dépasse trop', 'Buste penché en avant'] },
    'squats-bulgares': { m: 'Quadriceps, fessiers', s: 'Équilibre', why: 'Une des meilleures variantes sur une jambe pour muscler les cuisses.', err: ['Genou avant qui dépasse trop', 'Pied avant trop près de la chaise'] },
    'squats-sautes': { m: 'Quadriceps, fessiers, mollets', s: 'Cardio', why: 'Développe l’explosivité et fait monter le cardio.', err: ['Réception jambes tendues', 'Genoux qui rentrent'] },
    'pistol-assiste': { m: 'Quadriceps, fessiers', s: 'Équilibre, chevilles', why: 'Apprend le squat sur une jambe avec un appui de sécurité.', err: ['Buste qui s’effondre', 'Talon qui décolle'] },
    'shrimp': { m: 'Quadriceps, fessiers', s: 'Équilibre', why: 'Squat sur une jambe, jambe arrière pliée : plus accessible que le pistol pour beaucoup.', err: ['Buste trop penché', 'Genou arrière qui tombe d’un coup'] },
    'pistol': { m: 'Quadriceps, fessiers, mollets', s: 'Gainage, équilibre', why: 'La référence du squat sur une jambe : force et mobilité.', err: ['Buste qui s’effondre', 'Talon qui décolle'] },

    'planche': { m: 'Transverse, grand droit, fessiers', s: 'Épaules', why: 'Le gainage de base : protège le dos et sert dans tous les exercices.', err: ['Bassin qui s’affaisse', 'Fesses trop hautes'] },
    'genoux-sol': { m: 'Bas des abdos, fléchisseurs de hanche', s: '', why: 'Le premier pas vers les relevés de jambes.', err: ['Bas du dos qui se cambre', 'Élan avec les jambes'] },
    'hollow': { m: 'Grand droit, transverse', s: 'Fléchisseurs de hanche', why: 'La position de base de la gymnastique : un corps solide comme une coque.', err: ['Bas du dos décollé du sol', 'Menton collé à la poitrine'] },
    'jambes-sol': { m: 'Bas des abdos, fléchisseurs de hanche', s: 'Transverse', why: 'Plus dur que les genoux : levier long et contrôle total.', err: ['Dos cambré, pieds qui retombent au sol', 'Élan avec les jambes'] },
    'genoux-suspendu': { m: 'Abdos, fléchisseurs de hanche', s: 'Poigne', why: 'Le gainage suspendu travaille aussi la poigne.', err: ['Balancement', 'Lâcher les jambes d’un coup'] },
    'lsit-groupe': { m: 'Abdos, fléchisseurs de hanche, triceps', s: 'Épaules', why: 'Prépare au L-sit en gardant les genoux pliés.', err: ['Fesses qui touchent le sol', 'Épaules qui remontent'] },
    'jambes-suspendu': { m: 'Abdos, fléchisseurs de hanche', s: 'Poigne, dorsaux', why: 'Un gainage exigeant qui renforce tout le tronc.', err: ['Balancement', 'Jambes pliées pour tricher'] },
    'lsit': { m: 'Abdos, fléchisseurs de hanche, triceps', s: 'Épaules, quadriceps', why: 'Figure de base : force de compression et gainage.', err: ['Fesses qui touchent le sol', 'Jambes pliées'] },
    'dragon-flag': { m: 'Grand droit, obliques, gainage complet', s: 'Dorsaux', why: 'Un des exercices d’abdos les plus durs, rendu célèbre par Bruce Lee.', err: ['Hanches pliées', 'Descente non contrôlée'] },

    'pompes-pike': { m: 'Épaules, triceps, haut des pectoraux', s: 'Trapèzes', why: 'Prépare les épaules à porter le poids du corps tête en bas.', err: ['Hanches trop basses : ça devient une pompe', 'Coudes qui s’écartent'] },
    'montee-mur': { m: 'Épaules, triceps, gainage', s: 'Poignets', why: 'Apprend à monter en ATR en sécurité, face au mur.', err: ['Dos cambré en haut', 'Monter trop vite'] },
    'atr-mur': { m: 'Épaules, triceps, trapèzes', s: 'Gainage, poignets', why: 'Face au mur, tu apprends l’alignement parfait.', err: ['Dos cambré (banane)', 'Épaules qui s’affaissent'] },
    'pike-sureleve': { m: 'Épaules, triceps', s: 'Haut des pectoraux', why: 'Pieds surélevés : plus de poids sur les épaules, en route vers les pompes en ATR.', err: ['Hanches trop basses', 'Tête qui ne passe pas devant les mains'] },
    'touchers-epaule': { m: 'Épaules, gainage, équilibre', s: 'Triceps', why: 'Apprend à transférer le poids d’une main à l’autre.', err: ['Dos cambré', 'Bassin qui tourne'] },
    'atr-tentatives': { m: 'Épaules, gainage, équilibre', s: 'Poignets', why: 'Le lancer de jambe contrôlé, étape avant l’ATR tenu.', err: ['Lancer trop fort et basculer', 'Bras qui plient'] },
    'atr-libre': { m: 'Épaules, triceps, gainage', s: 'Poignets, avant-bras', why: 'L’équilibre sur les mains, une figure phare du calisthenics.', err: ['Dos cambré (banane)', 'Regard trop loin devant'] },
    'hspu': { m: 'Épaules, triceps, trapèzes', s: 'Gainage', why: 'La pompe verticale : force maximale des épaules.', err: ['Dos cambré', 'Descente sans contrôle'] }
  };

  /* ================= Géométrie ================= */
  var F = 90; // sol
  var LEN = { ua: 14, fa: 13, th: 17, sh: 16, to: 26, nk: 7, hr: 5 };
  var HINT = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  function u(d) { var r = d * Math.PI / 180; return [Math.cos(r), Math.sin(r)]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k]; }
  function dist(a, b) { return Math.hypot(b[0] - a[0], b[1] - a[1]); }
  function ang(a, b) { return Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerp2(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; }
  function lerpAng(a, b, t) { var d = ((b - a + 540) % 360) - 180; return a + d * t; }

  /* Intersection de deux cercles ; side choisit la solution la plus haute, basse, à gauche ou à droite. */
  function inter(c1, r1, c2, r2, side) {
    var d = dist(c1, c2), dir = d ? mul(sub(c2, c1), 1 / d) : [1, 0];
    if (!d || d >= r1 + r2 || d <= Math.abs(r1 - r2)) return add(c1, mul(dir, r1));
    var a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
    var base = add(c1, mul(dir, a)), perp = [-dir[1], dir[0]];
    var p1 = add(base, mul(perp, h)), p2 = sub(base, mul(perp, h)), hv = HINT[side] || HINT.down;
    return p1[0] * hv[0] + p1[1] * hv[1] >= p2[0] * hv[0] + p2[1] * hv[1] ? p1 : p2;
  }
  /* Cinématique inverse à deux segments : renvoie l'articulation et l'extrémité réellement atteinte. */
  function ik(root, target, l1, l2, side) {
    var d = dist(root, target);
    if (d >= l1 + l2 - 0.05) {
      var dir = mul(sub(target, root), 1 / (d || 1));
      return { j: add(root, mul(dir, l1)), e: add(root, mul(dir, l1 + l2)) };
    }
    return { j: inter(root, l1, target, l2, side), e: target };
  }
  /* Corps gainé qui pivote autour des pieds (ou des genoux) : épaule à la distance d des mains. */
  function lever(piv, R, lp, hand, d, side) {
    var sh = inter(piv, R, hand, d, side);
    return { sh: sh, hip: add(piv, mul(sub(sh, piv), lp / R)) };
  }
  /* Une pose : hanche, épaule (ou angle du buste), mains, pieds, sens des coudes et genoux. */
  function P(o) {
    return {
      hip: o.hip, ta: o.sh ? ang(o.hip, o.sh) : o.ta, hd: o.hd || 0,
      hand: o.hand, hand2: o.hand2 || add(o.hand, [2.5, -1]),
      foot: o.foot, foot2: o.foot2 || add(o.foot, [-3, 0]),
      eb: o.eb || 'down', eb2: o.eb2 || o.eb || 'down', kb: o.kb || 'right', kb2: o.kb2 || o.kb || 'right'
    };
  }
  function shoulder(p, s) { return add(p.hip, mul(u(p.ta), LEN.to * (s || 1))); }
  /* Déplace la hanche en gardant les épaules : bassin qui tombe, fesses en l'air, dos cambré… */
  function moveHip(p, dxy) {
    var sh = shoulder(p), q = Object.assign({}, p);
    q.hip = add(p.hip, dxy);
    q.ta = ang(q.hip, sh);
    return q;
  }
  function with_(p, o) { return Object.assign({}, p, o); }

  /* ================= Familles de mouvements ================= */
  var A = {};

  A.pushup = function (v) {
    var props = [{ t: 'floor' }], piv = [36, F], R = 59, lp = 33, H = [90, F], bot = 11, knees = false;
    if (v === 'wall') { props.push({ t: 'wall', x: 124 }); piv = [74, F]; H = [122, 46]; bot = 9; }
    if (v === 'incline') { props.push({ t: 'bench', x1: 86, x2: 114, y: 66 }); piv = [24, F]; H = [96, 66]; }
    if (v === 'knees') { piv = [58, F]; R = 43; lp = 17; knees = true; }
    if (v === 'decline') { props.push({ t: 'box', x1: 12, x2: 40, y: 68 }); piv = [30, 68]; H = [94, F]; }
    if (v === 'pseudo') H = [80, F];
    if (v === 'diamond') H = [92, F];
    function mk(d) {
      var L = lever(piv, R, lp, H, d, 'up');
      var o = { hip: L.hip, sh: L.sh, hand: H, foot: knees ? add(piv, mul(u(-148), 16)) : piv, eb: v === 'wall' ? 'down' : 'up', kb: 'down' };
      if (v === 'archer') { o.hand2 = [118, F]; o.eb2 = 'up'; }
      if (v === 'one') { o.hand2 = add(L.hip, [5, -4]); o.eb2 = 'up'; }
      return P(o);
    }
    var poses = [mk(26.5), mk(bot)], fault;
    if (v === 'wall') fault = poses.map(function (p) { return moveHip(p, [-9, 3]); });
    else if (v === 'knees') fault = poses.map(function (p) { return moveHip(p, [0, -9]); });
    else fault = poses.map(function (p) { return moveHip(p, [0, 7]); });
    return { props: props, poses: poses, fault: { poses: fault, seg: ['torso', 'legs'] } };
  };

  A.pike = function (v) {
    var props = [{ t: 'floor' }], P0 = [50, F], H = [98, F], a1 = -62, a2 = -52;
    if (v === 'elevated') { props.push({ t: 'chair', x: 20, y: 64 }); P0 = [36, 64]; H = [96, F]; a1 = -20; a2 = -5; }
    function mk(a, d) {
      var hip = add(P0, mul(u(a), 33));
      return P({ hip: hip, sh: inter(hip, 26, H, d, 'up'), hand: H, foot: P0, eb: 'up', kb: 'down' });
    }
    return {
      props: props, poses: [mk(a1, 26.5), mk(a2, 14)],
      fault: { poses: [mk(a1 + 24, 26.5), mk(a2 + 24, 14)], seg: ['torso', 'legs'] }
    };
  };

  A.dipsChair = function () {
    var H = [56, 66], foot = [82, F];
    var top = P({ hip: [62, 66], sh: [60, 40], hand: H, foot: foot, eb: 'left', kb: 'up' });
    var bot = P({ hip: [65, 79], sh: [62, 53], hand: H, foot: foot, eb: 'left', kb: 'up' });
    var bad = P({ hip: [67, 86], sh: [63, 60.5], hand: H, foot: foot, eb: 'left', kb: 'up', hd: 18 });
    return { props: [{ t: 'floor' }, { t: 'chair', x: 28, y: 66 }], poses: [top, bot], fault: { poses: [top, bad], seg: ['arms'] } };
  };

  A.dipsBars = function () {
    var H = [82, 52];
    var top = P({ hip: [79, 51.2], sh: [83, 25.5], hand: H, foot: [66, 74], eb: 'left', kb: 'right' });
    var bot = P({ hip: [76, 61.6], sh: [87, 38], hand: H, foot: [62, 84], eb: 'left', kb: 'right' });
    var bad = P({ hip: [76, 70], sh: [90, 48], hand: H, foot: [62, 89], eb: 'left', kb: 'right', hd: 15 });
    return { props: [{ t: 'floor' }, { t: 'pbars', x1: 62, x2: 102, y: 52 }], poses: [top, bot], fault: { poses: [top, bad], seg: ['arms'] } };
  };

  A.rowTable = function (v) {
    var props = [{ t: 'floor' }, { t: 'table', x1: 94, x2: 150, y: 56 }], H = [97, 56], piv = [40, F], R = 59, lp = 33, foot = null;
    if (v === 'feetUp') { props.push({ t: 'chair', x: 14, y: 66 }); piv = [30, 66]; }
    if (v === 'knees') { piv = [62, 74]; R = 43; lp = 17; foot = [64, F]; }
    function mk(d) {
      var L = lever(piv, R, lp, H, d, 'down');
      var o = { hip: L.hip, sh: L.sh, hand: H, foot: foot || piv, eb: 'down', kb: foot ? 'up' : 'up' };
      if (v === 'archer') { o.hand2 = [124, 56]; o.eb2 = 'down'; }
      return P(o);
    }
    var poses = [mk(26.5), mk(9)];
    return { props: props, poses: poses, fault: { poses: poses.map(function (p) { return moveHip(p, [0, 8]); }), seg: ['torso', 'legs'] } };
  };

  A.rowTowel = function (v) {
    var handle = [128, 46], P0 = [116, F];
    function mk(th) {
      var sh = add(P0, mul(u(th), 59)), hip = add(P0, mul(u(th), 33));
      var dir = mul(sub(handle, sh), 1 / dist(sh, handle));
      var o = { hip: hip, sh: sh, hand: sub(handle, mul(dir, 14)), foot: P0, eb: 'down', kb: 'up' };
      if (v === 'one') { o.hand2 = add(sh, [3, 25]); o.eb2 = 'right'; }
      return P(o);
    }
    var poses = [mk(-120), mk(-100)];
    return {
      props: [{ t: 'floor' }, { t: 'door', x: 130, h: handle[1] }, { t: 'rope', from: handle, to: 'hand' }],
      poses: poses, fault: { poses: poses.map(function (p) { return moveHip(p, [-2, 8]); }), seg: ['torso', 'legs'] }
    };
  };

  A.rowBand = function () {
    var anchor = [140, 44], hip = [63, 58], foot = [64, F];
    function mk(ta, d, back) {
      var sh = add(hip, mul(u(ta), 26)), dir = mul(sub(anchor, sh), 1 / dist(sh, anchor));
      return P({ hip: hip, ta: ta, hand: add(add(sh, mul(dir, d)), back ? [-2, 5] : [0, 0]), foot: foot, eb: 'left', kb: 'right' });
    }
    return {
      props: [{ t: 'floor' }, { t: 'post', x: 142, y: 30 }, { t: 'band', from: anchor, to: 'hand' }],
      poses: [mk(-90, 26), mk(-90, 9, true)],
      fault: { poses: [mk(-74, 26), mk(-112, 9, true)], seg: ['torso'] }
    };
  };

  A.pulldownBand = function () {
    var anchor = [122, 8], hip = [70, 73], foot = [54, F];
    function mk(ta, up) {
      var sh = add(hip, mul(u(ta), 26)), dir = mul(sub(anchor, sh), 1 / dist(sh, anchor));
      return P({ hip: hip, ta: ta, hand: up ? add(sh, mul(dir, 26)) : add(sh, [9, 4]), foot: foot, eb: 'down', kb: 'down' });
    }
    return {
      props: [{ t: 'floor' }, { t: 'door', x: 124, h: 0 }, { t: 'band', from: anchor, to: 'hand' }],
      poses: [mk(-90, true), mk(-90, false)],
      fault: { poses: [mk(-90, true), mk(-116, false)], seg: ['torso'] }
    };
  };

  /* Suspendu à la barre (y = 6). */
  function hangBody(shY, o) {
    o = o || {};
    var sh = [80 + (o.dx || 0), shY], hip = add(sh, [-1 + (o.lean || 0), 26]);
    var foot = o.foot ? add(hip, o.foot) : add(hip, [-10, 27]);
    return P({ hip: hip, sh: sh, hand: o.hand || [75, 6], hand2: o.hand2 || [87, 6], foot: foot, foot2: add(foot, [-3, 1]), eb: 'right', eb2: o.eb2 || 'right', kb: o.kb || 'right' });
  }
  A.hang = function (v) {
    var props = [{ t: 'bar', y: 6, x1: 36, x2: 124 }];
    var kip = { poses: [hangBody(32.5, { foot: [18, 22], lean: -6 }), hangBody(13, { foot: [-20, 20], lean: 6 })], seg: ['legs', 'torso'] };
    if (v === 'hold') {
      return { props: props, hold: true, poses: [hangBody(32.5), hangBody(32.5, { dx: 1.2 })],
        fault: { poses: [hangBody(32.5, { foot: [16, 24], lean: -7 }), hangBody(32.5, { foot: [-22, 18], lean: 7 })], seg: ['legs', 'torso'], seq: [[0, 0.1, 0.7], [1, 0.1, 0.7]] } };
    }
    if (v === 'scap') return { props: props, poses: [hangBody(33.5), hangBody(29.5)], fault: { poses: [hangBody(33.5), hangBody(20)], seg: ['arms'] } };
    if (v === 'neg') {
      return { props: props, poses: [hangBody(11), hangBody(32.5)], seq: [[0, 0.5, 3.2], [1, 0.4, 0.6]],
        fault: { poses: [hangBody(11), hangBody(32.5)], seq: [[0, 0.5, 0.45], [1, 0.6, 0.6]], seg: ['arms'] } };
    }
    if (v === 'band') {
      props.push({ t: 'band', from: [83, 6], to: 'knee' });
      return { props: props, poses: [hangBody(32.5), hangBody(11)], seq: [[0, 0.4, 1.1], [1, 0.3, 1.2]], fault: { poses: [hangBody(22), hangBody(11)], seg: ['arms'] } };
    }
    if (v === 'archer') {
      var o = { hand2: [48, 6], eb2: 'up' };
      return { props: props, poses: [hangBody(32.5, o), hangBody(13, Object.assign({ dx: 9 }, o))], fault: kip };
    }
    if (v === 'explosive') return { props: props, poses: [hangBody(32.5), hangBody(8)], seq: [[0, 0.5, 0.42], [1, 0.25, 1.1]], fault: kip };
    return { props: props, poses: [hangBody(32.5), hangBody(11)], seq: [[0, 0.4, 1.0], [1, 0.35, 1.2]], fault: kip };
  };

  A.muscleUp = function () {
    var H = [77, 30], s = 0.8;
    function mk(hip, sh, foot, eb, kb) { var d = [0, -6]; return P({ hip: add(hip, d), sh: add(sh, d), hand: H, hand2: [85, 30], foot: add(foot, d), eb: eb || 'right', kb: kb || 'right' }); }
    var hang = mk([79, 77.8], [80, 57], [66, 87]);
    var pull = mk([80, 60.6], [83, 40], [70, 80]);
    var trans = mk([80, 50], [86, 30], [74, 74], 'left');
    var supp = mk([80, 35.3], [81, 14.5], [86, 60], 'left');
    return {
      scale: s, props: [{ t: 'floor' }, { t: 'bar', y: 30, x1: 44, x2: 116, posts: true }],
      poses: [hang, pull, trans, supp], seq: [[0, 0.5, 0.7], [1, 0.05, 0.3], [2, 0.05, 0.4], [3, 0.8, 1.3]],
      fault: { poses: [mk([74, 77], [80, 57], [52, 88]), mk([84, 60], [83, 40], [104, 72]), trans, supp], seq: [[0, 0.2, 0.6], [1, 0.05, 0.3], [2, 0.05, 0.4], [3, 0.6, 1.3]], seg: ['legs'] }
    };
  };

  A.squat = function (v) {
    var props = [{ t: 'floor' }], foot = [80, F];
    if (v === 'assist') props.push({ t: 'frame', x: 112 });
    function stand(arms) {
      var hip = [79, 57.5], sh = add(hip, [0, -26]);
      return P({ hip: hip, sh: sh, hand: arms === 'assist' ? [110, 52] : arms === 'side' ? add(sh, [2, 26]) : add(sh, [24, 6]), foot: foot, eb: 'down', kb: 'right' });
    }
    function bottom(ta, arms, hip) {
      hip = hip || [64, 74];
      var sh = add(hip, mul(u(ta), 26));
      return P({ hip: hip, ta: ta, hand: arms === 'assist' ? [110, 56] : add(sh, [25, 1]), foot: foot, eb: 'down', kb: 'right' });
    }
    if (v === 'jump') {
      var st = stand('side'), bo = bottom(-62), air = P({ hip: [79, 42], ta: -90, hand: [84, -8], foot: [80, 75], eb: 'right', kb: 'right' });
      air.hand = add(shoulder(air), [4, -25]);
      return {
        props: props, poses: [st, bo, air], seq: [[0, 0.3, 0.6], [1, 0.05, 0.22], [2, 0.1, 0.3], [1, 0.25, 0.6]],
        fault: { poses: [st, bo, air], seq: [[0, 0.4, 0.6], [1, 0.05, 0.22], [2, 0.1, 0.18]], seg: ['legs'] }
      };
    }
    if (v === 'assist') return { props: props, poses: [stand('assist'), bottom(-70, 'assist')], fault: { poses: [stand('assist'), bottom(-112, 'assist', [60, 76])], seg: ['torso', 'arms'] } };
    return { props: props, poses: [stand(), bottom(-62)], fault: { poses: [stand(), bottom(-28)], seg: ['torso'] } };
  };

  A.lunge = function (v) {
    var props = [{ t: 'floor' }], front = [94, F], back = [60, F], sHip = [77, 61], bHip = [77, 73], fHip = [88, 73];
    if (v === 'bulgarian') { props.push({ t: 'chair', x: 20, y: 66 }); front = [92, F]; back = [44, 66]; sHip = [76, 61]; bHip = [72, 74]; fHip = [84, 74]; }
    function mk(hip, lean) {
      var ta = lean || -90, sh = add(hip, mul(u(ta), 26));
      return P({ hip: hip, ta: ta, hand: add(sh, [2, 25]), hand2: add(sh, [-1, 25]), foot: front, foot2: back, eb: 'right', kb: 'right', kb2: 'down' });
    }
    return { props: props, poses: [mk(sHip), mk(bHip)], fault: { poses: [mk(sHip), mk(fHip, -78)], seg: ['legs'] } };
  };

  A.pistol = function (v) {
    var props = [{ t: 'floor' }], foot = [80, F], assist = v === 'assist';
    if (assist) props.push({ t: 'frame', x: 118 });
    function mk(hip, ta, free) {
      var sh = add(hip, mul(u(ta), 26));
      return P({ hip: hip, ta: ta, hand: assist ? [116, hip[1] < 60 ? 50 : 56] : add(sh, [25, 0]), foot: foot, foot2: free, eb: 'down', kb: 'right', kb2: 'right' });
    }
    var st = mk([79, 57.5], -90, [93, 86]), bo = mk([68, 76], -60, add([68, 76], mul(u(-4), 33)));
    return { props: props, poses: [st, bo], fault: { poses: [st, mk([68, 76], -26, add([68, 76], mul(u(-4), 33)))], seg: ['torso'] } };
  };

  A.shrimp = function () {
    var foot = [84, F];
    function mk(hip, ta, back) {
      var sh = add(hip, mul(u(ta), 26));
      return P({ hip: hip, ta: ta, hand: add(sh, [24, 4]), hand2: back, foot: foot, foot2: back, eb: 'down', eb2: 'left', kb: 'right', kb2: 'down' });
    }
    var st = mk([83, 57.5], -90, [70, 70]), bo = mk([72, 75], -58, [54, 82]);
    return { props: [{ t: 'floor' }], poses: [st, bo], fault: { poses: [st, mk([72, 75], -28, [54, 82])], seg: ['torso'] } };
  };

  A.plank = function () {
    var sh = [100, 76], P0 = [100 - Math.sqrt(59 * 59 - 14 * 14), F], hip = add(P0, mul(sub(sh, P0), 33 / 59));
    var a = P({ hip: hip, sh: sh, hand: [113, F], foot: P0, eb: 'down', kb: 'down' });
    return { props: [{ t: 'floor' }], hold: true, poses: [a, moveHip(a, [0, 0.9])], fault: { poses: [moveHip(a, [0, 7]), moveHip(a, [0, 7.8])], seg: ['torso', 'legs'] } };
  };

  A.lyingRaise = function (v) {
    var hip = [86, 87], sh = [112, 86];
    function mk(foot, kb, h) { return P({ hip: h || hip, sh: sh, hand: [90, F], foot: foot, eb: 'down', kb: kb, hd: -10 }); }
    if (v === 'legs') {
      return { props: [{ t: 'floor' }], poses: [mk([54, 84], 'up'), mk([88, 54], 'up')],
        fault: { poses: [mk([54, 89], 'up', [86, 80]), mk([88, 54], 'up')], seg: ['torso'] } };
    }
    return { props: [{ t: 'floor' }], poses: [mk([54, 84], 'up'), mk([84, 70], 'right')],
      fault: { poses: [mk([54, 86], 'up', [86, 80]), mk([84, 70], 'right')], seg: ['torso'] } };
  };

  A.hollow = function () {
    var hip = [82, 87];
    function mk(h, lift) {
      var sh = add(h, mul(u(-12 - lift), 26));
      return P({ hip: h, sh: sh, hand: add(sh, mul(u(-10), 26)), foot: add(h, mul(u(-166 + lift), 33)), eb: 'up', kb: 'up', hd: -6 });
    }
    return { props: [{ t: 'floor' }], hold: true, poses: [mk(hip, 0), mk(hip, 1.2)], fault: { poses: [mk([82, 81], 0), mk([82, 80.5], 1)], seg: ['torso'] } };
  };

  A.superman = function () {
    var hip = [78, 86];
    function mk(lift, hd) {
      var sh = add(hip, mul(u(-8 - lift), 26));
      return P({ hip: hip, sh: sh, hand: add(sh, mul(u(-12 - lift), 26)), foot: add(hip, mul(u(-172 + lift), 33)), eb: 'down', kb: 'down', hd: hd });
    }
    return { props: [{ t: 'floor' }], hold: true, poses: [mk(0, 6), mk(2, 6)], fault: { poses: [mk(0, -55), mk(2, -58)], seg: ['head'] } };
  };

  A.ytw = function () {
    var hip = [78, 86];
    function mk(arm, lift) {
      var sh = add(hip, mul(u(-6 - lift), 26)), hand, eb = 'up';
      if (arm === 'Y') hand = add(sh, mul(u(-22), 26));
      else if (arm === 'T') hand = add(sh, [3, -13]);
      else { hand = add(sh, [-2, -9]); eb = 'left'; }
      return P({ hip: hip, sh: sh, hand: hand, foot: add(hip, mul(u(178), 33)), eb: eb, kb: 'down', hd: 6 });
    }
    var seq = [[0, 0.4, 0.7], [1, 0.3, 0.7], [2, 0.4, 0.7], [1, 0.2, 0.7]];
    return { props: [{ t: 'floor' }], poses: [mk('Y', 0), mk('T', 0), mk('W', 0)], seq: seq,
      fault: { poses: [mk('Y', 26), mk('T', 26), mk('W', 26)], seq: seq, seg: ['torso'] } };
  };

  A.hangRaise = function (v) {
    var up = v === 'legs' ? [33, -1] : [17, 14];
    function mk(foot, kb, o) { o = o || {}; return hangBody(32.5, { foot: foot, kb: kb, lean: o.lean }); }
    return {
      props: [{ t: 'bar', y: 6, x1: 36, x2: 124 }], poses: [mk([-1, 31], 'right'), mk(up, 'up')],
      fault: { poses: [mk([-18, 26], 'right', { lean: 8 }), mk([v === 'legs' ? 30 : 20, v === 'legs' ? -8 : 6], 'up', { lean: -9 })], seq: [[0, 0.05, 0.55], [1, 0.05, 0.55]], seg: ['torso', 'legs'] }
    };
  };

  A.lsit = function (v) {
    var H = [80, 80];
    function mk(hip, sh, foot, kb) { return P({ hip: hip, sh: sh, hand: [84, 80], hand2: [76, 80], foot: foot, eb: 'left', kb: kb }); }
    var hip = [77, 79.4], sh = [80, 53.5], foot = v === 'tuck' ? add(hip, [16, 2]) : add(hip, [33, -1]), kb = v === 'tuck' ? 'up' : 'up';
    var a = mk(hip, sh, foot, kb), b = mk(add(hip, [0, 0.6]), sh, add(foot, [0, 0.8]), kb);
    var bad = mk([76, 88], [79, 62.5], v === 'tuck' ? [93, F] : [109, 88], kb);
    return { props: [{ t: 'floor' }, { t: 'para', x: 80, y: 80 }], hold: true, poses: [a, b], fault: { poses: [bad, with_(bad, { hip: [76, 88.4] })], seg: ['torso', 'legs'] } };
  };

  A.dragon = function () {
    var S = [116, 69], H = [134, 72];
    function mk(th, legs) {
      var hip = add(S, mul(u(th), 26)), foot = add(hip, mul(u(legs == null ? th : legs), 33)), ta = ang(hip, S);
      return P({ hip: hip, sh: S, hand: H, foot: foot, eb: 'up', kb: 'up', hd: 12 - ta });
    }
    return { props: [{ t: 'floor' }, { t: 'bench', x1: 40, x2: 138, y: 72 }], poses: [mk(-100), mk(-168)], seq: [[0, 0.5, 1.8], [1, 0.3, 1.2]], fault: { poses: [mk(-100), mk(-160, -118)], seg: ['legs'] } };
  };

  /* Équilibre sur les mains. */
  function hs(hand, sh, hipAng, legAng, o) {
    o = o || {};
    var hip = add(sh, mul(u(hipAng), 26)), foot = add(hip, mul(u(legAng), 33));
    return P({ hip: hip, sh: sh, hand: add(hand, [-3.5, 0]), hand2: o.hand2 || add(hand, [4, 0]), foot: foot, foot2: add(foot, [2, 0]), eb: o.eb || 'right', eb2: o.eb2 || o.eb || 'right', kb: 'left' });
  }
  A.handstand = function (v) {
    if (v === 'free') {
      var a = hs([80, F], [80.5, 63.5], -90, -90), b = hs([80, F], [80.5, 63.5], -88.4, -87.8);
      return { props: [{ t: 'floor' }], hold: true, poses: [a, b], seq: [[0, 0.1, 1.4], [1, 0.1, 1.4]], fault: { poses: [hs([80, F], [80.5, 63.5], -72, -112), hs([80, F], [80.5, 63.5], -71, -113)], seg: ['torso', 'legs'] } };
    }
    var base = hs([113, F], [114, 63.5], -84, -82);
    var props = [{ t: 'floor' }, { t: 'wall', x: 127 }];
    var bad = hs([113, F], [114, 63.5], -66, -98);
    if (v === 'taps') {
      var t2 = with_(base, { hand2: add(shoulder(base), [3, 7]), eb2: 'left' }), t1 = with_(base, { hand: add(shoulder(base), [1, 7]), eb: 'left' });
      return { props: props, poses: [base, t2, t1], seq: [[0, 0.4, 0.5], [1, 0.5, 0.5], [0, 0.4, 0.5], [2, 0.5, 0.5]], fault: { poses: [bad, with_(bad, { hand2: add(shoulder(bad), [3, 7]), eb2: 'left' })], seg: ['torso', 'legs'] } };
    }
    return { props: props, hold: true, poses: [base, hs([113, F], [114, 63.5], -83.4, -81)], fault: { poses: [bad, hs([113, F], [114, 63.5], -65, -99)], seg: ['torso', 'legs'] } };
  };

  A.kickUp = function () {
    var lungeHip = [74, 61], lsh = add(lungeHip, [0, -26]);
    var p0 = P({ hip: lungeHip, sh: lsh, hand: add(lsh, [3, -26]), foot: [84, F], foot2: [62, F], eb: 'right', kb: 'right', kb2: 'down' });
    var sh1 = [100, 63.5], hip1 = add(sh1, mul(u(-150), 26));
    var p1 = P({ hip: hip1, sh: sh1, hand: [100, F], foot: [84, F], foot2: add(hip1, mul(u(-120), 33)), eb: 'right', kb: 'right', kb2: 'left' });
    var p2 = hs([100, F], [100, 63.5], -90, -90);
    var fall = hs([100, F], [100, 63.5], -64, -52);
    var seq = [[0, 0.5, 0.7], [1, 0.05, 0.45], [2, 0.9, 0.45], [1, 0.05, 0.7]];
    return { props: [{ t: 'floor' }], poses: [p0, p1, p2], seq: seq, fault: { poses: [p0, p1, fall], seq: [[0, 0.5, 0.7], [1, 0.05, 0.35], [2, 0.3, 0.6], [1, 0.05, 0.7]], seg: ['torso', 'legs'] } };
  };

  A.wallWalk = function () {
    var P0 = [128, F], H0 = [74, F];
    var L0 = lever(P0, 59, 33, H0, 26.5, 'up');
    var p0 = P({ hip: L0.hip, sh: L0.sh, hand: H0, foot: P0, eb: 'up', kb: 'down' });
    var sh1 = [96.5, 63.5], hip1 = add(sh1, mul(u(-38), 26));
    var p1 = P({ hip: hip1, sh: sh1, hand: [96, F], foot: [131, 62], eb: 'up', kb: 'up' });
    var sh2 = [118.5, 63.5], hip2 = add(sh2, mul(u(-80), 26));
    var p2 = P({ hip: hip2, sh: sh2, hand: [118, F], foot: [131, 8], eb: 'up', kb: 'left' });
    var bad = P({ hip: [127, 42], sh: sh2, hand: [118, F], foot: [124, 10], eb: 'up', kb: 'right' });
    var seq = [[0, 0.4, 1.0], [1, 0.1, 1.0], [2, 0.8, 1.0], [1, 0.1, 1.0]];
    return { props: [{ t: 'floor' }, { t: 'wall', x: 134 }], poses: [p0, p1, p2], seq: seq, fault: { poses: [p0, p1, bad], seq: seq, seg: ['torso', 'legs'] } };
  };

  A.hspu = function () {
    function mk(sh, hipAng, legAng) { return hs([86, F], sh, hipAng, legAng, { eb: 'right' }); }
    var top = mk([86.5, 63.5], -100, -103), bot = mk([88.5, 79], -102, -104);
    return {
      props: [{ t: 'floor' }, { t: 'wall', x: 68 }, { t: 'cushion', x1: 80, x2: 98 }], poses: [top, bot], seq: [[0, 0.4, 1.4], [1, 0.2, 1.0]],
      fault: { poses: [mk([86.5, 63.5], -76, -118), mk([88.5, 79], -74, -120)], seg: ['torso', 'legs'] }
    };
  };

  /* Quel mouvement pour quel exercice. */
  var ANIM = {
    'pompes-mur': ['pushup', 'wall'], 'pompes-inclinees': ['pushup', 'incline'], 'pompes-genoux': ['pushup', 'knees'], 'pompes': ['pushup'],
    'dips-chaise': ['dipsChair'], 'pompes-diamant': ['pushup', 'diamond'], 'pompes-declinees': ['pushup', 'decline'], 'dips': ['dipsBars'],
    'pompes-archer': ['pushup', 'archer'], 'pompes-pseudo': ['pushup', 'pseudo'], 'pompes-un-bras': ['pushup', 'one'],
    'superman': ['superman'], 'ytw': ['ytw'], 'rowing-serviette': ['rowTowel'], 'suspension': ['hang', 'hold'], 'rowing-elastique': ['rowBand'],
    'rowing-incline': ['rowTable', 'knees'], 'rowing-australien': ['rowTable'], 'rowing-serviette-uni': ['rowTowel', 'one'],
    'tirage-elastique': ['pulldownBand'], 'rowing-pieds': ['rowTable', 'feetUp'], 'rowing-archer': ['rowTable', 'archer'],
    'tractions-scap': ['hang', 'scap'], 'tractions-negatives': ['hang', 'neg'], 'tractions-elastique': ['hang', 'band'],
    'chin-ups': ['hang', 'pull'], 'tractions': ['hang', 'pull'], 'tractions-archer': ['hang', 'archer'], 'tractions-explosives': ['hang', 'explosive'],
    'muscle-up': ['muscleUp'],
    'squats-assistes': ['squat', 'assist'], 'squats': ['squat'], 'fentes': ['lunge'], 'squats-bulgares': ['lunge', 'bulgarian'],
    'squats-sautes': ['squat', 'jump'], 'pistol-assiste': ['pistol', 'assist'], 'shrimp': ['shrimp'], 'pistol': ['pistol'],
    'planche': ['plank'], 'genoux-sol': ['lyingRaise', 'knees'], 'hollow': ['hollow'], 'jambes-sol': ['lyingRaise', 'legs'],
    'genoux-suspendu': ['hangRaise', 'knees'], 'lsit-groupe': ['lsit', 'tuck'], 'jambes-suspendu': ['hangRaise', 'legs'], 'lsit': ['lsit'],
    'dragon-flag': ['dragon'],
    'pompes-pike': ['pike'], 'montee-mur': ['wallWalk'], 'atr-mur': ['handstand', 'wall'], 'pike-sureleve': ['pike', 'elevated'],
    'touchers-epaule': ['handstand', 'taps'], 'atr-tentatives': ['kickUp'], 'atr-libre': ['handstand', 'free'], 'hspu': ['hspu']
  };
  var cache = {};
  function spec(id) {
    if (!cache[id]) { var a = ANIM[id] || ['plank']; cache[id] = A[a[0]](a[1]); }
    return cache[id];
  }

  /* ================= Lecture ================= */
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerpPose(a, b, t) {
    return {
      hip: lerp2(a.hip, b.hip, t), ta: lerpAng(a.ta, b.ta, t), hd: lerp(a.hd, b.hd, t),
      hand: lerp2(a.hand, b.hand, t), hand2: lerp2(a.hand2, b.hand2, t), foot: lerp2(a.foot, b.foot, t), foot2: lerp2(a.foot2, b.foot2, t),
      eb: t < 0.5 ? a.eb : b.eb, eb2: t < 0.5 ? a.eb2 : b.eb2, kb: t < 0.5 ? a.kb : b.kb, kb2: t < 0.5 ? a.kb2 : b.kb2
    };
  }
  function timeline(m) {
    var seq = m.seq || (m.hold ? [[0, 0.2, 1.6], [1, 0.2, 1.6]] : [[0, 0.45, 1.0], [1, 0.35, 1.0]]);
    var total = seq.reduce(function (s, e) { return s + e[1] + e[2]; }, 0);
    return { seq: seq, total: total };
  }
  function poseAt(m, tl, t) {
    t = t % tl.total;
    for (var i = 0; i < tl.seq.length; i++) {
      var e = tl.seq[i], nx = tl.seq[(i + 1) % tl.seq.length];
      if (t < e[1]) return m.poses[e[0]];
      t -= e[1];
      if (t < e[2]) return lerpPose(m.poses[e[0]], m.poses[nx[0]], ease(t / e[2]));
      t -= e[2];
    }
    return m.poses[0];
  }
  function solve(p, s) {
    var sh = add(p.hip, mul(u(p.ta), LEN.to * s)), head = add(sh, mul(u(p.ta + p.hd), LEN.nk * s));
    return {
      sh: sh, hip: p.hip, head: head,
      arm: ik(sh, p.hand, LEN.ua * s, LEN.fa * s, p.eb), arm2: ik(sh, p.hand2, LEN.ua * s, LEN.fa * s, p.eb2),
      leg: ik(p.hip, p.foot, LEN.th * s, LEN.sh * s, p.kb), leg2: ik(p.hip, p.foot2, LEN.th * s, LEN.sh * s, p.kb2)
    };
  }
  function f(n) { return Math.round(n * 10) / 10; }
  function pt(a) { return f(a[0]) + ',' + f(a[1]); }

  function propsSvg(list) {
    return list.map(function (o) {
      switch (o.t) {
        case 'floor': return '<line class="tp tp-floor" x1="2" y1="' + F + '" x2="158" y2="' + F + '"/>';
        case 'wall': return '<rect class="tp" x="' + o.x + '" y="-2" width="5" height="' + (F + 2) + '"/>';
        case 'bar': return '<line class="tp tp-bar" x1="' + o.x1 + '" y1="' + o.y + '" x2="' + o.x2 + '" y2="' + o.y + '"/>' +
          (o.posts ? '<line class="tp" x1="' + o.x1 + '" y1="' + o.y + '" x2="' + o.x1 + '" y2="' + F + '"/><line class="tp" x1="' + o.x2 + '" y1="' + o.y + '" x2="' + o.x2 + '" y2="' + F + '"/>'
            : '<line class="tp" x1="' + o.x1 + '" y1="' + o.y + '" x2="' + o.x1 + '" y2="-2"/><line class="tp" x1="' + o.x2 + '" y1="' + o.y + '" x2="' + o.x2 + '" y2="-2"/>');
        case 'table': return '<rect class="tp" x="' + o.x1 + '" y="' + (o.y - 3) + '" width="' + (o.x2 - o.x1) + '" height="3" rx="1"/><line class="tp" x1="' + (o.x1 + 5) + '" y1="' + o.y + '" x2="' + (o.x1 + 5) + '" y2="' + F + '"/><line class="tp" x1="' + (o.x2 - 5) + '" y1="' + o.y + '" x2="' + (o.x2 - 5) + '" y2="' + F + '"/>';
        case 'chair': return '<line class="tp" x1="' + o.x + '" y1="' + o.y + '" x2="' + (o.x + 28) + '" y2="' + o.y + '"/><line class="tp" x1="' + o.x + '" y1="' + (o.y - 24) + '" x2="' + o.x + '" y2="' + F + '"/><line class="tp" x1="' + (o.x + 28) + '" y1="' + o.y + '" x2="' + (o.x + 28) + '" y2="' + F + '"/>';
        case 'box': return '<rect class="tp" x="' + o.x1 + '" y="' + o.y + '" width="' + (o.x2 - o.x1) + '" height="' + (F - o.y) + '" rx="2"/>';
        case 'bench': return '<rect class="tp" x="' + o.x1 + '" y="' + o.y + '" width="' + (o.x2 - o.x1) + '" height="3" rx="1"/><line class="tp" x1="' + (o.x1 + 6) + '" y1="' + (o.y + 3) + '" x2="' + (o.x1 + 6) + '" y2="' + F + '"/><line class="tp" x1="' + (o.x2 - 6) + '" y1="' + (o.y + 3) + '" x2="' + (o.x2 - 6) + '" y2="' + F + '"/>';
        case 'door': return '<rect class="tp" x="' + o.x + '" y="2" width="6" height="' + (F - 2) + '" rx="1"/>' + (o.h ? '<circle class="tp" cx="' + (o.x - 1.5) + '" cy="' + o.h + '" r="1.6"/>' : '');
        case 'pbars': return '<line class="tp tp-bar" x1="' + o.x1 + '" y1="' + o.y + '" x2="' + o.x2 + '" y2="' + o.y + '"/><line class="tp" x1="' + (o.x1 + 4) + '" y1="' + o.y + '" x2="' + (o.x1 + 4) + '" y2="' + F + '"/><line class="tp" x1="' + (o.x2 - 4) + '" y1="' + o.y + '" x2="' + (o.x2 - 4) + '" y2="' + F + '"/>';
        case 'para': return '<path class="tp" d="M' + (o.x - 9) + ',' + F + ' V' + o.y + ' H' + (o.x + 9) + ' V' + F + '"/>';
        case 'frame': return '<line class="tp" x1="' + o.x + '" y1="2" x2="' + o.x + '" y2="' + F + '"/><line class="tp" x1="' + (o.x + 5) + '" y1="2" x2="' + (o.x + 5) + '" y2="' + F + '"/>';
        case 'cushion': return '<rect class="tp" x="' + o.x1 + '" y="' + (F - 3.5) + '" width="' + (o.x2 - o.x1) + '" height="3.5" rx="1.5"/>';
        case 'post': return '<line class="tp" x1="' + o.x + '" y1="' + o.y + '" x2="' + o.x + '" y2="' + F + '"/>';
        default: return '';
      }
    }).join('');
  }

  /* Monte un lecteur dans el. opts : { color, mini } */
  function mount(el, id, opts) {
    opts = opts || {};
    var info = INFO[id] || { err: [''] }, mode = 'good', playing = true, t0 = performance.now(), paused = 0, raf = null;
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* ignore */ }
    if (reduce) playing = false;
    el.innerHTML = '<div class="tv' + (opts.mini ? ' mini' : '') + '" style="--fc:' + (opts.color || '#9d70ff') + '">' +
      '<svg viewBox="0 0 160 100" role="img" aria-label="Animation de l’exercice"><g class="tv-props"></g><path class="rope" d=""/>' +
      '<path class="lim back arm2"/><path class="lim back leg2"/><line class="lim tor"/><path class="lim leg"/><circle class="head" r="5"/><path class="lim arm"/></svg>' +
      '<span class="tv-tag"></span><span class="tv-time"></span><div class="tv-bar"><i></i></div>' +
      '<button class="tv-play" type="button" aria-label="Pause"></button></div>';
    var root = el.firstChild, svgEl = root.querySelector('svg'), q = function (s) { return svgEl.querySelector(s); };
    var E = { props: q('.tv-props'), rope: q('.rope'), arm: q('.arm'), arm2: q('.arm2'), leg: q('.leg'), leg2: q('.leg2'), tor: q('.tor'), head: q('.head') };
    var tag = root.querySelector('.tv-tag'), time = root.querySelector('.tv-time'), bar = root.querySelector('.tv-bar i'), btn = root.querySelector('.tv-play');
    var m, cur, tl;
    var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6a.8.8 0 0 0 1.2.7l11-6.8a.8.8 0 0 0 0-1.4l-11-6.8A.8.8 0 0 0 8 5.2z" fill="currentColor"/></svg>';
    var PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>';

    function setMode(md) {
      mode = md;
      m = spec(id);
      cur = md === 'bad' && m.fault ? { props: m.props, poses: m.fault.poses, seq: m.fault.seq || m.seq, hold: m.hold, scale: m.scale, seg: m.fault.seg || ['torso'] } : { props: m.props, poses: m.poses, seq: m.seq, hold: m.hold, scale: m.scale, seg: [] };
      tl = timeline(cur);
      E.props.innerHTML = propsSvg(cur.props.filter(function (p) { return p.t !== 'rope' && p.t !== 'band'; }));
      var rope = cur.props.filter(function (p) { return p.t === 'rope' || p.t === 'band'; })[0];
      cur.rope = rope;
      E.rope.setAttribute('class', 'rope' + (rope && rope.t === 'band' ? ' band' : ''));
      root.classList.toggle('bad', md === 'bad');
      ['arm', 'arm2', 'leg', 'leg2', 'tor', 'head'].forEach(function (k) {
        var segName = k.indexOf('arm') === 0 ? 'arms' : k.indexOf('leg') === 0 ? 'legs' : k === 'tor' ? 'torso' : 'head';
        E[k].classList.toggle('bad-seg', cur.seg.indexOf(segName) >= 0);
      });
      tag.textContent = md === 'bad' ? '✕ ' + info.err[0] : '✓ Bonne exécution';
      E.head.setAttribute('r', f(LEN.hr * (cur.scale || 1)));
      t0 = performance.now(); paused = 0;
      draw(reduce ? tl.seq[Math.min(1, tl.seq.length - 1)][1] + 0.01 + (tl.seq[0][1] + tl.seq[0][2]) : 0);
    }
    function draw(t) {
      var p = poseAt(cur, tl, t), s = cur.scale || 1, b = solve(p, s);
      E.arm.setAttribute('d', 'M' + pt(b.sh) + 'L' + pt(b.arm.j) + 'L' + pt(b.arm.e));
      E.arm2.setAttribute('d', 'M' + pt(b.sh) + 'L' + pt(b.arm2.j) + 'L' + pt(b.arm2.e));
      E.leg.setAttribute('d', 'M' + pt(b.hip) + 'L' + pt(b.leg.j) + 'L' + pt(b.leg.e));
      E.leg2.setAttribute('d', 'M' + pt(b.hip) + 'L' + pt(b.leg2.j) + 'L' + pt(b.leg2.e));
      E.tor.setAttribute('x1', f(b.hip[0])); E.tor.setAttribute('y1', f(b.hip[1]));
      E.tor.setAttribute('x2', f(b.sh[0])); E.tor.setAttribute('y2', f(b.sh[1]));
      E.head.setAttribute('cx', f(b.head[0])); E.head.setAttribute('cy', f(b.head[1]));
      if (cur.rope) {
        var to = cur.rope.to === 'knee' ? b.leg.j : b.arm.e;
        E.rope.setAttribute('d', 'M' + pt(cur.rope.from) + 'L' + pt(to));
      } else E.rope.setAttribute('d', '');
      bar.style.width = ((t % tl.total) / tl.total * 100).toFixed(1) + '%';
      if (cur.hold) time.textContent = '0:' + String(Math.floor(t % 60)).padStart(2, '0');
      else time.textContent = '';
    }
    function loop(now) {
      if (!root.isConnected) { raf = null; return; }
      if (playing) draw((now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    }
    function setPlaying(v) {
      if (v === playing) return;
      if (v) t0 = performance.now() - paused * 1000; else paused = (performance.now() - t0) / 1000;
      playing = v;
      btn.innerHTML = v ? PAUSE : PLAY;
      btn.setAttribute('aria-label', v ? 'Pause' : 'Lecture');
    }
    btn.innerHTML = playing ? PAUSE : PLAY;
    btn.addEventListener('click', function (e) { e.stopPropagation(); setPlaying(!playing); });
    setMode('good');
    raf = requestAnimationFrame(loop);
    return {
      setMode: setMode, play: function () { setPlaying(true); }, pause: function () { setPlaying(false); },
      /* Fige l'animation à l'instant t (secondes), utile pour une vignette. */
      seek: function (t) { setPlaying(false); paused = t; draw(t); },
      /* Fige l'animation sur la k-ième étape du mouvement. */
      seekKey: function (k) {
        var t = 0.01;
        for (var j = 0; j < k && j < tl.seq.length; j++) t += tl.seq[j][1] + tl.seq[j][2];
        setPlaying(false); paused = t; draw(t);
      }
    };
  }

  return { info: function (id) { return INFO[id] || null; }, mount: mount, ids: Object.keys(ANIM) };
})();
