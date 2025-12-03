import { format, isValid } from 'date-fns';

/**
 * Formats a date string or object into a human-readable format (e.g., "Dec 2, 2025").
 * Handles ISO strings, YYYY-MM-DD strings, and Date objects.
 * Returns '—' for invalid or missing dates.
 * 
 * @param {string|Date} dateValue - The date to format
 * @param {string} formatStr - Optional format string (default: 'MMM d, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (dateValue, formatStr = 'MMM d, yyyy') => {
  if (!dateValue) return '—';
  
  try {
    const date = new Date(dateValue);
    
    if (!isValid(date)) {
      return '—'; // Return dash instead of original string if invalid to avoid ugly errors
    }
    
    return format(date, formatStr);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return '—';
  }
};