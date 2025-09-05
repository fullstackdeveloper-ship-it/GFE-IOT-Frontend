/**
 * Centralized Configuration Management
 * Optimized for production deployment with limited resources (1GB RAM, 2.5GB disk)
 */

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || (isDevelopment ? 'http://localhost:5001' : ''),
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Socket Configuration
export const SOCKET_CONFIG = {
  URL: process.env.REACT_APP_SOCKET_URL || (isDevelopment ? 'http://localhost:5001' : ''),
  TRANSPORTS: ['websocket', 'polling'],
  TIMEOUT: 20000, // 20 seconds
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000,
  RECONNECTION_DELAY_MAX: 5000,
  RECONNECTION_DELAY_INCREMENT: 1000,
};

// Application Configuration
export const APP_CONFIG = {
  NAME: 'GFE IoT Frontend',
  VERSION: '1.0.0',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  
  // Performance optimizations for limited resources
  MAX_SENSOR_DATA_POINTS: 1000, // Limit sensor data points in memory
  MAX_LOGS: 500, // Limit log entries in memory
  MAX_ALERTS: 100, // Limit alert entries in memory
  DATA_CLEANUP_INTERVAL: 300000, // 5 minutes
  
  // UI Configuration
  THEME: {
    PRIMARY_COLOR: '#0097b2',
    SECONDARY_COLOR: '#198c1a',
    SUCCESS_COLOR: '#10b981',
    WARNING_COLOR: '#f59e0b',
    ERROR_COLOR: '#ef4444',
    INFO_COLOR: '#3b82f6',
  },
  
  // Animation Configuration
  ANIMATION: {
    DURATION: 200,
    EASING: 'ease-in-out',
  },
};

// Feature Flags
export const FEATURES = {
  ENABLE_ANIMATIONS: isDevelopment || !isProduction, // Disable animations in production for performance
  ENABLE_DEBUG_LOGS: isDevelopment,
  ENABLE_PERFORMANCE_MONITORING: isProduction,
  ENABLE_ERROR_REPORTING: isProduction,
  ENABLE_OFFLINE_MODE: true,
};

// Storage Configuration
export const STORAGE_CONFIG = {
  AUTH_TOKEN_KEY: 'gfe_auth_token',
  USER_PREFERENCES_KEY: 'gfe_user_preferences',
  CACHE_PREFIX: 'gfe_cache_',
  CACHE_EXPIRY: 300000, // 5 minutes
};

// Network Configuration
export const NETWORK_CONFIG = {
  DEFAULT_BAUD_RATES: [110, 300, 600, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200],
  DEFAULT_DATA_BITS: [5, 6, 7, 8],
  DEFAULT_STOP_BITS: [1, 2],
  DEFAULT_PARITY: ['none', 'even', 'odd', 'mark', 'space'],
  DEFAULT_MODES: ['raw', 'canonical'],
  DEFAULT_MTU: 1500,
  DEFAULT_DNS: ['8.8.8.8', '1.1.1.1'],
};

// Device Configuration
export const DEVICE_CONFIG = {
  SUPPORTED_INTERFACES: ['eth1', 'wlan0', 'serial_1', 'serial_2'],
  INTERFACE_DISPLAY_NAMES: {
    eth1: 'Ethernet 1',
    wlan0: 'WiFi',
    serial_1: 'Serial 1',
    serial_2: 'Serial 2',
  },
  DEFAULT_VENDORS: ['Generic', 'Custom'],
  MAX_DEVICES_PER_INTERFACE: 50,
};

// Validation Configuration
export const VALIDATION_CONFIG = {
  IP_ADDRESS_REGEX: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  MAC_ADDRESS_REGEX: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
  PORT_REGEX: /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
  DEVICE_NAME_REGEX: /^[a-zA-Z0-9_-]{1,50}$/,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your connection.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please login again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Settings saved successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  CONNECTED: 'Connected successfully',
  DISCONNECTED: 'Disconnected successfully',
};

// Development Configuration
export const DEV_CONFIG = {
  ENABLE_MOCK_DATA: isDevelopment,
  MOCK_DELAY: 500, // 500ms delay for mock API calls
  ENABLE_REDUX_DEVTOOLS: isDevelopment,
  ENABLE_HOT_RELOAD: isDevelopment,
};

// Production Configuration
export const PROD_CONFIG = {
  ENABLE_SERVICE_WORKER: true,
  ENABLE_CACHING: true,
  ENABLE_COMPRESSION: true,
  MINIFY_ASSETS: true,
  ENABLE_ANALYTICS: false, // Disable for privacy
};

// Export combined configuration
export const CONFIG = {
  API: API_CONFIG,
  SOCKET: SOCKET_CONFIG,
  APP: APP_CONFIG,
  FEATURES,
  STORAGE: STORAGE_CONFIG,
  NETWORK: NETWORK_CONFIG,
  DEVICE: DEVICE_CONFIG,
  VALIDATION: VALIDATION_CONFIG,
  ERRORS: ERROR_MESSAGES,
  SUCCESS: SUCCESS_MESSAGES,
  DEV: DEV_CONFIG,
  PROD: PROD_CONFIG,
  IS_DEVELOPMENT: isDevelopment,
  IS_PRODUCTION: isProduction,
};

export default CONFIG;
