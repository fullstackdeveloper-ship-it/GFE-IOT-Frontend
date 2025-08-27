import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const { isAuthenticated, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleLogin = () => {
    setShowLoginModal(true);
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.right - 192 // 192px is the width of the dropdown (w-48)
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="relative z-50" ref={dropdownRef}>
        <button
          ref={buttonRef}
          onClick={handleButtonClick}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/60 backdrop-blur-sm border border-[#0097b2]/20 shadow-sm hover:bg-white/80 transition-all duration-200 hover:scale-105"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-[#0097b2] to-[#7ed957] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {isAuthenticated ? 'Admin' : 'Guest'}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && createPortal(
          <div 
            className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[99999]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left
            }}
            ref={dropdownRef}
          >
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-semibold text-gray-800">Admin User</div>
                  <div className="text-xs text-gray-500">System Administrator</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>,
          document.body
        )}
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};

export default ProfileDropdown;
