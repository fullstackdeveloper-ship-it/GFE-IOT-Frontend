import React, { useState, useEffect } from 'react';
import { Search, Filter, Server, Wifi, Cable, Router, Globe2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import DeviceDetailsSlider from '../components/DeviceDetailsSlider';
import 'react-toastify/dist/ReactToastify.css';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterface, setSelectedInterface] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    filterDevices();
  }, [devices, searchQuery, selectedInterface, selectedType, selectedStatus]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/devices`);
      if (!response.ok) throw new Error('Failed to fetch devices');
      
      const data = await response.json();
      
      // Flatten devices from all interfaces
      const allDevices = [];
      Object.entries(data.devices || {}).forEach(([interfaceName, interfaceDevices]) => {
        interfaceDevices.forEach(device => {
          allDevices.push({
            ...device,
            interface: interfaceName,
            // Status monitoring not implemented yet
            status: '--'
          });
        });
      });
      
      setDevices(allDevices);
      setReferences(data.references || []);
    //   toast.success(`Loaded ${allDevices.length} devices successfully`);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to load devices: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterDevices = () => {
    let filtered = devices;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(device =>
        device.device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.device_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.interface.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Interface filter
    if (selectedInterface !== 'all') {
      filtered = filtered.filter(device => device.interface === selectedInterface);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(device => device.device_type === selectedType);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(device => device.status === selectedStatus);
    }

    setFilteredDevices(filtered);
  };

  const getStatusIcon = (status) => {
    if (status === '--') {
      return <Server className="w-5 h-5 text-gray-400" />;
    }
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Server className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold";
    if (status === '--') {
      return `${baseClasses} bg-gray-50 text-gray-500 border border-gray-200`;
    }
    switch (status) {
      case 'online':
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      case 'offline':
        return `${baseClasses} bg-gray-100 text-gray-600 border border-gray-200`;
      case 'error':
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-500 border border-gray-200`;
    }
  };

  const getInterfaceIcon = (interfaceName) => {
    if (interfaceName.startsWith('eth')) {
      return <Router className="w-4 h-4 text-blue-600" />;
    } else if (interfaceName === 'wifi') {
      return <Wifi className="w-4 h-4 text-purple-600" />;
    } else if (interfaceName.startsWith('serial')) {
      return <Cable className="w-4 h-4 text-green-600" />;
    }
    return <Server className="w-4 h-4 text-gray-600" />;
  };

  const getInterfaceBadge = (interfaceName) => {
    const baseClasses = "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium";
    if (interfaceName.startsWith('eth')) {
      return `${baseClasses} bg-blue-50 text-blue-700 border border-blue-200`;
    } else if (interfaceName === 'wifi') {
      return `${baseClasses} bg-purple-50 text-purple-700 border border-purple-200`;
    } else if (interfaceName.startsWith('serial')) {
      return `${baseClasses} bg-green-50 text-green-700 border border-green-200`;
    }
    return `${baseClasses} bg-gray-50 text-gray-700 border border-gray-200`;
  };

  const getTypeBadge = (type) => {
    if (!type) return <span className="text-gray-400 text-xs">Unknown</span>;
    
    const formattedType = type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const colors = {
      'hybrid_inverter': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'pcs': 'bg-blue-50 text-blue-700 border-blue-200',
      'bms': 'bg-purple-50 text-purple-700 border-purple-200',
      'genset_controller': 'bg-orange-50 text-orange-700 border-orange-200',
      'solar_inverter': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'power_meter': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'sensor': 'bg-pink-50 text-pink-700 border-pink-200',
      'io_module': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    };
    
    const colorClass = colors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${colorClass}`}>
        {formattedType}
      </span>
    );
  };



  const openDeviceDetails = (device) => {
    setSelectedDevice(device);
    setIsSliderOpen(true);
  };

  const closeDeviceDetails = () => {
    setIsSliderOpen(false);
    // Small delay to allow animation to complete before clearing device
    setTimeout(() => setSelectedDevice(null), 500);
  };

  const uniqueTypes = [...new Set(devices.map(d => d.device_type).filter(Boolean))];
  const uniqueInterfaces = [...new Set(devices.map(d => d.interface))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-400/10 to-yellow-400/10 rounded-full blur-3xl animate-ping"></div>
      </div>

      {/* Header */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl blur opacity-75 animate-pulse"></div>
              <div className="relative p-4 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl shadow-xl">
                <Server className="text-white drop-shadow-lg" size={28} />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 tracking-tight">
                Device Management
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                <p className="text-gray-600 text-lg font-medium">Monitor and manage all connected devices</p>
              </div>
            </div>
          </div>
          
          {/* Header Stats */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full shadow-md">
              <div className="flex items-center gap-2">
                <Server size={14} className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">{devices.length} Devices</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer 
        autoClose={3000} 
        newestOnTop 
        closeOnClick 
        pauseOnHover={false} 
        theme="colored"
        toastClassName="backdrop-blur-sm"
        position="top-right"
      />

      {/* Search and Filters */}
      <div className="mb-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-6">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-emerald-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/90 backdrop-blur-sm transition-all duration-200"
                placeholder="Search devices by name, reference, type, or interface..."
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Interface Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Interface</label>
                <select
                  value={selectedInterface}
                  onChange={(e) => setSelectedInterface(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/90"
                >
                  <option value="all">All Interfaces</option>
                  {uniqueInterfaces.map(iface => (
                    <option key={iface} value={iface}>{iface}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Device Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/90"
                >
                  <option value="all">All Types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/90"
                >
                  <option value="all">All Status</option>
                  <option value="--">Not Monitored</option>
                </select>
              </div>

              {/* Results Counter */}
              <div className="flex items-end">
                <div className="w-full px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {filteredDevices.length} of {devices.length} devices
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Devices Table */}
      <div className="relative z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-blue-50/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Device</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Interface</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-gray-600 font-medium">Loading devices...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredDevices.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Server className="w-16 h-16 text-gray-300" />
                          <div>
                            <p className="text-gray-600 font-medium">No devices found</p>
                            <p className="text-gray-400 text-sm">
                              {searchQuery || selectedInterface !== 'all' || selectedType !== 'all' || selectedStatus !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'No devices have been configured yet'
                              }
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDevices.map((device, index) => (
                      <tr 
                        key={`${device.interface}-${device.device_name}-${index}`} 
                        onClick={() => openDeviceDetails(device)}
                        className="hover:bg-blue-50 hover:shadow-md transition-all duration-200 cursor-pointer group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-lg flex items-center justify-center border border-emerald-200 group-hover:shadow-md transition-shadow duration-200">
                                <Server className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-200" />
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{device.device_name}</div>
                              <div className="text-xs text-gray-500">ID: {device.device_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">{device.reference}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getTypeBadge(device.device_type)}
                        </td>
                        <td className="px-6 py-4">
                          <div className={getInterfaceBadge(device.interface)}>
                            {getInterfaceIcon(device.interface)}
                            <span>{device.interface}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={getStatusBadge(device.status)}>
                            {getStatusIcon(device.status)}
                            <span className="capitalize">{device.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Protocol:</span>
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs">{device.protocol}</span>
                            </div>
                            {device.device_ip && (
                              <div className="flex items-center gap-2">
                                <Globe2 className="w-3 h-3" />
                                <span>{device.device_ip}:{device.tcp_port}</span>
                              </div>
                            )}
                            <div className="text-gray-500">
                              Timeout: {device.response_timeout}s
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Device Details Slider */}
      <DeviceDetailsSlider 
        device={selectedDevice}
        isOpen={isSliderOpen}
        onClose={closeDeviceDetails}
      />
    </div>
  );
};

export default Devices;
