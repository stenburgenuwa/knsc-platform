// Authentication & Authorization Types
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  isLocked: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  expiresIn: number;
  redirectUrl: string;
}

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AccountStatus {
  isActive: boolean;
  isLocked: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lockedUntil?: Date;
  failedLoginAttempts: number;
  lastLoginAt?: Date;
}

export interface SessionData {
  sessionId: string;
  userId: string;
  deviceName?: string;
  browser?: string;
  operatingSystem?: string;
  ipAddress?: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface AuditLogEntry {
  userId?: string;
  module: string;
  action: string;
  entityType: string;
  entityId?: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
