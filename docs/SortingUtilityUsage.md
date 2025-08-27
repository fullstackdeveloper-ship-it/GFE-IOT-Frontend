# Sorting Utility Usage Guide

This document explains how to use the centralized sorting utilities across different components in your application.

## 🎯 Overview

The sorting system consists of three main components:
1. **`useSorting` Hook** - Manages sorting state and logic
2. **`SortableTableHeader` Component** - Reusable sortable table headers
3. **`SortingIndicator` Component** - Shows current sort state

## 📦 Import Statements

```javascript
import { useSorting } from '../hooks/useSorting';
import SortableTableHeader from '../components/SortableTableHeader';
import SortingIndicator from '../components/SortingIndicator';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
```

## 🔧 Basic Usage in Logs Page

```javascript
const Logs = () => {
  // Initialize sorting hook with default values
  const {
    sortConfig,
    handleSort,
    sortData,
    resetSorting
  } = useSorting('timestamp', 'desc'); // Default: sort by timestamp, descending

  // Column labels for sorting indicator
  const columnLabels = {
    timestamp: 'Date & Time',
    device: 'Device',
    type: 'Type',
    description: 'Description'
  };

  // Icons for sorting
  const sortIcons = {
    ArrowUpDown,
    ArrowUp,
    ArrowDown
  };

  // Handle sorting with pagination reset
  const handleSortWithReset = (key) => {
    handleSort(key, () => {
      setCurrentPage(1); // Reset to first page when sorting
    });
  };

  // Apply sorting to filtered data
  useEffect(() => {
    let filtered = [...logs];
    // ... apply filters ...
    
    // Apply sorting
    filtered = sortData(filtered);
    
    setFilteredLogs(filtered);
  }, [logs, /* other dependencies */, sortConfig]);

  return (
    <table>
      <thead className="bg-gradient-to-r from-[#0097b2] to-[#198c1a]">
        <tr>
          <SortableTableHeader
            columnKey="timestamp"
            label="Date & Time"
            onSort={handleSortWithReset}
            sortConfig={sortConfig}
            icons={sortIcons}
          />
          <SortableTableHeader
            columnKey="device"
            label="Device"
            onSort={handleSortWithReset}
            sortConfig={sortConfig}
            icons={sortIcons}
          />
          {/* ... other headers ... */}
        </tr>
      </thead>
      {/* ... table body ... */}
    </table>
  );
};
```

## 🏠 Usage in Devices Page

```javascript
const Devices = () => {
  // Initialize sorting for devices table
  const {
    sortConfig,
    handleSort,
    sortData,
    resetSorting
  } = useSorting('device_name', 'asc'); // Default: sort by device name, ascending

  // Column labels for devices
  const columnLabels = {
    device_name: 'Device Name',
    reference: 'Reference',
    device_type: 'Device Type',
    interface: 'Interface',
    status: 'Status'
  };

  // Apply sorting to filtered devices
  useEffect(() => {
    let filtered = devices;
    // ... apply filters ...
    
    // Apply sorting
    filtered = sortData(filtered);
    
    setFilteredDevices(filtered);
  }, [devices, /* other dependencies */, sortConfig]);

  return (
    <table>
      <thead className="bg-gradient-to-r from-[#0097b2] to-[#198c1a]">
        <tr>
          <SortableTableHeader
            columnKey="device_name"
            label="Device"
            onSort={handleSort}
            sortConfig={sortConfig}
            icons={sortIcons}
          />
          <SortableTableHeader
            columnKey="reference"
            label="Reference"
            onSort={handleSort}
            sortConfig={sortConfig}
            icons={sortIcons}
          />
          <SortableTableHeader
            columnKey="device_type"
            label="Type"
            onSort={handleSort}
            sortConfig={sortConfig}
            icons={sortIcons}
          />
          <SortableTableHeader
            columnKey="interface"
            label="Interface"
            onSort={handleSort}
            sortConfig={sortConfig}
            icons={sortIcons}
          />
          <SortableTableHeader
            columnKey="status"
            label="Status"
            onSort={handleSort}
            sortConfig={sortConfig}
            icons={sortIcons}
          />
          {/* Non-sortable column */}
          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
            Details
          </th>
        </tr>
      </thead>
      {/* ... table body ... */}
    </table>
  );
};
```

## 🎨 Customizing SortableTableHeader

```javascript
// Custom width
<SortableTableHeader
  columnKey="timestamp"
  label="Date & Time"
  onSort={handleSort}
  sortConfig={sortConfig}
  icons={sortIcons}
  width="w-48" // Custom width
/>

// Non-sortable column
<SortableTableHeader
  columnKey="actions"
  label="Actions"
  onSort={handleSort}
  sortConfig={sortConfig}
  icons={sortIcons}
  sortable={false} // This column won't be sortable
/>

// Custom styling
<SortableTableHeader
  columnKey="priority"
  label="Priority"
  onSort={handleSort}
  sortConfig={sortConfig}
  icons={sortIcons}
  className="text-center" // Custom CSS classes
/>
```

## 📊 Sorting Indicator Usage

```javascript
// Basic usage
<SortingIndicator 
  sortConfig={sortConfig} 
  columnLabels={columnLabels}
/>

// With custom styling
<SortingIndicator 
  sortConfig={sortConfig} 
  columnLabels={columnLabels}
  className="bg-green-100 text-green-700"
/>

// In results summary
<div className="flex items-center gap-4">
  <span>Showing {start} to {end} of {total} items</span>
  {sortConfig.key && (
    <SortingIndicator 
      sortConfig={sortConfig} 
      columnLabels={columnLabels}
    />
  )}
</div>
```

## 🔄 Advanced Sorting Features

```javascript
const {
  sortConfig,
  handleSort,
  sortData,
  resetSorting,
  getCurrentSort,
  isColumnSorted,
  getColumnSortDirection
} = useSorting('timestamp', 'desc');

// Check if a specific column is sorted
const isTimestampSorted = isColumnSorted('timestamp');

// Get sort direction for a column
const timestampDirection = getColumnSortDirection('timestamp'); // 'asc', 'desc', or null

// Get current sort configuration
const currentSort = getCurrentSort(); // { key: 'timestamp', direction: 'desc' }

// Reset to default sorting
const handleReset = () => {
  resetSorting();
  // ... other reset logic ...
};

// Custom sort callback
const handleSortWithCallback = (key) => {
  handleSort(key, (newSortConfig) => {
    console.log('Sort changed to:', newSortConfig);
    // ... custom logic ...
  });
};
```

## 🎯 Supported Data Types

The sorting utility automatically handles:

- **Timestamps/Dates**: `timestamp`, `date`, `created_at`, `updated_at`
- **Numbers**: Numeric values and numeric strings
- **Strings**: Case-insensitive alphabetical sorting
- **Mixed Types**: Automatic type detection and appropriate sorting

## 🚀 Performance Tips

1. **Memoize sort functions** if you have complex sorting logic
2. **Use useCallback** for sort handlers to prevent unnecessary re-renders
3. **Sort only filtered data** to improve performance
4. **Reset pagination** when sorting changes for better UX

## 🔧 Troubleshooting

### Common Issues:

1. **Sorting not working**: Check if `sortConfig.key` matches your data properties
2. **Icons not showing**: Ensure you're passing the correct icon components
3. **Performance issues**: Verify you're not sorting the entire dataset unnecessarily

### Debug Mode:

```javascript
// Add this to debug sorting issues
useEffect(() => {
  console.log('Sort config changed:', sortConfig);
  console.log('Filtered data:', filteredData);
}, [sortConfig, filteredData]);
```

## 📝 Example: Complete Component

See `src/pages/Logs.js` for a complete implementation example using all the sorting utilities.
