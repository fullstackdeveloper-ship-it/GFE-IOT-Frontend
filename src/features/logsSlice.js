import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  logs: [],
  filters: {
    level: 'all',
    search: '',
  },
  loading: false,
};

export const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    addLog: (state, action) => {
      state.logs.unshift(action.payload);
      // Keep only last 1000 logs
      if (state.logs.length > 1000) {
        state.logs = state.logs.slice(0, 1000);
      }
    },
    setLogs: (state, action) => {
      state.logs = action.payload;
    },
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearLogs: (state) => {
      state.logs = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { addLog, setLogs, setFilter, clearLogs, setLoading } = logsSlice.actions;

export default logsSlice.reducer; 