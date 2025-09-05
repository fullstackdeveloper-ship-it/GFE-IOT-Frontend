/**
 * Optimized Socket Service
 * Single socket connection class with efficient resource management
 * Optimized for production deployment with limited resources
 */

import io from 'socket.io-client';
import { CONFIG } from '../../config';
import { store } from '../../store';
import { 
  setSocketData, 
  setPowerFlowData, 
  setConnectionStatus, 
  addSensorData, 
  clearSensorData 
} from '../../features/sensorSlice';
import { addLog, clearLogs } from '../../features/logsSlice';
import { addAlert, clearAlerts } from '../../features/alertsSlice';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = CONFIG.SOCKET.RECONNECTION_ATTEMPTS;
    this.reconnectDelay = CONFIG.SOCKET.RECONNECTION_DELAY;
    this.eventListeners = new Map();
    this.connectionState = 'disconnected';
    this.lastHeartbeat = null;
    this.heartbeatInterval = null;
    this.cleanupInterval = null;
    
    // Performance optimization: batch data updates
    this.dataBuffer = [];
    this.bufferSize = 10;
    this.bufferTimeout = 100; // 100ms
    this.bufferTimer = null;
  }

  /**
   * Initialize socket connection
   */
  connect(url = CONFIG.SOCKET.URL) {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    try {
      this.socket = io(url, {
        transports: CONFIG.SOCKET.TRANSPORTS,
        timeout: CONFIG.SOCKET.TIMEOUT,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: CONFIG.SOCKET.RECONNECTION_DELAY_MAX,
        reconnectionDelayIncrement: CONFIG.SOCKET.RECONNECTION_DELAY_INCREMENT,
        forceNew: true,
      });

      this.setupEventListeners();
      this.startHeartbeat();
      this.startDataCleanup();
      
    } catch (error) {
      console.error('Socket connection error:', error);
      this.handleConnectionError(error);
    }
  }

  /**
   * Setup all socket event listeners
   */
  setupEventListeners() {
    // Connection events
    this.socket.on('connect', this.handleConnect.bind(this));
    this.socket.on('disconnect', this.handleDisconnect.bind(this));
    this.socket.on('connect_error', this.handleConnectionError.bind(this));
    this.socket.on('reconnect', this.handleReconnect.bind(this));
    this.socket.on('reconnect_attempt', this.handleReconnectAttempt.bind(this));
    this.socket.on('reconnect_failed', this.handleReconnectFailed.bind(this));

    // Data events
    this.socket.on('sensor-data', this.handleSensorData.bind(this));
    this.socket.on('power-flow-data', this.handlePowerFlowData.bind(this));
    this.socket.on('power-flow-update', this.handlePowerFlowUpdate.bind(this));
    
    // System events
    this.socket.on('alert', this.handleAlert.bind(this));
    this.socket.on('log', this.handleLog.bind(this));
    this.socket.on('client_joined', this.handleClientJoined.bind(this));
    this.socket.on('client_left', this.handleClientLeft.bind(this));
    
    // Heartbeat
    this.socket.on('heartbeat', this.handleHeartbeat.bind(this));
  }

  /**
   * Connection event handlers
   */
  handleConnect() {
    console.log('✅ Socket connected');
    this.isConnected = true;
    this.connectionState = 'connected';
    this.reconnectAttempts = 0;
    this.reconnectDelay = CONFIG.SOCKET.RECONNECTION_DELAY;
    
    store.dispatch(setConnectionStatus(true));
    store.dispatch(addLog({
      level: 'info',
      message: 'Connected to server',
      timestamp: new Date().toISOString(),
    }));
  }

  handleDisconnect(reason) {
    console.log('❌ Socket disconnected:', reason);
    this.isConnected = false;
    this.connectionState = 'disconnected';
    
    store.dispatch(setConnectionStatus(false));
    store.dispatch(addLog({
      level: 'warning',
      message: `Disconnected from server: ${reason}`,
      timestamp: new Date().toISOString(),
    }));

    this.handleDisconnectionReason(reason);
  }

  handleConnectionError(error) {
    console.error('🔌 Socket connection error:', error);
    this.connectionState = 'error';
    
    store.dispatch(setConnectionStatus(false));
    store.dispatch(addLog({
      level: 'error',
      message: `Connection error: ${error.message}`,
      timestamp: new Date().toISOString(),
    }));
  }

  handleReconnect(attemptNumber) {
    console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
    this.isConnected = true;
    this.connectionState = 'connected';
    this.reconnectAttempts = 0;
    
    store.dispatch(setConnectionStatus(true));
    store.dispatch(addLog({
      level: 'info',
      message: `Reconnected to server after ${attemptNumber} attempts`,
      timestamp: new Date().toISOString(),
    }));
  }

  handleReconnectAttempt(attemptNumber) {
    console.log('🔄 Reconnection attempt', attemptNumber);
    this.reconnectAttempts = attemptNumber;
    this.connectionState = 'reconnecting';
  }

  handleReconnectFailed() {
    console.log('❌ Reconnection failed after', this.maxReconnectAttempts, 'attempts');
    this.isConnected = false;
    this.connectionState = 'failed';
    
    store.dispatch(setConnectionStatus(false));
    store.dispatch(addLog({
      level: 'error',
      message: `Reconnection failed after ${this.maxReconnectAttempts} attempts`,
      timestamp: new Date().toISOString(),
    }));
  }

  /**
   * Data event handlers with batching for performance
   */
  handleSensorData(data) {
    this.bufferData('sensor', data);
  }

  handlePowerFlowData(data) {
    store.dispatch(setPowerFlowData(data));
  }

  handlePowerFlowUpdate(data) {
    console.log('📊 Received power-flow-update:', data.batchId);
    store.dispatch(setPowerFlowData(data));
  }

  handleAlert(alertData) {
    store.dispatch(addAlert(alertData));
  }

  handleLog(logData) {
    store.dispatch(addLog(logData));
  }

  handleClientJoined(data) {
    store.dispatch(addLog({
      level: 'info',
      message: `New client connected (Total: ${data.total_clients})`,
      timestamp: new Date().toISOString(),
    }));
  }

  handleClientLeft(data) {
    store.dispatch(addLog({
      level: 'info',
      message: `Client disconnected (Total: ${data.total_clients})`,
      timestamp: new Date().toISOString(),
    }));
  }

  handleHeartbeat(data) {
    this.lastHeartbeat = Date.now();
  }

  /**
   * Buffer data for batch processing (performance optimization)
   */
  bufferData(type, data) {
    this.dataBuffer.push({ type, data, timestamp: Date.now() });
    
    if (this.dataBuffer.length >= this.bufferSize) {
      this.processBufferedData();
    } else if (!this.bufferTimer) {
      this.bufferTimer = setTimeout(() => {
        this.processBufferedData();
      }, this.bufferTimeout);
    }
  }

  processBufferedData() {
    if (this.dataBuffer.length === 0) return;

    // Process sensor data
    const sensorData = this.dataBuffer
      .filter(item => item.type === 'sensor')
      .map(item => ({
        ...item.data,
        timestamp: new Date(item.timestamp).toISOString(),
      }));

    if (sensorData.length > 0) {
      // Batch update sensor data
      sensorData.forEach(data => {
        store.dispatch(setSocketData(data));
        store.dispatch(addSensorData(data));
      });
    }

    // Clear buffer
    this.dataBuffer = [];
    if (this.bufferTimer) {
      clearTimeout(this.bufferTimer);
      this.bufferTimer = null;
    }
  }

  /**
   * Handle different disconnection reasons
   */
  handleDisconnectionReason(reason) {
    switch (reason) {
      case 'io server disconnect':
        this.handleServerDisconnect();
        break;
      case 'io client disconnect':
        this.handleClientDisconnect();
        break;
      default:
        this.handleNetworkDisconnect();
    }
  }

  handleServerDisconnect() {
    console.log('🔄 Server initiated disconnect - cleaning up state');
    this.cleanupState();
  }

  handleClientDisconnect() {
    console.log('🔄 Client initiated disconnect - keeping state for reconnection');
  }

  handleNetworkDisconnect() {
    console.log('🔄 Network disconnect - keeping state for reconnection');
  }

  /**
   * Clean up application state
   */
  cleanupState() {
    console.log('🧹 Cleaning up application state');
    
    // Clear sensor data (keep recent data)
    store.dispatch(clearSensorData());
    
    // Clear logs (keep recent ones)
    store.dispatch(clearLogs());
    
    // Clear alerts (keep recent ones)
    store.dispatch(clearAlerts());
    
    // Add cleanup log
    store.dispatch(addLog({
      level: 'info',
      message: 'Application state cleared due to server disconnect',
      timestamp: new Date().toISOString(),
    }));
  }

  /**
   * Start heartbeat monitoring
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.socket) {
        this.socket.emit('ping');
      }
    }, 30000); // 30 seconds
  }

  /**
   * Start periodic data cleanup for memory optimization
   */
  startDataCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.performDataCleanup();
    }, CONFIG.APP.DATA_CLEANUP_INTERVAL);
  }

  performDataCleanup() {
    // This would be implemented based on your Redux store structure
    // to limit memory usage by removing old data points
    console.log('🧹 Performing periodic data cleanup');
  }

  /**
   * Public methods
   */
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      this.eventListeners.set(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      this.eventListeners.delete(event);
    }
  }

  disconnect() {
    console.log('🔌 Manually disconnecting from server');
    
    // Clear intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    if (this.bufferTimer) {
      clearTimeout(this.bufferTimer);
      this.bufferTimer = null;
    }
    
    // Disconnect socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.connectionState = 'disconnected';
    
    // Clean up state on manual disconnect
    this.cleanupState();
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      state: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      lastHeartbeat: this.lastHeartbeat,
    };
  }

  forceReconnect() {
    if (this.socket) {
      console.log('🔄 Forcing reconnection...');
      this.socket.connect();
    }
  }

  /**
   * Get connection health metrics
   */
  getHealthMetrics() {
    return {
      isConnected: this.isConnected,
      connectionState: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      lastHeartbeat: this.lastHeartbeat,
      bufferSize: this.dataBuffer.length,
      uptime: this.lastHeartbeat ? Date.now() - this.lastHeartbeat : null,
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
