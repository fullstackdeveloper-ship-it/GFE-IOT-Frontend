import { useState, useCallback } from 'react';

/**
 * Custom hook for table sorting functionality
 * @param {string} defaultSortKey - Default column to sort by
 * @param {string} defaultDirection - Default sort direction ('asc' or 'desc')
 * @returns {Object} Sorting utilities and state
 */
export const useSorting = (defaultSortKey = '', defaultDirection = 'desc') => {
  const [sortConfig, setSortConfig] = useState({
    key: defaultSortKey,
    direction: defaultDirection
  });

  /**
   * Handle sorting for a specific column
   * @param {string} key - Column key to sort by
   * @param {Function} onSortChange - Optional callback when sort changes
   */
  const handleSort = useCallback((key, onSortChange) => {
    let direction = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    
    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);
    
    if (onSortChange) {
      onSortChange(newSortConfig);
    }
  }, [sortConfig]);

  /**
   * Get sort icon for a column
   * @param {string} columnKey - Column key to get icon for
   * @param {Object} icons - Icon components (ArrowUpDown, ArrowUp, ArrowDown)
   * @returns {JSX.Element} Sort icon component
   */
  const getSortIcon = useCallback((columnKey, icons) => {
    const { ArrowUpDown, ArrowUp, ArrowDown } = icons;
    
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-white" />
      : <ArrowDown className="w-4 h-4 text-white" />;
  }, [sortConfig]);

  /**
   * Sort data array based on current sort configuration
   * @param {Array} data - Data array to sort
   * @param {Object} sortConfig - Current sort configuration
   * @returns {Array} Sorted data array
   */
  const sortData = useCallback((data, customSortConfig = null) => {
    const config = customSortConfig || sortConfig;
    if (!config.key) return data;
    
    return [...data].sort((a, b) => {
      let aValue = a[config.key];
      let bValue = b[config.key];
      
      // Handle timestamp/date sorting
      if (config.key === 'timestamp' || config.key === 'date' || config.key === 'created_at' || config.key === 'updated_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      // Handle numeric sorting
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        // Keep as numbers
      } else if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        // Convert to numbers if they're numeric strings
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        // Handle string sorting (case-insensitive)
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }
      
      if (aValue < bValue) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return config.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [sortConfig]);

  /**
   * Reset sorting to default values
   */
  const resetSorting = useCallback(() => {
    setSortConfig({
      key: defaultSortKey,
      direction: defaultDirection
    });
  }, [defaultSortKey, defaultDirection]);

  /**
   * Get current sort configuration
   */
  const getCurrentSort = useCallback(() => sortConfig, [sortConfig]);

  /**
   * Check if a column is currently sorted
   * @param {string} columnKey - Column key to check
   * @returns {boolean} True if column is currently sorted
   */
  const isColumnSorted = useCallback((columnKey) => {
    return sortConfig.key === columnKey;
  }, [sortConfig]);

  /**
   * Get sort direction for a specific column
   * @param {string} columnKey - Column key to check
   * @returns {string|null} Sort direction ('asc', 'desc', or null if not sorted)
   */
  const getColumnSortDirection = useCallback((columnKey) => {
    return sortConfig.key === columnKey ? sortConfig.direction : null;
  }, [sortConfig]);

  return {
    sortConfig,
    handleSort,
    getSortIcon,
    sortData,
    resetSorting,
    getCurrentSort,
    isColumnSorted,
    getColumnSortDirection
  };
};

export default useSorting;
