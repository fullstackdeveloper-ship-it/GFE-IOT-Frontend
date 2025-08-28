import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  sensorData: [],
  socketData: null,
  powerFlowData: null,
  isConnected: false,
  loading: false,
  error: null,
  lastUpdate: null,
  previousPowerFlowValues: {
    solar: 0,
    grid: 0,
    genset: 0,
    load: 0
  }
};

export const sensorSlice = createSlice({
  name: 'sensor',
  initialState,
  reducers: {
    setSocketData: (state, action) => {
      state.socketData = action.payload;
      state.lastUpdate = new Date().toISOString();
    },
    setPowerFlowData: (state, action) => {
      const newData = action.payload;
      
      const processedData = {
        ...newData,
        solar: newData.receivedDevices?.includes('solar') ? newData.solar : state.previousPowerFlowValues.solar,
        grid: newData.receivedDevices?.includes('grid') ? newData.grid : state.previousPowerFlowValues.grid,
        genset: newData.receivedDevices?.includes('genset') ? newData.genset : state.previousPowerFlowValues.genset,
        load: newData.load
      };
      
      state.previousPowerFlowValues = {
        solar: newData.receivedDevices?.includes('solar') ? newData.solar : state.previousPowerFlowValues.solar,
        grid: newData.receivedDevices?.includes('grid') ? newData.grid : state.previousPowerFlowValues.grid,
        genset: newData.receivedDevices?.includes('genset') ? newData.genset : state.previousPowerFlowValues.genset,
        load: newData.load
      };
      
      state.powerFlowData = processedData;
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
      state.powerFlowData = null;
      state.lastUpdate = null;
      state.error = null;
      state.previousPowerFlowValues = {
        solar: 0,
        grid: 0,
        genset: 0,
        load: 0
      };
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
  setPowerFlowData,
  setConnectionStatus,
  addSensorData,
  clearSensorData,
  setLoading,
  setError,
} = sensorSlice.actions;

export default sensorSlice.reducer; 