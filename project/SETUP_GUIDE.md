/**
 * Authentication Setup Guide
 */

# Authentication Module Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 3. Run Database Migrations

```bash
npm run db:migrate
```

### 4. Seed Authentication Data

```bash
npm run db:seed
# or specifically
npx ts-node database/seed-auth.ts
```

### 5. Run Tests

```bash
npm run test
```

### 6. Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000/api/auth/login`

---

## Directory Structure

```
src/auth/
├── services/
│   ├── auth.service.ts         # Core authentication logic
│   ├── rbac.service.ts         # Role-based access control
│   └── validation.service.ts   # Input validation
├── controllers/
│   └── auth.controller.ts      # API endpoint handlers
├── middleware/
│   └── auth.middleware.ts      # Express/Next.js middleware
├── utils/
│   ├── password.ts             # Password hashing & validation
│   └── jwt.ts                  # JWT token management
├── dto/
│   └── auth.dto.ts             # Data transfer objects
├── types.ts                    # TypeScript interfaces
├── constants.ts                # Configuration constants
└── index.ts                    # Module exports

tests/
├── unit/
│   └── auth/
│       ├── password.test.ts    # Password service tests
│       └── jwt.test.ts         # JWT service tests
└── integration/
    └── auth/
        └── auth.integration.test.ts  # Full auth flow tests

database/
├── seed-auth.ts                # Authentication seed data
└── seed.ts                     # Main seed file
```

---

## Test Credentials

After running seed data:

```
Platform Owner
  Email: admin@knscl.local
  Password: PlatformOwner@123

League Manager
  Email: league@knscl.local
  Password: LeagueManager@123

Referee
  Email: referee@knscl.local
  Password: Referee@123
```

---

## API Usage Examples

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@knscl.local",
    "password": "PlatformOwner@123"
  }'
```

Response includes `accessToken` and `refreshToken`.

### Protected Request

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

### Change Password

```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "PlatformOwner@123",
    "newPassword": "NewPassword@456",
    "confirmPassword": "NewPassword@456"
  }'
```

---

## Integration with Express/Next.js

### Using AuthMiddleware

```typescript
import { AuthMiddleware } from '@/auth/middleware/auth.middleware';
import { JwtService } from '@/auth/utils/jwt';

const jwtService = new JwtService({
  secret: process.env.JWT_SECRET,
  accessTokenExpiry: 900,
  refreshTokenExpiry: 604800,
});

const authMiddleware = new AuthMiddleware(jwtService);

// Protect route with authentication
app.get('/api/protected',
  authMiddleware.authenticate(),
  (req, res) => {
    console.log(req.user); // User info available
    res.json({ message: 'Success' });
  }
);

// Check specific permission
app.post('/api/admin',
  authMiddleware.authenticate(),
  authMiddleware.checkPermission('system:admin'),
  (req, res) => {
    res.json({ message: 'Admin only' });
  }
);

// Check multiple roles
app.get('/api/managers',
  authMiddleware.authenticate(),
  authMiddleware.checkRole(['League Manager', 'Referee Manager']),
  (req, res) => {
    res.json({ message: 'Managers only' });
  }
);
```

---

## Roles and Permissions

### Available Roles

1. **Platform Owner** - Full system access
2. **League Manager** - League and fixture management
3. **Referee Manager** - Referee management and assignments
4. **Team Manager** - Club and player management
5. **Referee** - Match reporting

### Permission System

Permissions are organized by module:
- `auth:*` - Authentication
- `user:*` - User management
- `league:*` - League management
- `referee:*` - Referee management
- `club:*` - Club management
- `player:*` - Player management
- `fixture:*` - Fixture management
- `match:*` - Match operations
- `system:*` - System administration

---

## Security Best Practices

### Production Checklist

- [ ] Use strong JWT secret (min 32 characters)
- [ ] Enable HTTPS for all endpoints
- [ ] Use secure, httpOnly cookies for tokens
- [ ] Implement rate limiting
- [ ] Enable CSRF protection
- [ ] Set appropriate CORS headers
- [ ] Use Argon2 for password hashing (instead of PBKDF2)
- [ ] Enable security headers (CSP, X-Frame-Options, etc.)
- [ ] Set up monitoring and alerting
- [ ] Regular security audits
- [ ] Keep dependencies updated

### Database Security

- [ ] Use strong database password
- [ ] Restrict database access to application only
- [ ] Enable encryption at rest
- [ ] Regular backups with encryption
- [ ] Audit log retention policy
- [ ] Access control lists for sensitive tables

### Environment Variables

Never commit `.env.local` to version control. Use secrets management:
- AWS Secrets Manager
- HashiCorp Vault
- GitHub Secrets
- Environment-specific configuration

---

## Troubleshooting

### Issue: "Invalid token signature"
**Solution:** Verify JWT_SECRET is the same across application instances.

### Issue: "Password does not meet complexity requirements"
**Solution:** Ensure password has uppercase, lowercase, number, and special character.

### Issue: "Account locked"
**Solution:** Wait 30 minutes or reset account in database.

### Issue: "Session expired"
**Solution:** Use refresh token to get new access token.

### Issue: CORS errors
**Solution:** Check CORS_ORIGIN in .env.local matches client URL.

---

## Monitoring and Logging

### View Audit Logs

```typescript
const auditLogs = await prisma.auditLog.findMany({
  where: { module: 'auth' },
  orderBy: { createdAt: 'desc' },
  take: 100,
});
```

### View Login History

```typescript
const loginHistory = await prisma.loginHistory.findMany({
  where: { emailAttempted: 'user@example.com' },
  orderBy: { loginTime: 'desc' },
  take: 50,
});
```

### Check Failed Login Attempts

```typescript
const failedAttempts = await prisma.loginHistory.findMany({
  where: {
    emailAttempted: 'user@example.com',
    success: false,
    loginTime: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  },
});
```

---

## Support

For issues or questions:
1. Check AUTHENTICATION_IMPLEMENTATION.md
2. Review API_DOCUMENTATION.md
3. Check database schema in src/database/schema.prisma
4. Run unit and integration tests
5. Review error messages in browser console

---

## Next Steps

1. Implement email notifications for password reset
2. Add SMS notifications for important events
3. Implement Multi-Factor Authentication (MFA)
4. Add Single Sign-On (SSO) integration
5. Set up comprehensive audit logging
6. Implement rate limiting
7. Add security monitoring
