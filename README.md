# PulseBoard

> Real-time backend monitoring and observability platform for mobile developers.

PulseBoard lets you ingest events, errors, and performance metrics from any application and stream them live to a dashboard — with alerting, historical analytics, and a dead-simple SDK integration.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)

---

## Architecture

```
pulseboard/
├── backend/   → Fastify REST API + WebSocket + Background Workers
├── web/       → Next.js 14 Dashboard (App Router)
└── mobile/    → React Native SDK consumer app (coming soon)
```

### How it works

```
Mobile / Web App
      │
      │  POST /ingest (API Key auth)
      ▼
  Fastify API  ──────────────────────────────►  PostgreSQL
      │                                          (persist events)
      │  publish(projectChannel)
      ▼
    Redis
      │
      │  subscribe(projectChannel)
      ▼
  WebSocket / SSE  ──────────────────────────►  Dashboard
  (live stream)                                  (real-time feed)
      │
      │  BullMQ Jobs
      ▼
  Alert Worker     → Email alert if error rate exceeds threshold
  Digest Worker    → Nightly summary email
  Retention Worker → Auto-delete events older than N days
```

---

## Features

- **Event Ingestion** — Accept errors, custom events, and metrics via a simple REST API
- **Real-Time Streaming** — WebSocket and SSE support for live event feeds
- **Multi-Tenancy** — Project-based isolation with unique API keys per project
- **JWT Authentication** — Access tokens + HTTP-only refresh token rotation
- **Alert Engine** — Email alerts triggered when error rate exceeds configurable thresholds
- **Background Jobs** — BullMQ-powered workers for alerts, digests, and data retention
- **Type-Safe API** — End-to-end TypeScript with Prisma-generated types
- **Self-Hostable** — Full Docker Compose setup for one-command deployment

---

## Tech Stack

### Backend

| Layer           | Technology     |
| --------------- | -------------- |
| Runtime         | Node.js 22     |
| Framework       | Fastify        |
| Language        | TypeScript     |
| ORM             | Prisma         |
| Database        | PostgreSQL 16  |
| Cache / Pub-Sub | Redis 7        |
| Job Queue       | BullMQ         |
| Auth            | JWT + bcryptjs |
| Email           | Nodemailer     |
| Validation      | TypeBox        |

### Web Dashboard

| Layer        | Technology              |
| ------------ | ----------------------- |
| Framework    | Next.js 14 (App Router) |
| Language     | TypeScript              |
| Styling      | Tailwind CSS            |
| Components   | shadcn/ui               |
| Server State | TanStack Query          |
| Client State | Zustand                 |
| HTTP Client  | Axios                   |

---

## Getting Started

### Prerequisites

- Node.js 22+
- Docker (for PostgreSQL and Redis)
- npm

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/pulseboard.git
cd pulseboard
```

### 2. Start the backend

```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### 3. Start the web dashboard

```bash
cd web
cp .env.local.example .env.local
npm install
npm run dev
```

### 4. Open the dashboard

Visit `http://localhost:3001`, register an account, create a project, and start ingesting events.

---

## Sending Events

Once you have a project API key, send events from any HTTP client:

```bash
curl -X POST http://localhost:3000/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your-project-api-key",
    "type": "error",
    "name": "NullPointerException",
    "payload": {
      "screen": "HomeScreen",
      "userId": "u_123"
    }
  }'
```

Event types: `error` | `event` | `metric`

---

## API Reference

| Method   | Endpoint                   | Auth    | Description                      |
| -------- | -------------------------- | ------- | -------------------------------- |
| `POST`   | `/auth/register`           | —       | Register a new user              |
| `POST`   | `/auth/login`              | —       | Login and get access token       |
| `POST`   | `/auth/refresh`            | Cookie  | Rotate refresh token             |
| `POST`   | `/auth/logout`             | Cookie  | Logout                           |
| `GET`    | `/projects`                | Bearer  | List all projects                |
| `POST`   | `/projects`                | Bearer  | Create a project                 |
| `GET`    | `/projects/:id`            | Bearer  | Get a project                    |
| `DELETE` | `/projects/:id`            | Bearer  | Delete a project                 |
| `DELETE` | `/projects/:id/events`     | Bearer  | Delete all events from a project |
| `POST`   | `/ingest`                  | API Key | Ingest an event                  |
| `GET`    | `/events`                  | API Key | Get recent events                |
| `WS`     | `/realtime/:projectId`     | Bearer  | WebSocket live stream            |
| `GET`    | `/realtime/:projectId/sse` | Bearer  | SSE live stream                  |

---

## Roadmap

- [x] Phase 1 — Project foundations (Fastify + TypeScript)
- [x] Phase 2 — Database layer (PostgreSQL + Prisma)
- [x] Phase 3 — Authentication & multi-tenancy (JWT)
- [x] Phase 4 — Real-time layer (Redis + WebSocket + SSE)
- [x] Phase 5 — Background jobs & alerts (BullMQ)
- [x] Phase 6 — Web dashboard (Next.js 14)
- [ ] Phase 7 — npm SDK package
- [ ] Phase 8 — DevOps & deployment (Docker + CI/CD)

---

## License

This project is licenced under AGPL v3.
For commercial use or enterprise self-hosting, contact arslanark@gmail.com
