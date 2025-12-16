# Build stage
FROM node:18-alpine AS compile-stage

WORKDIR /build

COPY package*.json tsconfig.json ./
RUN npm install

COPY src/ ./src/
RUN npm run build

# Production stage
FROM node:18-alpine AS runtime-stage

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled code from build stage
COPY --from=compile-stage /build/build ./build/

# Create non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

CMD ["node", "build/index.js"]
