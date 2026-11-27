/* Calisthenics : données du programme (familles, exercices, séances, badges). */
window.GRAVITE_DATA = (function () {
  'use strict';

  /* Les 5 familles de mouvements. Chaque famille est une chaîne de progression. */
  var FAMILIES = [
    { id: 'push', name: 'Poussée', muscles: 'Pectoraux, triceps, épaules', color: '#a37bff' },
    { id: 'pull', name: 'Tirage', muscles: 'Dos, biceps, avant-bras', color: '#7f8dff' },
    { id: 'legs', name: 'Jambes', muscles: 'Quadriceps, fessiers, mollets', color: '#e07bff' },
    { id: 'core', name: 'Gainage', muscles: 'Abdos, lombaires, ceinture', color: '#ff8cc6' },
    { id: 'atr', name: 'ATR & équilibre', muscles: 'Épaules, poignets, équilibre', color: '#8fd3ff' }
  ];

  /*
   * Exercices, dans l'ordre de difficulté de chaque famille.
   * type : 'reps' (répétitions) ou 'time' (secondes)
   * start : objectif de départ quand le niveau est débloqué
   * unlock : objectif à tenir sur toutes les séries pour débloquer le niveau suivant
   * req : matériel nécessaire ; skipIf : remplacé quand ce matériel est disponible
   * side : se compte par côté
   */
  var EX = [
    // Poussée
    { id: 'pompes-mur', f: 'push', name: 'Pompes contre un mur', type: 'reps', start: 10, unlock: 20,
      cues: ['Mains au mur à hauteur des épaules, un peu plus larges.', 'Corps gainé des épaules aux talons, descends jusqu’à frôler le mur.'] },
    { id: 'pompes-inclinees', f: 'push', name: 'Pompes inclinées', type: 'reps', start: 8, unlock: 15,
      cues: ['Mains sur un banc, une table ou un plan de travail bien stable.', 'Coudes à 45° du corps, jamais en croix.'] },
    { id: 'pompes-genoux', f: 'push', name: 'Pompes sur les genoux', type: 'reps', start: 8, unlock: 15,
      cues: ['Genoux au sol, hanches alignées avec le dos.', 'Poitrine près du sol, pousse fort en remontant.'] },
    { id: 'pompes', f: 'push', name: 'Pompes classiques', type: 'reps', start: 5, unlock: 15,
      cues: ['Planche solide : fessiers et abdos serrés.', 'Poitrine à un poing du sol, bras tendus en haut.'] },
    { id: 'dips-chaise', f: 'push', name: 'Dips sur chaise', type: 'reps', start: 6, unlock: 15, req: ['chair'],
      cues: ['Mains au bord d’une chaise calée contre un mur, jambes fléchies devant toi.', 'Descends jusqu’à 90° aux coudes, épaules basses.'] },
    { id: 'pompes-diamant', f: 'push', name: 'Pompes diamant', type: 'reps', start: 5, unlock: 15,
      cues: ['Pouces et index forment un losange sous la poitrine.', 'Coudes serrés le long du corps : les triceps travaillent.'] },
    { id: 'pompes-declinees', f: 'push', name: 'Pompes déclinées', type: 'reps', start: 6, unlock: 15, req: ['chair'],
      cues: ['Pieds surélevés sur une chaise ou un banc.', 'Bassin aligné, ne le laisse pas tomber.'] },
    { id: 'dips', f: 'push', name: 'Dips aux barres', type: 'reps', start: 4, unlock: 12, req: ['dips'],
      cues: ['Bras tendus sur les barres, épaules basses et loin des oreilles.', 'Descends jusqu’à 90° aux coudes, buste légèrement penché.'] },
    { id: 'pompes-archer', f: 'push', name: 'Pompes archer', type: 'reps', start: 4, unlock: 10, side: true,
      cues: ['Mains très écartées, descends vers un bras pendant que l’autre reste tendu.', 'Alterne les côtés, compte par côté.'] },
    { id: 'pompes-pseudo', f: 'push', name: 'Pompes pseudo-planche', type: 'reps', start: 5, unlock: 12,
      cues: ['Mains au niveau des hanches, doigts tournés vers l’extérieur.', 'Penche les épaules bien en avant des mains.'] },
    { id: 'pompes-un-bras', f: 'push', name: 'Pompes à un bras', type: 'reps', start: 2, unlock: 8, side: true,
      cues: ['Pieds écartés, main sous la poitrine.', 'Gainage maximal pour ne pas tourner le buste.'] },

    // Tirage
    { id: 'superman', f: 'pull', name: 'Superman', type: 'time', start: 15, unlock: 40, skipIf: ['bar', 'table', 'band'],
      cues: ['À plat ventre, bras tendus devant toi.', 'Décolle bras, poitrine et jambes, serre les omoplates, regard vers le sol.'] },
    { id: 'ytw', f: 'pull', name: 'Y-T-W au sol', type: 'reps', start: 6, unlock: 12, skipIf: ['bar', 'table'],
      cues: ['À plat ventre, front au sol, pouces vers le plafond.', 'Lève les bras en Y, puis en T, puis en W : les trois comptent pour une répétition.'] },
    { id: 'rowing-serviette', f: 'pull', name: 'Rowing serviette à la porte', type: 'reps', start: 8, unlock: 15, skipIf: ['table', 'band'],
      cues: ['Passe une serviette solide autour des deux poignées d’une porte ouverte, pieds de chaque côté du bord.', 'Penche-toi en arrière bras tendus, puis tire la poitrine vers la porte.'] },
    { id: 'suspension', f: 'pull', name: 'Suspension à la barre', type: 'time', start: 15, unlock: 45, req: ['bar'],
      cues: ['Prise en pronation, bras tendus, épaules engagées.', 'Respire calmement, ne te balance pas.'] },
    { id: 'rowing-elastique', f: 'pull', name: 'Rowing à l’élastique', type: 'reps', start: 10, unlock: 20, req: ['band'], skipIf: ['table'],
      cues: ['Élastique accroché à hauteur de poitrine (poignée de porte, poteau).', 'Tire les coudes vers l’arrière et serre les omoplates une seconde.'] },
    { id: 'rowing-incline', f: 'pull', name: 'Rowing australien genoux fléchis', type: 'reps', start: 8, unlock: 15, req: ['table'],
      cues: ['Allongé sous une table solide (ou une barre basse), agrippe le bord, genoux fléchis et pieds au sol.', 'Tire la poitrine vers la table, omoplates serrées.'] },
    { id: 'rowing-australien', f: 'pull', name: 'Rowing australien', type: 'reps', start: 6, unlock: 15, req: ['table'],
      cues: ['Sous la table ou la barre basse, jambes tendues, corps gainé.', 'Poitrine jusqu’au bord, descente contrôlée.'] },
    { id: 'rowing-serviette-uni', f: 'pull', name: 'Rowing serviette à un bras', type: 'reps', start: 5, unlock: 12, side: true, skipIf: ['bar'],
      cues: ['Serviette autour d’une poignée de porte ouverte, une seule main, pieds près du bord.', 'Bassin face à la porte, sans tourner le buste.'] },
    { id: 'tirage-elastique', f: 'pull', name: 'Tirage vertical à l’élastique', type: 'reps', start: 10, unlock: 20, req: ['band'], skipIf: ['bar'],
      cues: ['Élastique coincé en haut d’une porte fermée, à genoux face à elle.', 'Tire les coudes vers les hanches, poitrine sortie.'] },
    { id: 'rowing-pieds', f: 'pull', name: 'Rowing pieds surélevés', type: 'reps', start: 6, unlock: 12, req: ['table', 'chair'],
      cues: ['Sous la table, pieds posés sur une chaise, corps parallèle au sol.', 'Marque une pause d’une seconde en haut.'] },
    { id: 'rowing-archer', f: 'pull', name: 'Rowing archer', type: 'reps', start: 4, unlock: 10, side: true, req: ['table'],
      cues: ['Sous la table, mains très écartées.', 'Tire vers une main pendant que l’autre bras reste tendu.'] },
    { id: 'tractions-scap', f: 'pull', name: 'Tractions scapulaires', type: 'reps', start: 6, unlock: 12, req: ['bar'],
      cues: ['Bras tendus, monte uniquement en abaissant les omoplates.', 'Petit mouvement, contrôle total.'] },
    { id: 'tractions-negatives', f: 'pull', name: 'Tractions négatives', type: 'reps', start: 3, unlock: 8, req: ['bar'],
      cues: ['Saute ou monte sur une chaise pour placer le menton au-dessus de la barre.', 'Descends le plus lentement possible, environ 5 secondes.'] },
    { id: 'tractions-elastique', f: 'pull', name: 'Tractions assistées à l’élastique', type: 'reps', start: 4, unlock: 10, req: ['bar', 'band'],
      cues: ['Élastique noué à la barre, un pied ou un genou dans la boucle.', 'Amplitude complète : bras tendus en bas, menton au-dessus en haut.'] },
    { id: 'chin-ups', f: 'pull', name: 'Tractions supination', type: 'reps', start: 3, unlock: 8, req: ['bar'],
      cues: ['Paumes vers toi, mains à largeur d’épaules.', 'Menton au-dessus de la barre, descente contrôlée.'] },
    { id: 'tractions', f: 'pull', name: 'Tractions pronation', type: 'reps', start: 4, unlock: 12, req: ['bar'],
      cues: ['Paumes vers l’avant, mains un peu plus larges que les épaules.', 'Pas d’élan : amène la poitrine vers la barre.'] },
    { id: 'tractions-archer', f: 'pull', name: 'Tractions archer', type: 'reps', start: 3, unlock: 8, req: ['bar'], side: true,
      cues: ['Prise très large, tire vers une main en tendant l’autre bras.', 'Alterne les côtés, compte par côté.'] },
    { id: 'tractions-explosives', f: 'pull', name: 'Tractions explosives', type: 'reps', start: 3, unlock: 8, req: ['bar'],
      cues: ['Tire le plus vite possible, barre vers le bas du torse.', 'C’est la base du muscle-up.'] },
    { id: 'muscle-up', f: 'pull', name: 'Muscle-up', type: 'reps', start: 1, unlock: 6, req: ['bar'],
      cues: ['Tirage explosif, puis bascule des poignets par-dessus la barre.', 'Termine bras tendus au-dessus de la barre.'] },

    // Jambes
    { id: 'squats-assistes', f: 'legs', name: 'Squats assistés', type: 'reps', start: 10, unlock: 20,
      cues: ['Tiens-toi à un cadre de porte ou au dossier d’une chaise.', 'Hanches sous les genoux, talons au sol.'] },
    { id: 'squats', f: 'legs', name: 'Squats', type: 'reps', start: 12, unlock: 25,
      cues: ['Pieds à largeur d’épaules, genoux dans l’axe des pieds.', 'Dos droit, pousse dans les talons.'] },
    { id: 'fentes', f: 'legs', name: 'Fentes alternées', type: 'reps', start: 8, unlock: 15, side: true,
      cues: ['Grand pas en avant, le genou arrière frôle le sol.', 'Buste droit, alterne les jambes.'] },
    { id: 'squats-bulgares', f: 'legs', name: 'Squats bulgares', type: 'reps', start: 6, unlock: 12, side: true, req: ['chair'],
      cues: ['Pied arrière posé sur une chaise.', 'Descends sur la jambe avant, genou stable.'] },
    { id: 'squats-sautes', f: 'legs', name: 'Squats sautés', type: 'reps', start: 8, unlock: 15,
      cues: ['Descends en squat puis saute de toutes tes forces.', 'Atterris en douceur, genoux fléchis.'] },
    { id: 'pistol-assiste', f: 'legs', name: 'Pistol squat assisté', type: 'reps', start: 4, unlock: 10, side: true,
      cues: ['Sur une jambe, tiens un support solide.', 'L’autre jambe reste tendue devant toi.'] },
    { id: 'shrimp', f: 'legs', name: 'Shrimp squat', type: 'reps', start: 3, unlock: 8, side: true,
      cues: ['Tiens ta cheville arrière, descends le genou vers le sol.', 'Contrôle la descente.'] },
    { id: 'pistol', f: 'legs', name: 'Pistol squat', type: 'reps', start: 2, unlock: 8, side: true,
      cues: ['Bras devant pour l’équilibre, jambe libre tendue.', 'Descends complètement, remonte sans appui.'] },

    // Gainage
    { id: 'planche', f: 'core', name: 'Gainage planche', type: 'time', start: 20, unlock: 60,
      cues: ['Sur les avant-bras, corps aligné.', 'Serre fessiers et abdos, respire normalement.'] },
    { id: 'genoux-sol', f: 'core', name: 'Relevés de genoux au sol', type: 'reps', start: 10, unlock: 20,
      cues: ['Allongé, mains sous les fessiers.', 'Ramène les genoux vers la poitrine, bas du dos collé au sol.'] },
    { id: 'hollow', f: 'core', name: 'Hollow body', type: 'time', start: 15, unlock: 45,
      cues: ['Bas du dos plaqué au sol, bras et jambes tendus et décollés.', 'Plus les jambes sont basses, plus c’est dur.'] },
    { id: 'jambes-sol', f: 'core', name: 'Relevés de jambes au sol', type: 'reps', start: 8, unlock: 15,
      cues: ['Jambes tendues, monte jusqu’à la verticale.', 'Redescends lentement sans toucher le sol.'] },
    { id: 'genoux-suspendu', f: 'core', name: 'Relevés de genoux suspendu', type: 'reps', start: 6, unlock: 15, req: ['bar'],
      cues: ['Suspendu à la barre, monte les genoux à la poitrine.', 'Sans te balancer.'] },
    { id: 'lsit-groupe', f: 'core', name: 'L-sit groupé', type: 'time', start: 10, unlock: 25,
      cues: ['Mains au sol ou sur deux chaises, pousse fort dans les bras.', 'Genoux ramenés, fesses décollées.'] },
    { id: 'jambes-suspendu', f: 'core', name: 'Relevés de jambes suspendu', type: 'reps', start: 5, unlock: 12, req: ['bar'],
      cues: ['Jambes tendues jusqu’à l’horizontale ou plus haut.', 'Descente lente et contrôlée.'] },
    { id: 'lsit', f: 'core', name: 'L-sit', type: 'time', start: 5, unlock: 20,
      cues: ['Jambes tendues à l’horizontale, épaules basses.', 'Pointes de pieds tendues.'] },
    { id: 'dragon-flag', f: 'core', name: 'Dragon flag', type: 'reps', start: 2, unlock: 8,
      cues: ['Allongé au sol ou sur un banc, agrippe derrière ta tête un meuble lourd ou le banc.', 'Corps rigide, descends lentement comme une planche.'] },

    // ATR & équilibre
    { id: 'pompes-pike', f: 'atr', name: 'Pompes pike', type: 'reps', start: 5, unlock: 12,
      cues: ['Fesses en l’air, corps en V inversé.', 'Descends la tête vers le sol devant les mains.'] },
    { id: 'montee-mur', f: 'atr', name: 'Montée au mur', type: 'reps', start: 2, unlock: 5,
      cues: ['Dos au mur en position de pompe, monte les pieds sur le mur en rapprochant les mains.', 'Va aussi haut que possible, redescends en contrôle.'] },
    { id: 'atr-mur', f: 'atr', name: 'ATR face au mur', type: 'time', start: 15, unlock: 45,
      cues: ['Ventre face au mur, mains à 10-20 cm du mur.', 'Bras tendus, pousse les épaules vers les oreilles.'] },
    { id: 'pike-sureleve', f: 'atr', name: 'Pompes pike surélevées', type: 'reps', start: 4, unlock: 10, req: ['chair'],
      cues: ['Pieds sur une chaise, hanches au-dessus des épaules.', 'Descends la tête entre les mains.'] },
    { id: 'touchers-epaule', f: 'atr', name: 'ATR au mur, touchers d’épaule', type: 'reps', start: 4, unlock: 10, side: true,
      cues: ['En ATR face au mur, décolle une main pour toucher l’épaule opposée.', 'Transfère le poids lentement.'] },
    { id: 'atr-tentatives', f: 'atr', name: 'ATR libre, tentatives', type: 'time', start: 5, unlock: 15,
      cues: ['Lancer de jambe contrôlé, cherche l’équilibre avec les doigts.', 'Compte le total de secondes tenues dans la série.'] },
    { id: 'atr-libre', f: 'atr', name: 'ATR libre', type: 'time', start: 10, unlock: 30,
      cues: ['Corps aligné, regard entre les mains.', 'Corrige avec les doigts et les poignets.'] },
    { id: 'hspu', f: 'atr', name: 'Pompes en ATR au mur', type: 'reps', start: 2, unlock: 8,
      cues: ['En ATR dos au mur, descends la tête vers le sol.', 'Place un coussin sous la tête au début.'] }
  ];

  /*
   * Matériel. Chaque exercice peut demander du matériel (req, tous requis)
   * ou disparaître quand un meilleur matériel est disponible (skipIf, au moins un).
   */
  var EQUIP = [
    { id: 'bar',   name: 'Barre de traction',            desc: 'Tractions, muscle-up, relevés de jambes suspendu' },
    { id: 'table', name: 'Table solide',                 desc: 'Rowings allongé dessous (ou une barre basse)' },
    { id: 'chair', name: 'Chaise ou banc stable',        desc: 'Dips, pompes déclinées, squats bulgares' },
    { id: 'dips',  name: 'Barres à dips ou parallettes', desc: 'Dips aux barres' },
    { id: 'band',  name: 'Élastiques de musculation',    desc: 'Rowings et tractions assistées' }
  ];

  /* Objectifs : séries, repos, et vitesse de progression. */
  var GOALS = {
    force:  { id: 'force',  name: 'Force & skills', desc: 'Séries plus lourdes, repos longs, cap sur les figures.', sets: 4, rest: 120 },
    muscle: { id: 'muscle', name: 'Prise de muscle', desc: 'Volume soutenu pour construire du muscle.', sets: 4, rest: 90 },
    forme:  { id: 'forme',  name: 'Remise en forme', desc: 'Séances rythmées, repos courts, endurance.', sets: 3, rest: 60 }
  };

  /* Modèles de séance. slot = [famille, décalage de niveau] ; -1 = variante plus facile pour le volume. */
  var TEMPLATES = {
    full:      { id: 'full',      name: 'Full body',            slots: [['push', 0], ['pull', 0], ['legs', 0], ['core', 0]] },
    fullAtr:   { id: 'fullAtr',   name: 'Full body & ATR',      slots: [['atr', 0], ['push', 0], ['pull', 0], ['legs', 0]] },
    haut:      { id: 'haut',      name: 'Haut du corps',        slots: [['push', 0], ['pull', 0], ['push', -1], ['pull', -1]] },
    bas:       { id: 'bas',       name: 'Jambes & gainage',     slots: [['legs', 0], ['core', 0], ['legs', -1], ['core', -1]] },
    equilibre: { id: 'equilibre', name: 'ATR & gainage',        slots: [['atr', 0], ['core', 0], ['atr', -1], ['push', -1]] },
    poussee:   { id: 'poussee',   name: 'Poussée & ATR',        slots: [['atr', 0], ['push', 0], ['push', -1], ['core', 0]] },
    tirage:    { id: 'tirage',    name: 'Tirage & gainage',     slots: [['pull', 0], ['core', 0], ['pull', -1], ['core', -1]] },
    jambes:    { id: 'jambes',    name: 'Jambes',               slots: [['legs', 0], ['legs', -1], ['core', 0], ['atr', -1]] }
  };

  /* Rotation hebdomadaire selon le nombre de séances par semaine. */
  var WEEK_PLANS = {
    2: ['full', 'fullAtr'],
    3: ['fullAtr', 'haut', 'bas'],
    4: ['haut', 'bas', 'equilibre', 'full'],
    5: ['poussee', 'tirage', 'jambes', 'equilibre', 'full'],
    6: ['poussee', 'tirage', 'jambes', 'equilibre', 'haut', 'bas']
  };

  var WARMUP = [
    { name: 'Rotations des poignets', dose: '30 s' },
    { name: 'Cercles de bras, avant puis arrière', dose: '30 s' },
    { name: 'Rotations de hanches', dose: '30 s' },
    { name: 'Jumping jacks', dose: '45 s' },
    { name: 'Squats lents et pompes faciles', dose: '8 + 8' }
  ];

  /* Rangs gagnés avec l'expérience (XP). */
  var RANKS = [
    { name: 'Novice', xp: 0 },
    { name: 'Initié', xp: 600 },
    { name: 'Athlète', xp: 2000 },
    { name: 'Guerrier', xp: 5000 },
    { name: 'Élite', xp: 10000 },
    { name: 'Maître', xp: 18000 },
    { name: 'Légende', xp: 30000 }
  ];

  var BADGES = [
    { id: 'first',     name: 'Premier pas',        desc: 'Termine ta première séance' },
    { id: 's10',       name: 'Régulier',           desc: '10 séances terminées' },
    { id: 's30',       name: 'Habitué',            desc: '30 séances terminées' },
    { id: 's100',      name: 'Centurion',          desc: '100 séances terminées' },
    { id: 'w2',        name: 'Sur la lancée',      desc: '2 semaines d’objectif tenues d’affilée' },
    { id: 'w4',        name: 'Un mois solide',     desc: '4 semaines d’objectif tenues d’affilée' },
    { id: 'w12',       name: 'Inarrêtable',        desc: '12 semaines d’objectif tenues d’affilée' },
    { id: 'r1k',       name: 'Mille',              desc: '1 000 répétitions au total' },
    { id: 'r10k',      name: 'Dix mille',          desc: '10 000 répétitions au total' },
    { id: 'lvl1',      name: 'Palier franchi',     desc: 'Débloque un nouveau niveau' },
    { id: 'lvl5',      name: 'Grimpeur',           desc: 'Débloque 5 niveaux' },
    { id: 'pushup',    name: 'Pompe parfaite',     desc: 'Atteins les pompes classiques' },
    { id: 'pullup',    name: 'Menton au-dessus',   desc: 'Atteins les tractions supination' },
    { id: 'handstand', name: 'Tête en bas',        desc: 'Atteins l’ATR libre' },
    { id: 'early',     name: 'Lève-tôt',           desc: 'Une séance terminée avant 8 h' },
    { id: 'night',     name: 'Oiseau de nuit',     desc: 'Une séance terminée après 21 h' },
    { id: 'chal1',     name: 'Défi relevé',        desc: 'Relève ton premier défi de la semaine' },
    { id: 'chal10',    name: 'Chasseur de défis',  desc: '10 défis relevés' },
    { id: 'chal30',    name: 'Inépuisable',        desc: '30 défis relevés' },
    { id: 'chalweek',  name: 'Semaine parfaite',   desc: 'Les 3 défis d’une même semaine' }
  ];

  var QUOTES = [
    'Pas besoin d’être parfait. Juste régulier.',
    'Chaque répétition te rapproche de ton prochain palier.',
    'Ton corps est ta salle de sport, et elle est ouverte.',
    'Le niveau d’après commence par la séance d’aujourd’hui.',
    'Lent, propre, contrôlé : c’est comme ça qu’on devient fort.',
    'Dix minutes valent mieux que zéro.'
  ];

  return { FAMILIES: FAMILIES, EX: EX, EQUIP: EQUIP, GOALS: GOALS, TEMPLATES: TEMPLATES, WEEK_PLANS: WEEK_PLANS,
           WARMUP: WARMUP, RANKS: RANKS, BADGES: BADGES, QUOTES: QUOTES };
})();
