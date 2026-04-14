import { Injectable, InternalServerErrorException, Logger, HttpException, NotFoundException } from '@nestjs/common';
import { GamesRepository } from './games.repository';
import { UploadService } from '../../upload/upload.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    private readonly gamesRepository: GamesRepository,
    private readonly uploadService: UploadService,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    return this.gamesRepository.findAll(page, limit);
  }

  async findOne(id: string) {
    const game = await this.gamesRepository.findById(id);
    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }
    return game;
  }

  async createGame(dto: CreateGameDto, file?: Express.Multer.File) {
    try {
      let coverImageUrl: string | undefined;
      if (file) {
        coverImageUrl = await this.uploadService.uploadImage('games/', file);
      }

      return await this.gamesRepository.createGame({
        title: dto.title,
        titleAr: dto.titleAr,
        categoryId: dto.categoryId,
        description: dto.description,
        isActive: dto.isActive,
        displayOrder: dto.displayOrder,
        coverImageUrl,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to create game', error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to create game');
    }
  }

  async updateGame(id: string, dto: UpdateGameDto, file?: Express.Multer.File) {
    try {
      // Check if game exists before updating
      await this.findOne(id);

      let coverImageUrl: string | undefined;
      if (file) {
        coverImageUrl = await this.uploadService.uploadImage('games/', file);
      }

      return await this.gamesRepository.updateGame(id, {
        ...dto,
        ...(coverImageUrl && { coverImageUrl }),
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to update game', error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to update game');
    }
  }

  async deleteGame(id: string) {
    await this.findOne(id);
    return this.gamesRepository.deleteGame(id);
  }
}
