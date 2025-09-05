/**
 * Centralized API Service
 * Organized, scalable, and optimized for production deployment
 */

import { CONFIG } from '../../config';

class ApiService {
  constructor() {
    this.baseURL = CONFIG.API.BASE_URL;
    this.timeout = CONFIG.API.TIMEOUT;
    this.retryAttempts = CONFIG.API.RETRY_ATTEMPTS;
    this.retryDelay = CONFIG.API.RETRY_DELAY;
  }

  /**
   * Core request method with retry logic and error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    defaultOptions.signal = controller.signal;

    try {
      const response = await this.executeWithRetry(url, defaultOptions);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        await this.handleErrorResponse(response, endpoint);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleRequestError(error, endpoint);
    }
  }

  /**
   * Execute request with retry logic
   */
  async executeWithRetry(url, options, attempt = 1) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * attempt);
        return this.executeWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Determine if request should be retried
   */
  shouldRetry(error) {
    return (
      error.name === 'AbortError' ||
      error.name === 'TypeError' ||
      (error.response && error.response.status >= 500)
    );
  }

  /**
   * Handle error responses
   */
  async handleErrorResponse(response, endpoint) {
    if (response.status === 401 || response.status === 403) {
      this.clearAuthToken();
      if (!endpoint.includes('/auth/')) {
        window.location.href = '/overview';
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || CONFIG.ERRORS.AUTHENTICATION_ERROR);
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  /**
   * Handle request errors
   */
  handleRequestError(error, endpoint) {
    console.error(`API request failed for ${endpoint}:`, error);
    
    if (error.name === 'AbortError') {
      return new Error(CONFIG.ERRORS.TIMEOUT_ERROR);
    }
    
    if (error.message.includes('Failed to fetch')) {
      return new Error(CONFIG.ERRORS.NETWORK_ERROR);
    }
    
    return error;
  }

  /**
   * Utility methods
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getAuthToken() {
    return localStorage.getItem(CONFIG.STORAGE.AUTH_TOKEN_KEY);
  }

  clearAuthToken() {
    localStorage.removeItem(CONFIG.STORAGE.AUTH_TOKEN_KEY);
  }

  /**
   * HTTP Methods
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
