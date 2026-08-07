/**
 * Authentication Implementation Documentation
 */

# Authentication & Authorization Module

## Overview

The KNSCL Platform Authentication Module provides secure user authentication, authorization (RBAC), session management, and audit logging.

## Architecture

### Components

1. **AuthService** - Core authentication logic
   - User login/logout
   - Token management
   - Password reset workflow
   - Session management
   - Account lockout protection

2. **PasswordService** - Password management
   - Secure hashing (PBKDF2 with SHA-256)
   - Password validation
   - Temporary password generation

3. **JwtService** - JWT token handling
   - Access token creation
   - Refresh token creation
   - Token verification and decoding

4. **AuthMiddleware** - Express/Next.js middleware
   - Token verification
   - Permission checking
   - Role-based access control

5. **RbacService** - Role-Based Access Control
   - Permission checking
   - Role assignment/revocation
   - User role management

6. **AuthController** - API endpoints
   - Login/Logout
   - Password management
   - Session management
   - Login history

## Features Implemented

### 1. Authentication
- ✅ Secure login with credentials validation
- ✅ JWT access tokens (15-minute expiry)
- ✅ Refresh tokens (7-day expiry)
- ✅ Session management
- ✅ Account lockout after 5 failed attempts (30-minute lockout)

### 2. Password Management
- ✅ Secure password hashing (PBKDF2)
- ✅ Password complexity validation
  - Minimum 8 characters
  - Uppercase, lowercase, number, special character required
- ✅ Password change with current password verification
- ✅ User-initiated password reset
- ✅ Administrator password reset
- ✅ First login forced password change

### 3. Authorization (RBAC)
- ✅ Role-Based Access Control
- ✅ Permission-based authorization
- ✅ Role expiration support
- ✅ Dynamic permission evaluation

### 4. Session Management
- ✅ Secure session creation
- ✅ Session tracking (device, browser, OS, IP)
- ✅ Session timeout (30 minutes)
- ✅ Remember Me support (30-day cookie)
- ✅ Session termination

### 5. Audit Logging
- ✅ Login success/failure logging
- ✅ Password change auditing
- ✅ Password reset auditing
- ✅ Account lockout logging
- ✅ Session management logging
- ✅ Failed login attempt tracking

### 6. Account Management
- ✅ Account status tracking (Active, Inactive, Suspended, Locked, Archived)
- ✅ Email verification support
- ✅ Phone verification support
- ✅ Login history tracking

## API Endpoints

### Authentication

```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/change-password
POST   /api/auth/password-reset/request
POST   /api/auth/password-reset/confirm
GET    /api/auth/me
GET    /api/auth/sessions
DELETE /api/auth/sessions/:sessionId
GET    /api/auth/login-history
```

## Database Models Used

- **User** - User accounts and profiles
- **UserRole** - User role assignments
- **UserSession** - Active sessions
- **LoginHistory** - Login attempts (success/failure)
- **PasswordResetToken** - Password reset tokens
- **AuditLog** - All authenticated actions
- **Role** - Available roles
- **Permission** - Available permissions
- **RolePermission** - Role-permission mapping

## Security Measures

1. **Password Security**
   - PBKDF2-SHA256 hashing with salt
   - 100,000 iterations
   - Complexity validation

2. **Token Security**
   - HMAC-SHA256 signing
   - Short-lived access tokens (15 min)
   - Long-lived refresh tokens (7 days)
   - Token expiration validation

3. **Account Protection**
   - Account lockout after 5 failed attempts
   - 30-minute lockout duration
   - IP address tracking
   - User agent tracking

4. **Session Security**
   - Secure session IDs
   - Session expiration
   - Device fingerprinting
   - IP validation

5. **Audit Trail**
   - All authentication events logged
   - IP address captured
   - User agent captured
   - Timestamp recorded

## Usage Example

```typescript
import { AuthService, JwtService, AuthMiddleware } from './src/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const jwtService = new JwtService({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  accessTokenExpiry: 900, // 15 minutes
  refreshTokenExpiry: 604800, // 7 days
});

const authService = new AuthService(prisma, jwtService);
const authMiddleware = new AuthMiddleware(jwtService);

// In Express/Next.js
app.post('/api/auth/login', (req, res) => {
  const controller = new AuthController(authService, jwtService, prisma);
  return controller.login(req, res);
});

// Protect routes
app.get('/api/protected', authMiddleware.authenticate(), (req, res) => {
  // req.user is available
});

// Check permissions
app.get('/api/admin', 
  authMiddleware.authenticate(),
  authMiddleware.checkPermission('system:admin'),
  (req, res) => {
    // User has system:admin permission
  }
);
```

## Role-Based Access Control

### Available Roles

- **Platform Owner** - Full system access
- **League Manager** - League management
- **Referee Manager** - Referee management
- **Team Manager** - Club and player management
- **Referee** - Match report submission

### Permission Structure

Permissions are organized by module:
- `auth:*` - Authentication operations
- `user:*` - User management
- `league:*` - League management
- `referee:*` - Referee management
- `club:*` - Club management
- `player:*` - Player management
- `fixture:*` - Fixture management
- `match:*` - Match operations
- `system:*` - System administration

## Testing

Unit tests are included for:
- Password hashing and verification
- Password validation
- JWT token creation and verification
- Token expiration
- Token tampering detection

Run tests:
```bash
npm run test
```

## Error Handling

Generic error messages are returned to prevent information leakage:
- Invalid credentials → "Invalid email or password"
- User not found → "Invalid email or password"
- Account locked → "Account is locked"
- Session expired → "Session has expired"

## Future Enhancements

1. **Multi-Factor Authentication (MFA)**
   - TOTP support
   - SMS verification
   - Email verification

2. **Single Sign-On (SSO)**
   - Google login
   - Microsoft login
   - Custom OIDC support

3. **Advanced Security**
   - Biometric authentication
   - Device trust management
   - Risk-based authentication
   - Anomaly detection

4. **Session Management**
   - Session dashboard
   - Device management
   - Login notifications
   - Geographic tracking

## Configuration

Key configuration constants in `src/auth/constants.ts`:

```typescript
PASSWORD_MIN_LENGTH: 8
PASSWORD_MAX_LENGTH: 128
MAX_LOGIN_ATTEMPTS: 5
LOCKOUT_DURATION_MINUTES: 30
ACCESS_TOKEN_EXPIRY_MINUTES: 15
REFRESH_TOKEN_EXPIRY_DAYS: 7
PASSWORD_RESET_TOKEN_EXPIRY_HOURS: 24
SESSION_TIMEOUT_MINUTES: 30
REMEMBER_ME_DURATION_DAYS: 30
```

## Dependencies

- @prisma/client - Database ORM
- Node.js crypto module - Password hashing and JWT signing
- TypeScript - Type safety
- Vitest - Unit testing

## Notes

1. Production Recommendations:
   - Use Argon2 for password hashing (currently using PBKDF2)
   - Enable HTTPS for all auth endpoints
   - Use secure, httpOnly cookies for tokens
   - Implement rate limiting on login endpoints
   - Deploy CSRF protection
   - Use environment variables for secrets

2. Email/SMS Integration:
   - Password reset and verification emails/SMS should be sent
   - Currently returns token in development mode
   - Implement email service (SendGrid, AWS SES, etc.)
   - Implement SMS service (Twilio, Africa's Talking, etc.)

3. Database Backup:
   - Regular backups of authentication data
   - Separate backup for password hashes
   - Audit log retention policy
