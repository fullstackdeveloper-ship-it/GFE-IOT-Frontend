/**
 * Validation Utilities
 * Centralized validation functions for form inputs and data
 */

import { CONFIG } from '../config';

export const validators = {
  // IP Address validation
  ipAddress: (value) => {
    if (!value) return 'IP address is required';
    if (!CONFIG.VALIDATION.IP_ADDRESS_REGEX.test(value)) {
      return 'Invalid IP address format';
    }
    return null;
  },

  // MAC Address validation
  macAddress: (value) => {
    if (!value) return 'MAC address is required';
    if (!CONFIG.VALIDATION.MAC_ADDRESS_REGEX.test(value)) {
      return 'Invalid MAC address format';
    }
    return null;
  },

  // Port validation
  port: (value) => {
    if (!value) return 'Port is required';
    const portNum = parseInt(value, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      return 'Port must be between 1 and 65535';
    }
    return null;
  },

  // Device name validation
  deviceName: (value) => {
    if (!value) return 'Device name is required';
    if (!CONFIG.VALIDATION.DEVICE_NAME_REGEX.test(value)) {
      return 'Device name can only contain letters, numbers, hyphens, and underscores (max 50 characters)';
    }
    return null;
  },

  // Required field validation
  required: (value, fieldName = 'Field') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Email validation
  email: (value) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Invalid email format';
    }
    return null;
  },

  // Number validation
  number: (value, min = null, max = null) => {
    if (!value) return 'Number is required';
    const num = parseFloat(value);
    if (isNaN(num)) return 'Must be a valid number';
    if (min !== null && num < min) return `Must be at least ${min}`;
    if (max !== null && num > max) return `Must be at most ${max}`;
    return null;
  },

  // Integer validation
  integer: (value, min = null, max = null) => {
    if (!value) return 'Integer is required';
    const num = parseInt(value, 10);
    if (isNaN(num) || !Number.isInteger(parseFloat(value))) {
      return 'Must be a valid integer';
    }
    if (min !== null && num < min) return `Must be at least ${min}`;
    if (max !== null && num > max) return `Must be at most ${max}`;
    return null;
  },

  // Baud rate validation
  baudRate: (value) => {
    if (!value) return 'Baud rate is required';
    const validRates = CONFIG.NETWORK.DEFAULT_BAUD_RATES;
    if (!validRates.includes(parseInt(value, 10))) {
      return `Baud rate must be one of: ${validRates.join(', ')}`;
    }
    return null;
  },

  // Data bits validation
  dataBits: (value) => {
    if (!value) return 'Data bits is required';
    const validBits = CONFIG.NETWORK.DEFAULT_DATA_BITS;
    if (!validBits.includes(parseInt(value, 10))) {
      return `Data bits must be one of: ${validBits.join(', ')}`;
    }
    return null;
  },

  // Stop bits validation
  stopBits: (value) => {
    if (!value) return 'Stop bits is required';
    const validBits = CONFIG.NETWORK.DEFAULT_STOP_BITS;
    if (!validBits.includes(parseInt(value, 10))) {
      return `Stop bits must be one of: ${validBits.join(', ')}`;
    }
    return null;
  },

  // Parity validation
  parity: (value) => {
    if (!value) return 'Parity is required';
    const validParity = CONFIG.NETWORK.DEFAULT_PARITY;
    if (!validParity.includes(value)) {
      return `Parity must be one of: ${validParity.join(', ')}`;
    }
    return null;
  },

  // Mode validation
  mode: (value) => {
    if (!value) return 'Mode is required';
    const validModes = CONFIG.NETWORK.DEFAULT_MODES;
    if (!validModes.includes(value)) {
      return `Mode must be one of: ${validModes.join(', ')}`;
    }
    return null;
  },

  // MTU validation
  mtu: (value) => {
    if (!value) return 'MTU is required';
    const mtu = parseInt(value, 10);
    if (isNaN(mtu) || mtu < 576 || mtu > 9000) {
      return 'MTU must be between 576 and 9000';
    }
    return null;
  },

  // DNS validation
  dns: (value) => {
    if (!value || !Array.isArray(value)) return 'DNS servers are required';
    if (value.length === 0) return 'At least one DNS server is required';
    
    for (const dns of value) {
      const error = validators.ipAddress(dns);
      if (error) return `Invalid DNS server: ${error}`;
    }
    return null;
  },
};

/**
 * Validate form data against a schema
 */
export const validateForm = (data, schema) => {
  const errors = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate a single field
 */
export const validateField = (value, validators) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) return error;
  }
  return null;
};

export default validators;
