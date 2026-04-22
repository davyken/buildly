import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService, private usersService: UsersService) {
    const opts: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: configService.get<string>('jwt.refreshSecret') as string,
      passReqToCallback: true,
    };
    super(opts);
  }

  async validate(req: Request, payload: { sub: string }) {
    const refreshToken = (req.body as any)?.refreshToken as string;
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.refreshToken) throw new UnauthorizedException('Access denied');
    const tokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenMatches) throw new UnauthorizedException('Access denied');
    return { id: payload.sub, email: user.email, plan: user.plan };
  }
}
