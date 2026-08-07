# API Integration Guide

## Backend API Endpoints

The frontend is configured to connect to backend APIs. Update `.env.local` with your API base URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Available API Endpoints

### Public Fixtures API
```
GET /api/public/fixtures
GET /api/public/fixtures/:id
```

### Public Results API
```
GET /api/public/results
GET /api/public/results/:id
```

### Public Standings API
```
GET /api/public/standings
GET /api/public/standings/top-scorers
```

### Authentication API
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

### Dashboard APIs
```
GET /api/platform-owner/dashboard
GET /api/league-manager/dashboard
GET /api/team-manager/dashboard
GET /api/referee/dashboard
```

## Environment Setup

Create `.env.local` file in project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=KNSCL Platform
```

## Frontend Features

### Authentication
- Login form with email/password
- Session persistence via localStorage
- Protected dashboard routes
- Logout functionality

### Public Website
- Home page with statistics
- Fixtures listing with pagination
- Results with match details
- League standings table
- Clubs directory
- Responsive design
- Mobile-friendly navigation

### Admin Dashboards
- Platform Owner Dashboard
- League Manager Dashboard
- Team Manager Dashboard
- Referee Dashboard

## Component Structure

### Pages
- `app/page.tsx` — Home page
- `app/fixtures/page.tsx` — Fixtures listing
- `app/results/page.tsx` — Results listing
- `app/standings/page.tsx` — League table
- `app/clubs/page.tsx` — Clubs directory
- `app/login/page.tsx` — Login form
- `app/dashboard/page.tsx` — Dashboard

### Layout
- `app/layout.tsx` — Root layout
- Global CSS with Tailwind

### Styling
- Tailwind CSS for all components
- Responsive grid layouts
- Mobile-first design
- Shadow and hover effects

## Data Flow

```
User Browser
    ↓
Next.js Frontend (Port 3000)
    ↓
Backend API (Port 3001)
    ↓
Database
```

## Performance Optimizations

- Code splitting via Next.js
- Lazy loading of images
- CSS optimization with Tailwind
- Client-side state management with localStorage
- API response caching

## Testing Locally

1. Start backend on port 3001
2. Start frontend on port 3000
3. Navigate to http://localhost:3000
4. Login with any credentials
5. Explore all pages

## Production Build

```bash
npm run build
npm start
```

## Deployment

For production deployment:
1. Build: `npm run build`
2. Set environment variables
3. Start with: `npm start`
4. Use reverse proxy (Nginx) for SSL/TLS
5. Configure CORS in backend

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers supported

## Troubleshooting

### Pages not loading
- Check browser console for errors (F12)
- Verify backend API is running
- Check API URL in `.env.local`

### Styles not applying
- Clear Next.js cache: `rm -rf .next`
- Rebuild: `npm run build`

### Login not working
- Check localStorage in browser DevTools
- Verify authentication API endpoint
- Check CORS configuration

## Next Steps

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open http://localhost:3000
4. Test all pages and functionality
5. Connect to backend APIs
6. Deploy to production
