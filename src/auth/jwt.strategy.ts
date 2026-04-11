import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { BlTokenService } from './blToken.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private blacklistService: BlTokenService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET') || '6561',
      passReqToCallback:true,
    });
  }
  async validate(req: any, payload: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (await this.blacklistService.isBlacklisted(token)) {
      throw new UnauthorizedException('Token has been revoked');
    }
    return { userId: payload.sub, email: payload.email };
  }
}
