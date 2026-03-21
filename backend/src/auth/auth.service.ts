import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../users/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: any) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    return this.generateTokens(user, true);
  }

  async login(data: any) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user, false);
  }

  private generateTokens(user: any, isNewUser: boolean) {
    const payload = { sub: user.id, email: user.email };
    
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET || 'super-secret-key-change-me',
        expiresIn: '14d', // 2 weeks
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-change-me',
        expiresIn: '60d', // 2 months
      }),
      isNewUser,
    };
  }
}
