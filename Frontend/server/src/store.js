/** Tracks the lifecycle of each STK Push request between initiation and Safaricom's callback. Server restarts clear it — fine, since these are short-lived pending payments, not the ledger of record (that lives in the frontend's persisted wallet). */
const requests = new Map();

const TTL_MS = 15 * 60 * 1000;

export function createPending(checkoutRequestId, { phone, amount }) {
  requests.set(checkoutRequestId, { status: "pending", phone, amount, createdAt: Date.now() });
}

export function resolveRequest(checkoutRequestId, { status, resultDesc, mpesaReceiptNumber }) {
  const entry = requests.get(checkoutRequestId);
  if (!entry) return;
  requests.set(checkoutRequestId, { ...entry, status, resultDesc, mpesaReceiptNumber });
}

export function getRequest(checkoutRequestId) {
  const entry = requests.get(checkoutRequestId);
  if (entry && Date.now() - entry.createdAt > TTL_MS && entry.status === "pending") {
    entry.status = "timeout";
  }
  return entry;
}
