/**
 * Time utility functions for booking validation
 */

export const BOOKING_MIN_ADVANCE_MINUTES = 10;

/**
 * Checks if a given time is at least X minutes in the future
 */
export function isAtLeastMinutesInFuture(time: Date, minutes: number): boolean {
  const now = new Date();
  const minTime = new Date(now.getTime() + minutes * 60 * 1000);
  return time >= minTime;
}

/**
 * Checks if booking start time meets minimum advance requirement (10 minutes)
 */
export function isValidBookingStartTime(startTime: Date): boolean {
  return isAtLeastMinutesInFuture(startTime, BOOKING_MIN_ADVANCE_MINUTES);
}

/**
 * Checks if cancellation is allowed (at least 10 minutes before start time)
 */
export function isCancellationAllowed(startTime: Date): boolean {
  return isAtLeastMinutesInFuture(startTime, BOOKING_MIN_ADVANCE_MINUTES);
}

/**
 * Gets minutes until a given time
 */
export function getMinutesUntil(time: Date): number {
  const now = new Date();
  const diff = time.getTime() - now.getTime();
  return Math.floor(diff / (60 * 1000));
}

/**
 * Formats minutes into human-readable string
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
}
