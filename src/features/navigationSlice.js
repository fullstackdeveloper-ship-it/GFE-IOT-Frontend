import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'overview',
  tabs: [
    { id: 'overview', label: 'Overview', icon: 'Home' },
    { id: 'network', label: 'Network', icon: 'Network' },
    { id: 'logs', label: 'Logs', icon: 'FileText' },
    { id: 'alerts', label: 'Alerts', icon: 'Bell' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
    { id: 'control', label: 'Control', icon: 'Sliders' },
  ],
};

export const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTab } = navigationSlice.actions;

export default navigationSlice.reducer; 