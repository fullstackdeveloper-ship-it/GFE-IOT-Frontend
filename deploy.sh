#!/bin/bash

# GFE IoT Frontend Deployment Script
# Optimized for production deployment with limited resources

set -e

echo "🚀 Starting GFE IoT Frontend deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="gfe-iot-frontend"
DOCKER_IMAGE="gfe-iot-frontend:latest"
CONTAINER_NAME="gfe-iot-frontend"
NGINX_PORT=80

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Clean up previous build
print_status "Cleaning up previous build..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true
docker rmi $DOCKER_IMAGE 2>/dev/null || true

# Build the Docker image
print_status "Building Docker image..."
docker build -t $DOCKER_IMAGE .

if [ $? -eq 0 ]; then
    print_status "Docker image built successfully!"
else
    print_error "Failed to build Docker image"
    exit 1
fi

# Run the container
print_status "Starting container..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p $NGINX_PORT:80 \
    $DOCKER_IMAGE

if [ $? -eq 0 ]; then
    print_status "Container started successfully!"
else
    print_error "Failed to start container"
    exit 1
fi

# Wait for container to be ready
print_status "Waiting for application to be ready..."
sleep 5

# Health check
print_status "Performing health check..."
if curl -f http://localhost:$NGINX_PORT/health &> /dev/null; then
    print_status "✅ Application is healthy and running!"
    print_status "🌐 Application is available at: http://localhost:$NGINX_PORT"
else
    print_warning "Health check failed, but container is running"
    print_status "🌐 Application is available at: http://localhost:$NGINX_PORT"
fi

# Show container status
print_status "Container status:"
docker ps --filter "name=$CONTAINER_NAME"

# Show container logs
print_status "Recent container logs:"
docker logs --tail 20 $CONTAINER_NAME

echo ""
print_status "🎉 Deployment completed successfully!"
echo ""
print_status "Useful commands:"
echo "  View logs: docker logs -f $CONTAINER_NAME"
echo "  Stop app:  docker stop $CONTAINER_NAME"
echo "  Start app: docker start $CONTAINER_NAME"
echo "  Remove app: docker rm -f $CONTAINER_NAME"
echo ""
