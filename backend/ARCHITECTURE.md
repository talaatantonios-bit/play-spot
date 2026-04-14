# Backend Architecture

## Overview
Clean, role-based architecture with security-first design. All admin operations (SUPER_ADMIN and SHOP_ADMIN) are consolidated under `apps/admin/` with role-based access control.

## Directory Structure

```
backend/src/
├── apps/
│   ├── admin/          # SUPER_ADMIN + SHOP_ADMIN endpoints
│   │   ├── shop/       # Shop management
│   │   ├── branch/     # Branch management
│   │   ├── device/     # Device management
│   │   ├── game/       # Game management (SUPER_ADMIN only)
│   │   └── category/   # Category management (SUPER_ADMIN only)
│   └── mobile/         # USER endpoints (public-facing)
│       ├── auth/
│       ├── shop/
│       ├── branch/
│       └── ...
├── common/             # Shared business logic
│   ├── games/          # Shared game service & repository
│   ├── guards/         # Security guards
│   └── decorators/     # Custom decorators
└── prisma/             # Database layer
```

## Security Model

### Role-Based Access Control (RBAC)

Three roles with distinct permissions:

1. **SUPER_ADMIN**
   - Full system access
   - Manages all shops, branches, devices
   - Can block/unblock shops
   - Manages subscription plans
   - Routes: `admin/*` (without `/my/` prefix)

2. **SHOP_ADMIN**
   - Manages only their own shop
   - Cannot modify subscription or blocking status
   - Ownership verified on every request
   - Routes: `admin/*/my/*`

3. **USER**
   - Browse shops, branches, devices
   - Book sessions (future)
   - Routes: `mobile/*`

### Guards Stack

Every protected endpoint uses this guard chain:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.SHOP_ADMIN)
```

1. **JwtAuthGuard** - Validates JWT token, extracts user
2. **RolesGuard** - Verifies user has required role

### Ownership Verification

SHOP_ADMIN endpoints verify ownership at the service layer:

```typescript
// Service method
async getMyShop(ownerId: number) {
  const shop = await this.shopRepository.findByOwnerId(ownerId);
  if (!shop) throw new NotFoundException('Shop not found');
  if (shop.isBlocked) throw new ForbiddenException('Your shop has been blocked');
  return shop;
}
```

**Security principle**: Never trust route params for SHOP_ADMIN. Always resolve ownership via `@GetCurrentUserId()` decorator.

## API Route Patterns

### SUPER_ADMIN Routes
```
POST   /admin/shop                    # Create any shop
GET    /admin/shop                    # List all shops
GET    /admin/shop/:id                # Get any shop
PATCH  /admin/shop/:id                # Update any shop
PATCH  /admin/shop/:id/block          # Block shop
PATCH  /admin/shop/:id/unblock        # Unblock shop

POST   /admin/branch                  # Create branch for any shop
GET    /admin/branch/shop/:shopId     # List branches of any shop
GET    /admin/branch/:id              # Get any branch
PATCH  /admin/branch/:id              # Update any branch
DELETE /admin/branch/:id              # Delete any branch
```

### SHOP_ADMIN Routes
```
GET    /admin/shop/my/info            # Get my shop
PATCH  /admin/shop/my/info            # Update my shop (limited fields)

POST   /admin/branch/my               # Create branch in my shop
GET    /admin/branch/my/list          # List my branches
GET    /admin/branch/my/:id           # Get my branch
PATCH  /admin/branch/my/:id           # Update my branch
DELETE /admin/branch/my/:id           # Delete my branch
```

**Pattern**: `/my/` prefix indicates SHOP_ADMIN-only endpoint with ownership verification.

## Service Layer Patterns

### Shared Repository, Split Service Methods

Services contain both SUPER_ADMIN and SHOP_ADMIN methods:

```typescript
@Injectable()
export class AdminShopService {
  // SUPER_ADMIN methods
  async createShop(dto, createdBy, logo) { ... }
  async listShops(query) { ... }
  async getShop(id) { ... }
  async updateShop(id, dto, logo) { ... }
  async blockShop(id, dto) { ... }
  
  // SHOP_ADMIN methods
  async getMyShop(ownerId) { ... }
  async updateMyShop(ownerId, dto, logo) { ... }
}
```

**Why?** 
- Avoids code duplication
- Shared repositories
- Clear separation of concerns
- Easy to maintain

### Field-Level Security

SHOP_ADMIN updates are restricted to safe fields:

```typescript
async updateMyShop(ownerId: number, dto: Partial<UpdateShopDto>, logo?: Express.Multer.File) {
  const shop = await this.getMyShop(ownerId);
  
  // Only allow basic fields, not subscription or blocking
  const allowedFields = {
    name: dto.name,
    description: dto.description,
    phoneNumber: dto.phoneNumber,
    ...(logoUrl && { logoUrl }),
  };
  
  return await this.shopRepository.update(shop.id, allowedFields);
}
```

## Repository Pattern

### Single Responsibility

Each repository handles ONE model:

- `AdminShopRepository` - Shop CRUD
- `AdminBranchRepository` - Branch CRUD
- `AdminDeviceRepository` - Device CRUD
- `AdminDeviceGameRepository` - DeviceGame junction table

### No Business Logic

Repositories are pure data access:

```typescript
@Injectable()
export class AdminDeviceRepository {
  async create(data: Prisma.DeviceCreateInput): Promise<Device> {
    return this.prisma.device.create({ data, include: DEVICE_WITH_GAMES });
  }
  
  async findById(id: string): Promise<Device | null> {
    return this.prisma.device.findUnique({ where: { id }, include: DEVICE_WITH_GAMES });
  }
  
  async update(id: string, data: Prisma.DeviceUpdateInput): Promise<Device> {
    return this.prisma.device.update({ where: { id }, data, include: DEVICE_WITH_GAMES });
  }
}
```

**No transactions in repositories** - Services orchestrate transactions when needed.

## Swagger Documentation

### Separate Swagger Files

API body schemas live in dedicated files:

```
admin/device/
├── device.controller.ts
├── device.service.ts
├── device.repository.ts
├── device.swagger.ts        # <-- Swagger schemas here
└── dto/
```

```typescript
// device.swagger.ts
export const CreateDeviceSwaggerBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    required: ['name', 'deviceType', ...],
    properties: { ... },
  },
};

// device.controller.ts
@ApiBody(CreateDeviceSwaggerBody as ApiBodyOptions)
createDevice(@Body() dto: CreateDeviceDto) { ... }
```

**Why?** Controllers stay clean, schemas are reusable, easier to maintain.

## Common Module Pattern

Shared business logic lives in `common/`:

```
common/games/
├── games.service.ts       # Shared service
├── games.repository.ts    # Shared repository
├── games.module.ts        # Exports service
└── dto/                   # Shared DTOs
```

Controllers in `admin/game/` and `shopadmin/game/` both import `GamesService`:

```typescript
// admin/game/game.controller.ts
@Roles(Role.SUPER_ADMIN)
export class AdminGameController {
  constructor(private readonly gamesService: GamesService) {}
}

// shopadmin/game/game.controller.ts
@Roles(Role.SHOP_ADMIN)
export class ShopAdminGameController {
  constructor(private readonly gamesService: GamesService) {}
}
```

**Rule**: `common/` = shared logic, never HTTP. Apps = HTTP entry points, never shared directly.

## Error Handling

### Consistent Pattern

```typescript
async someMethod() {
  try {
    // Business logic
    return result;
  } catch (error) {
    if (error instanceof HttpException) throw error;  // Re-throw known errors
    this.logger.error('Context', error instanceof Error ? error.stack : error);
    throw new InternalServerErrorException('User-friendly message');
  }
}
```

### HTTP Exception Hierarchy

- `NotFoundException` - Resource not found
- `ForbiddenException` - Shop blocked, ownership violation
- `ConflictException` - Duplicate resource
- `BadRequestException` - Invalid input
- `UnauthorizedException` - Auth failure
- `InternalServerErrorException` - Unexpected errors

## Best Practices

### 1. Security First
- Never trust route params for SHOP_ADMIN
- Always verify ownership at service layer
- Use `@GetCurrentUserId()` decorator
- Field-level restrictions for SHOP_ADMIN updates

### 2. Clean Code
- Single Responsibility Principle
- Separate concerns (controller → service → repository)
- No business logic in repositories
- No data access in controllers

### 3. DRY (Don't Repeat Yourself)
- Share services when logic is identical
- Split methods only when business logic differs
- Reuse DTOs and repositories

### 4. Explicit Over Implicit
- Clear method names (`getMyShop` vs `getShop`)
- Explicit role guards on every endpoint
- Typed parameters, no `any`

### 5. Fail Fast
- Validate ownership early
- Check blocking status immediately
- Throw specific exceptions

## Migration from shopadmin/

The `shopadmin/` folder has been removed. All functionality consolidated into `admin/` with:

1. Role-based guards (`@Roles(Role.SHOP_ADMIN)`)
2. `/my/` route prefix for SHOP_ADMIN endpoints
3. Ownership verification in service methods
4. Shared repositories and services

**Result**: Less code, better security, easier maintenance.
