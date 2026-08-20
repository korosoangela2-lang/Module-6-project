const API_BASE = import.meta.env.VITE_MPESA_API_BASE || "http://localhost:4000";

async function fetchJSON(path, opts) {
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "M-Pesa request failed.");
  return data;
}

export async function initiateStkPush(phone, amount) {
  return fetchJSON("/api/mpesa/stkpush", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, amount }),
  });
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Polls until Safaricom's callback resolves the request, or the given timeout elapses. */
export async function pollStkPushStatus(checkoutRequestId, { intervalMs = 2500, timeoutMs = 120000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const entry = await fetchJSON(`/api/mpesa/status/${checkoutRequestId}`);
    if (entry.status !== "pending") return entry;
    await wait(intervalMs);
  }
  throw new Error("Timed out waiting for the M-Pesa confirmation. Check your phone and try again.");
}
