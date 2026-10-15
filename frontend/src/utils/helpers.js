import { format, parseISO, isValid } from 'date-fns';
import { PRIORITY_COLORS, STATUS_COLORS, EMPLOYEE_STATUS_COLORS } from './constants';

/**
 * Format a date string or object to a human-readable string.
 * @param {string|Date|null} date 
 * @param {string} formatStr 
 * @returns {string}
 */
export function formatDate(date, formatStr = 'MMM dd, yyyy') {
  if (!date) return '-';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(parsedDate)) return '-';
    return format(parsedDate, formatStr);
  } catch {
    return '-';
  }
}

/**
 * Format date for HTML date input (yyyy-MM-dd).
 * @param {string|Date|null} date 
 * @returns {string}
 */
export function formatDateForInput(date) {
  if (!date) return '';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(parsedDate)) return '';
    return format(parsedDate, 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

/**
 * Get styling classes for a task priority.
 * @param {string} priority 
 * @returns {object}
 */
export function getPriorityColor(priority) {
  return PRIORITY_COLORS[priority] || {
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
  };
}

/**
 * Get styling classes for a task status.
 * @param {string} status 
 * @returns {object}
 */
export function getStatusColor(status) {
  return STATUS_COLORS[status] || {
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
    text: 'text-gray-700',
    border: 'border-gray-400',
  };
}

/**
 * Get styling classes for an employee status.
 * @param {string} status 
 * @returns {object}
 */
export function getEmployeeStatusColor(status) {
  return EMPLOYEE_STATUS_COLORS[status] || {
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
    text: 'text-gray-700',
  };
}
