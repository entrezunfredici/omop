# OMOCP — OpenClaw Odoo Connector

Safe-by-default OpenClaw plugin for Odoo, built around explicit profiles and deny-by-default permission rules.

Every operation is evaluated on `(model, field, operation)` before the Odoo transport layer is called. No arbitrary ORM or method execution is exposed.

---

## Architecture

```
OpenClaw (Node.js plugin)
    │  fetch()
    ▼
Python HTTP service  (FastAPI — port 8765)
    │  JSONRPC
    ▼
Odoo instance
```

The Node.js plugin communicates with a local Python HTTP service via `fetch()`. The Python service handles all Odoo logic: profiles, permission rules, snapshots, action logs. This design avoids `child_process` entirely (see [Security note](#security-note-child_process)).

---

## Installation sur Hostinger VPS (Docker)

### Prérequis système

Le container a besoin de `python3-venv` pour créer l'environnement virtuel Python. Si la version de Python du container est 3.13 :

```bash
apt-get install -y python3.13-venv
```

Pour trouver la version exacte dans le container :

```bash
python3 --version
```

### 1. Cloner et builder le plugin

```bash
cd /data/.openclaw/workspace
git clone <url-du-repo> omocp-agents
cd omocp-agents
npm install
npm run build
```

### 2. Installer les dépendances Python

```bash
npm run install:python
```

Cette commande crée `.venv/` dans le répertoire du plugin et installe `odoolib`, `keyring`, `fastapi`, `uvicorn` dedans.

Si la commande échoue avec une erreur `venv`, installez d'abord le paquet système Python venv (voir Prérequis).

### 3. Installer le plugin dans OpenClaw

```bash
openclaw plugins install -l /data/.openclaw/workspace/omocp-agents --dangerously-force-unsafe-install
```

Le flag `--dangerously-force-unsafe-install` est expliqué dans la section [Security note](#security-note-child_process).

### 4. Démarrer le service Python

Le service HTTP Python doit tourner en parallèle du plugin OpenClaw. Lancez-le depuis le répertoire du plugin :

```bash
.venv/bin/python -m python.odoo_connector.server
```

Pour le faire démarrer automatiquement avec OpenClaw, ajoutez-le à votre `docker-compose.yml` (voir [Docker Compose](#docker-compose)).

### 5. Configurer vos profils Odoo

Une fois le plugin chargé dans OpenClaw, ouvrez la page de paramètres du plugin :

```
https://<votre-openclaw>/plugin/odoo/settings
```

Vous y trouverez trois onglets :

- **Profils de connexion** — URL, base de données, login, mot de passe de chaque instance Odoo
- **Profils d'accès** — paramètres de confirmation par défaut, rattachés à un profil de connexion
- **Droits d'accès** — règles allow/deny par modèle et par champ (deny-by-default)

Les données sont stockées dans `/data/odoo-plugin/profiles.json` (volume Docker persistant).

---

## Docker Compose

Pour que le service Python démarre automatiquement, ajoutez un service dans votre `docker-compose.yml` :

```yaml
services:
  openclaw:
    image: ghcr.io/hostinger/hvps-openclaw:latest
    # ... votre config existante ...
    environment:
      - ODOO_SERVICE_URL=http://odoo-service:8765

  odoo-service:
    image: python:3.13-slim
    working_dir: /plugin
    volumes:
      - ./data/.openclaw/workspace/omocp-agents:/plugin
      - ./data:/data
    command: >
      sh -c "pip install -r requirements.txt &&
             python -m python.odoo_connector.server"
    environment:
      - ODOO_PLUGIN_DATA_DIR=/data
    restart: unless-stopped
```

Si vous préférez rester sur un seul container, lancez le service Python en arrière-plan dans votre entrypoint ou via un gestionnaire de processus.

---

## Variables d'environnement

| Variable | Défaut | Description |
|---|---|---|
| `ODOO_SERVICE_URL` | `http://localhost:8765` | URL du service Python HTTP |
| `ODOO_PLUGIN_DATA_DIR` | `/data` | Dossier de stockage des profils |
| `PYTHON` | _(auto)_ | Chemin explicite vers l'interpréteur Python |

---

## Configuration OpenClaw

Les paramètres globaux restent dans l'interface Configuration d'OpenClaw (onglet plugin) :

| Paramètre | Défaut | Description |
|---|---|---|
| `active_connection_profile_id` | `default` | Profil de connexion utilisé par défaut |
| `active_access_profile_id` | `readonly` | Profil d'accès utilisé par défaut |
| `default_limit` | `25` | Nombre max d'enregistrements retournés par `odoo_read` |
| `read_only` | `true` | Si activé, bloque toutes les écritures globalement |

Les profils de connexion, profils d'accès et règles de droits sont gérés exclusivement depuis `/plugin/odoo/settings`.

---

## Outils disponibles

Le plugin expose quatre outils à l'IA :

| Outil | Opération |
|---|---|
| `odoo_read` | Lire des enregistrements |
| `odoo_create` | Créer un enregistrement |
| `odoo_update` | Modifier un enregistrement |
| `odoo_delete` | Supprimer un enregistrement |

Chaque appel accepte un `profile` avec `connection_profile_id` et optionnellement `access_profile_id`.

---

## Modèle de sécurité

- **Deny-by-default** : aucun accès si aucune règle ne correspond
- **Évaluation par triplet** `(model, field, operation)` avant tout appel Odoo
- **Confirmation configurable** : les opérations d'écriture peuvent exiger une confirmation explicite
- **Secrets isolés** : le mot de passe ne transite jamais dans les réponses des outils
- **Transport séparé** : `OdooClient` ne prend aucune décision d'autorisation

---

## Security note: child_process

OpenClaw's static security scanner blocks plugins that import `child_process`, regardless of how it's used. This is a blanket policy for the plugin marketplace.

**Previous architecture** (blocked): The Node.js plugin spawned a Python subprocess per call via `child_process.spawn`. This triggered the scanner.

**Current architecture** (clean): The Node.js plugin calls a local Python HTTP service via `fetch()`. No `child_process` import. The Python service runs as a separate process managed by Docker Compose or your process manager.

If you are running an older version of this plugin that still uses the subprocess architecture, you can bypass the scanner with:

```bash
openclaw plugins install -l /path/to/plugin --dangerously-force-unsafe-install
```

This flag is safe on a self-hosted instance where you control the plugin code, but should not be used for third-party plugins you have not reviewed.

---

## Stockage des données

| Fichier | Contenu |
|---|---|
| `/data/odoo-plugin/profiles.json` | Profils de connexion, profils d'accès, règles de droits |

Ce fichier est créé automatiquement au premier enregistrement depuis l'interface settings. Il est lisible et modifiable manuellement si besoin.

---

## Backend Python — structure

```
python/odoo_connector/
  server.py              ← Service HTTP FastAPI (point d'entrée)
  cli.py                 ← Interface stdin/stdout (legacy, conservé)
  action_executor.py     ← Orchestrateur principal
  connection_profiles.py ← Gestion des profils de connexion
  access_profiles.py     ← Gestion des profils d'accès
  permission_rules.py    ← Moteur de règles deny-by-default
  odoo_client.py         ← Transport JSONRPC Odoo (sans logique d'autorisation)
  secret_service.py      ← Résolution des secrets (env / keyring)
  snapshot_store.py      ← Sauvegarde d'état pré-écriture
  action_log.py          ← Journal des actions
  rollback_service.py    ← Interface de rollback (métadonnées disponibles)
  templates.py           ← Templates de création réutilisables
  validators.py          ← Validation des payloads
  errors.py              ← Erreurs structurées
```

---

## Rollback

- `create` : `FULLY_REVERSIBLE` (intention)
- `write` : `FULLY_REVERSIBLE` (intention)
- `delete` : `NOT_REVERSIBLE`

L'exécution du rollback est stubée dans cette version. Les métadonnées et snapshots sont disponibles mais aucune écriture compensatrice n'est exécutée.

---

## Tests

```bash
python -m pytest tests/
```

Couverture : validateurs, moteur de permissions, flux `create_task`, enrichissement de snapshots, métadonnées de rollback.
