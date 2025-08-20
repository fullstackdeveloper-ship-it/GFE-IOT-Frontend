import React, { useState, useEffect, useRef } from 'react';
import { X, Database, Save, Search, Edit3 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppSelector } from '../hooks/redux';
import socketService from '../services/socketService';
import ApiService from '../services/apiService';

const DeviceDetailsSlider = ({ device, isOpen, onClose }) => {
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registers, setRegisters] = useState([]);
  const [parameterSearch, setParameterSearch] = useState('');
  const [filteredRegisters, setFilteredRegisters] = useState([]);
  const [showValueModal, setShowValueModal] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState(null);
  const [modalValue, setModalValue] = useState('');
  const [liveValues, setLiveValues] = useState({});
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const deviceKey = device?.device_name || null;



  // Subscribe to per-device room on open; leave on close/unmount
  useEffect(() => {
    const socket = socketService.socket;
    if (!socket || !deviceKey) return;

    const room = `sensor:${deviceKey}`;

    const onSensorData = (dict) => {
      if (dict && typeof dict === 'object' && !Array.isArray(dict)) {
        setLiveValues(prev => {
          const newValues = { ...prev, ...dict };
          console.log(`📊 Live values updated for ${deviceKey}:`, newValues);
          return newValues;
        });
        
        // Update timestamp for continuous streaming
        if (dict._timestamp) {
          try {
            const timestamp = parseInt(dict._timestamp);
            if (!isNaN(timestamp)) {
              const dateObj = new Date(timestamp);
              if (!isNaN(dateObj.getTime())) {
                setLastUpdateTime(dateObj);
              } else {
                setLastUpdateTime(new Date());
              }
            } else {
              setLastUpdateTime(new Date());
            }
          } catch (error) {
            console.warn('Invalid timestamp received:', dict._timestamp);
            setLastUpdateTime(new Date());
          }
        } else {
          setLastUpdateTime(new Date());
        }
      }
    };

    if (isOpen) {
      console.log(`🔌 Joining room: ${room}`);
      socket.emit('join-room', room);
      socket.on('sensor-data', onSensorData);
    }

    return () => {
      console.log(`🔌 Leaving room: ${room}`);
      socket.off('sensor-data', onSensorData);
      socket.emit('leave-room', room);
    };
  }, [isOpen, deviceKey]);

  // Clear live values when slider closes or device changes
  useEffect(() => {
    if (!isOpen || !deviceKey) {
      setLiveValues({});
      setLastUpdateTime(null);
      console.log(`🧹 Cleared live values for ${deviceKey || 'unknown'}`);
    }
  }, [isOpen, deviceKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (deviceKey) {
        const socket = socketService.socket;
        if (socket) {
          const room = `sensor:${deviceKey}`;
          console.log(`🔌 Cleanup: Leaving room ${room}`);
          socket.emit('leave-room', room);
        }
        setLiveValues({});
        setLastUpdateTime(null);
      }
    };
  }, [deviceKey]);

  useEffect(() => {
    if (isOpen && device) {
      fetchDeviceBlueprint();
    }
  }, [isOpen, device]);

  // Filter parameters based on search
  useEffect(() => {
    if (!parameterSearch.trim()) {
      setFilteredRegisters(registers);
    } else {
      const filtered = registers.filter(register =>
        register.long_name.toLowerCase().includes(parameterSearch.toLowerCase()) ||
        register.short_name.toLowerCase().includes(parameterSearch.toLowerCase()) ||
        register.description.toLowerCase().includes(parameterSearch.toLowerCase()) ||
        register.unit?.toLowerCase().includes(parameterSearch.toLowerCase())
      );
      setFilteredRegisters(filtered);
    }
  }, [registers, parameterSearch]);

  const fetchDeviceBlueprint = async () => {
    if (!device?.reference) return;
    
    try {
      setLoading(true);
      const data = await ApiService.getDeviceBlueprint(device.reference);
      
      setBlueprint(data);
      setRegisters(data.registers || []);
    } catch (error) {
      console.error('Error fetching blueprint:', error);
      toast.error(`Failed to load device details: ${error.message}`);
      setBlueprint(null);
      setRegisters([]);
    } finally {
      setLoading(false);
    }
  };



  const openValueModal = (register) => {
    setSelectedRegister(register);
    setModalValue('');
    setShowValueModal(true);
  };

  const closeValueModal = () => {
    setShowValueModal(false);
    setSelectedRegister(null);
    setModalValue('');
  };

  const confirmValueChange = () => {
    if (selectedRegister && modalValue.trim()) {
      // TODO: Implement actual value setting when backend is ready
      console.log('Setting value for register:', selectedRegister.id, 'Value:', modalValue);
      toast.success(`Value set for ${selectedRegister.long_name}`);
      closeValueModal();
    } else {
      toast.error('Please enter a valid value');
    }
  };

  const getDisplayUnit = (register) => {
    // Use the unit field from blueprint if available
    if (register.unit) {
      return register.unit;
    }
    
    // Show dash if no unit
    return '—';
  };

  const renderValueDisplay = (register) => {
    const val = liveValues?.[register.short_name];
    const display = (val ?? val === 0) ? String(val) : '—';
    return (
      <span className="text-sm font-mono text-gray-600 px-3 py-2 bg-gray-50 rounded border min-w-[100px] text-center inline-block">
        {display}
      </span>
    );
  };

  const renderActionButton = (register) => {
    console.log(register, 'register');
    const access = register.channel_access?.toUpperCase();
    const isWritable = access === 'WO' || access === 'RW';
    
    if (isWritable) {
      return (
        <button
          onClick={() => openValueModal(register)}
          className="p-2 bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white rounded-lg hover:from-[#007a93] hover:to-[#147015] transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110"
          title={`Set value for ${register.long_name}`}
        >
          <Edit3 className="w-4 h-4" />
        </button>
      );
    } else {
      return null;
    }
  };

  if (!device) return null;

  return (
    <>setMappedData
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-500 z-40 ${
          isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Slider Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[35vw] min-w-[400px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-[#0097b2] to-[#198c1a] px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-white">
                    {device.device_name}
                  </h1>
                  {isOpen && deviceKey && lastUpdateTime && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-200 font-medium">
                        {lastUpdateTime.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <span>{device.device_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  <span>•</span>
                  <span>{device.interface}</span>
                  <span>•</span>
                  <span>ID: {device.device_id}</span>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-3 border-[#0097b2] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-600 font-medium">Loading parameters...</p>
                </div>
              </div>
            ) : !blueprint ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Parameters Found</h3>
                  <p className="text-gray-600">Could not load device parameters.</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Search Bar */}
                <div className="p-6 border-b border-white/20 bg-gradient-to-r from-[#0097b2]/5 to-[#198c1a]/5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={parameterSearch}
                      onChange={(e) => setParameterSearch(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] bg-white transition-all duration-200"
                      placeholder="Search parameters by name, unit, or description..."
                    />
                    {parameterSearch && (
                      <button
                        onClick={() => setParameterSearch('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {parameterSearch && (
                    <div className="mt-2 text-sm text-gray-600">
                      Showing {filteredRegisters.length} of {registers.length} parameters
                    </div>
                  )}
                </div>

                {/* Parameters Table */}
                <div className="flex-1 overflow-auto p-6">
                  {registers.length === 0 ? (
                    <div className="text-center py-16">
                      <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No parameters defined for this device.</p>
                    </div>
                  ) : filteredRegisters.length === 0 ? (
                    <div className="text-center py-16">
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No parameters match your search.</p>
                      <p className="text-gray-500 text-sm">Try adjusting your search terms.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gradient-to-r from-[#0097b2] to-[#198c1a] border-b border-[#0097b2]">
                                                          <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Parameter</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Value</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Unit</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredRegisters.map((register, index) => (
                              <tr 
                                key={register.id || index} 
                                className="hover:bg-gradient-to-r hover:from-[#0097b2]/5 hover:to-[#198c1a]/5 transition-all duration-200 hover:transform hover:translate-x-1 hover:shadow-md"
                                style={{ 
                                  animation: `slideInLeft 0.3s ease-out ${index * 0.03}s both` 
                                }}
                              >
                                <td className="px-6 py-4">
                                  <div className="font-medium text-gray-900 text-sm">
                                    {register.long_name}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    {renderValueDisplay(register)}
                                    {renderActionButton(register)}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-gray-600 font-medium">
                                    {getDisplayUnit(register)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Value Setting Modal */}
      {showValueModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between p-6 border-b border-white/20 bg-gradient-to-r from-[#0097b2]/10 to-[#198c1a]/10 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-[#0097b2] to-[#198c1a] rounded-lg">
                  <Edit3 className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Set Parameter Value</h3>
                  <p className="text-sm text-gray-600">{selectedRegister?.long_name}</p>
                </div>
              </div>
              <button
                onClick={closeValueModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Value
                    {selectedRegister?.unit && (
                      <span className="text-gray-500 ml-1">({selectedRegister.unit})</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={modalValue}
                    onChange={(e) => setModalValue(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors duration-200"
                    placeholder="Enter value..."
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        confirmValueChange();
                      }
                    }}
                  />
                </div>

              </div>
            </div>

            <div className="flex gap-3 p-6 bg-gradient-to-r from-[#0097b2]/5 to-[#198c1a]/5 rounded-b-xl border-t border-white/20">
              <button
                onClick={closeValueModal}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmValueChange}
                className="flex-1 bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white px-4 py-3 rounded-lg hover:from-[#007a93] hover:to-[#147015] transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom animations */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default DeviceDetailsSlider;
