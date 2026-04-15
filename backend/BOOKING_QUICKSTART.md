# Booking System - Quick Start Guide

## Step 1: Run Database Migration

```bash
cd backend
npx prisma migrate dev --name add_booking_system
```

This creates the `bookings` table and `BookingStatus` enum.

## Step 2: Restart Your Server

Stop the current server (Ctrl+C) and restart:

```bash
npm run start:dev
```

## Step 3: Test the API

### Create a Booking

**Fixed-duration booking (with end time):**
```bash
POST http://localhost:3000/mobile/booking
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "branchId": "your-branch-uuid",
  "deviceId": "your-device-uuid",
  "startTime": "2026-04-15T18:00:00Z",
  "endTime": "2026-04-15T20:00:00Z",
  "userNotes": "2 hour session"
}
```

**Open-ended booking (no end time):**
```bash
POST http://localhost:3000/mobile/booking
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "branchId": "your-branch-uuid",
  "deviceId": "your-device-uuid",
  "startTime": "2026-04-15T18:00:00Z",
  "userNotes": "Will play until I'm done"
}
```

### List Your Bookings

```bash
GET http://localhost:3000/mobile/booking?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

### Get Specific Booking

```bash
GET http://localhost:3000/mobile/booking/BOOKING_UUID
Authorization: Bearer YOUR_JWT_TOKEN
```

### Cancel Booking

```bash
DELETE http://localhost:3000/mobile/booking/BOOKING_UUID
Authorization: Bearer YOUR_JWT_TOKEN
```

## Common Errors & Solutions

### "Booking must be made at least 10 minutes in advance"
**Solution:** Set `startTime` to at least 10 minutes in the future.

### "Device is currently busy"
**Solution:** Choose a different device or wait until it's available.

### "Insufficient coin balance"
**Solution:** User needs to top up their coin balance first.

### "This device is already booked for the selected time range"
**Solution:** The device has a conflicting booking. This includes:
- Open-ended bookings (someone is using it with no end time)
- Overlapping time ranges
Choose a different time or device.

### "Cancellation must be done at least 10 minutes before start time"
**Solution:** Cancellation window has closed. Contact support.

## Swagger Documentation

Visit: `http://localhost:3000/api`

Look for the `mobile/booking` section for interactive API testing.

## What Happens When You Create a Booking?

1. ✅ System validates start time (10+ minutes away)
2. ✅ System validates end time (if provided, must be after start time)
3. ✅ System checks device is available
4. ✅ System verifies you have sufficient balance
5. ✅ System checks for time range conflicts (including open-ended bookings)
6. ✅ Booking created with `pending` status
7. ❌ Balance NOT deducted yet (pending confirmation)

## Booking Status Flow

```
pending → confirmed → active → completed
   ↓
cancelled
```

- `pending` - Just created, awaiting confirmation
- `confirmed` - Admin/system approved
- `active` - User checked in
- `completed` - Session finished
- `cancelled` - User cancelled
- `no_show` - User didn't show up

## Need Help?

Check the full documentation:
- `BOOKING_SYSTEM.md` - Complete system docs
- `BOOKING_CONFLICT_DETECTION.md` - Time range overlap logic
- `BOOKING_IMPLEMENTATION_SUMMARY.md` - Architecture details
