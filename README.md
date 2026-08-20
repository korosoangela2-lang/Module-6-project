# Heha Banking Agency

Heha Banking Agency is a React frontend for a cross-border money transfer product, with a small
Node backend that handles one real integration: M-Pesa top-ups via Safaricom's
Daraja API.

## Architecture

- **Frontend** (`src/`) — React + Vite, routed with `react-router-dom`. All
  application data (users, wallets, beneficiaries, transactions) is persisted
  in the browser via `localStorage` (see `src/lib/db.js`), so accounts and
  balances survive refreshes and restarts on the same device. Passwords are
  hashed (salted SHA-256) before being stored — never in plaintext.
- **`server/`** — a minimal Express server that exists solely to talk to
  Safaricom's Daraja API for M-Pesa STK Push payments. This has to be a real
  backend: the Daraja consumer secret can't live in browser code, and
  Safaricom confirms payments via a server-to-server callback that only a
  publicly reachable backend can receive. It does not hold the ledger — once
  a payment is confirmed, the frontend credits the wallet in its own
  persisted store, same as any other funding source.

There's no other backend and no real cross-border payout rail — beneficiary
payouts, FX rates, and KYC are still simulated. Wiring those up for real would
mean a payment processor, a live FX feed, a KYC provider, and (for real
payouts) money-transmitter licensing.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173. Two seeded accounts are ready to use:

- **User** — `demo@heha.app` / `demo1234`
- **Admin** — `admin@heha.app` / `admin123`

Registering a new account works too — it's a real signup against the
persisted `localStorage` user store.

## M-Pesa (Daraja) setup — optional

Add funds with **M-Pesa** in the app requires the backend in `server/` to be
running and configured with your own Safaricom sandbox credentials.

1. Create a free sandbox app at https://developer.safaricom.co.ke, under the
   "Lipa Na M-Pesa Online" product, to get a consumer key and secret.
2. In a second terminal:
   ```bash
   cd server
   npm install
   cp .env.example .env
   # edit .env: paste in DARAJA_CONSUMER_KEY / DARAJA_CONSUMER_SECRET
   npm run dev
   ```
3. Safaricom's sandbox needs a publicly reachable HTTPS URL to POST the
   payment result back to. Tunnel the server (e.g. `ngrok http 4000`) and set
   `DARAJA_CALLBACK_URL` in `server/.env` to
   `https://<your-tunnel>/api/mpesa/callback`.
4. In the app, choose "M-Pesa" as the funding source on Add Funds and enter a
   Safaricom test MSISDN to trigger an STK push.

Without this configured, every other funding source (card, Interac) still
works — only the M-Pesa option needs the backend.
