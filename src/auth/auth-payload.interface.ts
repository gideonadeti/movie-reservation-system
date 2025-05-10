import { Role } from 'generated/prisma';

export interface AuthPayload {
  email: string;
  sub: string;
  role: Role;
  jti: string;
}
