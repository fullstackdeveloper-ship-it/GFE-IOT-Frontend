import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import {
  Home,
  Network,
  Server,
  FileText,
  Bell,
  Settings,
  Sliders,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { unreadCount } = useAppSelector((state) => state.alerts);

  // Define navigation items with their routes
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'Home', path: '/overview' },
    { id: 'network',  label: 'Network',  icon: 'Network', path: '/network' },
    { id: 'devices',  label: 'Devices',  icon: 'Server',  path: '/devices' },
    { id: 'logs',     label: 'Logs',     icon: 'FileText', path: '/logs' },
    { id: 'alerts',   label: 'Alerts',   icon: 'Bell',     path: '/alerts' },
    { id: 'settings', label: 'Settings', icon: 'Settings', path: '/settings' },
    { id: 'control',  label: 'Control',  icon: 'Sliders',  path: '/control' },
  ];

  // Robust active check: exact or nested path match
  const isActivePath = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    return savedCollapsed ? JSON.parse(savedCollapsed) : false;
  });

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const savedWidth = localStorage.getItem('sidebarWidth');
    return savedWidth ? parseInt(savedWidth) : 256;
  });

  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  const resizerRef = useRef(null);
  const isResizingRef = useRef(false);

  const mouseMoveHandler = useRef();
  const mouseUpHandler = useRef();

  mouseMoveHandler.current = (e) => {
    if (!isResizingRef.current) return;

    const newWidth = e.clientX;
    const minWidth = 200;
    const maxWidth = 400;

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
    }
  };

  mouseUpHandler.current = () => {
    isResizingRef.current = false;
    setIsResizing(false);
    document.body.classList.remove('resizing');
    document.removeEventListener('mousemove', mouseMoveHandler.current);
    document.removeEventListener('mouseup', mouseUpHandler.current);
  };

  const handleMouseDown = (e) => {
    isResizingRef.current = true;
    setIsResizing(true);
    document.body.classList.add('resizing');
    document.addEventListener('mousemove', mouseMoveHandler.current);
    document.addEventListener('mouseup', mouseUpHandler.current);
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    localStorage.setItem('sidebarWidth', sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    return () => {
      document.body.classList.remove('resizing');
      document.removeEventListener('mousemove', mouseMoveHandler.current);
      document.removeEventListener('mouseup', mouseUpHandler.current);
    };
  }, []);

  const getIcon = (iconName) => {
    const icons = { Home, Network, Server, FileText, Bell, Settings, Sliders };
    const IconComponent = icons[iconName];
    return IconComponent ? <IconComponent size={20} /> : null;
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div
      ref={sidebarRef}
      className="relative h-screen flex flex-col shadow-2xl transition-all duration-300 ease-in-out overflow-hidden text-white"
      style={{
        width: isCollapsed ? '80px' : `${sidebarWidth}px`,
        // 🌈 Rich vertical gradient (top → bottom): aqua → teal → mint → fresh green → deep green
        background:
          'linear-gradient(180deg, #0097B2 0%, #00B5CC 25%, #14C8AA 50%, #16B85C 75%, #198C1A 100%)',
      }}
    >
      {/* Header */}
      <div className="relative z-10 p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div
            className={`${
              isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
            } transition-all duration-300 overflow-hidden`}
          >
            <h1 className="text-xl font-bold text-white">Green Project</h1>
            <p className="text-sm text-white/80 mt-1">IoT Dashboard</p>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 relative z-10">
        <ul className="space-y-2">
          {tabs.map((tab, index) => {
            const isActive = isActivePath(tab.path);
            return (
              <li
                key={tab.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-fade-in-up"
              >
                <Link
                  to={tab.path}
                                     className={`relative w-full flex items-center ${
                     isCollapsed ? 'px-3 justify-center' : 'px-4'
                   } py-3 rounded-xl transition-all duration-300 group overflow-hidden
                   ${
                     isActive
                       ? 'bg-[#198c1a]/80 backdrop-blur-sm ring-2 ring-[#198c1a]/60 shadow-[0_8px_32px_rgba(25,140,26,0.4)] text-white border border-[#198c1a]/40'
                       : 'text-white/85 hover:bg-white/10 hover:text-white'
                   }`}
                  title={isCollapsed ? tab.label : ''}
                >
                  {/* Left active indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_25px_rgba(25,140,26,0.6)]" />
                  )}

                  {/* Icon */}
                  <span
                    className={`${isCollapsed ? 'mr-0' : 'mr-3'} ${
                      isActive ? 'drop-shadow' : ''
                    } transition-transform duration-300 group-hover:scale-110`}
                  >
                    {getIcon(tab.icon)}
                  </span>

                  {/* Label */}
                  <span
                    className={`${
                      isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
                    } font-medium transition-all duration-300`}
                  >
                    {tab.label}
                  </span>

                  {/* Alerts badge */}
                  {tab.id === 'alerts' && unreadCount > 0 && (
                    <span
                      className={`${
                        isCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'
                      } bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow`}
                    >
                      {unreadCount}
                    </span>
                  )}

                  {/* Subtle hover sheen when inactive */}
                  {!isActive && (
                    <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl bg-gradient-to-r from-white/5 via-transparent to-white/5" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/20 relative z-10">
        <div
          className={`${
            isCollapsed
              ? 'flex flex-col items-center space-y-1'
              : 'flex items-center justify-between'
          } text-sm text-white/70`}
        >
          <span className="font-medium">v1.0.0</span>
          {!isCollapsed && <span className="font-medium">© 2025</span>}
        </div>
      </div>

      {/* Enhanced Resize Handle */}
      {!isCollapsed && (
        <div
          ref={resizerRef}
          className={`resize-handle absolute top-0 right-0 w-4 h-full z-50 transition-all duration-200 group cursor-col-resize ${
            isResizing ? 'bg-white/40 border-l-2 border-white/60' : 'hover:bg-white/20'
          }`}
          onMouseDown={handleMouseDown}
          style={{ cursor: 'col-resize' }}
          title="Drag to resize sidebar"
        >
          <div
            className={`absolute top-0 right-1 w-1 h-full transition-all duration-200 ${
              isResizing ? 'bg-white/90 shadow-lg' : 'bg-white/60 group-hover:bg-white/80'
            }`}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 group-hover:scale-110">
            <div
              className={`bg-white rounded-lg p-1.5 shadow-lg border transition-all duration-200 ${
                isResizing ? 'border-white/60 bg-white/90' : 'border-white/40 group-hover:border-white/60'
              }`}
            >
              <GripVertical
                size={14}
                className={`transition-colors duration-200 ${
                  isResizing ? 'text-[#0097B2]' : 'text-[#0097B2]/70 group-hover:text-[#0097B2]'
                }`}
              />
            </div>
          </div>
          <div className="absolute top-0 -left-2 w-6 h-full cursor-col-resize" />
        </div>
      )}

      {/* Custom CSS for animations and resize */}
      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }

        .cursor-col-resize,
        .cursor-col-resize:hover,
        .cursor-col-resize:active {
          cursor: col-resize !important;
        }

        :global(.resizing) {
          cursor: col-resize !important;
          user-select: none !important;
        }
        :global(.resizing *) {
          cursor: col-resize !important;
          user-select: none !important;
          pointer-events: none !important;
        }
        :global(.resizing .resize-handle) {
          pointer-events: auto !important;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
