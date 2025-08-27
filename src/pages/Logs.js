import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../hooks/redux';
import { useSorting } from '../hooks/useSorting';
import SortableTableHeader from '../components/SortableTableHeader';
import SortingIndicator from '../components/SortingIndicator';
import {
  FileText,
  Info,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Activity,
  Database,
  Zap,
  Server,
  Wifi,
  Network,
  Cable,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { toast } from 'react-toastify';
import ApiService from '../services/apiService';

const Logs = () => {
  const { isConnected } = useAppSelector((state) => state.sensor);
  
  // State for filters
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for data
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);
  
  // Sorting state using reusable hook
  const {
    sortConfig,
    handleSort,
    sortData,
    resetSorting
  } = useSorting('timestamp', 'desc');
  
  // Log types
  const logTypes = [
    { value: 'communication', label: 'Communication', icon: Activity, color: 'from-blue-500 to-cyan-500' },
    { value: 'control_settings', label: 'Control Settings', icon: Settings, color: 'from-green-500 to-emerald-500' },
    { value: 'ems', label: 'EMS Logic', icon: Zap, color: 'from-orange-500 to-red-500' }
  ];

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

  // Fetch devices from API
  const fetchDevices = async () => {
    try {
      setIsLoadingDevices(true);
      const data = await ApiService.getDevices();
      if (data.devices) {
        // Flatten devices from all interfaces
        const allDevices = [];
        Object.keys(data.devices).forEach(deviceInterface => {
          if (Array.isArray(data.devices[deviceInterface])) {
            data.devices[deviceInterface].forEach(device => {
              allDevices.push({
                ...device,
                interface: deviceInterface
              });
            });
          }
        });
        setDevices(allDevices);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to fetch devices');
    } finally {
      setIsLoadingDevices(false);
    }
  };

  // Generate realistic dummy logs based on actual devices
  const generateRealisticLogs = (deviceList) => {
    const logs = [];
    let logId = 1;
    const now = new Date();
    
    // Generate logs for the last 7 days
    for (let day = 6; day >= 0; day--) {
      const currentDate = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
      
      // Generate 8-15 logs per day
      const logsPerDay = Math.floor(Math.random() * 8) + 8;
      
      for (let i = 0; i < logsPerDay; i++) {
        const device = deviceList[Math.floor(Math.random() * deviceList.length)];
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const second = Math.floor(Math.random() * 60);
        
        const timestamp = new Date(currentDate);
        timestamp.setHours(hour, minute, second, 0);
        
        const log = generateLogEntry(logId, timestamp, device);
        logs.push(log);
        logId++;
      }
    }
    
    // Sort by timestamp (newest first)
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // Generate individual log entry based on device type
  const generateLogEntry = (id, timestamp, device) => {
    const deviceType = device.device_type;
    const protocol = device.protocol;
    const deviceInterface = device.interface;
    
    // Base log structure
    const log = {
      id,
      timestamp: timestamp.toISOString(),
      device: device.device_name,
      device_type: deviceType,
      interface: deviceInterface,
      protocol
    };

    // Generate logs based on device type and protocol
    switch (deviceType) {
      case 'hybrid_inverter':
        return generateHybridInverterLog(log, device);
      case 'genset_controller':
        return generateGensetControllerLog(log, device);
      case 'bms':
        return generateBMSLog(log, device);
      case 'io_module':
        return generateIOModuleLog(log, device);
      case 'power_meter':
        return generatePowerMeterLog(log, device);
      case 'solar_inverter':
        return generateSolarInverterLog(log, device);
      case 'hvac':
        return generateHVACLog(log, device);
      case 'pcs':
        return generatePCSLog(log, device);
      default:
        return generateGenericLog(log, device);
    }
  };

  // Hybrid Inverter specific logs
  const generateHybridInverterLog = (log, device) => {
    const operations = [
      {
        type: 'communication',
        description: `Modbus RTU connection established with ${device.device_name} on ${device.interface} - Device ID: ${device.device_id}`
      },
      {
        type: 'ems',
        description: `Battery charge mode activated - current SOC: ${Math.floor(Math.random() * 30) + 70}%`
      },
      {
        type: 'control_settings',
        description: `Grid-tie mode enabled - exporting ${(Math.random() * 5 + 2).toFixed(1)}kW to grid`
      },
      {
        type: 'control_settings',
        description: `Inverter parameters updated - frequency: ${(Math.random() * 0.2 + 49.9).toFixed(2)}Hz, voltage: ${(Math.random() * 10 + 230).toFixed(0)}V`
      }
    ];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    return { ...log, ...operation };
  };

  // Genset Controller specific logs
  const generateGensetControllerLog = (log, device) => {
    const operations = [
      {
        type: 'communication',
        description: `Modbus TCP connection to ${device.device_name} at ${device.device_ip}:${device.tcp_port} - Timeout: ${device.response_timeout}s`
      },
      {
        type: 'control_settings',
        description: `Genset startup sequence initiated - fuel level: ${Math.floor(Math.random() * 40) + 60}%`
      },
      {
        type: 'ems',
        description: `Load demand: ${(Math.random() * 50 + 20).toFixed(1)}kW - Genset output: ${(Math.random() * 45 + 25).toFixed(1)}kW`
      },
      {
        type: 'control_settings',
        description: `Controller settings modified - startup delay: ${Math.floor(Math.random() * 10) + 5}s, shutdown delay: ${Math.floor(Math.random() * 15) + 10}s`
      }
    ];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    return { ...log, ...operation };
  };

  // BMS specific logs
  const generateBMSLog = (log, device) => {
    const operations = [
      {
        type: 'communication',
        description: `Serial RTU communication with ${device.device_name} on ${device.interface} - Byte timeout: ${device.byte_timeout}s`
      },
      {
        type: 'control_settings',
        description: `Cell voltage monitoring active - average: ${(Math.random() * 0.2 + 3.6).toFixed(2)}V`
      },
      {
        type: 'ems',
        description: `Battery temperature: ${(Math.random() * 8 + 22).toFixed(1)}°C - within safe range`
      },
      {
        type: 'control_settings',
        description: `BMS thresholds updated - min voltage: ${(Math.random() * 0.5 + 3.0).toFixed(2)}V, max voltage: ${(Math.random() * 0.5 + 4.2).toFixed(2)}V`
      }
    ];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    return { ...log, ...operation };
  };

  // IO Module specific logs
  const generateIOModuleLog = (log, device) => {
    const operations = [
      {
        type: 'communication',
        description: `TCP connection to ${device.device_name} at ${device.device_ip}:${device.tcp_port} - Session: ${device.keep_tcp_session_open ? 'Persistent' : 'Temporary'}`
      },
      {
        type: 'control_settings',
        description: `Digital input DI1: ${Math.random() > 0.5 ? 'HIGH' : 'LOW'}, DI2: ${Math.random() > 0.5 ? 'HIGH' : 'LOW'}`
      },
      {
        type: 'control_settings',
        description: `IO module configuration updated - sampling rate: ${Math.floor(Math.random() * 100) + 50}ms, filter enabled: ${Math.random() > 0.5 ? 'Yes' : 'No'}`
      },
      {
        type: 'ems',
        description: `Analog input scaling modified - AI1 range: 0-${Math.floor(Math.random() * 20) + 10}V, AI2 range: 0-${Math.floor(Math.random() * 50) + 20}mA`
      }
    ];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    return { ...log, ...operation };
  };

  // Power Meter specific logs
  const generatePowerMeterLog = (log, device) => {
    const operations = [
      {
        type: 'communication',
        description: `Modbus communication with ${device.device_name} - reading power consumption data`
      },
      {
        type: 'ems',
        description: `Power consumption: ${(Math.random() * 100 + 50).toFixed(1)}kW, Power factor: ${(Math.random() * 0.1 + 0.9).toFixed(2)}`
      },
      {
        type: 'control_settings',
        description: `Meter reading interval set to ${Math.floor(Math.random() * 30) + 15} seconds`
      },
      {
        type: 'control_settings',
        description: `Power meter calibration updated - voltage offset: ${(Math.random() * 2 - 1).toFixed(2)}V, current offset: ${(Math.random() * 0.1 - 0.05).toFixed(3)}A`
      }
    ];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    return { ...log, ...operation };
  };

  // Solar Inverter specific logs
  const generateSolarInverterLog = (log, device) => {
    const operations = [
      {
        type: 'communication',
        description: `Communication established with ${device.device_name} - reading solar production data`
      },
      {
        type: 'ems',
        description: `Solar production: ${(Math.random() * 30 + 10).toFixed(1)}kW, Efficiency: ${(Math.random() * 5 + 95).toFixed(1)}%`
      },
      {
        type: 'control_settings',
        description: `MPPT tracking active - optimal voltage: ${(Math.random() * 50 + 400).toFixed(0)}V`
      },
      {
        type: 'control_settings',
        description: `Solar inverter parameters adjusted - MPPT range: ${Math.floor(Math.random() * 100) + 200}V to ${Math.floor(Math.random() * 100) + 600}V`
      }
    ];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    return { ...log, ...operation };
  };

  // HVAC specific logs
  const generateHVACLog = (log, device) => {
    const operations = [
      {
        type: 'communication',
        description: `HVAC system ${device.device_name} communication established`
      },
      {
        type: 'control_settings',
        description: `Temperature setpoint: ${(Math.random() * 5 + 20).toFixed(1)}°C, Current: ${(Math.random() * 3 + 22).toFixed(1)}°C`
      },
      {
        type: 'ems',
        description: `Energy optimization mode: ${Math.random() > 0.5 ? 'Active' : 'Standard'}`
      },
      {
        type: 'control_settings',
        description: `HVAC schedule updated - morning start: ${Math.floor(Math.random() * 2) + 6}:00, evening end: ${Math.floor(Math.random() * 2) + 22}:00`
      }
    ];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    return { ...log, ...operation };
  };

  // PCS specific logs
  const generatePCSLog = (log, device) => {
    const operations = [
      {
        type: 'communication',
        description: `Power Conversion System ${device.device_name} communication active`
      },
      {
        type: 'control_settings',
        description: `PCS mode: ${Math.random() > 0.5 ? 'Grid-forming' : 'Grid-following'}`
      },
      {
        type: 'ems',
        description: `Power flow: ${(Math.random() * 20 + 10).toFixed(1)}kW, Frequency: ${(Math.random() * 0.2 + 49.9).toFixed(2)}Hz`
      },
      {
        type: 'control_settings',
        description: `PCS configuration modified - grid voltage tolerance: ±${(Math.random() * 2 + 3).toFixed(1)}%, frequency tolerance: ±${(Math.random() * 0.1 + 0.2).toFixed(2)}Hz`
      }
    ];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    return { ...log, ...operation };
  };

  // Generic log for unknown device types
  const generateGenericLog = (log, device) => {
    const operations = [
      {
        type: 'communication',
        description: `Device ${device.device_name} communication established via ${device.protocol} on ${device.interface}`
      },
      {
        type: 'control_settings',
        description: `Device ${device.device_name} configuration updated - Device ID: ${device.device_id}`
      }
    ];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    return { ...log, ...operation };
  };

  // Initialize with devices and generate logs
  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (devices.length > 0) {
      const generatedLogs = generateRealisticLogs(devices);
      setLogs(generatedLogs);
      setFilteredLogs(generatedLogs);
      
      // Set default dates (last 7 days)
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setEndDateTime(now.toISOString().slice(0, 16));
      setStartDateTime(weekAgo.toISOString().slice(0, 16));
    }
  }, [devices]);

  // Filter logs based on criteria
  useEffect(() => {
    let filtered = [...logs];
    
    // Filter by date and time range
    if (startDateTime && endDateTime) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        const startDate = new Date(startDateTime);
        const endDate = new Date(endDateTime);
        return logDate >= startDate && logDate <= endDate;
      });
    }
    
    // Filter by type
    if (selectedType) {
      filtered = filtered.filter(log => log.type === selectedType);
    }
    
    // Filter by device
    if (selectedDevice) {
      filtered = filtered.filter(log => log.device === selectedDevice);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.device_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered = sortData(filtered);
    
    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [logs, startDateTime, endDateTime, selectedType, selectedDevice, searchQuery, sortConfig]);

  // Get interface icon
  const getInterfaceIcon = (deviceInterface) => {
    const icons = {
      'eth1': Network,
      'wifi': Wifi,
      'serial_1': Cable,
      'serial_2': Cable
    };
    return icons[deviceInterface] || Cable;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Handle filter reset
  const resetFilters = () => {
    setStartDateTime('');
    setEndDateTime('');
    setSelectedType('');
    setSelectedDevice('');
    setSearchQuery('');
  };

  // Handle refresh
  const refreshLogs = () => {
    setIsLoading(true);
    fetchDevices().then(() => {
      setTimeout(() => {
        setIsLoading(false);
        toast.success('Logs refreshed successfully!');
      }, 1000);
    });
  };

  // Pagination calculations
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 space-y-6 relative overflow-hidden">
      {/* Perfect gradient background that merges beautifully in the middle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0097b2]/8 via-[#198c1a]/12 to-[#0097b2]/8"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0097b2]/6 via-[#198c1a]/10 to-[#0097b2]/6"></div>
        
        {/* Subtle decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-[#0097b2]/5 via-[#198c1a]/8 to-[#0097b2]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-gradient-to-tl from-[#198c1a]/6 via-[#0097b2]/4 to-[#198c1a]/6 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header - Matching Device Management Style */}
        <div className="mb-8 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0097b2] to-[#198c1a] rounded-2xl blur opacity-75 animate-pulse"></div>
                <div className="relative p-4 bg-gradient-to-r from-[#0097b2] to-[#198c1a] rounded-2xl shadow-xl">
                  <FileText className="text-white drop-shadow-lg" size={28} />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-800 mb-1 tracking-tight drop-shadow-lg">
                  System Logs
                </h1>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#198c1a] rounded-full animate-ping"></div>
                  <p className="text-gray-700 text-lg font-medium drop-shadow-sm">Monitor and analyze system activities, communications, and events</p>
                </div>
              </div>
            </div>
            
            {/* Header Stats */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white/80 border border-[#198c1a]/20 rounded-full shadow-md backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[#198c1a]" />
                  <span className="text-sm font-semibold text-gray-700">{filteredLogs.length} Logs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-green-200/40 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-5 h-5 text-[#0097b2]" />
            <h2 className="text-xl font-semibold text-gray-800">Filters & Search</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Start Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                />
              </div>
            </div>
            
            {/* End Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                />
              </div>
            </div>
            
            {/* Log Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Log Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
              >
                <option value="">All Types</option>
                {logTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            {/* Device Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Device</label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
              >
                <option value="">All Devices</option>
                {devices.map(device => (
                  <option key={device.device_name} value={device.device_name}>
                    {device.device_name} ({device.device_type})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Search and Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs by description, device, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 hover:shadow-md"
              >
                Reset
              </button>
              <button
                onClick={refreshLogs}
                disabled={isLoading}
                className="px-4 py-2 text-white bg-gradient-to-r from-[#0097b2] to-[#198c1a] hover:from-[#0088a3] hover:to-[#167d19] rounded-xl font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{indexOfFirstLog + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(indexOfLastLog, filteredLogs.length)}</span> of <span className="font-semibold text-gray-900">{filteredLogs.length}</span> logs
            </span>
            {filteredLogs.length !== logs.length && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Filtered
              </span>
            )}
            {sortConfig.key && (
              <SortingIndicator 
                sortConfig={sortConfig} 
                columnLabels={columnLabels}
              />
            )}
          </div>
          
          {/* Log Type Distribution */}
          <div className="flex items-center gap-3">
            {logTypes.map(type => {
              const count = filteredLogs.filter(log => log.type === type.value).length;
              if (count === 0) return null;
              
              const IconComponent = type.icon;
              return (
                <div key={type.value} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 border border-gray-200">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${type.color}`}></div>
                  <IconComponent className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-green-200/40 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
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
                  <SortableTableHeader
                    columnKey="type"
                    label="Type"
                    onSort={handleSortWithReset}
                    sortConfig={sortConfig}
                    icons={sortIcons}
                  />
                  <SortableTableHeader
                    columnKey="description"
                    label="Description"
                    onSort={handleSortWithReset}
                    sortConfig={sortConfig}
                    icons={sortIcons}
                  />
                </tr>
              </thead>
              <tbody className="bg-white/60 divide-y divide-gray-200">
                {currentLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="w-12 h-12 text-gray-300" />
                        <div className="text-gray-500">
                          <p className="font-medium">No logs found</p>
                          <p className="text-sm">Try adjusting your filters or search criteria</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-900">{log.device}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            {(() => {
                              const IconComponent = getInterfaceIcon(log.interface);
                              return IconComponent ? <IconComponent size={12} /> : null;
                            })()}
                            <span>{log.interface}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {log.device_type} • {log.protocol}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const typeInfo = logTypes.find(t => t.value === log.type);
                          if (!typeInfo) return null;
                          
                          const IconComponent = typeInfo.icon;
                          return (
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${typeInfo.color}`}></div>
                              <IconComponent className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">{typeInfo.label}</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-md">
                          {log.description}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredLogs.length > 0 && (
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl border border-green-200/40 p-4 shadow-lg">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={prevPage} 
                disabled={currentPage === 1}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={nextPage} 
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs; 