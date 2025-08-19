import React from 'react';
import { useAppSelector } from '../hooks/redux';
import {
  Wifi,
  WifiOff,
  Clock,
  Activity,
  Database,
  Server,
} from 'lucide-react';

const Overview = () => {
  const { sensorData, socketData, isConnected, lastUpdate } = useAppSelector(
    (state) => state.sensor
  );

  console.log(sensorData,'sensorDatasensorDatasensorData');
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
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
      {/* Connection Status Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Socket Connection Status
            </h2>
            <p className="text-sm text-gray-500">
              Real-time connection to sensor data server
            </p>
          </div>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            isConnected
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? (
              <Wifi className="text-green-500" size={20} />
            ) : (
              <WifiOff className="text-red-500" size={20} />
            )}
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Connection Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Connection Status</p>
              <p className={`text-2xl font-bold ${
                isConnected ? 'text-green-600' : 'text-red-600'
              }`}>
                {isConnected ? 'Online' : 'Offline'}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              isConnected ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isConnected ? (
                <Wifi className="text-green-600" size={24} />
              ) : (
                <WifiOff className="text-red-600" size={24} />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Last Update</p>
              <p className="text-2xl font-bold text-gray-900">
                {lastUpdate ? formatTime(lastUpdate) : 'Never'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Clock className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Messages Received</p>
              <p className="text-2xl font-bold text-gray-900">
                {sensorData.length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Database className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Server Status</p>
              <p className={`text-2xl font-bold ${
                isConnected ? 'text-green-600' : 'text-red-600'
              }`}>
                {isConnected ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-100">
              <Server className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Latest Socket Data */}
      {socketData && (
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Latest Socket Data
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Subject:</p>
                <p className="text-sm text-gray-900 font-mono bg-white p-2 rounded border">
                  {socketData.subject || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Timestamp:</p>
                <p className="text-sm text-gray-900 font-mono bg-white p-2 rounded border">
                  {formatTimestamp(socketData.timestamp)}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Data:</p>
              <pre className="text-sm text-gray-900 bg-white p-4 rounded border overflow-x-auto">
              {JSON.stringify(socketData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Recent Messages */}
      {sensorData.length > 0 && (
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Messages ({sensorData.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sensorData.slice(-10).reverse().map((data, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-blue-600">
                  Message #{index + 1}
                </span>

                <div className="text-sm text-gray-700">
                  <pre className="whitespace-pre-wrap text-xs">
                  {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Info */}
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Connection Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Socket Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Server URL:</span>
                <span className="text-sm font-mono text-gray-900">
                  {process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Transport:</span>
                <span className="text-sm text-gray-900">WebSocket</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${
                  isConnected ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Data Statistics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Messages:</span>
                <span className="text-sm font-medium text-gray-900">{sensorData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Message:</span>
                <span className="text-sm text-gray-900">
                  {sensorData.length > 0 ? formatTime(sensorData[sensorData.length - 1].timestamp) : 'Never'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Connection Time:</span>
                <span className="text-sm text-gray-900">
                  {isConnected ? 'Active' : 'Not connected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Overview; 