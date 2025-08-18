import React from 'react';
import { useAppSelector } from '../../hooks/redux';
import { Wifi, WifiOff, Clock, User, RefreshCw } from 'lucide-react';

const Header = () => {
  const { isConnected, lastUpdate } = useAppSelector((state) => state.sensor);
  const { activeTab } = useAppSelector((state) => state.navigation);

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  const getConnectionStatusColor = () => {
    if (isConnected) {
      return 'text-green-600 bg-green-100';
    }
    return 'text-red-600 bg-red-100';
  };

  const getConnectionStatusIcon = () => {
    if (isConnected) {
      return <Wifi className="text-green-500" size={20} />;
    }
    return <WifiOff className="text-red-500" size={20} />;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            {activeTab}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time monitoring and control
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-6">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {getConnectionStatusIcon()}
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConnectionStatusColor()}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          {/* Last Update */}
          <div className="flex items-center space-x-2 text-gray-500">
            <Clock size={16} />
            <span className="text-sm">
              Last update: {formatTime(lastUpdate)}
            </span>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={16} className="text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 