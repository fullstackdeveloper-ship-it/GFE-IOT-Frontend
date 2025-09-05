# GFE IoT Frontend

A scalable, production-ready React frontend application for IoT device management, optimized for deployment with limited resources (1GB RAM, 2.5GB disk).

## 🏗️ Architecture

### Clean & Scalable Structure
```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components (Header, Sidebar, etc.)
│   └── ...             # Feature-specific components
├── pages/              # Page components
├── services/           # API and Socket services
│   ├── api/           # Centralized API service
│   └── socket/        # Socket connection management
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── config/             # Centralized configuration
├── store/              # Redux store
└── features/           # Redux slices
```

### Key Features
- **Centralized API Service**: Organized endpoints with retry logic and error handling
- **Single Socket Connection**: Efficient real-time communication with batching
- **Configuration Management**: Environment-based configuration
- **Performance Optimized**: Bundle splitting, compression, and caching
- **Production Ready**: Docker containerization with Nginx

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### Production Build
```bash
# Build for production
npm run build:prod

# Analyze bundle size
npm run build:analyze

# Check build size
npm run size
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)
```bash
# Build and run with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Using Docker Commands
```bash
# Build image
npm run docker:build

# Run container
npm run docker:run

# Stop container
npm run docker:stop
```

### Using Deployment Script
```bash
# Make script executable (first time only)
chmod +x deploy.sh

# Deploy application
./deploy.sh
```

## 📦 Production Optimization

### Bundle Optimization
- **Code Splitting**: Automatic chunk splitting for better caching
- **Tree Shaking**: Removes unused code
- **Compression**: Gzip compression for all assets
- **Minification**: JavaScript and CSS minification
- **Source Maps**: Disabled in production for smaller bundles

### Performance Features
- **Lazy Loading**: Components loaded on demand
- **Memory Management**: Automatic cleanup of old data
- **Efficient Socket**: Batched data updates
- **Caching**: Aggressive caching for static assets

### Resource Limits
Optimized for deployment with:
- **RAM**: 1GB
- **Disk**: 2.5GB
- **CPU**: 1 core

## 🔧 Configuration

### Environment Variables
Create `.env.local` for development:
```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_SOCKET_URL=http://localhost:5001
REACT_APP_ENV=development
```

For production, set these in your deployment environment:
```env
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_SOCKET_URL=https://your-api-domain.com
REACT_APP_ENV=production
```

### API Configuration
The application uses a centralized API service with:
- Automatic retry logic
- Request timeout handling
- Error handling and user feedback
- Authentication token management

### Socket Configuration
Real-time features include:
- Automatic reconnection
- Connection health monitoring
- Data batching for performance
- Memory-efficient data management

## 🛠️ Development

### Project Structure
- **Components**: Reusable UI components with proper separation of concerns
- **Hooks**: Custom hooks for API calls, socket connections, and common functionality
- **Services**: Centralized API and socket services
- **Utils**: Validation, helpers, and utility functions
- **Config**: Environment-based configuration management

### Code Quality
- **ESLint**: Code linting with React-specific rules
- **Prettier**: Code formatting (configured via ESLint)
- **Testing**: Jest and React Testing Library
- **TypeScript**: Optional type safety (can be added)

### Performance Monitoring
- Bundle size analysis
- Performance metrics
- Memory usage monitoring
- Connection health tracking

## 📊 Monitoring & Health Checks

### Health Endpoints
- `GET /health` - Application health check
- Socket connection status monitoring
- API connectivity monitoring

### Logging
- Structured logging with different levels
- Error tracking and reporting
- Performance metrics logging

## 🔒 Security

### Security Headers
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

### Best Practices
- No sensitive data in client-side code
- Secure API communication
- Input validation and sanitization
- CSRF protection

## 🚀 Deployment Options

### 1. Docker (Recommended)
```bash
./deploy.sh
```

### 2. Nginx + Static Files
```bash
npm run build:prod
# Copy build/ to your web server
```

### 3. Cloud Deployment
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- Netlify/Vercel

## 📈 Performance Metrics

### Bundle Size
- **Development**: ~15MB (with source maps)
- **Production**: ~2-3MB (compressed)
- **Gzipped**: ~800KB-1.2MB

### Memory Usage
- **Idle**: ~50-80MB
- **Active**: ~100-150MB
- **Peak**: ~200MB

### Load Time
- **First Load**: ~2-3 seconds
- **Cached**: ~200-500ms
- **API Response**: ~100-300ms

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clean and reinstall
npm run clean
npm install
npm run build:prod
```

#### Docker Issues
```bash
# Clean Docker cache
docker system prune -a

# Rebuild image
docker build --no-cache -t gfe-iot-frontend:latest .
```

#### Socket Connection Issues
- Check API URL configuration
- Verify network connectivity
- Check firewall settings
- Review browser console for errors

### Performance Issues
- Monitor bundle size with `npm run build:analyze`
- Check memory usage in browser dev tools
- Review network requests in dev tools
- Use production build for testing

## 📝 License

This project is proprietary software developed for GFE IoT systems.

## 🤝 Contributing

1. Follow the established code structure
2. Write tests for new features
3. Update documentation
4. Follow the coding standards
5. Test in production-like environment

## 📞 Support

For technical support or questions:
- Check the troubleshooting section
- Review the logs and error messages
- Contact the development team

---

**Built with ❤️ for GFE IoT Systems**
