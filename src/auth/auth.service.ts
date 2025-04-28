import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const isPasswordValid = await this.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const updatedUser = await this.usersService.updateLastLogin(user.id);

    const token = this.generateToken(updatedUser.id);

    return new AuthResponseDto(new UserResponseDto(updatedUser), token);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create(registerDto);

    const token = this.generateToken(user.id);

    return new AuthResponseDto(new UserResponseDto(user), token);
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token, {
        secret:
          this.configService.get<string>('JWT_SECRET') ||
          'default_jwt_secret_for_development',
      });
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  private generateToken(userId: string): string {
    const payload: JwtPayload = {
      sub: userId,
    };

    return this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_SECRET') ||
        'default_jwt_secret_for_development',
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
    });
  }

  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
