# Stage 1: Build frontend
FROM node:18 AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:18 AS backend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 3: Production image
FROM node:18 as production
WORKDIR /app
COPY --from=backend-build /app /app
COPY --from=frontend-build /app/client/build /app/client/build

# Install nginx for static frontend
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*
COPY nginx.conf /etc/nginx/nginx.conf

ENV NODE_ENV=production
EXPOSE 80 5000

CMD service nginx start && node server.js 