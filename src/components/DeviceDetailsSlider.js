import React, { useState, useEffect } from 'react';
import { X, Database, Save, Search, Edit3 } from 'lucide-react';
import { toast } from 'react-toastify';

const DeviceDetailsSlider = ({ device, isOpen, onClose }) => {
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registers, setRegisters] = useState([]);
  const [editableValues, setEditableValues] = useState({});
  const [parameterSearch, setParameterSearch] = useState('');
  const [filteredRegisters, setFilteredRegisters] = useState([]);
  const [showValueModal, setShowValueModal] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState(null);
  const [modalValue, setModalValue] = useState('');

  const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

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
      const response = await fetch(`${backendUrl}/devices/blueprint/${device.reference}`);
      
      if (!response.ok) {
        throw new Error('Blueprint not found');
      }
      
      const data = await response.json();
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

  const handleValueChange = (registerId, value) => {
    setEditableValues(prev => ({
      ...prev,
      [registerId]: value
    }));
  };

  const handleSaveValue = (registerId) => {
    // TODO: Implement save logic when backend is ready
    console.log('Saving value for register:', registerId, 'Value:', editableValues[registerId]);
    toast.success('Value saved successfully');
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
    // Always show a simple dash for value display
    return (
      <span className="text-sm font-mono text-gray-600 px-3 py-2 bg-gray-50 rounded border min-w-[100px] text-center inline-block">
        —
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
          className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110"
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
    <>
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
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {device.device_name}
                </h1>
                <div className="flex items-center gap-4 text-blue-100 text-sm">
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
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
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
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={parameterSearch}
                      onChange={(e) => setParameterSearch(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
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
                          <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                                                          <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Parameter</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Value</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Unit</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredRegisters.map((register, index) => (
                              <tr 
                                key={register.id || index} 
                                className="hover:bg-gray-50 transition-colors duration-200"
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
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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

            <div className="flex gap-3 p-6 bg-gray-50 rounded-b-xl border-t border-gray-100">
              <button
                onClick={closeValueModal}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmValueChange}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
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
