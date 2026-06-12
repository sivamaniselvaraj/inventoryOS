
#=== Stage 1: Build the Angular application ===
FROM node:alpine AS build

LABEL Name=inventorymanagement Version=0.0.1

# Set the working directory inside the container
WORKDIR /app

# Copy package-related files first to leverage Docker's caching mechanism
COPY package.json package-lock.json* ./

# Install project dependencies using npm ci (ensures a clean, reproducible install)
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy the rest of the application source code into the container
COPY . .

# Build the Angular application
RUN npm run build

# === Stage 2: Serve the application with NGINX ===
FROM nginx:alpine AS runner

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the static build output from the build stage to Nginx's default HTML serving directory
COPY --from=build /app/dist/*/browser /usr/share/nginx/html

# Use a non-root user for security best practices
# USER nginx

# Expose port 8080 to allow HTTP traffic
# Note: The default Nginx container now listens on port 8080 instead of 80 
#EXPOSE 8080

#CMD ["nginx", "-g", "daemon off;"]