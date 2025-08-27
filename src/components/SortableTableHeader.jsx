import React from 'react';

/**
 * Reusable sortable table header component
 * @param {Object} props - Component props
 * @param {string} props.columnKey - Unique key for the column
 * @param {string} props.label - Display label for the column
 * @param {Function} props.onSort - Sort handler function
 * @param {Object} props.sortConfig - Current sort configuration
 * @param {Object} props.icons - Icon components (ArrowUpDown, ArrowUp, ArrowDown)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.sortable - Whether the column is sortable (default: true)
 * @param {string} props.width - Column width (e.g., 'w-32', 'w-48')
 * @returns {JSX.Element} Sortable table header
 */
const SortableTableHeader = ({
  columnKey,
  label,
  onSort,
  sortConfig,
  icons,
  className = '',
  sortable = true,
  width = ''
}) => {
  const { ArrowUpDown, ArrowUp, ArrowDown } = icons;
  
  const getSortIcon = () => {
    if (!sortable) return null;
    
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-white" />
      : <ArrowDown className="w-4 h-4 text-white" />;
  };

  const handleClick = () => {
    if (sortable && onSort) {
      onSort(columnKey);
    }
  };

  const baseClasses = "px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider";
  const sortableClasses = sortable 
    ? "cursor-pointer hover:bg-white/10 transition-colors duration-200" 
    : "";
  const widthClasses = width || "";
  
  const finalClasses = `${baseClasses} ${sortableClasses} ${widthClasses} ${className}`.trim();

  return (
    <th 
      className={finalClasses}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {getSortIcon()}
      </div>
    </th>
  );
};

export default SortableTableHeader;
