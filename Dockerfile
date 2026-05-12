# Multi-stage build for Swarlehtaire

# Stage 1: Build the Angular application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build:prod

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

# Expose port 80
EXPOSE 80

# Labels
LABEL org.opencontainers.image.title="Swarlehtaire"
LABEL org.opencontainers.image.description="Modern HTML5 card solitaire game collection"
LABEL org.opencontainers.image.authors="smingolelli"
LABEL org.opencontainers.image.source="https://github.com/slmingol/swarlehtaire"
LABEL org.opencontainers.image.licenses="MIT"

CMD ["nginx", "-g", "daemon off;"]
