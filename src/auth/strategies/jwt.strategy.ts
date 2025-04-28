import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'default_jwt_secret_for_development',
    });
  }

  async validate(payload: JwtPayload) {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTimestamp) {
      throw new UnauthorizedException('Token expirado');
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException(
        'Usuário não encontrado ou token inválido',
      );
    }
    return user;
  }
}
