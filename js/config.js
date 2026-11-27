/*
 * Comptes en ligne (gratuits) avec Supabase.
 * Laisse ces deux champs vides pour utiliser l'application sans compte :
 * la progression reste alors sur l'appareil.
 * Pour activer les comptes, suis docs/MISE-EN-LIGNE.md puis colle ici :
 *  - l'URL du projet (Project Settings → API → Project URL)
 *  - la clé « anon public » (Project Settings → API). Elle est publique par conception :
 *    ce sont les règles de sécurité de la base (supabase/schema.sql) qui protègent les données.
 * Les rappels (notifications) utilisent en plus vapidPublicKey ci-dessous.
 */
window.GRAVITE_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  /* Clé publique des notifications (VAPID). La clé privée correspondante va dans les secrets GitHub. */
  vapidPublicKey: 'BMX2e2EmPZ_4eG--yIAfxptsZBcBGaaZiaqCewzy_ZO0jv-b_Bw_zZiIEccQV3wVEhNh-1jr5allOyH-oDg7sJU'
};
