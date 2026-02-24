# PulseBoard — Backend

> Fastify REST API with WebSocket streaming, background job workers, and PostgreSQL persistence.

---

## Overview

The backend is a Node.js API server built with Fastify and TypeScript. It handles event ingestion, authentication, real-time streaming via Redis pub/sub, and async background work via BullMQ.

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma        → Database schema
│   ├── seed.ts              → Seed script
│   └── migrations/          → Migration history
├── src/
│   ├── controllers/         → HTTP request & response handlers
│   │   ├── auth.controller.ts
│   │   ├── projects.controller.ts
│   │   ├── ingest.controller.ts
│   │   └── realtime.controller.ts
│   ├── services/            → Business logic & database calls
│   │   ├── auth.service.ts
│   │   ├── projects.service.ts
│   │   ├── ingest.service.ts
│   │   ├── realtime.service.ts
│   │   └── email.service.ts
│   ├── routes/              → Route registration
│   │   ├── options/         → TypeBox schemas & exported types
│   │   ├── auth.ts
│   │   ├── projects.ts
│   │   ├── ingest.ts
│   │   └── realtime.ts
│   ├── workers/             → BullMQ job processors
│   │   ├── alert.worker.ts
│   │   ├── digest.worker.ts
│   │   └── retention.worker.ts
│   ├── lib/
│   │   ├── prisma.ts        → Prisma client singleton
│   │   ├── redis.ts         → Redis publisher & subscriber
│   │   ├── queues.ts        → BullMQ queue definitions
│   │   └── scheduler.ts     → Cron job scheduler
│   ├── types/
│   │   └── fastify.d.ts     → Fastify type augmentations
│   ├── app.ts               → Fastify instance & plugin registration
│   └── server.ts            → Entry point
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in the values:

```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

DATABASE_URL="postgresql://pulseboard:pulseboard@localhost:5432/pulseboard"

JWT_ACCESS_SECRET=change-me-in-production
JWT_REFRESH_SECRET=change-me-in-production
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

REDIS_URL=redis://localhost:6379

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-password
SMTP_FROM=noreply@pulseboard.dev

ALERT_ERROR_THRESHOLD=10
RETENTION_DAYS=30
```

### 3. Start PostgreSQL and Redis

```bash
# PostgreSQL
docker run --name pulseboard-db \
  -e POSTGRES_USER=pulseboard \
  -e POSTGRES_PASSWORD=pulseboard \
  -e POSTGRES_DB=pulseboard \
  -p 5432:5432 -d postgres:16

# Redis
docker run --name pulseboard-redis \
  -p 6379:6379 -d redis:7
```

### 4. Run migrations and seed

```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Start the development server

```bash
npm run dev
```

The API is available at `http://localhost:3000`.

---

## Scripts

| Script          | Description                           |
| --------------- | ------------------------------------- |
| `npm run dev`   | Start with hot reload via `tsx watch` |
| `npm run build` | Compile TypeScript to `dist/`         |
| `npm start`     | Run compiled output                   |

---

## API Endpoints

### Auth

| Method | Path             | Description                   |
| ------ | ---------------- | ----------------------------- |
| `POST` | `/auth/register` | Register a new user           |
| `POST` | `/auth/login`    | Login, returns access token   |
| `POST` | `/auth/refresh`  | Rotate refresh token (cookie) |
| `POST` | `/auth/logout`   | Clear session                 |

### Projects

| Method   | Path                   | Auth   | Description          |
| -------- | ---------------------- | ------ | -------------------- |
| `GET`    | `/projects`            | Bearer | List user's projects |
| `POST`   | `/projects`            | Bearer | Create a project     |
| `GET`    | `/projects/:id`        | Bearer | Get project details  |
| `DELETE` | `/projects/:id`        | Bearer | Delete a project     |
| `DELETE` | `/projects/:id/events` | Bearer | Delete all events    |

### Ingest

| Method | Path      | Auth    | Description                 |
| ------ | --------- | ------- | --------------------------- |
| `POST` | `/ingest` | API Key | Ingest a single event       |
| `GET`  | `/events` | API Key | Get recent events (last 20) |

### Real-Time

| Method | Path                       | Auth   | Description              |
| ------ | -------------------------- | ------ | ------------------------ |
| `WS`   | `/realtime/:projectId`     | Bearer | WebSocket live stream    |
| `GET`  | `/realtime/:projectId/sse` | Bearer | SSE live stream fallback |

---

## Architecture Decisions

**Fastify over Express** — Fastify is significantly faster, has first-class TypeScript support, and built-in JSON schema validation via TypeBox.

**Separate Redis connections** — Redis requires a dedicated connection once in subscribe mode. The publisher and subscriber are intentionally separate clients.

**Error codes as strings** — Services throw errors with string codes (`INVALID_API_KEY`, `PROJECT_NOT_FOUND`) rather than HTTP status codes, keeping the service layer decoupled from HTTP concerns. Controllers handle the mapping.

**BullMQ job deduplication** — Alert jobs use `jobId: alert:${projectId}` to prevent duplicate emails when multiple errors arrive in quick succession.

**Prisma singleton** — A single PrismaClient instance is reused across the app to prevent connection pool exhaustion.
