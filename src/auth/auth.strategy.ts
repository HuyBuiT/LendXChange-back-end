import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from 'src/app.environment';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_ACCESS_SECRET,
    });
  }

  validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      sessionId: payload.session_id,
    };
  }
}

@Injectable()
export class ResfreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_REFRESH_SECRET,
    });
  }

  validate(payload: any) {
    return { id: payload.sub, sessionId: payload.session_id };
  }
}
