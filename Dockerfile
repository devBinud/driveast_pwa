# ── Stage 1: Build ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* variables into the JS bundle at build time, so they must be
# passed as build args (not runtime env vars) -- set these in Coolify's build settings.
ARG VITE_API_BASE_URL=https://api.driveast.com/api/v1
ARG VITE_WS_BASE_URL=wss://api.driveast.com/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_BASE_URL=$VITE_WS_BASE_URL

RUN npm run build

# ── Stage 2: Serve ───────────────────────────────────────────────────────
FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
