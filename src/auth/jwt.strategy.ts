import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { AuthPayload } from './auth-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_ACCESS_SECRET') as string,
    });
  }

  validate(payload: AuthPayload) {
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    };
  }
}
