import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppSelector } from '../../hooks/redux';
import Overview from '../../pages/Overview';
import Network from '../../pages/Network';
import Devices from '../../pages/Devices';
import Logs from '../../pages/Logs';
import Alerts from '../../pages/Alerts';
import Settings from '../../pages/Settings';
import Control from '../../pages/Control';

const MainLayout = () => {
  const { activeTab } = useAppSelector((state) => state.navigation);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'network':
        return <Network />;
      case 'devices':
        return <Devices />;
      case 'logs':
        return <Logs />;
      case 'alerts':
        return <Alerts />;
      case 'settings':
        return <Settings />;
      case 'control':
        return <Control />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 