/*
 * Calisthenics : rappels de séance (notifications).
 * L'appli s'abonne aux notifications du navigateur et enregistre l'abonnement,
 * les jours et l'heure choisis dans Supabase. L'envoi est fait chaque heure par
 * scripts/rappels.mjs (GitHub Actions).
 */
window.GravitePush = (function () {
  'use strict';
  var cfg = window.GRAVITE_CONFIG || {};

  function supported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && !window.claude;
  }
  /* Le serveur est configuré (clé publique + base Supabase). */
  function ready() {
    return supported() && !!cfg.vapidPublicKey && !!(window.GraviteCloud && window.GraviteCloud.enabled());
  }
  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  function standalone() {
    try { if (window.matchMedia('(display-mode: standalone)').matches) return true; } catch (e) { /* ignore */ }
    return navigator.standalone === true;
  }
  /* Sur iPhone, les notifications ne marchent que depuis l'appli ajoutée à l'écran d'accueil. */
  function needsInstall() { return isIOS() && !standalone(); }
  function permission() { return 'Notification' in window ? Notification.permission : 'denied'; }
  function zone() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris'; } catch (e) { return 'Europe/Paris'; }
  }
  function keyBytes(b64) {
    var pad = '='.repeat((4 - b64.length % 4) % 4), raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }
  function registration() {
    return Promise.race([
      navigator.serviceWorker.ready,
      new Promise(function (_, rej) { setTimeout(function () { rej(new Error('L’appli n’est pas encore prête. Recharge la page et réessaie.')); }, 8000); })
    ]);
  }
  function current() {
    if (!supported()) return Promise.resolve(null);
    return registration().then(function (r) { return r.pushManager.getSubscription(); }).catch(function () { return null; });
  }
  function save(sub, prefs, ctx) {
    return window.GraviteCloud.rpc('save_push', {
      p_subscription: sub.toJSON(), p_days: prefs.days, p_hour: prefs.hour, p_tz: zone(), p_ctx: ctx || {}
    });
  }
  /* À appeler directement depuis un geste (toucher l'interrupteur) : iPhone l'exige. */
  function enable(prefs, ctx) {
    if (!ready()) return Promise.reject(new Error('Les rappels ne sont pas encore disponibles sur ce site.'));
    if (needsInstall()) return Promise.reject(new Error('Sur iPhone, ajoute d’abord l’appli à l’écran d’accueil, puis active les rappels depuis l’appli installée.'));
    return Notification.requestPermission().then(function (p) {
      if (p !== 'granted') {
        throw new Error(p === 'denied'
          ? 'Les notifications sont bloquées pour ce site. Autorise-les dans les réglages du navigateur, puis réessaie.'
          : 'Autorisation non accordée : les rappels restent désactivés.');
      }
      return registration();
    }).then(function (r) {
      return r.pushManager.getSubscription().then(function (s) {
        return s || r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(cfg.vapidPublicKey) });
      });
    }).then(function (sub) { return save(sub, prefs, ctx); });
  }
  function update(prefs, ctx) {
    if (!ready()) return Promise.resolve(null);
    return current().then(function (s) { return s ? save(s, prefs, ctx) : null; });
  }
  function disable() {
    return current().then(function (s) {
      if (!s) return null;
      var ep = s.endpoint;
      return s.unsubscribe().catch(function () { /* déjà désabonné */ }).then(function () {
        return ready() ? window.GraviteCloud.rpc('delete_push', { p_endpoint: ep }).catch(function () { /* l'envoi nettoiera */ }) : null;
      });
    });
  }
  /* Notification immédiate, affichée par l'appareil lui-même : vérifie l'autorisation et l'affichage. */
  function test() {
    return registration().then(function (r) {
      return r.showNotification('C’est jour de séance !', {
        body: 'Les rappels fonctionnent. Je te préviendrai aux jours et à l’heure choisis.',
        icon: 'icons/icon-192.png?v=2', badge: 'icons/icon-192.png?v=2', tag: 'essai', data: { url: './#accueil' }
      });
    });
  }

  return {
    supported: supported, ready: ready, needsInstall: needsInstall, permission: permission,
    current: current, enable: enable, update: update, disable: disable, test: test
  };
})();
