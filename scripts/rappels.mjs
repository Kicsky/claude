/*
 * Calisthenics : envoi des rappels de séance (notifications).
 * Lancé chaque heure par .github/workflows/rappels.yml.
 *
 * Variables d'environnement (secrets GitHub) :
 *   SUPABASE_SERVICE_ROLE_KEY  clé serveur Supabase (jamais dans le site)
 *   VAPID_PRIVATE_KEY          clé privée des notifications
 * Lues dans js/config.js si absentes : SUPABASE_URL, VAPID_PUBLIC_KEY.
 * Les journaux GitHub d'un dépôt public sont visibles de tous : on n'y écrit que des totaux.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DAY = 864e5;

/* Date, heure et jour de la semaine (1 = lundi … 7 = dimanche) dans le fuseau de l'abonné. */
export function localParts(tz, now) {
  let f;
  try {
    f = new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23', weekday: 'short' });
  } catch (e) {
    f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23', weekday: 'short' });
  }
  const p = Object.fromEntries(f.formatToParts(now).map((x) => [x.type, x.value]));
  const weekday = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }[p.weekday];
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), weekday };
}

/*
 * Un rappel est dû le bon jour, à partir de l'heure choisie (jusqu'à 22 h, pour rattraper
 * un éventuel retard de GitHub), une seule fois par jour, et pas si la séance est déjà faite.
 */
export function isDue(row, now) {
  const p = localParts(row.tz, now);
  const days = (row.days || []).map(Number);
  if (!days.includes(p.weekday)) return null;
  if (p.hour < Number(row.hour) || p.hour >= 23) return null;
  if (row.last_sent_on === p.date) return null;
  if (row.ctx && row.ctx.last === p.date) return null;
  return p;
}

/* Texte du rappel, selon où en est la personne. */
export function message(row, p) {
  const ctx = row.ctx || {};
  const left = Math.max(0, (Number(ctx.goal) || 0) - (Number(ctx.weekDone) || 0));
  const since = ctx.last ? Math.round((Date.parse(p.date) - Date.parse(ctx.last)) / DAY) : null;
  const next = ctx.next ? String(ctx.next).slice(0, 40) : 'Ta séance';
  if (ctx.streak >= 2 && left > 0 && p.weekday >= 5) {
    return { title: 'Ta série est en jeu !', body: `${ctx.streak} semaines d’affilée : encore ${left} séance${left > 1 ? 's' : ''} cette semaine pour la garder.` };
  }
  if (since !== null && since >= 7) {
    return { title: 'Tu me manques !', body: 'On reprend en douceur ? Une séance courte, c’est déjà gagné.' };
  }
  if (since === null) {
    return { title: 'Ta première séance t’attend', body: `${next} : je te guide série par série.` };
  }
  const pool = [
    { title: 'C’est jour de séance !', body: `${next} t’attend. On y va ?` },
    { title: 'Prêt à t’entraîner ?', body: `${next} au programme aujourd’hui.` },
    { title: 'Ton coach t’attend', body: `Quelques séries de ${next.toLowerCase()} et c’est plié.` },
    { title: 'On garde le rythme ?', body: `${next} : chaque séance te rapproche du prochain niveau.` }
  ];
  const seed = [...p.date].reduce((a, c) => a + c.charCodeAt(0), 0);
  return pool[seed % pool.length];
}

function fromConfig(name) {
  try {
    const src = readFileSync(new URL('../js/config.js', import.meta.url), 'utf8');
    const m = src.match(new RegExp(name + "\\s*:\\s*'([^']*)'"));
    return m ? m[1] : '';
  } catch (e) { return ''; }
}

async function main() {
  const url = process.env.SUPABASE_URL || fromConfig('supabaseUrl');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const pub = process.env.VAPID_PUBLIC_KEY || fromConfig('vapidPublicKey');
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!url || !key || !pub || !priv) {
    console.log('Rappels non configurés (voir docs/MISE-EN-LIGNE.md) : rien à envoyer.');
    return;
  }
  const { default: webpush } = await import('web-push');
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:rappels@calisthenics.invalid', pub, priv);
  const api = `${url.replace(/\/$/, '')}/rest/v1/push_subscriptions`;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

  const res = await fetch(`${api}?select=endpoint,subscription,days,hour,tz,ctx,last_sent_on`, { headers });
  if (!res.ok) throw new Error(`Lecture des abonnements impossible (HTTP ${res.status})`);
  const rows = await res.json();
  const now = new Date();
  let sent = 0, gone = 0, failed = 0;
  for (const row of rows) {
    const p = isDue(row, now);
    if (!p) continue;
    const where = `${api}?endpoint=eq.${encodeURIComponent(row.endpoint)}`;
    try {
      await webpush.sendNotification(row.subscription, JSON.stringify({ ...message(row, p), url: './#accueil', tag: 'rappel' }), { TTL: 3 * 3600, urgency: 'normal' });
      await fetch(where, { method: 'PATCH', headers, body: JSON.stringify({ last_sent_on: p.date }) });
      sent++;
    } catch (err) {
      if (err && (err.statusCode === 404 || err.statusCode === 410)) {
        await fetch(where, { method: 'DELETE', headers });
        gone++;
      } else failed++;
    }
  }
  console.log(`${rows.length} abonnement(s) · ${sent} rappel(s) envoyé(s) · ${gone} expiré(s) supprimé(s) · ${failed} échec(s)`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
