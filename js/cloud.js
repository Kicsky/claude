/*
 * Gravité : comptes par e-mail et sauvegarde en ligne (Supabase).
 * Actif seulement si js/config.js contient l'URL et la clé du projet.
 */
window.GraviteCloud = (function () {
  'use strict';
  var cfg = window.GRAVITE_CONFIG || {};
  var client = null, user = null, listeners = [], timer = null, chain = Promise.resolve();
  var state = { status: 'idle', savedAt: null };

  function emit(event) { listeners.forEach(function (fn) { try { fn(event, user); } catch (e) { /* ignore */ } }); }
  function setStatus(s) { state.status = s; emit('STATUS'); }

  function init() {
    if (client) return true;
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase || !window.supabase.createClient) return false;
    try {
      client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    } catch (e) { client = null; return false; }
    client.auth.onAuthStateChange(function (event, session) {
      user = session ? session.user : null;
      emit(event);
    });
    return true;
  }

  /* Messages d'erreur compréhensibles. */
  function msg(err) {
    var m = ((err && (err.code || '')) + ' ' + (err && err.message || '')).toLowerCase();
    if (/invalid.?login|invalid_credentials/.test(m)) return 'E-mail ou mot de passe incorrect.';
    if (/not.?confirmed/.test(m)) return 'Confirme d’abord ton adresse : clique sur le lien reçu par e-mail.';
    if (/already.?(registered|exists)/.test(m)) return 'Un compte existe déjà avec cet e-mail. Connecte-toi.';
    if (/weak_password|at least|password should/.test(m)) return 'Mot de passe trop faible : 8 caractères minimum.';
    if (/rate.?limit|too many|429/.test(m)) return 'Trop de tentatives. Réessaie dans quelques minutes.';
    if (/invalid.*email|email_address_invalid|unable to validate email/.test(m)) return 'Cette adresse e-mail n’est pas valide.';
    if (/failed to fetch|network|load failed/.test(m)) return 'Pas de connexion internet. Réessaie quand tu es en ligne.';
    if (/delete_account|function .* does not exist|pgrst202/.test(m)) return 'La suppression de compte n’est pas activée sur ce serveur.';
    return 'Une erreur est survenue. Réessaie dans un instant.';
  }
  function wrap(p) {
    return p.then(function (r) {
      if (r && r.error) throw r.error;
      return r ? r.data : null;
    }).catch(function (e) { throw new Error(msg(e)); });
  }
  function here() { return location.origin + location.pathname; }

  function signUp(email, password) {
    return wrap(client.auth.signUp({ email: email, password: password, options: { emailRedirectTo: here() } }))
      .then(function (d) { return { needsConfirm: !(d && d.session) }; });
  }
  function signIn(email, password) { return wrap(client.auth.signInWithPassword({ email: email, password: password })); }
  function signOut() { clearTimeout(timer); return wrap(client.auth.signOut()); }
  function resetPassword(email) { return wrap(client.auth.resetPasswordForEmail(email, { redirectTo: here() })); }
  function updatePassword(password) { return wrap(client.auth.updateUser({ password: password })); }
  function deleteAccount() {
    return wrap(client.rpc('delete_account')).then(function () { return signOut().catch(function () { /* déjà supprimé */ }); });
  }

  /* Progression : une ligne par compte dans la table progress. */
  function load() {
    if (!user) return Promise.resolve(null);
    return wrap(client.from('progress').select('data, updated_at').eq('user_id', user.id).maybeSingle())
      .then(function (row) { return row ? row.data : null; });
  }
  function queueSave(s, now) {
    if (!client || !user) return;
    clearTimeout(timer);
    setStatus('pending');
    timer = setTimeout(function () {
      var uid = user && user.id;
      if (!uid) return;
      var snapshot = JSON.parse(JSON.stringify(s));
      chain = chain.then(function () {
        setStatus('saving');
        return wrap(client.from('progress').upsert({ user_id: uid, data: snapshot, updated_at: new Date().toISOString() }));
      }).then(function () {
        state.savedAt = new Date();
        setStatus('saved');
      }).catch(function () { setStatus('error'); });
    }, now ? 50 : 1500);
  }

  return {
    init: init,
    enabled: function () { return !!client; },
    user: function () { return user; },
    on: function (fn) { listeners.push(fn); },
    status: function () { return state.status; },
    savedAt: function () { return state.savedAt; },
    signUp: signUp, signIn: signIn, signOut: signOut, resetPassword: resetPassword, updatePassword: updatePassword,
    deleteAccount: deleteAccount, load: load, queueSave: queueSave
  };
})();
