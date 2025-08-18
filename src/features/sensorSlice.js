import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  sensorData: [],
  socketData: null,
  isConnected: false,
  loading: false,
  error: null,
  lastUpdate: null,
};

export const sensorSlice = createSlice({
  name: 'sensor',
  initialState,
  reducers: {
    setSocketData: (state, action) => {
      state.socketData = action.payload;
      state.lastUpdate = new Date().toISOString();
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
      if (!action.payload) {
        // Clear data when disconnected
        state.socketData = null;
        state.lastUpdate = null;
      }
    },
    addSensorData: (state, action) => {
      state.sensorData.push(action.payload);
      // Keep only last 100 data points
      if (state.sensorData.length > 100) {
        state.sensorData = state.sensorData.slice(-100);
      }
    },
    clearSensorData: (state) => {
      state.sensorData = [];
      state.socketData = null;
      state.lastUpdate = null;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSocketData,
  setConnectionStatus,
  addSensorData,
  clearSensorData,
  setLoading,
  setError,
} = sensorSlice.actions;

export default sensorSlice.reducer; 