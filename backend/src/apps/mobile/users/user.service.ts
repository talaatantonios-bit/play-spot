import { Injectable, NotFoundException, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async getUserProfile(userId: number) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) throw new NotFoundException('User not found');
      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get profile for user ${userId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to get user profile');
    }
  }
}
