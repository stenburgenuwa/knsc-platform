/**
 * API Documentation - Authentication Endpoints
 */

# Authentication API Documentation

## Base URL
```
/api/auth
```

## Endpoints

### 1. Login
**POST** `/auth/login`

Authenticate user with credentials.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password@123",
  "rememberMe": false
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 900,
  "redirectUrl": "/dashboard/platform",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+254712345678",
    "roles": ["Platform Owner"],
    "permissions": ["system:admin", ...],
    "isActive": true,
    "isLocked": false,
    "isEmailVerified": true,
    "isPhoneVerified": true
  }
}
```

**Error (401):**
```json
{
  "error": "Invalid email or password"
}
```

---

### 2. Logout
**POST** `/auth/logout`

End user session.

**Request:**
```json
{
  "userId": "uuid",
  "sessionId": "uuid"
}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 3. Refresh Token
**POST** `/auth/refresh`

Get new access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGc...",
  "sessionId": "uuid"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "expiresIn": 900
}
```

**Error (401):**
```json
{
  "error": "Invalid or expired token"
}
```

---

### 4. Change Password
**POST** `/auth/change-password`

Change password for authenticated user.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "currentPassword": "Password@123",
  "newPassword": "NewPassword@456",
  "confirmPassword": "NewPassword@456"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error (400):**
```json
{
  "error": "Current password is incorrect"
}
```

---

### 5. Request Password Reset
**POST** `/auth/password-reset/request`

Request password reset token.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset instructions sent to email",
  "token": "abc123..." // Development only
}
```

---

### 6. Confirm Password Reset
**POST** `/auth/password-reset/confirm`

Reset password using token.

**Request:**
```json
{
  "token": "abc123...",
  "newPassword": "NewPassword@456",
  "confirmPassword": "NewPassword@456"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

**Error (400):**
```json
{
  "error": "Invalid or expired token"
}
```

---

### 7. Get Current User
**GET** `/auth/me`

Get authenticated user details.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+254712345678",
  "roles": ["Platform Owner"],
  "permissions": ["system:admin"],
  "isActive": true,
  "isLocked": false,
  "isEmailVerified": true,
  "isPhoneVerified": true,
  "lastLoginAt": "2024-01-15T10:30:00Z"
}
```

---

### 8. Get Active Sessions
**GET** `/auth/sessions`

Get all active sessions for authenticated user.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "deviceName": null,
    "browser": "Chrome",
    "operatingSystem": "Windows",
    "ipAddress": "192.168.1.1",
    "loginTime": "2024-01-15T10:30:00Z"
  }
]
```

---

### 9. Terminate Session
**DELETE** `/auth/sessions/:sessionId`

End a specific session.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "message": "Session terminated"
}
```

---

### 10. Get Login History
**GET** `/auth/login-history`

Get login attempts for authenticated user.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `limit` (optional): Number of records (default: 20)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "emailAttempted": "user@example.com",
    "ipAddress": "192.168.1.1",
    "browser": "Chrome",
    "operatingSystem": "Windows",
    "success": true,
    "failureReason": null,
    "loginTime": "2024-01-15T10:30:00Z"
  }
]
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized access"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden: insufficient permissions"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Authentication Flow

```
1. User submits credentials
   POST /auth/login
   ↓
2. System validates credentials
   ↓
3. System creates session and tokens
   ↓
4. Return accessToken + refreshToken
   ↓
5. Client uses accessToken for API requests
   Authorization: Bearer <accessToken>
   ↓
6. When accessToken expires (15 min)
   POST /auth/refresh with refreshToken
   ↓
7. System returns new accessToken
   ↓
8. Client continues with new token
   ↓
9. User logs out
   POST /auth/logout
   ↓
10. Session terminated, tokens invalidated
```

---

## Security Headers

Add these headers for API requests:

```
Authorization: Bearer <accessToken>
Content-Type: application/json
X-Requested-With: XMLHttpRequest
```

---

## Rate Limiting (Recommended)

- Login endpoint: 5 attempts per 15 minutes per IP
- Password reset: 3 attempts per hour per email
- API endpoints: 1000 requests per hour per user

---

## Testing with cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@knscl.local",
    "password": "PlatformOwner@123"
  }'

# Get current user
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"

# Change password
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "PlatformOwner@123",
    "newPassword": "NewPassword@456",
    "confirmPassword": "NewPassword@456"
  }'

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "<userId>",
    "sessionId": "<sessionId>"
  }'
```
