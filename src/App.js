import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import { AppProvider } from './contexts/AppContext';
import MainLayout from './components/Layout/MainLayout';
import Overview from './pages/Overview';
import Network from './pages/Network';
import Devices from './pages/Devices';
import Logs from './pages/Logs';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import Control from './pages/Control';
import socketService from './services/socketService';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize socket connection when app starts
    socketService.connect();
    
    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <Provider store={store}>
      <AppProvider>
        <Router>
          <div className="App">
            <MainLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/overview" replace />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/network" element={<Network />} />
                <Route path="/devices" element={<Devices />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/control" element={<Control />} />
                <Route path="*" element={<Navigate to="/overview" replace />} />
              </Routes>
            </MainLayout>
          </div>
        </Router>
      </AppProvider>
    </Provider>
  );
}

export default App; 