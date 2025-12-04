import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info: unknown,
  ): TUser {
    // Check for token expired error
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException({
        message: 'Access token has expired',
        error: 'Token Expired',
        statusCode: 401,
      });
    }

    // If no error and user exists, return user
    if (!err && user) {
      return user;
    }

    // For all other cases, throw default unauthorized
    throw new UnauthorizedException();
  }
}
