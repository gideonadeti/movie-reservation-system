import { Role } from '@prisma/client';

export interface AuthPayload {
  sub: string;
  name: string;
  email: string;
  role: Role;
  jti: string;
}
