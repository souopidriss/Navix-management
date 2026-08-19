# Navix Management — Backend API

Backend REST API pour la plateforme SaaS de gestion de flotte de véhicules.

## Technologies

- **Runtime** : Node.js (>= 18)
- **Framework** : Express.js 4
- **Database** : MySQL 5.7+ (mysql2/promise)
- **Validation** : Zod
- **Identifiants** : ULID (26 caractères, triés temporellement)
- **Passwords** : bcrypt
- **Auth** : JWT (access + refresh tokens), jsonwebtoken
- **Email** : nodemailer
- **Logs** : Winston
- **Security** : Helmet, CORS, Rate Limiting

## Prerequis MySQL

- MySQL 5.7+ (XAMPP compatible)
- Charset : `utf8mb4`
- Collation : `utf8mb4_unicode_ci`
- SQL Mode : `STRICT_TRANS_TABLES` (recommandé)

## Installation

```bash
cd backend
cp .env.example .env
# Configurer les variables d'environnement dans .env
npm install
```

## Variables d'environnement

| Variable | Description | Défaut |
|---|---|---|
| `NODE_ENV` | Environnement | `development` |
| `PORT` | Port du serveur | `8000` |
| `API_PREFIX` | Préfixe API | `/api/v1` |
| `DB_HOST` | Hôte MySQL | `localhost` |
| `DB_PORT` | Port MySQL | `3306` |
| `DB_NAME` | Nom de la base | `navix_management` |
| `DB_USER` | Utilisateur MySQL | `root` |
| `DB_PASSWORD` | Mot de passe MySQL | ` ` |
| `DB_CONNECTION_LIMIT` | Pool connections | `10` |
| `JWT_ACCESS_SECRET` | Secret access token | requis en prod |
| `JWT_ACCESS_EXPIRES_IN` | Durée access token | `15m` |
| `JWT_REFRESH_SECRET` | Secret refresh token | requis en prod |
| `JWT_REFRESH_EXPIRES_IN` | Durée refresh token | `7d` |
| `BCRYPT_ROUNDS` | Rounds bcrypt | `10` |
| `MAX_LOGIN_ATTEMPTS` | Tentatives avant lockout | `5` |
| `LOCKOUT_DURATION_MINUTES` | Durée lockout | `15` |
| `PASSWORD_RESET_TOKEN_EXPIRES_MINUTES` | Expiration reset | `15` |
| `SMTP_HOST` | Hôte SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Port SMTP | `587` |
| `SMTP_SECURE` | TLS | `false` |
| `SMTP_USER` | Utilisateur SMTP | requis pour emails |
| `SMTP_PASS` | Mot de passe SMTP | requis pour emails |
| `SMTP_FROM` | Adresse expéditeur | `Navix Management <noreply@navix.app>` |
| `CORS_ORIGIN` | Origin autorisée | `http://localhost:5173` |
| `UPLOADS_DIR` | Dossier uploads | `./uploads` |
| `MAX_FILE_SIZE` | Taille max fichier | `10485760` (10MB) |
| `LOG_LEVEL` | Niveau de log | `debug` |

## Commandes Database

```bash
npm run db:migrate          # Exécuter les migrations en attente
npm run db:migrate:status   # Voir l'état des migrations
npm run db:rollback         # Annuler la dernière migration
npm run db:rollback -- 3    # Annuler les 3 dernières migrations
npm run db:seed             # Exécuter les seeds
npm run db:reset            # Reset complet (rollback + migrate + seed) — DEV uniquement
```

## Architecture

```
backend/
├── src/
│   ├── config/                  # Configuration centralisée
│   ├── database/
│   │   ├── index.js             # Pool, query, queryOne, transaction
│   │   ├── dbErrors.js          # Mapping erreurs MySQL
│   │   ├── migrations/          # 31 fichiers SQL de migration
│   │   ├── seeds/               # Fichiers de seed (reference_data)
│   │   └── scripts/             # CLI migrate, rollback, seed, reset
│   ├── middlewares/
│   │   ├── authenticate.js      # requireAuth — JWT + user load
│   │   ├── requireRole.js       # requireRole(...codes)
│   │   ├── requirePermission.js # requirePermission(...perms) + wildcard *
│   │   ├── tenantScope.js       # tenantScope — super_admin = global
│   │   ├── validate.js          # Zod schema validation
│   │   ├── errorHandler.js      # Gestion erreurs centralisée
│   │   ├── notFoundHandler.js   # 404 handler
│   │   ├── requestId.js         # X-Request-Id (UUID)
│   │   └── requestLogger.js     # Winston request logging
│   ├── modules/
│   │   ├── health/              # GET /health
│   │   └── auth/                # Authentication complète
│   │       ├── auth.schema.js
│   │       ├── auth.controller.js
│   │       └── auth.routes.js
│   ├── repositories/
│   │   ├── BaseRepository.js    # CRUD générique + pagination + filtering
│   │   ├── UserRepository.js
│   │   ├── RoleRepository.js
│   │   ├── PermissionRepository.js
│   │   ├── CompanyRepository.js
│   │   └── AuthSessionRepository.js
│   ├── services/
│   │   ├── password.service.js  # Hash, compare, validate policy
│   │   ├── token.service.js     # Generate, verify, decode JWT
│   │   ├── session.service.js   # Create, validate, revoke, rotate sessions
│   │   └── auth.service.js      # Login, register, logout, refresh, me, etc.
│   ├── routes/                  # Routeur API principal
│   ├── errors/                  # 8 classes d'erreurs custom
│   ├── utils/                   # ULID, validation, response
│   ├── constants/               # HTTP, errors, rôles (12)
│   ├── logs/                    # Winston logger
│   ├── app.js                   # Express app
│   └── server.js                # Démarrage serveur
├── tests/
│   ├── health.test.js           # Health + 404 + root + requestId
│   ├── unit/
│   │   ├── password.test.js     # Hash, compare, validatePolicy
│   │   └── token.test.js        # Generate, verify, decode, expiration
│   └── integration/
│       ├── auth.test.js         # 15 tests : register, login, me, refresh, etc.
│       └── rbac.test.js         # 6 tests : role, permission, tenant isolation
├── .env.example
├── package.json
└── eslint.config.js
```

## Authentication

### Endpoints

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Inscription (3 rôles publics) | Non |
| `POST` | `/api/v1/auth/login` | Connexion | Non |
| `POST` | `/api/v1/auth/logout` | Déconnexion (session courante) | Oui |
| `POST` | `/api/v1/auth/logout-all` | Déconnexion (toutes sessions) | Oui |
| `POST` | `/api/v1/auth/refresh` | Renouvellement access token | Non (refresh token) |
| `GET` | `/api/v1/auth/me` | Profil utilisateur courant | Oui |
| `POST` | `/api/v1/auth/change-password` | Changement de mot de passe | Oui |
| `POST` | `/api/v1/auth/forgot-password` | Demande reset (email) | Non |
| `POST` | `/api/v1/auth/reset-password` | Reset mot de passe (token) | Non |

### Token Strategy

- **Access Token** : JWT signé, durée configurable (`15m` par défaut)
  - Payload : `{ sub, role, companyId?, iat, exp }`
  - Secret : `JWT_ACCESS_SECRET`
- **Refresh Token** : JWT signé (`7d` par défaut) + hash bcrypt stocké en DB
  - Payload : `{ sub, type: 'refresh', iat, exp }`
  - Secret : `JWT_REFRESH_SECRET`
  - Stocké hashé (bcrypt, 10 rounds) dans `auth_sessions`
  - Rotation à chaque refresh : ancienne session révoquée, nouvelle créée
- **Séparation des secrets** : `JWT_ACCESS_SECRET` et `JWT_REFRESH_SECRET` distincts
- **Password reset** : token stocké hashé dans `users.refresh_token_hash`, expirant (15min)

### Registration Flows

Le endpoint `/auth/register` accepte 3 rôles publics :
- `client_enterprise` : Crée company + user
- `driver` : Crée user avec rôle driver
- `partner` : Crée user avec rôle partenaire

Le rôle `super_admin` n'est **jamais** accepté via l'inscription publique.
Le slug company est généré avec suffixe `Date.now().toString(36)` pour éviter les collisions.

### Refresh Flow

1. Client envoie refresh token à `POST /auth/refresh`
2. Service valide le token (signature + existence en DB)
3. Ancienne session révoquée
4. Nouvelle paire de tokens générée (access + refresh)
5. Nouveau refresh token stocké hashé en DB
6. Nouveaux tokens retournés au client

### Logout

- `POST /auth/logout` : Révoque la session identifiée par le refresh token
- `POST /auth/logout-all` : Révoque **toutes** les sessions de l'utilisateur

## RBAC (Role-Based Access Control)

### Rôles

12 rôles disponibles, chacun avec un code unique :

| Code | Niveau | Description |
|---|---|---|
| `super_admin` | Global | Accès complet (pas de company_id) |
| `company_owner` | Company | Propriétaire de l'entreprise |
| `company_admin` | Company | Administrateur entreprise |
| `fleet_manager` | Company | Gestionnaire de flotte |
| `dispatcher` | Company | Dispatcheur |
| `driver` | Company | Chauffeur |
| `mechanic` | Company | Mécanicien |
| `accountant` | Company | Comptable |
| `viewer` | Company | Lecteur seule |
| `client_enterprise` | Company | Client entreprise |
| `client_individual` | Company | Client individuel |
| `partner` | Company | Partenaire |

### Permissions

Format : `module.action` (ex: `vehicles.read`, `trips.update`)
- Stockées dans la table `permissions`
- Assignées aux rôles via `role_permissions`
- Super admin reçoit le wildcard `*` (toutes permissions)
- Vérifiées en middleware avec support wildcard

### Middlewares d'autorisation

```javascript
// Authentification obligatoire
app.use('/api/v1/protected', requireAuth, handler);

// Vérification de rôle
app.use('/api/v1/admin', requireAuth, requireRole('super_admin', 'company_admin'), handler);

// Vérification de permission
app.use('/api/v1/vehicles', requireAuth, requirePermission('vehicles.read'), handler);

// Isolation multi-tenant
app.use('/api/v1/company', requireAuth, tenantScope, handler);
```

### Tenant Isolation

- `super_admin` : Accès global (pas de filtre `company_id`)
- Tous les autres rôles : `company_id` imposé automatiquement par `tenantScope`
- Le `company_id` n'est **jamais** trusté depuis le frontend — toujours dérivé de l'utilisateur authentifié

## Conventions Database

### Identifiants
- **ULID** comme identifiant principal (CHAR(26))
- Génération côté application

### Timestamps
- `created_at` : TIMESTAMP, DEFAULT CURRENT_TIMESTAMP
- `updated_at` : TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP
- `deleted_at` : TIMESTAMP NULL (soft delete)
- Stockage en UTC

### Soft Delete
- Utilisé pour : users, companies, vehicles, drivers, etc.
- Pas pour : audit_logs, transactions financières, auth_sessions

### Multi-Tenant
- Clé de séparation : `company_id`
- Index composite : `(company_id, ...)`
- Le backend détermine le tenant depuis l'utilisateur authentifié

### Sécurité SQL
- Prepared statements uniquement (`pool.execute()`)
- Aucune concaténation de valeurs utilisateur
- Allowlist pour le tri (champs autorisés)
- Mapping des erreurs MySQL vers erreurs applicatives

## Backup / Restore

```bash
# Backup
mysqldump -u root -p navix_management > backup_$(date +%Y%m%d).sql

# Restore
mysql -u root -p navix_management < backup.sql
```

## Tests

```bash
# Tous les tests
node --test tests/unit/*.test.js tests/integration/*.test.js tests/health.test.js

# Unit only
node --test tests/unit/password.test.js tests/unit/token.test.js

# Integration only
node --test tests/integration/auth.test.js tests/integration/rbac.test.js
```

**48 tests au total** : 23 unit + 4 health + 15 auth integration + 6 RBAC

## Lint

```bash
npx eslint .
```

## Production

```bash
npm start
```
