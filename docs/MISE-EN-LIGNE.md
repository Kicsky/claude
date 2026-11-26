# Mettre Calisthenics en ligne, gratuitement, avec des comptes par e-mail

Objectif : un site public que tout le monde peut ouvrir sans compte Claude, avec des comptes
gratuits (e-mail + mot de passe) pour sauvegarder sa progression.

Il y a deux briques gratuites :

1. **Supabase** stocke les comptes et la progression (l'offre gratuite suffit largement pour démarrer).
2. **Un hébergeur de site statique** publie les fichiers : GitHub Pages, Netlify ou Cloudflare Pages.

Compte environ 15 minutes. Sans l'étape 1, le site fonctionne quand même : la progression reste alors sur l'appareil de chacun.

---

## 1. Créer la base des comptes (Supabase)

1. Crée un compte sur <https://supabase.com> puis **New project** (choisis la région *Europe*, garde le mot de passe de la base quelque part).
2. Dans le projet : **SQL Editor → New query**, colle tout le contenu de [`supabase/schema.sql`](../supabase/schema.sql), puis **Run**.
   Cela crée la table `progress` et les règles de sécurité : chaque personne ne peut lire et modifier que sa propre progression.
3. **Project Settings → API** : copie
   - **Project URL** (ex. `https://abcd1234.supabase.co`)
   - la clé **anon public**
4. Colle-les dans [`js/config.js`](../js/config.js) :

   ```js
   window.GRAVITE_CONFIG = {
     supabaseUrl: 'https://abcd1234.supabase.co',
     supabaseAnonKey: 'eyJhbGciOi…'
   };
   ```

   La clé *anon* est faite pour être publique : ce sont les règles de l'étape 2 qui protègent les données.
   Ne mets jamais la clé *service_role* dans ce fichier.

## 2. Publier le site

Choisis **une** option.

### Option A : GitHub Pages

GitHub Pages est gratuit pour les dépôts **publics** (ou avec un abonnement GitHub Pro pour un dépôt privé).

1. Rends le dépôt public : **Settings → General → Danger Zone → Change visibility**.
2. Fusionne la branche de travail dans `main`.
3. **Settings → Pages → Build and deployment → Source : GitHub Actions**.
4. Le workflow [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) publie le site à chaque mise à jour de `main`.
   L'adresse s'affiche dans **Settings → Pages**, du type `https://<ton-pseudo>.github.io/claude/`.

### Option B : Netlify (fonctionne avec un dépôt privé)

1. Crée un compte sur <https://app.netlify.com>, puis **Add new site → Import an existing project → GitHub**.
2. Choisis le dépôt et la branche, laisse **Build command** vide, mets **Publish directory** à `.`.
3. **Deploy**. Tu obtiens une adresse en `https://<nom>.netlify.app` (modifiable dans *Site configuration*).

Cloudflare Pages fonctionne de la même façon (aucune commande de build, dossier de sortie `.`).

## 3. Relier les comptes à l'adresse du site

Dans Supabase : **Authentication → URL Configuration**

- **Site URL** : l'adresse de ton site (ex. `https://ton-pseudo.github.io/claude/`)
- **Redirect URLs** : ajoute la même adresse

C'est l'adresse vers laquelle renvoient les liens de confirmation et de nouveau mot de passe.

## 4. Les e-mails (important si beaucoup de monde s'inscrit)

Le service d'e-mail intégré de Supabase est fait pour tester : il n'envoie que quelques e-mails par heure.
Pour un site ouvert à tous :

- **Authentication → Emails → SMTP Settings** : branche un service d'envoi gratuit
  (par exemple Brevo, ou Resend), avec ton adresse d'expéditeur.
- **Authentication → Email Templates** : traduis les modèles en français
  (« Confirme ton adresse », « Choisis un nouveau mot de passe »).

## 5. Vérifier

1. Ouvre le site, fais le questionnaire, puis **Profil → Mon compte → Créer un compte**.
2. Clique sur le lien reçu par e-mail : tu reviens sur le site, connecté.
3. Ouvre le site sur un autre appareil, **J'ai déjà un compte** : ta progression revient.

## Bon à savoir

- **Mise en veille** : actuellement, sur l'offre gratuite, un projet Supabase sans aucune activité pendant 7 jours est mis en pause.
  Il se relance depuis le tableau de bord Supabase. Avec des utilisateurs réguliers, cela n'arrive pas.
- **Suppression de compte** : le bouton *Supprimer mon compte* efface le compte et sa progression en ligne
  (fonction `delete_account` créée à l'étape 1).
- **Installation sur téléphone** : sur le site publié, « Ajouter à l'écran d'accueil » installe Calisthenics comme une application,
  utilisable hors ligne.
