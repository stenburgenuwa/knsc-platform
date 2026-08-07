# KNSCL Platform - Claude Code Integration

## Setup in Claude Code

To run this Next.js application in Claude Code:

### Option 1: Direct Terminal (Recommended)

In Claude Code terminal:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Then open: **http://localhost:3000**

### Option 2: Using Start Script

```bash
chmod +x start.sh
./start.sh
```

### Option 3: Docker

```bash
docker-compose up
```

## What You'll See

When the server starts:
```
  ▲ Next.js 14.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 1.23s
```

Navigate to http://localhost:3000 in your browser.

## Pages Available

- **Home** — http://localhost:3000
- **Fixtures** — http://localhost:3000/fixtures
- **Results** — http://localhost:3000/results
- **Standings** — http://localhost:3000/standings
- **Clubs** — http://localhost:3000/clubs
- **Login** — http://localhost:3000/login
- **Dashboard** — http://localhost:3000/dashboard (after login)

## Troubleshooting in Claude Code

### If port 3000 is busy:
```bash
npm run dev -- -p 3001
```

Then open http://localhost:3001

### Clear cache and reinstall:
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Check Node.js version:
```bash
node --version  # Should be 18+
npm --version
```

## Development Tips

- **Hot reload**: Save files and they auto-reload
- **View console errors**: Check terminal output
- **Browser DevTools**: Press F12 in browser
- **Stop server**: Press Ctrl+C in terminal

## Project Structure

```
app/
├── page.tsx              (Home)
├── layout.tsx            (Root)
├── globals.css           (Styles)
├── fixtures/page.tsx     (Fixtures)
├── results/page.tsx      (Results)
├── standings/page.tsx    (Standings)
├── clubs/page.tsx        (Clubs)
├── login/page.tsx        (Login)
└── dashboard/page.tsx    (Dashboard)

package.json              (Dependencies)
next.config.js            (Config)
tailwind.config.js        (Styles)
tsconfig.json             (TypeScript)
```

## Next.js Commands

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Run linter
```

## Deploy to Production

### Option 1: Vercel (Automatic)
1. Push to GitHub
2. Connect to Vercel
3. Auto-deploys on push

### Option 2: Docker
```bash
docker build -t knscl .
docker run -p 3000:3000 knscl
```

### Option 3: Cloud Hosting
- AWS: Elastic Beanstalk
- Google Cloud: Cloud Run
- Azure: App Service
- Heroku: git push heroku main

## Live Demo

Once running, you can:
1. Visit http://localhost:3000
2. Click through all pages
3. Try login (any email/password)
4. View dashboard
5. Test responsive design (resize browser)

---

**Application is fully built and ready to run in Claude Code.**

**Next step: Run `npm install && npm run dev` in terminal**
