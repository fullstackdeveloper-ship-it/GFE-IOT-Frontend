import React from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setActiveTab } from '../../features/navigationSlice';
import {
  Home,
  Network,
  FileText,
  Bell,
  Settings,
  Sliders,
} from 'lucide-react';

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const { activeTab, tabs } = useAppSelector((state) => state.navigation);
  const { unreadCount } = useAppSelector((state) => state.alerts);

  const getIcon = (iconName) => {
    const icons = {
      Home,
      Network,
      FileText,
      Bell,
      Settings,
      Sliders,
    };
    const IconComponent = icons[iconName];
    return IconComponent ? <IconComponent size={20} /> : null;
  };

  const handleTabClick = (tabId) => {
    dispatch(setActiveTab(tabId));
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-green-400">Green Project</h1>
        <p className="text-sm text-gray-400 mt-1">IoT Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="mr-3">{getIcon(tab.icon)}</span>
                <span className="font-medium">{tab.label}</span>
                {tab.id === 'alerts' && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Version 1.0.0</span>
          <span>© 2025</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 