# Booking Conflict Detection - Time Range Overlap

## Overview

The booking system now implements sophisticated time range conflict detection to prevent double-booking of devices. It handles both fixed-duration bookings and open-ended bookings.

## Booking Types

### 1. Fixed-Duration Booking
- Has both `startTime` and `endTime`
- Example: "7 PM to 9 PM"
- User knows exactly when they'll finish

### 2. Open-Ended Booking
- Has `startTime` but `endTime` is `null`
- Example: "7 PM to whenever I'm done"
- Common for casual gaming sessions

## Conflict Detection Logic

### Case 1: Existing Open-Ended Booking

**Scenario:**
- User 1: Books device from 7 PM (no end time) - Status: `active` or `confirmed`
- User 2: Tries to book from 8 PM to 9 PM

**Result:** ❌ CONFLICT - User 2 cannot book

**Why?** The device is already occupied from 7 PM onwards with no known end time.

**Code Logic:**
```typescript
{
  endTime: null,              // Existing booking is open-ended
  startTime: { lte: startTime } // Started before or at our start time
}
```

### Case 2: New Open-Ended Booking

**Scenario:**
- User 1: Has booking from 8 PM to 9 PM - Status: `confirmed`
- User 2: Tries to book from 7 PM (no end time)

**Result:** ❌ CONFLICT - User 2 cannot book

**Why?** User 2's open-ended booking would overlap with User 1's existing booking.

**Code Logic:**
```typescript
if (endTime === null) {
  // Check if any booking starts at or after our start time
  { startTime: { gte: startTime } }
}
```

### Case 3: Both Fixed-Duration - Overlap Detection

The system checks for 4 types of overlaps:

#### 3a. New Booking Starts During Existing Booking

**Scenario:**
- Existing: 7 PM to 9 PM
- New: 8 PM to 10 PM

**Result:** ❌ CONFLICT

```
Existing: |---------|
New:           |---------|
          7    8    9    10
```

**Code:**
```typescript
{ startTime: { gte: startTime, lt: endTime } }
```

#### 3b. New Booking Ends During Existing Booking

**Scenario:**
- Existing: 8 PM to 10 PM
- New: 7 PM to 9 PM

**Result:** ❌ CONFLICT

```
Existing:      |---------|
New:       |---------|
          7    8    9    10
```

**Code:**
```typescript
{ endTime: { gt: startTime, lte: endTime } }
```

#### 3c. Existing Booking Completely Contains New Booking

**Scenario:**
- Existing: 6 PM to 10 PM
- New: 7 PM to 9 PM

**Result:** ❌ CONFLICT

```
Existing: |---------------|
New:         |-------|
          6  7   8   9  10
```

**Code:**
```typescript
{
  startTime: { lte: startTime },
  endTime: { gte: endTime }
}
```

#### 3d. New Booking Completely Contains Existing Booking

**Scenario:**
- Existing: 8 PM to 9 PM
- New: 7 PM to 10 PM

**Result:** ❌ CONFLICT

```
Existing:    |-----|
New:       |-----------|
          7  8   9  10
```

**Code:**
```typescript
{
  startTime: { gte: startTime },
  endTime: { lte: endTime }
}
```

## Only Active Bookings Block

The system only checks conflicts with bookings that have these statuses:
- `pending` - Just created, awaiting confirmation
- `confirmed` - Approved by admin/system
- `active` - User is currently using the device

**Ignored statuses:**
- `completed` - Session finished, device is free
- `cancelled` - User cancelled, device is free
- `no_show` - User didn't show up, device is free

**Code:**
```typescript
status: {
  in: [BookingStatus.pending, BookingStatus.confirmed, BookingStatus.active]
}
```

## Examples

### Example 1: Open-Ended Booking Blocks Everything After

```
Timeline:
7 PM  8 PM  9 PM  10 PM
|-----|-----|-----|-----|

User 1 books: 7 PM → open (no end time)
Status: active

User 2 tries: 8 PM → 9 PM
Result: ❌ CONFLICT
Reason: Device occupied from 7 PM onwards
```

### Example 2: Fixed Booking Allows After End Time

```
Timeline:
7 PM  8 PM  9 PM  10 PM
|-----|-----|-----|-----|

User 1 books: 7 PM → 9 PM
Status: confirmed

User 2 tries: 9 PM → 10 PM
Result: ✅ ALLOWED
Reason: No overlap (9 PM is exactly when User 1 ends)
```

### Example 3: Multiple Fixed Bookings

```
Timeline:
6 PM  7 PM  8 PM  9 PM  10 PM
|-----|-----|-----|-----|-----|

Existing bookings:
- User 1: 6 PM → 7 PM (confirmed)
- User 2: 8 PM → 9 PM (confirmed)

User 3 tries: 7 PM → 8 PM
Result: ✅ ALLOWED
Reason: Fits perfectly between existing bookings
```

### Example 4: Partial Overlap

```
Timeline:
7 PM  8 PM  9 PM  10 PM
|-----|-----|-----|-----|

User 1 books: 7 PM → 9 PM
Status: active

User 2 tries: 8:30 PM → 10 PM
Result: ❌ CONFLICT
Reason: Overlaps with User 1 (8:30 PM is during 7-9 PM)
```

## API Request Examples

### Create Fixed-Duration Booking

```json
POST /mobile/booking
{
  "branchId": "uuid",
  "deviceId": "uuid",
  "startTime": "2026-04-15T19:00:00Z",  // 7 PM
  "endTime": "2026-04-15T21:00:00Z",    // 9 PM
  "userNotes": "2 hour session"
}
```

### Create Open-Ended Booking

```json
POST /mobile/booking
{
  "branchId": "uuid",
  "deviceId": "uuid",
  "startTime": "2026-04-15T19:00:00Z",  // 7 PM
  // No endTime = open-ended
  "userNotes": "Will play until I'm done"
}
```

## Error Messages

### When Conflict Detected

**Open-ended conflict:**
```json
{
  "statusCode": 409,
  "message": "This device is already booked for the selected time range. There is an active open-ended booking.",
  "error": "Conflict"
}
```

**Fixed-duration conflict:**
```json
{
  "statusCode": 409,
  "message": "This device is already booked for the selected time range. Please choose a different time slot.",
  "error": "Conflict"
}
```

## Database Query

The conflict detection uses a single optimized query with proper indexes:

```sql
SELECT * FROM bookings
WHERE device_id = ?
  AND status IN ('pending', 'confirmed', 'active')
  AND (
    -- Open-ended existing booking
    (end_time IS NULL AND start_time <= ?)
    OR
    -- New open-ended booking
    (? IS NULL AND start_time >= ?)
    OR
    -- Fixed-duration overlaps (4 cases)
    (...)
  )
```

**Indexes used:**
- `@@index([deviceId, status, startTime])`
- `@@index([deviceId, startTime])`

## Edge Cases Handled

### ✅ Exact Time Match
- Existing: 7 PM to 9 PM
- New: 7 PM to 9 PM
- Result: ❌ CONFLICT (complete overlap)

### ✅ Adjacent Bookings
- Existing: 7 PM to 9 PM
- New: 9 PM to 10 PM
- Result: ✅ ALLOWED (no overlap, 9 PM is free)

### ✅ Multiple Open-Ended
- Existing: 7 PM (open)
- New: 8 PM (open)
- Result: ❌ CONFLICT (can't have two open bookings)

### ✅ Cancelled Booking
- Existing: 7 PM to 9 PM (cancelled)
- New: 7 PM to 9 PM
- Result: ✅ ALLOWED (cancelled bookings don't block)

### ✅ Past Booking
- Existing: Yesterday 7 PM to 9 PM (completed)
- New: Today 7 PM to 9 PM
- Result: ✅ ALLOWED (different days, completed status)

## Performance

- Single database query for conflict detection
- Uses composite indexes for fast lookups
- O(1) complexity for most cases
- Handles thousands of bookings efficiently

## Testing Scenarios

### Test 1: Open-Ended Blocks Future
```typescript
// Create open-ended booking at 7 PM
// Try to book 8 PM - 9 PM
// Expected: CONFLICT
```

### Test 2: Fixed Allows After
```typescript
// Create booking 7 PM - 9 PM
// Try to book 9 PM - 10 PM
// Expected: SUCCESS
```

### Test 3: Overlap Detection
```typescript
// Create booking 7 PM - 9 PM
// Try to book 8 PM - 10 PM
// Expected: CONFLICT
```

### Test 4: Cancelled Doesn't Block
```typescript
// Create booking 7 PM - 9 PM
// Cancel it
// Try to book 7 PM - 9 PM
// Expected: SUCCESS
```

## Summary

The conflict detection system:
- ✅ Handles open-ended bookings
- ✅ Detects all 4 types of time range overlaps
- ✅ Only considers active bookings
- ✅ Provides clear error messages
- ✅ Optimized with database indexes
- ✅ Handles edge cases correctly

This ensures no double-booking can occur while allowing maximum device utilization.
