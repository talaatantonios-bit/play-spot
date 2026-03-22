import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Log the incoming user and the roles required
    this.logger.log(`Incoming User Object: ${JSON.stringify(user)}`);
    this.logger.log(`Required Roles: ${requiredRoles}`);

    if (!user) {
      this.logger.warn('Forbidden: No user found. Ensure JwtAuthGuard is extracting and returning the user correctly.');
      return false;
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    
    if (!hasRole) {
      this.logger.warn(`Forbidden: User has role "${user.role}", but requires one of: ${requiredRoles}`);
    } else {
      this.logger.log(`Access Granted: User role "${user.role}" is allowed.`);
    }

    return hasRole;
  }
}
