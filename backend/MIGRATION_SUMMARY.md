# Migration Summary: shopadmin → admin

## What Changed

The `shopadmin/` folder has been completely removed. All SHOP_ADMIN functionality is now in `admin/` with role-based access control.

## API Route Changes

### Shop Management

**Before:**
```
GET    /shopadmin/shop/my
PATCH  /shopadmin/shop/my
```

**After:**
```
GET    /admin/shop/my/info
PATCH  /admin/shop/my/info
```

### Branch Management

**Before:**
```
POST   /shopadmin/branch
GET    /shopadmin/branch
GET    /shopadmin/branch/:id
PATCH  /shopadmin/branch/:id
DELETE /shopadmin/branch/:id
```

**After:**
```
POST   /admin/branch/my
GET    /admin/branch/my/list
GET    /admin/branch/my/:id
PATCH  /admin/branch/my/:id
DELETE /admin/branch/my/:id
```

### Game Management

**Before:**
```
GET    /shopadmin/games
GET    /shopadmin/games/:id
POST   /shopadmin/games
PUT    /shopadmin/games/:id
DELETE /shopadmin/games/:id
```

**After:**
```
GET    /admin/games
GET    /admin/games/:id
POST   /admin/games
PUT    /admin/games/:id
DELETE /admin/games/:id
```

**Note:** Games are now accessible to both SUPER_ADMIN and SHOP_ADMIN at the same routes.

## Security Improvements

### Before (shopadmin)
- Separate folder structure
- Ownership verification in service layer
- Duplicated code between admin and shopadmin

### After (unified admin)
- Single source of truth
- Role-based guards: `@Roles(Role.SUPER_ADMIN, Role.SHOP_ADMIN)`
- Ownership verification still in service layer
- No code duplication
- Clear route patterns: `/my/` prefix = SHOP_ADMIN only

## Code Structure

### Removed
```
backend/src/apps/shopadmin/
├── shop/
│   ├── shop.controller.ts
│   ├── shop.service.ts
│   ├── shop.repository.ts
│   └── shop.module.ts
├── branch/
│   ├── branch.controller.ts
│   ├── branch.service.ts
│   ├── branch.repository.ts
│   └── branch.module.ts
├── game/
│   ├── game.controller.ts
│   └── game.module.ts
└── shopadmin.module.ts
```

### Consolidated Into
```
backend/src/apps/admin/
├── shop/
│   ├── shop.controller.ts      # Now has SUPER_ADMIN + SHOP_ADMIN endpoints
│   ├── shop.service.ts         # Now has getMyShop(), updateMyShop()
│   ├── shop.repository.ts      # Shared
│   └── shop.module.ts
├── branch/
│   ├── branch.controller.ts    # Now has SUPER_ADMIN + SHOP_ADMIN endpoints
│   ├── branch.service.ts       # Now has createMyBranch(), listMyBranches(), etc.
│   ├── branch.repository.ts    # Shared
│   └── branch.module.ts
└── game/
    ├── game.controller.ts      # Now allows SHOP_ADMIN
    └── game.module.ts
```

## Frontend Migration Guide

If you have a frontend consuming these APIs, update your endpoints:

### Shop Endpoints
```typescript
// Before
GET /shopadmin/shop/my
PATCH /shopadmin/shop/my

// After
GET /admin/shop/my/info
PATCH /admin/shop/my/info
```

### Branch Endpoints
```typescript
// Before
POST /shopadmin/branch
GET /shopadmin/branch?page=1&limit=10
GET /shopadmin/branch/:id
PATCH /shopadmin/branch/:id
DELETE /shopadmin/branch/:id

// After
POST /admin/branch/my
GET /admin/branch/my/list?page=1&limit=10
GET /admin/branch/my/:id
PATCH /admin/branch/my/:id
DELETE /admin/branch/my/:id
```

### Game Endpoints
```typescript
// Before
GET /shopadmin/games

// After
GET /admin/games
```

## Authentication

No changes to authentication. Continue using:
- JWT token in `Authorization: Bearer <token>` header
- Token must contain `role: 'SHOP_ADMIN'`
- `@GetCurrentUserId()` decorator extracts `userId` from token

## Testing Checklist

- [ ] SHOP_ADMIN can access `/admin/shop/my/info`
- [ ] SHOP_ADMIN can update their shop at `/admin/shop/my/info`
- [ ] SHOP_ADMIN can create branches at `/admin/branch/my`
- [ ] SHOP_ADMIN can list their branches at `/admin/branch/my/list`
- [ ] SHOP_ADMIN can manage games at `/admin/games`
- [ ] SHOP_ADMIN cannot access other shops' resources
- [ ] SHOP_ADMIN cannot modify subscription or blocking status
- [ ] Blocked shops receive `403 Forbidden` on all operations

## Benefits

1. **Less Code**: Removed ~500 lines of duplicated code
2. **Better Security**: Single implementation = fewer bugs
3. **Easier Maintenance**: One place to update, not two
4. **Clearer Architecture**: Role-based, not folder-based
5. **Consistent Patterns**: All admin operations follow same structure
