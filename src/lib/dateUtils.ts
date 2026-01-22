/**
 * Utility functions for handling dates in a hotel calendar context.
 * These functions treat date strings as "local hotel dates" to avoid timezone shifts.
 */

/**
 * Parse a date string (YYYY-MM-DD) as a local date without timezone conversion.
 * This prevents dates from shifting due to UTC interpretation.
 * 
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Date object representing the local date at noon (to avoid any DST edge cases)
 */
export function parseLocalDate(dateString: string): Date {
  // Split the date string and create a local date
  const [year, month, day] = dateString.split('-').map(Number);
  // Use noon to avoid any daylight saving time edge cases
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

/**
 * Format a Date object to YYYY-MM-DD string in local timezone.
 * Safe for database updates - won't shift due to UTC conversion.
 * 
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add days to a date and return a new Date object.
 * 
 * @param date - Original date
 * @param days - Number of days to add (can be negative)
 * @returns New Date object with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if a date falls within a month.
 * 
 * @param date - Date to check
 * @param year - Year to check against
 * @param month - Month to check against (0-indexed)
 * @returns Boolean indicating if the date is in that month
 */
export function isInMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

/**
 * Check if a date is today.
 * 
 * @param date - Date to check
 * @returns Boolean indicating if the date is today
 */
export function isDateToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is a weekend (Saturday or Sunday).
 * 
 * @param date - Date to check
 * @returns Boolean indicating if the date is a weekend
 */
export function isDateWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}
