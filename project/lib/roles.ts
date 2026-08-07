// Single source of truth mapping the Prisma Role enum to the labels the UI
// shows and the dashboard route each role lands on after login.
export const ROLE_LABELS: Record<string, string> = {
  PLATFORM_OWNER: 'Platform Owner',
  LEAGUE_MANAGER: 'League Manager',
  TEAM_MANAGER: 'Team Manager',
  REFEREE: 'Referee',
  REFEREE_MANAGER: 'Referee Manager',
};

export const ROLE_DASHBOARD: Record<string, string> = {
  PLATFORM_OWNER: '/dashboard/platform',
  LEAGUE_MANAGER: '/dashboard/league',
  TEAM_MANAGER: '/dashboard/team',
  REFEREE: '/dashboard/referee',
  REFEREE_MANAGER: '/dashboard/referee-manager',
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] || role;
}

// The client only ever sees the human label (via AuthUser.roles), so the
// dashboard router needs a label-keyed view of the same mapping.
export const DASHBOARD_BY_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(ROLE_LABELS).map(([enumRole, label]) => [label, ROLE_DASHBOARD[enumRole]])
);
