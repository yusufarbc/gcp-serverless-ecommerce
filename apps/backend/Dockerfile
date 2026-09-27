# Multi-Stage Dockerfile for Serverless Backend (Scale-to-Zero Optimized)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package.json turbo.json ./
COPY packages ./packages
COPY apps/backend ./apps/backend

# Install dependencies and build
RUN npm install
RUN npm --workspace=@repo/backend run build

# Stage 2: Production Minimal Image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=9000

# Install dumb-init for proper signal forwarding in containers
RUN apk add --no-cache dumb-init

# Use non-root node user
USER node

# Copy built artifacts and package manifests
COPY --chown=node:node package.json ./
COPY --chown=node:node packages/types/package.json ./packages/types/
COPY --chown=node:node apps/backend/package.json ./apps/backend/
COPY --chown=node:node --from=builder /app/packages/types ./packages/types
COPY --chown=node:node --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules

WORKDIR /app/apps/backend

EXPOSE 9000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
