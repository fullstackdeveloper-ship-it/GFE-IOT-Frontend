import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { Wifi, WifiOff, Clock, User, RefreshCw, Bell, ChevronDown, Activity } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const { isConnected, lastUpdate } = useAppSelector((state) => state.sensor);
  const { unreadCount } = useAppSelector((state) => state.alerts);
  
  // Get current page name from the URL
  const getCurrentPageName = () => {
    const pathname = location.pathname;
    if (pathname === '/' || pathname === '/overview') return 'overview';
    return pathname.substring(1); // Remove leading slash
  };
  
  const activeTab = getCurrentPageName();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  const getConnectionStatusColor = () => {
    if (isConnected) {
      return 'text-[#198c1a] bg-gradient-to-r from-[#198c1a]/20 to-[#0097b2]/20';
    }
    return 'text-red-600 bg-gradient-to-r from-red-100 to-red-200';
  };

  const getConnectionStatusIcon = () => {
    if (isConnected) {
      return <Wifi className="text-[#198c1a]" size={20} />;
    }
    return <WifiOff className="text-red-500" size={20} />;
  };

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-[#198c1a]/15 px-6 py-4 shadow-lg shadow-[#198c1a]/5 relative overflow-hidden">
      {/* Perfect gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0097b2]/3 via-[#198c1a]/5 to-[#0097b2]/3"></div>
      <div className="flex items-center justify-between relative z-10">
        {/* Page Title with breadcrumb style */}
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-[#0097b2] to-[#198c1a] rounded-xl shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-[#0097b2] font-medium capitalize">{activeTab}</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent capitalize">
              {activeTab}
            </h1>
          </div>
        </div>

        {/* Enhanced Status Indicators */}
        <div className="flex items-center space-x-4">
          {/* Real-time Clock */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-[#0097b2]/20 shadow-sm">
            <Clock size={16} className="text-[#0097b2]" />
            <span className="text-sm font-medium text-gray-700">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>

          {/* Connection Status with pulse */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-[#0097b2]/20 shadow-sm">
            <div className="relative">
              {getConnectionStatusIcon()}
              {isConnected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#198c1a] rounded-full animate-ping"></div>
              )}
            </div>
            <div className={`px-2 py-1 rounded-md text-xs font-semibold ${getConnectionStatusColor()}`}>
              {isConnected ? 'Online' : 'Offline'}
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 bg-white/60 backdrop-blur-sm rounded-lg border border-[#0097b2]/20 shadow-sm hover:bg-white/80 transition-all duration-200 hover:scale-105">
              <Bell size={18} className="text-[#0097b2]" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse">
                  {unreadCount}
                </div>
              )}
            </button>
          </div>

          {/* Enhanced User Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-[#0097b2]/20 shadow-sm hover:bg-white/80 transition-all duration-200 hover:scale-105 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#0097b2] to-[#198c1a] rounded-full flex items-center justify-center shadow-lg">
                <User size={16} className="text-white" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-gray-800">Admin</div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
              <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 group-hover:scale-110 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-[#0097b2]/20 py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-semibold text-gray-800">Admin User</div>
                  <div className="text-xs text-gray-500">admin@greenproject.com</div>
                </div>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#0097b2]/10 transition-colors duration-200">
                  Profile Settings
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#0097b2]/10 transition-colors duration-200">
                  Preferences
                </button>
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Header; 