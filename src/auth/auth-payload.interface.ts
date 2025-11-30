import { UserRole } from '@prisma/client';

export interface AuthPayload {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
  jti: string;
}
