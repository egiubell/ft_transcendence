# Stage 1: Build frontend
FROM node:18 AS builder
WORKDIR /app
COPY frontend/package.json frontend/tsconfig.json ./ 
COPY frontend/app.ts ./          # <-- copia app.ts nella root
COPY frontend/ ./frontend/      # opzionale se vuoi altri file
RUN npm install
RUN npm run build
