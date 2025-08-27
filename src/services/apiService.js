// API Service utility for centralized API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add authorization header if token exists
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle 401/403 authentication errors
        if (response.status === 401 || response.status === 403) {
          // Clear invalid token
          localStorage.removeItem('authToken');
          // Don't redirect for auth endpoints to avoid loops
          if (!endpoint.includes('/auth/')) {
            window.location.href = '/overview';
          }
          // For auth endpoints, let the calling code handle the error
          if (endpoint.includes('/auth/')) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || 'Authentication failed');
          }
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Config API
  static async getConfig() {
    return this.request('/config');
  }

  static async updateConfig(configData) {
    return this.request('/config', {
      method: 'PUT',
      body: JSON.stringify(configData),
    });
  }

  // Device Time API
  static async setDeviceTime(deviceTime, timezone = null) {
    const payload = { deviceTime };
    if (timezone) {
      payload.timezone = timezone;
    }
    return this.request('/device-time', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Health/Ping API (enhanced with Google DNS ping)
  static async ping() {
    return this.request('/ping');
  }

  // System Information API
  static async getSystemInfo() {
    return this.request('/system-info');
  }



  // Devices API
  static async getDevices() {
    return this.request('/devices');
  }

  static async getDevicesForInterface(interfaceName) {
    return this.request(`/devices/${interfaceName}`);
  }

  static async createDevice(deviceData) {
    return this.request('/devices', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  }

  static async updateDevice(originalName, deviceData) {
    return this.request(`/devices/${originalName}`, {
      method: 'PUT',
      body: JSON.stringify(deviceData),
    });
  }

  static async deleteDevice(deviceName) {
    return this.request(`/devices/${deviceName}`, {
      method: 'DELETE',
    });
  }

  // Parameters API
  static async setParameterValue(parameterData) {
    return this.request('/parameters/set-value', {
      method: 'POST',
      body: JSON.stringify(parameterData),
    });
  }

  // Network API
  static async getNetworkInterfaces(only = null) {
    const endpoint = only ? `/net/ifaces?only=${only.join(',')}` : '/net/ifaces';
    return this.request(endpoint);
  }

  static async updateNetworkInterface(interfaceName, config) {
    return this.request(`/net/ifaces/${interfaceName}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  static async getConnectivityStatus(interfaces) {
    const endpoint = interfaces ? `/net/connectivity?interfaces=${interfaces.join(',')}` : '/net/connectivity';
    return this.request(endpoint);
  }

  // Serial API
  static async getSerialPorts() {
    return this.request('/serial/ports');
  }

  static async updateSerialPort(portId, config) {
    return this.request(`/serial/ports/${portId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // Device Connectivity Testing API
  static async testDeviceConnectivity(testConfig) {
    return this.request('/connectivity/test-connectivity', {
      method: 'POST',
      body: JSON.stringify(testConfig),
    });
  }

  // Device Blueprint API
  static async getDeviceBlueprint(reference) {
    return this.request(`/devices/blueprint/${reference}`);
  }

  static async updateDeviceBlueprint(reference, blueprintData) {
    return this.request(`/devices/blueprint/${reference}`, {
      method: 'PUT',
      body: JSON.stringify(blueprintData),
    });
  }
}

export default ApiService;
