import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserProfile(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    throw new NotFoundException('User not found');
  }
}
