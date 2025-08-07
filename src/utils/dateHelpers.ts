// src/utils/dateHelpers.ts

import { format as dateFnsFormat, isValid, parseISO } from 'date-fns';

/**
 * Safely formats a date string or Date object
 * Returns a formatted date string or a fallback value if the date is invalid
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatString: string = 'MM/dd/yyyy',
  fallback: string = 'N/A'
): string {
  if (!date) {
    return fallback;
  }

  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Try to parse ISO string first
      dateObj = parseISO(date);
      
      // If that fails, try direct Date constructor
      if (!isValid(dateObj)) {
        dateObj = new Date(date);
      }
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return fallback;
    }

    // Check if the date is valid
    if (!isValid(dateObj)) {
      console.warn(`Invalid date value: ${date}`);
      return fallback;
    }

    // Format the date
    return dateFnsFormat(dateObj, formatString);
  } catch (error) {
    console.error(`Error formatting date: ${date}`, error);
    return fallback;
  }
}

/**
 * Converts a date to ISO string format for API calls
 */
export function toISOString(date: string | Date | null | undefined): string {
  if (!date) {
    return new Date().toISOString();
  }

  try {
    if (typeof date === 'string') {
      const dateObj = new Date(date);
      if (isValid(dateObj)) {
        return dateObj.toISOString();
      }
    } else if (date instanceof Date && isValid(date)) {
      return date.toISOString();
    }
  } catch (error) {
    console.error(`Error converting date to ISO string: ${date}`, error);
  }

  return new Date().toISOString();
}

/**
 * Gets a date string in YYYY-MM-DD format for HTML date inputs
 */
export function toDateInputValue(date: string | Date | null | undefined): string {
  if (!date) {
    return new Date().toISOString().split('T')[0];
  }

  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    if (isValid(dateObj)) {
      return dateObj.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error(`Error converting date for input: ${date}`, error);
  }

  return new Date().toISOString().split('T')[0];
}

// Export all functions as default as well for flexibility
export default {
  formatDate,
  toISOString,
  toDateInputValue
};