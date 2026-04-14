import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * OwnershipGuard ensures SHOP_ADMIN users can only access resources they own.
 * This guard should be used AFTER RolesGuard to ensure the user has SHOP_ADMIN role.
 * 
 * The guard extracts userId from the JWT token and makes it available to the service layer
 * for ownership verification.
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  private readonly logger = new Logger(OwnershipGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      this.logger.warn('OwnershipGuard: No user found in request');
      throw new ForbiddenException('User not authenticated');
    }

    // Attach userId to request for service layer to use
    request.ownerId = user.userId;
    
    this.logger.log(`OwnershipGuard: User ${user.userId} accessing resource`);
    return true;
  }
}
