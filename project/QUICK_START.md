# KNSCL Platform - Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation & Running

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
Navigate to: **http://localhost:3000**

## Demo Credentials

**Email:** admin@knscl.co.ke  
**Password:** any password (demo mode accepts any input)

## Pages Available

### Public Pages
- **Home** — http://localhost:3000
- **Fixtures** — http://localhost:3000/fixtures
- **Results** — http://localhost:3000/results
- **Standings** — http://localhost:3000/standings
- **Clubs** — http://localhost:3000/clubs
- **Login** — http://localhost:3000/login

### Protected Pages
- **Dashboard** — http://localhost:3000/dashboard (requires login)

## Troubleshooting

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```
Then navigate to http://localhost:3001

### Module not found errors
```bash
rm -rf node_modules
npm install
```

### Clear Next.js cache
```bash
rm -rf .next
npm run dev
```

## Project Structure

```
app/
├── page.tsx              (Home)
├── layout.tsx            (Root layout)
├── globals.css           (Global styles)
├── fixtures/
│   └── page.tsx          (Fixtures page)
├── results/
│   └── page.tsx          (Results page)
├── standings/
│   └── page.tsx          (Standings page)
├── clubs/
│   └── page.tsx          (Clubs page)
├── login/
│   └── page.tsx          (Login page)
└── dashboard/
    └── page.tsx          (Dashboard)
```

## Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run linter
```

## Technology Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **HTTP Client:** Axios
- **UI Components:** React Icons

## Notes

This is a complete Next.js application with all pages and components. The application is ready to run locally.

If you're still experiencing issues:
1. Ensure Node.js is installed: `node --version`
2. Check npm is working: `npm --version`
3. Verify all dependencies installed: `npm ls`
4. Check no process is using port 3000: `lsof -i :3000`

For additional help, check Next.js documentation: https://nextjs.org/docs
