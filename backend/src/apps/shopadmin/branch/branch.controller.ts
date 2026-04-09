import { Controller, Post, Get, Patch, Delete, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ShopAdminBranchService } from './branch.service';
import { ShopAdminCreateBranchDto } from './dto/create-branch.dto';
import { ShopAdminUpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../../mobile/auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../enums/role.enum';
import { GetCurrentUserId } from '../../../helpers/get-current-user-id.decorator';

@ApiTags('shopadmin/branch')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SHOP_ADMIN)
@Controller('shopadmin/branch')
export class ShopAdminBranchController {
  constructor(private readonly branchService: ShopAdminBranchService) {}

  @Post()
  @ApiOperation({ summary: 'Create a branch in my shop' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ description: 'Branch created.' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'address', 'city', 'area'],
      properties: {
        name:           { type: 'string' },
        description:    { type: 'string' },
        address:        { type: 'string' },
        city:           { type: 'string' },
        area:           { type: 'string' },
        latitude:       { type: 'number' },
        longitude:      { type: 'number' },
        googleMapsUrl:  { type: 'string' },
        phoneNumber:    { type: 'string' },
        operatingHours: { type: 'string', description: 'JSON string e.g. {"saturday":{"open":"09:00","close":"22:00"}}' },
        image:          { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  createBranch(
    @GetCurrentUserId() userId: number,
    @Body() dto: ShopAdminCreateBranchDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.branchService.createBranch(userId, dto, image);
  }

  @Get()
  @ApiOperation({ summary: 'List all my branches' })
  @ApiOkResponse({ description: 'Paginated list of branches.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listBranches(
    @GetCurrentUserId() userId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.branchService.listBranches(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a branch by ID (must belong to my shop)' })
  @ApiOkResponse({ description: 'Branch data.' })
  @ApiNotFoundResponse({ description: 'Branch not found.' })
  getBranch(
    @GetCurrentUserId() userId: number,
    @Param('id') id: string,
  ) {
    return this.branchService.getBranch(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a branch in my shop' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ description: 'Updated branch.' })
  @ApiNotFoundResponse({ description: 'Branch not found.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name:           { type: 'string' },
        description:    { type: 'string' },
        address:        { type: 'string' },
        city:           { type: 'string' },
        area:           { type: 'string' },
        latitude:       { type: 'number' },
        longitude:      { type: 'number' },
        googleMapsUrl:  { type: 'string' },
        phoneNumber:    { type: 'string' },
        isActive:       { type: 'boolean' },
        operatingHours: { type: 'string', description: 'JSON string' },
        image:          { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  updateBranch(
    @GetCurrentUserId() userId: number,
    @Param('id') id: string,
    @Body() dto: ShopAdminUpdateBranchDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.branchService.updateBranch(userId, id, dto, image);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a branch from my shop' })
  @ApiOkResponse({ description: 'Branch deleted.' })
  @ApiNotFoundResponse({ description: 'Branch not found.' })
  deleteBranch(
    @GetCurrentUserId() userId: number,
    @Param('id') id: string,
  ) {
    return this.branchService.deleteBranch(userId, id);
  }
}
