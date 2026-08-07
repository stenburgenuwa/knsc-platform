// Authentication Constants

export const AUTH_CONSTANTS = {
  // Password Policy
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBER: true,
  PASSWORD_REQUIRE_SPECIAL_CHAR: true,
  
  // Account Lockout
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 30,
  
  // Token Expiration
  ACCESS_TOKEN_EXPIRY_MINUTES: 15,
  REFRESH_TOKEN_EXPIRY_DAYS: 7,
  PASSWORD_RESET_TOKEN_EXPIRY_HOURS: 24,
  EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS: 48,
  
  // Session Management
  SESSION_TIMEOUT_MINUTES: 30,
  REMEMBER_ME_DURATION_DAYS: 30,
  
  // Error Messages
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account is locked. Please try again later or contact support.',
  ACCOUNT_INACTIVE: 'Account is inactive',
  ACCOUNT_SUSPENDED: 'Account is suspended',
  ACCOUNT_NOT_FOUND: 'Account not found',
  PASSWORD_MISMATCH: 'Current password is incorrect',
  PASSWORD_REQUIREMENT_NOT_MET: 'Password does not meet complexity requirements',
  EMAIL_NOT_VERIFIED: 'Email verification required',
  PHONE_NOT_VERIFIED: 'Phone verification required',
  SESSION_EXPIRED: 'Session has expired. Please log in again.',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden: insufficient permissions',
  
  // Role Names
  ROLES: {
    PLATFORM_OWNER: 'Platform Owner',
    LEAGUE_MANAGER: 'League Manager',
    REFEREE_MANAGER: 'Referee Manager',
    TEAM_MANAGER: 'Team Manager',
    REFEREE: 'Referee',
    PUBLIC: 'Public',
  },
  
  // Dashboard Routes
  DASHBOARD_ROUTES: {
    'Platform Owner': '/dashboard/platform',
    'League Manager': '/dashboard/league',
    'Referee Manager': '/dashboard/referee',
    'Team Manager': '/dashboard/team',
    'Referee': '/dashboard/match',
  },
};

export const PERMISSIONS = {
  // Authentication
  'auth:login': 'Can log in',
  'auth:logout': 'Can log out',
  'auth:refresh': 'Can refresh tokens',
  'auth:change_password': 'Can change password',
  'auth:reset_password': 'Can reset password',
  
  // User Management
  'user:create': 'Can create users',
  'user:read': 'Can read user details',
  'user:update': 'Can update users',
  'user:delete': 'Can delete users',
  'user:lock': 'Can lock users',
  'user:unlock': 'Can unlock users',
  
  // League Management
  'league:manage': 'Can manage leagues',
  'league:view': 'Can view leagues',
  'league:create': 'Can create leagues',
  'league:edit': 'Can edit leagues',
  'league:delete': 'Can delete leagues',
  
  // Referee Management
  'referee:manage': 'Can manage referees',
  'referee:assign': 'Can assign referees',
  'referee:evaluate': 'Can evaluate referees',
  'referee:pay': 'Can process referee payments',
  
  // Club Management
  'club:manage': 'Can manage clubs',
  'club:register': 'Can register clubs',
  'club:view': 'Can view club details',
  'club:edit': 'Can edit club details',
  
  // Player Management
  'player:register': 'Can register players',
  'player:manage': 'Can manage players',
  'player:view': 'Can view player details',
  'player:approve': 'Can approve player registrations',
  
  // Fixture Management
  'fixture:manage': 'Can manage fixtures',
  'fixture:create': 'Can create fixtures',
  'fixture:view': 'Can view fixtures',
  'fixture:edit': 'Can edit fixtures',
  
  // Match Operations
  'match:report': 'Can submit match reports',
  'match:view': 'Can view match details',
  'match:approve': 'Can approve match reports',
  
  // System Administration
  'system:admin': 'System Administrator',
  'system:audit': 'Can view audit logs',
  'system:settings': 'Can manage system settings',
};
