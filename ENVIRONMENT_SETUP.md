# 🌍 Frontend Environment Configuration

## 📋 Required Environment Variables

The frontend application requires the following environment variables to be set in a `.env` file in the `frontend/` directory:

### **Socket Connection**
```bash
REACT_APP_SOCKET_URL=http://localhost:5001
```
- **Purpose**: WebSocket connection URL for real-time communication
- **Default**: `http://localhost:5001`
- **Format**: Full URL including protocol and port

### **API Backend**
```bash
REACT_APP_API_URL=http://localhost:5001
```
- **Purpose**: HTTP API endpoint for network and serial management
- **Default**: `http://localhost:5001`
- **Format**: Full URL including protocol and port

## 🔧 Setup Instructions

### **1. Create Environment File**
Create a `.env` file in the `frontend/` directory:

```bash
cd frontend
touch .env
```

### **2. Add Environment Variables**
Add the following content to your `.env` file:

```bash
# Socket.IO WebSocket URL
REACT_APP_SOCKET_URL=http://localhost:5001

# Backend API URL
REACT_APP_API_URL=http://localhost:5001
```

### **3. Restart Development Server**
After creating/updating the `.env` file, restart your development server:

```bash
npm run dev
```

## 🌐 Environment Examples

### **Local Development**
```bash
REACT_APP_SOCKET_URL=http://localhost:5001
REACT_APP_API_URL=http://localhost:5001
```

### **Production (Example)**
```bash
REACT_APP_SOCKET_URL=https://yourdomain.com
REACT_APP_API_URL=https://yourdomain.com
```

### **Custom Backend Port**
```bash
REACT_APP_SOCKET_URL=http://localhost:3001
REACT_APP_API_URL=http://localhost:3001
```

## ⚠️ Important Notes

1. **File Location**: The `.env` file must be in the `frontend/` directory
2. **Naming Convention**: All variables must start with `REACT_APP_`
3. **Restart Required**: Changes require restarting the development server
4. **No Spaces**: Don't use spaces around the `=` sign
5. **Quotes**: Values don't need quotes unless they contain spaces

## 🔍 Verification

To verify your environment variables are loaded correctly:

1. Check the browser console for any connection errors
2. Verify the Network page loads without API errors
3. Check that socket connections are established

## 🚨 Troubleshooting

### **API Calls Failing**
- Verify `REACT_APP_API_URL` is set correctly
- Check that the backend server is running
- Ensure the backend is accessible from the frontend

### **Socket Connection Issues**
- Verify `REACT_APP_SOCKET_URL` is set correctly
- Check that the backend Socket.IO server is running
- Ensure no firewall blocking the connection

### **Environment Not Loading**
- Verify the `.env` file is in the correct directory
- Check that variable names start with `REACT_APP_`
- Restart the development server after changes 