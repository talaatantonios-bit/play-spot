import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { GamesService } from '../../../common/games/games.service';
import { CreateGameDto } from '../../../common/games/dto/create-game.dto';
import { UpdateGameDto } from '../../../common/games/dto/update-game.dto';
import { JwtAuthGuard } from '../../mobile/auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../enums/role.enum';

@ApiTags('admin/games')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.SHOP_ADMIN)
@Controller('admin/games')
export class AdminGameController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({ summary: 'List all games (SuperAdmin or ShopAdmin)' })
  @ApiOkResponse({ description: 'Paginated list of games' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.gamesService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a game by ID (SuperAdmin or ShopAdmin)' })
  @ApiParam({ name: 'id', description: 'Game UUID' })
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a game (SuperAdmin or ShopAdmin)' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ description: 'Game created' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'categoryId'],
      properties: {
        title:        { type: 'string' },
        titleAr:      { type: 'string' },
        categoryId:   { type: 'integer' },
        description:  { type: 'string' },
        isActive:     { type: 'boolean', default: true },
        displayOrder: { type: 'integer', default: 0 },
        image:        { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  createGame(
    @Body() dto: CreateGameDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.gamesService.createGame(dto, image);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a game (SuperAdmin or ShopAdmin)' })
  @ApiParam({ name: 'id', description: 'Game UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title:        { type: 'string' },
        titleAr:      { type: 'string' },
        categoryId:   { type: 'integer' },
        description:  { type: 'string' },
        isActive:     { type: 'boolean' },
        displayOrder: { type: 'integer' },
        image:        { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  updateGame(
    @Param('id') id: string,
    @Body() dto: UpdateGameDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.gamesService.updateGame(id, dto, image);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a game (SuperAdmin or ShopAdmin)' })
  @ApiParam({ name: 'id', description: 'Game UUID' })
  deleteGame(@Param('id') id: string) {
    return this.gamesService.deleteGame(id);
  }
}
