import { Module } from '@nestjs/common';
import { AdminGameController } from './game.controller';
import { GamesModule } from '../../../common/games/games.module';

@Module({
  imports: [GamesModule],
  controllers: [AdminGameController],
})
export class AdminGameModule {}
