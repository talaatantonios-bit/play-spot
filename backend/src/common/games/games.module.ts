import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesRepository } from './games.repository';
import { UploadModule } from '../../upload/upload.module';

@Module({
  imports: [UploadModule],
  providers: [GamesService, GamesRepository],
  exports: [GamesService],
})
export class GamesModule {}
