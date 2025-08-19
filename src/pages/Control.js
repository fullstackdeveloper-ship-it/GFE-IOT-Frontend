import React from 'react';
import { useAppSelector } from '../hooks/redux';
import {
  Power,
  Wifi,
  WifiOff,
  Info,
} from 'lucide-react';

const Control = () => {
  const { isConnected } = useAppSelector((state) => state.sensor);

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
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">System Control</h2>
            <p className="text-sm text-gray-500">
              Monitor and control socket connection status
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

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Power className="text-blue-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Connection Status</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Socket Connection</p>
                <p className="text-xs text-gray-500">WebSocket to Flask server</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Server Status</p>
                <p className="text-xs text-gray-500">Flask-SocketIO backend</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Wifi className="text-green-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Network Info</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Server URL:</span>
              <span className="text-sm font-mono text-gray-900">
                {process.env.REACT_APP_SOCKET_URL ? 
                  new URL(process.env.REACT_APP_SOCKET_URL).host : 
                  'localhost:5001'
                }
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Protocol:</span>
              <span className="text-sm text-gray-900">WebSocket</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`text-sm font-medium ${
                isConnected ? 'text-green-600' : 'text-red-600'
              }`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Info className="text-blue-400" size={24} />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Control Information
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This page shows the current status of the socket connection to your Flask backend. 
                The connection is automatically managed by the frontend application.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Control; 