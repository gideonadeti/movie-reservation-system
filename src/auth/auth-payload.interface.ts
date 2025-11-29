import { Role } from '@prisma/client';

export interface AuthPayload {
  sub: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  jti: string;
}
