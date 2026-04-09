import { Injectable, ConflictException, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { UserRepository } from '../../mobile/users/repositories/user.repository';
import { AdminCreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async createUser(dto: AdminCreateUserDto) {
    try {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing) throw new ConflictException('Email already exists');

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = await this.userRepository.create({ ...dto, password: hashedPassword });

      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to create user', error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }
}
