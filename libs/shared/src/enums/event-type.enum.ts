export enum SecurityEventType {
  LOGIN_FAILED = 'auth.login_failed',
  BRUTE_FORCE_DETECTED = 'auth.brute_force_detected',
  SUSPICIOUS_IP = 'auth.suspicious_ip',
  PASSWORD_CHANGED = 'auth.password_changed',
  ADMIN_LOGIN = 'auth.admin_login',
  ACCOUNT_LOCKED = 'user.account_locked',
}
