import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { useAppContext } from '../../contexts/AppContext';
import { Wifi, WifiOff, Bell } from 'lucide-react';
import ApiService from '../../services/apiService';
import ProfileDropdown from '../ProfileDropdown';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isConnected, lastUpdate } = useAppSelector((state) => state.sensor);
  const { unreadCount } = useAppSelector((state) => state.alerts);
  const { appConfig } = useAppContext();
  
  const [currentTime, setCurrentTime] = useState(new Date());
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

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-[#198c1a]/15 shadow-lg shadow-[#198c1a]/5 relative">
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

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header; 