# Debounced Persistence Architecture

## Goal

Prevent **write amplification** during high‑frequency collaborative editing while preserving real‑time UX and correctness.

---

## Core Architecture

### 1. Document‑Level State (Not Socket‑Level)

- Each document has a **single shared in‑memory state** on the server.
- All Socket.IO edit events update this state immediately.
- Persistence is handled by a **centralized save manager**, not individual sockets.

This ensures that concurrent edits from multiple users converge into **one authoritative document state**.

---

### 2. Activity‑Aware Debounced Persistence

Persistence is triggered **only after inactivity**, not per edit.

- A debounced save function is created per `documentId`.
- Each incoming edit:
  - Updates in‑memory state
  - Resets the debounce timer
- A database write occurs **only if no edits are received for ≥ 2 seconds**.

**Key property**:

> As long as edits continue without a 2‑second gap, **no database write happens**.

Idle documents are persisted immediately once the inactivity window is observed.

---

## Mathematical / Theoretical Proof

### Definitions

- Let `E(t)` be the stream of edit events for a document.
- Let `Δ = 2s` be the debounce inactivity window.
- A DB write occurs at time `t` **if and only if** no edits occurred in `(t − Δ, t)`.

---

### Worst‑Case Upper Bound

If edits repeatedly stop exactly every `Δ` seconds:

```
Max DB writes per minute = 60s / 2s = 30
```

This is a **hard upper bound** per document, independent of:

- Number of users
- Edit frequency
- Edit payload size

Thus, persistence complexity is bounded by:

```
O(number of 2s-inactivity gaps while editing the document)
```

---

### Average‑Case (Realistic Collaboration)

In real collaborative sessions, edits are bursty:

- Continuous editing for 1 minute with no 2s gap → **1 DB write**
- Continuous editing for 1 hour with no 2s gap → **1 DB write**
- Multiple bursts → 1 write per burst

Therefore, in practice:

```
Actual DB write rate ≪ 30 writes/min
```

The system collapses arbitrarily long edit streams into **single persistence operations**.

---

## Correctness Guarantees

- **No lost updates**: all edits are applied to in‑memory state before persistence.
- **Last‑write correctness**: the final document state is what gets persisted.
- **Authorization safety**: only the latest authorized user can trigger persistence.
- **Non‑blocking I/O**: save operations are awaited asynchronously and do not block socket handling.

---

## Trade‑offs

- A document may remain unsaved for up to `Δ = 2s` after the last edit.
- This is an intentional durability‑latency trade‑off, acceptable for collaborative editors.

Mitigations:

- Real‑time in‑memory state
- Client‑side undo/history
- Immediate save once idle

---

## Why This Design

This approach:

- Eliminates per‑edit DB writes
- Caps write volume deterministically
- Scales with users and edit frequency
- Reduces database cost without hurting UX

This is a **design‑level guarantee**, not an empirical tuning artifact.

---

## Implementation Reference

- `document-save-manager.ts`
- Uses `lodash.debounce`
- Per‑document debounce functions stored in a map
- Pending state stored in memory until flush

---

_This document intentionally focuses on architectural guarantees and theoretical bounds. Empirical latency behavior is documented separately in [`performance-tests/README.md`](performance-tests/README.md)._
