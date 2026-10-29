# ------------------------------------------------------------------------------
# Frontend Multi-Stage Dockerfile
# Stage 1: Build React Production Bundle
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy frontend source code
COPY . .

# Build production bundle
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Serve Production Assets with Nginx & Reverse Proxy
# ------------------------------------------------------------------------------
FROM nginx:alpine

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
