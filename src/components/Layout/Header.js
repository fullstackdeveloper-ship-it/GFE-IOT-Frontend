import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { useAppContext } from '../../contexts/AppContext';
import { Wifi, WifiOff, Clock, User, Bell, ChevronDown, Settings, LogOut } from 'lucide-react';
import ApiService from '../../services/apiService';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isConnected, lastUpdate } = useAppSelector((state) => state.sensor);
  const { unreadCount } = useAppSelector((state) => state.alerts);
  const { appConfig } = useAppContext();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);



  // Check connectivity periodically using Google DNS ping
  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        const response = await ApiService.ping();
        // Use the enhanced ping response that checks 8.8.8.8
        setIsOnline(response.connectivity === true);
      } catch (error) {
        setIsOnline(false);
      }
    };

    checkConnectivity();
    const interval = setInterval(checkConnectivity, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    navigate('/settings');
  };

  const handleLogoutClick = () => {
    setShowUserMenu(false);
    // TODO: Implement logout logic when auth is added
    console.log('Logout clicked');
  };

  const formatTime = (date) => {
    // Show actual device/browser current time (not from config)
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-[#198c1a]/15 shadow-lg shadow-[#198c1a]/5 relative overflow-hidden">
      {/* Perfect gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0097b2]/3 via-[#198c1a]/5 to-[#0097b2]/3"></div>
      <div className="flex items-center justify-between px-6 py-4 h-16 relative z-10">
        {/* Site Name */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent transition-all duration-300">
            {appConfig.siteName}
          </h1>
        </div>

        {/* Center: Empty space for cleaner layout */}
        <div></div>

        {/* Right: Status Icons */}
        <div className="flex items-center space-x-3">
          {/* Time Display */}
          <div className="px-3 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-[#0097b2]/20 shadow-sm">
            <span className="text-lg font-bold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">
              {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          {/* WiFi/Connectivity Status */}
          <div className="flex items-center px-3 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-[#0097b2]/20 shadow-sm">
            <div className="relative">
              {isOnline ? (
                <Wifi size={20} className="text-[#198c1a]" />
              ) : (
                <WifiOff size={20} className="text-red-500" />
              )}
              {isOnline && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#198c1a] rounded-full animate-ping"></div>
              )}
            </div>
          </div>

          {/* Alerts */}
          <div className="relative">
            <button className="p-2 bg-white/60 backdrop-blur-sm rounded-lg border border-[#0097b2]/20 shadow-sm hover:bg-white/80 transition-all duration-200 hover:scale-105">
              <Bell size={20} className="text-[#0097b2]" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse">
                  {unreadCount}
                </div>
              )}
            </button>
          </div>

          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-[#0097b2]/20 shadow-sm hover:bg-white/80 transition-all duration-200 hover:scale-105 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#0097b2] to-[#198c1a] rounded-full flex items-center justify-center shadow-lg">
                <User size={16} className="text-white" />
              </div>
              <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 group-hover:scale-110 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-[#0097b2]/20 py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-semibold text-gray-800">Admin User</div>
                  <div className="text-xs text-gray-500">System Administrator</div>
                </div>
                <button 
                  onClick={handleSettingsClick}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#0097b2]/10 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={handleLogoutClick}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
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