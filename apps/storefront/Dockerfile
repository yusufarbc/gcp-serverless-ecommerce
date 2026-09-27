# Multi-Stage Dockerfile for Next.js 15 PWA Storefront on Cloud Run
FROM node:20-alpine AS builder

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json turbo.json ./
COPY packages ./packages
COPY apps/storefront ./apps/storefront

RUN npm install --include=dev
RUN npm --workspace=@repo/types run build
RUN npm --workspace=@repo/storefront run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache dumb-init
USER node

COPY --chown=node:node --from=builder /app/apps/storefront/public ./apps/storefront/public
COPY --chown=node:node --from=builder /app/apps/storefront/.next/standalone ./
COPY --chown=node:node --from=builder /app/apps/storefront/.next/static ./apps/storefront/.next/static

WORKDIR /app/apps/storefront
EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
