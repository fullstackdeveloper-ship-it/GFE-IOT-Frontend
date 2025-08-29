// Common utility functions for device management

/**
 * Get interface display name
 * @param {string} ifaceKey - Interface key
 * @returns {string} Display name
 */
export const getInterfaceDisplayName = (ifaceKey) => {
  const displayNames = {
    'eth1': 'Ethernet1',
    'wlan0': 'WiFi',
    'serial_1': 'Serial 1',
    'serial_2': 'Serial 2',
    '/dev/ttyS4': 'Serial 1',
    '/dev/ttyS5': 'Serial 2'
  };
  return displayNames[ifaceKey] || ifaceKey;
};

/**
 * Get interface icon component name
 * @param {string} interfaceName - Interface name
 * @returns {string} Icon type
 */
export const getInterfaceIconName = (interfaceName) => {
  if (interfaceName.startsWith('eth')) {
    return 'Router';
  } else if (interfaceName === 'wifi') {
    return 'Wifi';
  } else if (interfaceName.startsWith('serial')) {
    return 'Cable';
  }
  return 'Server';
};

/**
 * Get interface icon JSX element
 * @param {string} interfaceName - Interface name
 * @param {Object} icons - Icon components object
 * @param {Object} props - Props to pass to the icon
 * @returns {JSX.Element} Icon component
 */
export const getInterfaceIcon = (interfaceName, icons, props = {}) => {
  const iconName = getInterfaceIconName(interfaceName);
  const IconComponent = icons[iconName];
  return IconComponent ? <IconComponent {...props} /> : <icons.Server {...props} />;
};

/**
 * Get interface badge styling
 * @param {string} interfaceName - Interface name
 * @returns {string} CSS classes
 */
export const getInterfaceBadge = (interfaceName) => {
  const baseClasses = "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium";
  
  if (interfaceName.startsWith('eth')) {
    return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
  } else if (interfaceName === 'wifi') {
    return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
  } else if (interfaceName.startsWith('serial')) {
    return `${baseClasses} bg-purple-100 text-purple-800 border border-purple-200`;
  }
  return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
};

/**
 * Get device type badge styling
 * @param {string} deviceType - Device type
 * @returns {string} CSS classes
 */
export const getTypeBadgeClasses = (deviceType) => {
  const baseClasses = "inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium";
  
  if (!deviceType) return `${baseClasses} bg-gray-100 text-gray-800`;
  
  const type = deviceType.toLowerCase();
  
  if (type.includes('inverter')) {
    return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
  } else if (type.includes('bms')) {
    return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
  } else if (type.includes('meter')) {
    return `${baseClasses} bg-purple-100 text-purple-800 border border-purple-200`;
  } else if (type.includes('controller')) {
    return `${baseClasses} bg-orange-100 text-orange-800 border border-orange-200`;
  }
  
  return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
};

/**
 * Get device type badge JSX element
 * @param {Object|string} deviceOrType - Device object or device type string
 * @returns {JSX.Element} Badge component
 */
export const getTypeBadge = (deviceOrType) => {
  // Handle case where deviceOrType is a string (backward compatibility)
  if (typeof deviceOrType === 'string') {
    if (!deviceOrType) {
      return <span className="text-gray-400 text-xs">Unknown</span>;
    }
    
    const formattedType = formatDeviceType(deviceOrType);
    const className = getTypeBadgeClasses(deviceOrType);
    
    return (
      <span className={className}>
        {formattedType}
      </span>
    );
  }
  
  // Handle case where deviceOrType is a device object
  if (deviceOrType && typeof deviceOrType === 'object') {
    const device = deviceOrType;
    
    // If device has a role, show the role text
    if (device.role) {
      const roleLabels = {
        'grid_power_meter': 'Grid Power Meter',
        'generator_power_meter': 'Generator Power Meter',
        'other_power_meter': 'Other Power Meter'
      };
      
      const roleText = roleLabels[device.role] || formatDeviceType(device.role);
      const className = getTypeBadgeClasses(device.device_type || 'power_meter');
      
      return (
        <span className={className}>
          {roleText}
        </span>
      );
    }
    
    // Otherwise, show the device type or reference
    if (!device.device_type) {
      // If no device_type, show the reference instead
      if (device.reference) {
        const className = getTypeBadgeClasses('reference');
        return (
          <span className={className}>
            {device.reference}
          </span>
        );
      }
      return <span className="text-gray-400 text-xs">Unknown</span>;
    }
    
    const formattedType = formatDeviceType(device.device_type);
    const className = getTypeBadgeClasses(device.device_type);
    
    return (
      <span className={className}>
        {formattedType}
      </span>
    );
  }
  
  return <span className="text-gray-400 text-xs">Unknown</span>;
};

/**
 * Get status badge styling
 * @param {string} status - Device status
 * @returns {string} CSS classes
 */
export const getStatusBadge = (status) => {
  const baseClasses = "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold";
  
  if (status === '--') {
    return `${baseClasses} bg-gray-50 text-gray-500 border border-gray-200`;
  }
  
  switch (status) {
    case 'online':
      return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
    case 'offline':
      return `${baseClasses} bg-gray-100 text-gray-600 border border-gray-200`;
    case 'error':
      return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
    default:
      return `${baseClasses} bg-gray-50 text-gray-500 border border-gray-200`;
  }
};

/**
 * Validate IPv4 address
 * @param {string} ip - IP address to validate
 * @returns {boolean} Is valid IPv4
 */
export const isValidIPv4 = (ip) => {
  if (typeof ip !== 'string') return false;
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return false;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return false;
    const n = Number(part);
    if (n < 0 || n > 255) return false;
  }
  return true;
};

/**
 * Map frontend interface names to backend interface names
 * @param {string} iface - Frontend interface name
 * @returns {string} Backend interface name
 */
export const mapToBackendInterface = (iface) => {
  const interfaceMapping = {
    'serial_1': '/dev/ttyS4',
    'serial_2': '/dev/ttyS5'
  };
  return interfaceMapping[iface] || iface;
};

/**
 * Map backend interface names to frontend interface names
 * @param {string} backendInterface - Backend interface name
 * @returns {string} Frontend interface name
 */
export const mapToFrontendInterface = (backendInterface) => {
  const interfaceMapping = {
    '/dev/ttyS4': 'serial_1',
    '/dev/ttyS5': 'serial_2'
  };
  return interfaceMapping[backendInterface] || backendInterface;
};

/**
 * Get default protocol for interface
 * @param {string} iface - Interface name
 * @returns {string} Default protocol
 */
export const getDefaultProtocol = (iface) => {
  return (iface === 'eth1' || iface === 'wlan0') ? 'modbus_tcp' : 'modbus_rtu';
};

/**
 * Format device type for display
 * @param {string} deviceType - Raw device type
 * @returns {string} Formatted device type
 */
export const formatDeviceType = (deviceType) => {
  if (!deviceType) return '';
  return deviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Get device type or role text (string only, no JSX)
 * @param {Object|string} deviceOrType - Device object or device type string
 * @returns {string} Device type or role text
 */
export const getDeviceTypeText = (deviceOrType) => {
  // Handle case where deviceOrType is a string (backward compatibility)
  if (typeof deviceOrType === 'string') {
    if (!deviceOrType) return 'Unknown';
    return formatDeviceType(deviceOrType);
  }
  
  // Handle case where deviceOrType is a device object
  if (deviceOrType && typeof deviceOrType === 'object') {
    const device = deviceOrType;
    
    // If device has a role, show the role text
    if (device.role) {
      const roleLabels = {
        'grid_power_meter': 'Grid Power Meter',
        'generator_power_meter': 'Generator Power Meter',
        'other_power_meter': 'Other Power Meter'
      };
      
      return roleLabels[device.role] || formatDeviceType(device.role);
    }
    
    // Otherwise, show the device type
    if (!device.device_type) return 'Unknown';
    return formatDeviceType(device.device_type);
  }
  
  return 'Unknown';
};
