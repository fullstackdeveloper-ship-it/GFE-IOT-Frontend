import React from 'react';

/**
 * Reusable sorting indicator component
 * @param {Object} props - Component props
 * @param {Object} props.sortConfig - Current sort configuration
 * @param {Object} props.columnLabels - Mapping of column keys to display labels
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Sorting indicator
 */
const SortingIndicator = ({ 
  sortConfig, 
  columnLabels = {}, 
  className = '' 
}) => {
  if (!sortConfig.key) return null;

  const getColumnLabel = (key) => {
    return columnLabels[key] || key;
  };

  const getDirectionSymbol = (direction) => {
    return direction === 'asc' ? 'A→Z' : 'Z→A';
  };

  return (
    <span className={`text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded-full flex items-center gap-1 ${className}`}>
      <span>Sorted by:</span>
      <span className="font-medium text-blue-700">
        {getColumnLabel(sortConfig.key)}
      </span>
      <span className="text-blue-600">
        ({getDirectionSymbol(sortConfig.direction)})
      </span>
    </span>
  );
};

export default SortingIndicator;
