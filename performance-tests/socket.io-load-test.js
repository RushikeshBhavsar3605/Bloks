// load-test.js
// Usage: node --max-old-space-size=8192 load-test.js
import { io } from "socket.io-client";
import { performance } from "perf_hooks";

/* ===== CONFIG ===== */
const SERVER_URL = "https://bloks.onrender.com";
const PATH = "/api/socket/io";
const TOTAL_CLIENTS = 20; // change
const EDIT_INTERVAL_MS = 200; // 5 edits/sec per client
const TEST_DURATION_MS = 60_000; // total run
const LOG_INTERVAL_MS = 5_000; // print every N ms
const ACK_TIMEOUT_MS = 5000; // socket.timeout()
const WARMUP_MS = 10_000; // drop first 10s of samples
const MAX_SAMPLES_MEMORY = 200_000; // keep arrays bounded

/* ===== GLOBAL METRICS ===== */
// Emitter (ack) metrics: accurate RTT to ack callback
const emitterLatencies = []; // ms

// Subscriber (broadcast) metrics: receive latency observed by clients (excluding own messages)
const subscriberLatencies = []; // ms

// Pending map to correlate messageId -> { t0, senderId }
const pending = new Map();

let totalEmits = 0;
let totalEmitterAcks = 0;
let totalSubscriberReceives = 0;
let totalErrors = 0;
let connects = 0;
let disconnects = 0;
let timeouts = 0;

let collectSamples = false; // start after warmup

/* ===== HELPERS ===== */
function percentile(arr, p) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * s.length) - 1;
  return s[Math.max(0, Math.min(idx, s.length - 1))];
}

function safePushAndTrim(arr, value) {
  arr.push(value);
  if (arr.length > MAX_SAMPLES_MEMORY) {
    // keep latest half
    arr.splice(0, arr.length - Math.floor(MAX_SAMPLES_MEMORY / 2));
  }
}

/* ===== CLIENT CREATION ===== */
const createClient = (i) => {
  const localUserId = `test-user-${i}`;

  const socket = io(SERVER_URL, {
    path: PATH,
    transports: ["websocket"],
    query: { userId: localUserId, testId: "testing-prod-secret-123" },
    reconnection: false,
    forceNew: true,
    timeout: 20000,
  });

  let seq = 0;
  let emitInterval;

  socket.on("connect", () => {
    connects++;

    // Handle broadcasted doc-change events.
    // We ignore events coming from ourselves (userId === localUserId)
    socket.on("doc-change", (msg) => {
      try {
        const sender = msg?.userId;
        const id = msg?.testMessageId;

        if (sender === localUserId) {
          // it's our own edit broadcasted back — we've already measured via ack path
          return;
        }

        // Prefer server-provided timestamp in payload (ms since epoch).
        // If not present, fall back to using client-observed arrival only (can't compute true RTT).
        if (!collectSamples) return;

        if (typeof msg?.timestamp === "number") {
          // Note: this uses wall-clock timestamp from emitter client. If test clients and server clocks are roughly same,
          // it approximates fanout latency; otherwise treat it as relative measure.
          const rtt = Date.now() - msg.timestamp;
          safePushAndTrim(subscriberLatencies, rtt);
          totalSubscriberReceives++;
        } else if (id && pending.has(id) === false) {
          // No timestamp available; measure relative to now (less useful). We'll still record a small indicator.
          const rtt = 0; // unknown; don't pollute distribution
          // skip push to avoid polluting the histogram
        }
      } catch (err) {
        // swallow parsing errors
      }
    });

    // start emitting edits periodically
    emitInterval = setInterval(() => {
      const messageId = `${i}-${seq++}-${Date.now()}`;
      const payload = {
        testMessageId: messageId,
        documentId: "cmg0r1pdd000166k73f95bsdf",
        userId: localUserId,
        steps: [
          {
            stepType: "replace",
            from: 175,
            to: 175,
            slice: { content: [{ type: "text", text: "j" }] },
          },
        ],
        version: 190,
        timestamp: Date.now(), // used by subscribers for approximate latency
        testId: "testing-prod-secret-123",
      };

      const t0 = performance.now();
      totalEmits++;

      // store pending (used to correlate if needed)
      pending.set(messageId, { t0, senderId: localUserId });

      // preferred: measure ack RTT through socket timeout ack callback
      socket
        .timeout(ACK_TIMEOUT_MS)
        .emit("doc-change", payload, (err, ackRes) => {
          if (err) {
            timeouts++;
            totalErrors++;
            // keep pending entry for potential broadcast fallback; but don't record ack
            return;
          }
          if (!collectSamples) {
            // still remove pending to avoid growth
            pending.delete(messageId);
            totalEmitterAcks++;
            return;
          }

          const rtt = performance.now() - t0;
          safePushAndTrim(emitterLatencies, rtt);
          totalEmitterAcks++;
          // remove pending since ack handled
          pending.delete(messageId);
        });

      // keep pending entries trimmed to avoid leak
      if (pending.size > 100_000) {
        // drop oldest entries (not perfect but avoids memory explosion)
        const it = pending.keys();
        for (let k = 0; k < 10_000; k++) {
          const kk = it.next().value;
          if (!kk) break;
          pending.delete(kk);
        }
      }
    }, EDIT_INTERVAL_MS);
  });

  socket.on("connect_error", (err) => {
    totalErrors++;
    console.error(`connect_error(${localUserId}):`, err?.message || err);
  });

  socket.on("disconnect", (reason) => {
    disconnects++;
    clearInterval(emitInterval);
  });

  return socket;
};

/* ===== RUN ===== */
(async () => {
  console.log("Starting load test:", {
    SERVER_URL,
    TOTAL_CLIENTS,
    EDIT_INTERVAL_MS,
    TEST_DURATION_MS,
    WARMUP_MS,
  });

  const sockets = [];
  for (let i = 0; i < TOTAL_CLIENTS; i++) {
    sockets.push(createClient(i));
    // slight stagger to avoid thundering
    await new Promise((r) => setTimeout(r, 5));
  }

  // warmup timer
  setTimeout(() => {
    collectSamples = true;
    console.log(`Warmup complete (${WARMUP_MS}ms). Collecting samples now.`);
  }, WARMUP_MS);

  // periodic logger
  const logger = setInterval(() => {
    const eSamples = emitterLatencies.length;
    const sSamples = subscriberLatencies.length;

    const e50 = percentile(emitterLatencies, 50).toFixed(2);
    const e90 = percentile(emitterLatencies, 90).toFixed(2);
    const e99 = percentile(emitterLatencies, 99).toFixed(2);

    const s50 = percentile(subscriberLatencies, 50).toFixed(2);
    const s90 = percentile(subscriberLatencies, 90).toFixed(2);
    const s99 = percentile(subscriberLatencies, 99).toFixed(2);

    const errRate = ((totalErrors / Math.max(1, totalEmits)) * 100).toFixed(2);

    console.log(`\n== STATS (last ${LOG_INTERVAL_MS / 1000}s) ==`);
    console.log(
      `clients: ${TOTAL_CLIENTS}  emits: ${totalEmits}  emitterAcks: ${totalEmitterAcks}  subscriberReceives: ${totalSubscriberReceives}  errors: ${totalErrors}  timeouts: ${timeouts}`
    );
    console.log(`connects: ${connects}  disconnects: ${disconnects}`);
    console.log(
      `samples (emitter): ${eSamples}  p50/p90/p99: ${e50} / ${e90} / ${e99} ms`
    );
    console.log(
      `samples (subscriber): ${sSamples}  p50/p90/p99: ${s50} / ${s90} / ${s99} ms`
    );
    console.log(`errRate: ${errRate}%`);
  }, LOG_INTERVAL_MS);

  // stop after TEST_DURATION_MS
  setTimeout(async () => {
    clearInterval(logger);
    // close sockets
    for (const s of sockets) {
      try {
        s.close();
      } catch (e) {}
    }

    // final results
    console.log("\n== FINAL RESULTS ==");
    console.log(
      `total emits: ${totalEmits}  emitter acks: ${totalEmitterAcks}  subscriber receives: ${totalSubscriberReceives}  total errors: ${totalErrors}  timeouts: ${timeouts}`
    );
    console.log(`emitter samples: ${emitterLatencies.length}`);
    console.log(`p50: ${percentile(emitterLatencies, 50).toFixed(2)} ms`);
    console.log(`p90: ${percentile(emitterLatencies, 90).toFixed(2)} ms`);
    console.log(`p99: ${percentile(emitterLatencies, 99).toFixed(2)} ms`);
    console.log(`subscriber samples: ${subscriberLatencies.length}`);
    console.log(`p50: ${percentile(subscriberLatencies, 50).toFixed(2)} ms`);
    console.log(`p90: ${percentile(subscriberLatencies, 90).toFixed(2)} ms`);
    console.log(`p99: ${percentile(subscriberLatencies, 99).toFixed(2)} ms`);
    process.exit(0);
  }, TEST_DURATION_MS + 2000);
})();
