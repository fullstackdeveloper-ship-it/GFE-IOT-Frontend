import io from 'socket.io-client';
import { store } from '../store';
import { setSocketData, setPowerFlowData, setConnectionStatus, addSensorData, clearSensorData } from '../features/sensorSlice';
import { addLog, clearLogs } from '../features/logsSlice';
import { addAlert, clearAlerts } from '../features/alertsSlice';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
  }

  connect(url = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001') {
    try {
      this.socket = io(url, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000; // Reset delay
        
        store.dispatch(setConnectionStatus(true));
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        this.isConnected = false;
        
        store.dispatch(setConnectionStatus(false));

        // Handle different disconnection reasons
        if (reason === 'io server disconnect') {
          // Server initiated disconnect
          console.log('Server initiated disconnect');
          this.handleServerDisconnect();
        } else if (reason === 'io client disconnect') {
          // Client initiated disconnect
          console.log('Client initiated disconnect');
          this.handleClientDisconnect();
        } else {
          // Network error or other reason
          console.log('Network error or other reason for disconnect');
          this.handleNetworkDisconnect();
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('Reconnected to server after', attemptNumber, 'attempts');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        store.dispatch(setConnectionStatus(true));
      });

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('Reconnection attempt', attemptNumber);
        this.reconnectAttempts = attemptNumber;
        

      });

      this.socket.on('reconnect_failed', () => {
        console.log('Reconnection failed after', this.maxReconnectAttempts, 'attempts');
        this.isConnected = false;
        
        store.dispatch(setConnectionStatus(false));
      });

      this.socket.on('sensor-data', (data) => {
        console.log('Received sensor data:', data);
        store.dispatch(setSocketData(data));
        store.dispatch(addSensorData({
          ...data,
          timestamp: new Date().toISOString(),
        }));
      });

      this.socket.on('power-flow-data', (data) => {
        store.dispatch(setPowerFlowData(data));
      });

      // Listen for power-flow-update events from the backend
      this.socket.on('power-flow-update', (data) => {
        console.log('📊 SocketService - Received power-flow-update:', data.batchId);
        store.dispatch(setPowerFlowData(data));
      });

      this.socket.on('alert', (alertData) => {
        store.dispatch(addAlert(alertData));
      });

      this.socket.on('log', (logData) => {
        store.dispatch(addLog(logData));
      });

      // Handle client join/leave notifications
      this.socket.on('client_joined', (data) => {
        store.dispatch(addLog({
          level: 'info',
          message: `New client connected (Total: ${data.total_clients})`,
          timestamp: new Date().toISOString(),
        }));
      });

      this.socket.on('client_left', (data) => {
        store.dispatch(addLog({
          level: 'info',
          message: `Client disconnected (Total: ${data.total_clients})`,
          timestamp: new Date().toISOString(),
        }));
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        store.dispatch(setConnectionStatus(false));
      });

    } catch (error) {
      console.error('Socket connection error:', error);

    }
  }

  handleServerDisconnect() {
    // Server initiated disconnect - clean up state
    console.log('Handling server disconnect - cleaning up state');
    this.cleanupState();
  }

  handleClientDisconnect() {
    // Client initiated disconnect - keep state for reconnection
    console.log('Handling client disconnect - keeping state for reconnection');
  }

  handleNetworkDisconnect() {
    // Network error - keep state for reconnection
    console.log('Handling network disconnect - keeping state for reconnection');
  }

  cleanupState() {
    // Clean up all state data when server disconnects
    console.log('Cleaning up application state');
    
    // Clear sensor data
    store.dispatch(clearSensorData());
    
    // Clear logs (keep some recent ones)
    store.dispatch(clearLogs());
    
    // Clear alerts (keep some recent ones)
    store.dispatch(clearAlerts());
    
    // Add cleanup log
    store.dispatch(addLog({
      level: 'info',
      message: 'Application state cleared due to server disconnect',
      timestamp: new Date().toISOString(),
    }));
  }

  disconnect() {
    if (this.socket) {
      console.log('Manually disconnecting from server');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      
      // Clean up state on manual disconnect
      this.cleanupState();
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }

  getReconnectAttempts() {
    return this.reconnectAttempts;
  }

  forceReconnect() {
    if (this.socket) {
      console.log('Forcing reconnection...');
      this.socket.connect();
    }
  }
}

const socketService = new SocketService();
export default socketService; 