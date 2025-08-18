import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  alerts: [],
  unreadCount: 0,
  filters: {
    severity: 'all',
    status: 'all',
  },
  loading: false,
};

export const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addAlert: (state, action) => {
      const newAlert = {
        ...action.payload,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.alerts.unshift(newAlert);
      state.unreadCount += 1;
      // Keep only last 500 alerts
      if (state.alerts.length > 500) {
        state.alerts = state.alerts.slice(0, 500);
      }
    },
    markAsRead: (state, action) => {
      const alert = state.alerts.find(a => a.id === action.payload);
      if (alert && !alert.read) {
        alert.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.alerts.forEach(alert => {
        alert.read = true;
      });
      state.unreadCount = 0;
    },
    clearAlerts: (state) => {
      state.alerts = [];
      state.unreadCount = 0;
    },
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  addAlert,
  markAsRead,
  markAllAsRead,
  clearAlerts,
  setFilter,
  setLoading,
} = alertsSlice.actions;

export default alertsSlice.reducer; 