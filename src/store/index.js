import { configureStore } from '@reduxjs/toolkit';
import sensorReducer from '../features/sensorSlice';
import navigationReducer from '../features/navigationSlice';
import logsReducer from '../features/logsSlice';
import alertsReducer from '../features/alertsSlice';

export const store = configureStore({
  reducer: {
    sensor: sensorReducer,
    navigation: navigationReducer,
    logs: logsReducer,
    alerts: alertsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['sensor/setSocketData'],
        ignoredPaths: ['sensor.socketData'],
      },
    }),
}); 