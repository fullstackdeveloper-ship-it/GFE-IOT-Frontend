// API Service utility for centralized API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

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
}

export default ApiService;
