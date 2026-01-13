# =============================================================================
# FILE: frontend/Dockerfile
# PURPOSE: Build and serve the React frontend
# =============================================================================
# This uses multi-stage builds:
# Stage 1: Build the React app
# Stage 2: Serve it with nginx (lightweight web server)

# -----------------------------------------------------------------------------
# STAGE 1: BUILD
# -----------------------------------------------------------------------------
# Name this stage "build" so we can reference it later
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the production bundle
# This creates optimized static files in /app/dist
RUN npm run build

# -----------------------------------------------------------------------------
# STAGE 2: SERVE
# -----------------------------------------------------------------------------
# Start fresh with nginx (tiny web server)
# alpine = minimal Linux distribution
FROM nginx:alpine

# Copy built files from stage 1 to nginx's web root
# --from=build references the first stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config (we'll create this next)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (standard HTTP port)
EXPOSE 80

# nginx runs automatically, no CMD needed