import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { UserRepository } from '../users/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { CoinsService } from '../coins/coins.service';
import * as bcrypt from 'bcrypt';
import { validateEmail, validatePhoneNumber } from '../../../helpers/validation/validators';
import { HttpException } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly coinsService: CoinsService,
  ) {}

  async register(data: any) {
    try {
      validateEmail(data.email);
      validatePhoneNumber(data.phone);

      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) throw new ConflictException('Email already exists');

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await this.userRepository.create({ ...data, password: hashedPassword });

      await this.coinsService.addWelcomeCoins(user.id);

      return this.generateTokens(user, true);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to register user', error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(data: any) {
    try {
      const user = await this.userRepository.findByEmail(data.email);
      if (!user) throw new UnauthorizedException('Invalid credentials');

      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

      return this.generateTokens(user, false);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to login user', error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Login failed');
    }
  }

  private generateTokens(user: any, isNewUser: boolean) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET || 'super-secret-key-change-me',
        expiresIn: '14d',
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-change-me',
        expiresIn: '60d',
      }),
      isNewUser,
    };
  }
}
