import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import MainLayout from './components/Layout/MainLayout';
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
      <div className="App">
        <MainLayout />
      </div>
    </Provider>
  );
}

export default App; 