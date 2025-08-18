// Sample data generator for testing purposes
export const generateSampleSensorData = () => {
  const baseTime = Date.now();
  
  return {
    temperature: Math.round((20 + Math.random() * 15) * 10) / 10,
    humidity: Math.round(40 + Math.random() * 40),
    light: Math.round(200 + Math.random() * 800),
    pressure: Math.round((1000 + Math.random() * 50) * 10) / 10,
    wind: Math.round((0 + Math.random() * 10) * 10) / 10,
    activity: Math.round(Math.random() * 100),
    timestamp: new Date(baseTime).toISOString(),
  };
};

export const generateSampleLogs = (count = 10) => {
  const levels = ['info', 'warning', 'error'];
  const messages = [
    'Sensor data received successfully',
    'Temperature reading above threshold',
    'Connection established with sensor node',
    'Humidity levels are optimal',
    'Light sensor calibration completed',
    'Network connection lost',
    'Data backup completed',
    'System maintenance scheduled',
    'Alert threshold exceeded',
    'Device firmware updated',
  ];

  const logs = [];
  for (let i = 0; i < count; i++) {
    logs.push({
      level: levels[Math.floor(Math.random() * levels.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const generateSampleAlerts = (count = 5) => {
  const severities = ['low', 'medium', 'high', 'critical'];
  const titles = [
    'Temperature Alert',
    'Humidity Warning',
    'Connection Lost',
    'System Overload',
    'Maintenance Required',
  ];
  const messages = [
    'Temperature has exceeded the normal range',
    'Humidity levels are below recommended threshold',
    'Connection to sensor node has been lost',
    'System resources are running low',
    'Scheduled maintenance is due',
  ];

  const alerts = [];
  for (let i = 0; i < count; i++) {
    alerts.push({
      title: titles[Math.floor(Math.random() * titles.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      read: Math.random() > 0.5,
    });
  }

  return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const generateHistoricalData = (hours = 24) => {
  const data = [];
  const now = Date.now();
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now - i * 3600000);
    data.push({
      time: timestamp.toISOString(),
      temperature: 20 + Math.sin(i / 6) * 5 + (Math.random() - 0.5) * 2,
      humidity: 50 + Math.sin(i / 8) * 20 + (Math.random() - 0.5) * 10,
      light: 300 + Math.sin(i / 12) * 200 + (Math.random() - 0.5) * 100,
      pressure: 1013 + Math.sin(i / 10) * 10 + (Math.random() - 0.5) * 5,
    });
  }
  
  return data;
}; 