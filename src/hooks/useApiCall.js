import { useRef, useCallback } from 'react';

/**
 * Custom hook to prevent duplicate API calls
 * @param {Function} apiFunction - The API function to call
 * @param {boolean} loadingState - Current loading state
 * @param {Function} setLoadingState - Function to set loading state
 * @returns {Function} - Wrapped API function that prevents duplicates
 */
export const useApiCall = (apiFunction, loadingState, setLoadingState) => {
  const isMountedRef = useRef(true);
  const isInitializedRef = useRef(false);

  // Set mounted to false on unmount
  const cleanup = useCallback(() => {
    isMountedRef.current = false;
  }, []);

  const wrappedApiCall = useCallback(async (...args) => {
    // Prevent calls if already loading or component unmounted
    if (loadingState || !isMountedRef.current) {
      return;
    }

    try {
      setLoadingState(true);
      const result = await apiFunction(...args);
      
      // Only return result if component is still mounted
      if (isMountedRef.current) {
        return result;
      }
    } catch (error) {
      // Only handle error if component is still mounted
      if (isMountedRef.current) {
        throw error;
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setLoadingState(false);
      }
    }
  }, [apiFunction, loadingState, setLoadingState]);

  return { wrappedApiCall, cleanup, isMountedRef };
};

/**
 * Custom hook for initialization API calls (prevents double calls in StrictMode)
 * @param {Function} initFunction - The initialization function
 * @returns {Object} - { initialize, isInitialized }
 */
export const useInitialization = (initFunction) => {
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(true);

  const initialize = useCallback(async () => {
    // Prevent duplicate initialization
    if (isInitializedRef.current || !isMountedRef.current) {
      return;
    }

    try {
      isInitializedRef.current = true;
      await initFunction();
    } catch (error) {
      // Reset initialization flag on error so it can be retried
      isInitializedRef.current = false;
      throw error;
    }
  }, [initFunction]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    isMountedRef.current = false;
  }, []);

  return { initialize, cleanup, isInitialized: isInitializedRef.current };
};

export default useApiCall;
