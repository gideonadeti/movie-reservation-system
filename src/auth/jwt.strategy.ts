import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { jwtConstants } from './jwt.constants';
import { Role } from 'generated/prisma';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.accessSecret as string,
    });
  }

  validate(payload: { sub: string; email: string; role: Role }) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
