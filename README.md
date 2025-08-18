# Green Project Frontend

A modern, professional IoT dashboard built with React, Redux Toolkit, and Tailwind CSS for real-time sensor data monitoring and control.

## Features

### 🎯 Core Features
- **Real-time Sensor Data Display** - Live monitoring of temperature, humidity, light, pressure, and more
- **Interactive Charts** - Beautiful visualizations using Recharts
- **Professional Navigation** - Clean sidebar with tab-based navigation
- **Redux State Management** - Centralized state management with Redux Toolkit
- **WebSocket Integration** - Real-time data streaming with Socket.IO

### 📊 Dashboard Sections
1. **Overview** - Real-time sensor data with charts and current values
2. **Network** - Connection status, device management, and network topology
3. **Logs** - System logs with filtering and export capabilities
4. **Alerts** - Alert management with severity levels and read/unread status
5. **Settings** - System configuration and preferences
6. **Control** - Manual device control and automation rules

### 🎨 UI/UX Features
- **Modern Design** - Clean, professional interface with Tailwind CSS
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Dark/Light Theme Support** - Configurable theme system
- **Interactive Elements** - Hover effects, animations, and smooth transitions
- **Status Indicators** - Real-time connection and system status

## Tech Stack

- **React 18** - Modern React with hooks
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **Recharts** - Data visualization
- **Lucide React** - Beautiful icons
- **React Router** - Navigation (if needed)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout/         # Layout components (Sidebar, Header, MainLayout)
├── features/           # Redux slices
│   ├── sensorSlice.js  # Sensor data management
│   ├── navigationSlice.js # Navigation state
│   ├── logsSlice.js    # Log management
│   └── alertsSlice.js  # Alert management
├── pages/              # Page components
│   ├── Overview.js     # Dashboard overview
│   ├── Network.js      # Network monitoring
│   ├── Logs.js         # System logs
│   ├── Alerts.js       # Alert management
│   ├── Settings.js     # System settings
│   └── Control.js      # Device control
├── services/           # External services
│   └── socketService.js # WebSocket management
├── store/              # Redux store configuration
│   └── index.js        # Store setup
├── hooks/              # Custom React hooks
│   └── redux.js        # Redux hooks
├── utils/              # Utility functions
│   └── sampleData.js   # Sample data generation
└── assets/             # Static assets
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_SOCKET_URL=http://localhost:3001
REACT_APP_API_URL=http://localhost:3001/api
```

## Usage

### Navigation
- Use the sidebar to navigate between different sections
- Each tab provides specific functionality for monitoring and control

### Real-time Data
- The Overview page shows live sensor data with charts
- Data updates automatically every 5 seconds
- Connection status is displayed in the header

### Sample Data Mode
- If no WebSocket server is available, the app runs in sample data mode
- Generates realistic sensor data for testing and demonstration
- Automatically switches to real data when server connects

### Settings
- Configure system preferences in the Settings page
- Adjust notification settings, data retention, and network parameters
- Save settings to persist across sessions

## Redux State Structure

### Sensor State
```javascript
{
  sensorData: [],        // Historical sensor data
  socketData: null,      // Latest socket data
  isConnected: false,    // Connection status
  loading: false,        // Loading state
  error: null,          // Error state
  lastUpdate: null      // Last update timestamp
}
```

### Navigation State
```javascript
{
  activeTab: 'overview', // Current active tab
  tabs: [...]           // Available tabs configuration
}
```

### Logs State
```javascript
{
  logs: [],             // System logs
  filters: {            // Log filters
    level: 'all',
    search: ''
  },
  loading: false        // Loading state
}
```

### Alerts State
```javascript
{
  alerts: [],           // System alerts
  unreadCount: 0,       // Unread alerts count
  filters: {            // Alert filters
    severity: 'all',
    status: 'all'
  },
  loading: false        // Loading state
}
```

## Customization

### Adding New Sensors
1. Update the sensor slice to include new sensor types
2. Add corresponding icons and colors in the Overview component
3. Update the sample data generator if needed

### Adding New Pages
1. Create a new page component in the `pages/` directory
2. Add the page to the navigation slice
3. Update the MainLayout component to include the new page

### Styling
- The app uses Tailwind CSS for styling
- Custom CSS classes are defined in `App.css`
- Theme colors can be customized in `tailwind.config.js`

## API Integration

### WebSocket Events
- `sensorData` - Receives sensor data
- `alert` - Receives system alerts
- `log` - Receives system logs

### REST API (if needed)
- Configure API endpoints in the services directory
- Use environment variables for API URLs

## Performance

- Optimized with React.memo and useMemo where appropriate
- Efficient Redux state updates
- Lazy loading for large datasets
- Debounced search and filtering

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 