# Booking System Documentation

## Overview

The booking system allows users to reserve gaming devices at specific branches. It includes validation for timing, device availability, user balance, and conflict detection.

## Architecture

### Clean Code Principles Applied

1. **Separation of Concerns**
   - Time utilities in `common/utils/time.utils.ts`
   - Business logic in service layer
   - Data access in repository layer
   - HTTP handling in controller layer

2. **Single Responsibility**
   - Each function has one clear purpose
   - Validation functions are separate and reusable
   - Time calculations isolated in utility module

3. **DRY (Don't Repeat Yourself)**
   - Time validation logic centralized
   - Reusable validation helpers
   - Shared error messages

## Database Schema

```prisma
model Booking {
  id          String        @id @default(uuid())
  userId      Int
  shopId      String
  branchId    String
  deviceId    String
  startTime   DateTime
  endTime     DateTime?
  transactionId String?
  status      BookingStatus @default(pending)
  confirmedAt DateTime?
  cancelledAt DateTime?
  userNotes   String?
  adminNotes  String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum BookingStatus {
  pending    // Initial state after creation
  confirmed  // Admin/system confirmed
  active     // User checked in
  completed  // Session finished
  cancelled  // User cancelled
  no_show    // User didn't show up
}
```

## Business Rules

### 1. Booking Creation

**Validations (in order):**

1. **Start Time Validation**
   - Must be at least 10 minutes in the future
   - Cannot be in the past
   - Error: "Booking must be made at least 10 minutes in advance"

2. **Branch Validation**
   - Branch must exist
   - Branch must be active
   - Error: "Branch not found" or "Branch is not active"

3. **Device Validation**
   - Device must exist
   - Device must be active (`isActive = true`)
   - Device status must be `available`
   - Error: "Device is currently busy/offline/maintenance"

4. **Device-Branch Relationship**
   - Device must belong to the specified branch
   - Error: "Device does not belong to the specified branch"

5. **User Balance Check**
   - User must have coins > 0
   - Balance is NOT deducted (booking is pending)
   - Error: "Insufficient coin balance. Please top up your account."

6. **Conflict Detection**
   - No other booking for same device at same time
   - Only checks `pending`, `confirmed`, `active` bookings
   - Error: "This device is already booked for the selected time"

**Result:**
- Booking created with `status = pending`
- User balance NOT deducted
- Device status NOT changed

### 2. Listing Bookings

**Endpoint:** `GET /mobile/booking`

- Returns all bookings for authenticated user
- Ordered by creation date (newest first)
- Paginated (default: 10 per page)
- Includes device, branch, and shop details

### 3. Get Specific Booking

**Endpoint:** `GET /mobile/booking/:id`

- Returns single booking details
- Ownership verification (user can only see their own bookings)
- Error: "You do not have access to this booking"

### 4. Cancel Booking

**Endpoint:** `DELETE /mobile/booking/:id`

**Validations:**

1. **Ownership Check**
   - User must own the booking
   - Error: "You do not have access to this booking"

2. **Status Check**
   - Cannot cancel if already `cancelled`
   - Cannot cancel if `completed`
   - Cannot cancel if `active`
   - Error: "Booking is already cancelled" / "Cannot cancel a completed booking"

3. **Time Check**
   - Must be at least 10 minutes before start time
   - Error: "Cancellation must be done at least 10 minutes before start time. Only X minutes remaining."

**Result:**
- Booking status changed to `cancelled`
- `cancelledAt` timestamp set
- User can create a new booking

## API Endpoints

### Create Booking

```http
POST /mobile/booking
Authorization: Bearer <token>
Content-Type: application/json

{
  "branchId": "uuid",
  "deviceId": "uuid",
  "startTime": "2026-04-15T18:00:00Z",
  "userNotes": "Please prepare FIFA 24"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "userId": 123,
  "branchId": "uuid",
  "deviceId": "uuid",
  "startTime": "2026-04-15T18:00:00.000Z",
  "status": "pending",
  "userNotes": "Please prepare FIFA 24",
  "createdAt": "2026-04-14T17:30:00.000Z",
  "device": {
    "id": "uuid",
    "name": "PS5 Room 1",
    "branch": { ... },
    "shop": { ... }
  }
}
```

**Errors:**
- `400` - Start time less than 10 minutes away
- `400` - Device not available
- `400` - Insufficient balance
- `404` - Device or branch not found
- `409` - Device already booked

### List My Bookings

```http
GET /mobile/booking?page=1&limit=10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": [ ... ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

### Get Specific Booking

```http
GET /mobile/booking/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "userId": 123,
  "status": "pending",
  ...
}
```

**Errors:**
- `404` - Booking not found
- `403` - Not your booking

### Cancel Booking

```http
DELETE /mobile/booking/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "cancelled",
  "cancelledAt": "2026-04-14T17:45:00.000Z",
  ...
}
```

**Errors:**
- `400` - Less than 10 minutes before start time
- `400` - Already cancelled/completed/active
- `404` - Booking not found
- `403` - Not your booking

## Time Utilities

Located in `common/utils/time.utils.ts`:

```typescript
// Check if time is at least X minutes in future
isAtLeastMinutesInFuture(time: Date, minutes: number): boolean

// Check if booking start time is valid (10+ minutes away)
isValidBookingStartTime(startTime: Date): boolean

// Check if cancellation is allowed (10+ minutes before start)
isCancellationAllowed(startTime: Date): boolean

// Get minutes until a given time
getMinutesUntil(time: Date): number

// Format minutes into human-readable string
formatMinutes(minutes: number): string
```

## Security

1. **Authentication Required**
   - All endpoints require JWT token
   - Role: `USER`

2. **Ownership Verification**
   - Users can only view/cancel their own bookings
   - Enforced at service layer

3. **Input Validation**
   - All DTOs use class-validator
   - UUID validation for IDs
   - ISO 8601 date validation

## Database Indexes

Optimized for common queries:

```prisma
@@index([userId, createdAt(sort: Desc)])      // List user bookings
@@index([shopId, status, startTime])          // Shop dashboard
@@index([branchId, status, startTime])        // Branch dashboard
@@index([deviceId, startTime])                // Device schedule
@@index([deviceId, status, startTime])        // Conflict detection
@@index([status, startTime])                  // Status-based queries
```

## Future Enhancements

1. **Payment Integration**
   - Deduct coins on confirmation
   - Refund on cancellation
   - Transaction tracking

2. **Notifications**
   - Booking confirmation
   - Reminder before start time
   - Cancellation confirmation

3. **Admin Features**
   - Confirm/reject bookings
   - Mark as active/completed/no-show
   - Add admin notes

4. **Advanced Features**
   - Recurring bookings
   - Group bookings
   - Waitlist for fully booked slots
   - Dynamic pricing

## Migration

Run the migration to create the booking table:

```bash
npx prisma migrate dev --name add_booking_system
```

## Testing Checklist

- [ ] Create booking with valid data
- [ ] Create booking less than 10 minutes away (should fail)
- [ ] Create booking with past time (should fail)
- [ ] Create booking with unavailable device (should fail)
- [ ] Create booking with insufficient balance (should fail)
- [ ] Create conflicting booking (should fail)
- [ ] List user bookings
- [ ] Get specific booking
- [ ] Get another user's booking (should fail)
- [ ] Cancel booking (more than 10 minutes before)
- [ ] Cancel booking (less than 10 minutes before - should fail)
- [ ] Cancel already cancelled booking (should fail)
- [ ] Cancel completed booking (should fail)
