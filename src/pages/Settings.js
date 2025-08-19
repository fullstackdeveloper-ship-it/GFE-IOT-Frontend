import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Wifi,
  Info,
} from 'lucide-react';

const Settings = () => {
  const [socketUrl, setSocketUrl] = useState(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001');

  const handleSave = () => {
    console.log('Saving settings:', { socketUrl });
    alert('Settings saved successfully!');
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
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-500">
              Configure socket connection and system preferences
            </p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700"
          >
            <Save size={16} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Socket Configuration */}
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Wifi className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Socket Configuration</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Socket Server URL
            </label>
            <input
              type="url"
              value={socketUrl}
              onChange={(e) => setSocketUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="http://localhost:5001"
            />
            <p className="text-xs text-gray-500 mt-1">
              The URL of your Flask-SocketIO server (from .env: {process.env.REACT_APP_SOCKET_URL || 'Not set'})
            </p>
          </div>
        </div>
      </div>

      {/* Environment Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Info className="text-gray-500" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Environment Configuration</h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-sm text-gray-600">REACT_APP_SOCKET_URL:</span>
            <span className="text-sm font-mono text-gray-900">
              {process.env.REACT_APP_SOCKET_URL || 'Not set'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600">REACT_APP_API_URL:</span>
            <span className="text-sm font-mono text-gray-900">
              {process.env.REACT_APP_API_URL || 'Not set'}
            </span>
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
              Configuration Information
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Configure the socket server URL to connect to your Flask backend. 
                The URL is loaded from the .env file. You can modify the .env file 
                to change the default connection URL.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Settings; 