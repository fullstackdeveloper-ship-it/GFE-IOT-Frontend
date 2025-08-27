import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './store';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
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
      <AuthProvider>
        <AppProvider>
          <Router>
            <div className="App">
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/overview" replace />} />
                  <Route path="/overview" element={<Overview />} />
                  <Route path="/logs" element={<Logs />} />
                  <Route path="/alerts" element={<Alerts />} />
                  
                  {/* Protected Routes */}
                  <Route path="/network" element={
                    <ProtectedRoute>
                      <Network />
                    </ProtectedRoute>
                  } />
                  <Route path="/devices" element={<Devices />} />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/control" element={
                    <ProtectedRoute>
                      <Control />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={<Navigate to="/overview" replace />} />
                </Routes>
              </MainLayout>
              
                                 {/* Global Toast Container */}
                   <ToastContainer
                     position="top-right"
                     autoClose={5000}
                     hideProgressBar={false}
                     newestOnTop={false}
                     closeOnClick
                     rtl={false}
                     pauseOnFocusLoss
                     draggable
                     pauseOnHover
                     theme="light"
                     toastClassName="!bg-white/95 !backdrop-blur-sm !border !border-[#0097b2]/20 !shadow-xl"
                     progressClassName="!bg-gradient-to-r !from-[#0097b2] !to-[#7ed957]"
                     style={{ zIndex: 1000001 }}
                   />
            </div>
          </Router>
        </AppProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App; 