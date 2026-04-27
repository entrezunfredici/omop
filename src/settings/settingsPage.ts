export function settingsPageHtml(): string {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Odoo Plugin — Paramètres</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#121212;--bg2:#1a1a1a;--bg3:#242424;--bg4:#2e2e2e;
  --border:#2a2a2a;--text:#e0e0e0;--muted:#777;
  --red:#e53935;--red2:#c62828;--inp:#0e0e0e;
}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;font-size:14px}
.hdr{padding:18px 28px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
.hdr h1{font-size:17px;font-weight:600}
.badge{background:var(--red);color:#fff;font-size:11px;padding:2px 8px;border-radius:4px;margin-left:4px}
.tabs{display:flex;padding:0 28px;border-bottom:1px solid var(--border)}
.tab{padding:11px 18px;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;white-space:nowrap;transition:.15s;font-size:13px}
.tab:hover{color:var(--text)}
.tab.on{color:var(--text);border-bottom-color:var(--red);font-weight:500}
.content{padding:28px;max-width:860px}
.pnl{display:none}.pnl.on{display:block}
.row{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.row h2{font-size:14px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:13px 16px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:start;gap:12px;transition:border-color .15s}
.card:hover{border-color:var(--bg4)}
.card-l h3{font-size:14px;font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:8px}
.card-l p{font-size:12px;color:var(--muted);line-height:1.6}
.card-r{display:flex;gap:6px;flex-shrink:0;padding-top:2px}
.chip{font-size:10px;padding:2px 7px;border-radius:4px;font-weight:600;letter-spacing:.03em}
.chip-g{background:#1b3a1e;color:#81c784}
.chip-r{background:#3e1a1a;color:#ef9a9a}
.chip-b{background:#0d2a3a;color:#81d4fa}
.empty{background:var(--bg2);border:1px dashed var(--border);border-radius:8px;padding:28px;text-align:center;color:var(--muted);font-size:13px}
.flt{display:flex;gap:10px;margin-bottom:14px;align-items:center}
.flt label{color:var(--muted);font-size:12px;white-space:nowrap}
.flt select{flex:1;max-width:280px}
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:100;align-items:center;justify-content:center}
.overlay.on{display:flex}
.modal{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:24px;width:540px;max-height:88vh;overflow-y:auto}
.modal h2{font-size:15px;font-weight:600;margin-bottom:18px}
.fg{margin-bottom:13px}
.fg>label{display:block;font-size:12px;color:var(--muted);margin-bottom:5px}
.fg input,.fg select{width:100%;background:var(--inp);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px 10px;font-size:13px;outline:none;transition:border-color .15s}
.fg input:focus,.fg select:focus{border-color:var(--red)}
.fg input[type=number]{-moz-appearance:textfield}
.fg input::placeholder{color:var(--muted)}
.hint{font-size:11px;color:var(--muted);margin-top:3px;line-height:1.4}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.frow3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.sep{border:none;border-top:1px solid var(--border);margin:14px 0}
.tr{display:flex;justify-content:space-between;align-items:center}
.toggle{position:relative;display:inline-block;width:34px;height:18px;flex-shrink:0}
.toggle input{opacity:0;width:0;height:0}
.sl{position:absolute;inset:0;background:var(--bg4);border-radius:18px;cursor:pointer;transition:.2s}
input:checked+.sl{background:var(--red)}
.sl:before{content:'';position:absolute;height:12px;width:12px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.2s}
input:checked+.sl:before{transform:translateX(16px)}
.tags{background:var(--inp);border:1px solid var(--border);border-radius:6px;padding:5px 8px;display:flex;flex-wrap:wrap;gap:5px;cursor:text;min-height:38px;transition:border-color .15s}
.tags:focus-within{border-color:var(--red)}
.tag{background:var(--bg3);border:1px solid var(--border);border-radius:4px;padding:2px 7px;font-size:12px;display:flex;align-items:center;gap:4px;font-family:monospace}
.tag button{background:none;border:none;color:var(--muted);cursor:pointer;font-size:13px;line-height:1;padding:0;transition:color .1s}
.tag button:hover{color:var(--red)}
.tags input{background:none;border:none;outline:none;color:var(--text);font-size:13px;font-family:monospace;flex:1;min-width:80px;padding:2px 0}
.ops{display:flex;gap:7px;flex-wrap:wrap}
.op{padding:5px 13px;border-radius:6px;border:1px solid var(--border);background:var(--bg3);cursor:pointer;font-size:12px;font-family:monospace;transition:.15s}
.op.on{background:var(--red);border-color:var(--red);color:#fff}
.op:hover:not(.on){border-color:var(--muted)}
.mfoot{display:flex;justify-content:flex-end;gap:8px;margin-top:20px;padding-top:14px;border-top:1px solid var(--border)}
.btn{padding:7px 16px;border-radius:6px;border:none;cursor:pointer;font-size:13px;font-weight:500;transition:.15s}
.btn-p{background:var(--red);color:#fff}.btn-p:hover{background:var(--red2)}
.btn-g{background:var(--bg3);color:var(--text);border:1px solid var(--border)}.btn-g:hover{border-color:var(--muted)}
.btn-d{background:transparent;color:var(--red);border:1px solid transparent}.btn-d:hover{border-color:var(--red)}
.btn-sm{padding:4px 10px;font-size:12px}
.toast{position:fixed;bottom:20px;right:20px;padding:10px 18px;border-radius:8px;font-size:13px;z-index:200;transform:translateY(8px);opacity:0;transition:.3s;pointer-events:none}
.toast.on{transform:translateY(0);opacity:1}
.toast-ok{background:#1b3a1e;color:#a5d6a7;border:1px solid #2e5c31}
.toast-err{background:#3e1a1a;color:#ffcdd2;border:1px solid #5c2e2e}
.section-desc{font-size:12px;color:var(--muted);margin-bottom:16px;line-height:1.5}
</style>
</head>
<body>

<div class="hdr">
  <h1>Odoo Plugin</h1><span class="badge">Paramètres</span>
</div>

<div class="tabs">
  <div class="tab on" data-tab="connections" onclick="switchTab(this)">Profils de connexion</div>
  <div class="tab" data-tab="access" onclick="switchTab(this)">Profils d'accès</div>
  <div class="tab" data-tab="rules" onclick="switchTab(this)">Droits d'accès</div>
</div>

<div class="content">

  <div class="pnl on" id="pnl-connections">
    <div class="row">
      <h2>Profils de connexion</h2>
      <button class="btn btn-p" onclick="openModal('connection')">+ Ajouter</button>
    </div>
    <p class="section-desc">Chaque profil représente une instance Odoo. Le mot de passe est stocké dans le fichier de configuration du plugin sur votre serveur.</p>
    <div id="list-connections"></div>
  </div>

  <div class="pnl" id="pnl-access">
    <div class="row">
      <h2>Profils d'accès</h2>
      <button class="btn btn-p" onclick="openModal('access')">+ Ajouter</button>
    </div>
    <p class="section-desc">Un profil d'accès regroupe les paramètres de confirmation par défaut pour un profil de connexion. Les règles de droits s'y rattachent.</p>
    <div id="list-access"></div>
  </div>

  <div class="pnl" id="pnl-rules">
    <div class="row">
      <h2>Droits d'accès</h2>
      <button class="btn btn-p" onclick="openModal('rule')">+ Ajouter</button>
    </div>
    <p class="section-desc">Règles deny-by-default par modèle et par champ. L'IA ne peut accéder qu'aux modèles et champs explicitement autorisés.</p>
    <div class="flt">
      <label>Filtrer par profil :</label>
      <select id="rule-filter" onchange="renderRules()">
        <option value="">Tous les profils</option>
      </select>
    </div>
    <div id="list-rules"></div>
  </div>

</div>

<div class="overlay" id="overlay" onclick="bgClick(event)">
  <div class="modal" id="modal"></div>
</div>

<div class="toast" id="toast"></div>

<script>
var API = '/plugin/odoo/api';
var cfg = { connection_profiles: [], access_profiles: [], permission_rules: [] };
var fieldTags = [];

async function init() {
  await loadCfg();
  render();
}

async function loadCfg() {
  try {
    var r = await fetch(API + '/config');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    cfg = await r.json();
  } catch(e) {
    toast('Erreur de chargement : ' + e.message, 'err');
  }
}

function switchTab(el) {
  document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('on'); });
  el.classList.add('on');
  var tab = el.getAttribute('data-tab');
  document.querySelectorAll('.pnl').forEach(function(p) { p.classList.remove('on'); });
  document.getElementById('pnl-' + tab).classList.add('on');
}

function render() {
  renderConnections();
  renderAccess();
  renderRules();
  populateFilter();
}

function renderConnections() {
  var el = document.getElementById('list-connections');
  var ps = cfg.connection_profiles;
  if (!ps.length) {
    el.innerHTML = '<div class="empty">Aucun profil de connexion. Cliquez sur Ajouter pour créer le premier.</div>';
    return;
  }
  el.innerHTML = ps.map(function(p, i) {
    return '<div class="card">'
      + '<div class="card-l"><h3>' + esc(p.label)
      + ' <span class="chip ' + (p.enabled ? 'chip-g' : 'chip-r') + '">' + (p.enabled ? 'actif' : 'inactif') + '</span></h3>'
      + '<p>' + esc(p.base_url) + ' &nbsp;&bull;&nbsp; ' + esc(p.database) + ' &nbsp;&bull;&nbsp; ' + esc(p.login) + '</p>'
      + '</div>'
      + '<div class="card-r">'
      + '<button class="btn btn-g btn-sm" onclick="editConn(' + i + ')">Modifier</button>'
      + '<button class="btn btn-d btn-sm" onclick="delItem(\'connection-profiles\',\'' + esc(p.id) + '\')">Supprimer</button>'
      + '</div></div>';
  }).join('');
}

function renderAccess() {
  var el = document.getElementById('list-access');
  var ps = cfg.access_profiles;
  if (!ps.length) {
    el.innerHTML = '<div class="empty">Aucun profil d\'accès.</div>';
    return;
  }
  el.innerHTML = ps.map(function(p, i) {
    var conn = cfg.connection_profiles.find(function(c) { return c.id === p.connection_profile_id; });
    var conLabel = conn ? esc(conn.label) : esc(p.connection_profile_id);
    return '<div class="card">'
      + '<div class="card-l"><h3>' + esc(p.label)
      + ' <span class="chip ' + (p.enabled ? 'chip-g' : 'chip-r') + '">' + (p.enabled ? 'actif' : 'inactif') + '</span></h3>'
      + '<p>Connexion : ' + conLabel + '</p>'
      + '<p>Confirmation — lecture : <b>' + yesno(p.default_read_confirmation) + '</b>'
      + ' &bull; création : <b>' + yesno(p.default_create_confirmation) + '</b>'
      + ' &bull; modif : <b>' + yesno(p.default_write_confirmation) + '</b>'
      + ' &bull; suppr : <b>' + yesno(p.default_delete_confirmation) + '</b></p>'
      + '</div>'
      + '<div class="card-r">'
      + '<button class="btn btn-g btn-sm" onclick="editAccess(' + i + ')">Modifier</button>'
      + '<button class="btn btn-d btn-sm" onclick="delItem(\'access-profiles\',\'' + esc(p.id) + '\')">Supprimer</button>'
      + '</div></div>';
  }).join('');
}

function renderRules() {
  var filter = document.getElementById('rule-filter').value;
  var el = document.getElementById('list-rules');
  var rules = cfg.permission_rules.filter(function(r) { return !filter || r.access_profile_id === filter; });
  if (!rules.length) {
    el.innerHTML = '<div class="empty">Aucune règle' + (filter ? ' pour ce profil' : '') + '. Cliquez sur Ajouter pour en créer une.</div>';
    return;
  }
  el.innerHTML = rules.map(function(r, i) {
    var ap = cfg.access_profiles.find(function(a) { return a.id === r.access_profile_id; });
    var globalIdx = cfg.permission_rules.indexOf(r);
    return '<div class="card">'
      + '<div class="card-l"><h3>'
      + '<span class="chip ' + (r.allowed ? 'chip-g' : 'chip-r') + '">' + (r.allowed ? 'ALLOW' : 'DENY') + '</span>'
      + ' <code>' + esc(r.model) + '</code>'
      + ' &nbsp;<span style="color:var(--muted)">champ</span>&nbsp;'
      + '<code>' + esc(r.field) + '</code>'
      + ' &nbsp;<span class="chip chip-b">' + esc(r.operation) + '</span>'
      + '</h3>'
      + '<p>Profil : ' + (ap ? esc(ap.label) : esc(r.access_profile_id))
      + (r.require_confirmation ? ' &nbsp;&bull;&nbsp; confirmation requise' : '') + '</p>'
      + '</div>'
      + '<div class="card-r">'
      + '<button class="btn btn-g btn-sm" onclick="editRule(' + globalIdx + ')">Modifier</button>'
      + '<button class="btn btn-d btn-sm" onclick="delItem(\'permission-rules\',\'' + esc(r.id) + '\')">Supprimer</button>'
      + '</div></div>';
  }).join('');
}

function populateFilter() {
  var sel = document.getElementById('rule-filter');
  var cur = sel.value;
  sel.innerHTML = '<option value="">Tous les profils</option>'
    + cfg.access_profiles.map(function(p) {
      return '<option value="' + p.id + '"' + (cur === p.id ? ' selected' : '') + '>' + esc(p.label) + '</option>';
    }).join('');
}

function editConn(i) { openModal('connection', cfg.connection_profiles[i]); }
function editAccess(i) { openModal('access', cfg.access_profiles[i]); }
function editRule(i) { openModal('rule', cfg.permission_rules[i]); }

function openModal(type, item) {
  fieldTags = [];
  var m = document.getElementById('modal');
  if (type === 'connection') m.innerHTML = connForm(item || null);
  else if (type === 'access') m.innerHTML = accessForm(item || null);
  else if (type === 'rule') m.innerHTML = ruleForm(item || null);
  document.getElementById('overlay').classList.add('on');
  if (type === 'rule' && item && item.field) {
    fieldTags = [item.field];
    renderTags();
  }
}

function closeModal() {
  document.getElementById('overlay').classList.remove('on');
  fieldTags = [];
}

function bgClick(e) { if (e.target.id === 'overlay') closeModal(); }

function connForm(v) {
  v = v || { label:'', base_url:'', database:'', login:'', password:'', port:443, auth_type:'password', enabled:true };
  return '<h2>' + (v.id ? 'Modifier' : 'Nouveau') + ' profil de connexion</h2>'
    + fg('Nom / Label *', '<input id="f-label" value="' + esc(v.label) + '" placeholder="Ex: Production Odoo">')
    + fg('URL Odoo *', '<input id="f-url" value="' + esc(v.base_url) + '" placeholder="https://monentreprise.odoo.com">', 'Sans slash final')
    + '<div class="frow">'
    + fg('Base de données *', '<input id="f-db" value="' + esc(v.database) + '" placeholder="monentreprise">')
    + fg('Port', '<input id="f-port" type="number" value="' + (v.port || 443) + '">')
    + '</div>'
    + fg('Email / Login *', '<input id="f-login" value="' + esc(v.login) + '" placeholder="admin@monentreprise.com">')
    + fg('Mot de passe *', '<input id="f-pwd" type="password" value="' + esc(v.password || '') + '" placeholder="••••••••">', 'Stocké dans /data/odoo-plugin/profiles.json sur votre serveur')
    + fg('Type d\'authentification',
        '<div class="ops" id="grp-auth">'
        + '<div class="op' + (v.auth_type !== 'api_key' ? ' on' : '') + '" onclick="selOp(\'grp-auth\',\'f-auth\',this,\'password\')">Mot de passe</div>'
        + '<div class="op' + (v.auth_type === 'api_key' ? ' on' : '') + '" onclick="selOp(\'grp-auth\',\'f-auth\',this,\'api_key\')">Clé API</div>'
        + '</div><input type="hidden" id="f-auth" value="' + esc(v.auth_type || 'password') + '">')
    + fg('', '<div class="tr"><label style="color:var(--text)">Profil actif</label>'
        + toggle('f-enabled', v.enabled !== false) + '</div>')
    + mfoot('saveConn(' + (v.id ? '\'' + esc(v.id) + '\'' : 'null') + ')');
}

function accessForm(v) {
  v = v || { label:'', connection_profile_id:'', enabled:true, default_read_confirmation:false, default_create_confirmation:true, default_write_confirmation:true, default_delete_confirmation:true };
  var connOpts = cfg.connection_profiles.map(function(c) {
    return '<option value="' + c.id + '"' + (v.connection_profile_id === c.id ? ' selected' : '') + '>' + esc(c.label) + '</option>';
  }).join('');
  return '<h2>' + (v.id ? 'Modifier' : 'Nouveau') + ' profil d\'accès</h2>'
    + fg('Nom / Label *', '<input id="f-label" value="' + esc(v.label) + '" placeholder="Ex: Lecture seule">')
    + fg('Profil de connexion *', '<select id="f-conn">' + connOpts + '</select>', cfg.connection_profiles.length === 0 ? '⚠ Créez d\'abord un profil de connexion' : '')
    + fg('', '<div class="tr"><label style="color:var(--text)">Profil actif</label>' + toggle('f-enabled', v.enabled !== false) + '</div>')
    + '<hr class="sep">'
    + fg('', '<span style="font-size:12px;font-weight:600;color:var(--text)">Demander une confirmation pour :</span>')
    + fg('', '<div class="tr"><label>Lecture</label>' + toggle('f-rc', !!v.default_read_confirmation) + '</div>')
    + fg('', '<div class="tr"><label>Création</label>' + toggle('f-cc', v.default_create_confirmation !== false) + '</div>')
    + fg('', '<div class="tr"><label>Modification</label>' + toggle('f-wc', v.default_write_confirmation !== false) + '</div>')
    + fg('', '<div class="tr"><label>Suppression</label>' + toggle('f-dc', v.default_delete_confirmation !== false) + '</div>')
    + mfoot('saveAccess(' + (v.id ? '\'' + esc(v.id) + '\'' : 'null') + ')');
}

function ruleForm(v) {
  v = v || { access_profile_id:'', model:'', field:'', operation:'read', allowed:true, require_confirmation:false };
  var apOpts = cfg.access_profiles.map(function(a) {
    return '<option value="' + a.id + '"' + (v.access_profile_id === a.id ? ' selected' : '') + '>' + esc(a.label) + '</option>';
  }).join('');
  return '<h2>' + (v.id ? 'Modifier la' : 'Nouvelle') + ' règle d\'accès</h2>'
    + fg('Profil d\'accès *', '<select id="f-ap">' + apOpts + '</select>')
    + fg('Modèle Odoo *', '<input id="f-model" value="' + esc(v.model) + '" placeholder="Ex: project.task">', 'Nom technique du modèle Odoo')
    + fg('Champ(s) * <span style="font-weight:normal;color:var(--muted)">&nbsp;— Entrée ou virgule pour ajouter, <code>*</code> pour tous les champs</span>',
        '<div class="tags" id="tag-box" onclick="document.getElementById(\'tag-input\').focus()">'
        + '<span id="tag-list"></span>'
        + '<input id="tag-input" placeholder="nom_du_champ" onkeydown="tagKey(event)" oninput="tagInput(event)">'
        + '</div>')
    + fg('Opération *',
        '<div class="ops" id="grp-op">'
        + ['read','create','write','delete'].map(function(op) {
            return '<div class="op' + (v.operation === op ? ' on' : '') + '" onclick="selOp(\'grp-op\',\'f-op\',this,\'' + op + '\')">' + op + '</div>';
          }).join('')
        + '</div><input type="hidden" id="f-op" value="' + esc(v.operation) + '">')
    + fg('Permission',
        '<div class="ops" id="grp-perm">'
        + '<div class="op' + (v.allowed !== false ? ' on' : '') + '" onclick="selOp(\'grp-perm\',\'f-allowed\',this,\'true\')">✓ Autoriser</div>'
        + '<div class="op' + (v.allowed === false ? ' on' : '') + '" onclick="selOp(\'grp-perm\',\'f-allowed\',this,\'false\')">✗ Refuser</div>'
        + '</div><input type="hidden" id="f-allowed" value="' + (v.allowed !== false) + '">')
    + fg('', '<div class="tr"><label style="color:var(--text)">Confirmation requise</label>' + toggle('f-confirm', !!v.require_confirmation) + '</div>')
    + (v.id ? '<p class="hint" style="margin-bottom:0">Pour modifier plusieurs champs à la fois, supprimez cette règle et recréez-la.</p>' : '')
    + mfoot('saveRule(' + (v.id ? '\'' + esc(v.id) + '\'' : 'null') + ')');
}

function fg(label, input, hint) {
  return '<div class="fg">'
    + (label ? '<label>' + label + '</label>' : '')
    + input
    + (hint ? '<div class="hint">' + hint + '</div>' : '')
    + '</div>';
}
function toggle(id, checked) {
  return '<label class="toggle"><input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + '><span class="sl"></span></label>';
}
function mfoot(saveCall) {
  return '<div class="mfoot">'
    + '<button class="btn btn-g" onclick="closeModal()">Annuler</button>'
    + '<button class="btn btn-p" onclick="' + saveCall + '">Enregistrer</button>'
    + '</div>';
}

function selOp(groupId, hiddenId, el, val) {
  document.querySelectorAll('#' + groupId + ' .op').forEach(function(o) { o.classList.remove('on'); });
  el.classList.add('on');
  document.getElementById(hiddenId).value = val;
}

function tagKey(e) {
  var inp = e.target;
  if ((e.key === 'Enter' || e.key === ',') && inp.value.trim()) {
    e.preventDefault();
    addTag(inp.value.trim().replace(/,/g, ''));
    inp.value = '';
  } else if (e.key === 'Backspace' && !inp.value && fieldTags.length) {
    fieldTags.pop();
    renderTags();
  }
}

function tagInput(e) {
  var v = e.target.value;
  if (v.endsWith(',')) {
    var t = v.slice(0, -1).trim();
    if (t) addTag(t);
    e.target.value = '';
  }
}

function addTag(t) {
  t = t.trim();
  if (t && !fieldTags.includes(t)) {
    fieldTags.push(t);
    renderTags();
  }
}

function removeTag(t) {
  fieldTags = fieldTags.filter(function(f) { return f !== t; });
  renderTags();
}

function renderTags() {
  var el = document.getElementById('tag-list');
  if (!el) return;
  el.innerHTML = fieldTags.map(function(t) {
    return '<span class="tag">' + esc(t) + '<button type="button" onclick="removeTag(\'' + esc(t) + '\')">×</button></span>';
  }).join('');
}

async function saveConn(existingId) {
  var label = val('f-label'), url = val('f-url'), db = val('f-db'), login = val('f-login');
  var pwd = document.getElementById('f-pwd').value;
  var port = parseInt(document.getElementById('f-port').value) || 443;
  var auth = val('f-auth');
  var enabled = document.getElementById('f-enabled').checked;
  if (!label || !url || !db || !login) return toast('Remplissez tous les champs obligatoires (*)', 'err');
  var id = existingId || slug(label);
  await saveItem('connection-profiles', {
    id: id, label: label, base_url: url.replace(/\\/$/, ''),
    database: db, login: login, password: pwd, port: port,
    auth_type: auth, api_mode: 'jsonrpc', enabled: enabled, secret_ref: id
  });
}

async function saveAccess(existingId) {
  var label = val('f-label'), conn = val('f-conn');
  var enabled = document.getElementById('f-enabled').checked;
  if (!label || !conn) return toast('Remplissez tous les champs obligatoires (*)', 'err');
  await saveItem('access-profiles', {
    id: existingId || slug(label), label: label,
    connection_profile_id: conn, enabled: enabled,
    default_read_confirmation: document.getElementById('f-rc').checked,
    default_create_confirmation: document.getElementById('f-cc').checked,
    default_write_confirmation: document.getElementById('f-wc').checked,
    default_delete_confirmation: document.getElementById('f-dc').checked
  });
}

async function saveRule(existingId) {
  var ap = val('f-ap'), model = val('f-model'), op = val('f-op');
  var allowed = val('f-allowed') === 'true';
  var confirm = document.getElementById('f-confirm').checked;
  var inp = document.getElementById('tag-input');
  if (inp && inp.value.trim()) addTag(inp.value.trim());
  if (!ap || !model || !op || !fieldTags.length)
    return toast('Remplissez tous les champs et ajoutez au moins un champ Odoo', 'err');

  if (existingId) {
    await saveItem('permission-rules', {
      id: existingId, access_profile_id: ap, model: model,
      field: fieldTags[0], operation: op, allowed: allowed, require_confirmation: confirm
    });
  } else {
    var ok = true;
    for (var fi = 0; fi < fieldTags.length; fi++) {
      var field = fieldTags[fi];
      var ruleId = slug(ap) + '_' + slug(model) + '_' + field.replace(/[^a-z0-9]/gi,'_') + '_' + op;
      try {
        var r = await fetch(API + '/permission-rules', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: ruleId, access_profile_id: ap, model: model, field: field, operation: op, allowed: allowed, require_confirmation: confirm })
        });
        if (!r.ok) throw new Error(await r.text());
      } catch(e) { ok = false; toast('Erreur : ' + e.message, 'err'); }
    }
    if (ok) {
      await loadCfg(); render(); closeModal();
      toast(fieldTags.length > 1 ? fieldTags.length + ' règles créées' : 'Règle créée');
    }
  }
}

async function saveItem(type, data) {
  try {
    var r = await fetch(API + '/' + type, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error(await r.text());
    await loadCfg(); render(); closeModal(); toast('Enregistré');
  } catch(e) { toast('Erreur : ' + e.message, 'err'); }
}

async function delItem(type, id) {
  if (!confirm('Supprimer cet élément ?')) return;
  try {
    var r = await fetch(API + '/' + type + '/' + encodeURIComponent(id), { method: 'DELETE' });
    if (!r.ok) throw new Error(await r.text());
    await loadCfg(); render(); toast('Supprimé');
  } catch(e) { toast('Erreur : ' + e.message, 'err'); }
}

function val(id) { return (document.getElementById(id).value || '').trim(); }
function yesno(b) { return b ? 'oui' : 'non'; }
function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function slug(s) { return (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,''); }
function toast(msg, type) {
  type = type || 'ok';
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast toast-' + type;
  void el.offsetWidth;
  el.classList.add('on');
  clearTimeout(el._t);
  el._t = setTimeout(function() { el.classList.remove('on'); }, 3000);
}

init();
</script>
</body>
</html>`;
}
