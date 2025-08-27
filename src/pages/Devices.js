import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Server, Wifi, Cable, Router, Globe2, CheckCircle, XCircle, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import DeviceDetailsSlider from '../components/DeviceDetailsSlider';
import ApiService from '../services/apiService';
import { useSorting } from '../hooks/useSorting';
import SortableTableHeader from '../components/SortableTableHeader';
import { useApiCall } from '../hooks/useApiCall';
import { 
  getInterfaceDisplayName, 
  getInterfaceBadge, 
  getTypeBadge, 
  getStatusBadge,
  getInterfaceIcon
} from '../utils/deviceUtils';
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

  // Sorting state using reusable hook
  const {
    sortConfig,
    handleSort,
    sortData,
    resetSorting
  } = useSorting('device_name', 'asc'); // Default: sort by device name, ascending

  // Column labels for sorting indicator
  const columnLabels = {
    device_name: 'Device Name',
    reference: 'Reference',
    device_type: 'Device Type',
    interface: 'Interface',
    status: 'Status'
  };

  // Icons for sorting
  const sortIcons = {
    ArrowUpDown,
    ArrowUp,
    ArrowDown
  };



    // Use the API call hook to prevent duplicates
  const { wrappedApiCall: wrappedFetchDevices, cleanup: cleanupFetchDevices } = useApiCall(
    async () => {
      const data = await ApiService.getDevices();
      
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
      return data;
    },
    loading,
    setLoading
  );

  useEffect(() => {
    wrappedFetchDevices();
    return cleanupFetchDevices;
  }, []);

  useEffect(() => {
    filterDevices();
  }, [devices, searchQuery, selectedInterface, selectedType, selectedStatus, sortConfig]);

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

    // Apply sorting
    filtered = sortData(filtered);

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
    <div className="min-h-screen bg-white p-6 relative overflow-hidden">
      {/* Perfect gradient background that merges beautifully in the middle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0097b2]/8 via-[#198c1a]/12 to-[#0097b2]/8"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0097b2]/6 via-[#198c1a]/10 to-[#0097b2]/6"></div>
        
        {/* Subtle decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-[#0097b2]/5 via-[#198c1a]/8 to-[#0097b2]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-gradient-to-tl from-[#198c1a]/6 via-[#0097b2]/4 to-[#198c1a]/6 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0097b2] to-[#198c1a] rounded-2xl blur opacity-75 animate-pulse"></div>
              <div className="relative p-4 bg-gradient-to-r from-[#0097b2] to-[#198c1a] rounded-2xl shadow-xl">
                <Server className="text-white drop-shadow-lg" size={28} />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-800 mb-1 tracking-tight drop-shadow-lg">
                Device Management
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#198c1a] rounded-full animate-ping"></div>
                <p className="text-gray-700 text-lg font-medium drop-shadow-sm">Monitor and manage all connected devices</p>
              </div>
            </div>
          </div>
          
          {/* Header Stats */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/80 border border-[#198c1a]/20 rounded-full shadow-md backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Server size={14} className="text-[#198c1a]" />
                <span className="text-sm font-semibold text-gray-700">{devices.length} Devices</span>
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
        <div className="bg-white/95 backdrop-blur-md border border-white/30 rounded-xl shadow-xl p-6">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[#0097b2]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] bg-white/95 backdrop-blur-sm transition-all duration-200"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] bg-white/95"
                >
                  <option value="all">All Interfaces</option>
                  {uniqueInterfaces.map(iface => (
                    <option key={iface} value={iface}>{getInterfaceDisplayName(iface)}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Device Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] bg-white/95"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] bg-white/95"
                >
                  <option value="all">All Status</option>
                  <option value="--">Not Monitored</option>
                </select>
              </div>

              {/* Results Counter */}
              <div className="flex items-end">
                <div className="w-full px-4 py-2 bg-gradient-to-r from-[#0097b2]/10 to-[#198c1a]/10 rounded-lg border border-[#0097b2]/30">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-[#0097b2]" />
                    <span className="text-sm font-medium text-[#0097b2]">
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
          <div className="relative bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-[#0097b2] to-[#198c1a] border-b border-[#0097b2]">
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
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Details</th>
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
                        className="hover:bg-gradient-to-r hover:from-[#0097b2]/5 hover:to-[#198c1a]/5 hover:shadow-md hover:transform hover:translate-x-1 transition-all duration-200 cursor-pointer group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gradient-to-r from-[#0097b2]/20 to-[#198c1a]/20 rounded-lg flex items-center justify-center border border-[#0097b2]/30 group-hover:shadow-md transition-shadow duration-200">
                                <Server className="w-5 h-5 text-[#0097b2] group-hover:scale-110 transition-transform duration-200" />
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-[#0097b2] transition-colors duration-200">{device.device_name}</div>
                              <div className="text-xs text-gray-500">ID: {device.device_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">{device.reference}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getTypeBadge(device)}
                        </td>
                        <td className="px-6 py-4">
                          <div className={getInterfaceBadge(device.interface)}>
                            {getInterfaceIcon(device.interface, { Router, Wifi, Cable, Server })}
                            <span>{getInterfaceDisplayName(device.interface)}</span>
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
