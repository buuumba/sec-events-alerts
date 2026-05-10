import { UserRole } from '@app/shared';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
