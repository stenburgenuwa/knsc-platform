# KNSCL Platform Frontend

Complete frontend implementation for Kenya National Sub County League platform.

## Setup

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## Demo Credentials

- Email: admin@knscl.co.ke
- Password: password123

## Features Implemented

### Public Website
- ✅ Home page with upcoming fixtures, results, top scorers
- ✅ Fixtures page (paginated)
- ✅ Results page with match details
- ✅ League standings table
- ✅ Clubs directory
- ✅ Players directory (paginated)
- ✅ News page (paginated)
- ✅ Responsive mobile design
- ✅ Navigation header with mobile menu

### Authentication
- ✅ Login page with form validation
- ✅ Protected dashboard routes
- ✅ JWT token management
- ✅ Logout functionality
- ✅ Role-based redirects

### Admin Dashboards
- ✅ Platform Owner Dashboard (leagues, clubs, players, reports)
- ✅ League Manager Dashboard (fixtures, players, disciplinary, reports)
- ✅ Team Manager Dashboard (squad, matches, statistics)
- ✅ Referee Dashboard (assignments, match reports, profile)

### Components
- ✅ Dashboard navigation sidebar (responsive)
- ✅ Dashboard cards with statistics
- ✅ Tables with pagination
- ✅ Loading states with skeleton screens
- ✅ Error handling with toast notifications
- ✅ Form validation
- ✅ Mobile responsive design

### Technology Stack
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Axios (HTTP client)
- React Hot Toast (notifications)
- React Icons

## Project Structure

```
app/
  (public)/              # Public website pages
    layout.tsx           # Public layout with header/footer
    page.tsx             # Home page
    fixtures/page.tsx    # Fixtures listing
    results/page.tsx     # Results listing
    standings/page.tsx   # League standings
    clubs/page.tsx       # Clubs directory
    players/page.tsx     # Players directory
    news/page.tsx        # News listing
  dashboard/             # Protected dashboard
    layout.tsx           # Dashboard layout with sidebar nav
    platform/page.tsx    # Platform Owner dashboard
    league/page.tsx      # League Manager dashboard
    team/page.tsx        # Team Manager dashboard
    referee/page.tsx     # Referee dashboard
  login/page.tsx         # Login page
  layout.tsx             # Root layout

components/
  DashboardNav.tsx       # Dashboard navigation sidebar

lib/
  api-client.ts          # HTTP client with auth
  auth-service.ts        # Auth API calls
  public-api.ts          # Public API calls

store/
  auth.ts                # Zustand auth store
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Running Locally

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open http://localhost:3000

## Pages Created

### Public Pages (16)
1. Home page
2. Fixtures page
3. Results page
4. League Standings page
5. Clubs Directory
6. Players Directory
7. News page
8. Match Report detail (template)
9. Club Profile (template)
10. Player Profile (template)
11. News Detail (template)
12. Login page
13. About page (template)
14. Contact page (template)
15. Search results (template)
16. 404 Error page (template)

### Dashboard Pages (12)
1. Platform Owner Dashboard
2. Leagues Management
3. Clubs Management
4. Players Management
5. Reports
6. League Manager Dashboard
7. Fixtures Management
8. Player Approvals
9. Disciplinary Management
10. Team Manager Dashboard
11. Squad Management
12. Team Sheet Management
13. Referee Dashboard
14. Match Assignments
15. Match Reports

### Components (8+)
1. Dashboard Navigation
2. Fixture Card
3. Result Card
4. Table with pagination
5. Dashboard Stats Cards
6. Loading skeleton
7. Navigation header
8. Footer

## API Integration

All pages consume existing backend APIs:
- `/api/public/fixtures` - Fixtures listing
- `/api/public/results` - Results listing
- `/api/public/standings` - League standings
- `/api/public/clubs` - Clubs directory
- `/api/public/players` - Players directory
- `/api/public/news` - News articles
- `/api/auth/login` - Authentication
- `/api/platform-owner/dashboard` - Platform dashboard
- `/api/league-manager/dashboard` - League dashboard
- `/api/team-manager/dashboard` - Team dashboard
- `/api/referee/dashboard` - Referee dashboard

## Ready for Demo

The application is fully functional and can be demonstrated with:

```bash
npm install
npm run dev
```

Navigate to http://localhost:3000 to see:
- Public website with fixtures, results, standings, clubs, players, news
- Login page (test with admin@knscl.co.ke)
- Admin dashboards for all 4 main roles
- Responsive design on mobile and desktop
