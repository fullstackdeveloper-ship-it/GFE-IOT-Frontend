import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import ApiService from '../services/apiService';

const ActivePowerChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [powerMeterDevices, setPowerMeterDevices] = useState([]);
  const [timeRange, setTimeRange] = useState(24); // hours
  
  // Dropdown states
  const [isDeviceDropdownOpen, setIsDeviceDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  // Time range options
  const timeRangeOptions = [
    { value: 1, label: 'Last Hour' },
    { value: 6, label: 'Last 6 Hours' },
    { value: 12, label: 'Last 12 Hours' },
    { value: 24, label: 'Last 24 Hours' }
  ];

  // Fetch power meter devices on component mount
  useEffect(() => {
    fetchPowerMeterDevices();
  }, []);

  // Fetch data when device or time range changes
  useEffect(() => {
    if (selectedDevice) {
      fetchActivePowerData();
    }
  }, [selectedDevice, timeRange]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDeviceDropdownOpen && !event.target.closest('.device-dropdown-container')) {
        setIsDeviceDropdownOpen(false);
      }
      if (isTimeDropdownOpen && !event.target.closest('.time-dropdown-container')) {
        setIsTimeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDeviceDropdownOpen, isTimeDropdownOpen]);

  const fetchPowerMeterDevices = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getPowerMeterDevices();
      if (response.success) {
        setPowerMeterDevices(response.data);
        // Auto-select first device if available
        if (response.data.length > 0 && !selectedDevice) {
          setSelectedDevice(response.data[0]);
        }
      } else {
        toast.error('Failed to fetch power meter devices');
      }
    } catch (error) {
      console.error('Error fetching power meter devices:', error);
      toast.error('Error fetching power meter devices');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivePowerData = async () => {
    if (!selectedDevice) return;
    
    setLoading(true);
    try {
      const response = await ApiService.getDeviceActivePowerData(selectedDevice, timeRange);
      if (response.success) {
        setChartData(response.data);
        toast.success(`Loaded ${response.data_count} data points for ${selectedDevice} (${response.time_filter})`);
      } else {
        toast.error('Failed to fetch active power data');
      }
    } catch (error) {
      console.error('Error fetching active power data:', error);
      toast.error('Error fetching active power data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceChange = (deviceName) => {
    setSelectedDevice(deviceName);
    setIsDeviceDropdownOpen(false);
  };

  const handleTimeRangeChange = (hours) => {
    setTimeRange(hours);
    setIsTimeDropdownOpen(false);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
          <p className="text-gray-600 font-semibold mb-2">{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between mb-1">
              <span className="font-medium" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span className="font-bold ml-2">
                {entry.value.toLocaleString()} W
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (powerMeterDevices.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-xl border border-[#198c1a]/15 shadow-xl shadow-[#198c1a]/5 p-6">
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Power Meter Devices Found</h3>
          <p className="text-gray-600 mb-4">No devices with device_type 'power_meter' found in the database.</p>
          <button
            onClick={fetchPowerMeterDevices}
            className="px-4 py-2 bg-[#198c1a] text-white rounded-lg hover:bg-[#167a17] transition-colors"
          >
            Refresh Devices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#198c1a]/15 shadow-xl shadow-[#198c1a]/5 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            AC Active Power Analysis {selectedDevice && `- ${selectedDevice}`}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {selectedDevice ? `Real-time power consumption monitoring (${timeRange} hour${timeRange > 1 ? 's' : ''})` : 'Select a device to view data'}
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          {/* Device Selection Dropdown */}
          <div className="relative device-dropdown-container">
            <button
              onClick={() => setIsDeviceDropdownOpen(!isDeviceDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm hover:bg-white/90 transition-all duration-200"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {selectedDevice || 'Select Device'}
              </span>
              <svg className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isDeviceDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Device Dropdown Menu */}
            {isDeviceDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="py-1">
                  {powerMeterDevices.map((deviceName) => (
                    <button
                      key={deviceName}
                      onClick={() => handleDeviceChange(deviceName)}
                      className={`w-full px-4 py-2 text-left text-sm transition-all duration-200 flex items-center justify-between group ${
                        selectedDevice === deviceName 
                          ? 'bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white shadow-md' 
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
                      }`}
                    >
                      <span className="font-medium">{deviceName}</span>
                      {selectedDevice === deviceName ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg className="w-4 h-4 text-[#0097b2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Time Range Dropdown */}
          <div className="relative time-dropdown-container">
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm hover:bg-white/90 transition-all duration-200"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {timeRangeOptions.find(opt => opt.value === timeRange)?.label || 'Last 24 Hours'}
              </span>
              <svg className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isTimeDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Time Range Dropdown Menu */}
            {isTimeDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="py-1">
                  {timeRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleTimeRangeChange(option.value)}
                      className={`w-full px-4 py-2 text-left text-sm transition-all duration-200 flex items-center justify-between group ${
                        timeRange === option.value 
                          ? 'bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white shadow-md' 
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      {timeRange === option.value ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg className="w-4 h-4 text-[#0097b2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="w-full h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#198c1a] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading data...</p>
          </div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="w-full h-80 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No data available for the selected device and time range.</p>
            <button
              onClick={fetchActivePowerData}
              className="px-4 py-2 bg-[#198c1a] text-white rounded-lg hover:bg-[#167a17] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ 
                  value: 'Power (W)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#6b7280' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              
              <Line
                type="monotone"
                dataKey="W"
                name="W"
                stroke="url(#totalPowerGradient)"
                strokeWidth={3}
                dot={{ fill: '#198c1a', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#198c1a', strokeWidth: 2 }}
              />
              
              <Line
                type="monotone"
                dataKey="WphA"
                name="WphA"
                stroke="url(#phaseAGradient)"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
              
              <Line
                type="monotone"
                dataKey="WphB"
                name="WphB"
                stroke="url(#phaseBGradient)"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              />
              
              <Line
                type="monotone"
                dataKey="WphC"
                name="WphC"
                stroke="url(#phaseCGradient)"
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
              />

              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="totalPowerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#198c1a" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#198c1a" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="phaseAGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="phaseBGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="phaseCGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          onClick={fetchActivePowerData}
          disabled={!selectedDevice || loading}
          className="px-6 py-2 bg-[#198c1a] text-white rounded-lg hover:bg-[#167a17] disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        {selectedDevice ? `Showing real-time data for ${selectedDevice}` : 'Please select a device to view data'}
      </div>
    </div>
  );
};

export default ActivePowerChart;
