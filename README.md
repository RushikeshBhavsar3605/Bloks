# Bloks

A real-time collaborative document editor focused on low-latency sync, conflict-safe editing, and role-based access control.

🔗 **Live Demo**: [https://bloks.onrender.com](https://bloks.onrender.com)

---

## What this project explores

Bloks is built to study **real-time systems at application scale**, specifically:

- Multi-user collaborative editing
- Consistency vs latency trade-offs
- Permission-aware data access
- Scalable WebSocket architectures

This is **not** a UI-first project — the emphasis is on backend behavior under concurrent usage.

---

## Key Engineering Features

- **Real-time Collaboration**

  - Socket.IO–based bi-directional sync
  - Room-based document subscriptions
  - Live cursor presence and user activity
  - Debounced persistence to reduce write amplification

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

Environment variables for database, authentication, and billing are required.
Sensitive infrastructure details are intentionally omitted.

---

## Deployment

Requires a platform that supports **persistent connections**.
Currently deployed on **Render**.

---

## Author

Rushikesh Bhavsar
[https://github.com/RushikeshBhavsar3605](https://github.com/RushikeshBhavsar3605)
