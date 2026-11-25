# Gravité · calisthenics au poids du corps

Application web de musculation au poids du corps : pompes, tractions, squats, gainage et ATR.
Interface sombre et violette, boutons en verre liquide, et une progression par niveaux qui donne envie de revenir.

## Ce que fait l'app

- **Test de niveau** : objectif, matériel disponible, pompes, tractions (si tu as une barre), ATR, séances par semaine.
- **Adapté à ton matériel** : barre de traction, table, chaise, barres à dips, élastiques… ou rien du tout.
  Sans barre, le dos travaille avec superman, Y-T-W, rowing serviette à la porte ou rowings sous une table.
- **Programme hebdomadaire généré** : Full body, Haut du corps, Jambes & gainage, ATR… selon 2 à 6 séances par semaine.
- **5 parcours de progression**, jusqu'à 19 niveaux selon le matériel :
  - Poussée : pompes contre un mur → pompes à un bras
  - Tirage : superman → muscle-up, avec des variantes selon le matériel (porte, table, élastique, barre)
  - Jambes : squats assistés → pistol squat
  - Gainage : planche → dragon flag
  - ATR & équilibre : pompes pike → pompes en ATR
- **Objectifs qui montent tout seuls** : séries réussies = +1 rép (+5 s), +2 si « trop facile ». Atteins l'objectif de déblocage sur toutes tes séries et le niveau suivant s'ouvre.
- **Lecteur de séance guidé** : échauffement, consignes, compteur de répétitions, chrono pour les exercices tenus, minuteur de repos avec bips et vibrations, écran maintenu allumé.
- **Mon planning** : estimation de tes capacités dans 3 mois, 6 mois ou 1 an si tu tiens ton programme
  (pompes d'affilée, tractions, secondes en ATR contre le mur et sans appui), courbe semaine par semaine
  et dates estimées de chaque nouveau niveau. L'estimation rejoue ton programme avec les mêmes règles de
  progression et ton taux de réussite réel, et se recalcule après chaque séance.
- **Suivi** : rang et XP, série de semaines tenues, calendrier d'activité, répétitions par semaine, records, 16 badges, historique.
- **Mode exemple** pour voir l'app remplie avant de commencer.
- Sauvegarde automatique sur l'appareil, export / import de la progression.

## Lancer l'app

Aucune installation ni dépendance. Ouvre `index.html` dans un navigateur, ou sers le dossier :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

Pour l'avoir sur ton téléphone comme une vraie app : publie le dépôt avec GitHub Pages
(Settings → Pages → branche), ouvre l'adresse sur ton téléphone puis « Ajouter à l'écran d'accueil ».
L'app fonctionne ensuite hors ligne.

## Structure

```
index.html            page d'entrée
css/styles.css        thème sombre, verre liquide, animations
js/data.js            exercices, parcours, séances, badges
js/app.js             logique du programme, écrans, lecteur de séance
manifest.webmanifest  installation sur l'écran d'accueil
sw.js                 cache hors ligne
icons/                icônes de l'app
```

Pour ajouter un exercice, insère-le dans `js/data.js` à sa place dans la famille : l'ordre du tableau définit l'ordre des niveaux.
