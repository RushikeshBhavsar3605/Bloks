# Bloks

A real-time collaborative document editor focused on low-latency sync, conflict-safe editing, role-based access control and cost-aware persistence under concurrent load.

🔗 **Live Demo**: [https://bloks.onrender.com](https://bloks.onrender.com)

---

## What this project explores

Bloks is built to study **real-time systems under concurrent load**, with an emphasis on **backend behavior, latency trade-offs, and cost-aware infrastructure decisions**.

This is **not a UI-first project** — the core focus is designing and validating a real-time collaboration system that remains predictable under multi-user contention.

---

## Key Engineering Features

- **Real-time Collaboration**

  - Socket.IO–based bi-directional sync
  - Room-based document subscriptions
  - Live cursor presence and user activity
  - Debounced persistence to reduce write amplification

- **Write-Amplification Control**

  - Centralized document-level in-memory state
  - Activity-aware debounced persistence (2s inactivity window)
  - Immediate persistence for idle documents

- **Conflict-Safe Editing**

  - Step-based editor synchronization
  - Ordered event handling to avoid state divergence
  - Separation of ephemeral (cursor) vs persistent (content) state

- **Nested Document Model**

  - Infinite parent–child document hierarchy
  - Recursive operations (archive, restore, delete)
  - Permission inheritance across document trees

- **Role-Based Access Control**

  - Owner / Editor / Viewer roles
  - Permission-aware queries and real-time updates
  - Secure invitation and collaboration flows

- **Subscription & Usage Limits**

  - Tier-based feature enforcement
  - Real-time usage tracking
  - Stripe-backed billing system

---

## Architecture Overview

- **Frontend**: Next.js App Router + React 18
- **Real-time Layer**: Socket.IO (persistent connections)
- **Backend**: Server Actions + API routes (for WebSocket support)
- **Database**: MongoDB with Prisma ORM
- **Auth**: Auth.js (OAuth + credentials)
- **Editor**: TipTap / ProseMirror

Ephemeral collaboration state (presence, cursors) is kept **in-memory**, while document content is persisted asynchronously to optimize latency and throughput.

---

## Debounced Persistence Architecture

Collaborative editors generate high-frequency updates. Persisting every edit causes write amplification under concurrent usage.

**Solution:** Bloks uses a **document-level, activity-aware debounce** strategy:

- All socket edits update a shared in-memory document state
- When a document is **active**, persistence is deferred using a 2s inactivity window
- When a document becomes **idle**, state is flushed immediately

**Theoretical worst-case bound:**

- Per-edit persistence → O(edits)
- Debounced persistence → ≤ 1 write per 2s per document (≤ 30 writes/min)

This bound is deterministic and independent of edit rate or number of collaborators.

📄 **Detailed design and mathematical proof:** [`DEBOUNCE.md`](DEBOUNCE.md)

---

## Performance & Load Testing

Bloks includes a **custom Socket.IO load-testing harness** that simulates real collaborative editing patterns and measures system behavior under concurrent load.

**Test environment:**

- Production deployment on **Render free tier**
- Single-node Socket.IO server
- Shared CPU, ~512 MB RAM

**Test highlights:**

- 20 concurrent editors
- ~100 real-time edits/sec sustained
- Stable latency distribution under continuous load

**Observed latencies (post-warmup):**

- **Emitter ACK latency (client → server → ACK)**
  - p50: ~283 ms
  - p90: ~353 ms
  - p99: ~584 ms
- **Subscriber broadcast latency (client-observed fan-out)**
  - p50: ~283 ms
  - p90: ~350 ms
  - p99: ~581 ms

Error rate under load: **~0.41%**, primarily due to ACK timeouts, with no client disconnects or crashes.

📄 **Full methodology and measured results:** [`performance-tests/README.md`](performance-tests/README.md)

---

## Design Decisions & Trade-offs

- **Socket.IO over polling**
  Chosen for low-latency updates and simpler room management under concurrent users.

- **MongoDB over relational DB**
  Better suited for deeply recursive document trees and flexible schemas.

- **Debounced saves instead of per-keystroke writes**
  Reduces database load while maintaining near-real-time UX.

- **Persistent server deployment**
  Required due to long-lived WebSocket connections (not compatible with serverless platforms).

---

## Tech Stack

- **Languages**: TypeScript
- **Frameworks**: Next.js, React
- **Real-time**: Socket.IO
- **Database**: MongoDB, Prisma
- **Auth**: Auth.js
- **Payments**: Stripe
- **Styling**: Tailwind CSS, Shadcn UI

---

## Local Setup

```bash
npm install
npm run dev
```

Environment variables for database, authentication, and billing are required. Sensitive infrastructure details are intentionally omitted.

---

## Deployment

Requires a platform that supports **persistent connections**. Currently deployed on **Render**.

---

## Author

Rushikesh Bhavsar
[https://github.com/RushikeshBhavsar3605](https://github.com/RushikeshBhavsar3605)
