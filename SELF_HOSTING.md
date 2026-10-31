# Self-hosting (no Supabase)

The board no longer depends on Supabase. It uses:

| Piece    | Now                                                       |
|----------|-----------------------------------------------------------|
| Database | Postgres (`db/schema.sql`, `db/docker-compose.yml`)       |
| Login    | Email + password, and Google sign-in (optional)           |
| Accounts | Created by an admin from `/dashboard`, no public sign-up  |
| Files    | Saved on disk in `STORAGE_DIR`, served from `/api/storage/...` |

Components still call `createClient().from(...)`, `.auth` and `.storage`. Those
now go through `lib/supabase/client.ts` → `/api/db`, which runs the query in
Postgres and **forces every query to the signed-in user's own rows**
(`lib/db/execute.ts`, replacing Supabase RLS).

## Deploy

```bash
# 1. Database
cd db && POSTGRES_PASSWORD='<strong password>' docker compose up -d && cd ..

# 2. Config
cp .env.example .env.local      # then fill it in
#   DATABASE_URL=postgres://seesaw:<password>@127.0.0.1:5433/seesaw
#   AUTH_SECRET=$(openssl rand -hex 32)

# 3. Build and run
npm ci && npm run build
PORT=8477 pm2 start npm --name seesaw-board -- start && pm2 save

# 4. First admin
node scripts/create-user.mjs you@example.com 'StrongPassword' --admin
```

Then sign in and add everyone else from **/dashboard**. Leave the password
empty for someone who will only use Google.

## Google sign-in (optional)

Google Cloud Console → APIs & Services → Credentials → *Create OAuth client ID*
(Web application). Authorized redirect URI: `https://<your-domain>/auth/callback`.
Put the ID and secret in `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and
restart. Only emails an admin already added can sign in.

## Backups

```bash
docker exec seesaw-db pg_dump -U seesaw seesaw | gzip > seesaw-$(date +%F).sql.gz
tar czf seesaw-files-$(date +%F).tgz -C "$STORAGE_DIR" .
```
