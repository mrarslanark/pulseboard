# ── Stage 1: Build ──────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Stage 2: Production ─────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache bash

COPY --from=builder /app/package*.json  ./
COPY --from=builder /app/dist           ./dist
COPY --from=builder /app/prisma         ./prisma
COPY --from=builder /app/node_modules   ./node_modules
COPY scripts/start.sh                   ./start.sh

RUN chmod +x ./start.sh

EXPOSE 3000

CMD ["./start.sh"]