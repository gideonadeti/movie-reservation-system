import { Role } from '@prisma/client';

export interface AuthPayload {
  email: string;
  sub: string;
  role: Role;
  jti: string;
}
