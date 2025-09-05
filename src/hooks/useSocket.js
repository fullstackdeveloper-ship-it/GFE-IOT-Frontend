/**
 * Custom Socket Hook
 * Provides a consistent interface for socket operations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socket';

export const useSocket = () => {
  const [connectionStatus, setConnectionStatus] = useState(socketService.getConnectionStatus());
  const isConnected = useSelector(state => state.sensor?.isConnected || false);
  const intervalRef = useRef(null);

  // Update connection status periodically
  useEffect(() => {
    const updateStatus = () => {
      setConnectionStatus(socketService.getConnectionStatus());
    };

    // Update immediately
    updateStatus();

    // Update every 5 seconds
    intervalRef.current = setInterval(updateStatus, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const emit = useCallback((event, data) => {
    socketService.emit(event, data);
  }, []);

  const on = useCallback((event, callback) => {
    socketService.on(event, callback);
  }, []);

  const off = useCallback((event, callback) => {
    socketService.off(event, callback);
  }, []);

  const connect = useCallback((url) => {
    socketService.connect(url);
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  const forceReconnect = useCallback(() => {
    socketService.forceReconnect();
  }, []);

  const getHealthMetrics = useCallback(() => {
    return socketService.getHealthMetrics();
  }, []);

  return {
    isConnected,
    connectionStatus,
    emit,
    on,
    off,
    connect,
    disconnect,
    forceReconnect,
    getHealthMetrics,
  };
};

export default useSocket;
