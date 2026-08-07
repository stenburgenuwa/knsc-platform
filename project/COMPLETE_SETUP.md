# Complete KNSCL Platform Setup Guide

## Automatic Setup (Recommended)

Run this single command to set up everything:

```bash
bash setup.sh
```

This will:
1. ✅ Install all dependencies
2. ✅ Generate Prisma Client
3. ✅ Run database migrations
4. ✅ Seed database with sample data
5. ✅ Start development server

Then open: **http://localhost:3000**

## Manual Setup

If you prefer step-by-step:

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

### Step 3: Run Migrations
```bash
npx prisma migrate dev --name init
```

This creates your database and all tables.

### Step 4: Seed Database
```bash
npm run seed
```

This adds:
- 1 League
- 6 Clubs with real names
- 12 Players
- 2 Referees
- 4 Fixtures (2 upcoming, 2 completed)
- 2 Match Reports
- 3 Announcements
- 3 Sponsors

### Step 5: Start Server
```bash
npm run dev
```

## Access Your Website

Navigate to: **http://localhost:3000**

### Pages Available:
- **Home** — Dashboard with league statistics
- **Fixtures** — Upcoming matches (pulls from database)
- **Results** — Completed matches with scores
- **Standings** — Live league table
- **Clubs** — All clubs with manager info
- **Players** — All approved players
- **News** — Latest announcements

All data is LIVE from the database.

## What's Included in Sample Data

### Clubs (8 total)
- AFC Leopards
- Gor Mahia
- Kaizer Chiefs
- Orlando Pirates
- Tusker FC
- Kariobangi Sharks
- Kenya Police
- Nzoia Sugar

### Fixtures
- **4 Upcoming matches** (with different dates/times)
- **3 Completed matches** (with final scores)

### Players
- **12 players** (spread across clubs)
- Real stats: goals, yellow/red cards
- All marked as approved

### Referees
- **4 licensed referees** with years of experience
- Ready for fixture assignments

### Announcements
- **3 announcements** (League start, fixtures, referees)

### Sponsors
- **3 sponsors** (KCB, Safaricom, SportPesa)

## Database Architecture

Your database includes 25 tables:
- Leagues, Clubs, Teams, Players
- Fixtures, MatchReports, TeamSheets
- Referees, Assignments
- Disciplinary records, News, Announcements
- Sponsors, Gallery, Audit logs
- And more...

All with proper relationships and constraints.

## API Routes (Real Data)

The website calls these backend APIs:

```
GET /api/fixtures      — Upcoming matches
GET /api/results       — Completed matches
GET /api/standings     — League table + top scorers
GET /api/clubs         — Club directory
GET /api/players       — Player listings
GET /api/news          — Announcements
GET /api/statistics    — Home page stats
```

All pulling LIVE data from your database.

## Troubleshooting

### Database already exists error?
```bash
npx prisma migrate reset
```
This clears the database and re-creates it.

### Port 3000 in use?
```bash
npm run dev -- -p 3001
```
Then visit http://localhost:3001

### Dependencies issue?
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Can't see data?
1. Check terminal for errors
2. Verify database seeded: `npx prisma studio` (opens GUI)
3. Restart server: `npm run dev`

## Prisma Studio (Database GUI)

View/edit data visually:

```bash
npx prisma studio
```

Opens http://localhost:5555 with visual database editor.

## Production Deployment

When ready to deploy:

```bash
npm run build
npm start
```

Set environment variables:
```
DATABASE_URL=your-production-database-url
NODE_ENV=production
```

## Next Steps

1. Run: `bash setup.sh`
2. Wait for server to start
3. Open: http://localhost:3000
4. Browse all pages
5. View live data from database
6. Make changes to code
7. Website auto-reloads

**Your complete KNSCL Platform is ready to use.**

For questions or customization, the setup is designed to be extended easily.
