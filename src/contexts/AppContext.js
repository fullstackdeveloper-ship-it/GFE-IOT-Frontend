import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/apiService';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [appConfig, setAppConfig] = useState({
    siteName: 'Green Project',
    language: 'en',
    timezone: 'UTC',
    deviceTime: '',
    theme: 'light'
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Load initial config
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const data = await ApiService.getConfig();
      setAppConfig({
        siteName: data.siteName || 'Green Project',
        language: data.language || 'en',
        timezone: data.timezone || 'UTC',
        deviceTime: data.deviceTime || '',
        theme: data.theme || 'light'
      });
    } catch (error) {
      console.error('Error loading app config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (newConfig) => {
    try {
      // Optimistically update the state
      setAppConfig(prevConfig => ({ ...prevConfig, ...newConfig }));
      
      // Save to backend
      await ApiService.updateConfig({ ...appConfig, ...newConfig });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating app config:', error);
      // Revert on error
      await loadConfig();
      throw error;
    }
  };

  const updateDeviceTime = async (deviceTime, timezone = null) => {
    try {
      const updates = { deviceTime };
      if (timezone) {
        updates.timezone = timezone;
      }
      
      // Update local state
      setAppConfig(prevConfig => ({ ...prevConfig, ...updates }));
      
      // Save to backend
      const response = await ApiService.setDeviceTime(deviceTime, timezone);
      
      return response;
    } catch (error) {
      console.error('Error updating device time:', error);
      // Revert on error
      await loadConfig();
      throw error;
    }
  };

  const value = {
    appConfig,
    isLoading,
    updateConfig,
    updateDeviceTime,
    refreshConfig: loadConfig
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
