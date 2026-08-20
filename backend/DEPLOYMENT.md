# DEPLOYMENT — Navix Management API

## Prerequisites

- Node.js >= 18.0.0 (LTS recommended)
- MySQL 8.0+ (XAMPP for dev, managed instance for prod)
- npm or compatible package manager
- Docker & Docker Compose (optional, for containerized deployment)

## 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Required (production)

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Must be `production` | `production` |
| `DB_HOST` | MySQL hostname | `db.example.com` |
| `DB_NAME` | Database name | `navix_management` |
| `DB_USER` | Database user | `navix_user` |
| `DB_PASSWORD` | Database password | (secret) |
| `JWT_ACCESS_SECRET` | Min 32 characters | (secret) |
| `JWT_REFRESH_SECRET` | Min 32 characters | (secret) |
| `CORS_ORIGIN` | Frontend URL(s) | `https://app.navix.app` |

### Optional

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8000` | Server port |
| `DB_PORT` | `3306` | MySQL port |
| `DB_CONNECTION_LIMIT` | `20` | Pool size |
| `LOG_LEVEL` | `info` | Log level (debug/info/warn/error) |
| `RATE_LIMIT_MAX` | `100` | Requests per window |
| `SMTP_HOST` | `smtp.gmail.com` | Email host |

See `.env.example` for the full list.

## 2. Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE navix_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations
npm run db:migrate

# Check migration status
npm run db:migrate:status

# Seed reference data (roles, permissions, plans)
npm run db:seed
```

**Never run `db:reset` in production.**

## 3. Build

No build step required (ESM, no TypeScript).

Verify dependencies:

```bash
npm ci --omit=dev
```

## 4. Start

```bash
# Production
NODE_ENV=production node src/server.js

# Or using npm
npm start
```

## 5. Health Check

```bash
curl http://localhost:8000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "api": "up",
  "database": "up",
  "version": "1.0.0",
  "uptime": "120s"
}
```

Readiness check:

```bash
curl http://localhost:8000/api/v1/ready
```

## 6. Docker Deployment

```bash
# Build and start
docker compose up -d --build

# View logs
docker compose logs -f api

# Run migrations inside container
docker compose exec api node src/database/scripts/cli.js migrate

# Stop
docker compose down
```

## 7. Logs

Logs are output to stdout (structured JSON in production).

In production, log files are written to `logs/`:

- `logs/error.log` — errors only (5MB rotation, 5 files max)
- `logs/combined.log` — all levels (5MB rotation, 5 files max)

## 8. Rollback

```bash
# Rollback last migration
npm run db:rollback

# Rollback multiple
node src/database/scripts/cli.js rollback 3
```

**Never rollback in production without a data safety plan.**

## 9. Production Checklist

- [ ] `NODE_ENV=production`
- [ ] JWT secrets >= 32 characters, unique per environment
- [ ] `DB_PASSWORD` set, not empty
- [ ] `CORS_ORIGIN` set to frontend domain(s), not `*`
- [ ] `LOG_LEVEL=info` (not debug)
- [ ] Database migrations applied
- [ ] Reference data seeded (roles, permissions)
- [ ] `uploads/` directory writable by app process
- [ ] `logs/` directory writable by app process
- [ ] Health endpoint responding
- [ ] HTTPS configured (reverse proxy / load balancer)
- [ ] Rate limiting active
- [ ] No secrets in Git repository

## 10. Disaster Recovery

Components to restore:

1. **Database** — restore from MySQL backup
2. **Environment variables** — reconfigure from `.env`
3. **Uploaded files** — restore from `uploads/` volume
4. **Migrations** — re-run `npm run db:migrate`

## 11. Rollback Strategy

1. Stop the new deployment
2. Restore database to pre-deployment backup if needed
3. Redeploy the previous version
4. Verify health endpoint
