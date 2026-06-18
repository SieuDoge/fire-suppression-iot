# Stage 1: Build the React application
FROM node:18-alpine AS builder
WORKDIR /app
# Copy package files and install dependencies
COPY package*.json ./
RUN npm install
# Copy source code and build
COPY . .
ENV VITE_USE_REAL_API=true
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
# Copy the built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
