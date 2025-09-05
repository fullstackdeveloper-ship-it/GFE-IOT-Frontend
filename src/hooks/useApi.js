/**
 * Custom API Hook
 * Provides a consistent interface for API calls with loading states and error handling
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { CONFIG } from '../config';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    const { 
      showLoading = true, 
      clearError = true,
      timeout = CONFIG.API.TIMEOUT 
    } = options;

    // Clear previous error
    if (clearError) {
      setError(null);
    }

    // Set loading state
    if (showLoading) {
      setLoading(true);
    }

    // Create abort controller for timeout
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      abortControllerRef.current?.abort();
    }, timeout);

    try {
      const result = await apiCall();
      clearTimeout(timeoutId);
      return result;
    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError') {
        setError(new Error(CONFIG.ERRORS.TIMEOUT_ERROR));
      } else {
        setError(err);
      }
      throw err;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError,
  };
};

export default useApi;
