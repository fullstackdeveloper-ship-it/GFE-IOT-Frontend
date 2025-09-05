/**
 * Helper Utilities
 * Common utility functions for the application
 */

import { CONFIG } from '../config';

/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format timestamp to readable format
 */
export const formatTimestamp = (timestamp, options = {}) => {
  const {
    includeTime = true,
    includeDate = true,
    format = 'default'
  } = options;
  
  const date = new Date(timestamp);
  
  if (format === 'relative') {
    return getRelativeTime(date);
  }
  
  const dateStr = includeDate ? date.toLocaleDateString() : '';
  const timeStr = includeTime ? date.toLocaleTimeString() : '';
  
  return [dateStr, timeStr].filter(Boolean).join(' ');
};

/**
 * Get relative time (e.g., "2 minutes ago")
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Generate unique ID
 */
export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Get nested object property safely
 */
export const getNestedProperty = (obj, path, defaultValue = null) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue;
  }, obj);
};

/**
 * Set nested object property safely
 */
export const setNestedProperty = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    return current[key];
  }, obj);
  target[lastKey] = value;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert string to kebab-case
 */
export const toKebabCase = (str) => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

/**
 * Convert string to camelCase
 */
export const toCamelCase = (str) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
};

/**
 * Get interface display name
 */
export const getInterfaceDisplayName = (interfaceName) => {
  return CONFIG.DEVICE.INTERFACE_DISPLAY_NAMES[interfaceName] || interfaceName;
};

/**
 * Check if device is online
 */
export const isDeviceOnline = (device) => {
  if (!device || !device.lastSeen) return false;
  const lastSeen = new Date(device.lastSeen);
  const now = new Date();
  const diffInMinutes = (now - lastSeen) / (1000 * 60);
  return diffInMinutes < 5; // Consider online if seen within 5 minutes
};

/**
 * Get device status color
 */
export const getDeviceStatusColor = (device) => {
  if (isDeviceOnline(device)) {
    return CONFIG.APP.THEME.SUCCESS_COLOR;
  }
  return CONFIG.APP.THEME.ERROR_COLOR;
};

/**
 * Format device status
 */
export const formatDeviceStatus = (device) => {
  return isDeviceOnline(device) ? 'Online' : 'Offline';
};

/**
 * Get log level color
 */
export const getLogLevelColor = (level) => {
  const colors = {
    error: CONFIG.APP.THEME.ERROR_COLOR,
    warning: CONFIG.APP.THEME.WARNING_COLOR,
    info: CONFIG.APP.THEME.INFO_COLOR,
    success: CONFIG.APP.THEME.SUCCESS_COLOR,
    debug: '#6b7280',
  };
  return colors[level] || colors.info;
};

/**
 * Get alert severity color
 */
export const getAlertSeverityColor = (severity) => {
  const colors = {
    critical: CONFIG.APP.THEME.ERROR_COLOR,
    high: '#f97316',
    medium: CONFIG.APP.THEME.WARNING_COLOR,
    low: CONFIG.APP.THEME.INFO_COLOR,
    info: CONFIG.APP.THEME.INFO_COLOR,
  };
  return colors[severity] || colors.info;
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Sleep/delay function
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
export const retry = async (fn, maxAttempts = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await sleep(delay * Math.pow(2, attempt - 1));
    }
  }
};

/**
 * Check if running in production
 */
export const isProduction = () => {
  return CONFIG.IS_PRODUCTION;
};

/**
 * Check if running in development
 */
export const isDevelopment = () => {
  return CONFIG.IS_DEVELOPMENT;
};

export default {
  formatBytes,
  formatTimestamp,
  getRelativeTime,
  debounce,
  throttle,
  deepClone,
  generateId,
  isEmpty,
  getNestedProperty,
  setNestedProperty,
  capitalize,
  toKebabCase,
  toCamelCase,
  getInterfaceDisplayName,
  isDeviceOnline,
  getDeviceStatusColor,
  formatDeviceStatus,
  getLogLevelColor,
  getAlertSeverityColor,
  truncateText,
  sleep,
  retry,
  isProduction,
  isDevelopment,
};
