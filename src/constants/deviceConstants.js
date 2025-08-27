// Device-related constants

export const INTERFACES = {
  ETH1: 'eth1',
  WLAN0: 'wlan0',
  SERIAL_1: 'serial_1',
  SERIAL_2: 'serial_2',
  BACKEND_SERIAL_1: '/dev/ttyS4',
  BACKEND_SERIAL_2: '/dev/ttyS5'
};

export const PROTOCOLS = {
  MODBUS_TCP: 'modbus_tcp',
  MODBUS_RTU: 'modbus_rtu'
};

export const DEVICE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  ERROR: 'error',
  NOT_MONITORED: '--'
};

export const POWER_METER_ROLES = {
  GRID: 'grid_power_meter',
  GENERATOR: 'generator_power_meter',
  OTHER: 'other_power_meter'
};

export const POWER_METER_ROLE_LABELS = {
  [POWER_METER_ROLES.GRID]: 'Grid Power Meter',
  [POWER_METER_ROLES.GENERATOR]: 'Generator Power Meter',
  [POWER_METER_ROLES.OTHER]: 'Other Power Meter'
};

export const DEFAULT_VALUES = {
  TCP_PORT: 502,
  RESPONSE_TIMEOUT: 0.5,
  BYTE_TIMEOUT: 0.5,
  DEVICE_ID_MIN: 0,
  DEVICE_ID_MAX: 255,
  TCP_PORT_MIN: 1,
  TCP_PORT_MAX: 65535
};

export const SERIAL_PORT_NAMES = ['Serial 1', 'Serial 2'];

export const SERIAL_DEFAULT_OPTIONS = {
  baud: [110, 300, 600, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200],
  dataBits: [5, 6, 7, 8],
  stopBits: [1, 2],
  parity: ['none', 'even', 'odd', 'mark', 'space'],
  mode: ['raw', 'canonical']
};

export const LOG_TYPES = [
  { value: 'communication', label: 'Communication', color: 'from-blue-500 to-cyan-500' },
  { value: 'control_settings', label: 'Control Settings', color: 'from-green-500 to-emerald-500' },
  { value: 'ems', label: 'EMS Logic', color: 'from-orange-500 to-red-500' }
];

export const GRADIENT_COLORS = {
  PRIMARY: 'from-[#0097b2] to-[#198c1a]',
  HOVER: 'from-[#0088a3] to-[#167d19]',
  LIGHT: 'from-[#0097b2]/5 to-[#198c1a]/5',
  MEDIUM: 'from-[#0097b2]/10 to-[#198c1a]/10'
};
