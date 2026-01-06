# Performance & Load Testing – Real-Time Collaboration

This directory contains **production-like load tests** for the real-time collaboration layer (Socket.IO) used in the Bloks document editor.

The goal of these tests is to **quantify write latency, broadcast fan-out latency, and error behavior under concurrent editing**, using a custom client-driven harness that closely mimics real user behavior.

---

## Test Environment

- **Deployment**: Production (Render – Free Tier)
- **Transport**: WebSocket (Socket.IO)
- **Architecture**: Single-node Socket.IO server (no Redis adapter)
- **Clients**: Local Node.js load generator

### Infrastructure (Render Free Service)

> The application is deployed on **Render’s free web service**, which has strict resource limits. All results below should be interpreted in this context.

- **CPU**: Shared vCPU (best-effort scheduling, subject to throttling)
- **Memory**: ~512 MB RAM
- **Instance Count**: 1 (no horizontal scaling)
- **Cold Starts**: Possible after inactivity

These constraints make the test intentionally conservative and reflective of **cost-efficient, entry-level production deployments**.

---

## Test Configuration

| Parameter          | Value                                |
| ------------------ | ------------------------------------ |
| Concurrent clients | 20                                   |
| Edit rate          | 1 edit / 200 ms (5 edits/sec/client) |
| Total throughput   | ~100 edits/sec                       |
| Test duration      | 60 seconds                           |
| Warm-up period     | 10 seconds (excluded from metrics)   |
| ACK timeout        | 5 seconds                            |

Each client:

- Connects via WebSocket
- Emits `doc-change` events at a fixed interval
- Awaits server ACKs
- Listens for broadcasted edits from other users

---

## Metrics Collected

### 1. Emitter ACK Latency

**What it measures**:

> Round-trip time from **client → server → ACK callback**

This represents the latency of a write being:

1. Received by the server
2. Validated / processed
3. Acknowledged back to the emitter

**Measurement method**:

- High-resolution timer (`performance.now()`)
- Socket.IO ACK callback with timeout

---

### 2. Subscriber Broadcast Latency

**What it measures**:

> Client-observed end-to-end latency for edits broadcast to _other_ collaborators

This approximates:

> client A → server → broadcast → client B

**Measurement method**:

- Emitter includes a millisecond timestamp in payload
- Subscriber computes `Date.now() - msg.timestamp`

⚠️ **Note**: This is a _client-observed_ metric (timestamp-based), not a pure server-internal fan-out latency. Clock skew is negligible since all test clients run on the same machine.

---

## Final Results

```
== FINAL RESULTS ==
total emits: 5794
emitter acks: 5770
subscriber receives: 95295
total errors: 24
timeouts: 24
```

### Emitter ACK Latency

| Percentile | Latency |
| ---------- | ------- |
| p50        | ~283 ms |
| p90        | ~353 ms |
| p99        | ~584 ms |

Samples collected: **5016** (post-warmup)

---

### Subscriber Broadcast Latency

| Percentile | Latency |
| ---------- | ------- |
| p50        | ~283 ms |
| p90        | ~350 ms |
| p99        | ~581 ms |

Samples collected: **95,295**

> Fan-out volume matches expectation (~19 subscribers per emit, excluding self), with minor loss due to warm-up and timeouts.

---

## Error Analysis

- **Error rate**: ~0.41%
- **Cause**: ACK timeouts under sustained concurrent load
- **Impact**: No client disconnects; system remains stable

This behavior is expected for a **single-instance, resource-constrained deployment** without a Redis adapter under continuous write pressure.

---

## Key Takeaways

- Sustains **~100 real-time edits/sec** with 20 concurrent editors
- Predictable latency distribution even on **free-tier infrastructure**
- Broadcast fan-out latency tracks closely with ACK latency
- Graceful degradation under backpressure (timeouts without crashes)

---

## Why This Matters

These tests demonstrate:

- Ability to reason about performance under hardware constraints
- Awareness of cost vs scalability trade-offs in WebSocket systems

This is not a synthetic benchmark — it reflects **production constraints and real user patterns**.
