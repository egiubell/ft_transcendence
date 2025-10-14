# Build stage
FROM node:18-alpine AS compile-stage

WORKDIR /build

# Copy configuration files
COPY package*.json tsconfig.json ./

# Install build dependencies (use install instead of ci for first time)
RUN npm install

# Copy source files
COPY src/ ./src/

# Compile TypeScript and copy static files
RUN npm run compile
RUN cp src/index.html build/ && cp -r src/styles build/

# Production stage
FROM nginx:alpine AS runtime-stage

# Add non-root user for security
RUN addgroup -g 1001 webgroup && \
    adduser -u 1001 -S webapp -G webgroup

# Copy compiled application
COPY --from=compile-stage /build/build/ /usr/share/nginx/html/
COPY nginx-config.conf /etc/nginx/nginx.conf

# Set ownership for webapp user
RUN chown -R webapp:webgroup /usr/share/nginx/html && \
    chown -R webapp:webgroup /var/cache/nginx && \
    chown -R webapp:webgroup /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown webapp:webgroup /var/run/nginx.pid

# Switch to non-root
USER webapp

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]