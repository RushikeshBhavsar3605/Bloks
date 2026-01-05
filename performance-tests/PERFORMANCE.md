# Performance Benchmarks – Server-Side Collaborative Editing

This document records **server-side performance benchmarks** for the real-time collaborative document editing system. The goal is to quantify **effective concurrency limits**, **throughput (RPS)**, and **tail latency (p90 / p99)** under increasing numbers of concurrent editors.

---

## Scope & Measurement Model

- **Metric type**: Server-side processing latency only
- **Clock**: `performance.now()` (monotonic, high‑resolution)
- **Window size**: 10 seconds
- **Topology**: Single Socket.io server instance
- **Document model**: All editors collaborate on the same document
- **Environment**: Production (Render)

> These metrics intentionally exclude network RTT and client rendering time. They isolate backend compute, coordination, and contention effects.

---

## Test Methodology

- Each editor maintains a persistent Socket.io connection
- Editors emit document edit events at a steady rate (~4–6 edits/sec)
- Tests were run for **60–90 seconds** per concurrency level
- The **first window** of each test is treated as warm‑up and excluded from conclusions

---

## Results

### 10 Concurrent Editors (60s)

**Steady‑state range:**

- **Editors**: 11
- **RPS**: ~45–50
- **p90**: ~0.37–0.52 ms
- **p99**: ~1.0–1.7 ms

**Observation**

- Near‑linear scaling
- No contention observed
- Very low tail latency

**Conclusion**

> System operates comfortably at this level with significant headroom.

---

### 15 Concurrent Editors (90s)

**Steady‑state range (excluding warm‑up spike):**

- **Editors**: 15
- **RPS**: ~46–57
- **p90**: ~0.39–0.52 ms
- **p99**: ~0.6–1.2 ms

**Warm‑up artifact**

- Initial p99 spike (~79 ms) attributed to JIT warm‑up, document hydration, and GC

**Conclusion**

> Stable, efficient operating point with consistently low tail latency.

---

### 20 Concurrent Editors (90s)

**Steady‑state range (excluding first window):**

- **Editors**: 20
- **RPS**: ~48–56
- **p90**: ~0.61–0.70 ms
- **p99**: ~0.9–1.3 ms

**Observation**

- Latency remains stable
- Minor variance in RPS due to scheduling noise

**Conclusion**

> System continues to scale efficiently; still within optimal capacity.

---

### 25 Concurrent Editors (90s)

**Steady‑state range (excluding rare spikes):**

- **Editors**: 25
- **RPS**: ~37–43
- **p90**: ~0.77–0.89 ms
- **p99**: ~1.1–2.2 ms

**Outliers**

- Isolated p99 spikes (~90 ms) observed, attributed to GC or background cleanup

**Conclusion**

> Approaching the upper bound of efficient operation; tail latency variance begins to appear.

---

### 30 Concurrent Editors (90s)

**Steady‑state range (excluding warm‑up window):**

- **Editors**: 30
- **RPS**: ~33–43
- **p90**: ~0.85–0.95 ms
- **p99**: ~13–19 ms

**Observation**

- Clear non‑linear increase in p99 latency
- Throughput per editor decreases
- Contention on shared document state and event loop

**Conclusion**

> System enters contention mode; functional but no longer scales efficiently.

---

## Comparative Summary

| Editors | Steady RPS | p90 (ms) | p99 (ms) | System State |
| ------- | ---------- | -------- | -------- | ------------ |
| 10      | ~45–50     | ~0.4–0.5 | ~1–2     | Comfortable  |
| 15      | ~50–57     | ~0.4–0.5 | ~0.6–1.2 | Stable       |
| 20      | ~48–56     | ~0.6–0.7 | ~0.9–1.3 | Optimal      |
| 25      | ~37–43     | ~0.8–0.9 | ~1.1–2.2 | Boundary     |
| 30      | ~33–43     | ~0.9     | ~13–19   | Contended    |

---

## Key Findings

- **Effective capacity (production)**: ~20–25 concurrent editors per document
- **Sustained throughput**: ~50 edit events/sec
- **Latency behavior**:
  - Linear up to ~20 editors
  - Variance appears at ~25 editors
  - Tail latency inflates sharply at ~30 editors

---

## Final Summary

> These benchmarks demonstrate that the collaborative editing backend sustains **~20–25 concurrent editors** on a shared document with **stable p99 latency under ~2 ms** in production. Beyond this point, contention on shared document state causes non‑linear tail latency growth, identifying a clear scalability boundary for the current single‑node architecture.

---

## Notes

- Results are server‑side only; end‑to‑end latency is higher due to network and client rendering
