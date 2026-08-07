# Component Documentation

## Page Components

### Home Page (`app/page.tsx`)
- Hero section with call-to-action buttons
- Statistics cards (clubs, players, matches)
- Quick links navigation
- Responsive grid layout

**Features:**
- Featured statistics
- Navigation to all pages
- Modern design with gradients
- Mobile responsive

### Fixtures Page (`app/fixtures/page.tsx`)
- List of upcoming matches
- Match details (teams, date, time, venue)
- Pagination support
- Loading states

**Data Structure:**
```typescript
{
  id: number
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  venue: string
}
```

### Results Page (`app/results/page.tsx`)
- List of completed matches
- Final scores displayed
- Match history
- Sortable results

**Data Structure:**
```typescript
{
  id: number
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  date: string
}
```

### Standings Page (`app/standings/page.tsx`)
- Full league table
- Position, wins, draws, losses
- Goals for/against
- Goal difference
- Points column

**Table Columns:**
- Position (#)
- Team name
- Played (P)
- Won (W)
- Drawn (D)
- Lost (L)
- Goals For (GF)
- Goals Against (GA)
- Points (Pts)

### Clubs Page (`app/clubs/page.tsx`)
- Grid of club cards
- Club information (name, location, founded)
- Clickable cards for details

**Data Structure:**
```typescript
{
  id: number
  name: string
  location: string
  founded: number
}
```

### Login Page (`app/login/page.tsx`)
- Email input field
- Password input field
- Submit button
- Form validation
- Demo mode (accepts any input)

**Features:**
- Client-side form handling
- localStorage persistence
- Redirect to dashboard on success
- Error handling

### Dashboard Page (`app/dashboard/page.tsx`)
- Protected route (requires login)
- Welcome message with user email
- Statistics cards
- Quick actions
- Recent activity

**Statistics Displayed:**
- Fixtures count
- Clubs count
- Players count
- Referees count

## Styling System

### Tailwind CSS Classes

**Layout:**
- `max-w-7xl` — Container max-width
- `mx-auto` — Center container
- `px-4`, `py-4` — Padding
- `grid grid-cols-1 md:grid-cols-3` — Responsive grid

**Typography:**
- `text-4xl font-bold` — Large headings
- `text-xl font-bold` — Medium headings
- `text-sm text-gray-600` — Small text

**Colors:**
- `bg-blue-600`, `text-blue-600` — Primary
- `bg-purple-600` — Secondary
- `bg-green-600` — Success
- `bg-red-600` — Danger
- `bg-gray-100` — Light background

**Components:**
- `rounded-lg` — Border radius
- `shadow-md` — Box shadow
- `hover:shadow-lg` — Hover effect
- `transition` — Smooth transitions

## State Management

Uses React hooks for local state:

```typescript
const [email, setEmail] = useState('');
const [fixtures, setFixtures] = useState([]);
const [loading, setLoading] = useState(false);
```

Authentication stored in localStorage:

```typescript
localStorage.setItem('user', JSON.stringify({ email, role }));
const user = JSON.parse(localStorage.getItem('user'));
```

## Navigation

### Internal Links
```typescript
import Link from 'next/link';

<Link href="/fixtures">View Fixtures</Link>
```

### Navigation Structure
```
Home (/)
├── Fixtures (/fixtures)
├── Results (/results)
├── Standings (/standings)
├── Clubs (/clubs)
├── Login (/login)
└── Dashboard (/dashboard)
```

## Forms

### Login Form
```typescript
<form onSubmit={handleSubmit}>
  <input type="email" required />
  <input type="password" required />
  <button type="submit">Login</button>
</form>
```

## Data Tables

### Standings Table
```typescript
<table className="w-full">
  <thead className="bg-gray-100">
    <tr>
      <th>Position</th>
      <th>Team</th>
      <th>P</th>
      <th>W</th>
      <th>D</th>
      <th>L</th>
      <th>GF</th>
      <th>GA</th>
      <th>Pts</th>
    </tr>
  </thead>
  <tbody>
    {/* rows */}
  </tbody>
</table>
```

## Error Handling

All pages include error boundaries and fallback states:

```typescript
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <PageContent />;
```

## Accessibility

- Semantic HTML (nav, main, footer)
- Form labels associated with inputs
- Proper heading hierarchy
- Color contrast compliance
- Keyboard navigation support

## Performance

- Lazy loading via Next.js Image
- Code splitting per route
- CSS optimization
- Minimal JavaScript
- Responsive images

## Mobile Responsive

All components use:
- Mobile-first approach
- Responsive grid: `grid-cols-1 md:grid-cols-3`
- Responsive text: `text-sm md:text-lg`
- Touch-friendly buttons (44px minimum)
- Readable on small screens

## Future Enhancements

- Add data table sorting
- Implement search functionality
- Add filtering options
- Create detailed modals
- Add real-time updates
- Implement dark mode
- Add analytics tracking
