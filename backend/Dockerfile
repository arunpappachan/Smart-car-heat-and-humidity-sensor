# ------------------------------------------------------------------------------
# Backend Dockerfile for Smart Car Heat and Humidity Monitoring System
# Node.js 20 on lightweight Alpine Linux
# ------------------------------------------------------------------------------
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Install build dependencies for native compilation if required
RUN apk add --no-cache curl python3 make g++

# Copy package files first for optimal Docker layer caching
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose backend REST & WebSocket port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Health check to ensure service is responding
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start Node.js server
CMD ["npm", "start"]
