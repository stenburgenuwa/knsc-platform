# Deploying the Kilifi North Sub County League platform

This is the current, accurate deployment guide. **Ignore every other
`*DEPLOYMENT*`, `*SETUP*`, `*OPERATIONS*` `.md` file in this repo** —
they describe an earlier, much larger schema and a set of backend
service modules (under `src/`) that were never actually wired up or
tested, and have since been removed. This app is now a working,
verified Next.js + Postgres application: a public site, real
email/password login, and 5 role-based dashboards (Platform Owner,
League Manager, Team Manager, Referee, Referee Manager), all backed by
one lean Prisma schema (`prisma/schema.prisma`).

## Recommended: Vercel + Neon (or Vercel Postgres)

### 1. Create the database

- [Neon](https://neon.tech) (free tier works fine) or Vercel's own
  Postgres add-on (Storage tab in your Vercel project) — either gives
  you a `DATABASE_URL` connection string.
- Copy that connection string; you'll need it in step 3.

### 2. Push the code and import into Vercel

- Push this repo to GitHub/GitLab/Bitbucket.
- In Vercel: **Add New → Project**, import the repo, and set the
  **Root Directory** to `project/` (this app lives in a subfolder).
- Vercel auto-detects Next.js. Because `package.json` has a
  `vercel-build` script, Vercel will run it instead of the default
  build — it runs `prisma generate && prisma migrate deploy && next build`,
  so your migrations apply automatically on every deploy.

### 3. Set environment variables (Vercel → Project → Settings → Environment Variables)

| Variable | Value |
|---|---|
| `DATABASE_URL` | the connection string from step 1 |
| `JWT_SECRET` | a long random string — `openssl rand -base64 32` |
| `NEXT_PUBLIC_API_URL` | `https://<your-vercel-domain>/api` (update once you know the domain, or use a relative `/api` if you prefer — see note below) |

Set these for both **Production** and **Preview** environments.

> Note on `NEXT_PUBLIC_API_URL`: the app currently calls the API via
> an absolute base URL (`lib/api-client.ts`). Simplest fix once you
> have a domain: set it to `https://yourdomain.com/api`. If you attach
> a custom domain later, update this variable and redeploy.

### 4. Seed initial data (one-time, from your own machine)

Seeding writes directly to the database, so run it locally pointed at
the production `DATABASE_URL` (or run `npx prisma studio` / `psql` to
create your first admin by hand if you'd rather not seed the demo
clubs/fixtures into production):

```bash
cd project
DATABASE_URL="<your production connection string>" SEED_PASSWORD="<a strong password>" npm run seed
```

The seed script refuses to run against a non-localhost `DATABASE_URL`
unless `SEED_PASSWORD` is set — it won't let you accidentally put the
well-known local-dev password (`Password123!`) into production. It
creates 8 demo clubs, 5 demo staff accounts (one per role, all sharing
whatever `SEED_PASSWORD` you set — **change these after first login**,
or edit `prisma/seed.ts` to seed real accounts/passwords instead),
sample fixtures/results, and news.

If you'd rather start from a completely empty database, delete the
seed data step and instead create your first Platform Owner directly
in the `User` table (password must be a bcrypt hash — see
`prisma/seed.ts` for how it's generated).

### 5. Connect your domain

Vercel → Project → Settings → Domains → add your domain, follow the
DNS instructions they give you. Once it's live, update
`NEXT_PUBLIC_API_URL` to match and redeploy.

## Self-hosted via Docker: not ready, don't use as-is

`docker-compose.yml` and `Dockerfile` in this repo predate this
rebuild and target a different architecture entirely — the Dockerfile
runs `node dist/index.js` (a traditional Express-style build output),
but this is a Next.js app with no `dist/` or `index.js`; it also
mounts a Redis container and a `./src` volume that no longer exists.
Building from them as-is will fail. If you want to self-host on a VPS
instead of Vercel, these need to be rewritten for Next.js
(`next build` + `next start`, or a proper multi-stage Next.js
Dockerfile) — that hasn't been done. The `vercel-build`-based flow
above is the one that's actually been tested end-to-end.

## Local development

```bash
cd project
cp .env.example .env   # then fill in DATABASE_URL against your local Postgres
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

Demo logins after seeding (all use password `Password123!`):

| Role | Email |
|---|---|
| Platform Owner | owner@knscl.co.ke |
| League Manager | league.manager@knscl.co.ke |
| Team Manager | team.manager@knscl.co.ke |
| Referee | referee@knscl.co.ke |
| Referee Manager | referee.manager@knscl.co.ke |

## What's intentionally out of scope right now

This is a real, working v1 — not the full 100+ table enterprise system
originally sketched out in the early planning docs. Not included yet:
M-Pesa/payments, SMS/email notifications, disciplinary case tracking,
multi-league/season support, file uploads (club/player photos), and
automated tests. All are addable on top of the current schema without
a rewrite if you need them later.
