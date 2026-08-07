/**
 * Data Transfer Objects for Authentication
 */

export class LoginDto {
  email!: string;
  password!: string;
  rememberMe?: boolean;

  constructor(email: string, password: string, rememberMe = false) {
    this.email = email;
    this.password = password;
    this.rememberMe = rememberMe;
  }
}

export class ChangePasswordDto {
  currentPassword!: string;
  newPassword!: string;
  confirmPassword?: string;

  constructor(currentPassword: string, newPassword: string, confirmPassword?: string) {
    this.currentPassword = currentPassword;
    this.newPassword = newPassword;
    this.confirmPassword = confirmPassword;
  }
}

export class PasswordResetRequestDto {
  email!: string;

  constructor(email: string) {
    this.email = email;
  }
}

export class PasswordResetConfirmDto {
  token!: string;
  newPassword!: string;
  confirmPassword?: string;

  constructor(token: string, newPassword: string, confirmPassword?: string) {
    this.token = token;
    this.newPassword = newPassword;
    this.confirmPassword = confirmPassword;
  }
}

export class RefreshTokenDto {
  refreshToken!: string;
  sessionId!: string;

  constructor(refreshToken: string, sessionId: string) {
    this.refreshToken = refreshToken;
    this.sessionId = sessionId;
  }
}
