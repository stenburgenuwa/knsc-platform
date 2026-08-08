import { redirect } from 'next/navigation';

// The standings moved to /table (the name the navigation and spec use).
// Kept as a permanent redirect so older links and bookmarks still resolve.
export default function StandingsRedirect() {
  redirect('/table');
}
