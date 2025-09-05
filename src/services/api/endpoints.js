/**
 * Organized API Endpoints
 * Centralized endpoint definitions for better maintainability
 */

import apiService from './index';

// System & Health Endpoints
export const systemApi = {
  getConfig: () => apiService.get('/config'),
  updateConfig: (configData) => apiService.put('/config', configData),
  getSystemInfo: () => apiService.get('/system-info'),
  ping: () => apiService.get('/ping'),
  setDeviceTime: (deviceTime, timezone = null) => {
    const payload = { deviceTime };
    if (timezone) payload.timezone = timezone;
    return apiService.post('/device-time', payload);
  },
};

// Device Management Endpoints
export const deviceApi = {
  getAllDevices: () => apiService.get('/devices'),
  getDevicesByInterface: (interfaceName) => apiService.get(`/devices/${interfaceName}`),
  createDevice: (deviceData) => apiService.post('/devices', deviceData),
  updateDevice: (originalName, deviceData) => apiService.put(`/devices/${originalName}`, deviceData),
  deleteDevice: (deviceName) => apiService.delete(`/devices/${deviceName}`),
  getDeviceBlueprint: (reference) => apiService.get(`/devices/blueprint/${reference}`),
  updateDeviceBlueprint: (reference, blueprintData) => apiService.put(`/devices/blueprint/${reference}`, blueprintData),
};

// Network Management Endpoints
export const networkApi = {
  getInterfaces: (only = null) => {
    const params = only ? { only: only.join(',') } : {};
    return apiService.get('/net/ifaces', params);
  },
  updateInterface: (interfaceName, config) => apiService.put(`/net/ifaces/${interfaceName}`, config),
  getConnectivityStatus: (interfaces = null) => {
    const params = interfaces ? { interfaces: interfaces.join(',') } : {};
    return apiService.get('/net/connectivity', params);
  },
};

// Serial Port Management Endpoints
export const serialApi = {
  getPorts: () => apiService.get('/serial/ports'),
  updatePort: (portId, config) => apiService.put(`/serial/ports/${portId}`, config),
  getPortConfig: (portId) => apiService.get(`/serial/ports/${portId}`),
};

// Parameter Management Endpoints
export const parameterApi = {
  setValue: (parameterData) => apiService.post('/parameters/set-value', parameterData),
  getValues: () => apiService.get('/parameters'),
  getValue: (parameterName) => apiService.get(`/parameters/${parameterName}`),
};

// Connectivity Testing Endpoints
export const connectivityApi = {
  testDeviceConnectivity: (testConfig) => apiService.post('/connectivity/test-connectivity', testConfig),
  testNetworkConnectivity: (testConfig) => apiService.post('/connectivity/test-network', testConfig),
  testSerialConnectivity: (testConfig) => apiService.post('/connectivity/test-serial', testConfig),
};

// Authentication Endpoints (if needed)
export const authApi = {
  login: (credentials) => apiService.post('/auth/login', credentials),
  logout: () => apiService.post('/auth/logout'),
  refreshToken: () => apiService.post('/auth/refresh'),
  validateToken: () => apiService.get('/auth/validate'),
};

// Data Export/Import Endpoints
export const dataApi = {
  exportConfig: () => apiService.get('/data/export/config'),
  exportDevices: () => apiService.get('/data/export/devices'),
  importConfig: (configData) => apiService.post('/data/import/config', configData),
  importDevices: (devicesData) => apiService.post('/data/import/devices', devicesData),
};

// Logs and Monitoring Endpoints
export const monitoringApi = {
  getLogs: (params = {}) => apiService.get('/monitoring/logs', params),
  getAlerts: (params = {}) => apiService.get('/monitoring/alerts', params),
  getMetrics: (params = {}) => apiService.get('/monitoring/metrics', params),
  clearLogs: () => apiService.delete('/monitoring/logs'),
  clearAlerts: () => apiService.delete('/monitoring/alerts'),
};

// Combined API object for easy importing
export const api = {
  system: systemApi,
  device: deviceApi,
  network: networkApi,
  serial: serialApi,
  parameter: parameterApi,
  connectivity: connectivityApi,
  auth: authApi,
  data: dataApi,
  monitoring: monitoringApi,
};

export default api;
