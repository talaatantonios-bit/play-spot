import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AdminBranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { AdminBranchResponse } from './responses/branch.response';
import { JwtAuthGuard } from '../../mobile/auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../enums/role.enum';

@ApiTags('admin/branch')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('admin/branch')
export class AdminBranchController {
  constructor(private readonly branchService: AdminBranchService) {}

  @Post()
  @ApiOperation({ summary: 'Create a branch (SuperAdmin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ type: AdminBranchResponse })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['shopId', 'name', 'address', 'city', 'area'],
      properties: {
        shopId:         { type: 'string' },
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
    @Body() dto: CreateBranchDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.branchService.createBranch(dto, image);
  }

  @Get('shop/:shopId')
  @ApiOperation({ summary: 'List branches of a shop (SuperAdmin only)' })
  @ApiOkResponse({ description: 'Paginated list of branches' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiNotFoundResponse({ description: 'Shop not found.' })
  listBranches(
    @Param('shopId') shopId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.branchService.listBranches(shopId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a branch by ID (SuperAdmin only)' })
  @ApiOkResponse({ type: AdminBranchResponse })
  @ApiNotFoundResponse({ description: 'Branch not found.' })
  getBranch(@Param('id') id: string) {
    return this.branchService.getBranch(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a branch (SuperAdmin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: AdminBranchResponse })
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
    @Param('id') id: string,
    @Body() dto: UpdateBranchDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.branchService.updateBranch(id, dto, image);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a branch (SuperAdmin only)' })
  @ApiOkResponse({ description: 'Branch deleted.' })
  @ApiNotFoundResponse({ description: 'Branch not found.' })
  deleteBranch(@Param('id') id: string) {
    return this.branchService.deleteBranch(id);
  }
}
