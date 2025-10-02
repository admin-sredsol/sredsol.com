FROM node:20-alpine AS builder

WORKDIR /app

# Accept secrets as build arguments
ARG CONTENT_API_KEY
ARG GHOST_URL
ARG SITE
ARG BASE_URL

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod

# Copy all source files needed for build
COPY . .

# Set environment variables for Astro build
ENV CONTENT_API_KEY=$CONTENT_API_KEY
ENV GHOST_URL=$GHOST_URL
ENV SITE=$SITE
ENV BASE_URL=$BASE_URL

# Build Astro project (creates dist/client and dist/server)
RUN pnpm build

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /app

# Copy only built output and minimal files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy .env if present (optional, for runtime env vars)
COPY --from=builder /app/.env .env

# Set runtime environment variables
ENV HOST=0.0.0.0
ENV CONTENT_API_KEY=$CONTENT_API_KEY
ENV GHOST_URL=$GHOST_URL
ENV SITE=$SITE
ENV BASE_URL=$BASE_URL

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
