# PulseBoard — Web Dashboard

> Next.js 14 dashboard for monitoring real-time events, managing projects, and viewing analytics.

---

## Overview

The web dashboard is a Next.js 14 application using the App Router. It connects to the PulseBoard backend via REST for data fetching and WebSocket for live event streaming.

---

## Project Structure

```
web/src/
├── app/
│   ├── (auth)/                  → Unauthenticated route group
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/             → Authenticated route group
│   │   ├── layout.tsx           → Sidebar layout
│   │   ├── dashboard/page.tsx   → Overview & stats
│   │   └── projects/
│   │       ├── page.tsx         → Projects list
│   │       └── [id]/page.tsx    → Project detail + live feed
│   ├── layout.tsx               → Root layout with providers
│   ├── providers.tsx            → React Query provider
│   └── page.tsx                 → Redirects to /dashboard
├── components/
│   ├── ui/                      → shadcn/ui components
│   ├── auth/                    → Login & register forms
│   ├── dashboard/               → StatsCard, EventsFeed, charts
│   └── layout/                  → Sidebar, Header
├── hooks/
│   ├── useAuth.ts               → Login, register, logout mutations
│   ├── useProjects.ts           → Project CRUD queries & mutations
│   └── useRealtimeEvents.ts     → WebSocket event stream hook
├── lib/
│   ├── api.ts                   → Axios instance with interceptors
│   └── queryClient.ts           → TanStack Query configuration
├── store/
│   └── auth.store.ts            → Zustand auth state with persistence
└── types/
    └── index.ts                 → Shared TypeScript types
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### 3. Start the development server

```bash
npm run dev
```

The dashboard is available at `http://localhost:3001`.

> Make sure the backend is running on port 3000 before starting the web app.

---

## Scripts

| Script          | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm start`     | Start production server  |
| `npm run lint`  | Run ESLint               |

---

## Key Features

### Authentication

Login and registration are handled via the auth routes on the backend. The access token is stored in a cookie via `js-cookie` and automatically attached to every API request via an Axios interceptor. On a 401 response, the interceptor silently refreshes the token using the HTTP-only refresh token cookie and retries the original request.

### Real-Time Events

The `useRealtimeEvents` hook opens a WebSocket connection to `/realtime/:projectId` and maintains a rolling buffer of the last 50 events. Events animate in as they arrive. The connection status is displayed live in the events feed component.

### Server State

All server data (projects, events) is managed by TanStack Query with a 5-minute stale time. Creating or deleting a project automatically invalidates the projects query, keeping the UI in sync without manual refreshes.

### Client State

Zustand manages the authenticated user object with `zustand/middleware/persist` — the user stays logged in across page refreshes via localStorage.

---

## Tech Stack

| Package        | Purpose                        |
| -------------- | ------------------------------ |
| Next.js 14     | Framework (App Router)         |
| TypeScript     | Type safety                    |
| Tailwind CSS   | Utility-first styling          |
| shadcn/ui      | Accessible component library   |
| TanStack Query | Server state management        |
| Zustand        | Client state management        |
| Axios          | HTTP client with interceptors  |
| js-cookie      | Cookie access token management |
