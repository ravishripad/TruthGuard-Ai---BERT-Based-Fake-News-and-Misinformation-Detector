# ──────────────────────────────────────────────────────────
# Frontend Dockerfile — React/Vite build → Nginx serve
# ──────────────────────────────────────────────────────────

# Stage 1 – Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (uses cache if package.json unchanged)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .

# VITE_API_URL is baked in at build-time via ARG → ENV
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2 – Serve with Nginx
FROM nginx:1.27-alpine

# Remove default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
