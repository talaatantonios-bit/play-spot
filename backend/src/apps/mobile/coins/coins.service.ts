import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TransactionType, TransactionDescription } from '../../../enums';

@Injectable()
export class CoinsService {
  private readonly logger = new Logger(CoinsService.name);
  private readonly NEW_USER_COINS = Number(process.env.NEW_USER_COINS || 100); // Define the new user reward amount here

  constructor(private readonly prisma: PrismaService) { }

  async addWelcomeCoins(userId: number): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Create the coin transaction record
        await tx.coinTransaction.create({
          data: {
            amount: this.NEW_USER_COINS,
            userId: userId,
            transactionType: TransactionType.Credit,
            description: TransactionDescription.New_User,
          },
        });

        // Update the user's coinsCount
        await tx.user.update({
          where: { id: userId },
          data: {
            coinsCount: {
              increment: this.NEW_USER_COINS,
            },
          },
        });
      });

      this.logger.log(`Successfully added welcome coins to user ${userId}`);
    } catch (error) {
      this.logger.error(`Error adding welcome coins for user ${userId}`, error.stack);
      throw new InternalServerErrorException('Failed to process welcome coins transaction');
    }
  }
}
