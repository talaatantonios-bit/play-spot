import { Injectable, NotFoundException, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { MobileBranchRepository } from './repositories/branch.repository';
import { BranchQueryDto } from './dto/branch-query.dto';
import { PaginatedBranchResponse } from './responses/paginated-branch.response';
import { MobileBranchResponse } from './responses/branch.response';

@Injectable()
export class MobileBranchService {
  private readonly logger = new Logger(MobileBranchService.name);

  constructor(private readonly branchRepository: MobileBranchRepository) {}

  async findByShop(shopId: string, query: BranchQueryDto): Promise<PaginatedBranchResponse> {
    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const skip = (page - 1) * limit;

      const [branches, total] = await this.branchRepository.findActiveByShop({
        shopId,
        skip,
        take: limit,
        area: query.area,
      });

      return {
        data: branches as MobileBranchResponse[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to fetch branches for shop ${shopId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to fetch branches');
    }
  }

  async findById(id: string): Promise<MobileBranchResponse> {
    try {
      const branch = await this.branchRepository.findById(id);
      if (!branch || !branch.isActive) throw new NotFoundException('Branch not found');
      return branch as MobileBranchResponse;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to fetch branch ${id}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to fetch branch');
    }
  }
}
