import { getDB, withDB } from "./db.js";
import { uid, round2 } from "./format.js";
import { randomSalt, hashPassword, verifyPassword } from "./crypto.js";
import { BASE_RATES } from "./constants.js";
import { monthKey } from "./format.js";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const toPublicUser = ({ passwordHash, passwordSalt, wallet, beneficiaries, transactions, ...rest }) => rest;

const sessionPayload = (user) => ({
  token: uid("session"),
  user: toPublicUser(user),
  wallet: user.wallet,
  beneficiaries: user.beneficiaries,
  transactions: user.transactions,
});

export const api = {
  async register({ name, email, phone, country, password }) {
    await wait(500);
    if (!phone || phone.replace(/\D/g, "").length < 9)
      throw new Error("Enter a phone number with at least 9 digits.");
    if (!email) throw new Error("Enter an email address.");
    if (!password || password.length < 8) throw new Error("Password must be at least 8 characters.");

    return withDB(async (db) => {
      if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase()))
        throw new Error("An account with that email already exists.");
      const salt = randomSalt();
      const passwordHash = await hashPassword(password, salt);
      const user = {
        id: uid("usr"), name, email, phone, country: country || "Canada",
        role: "user", kyc: "unverified", status: "active", joined: new Date().toISOString(),
        passwordSalt: salt, passwordHash,
        wallet: { balance: 0, currency: "CAD" },
        beneficiaries: [], transactions: [],
      };
      db.users.push(user);
      db.session = { userId: user.id, token: uid("session") };
      return sessionPayload(user);
    });
  },

  async login({ email, password }) {
    await wait(450);
    if (!email || !password) throw new Error("Enter both your email and password.");

    return withDB(async (db) => {
      const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) throw new Error("No account found with that email.");
      const ok = await verifyPassword(password, user.passwordSalt, user.passwordHash);
      if (!ok) throw new Error("Incorrect password.");
      if (user.status === "suspended") throw new Error("This account has been suspended.");
      db.session = { userId: user.id, token: uid("session") };
      return sessionPayload(user);
    });
  },

  /** Called once on app boot to silently resume a persisted session, if any. */
  async restoreSession() {
    const db = await getDB();
    if (!db.session) return null;
    const user = db.users.find((u) => u.id === db.session.userId);
    if (!user) return null;
    return sessionPayload(user);
  },

  async logout() {
    return withDB(async (db) => {
      db.session = null;
    });
  },

  async rates() {
    await wait(150);
    return withDB(async (db) => {
      const drifted = {};
      for (const [code, base] of Object.entries(BASE_RATES)) {
        const prev = db.rates.pairs[code] ?? base;
        const drift = 1 + (Math.random() - 0.5) * 0.006;
        drifted[code] = round2(prev * drift * 100) / 100 || prev;
      }
      db.rates = { pairs: drifted, updatedAt: new Date().toISOString() };
      return { ...db.rates.pairs, updatedAt: db.rates.updatedAt };
    });
  },

  async updateProfile(userId, patch) {
    await wait(500);
    return withDB(async (db) => {
      const user = db.users.find((u) => u.id === userId);
      if (!user) throw new Error("User not found.");
      Object.assign(user, patch);
      return patch;
    });
  },

  async addFunds(userId, { amount, source }) {
    await wait(700);
    if (amount <= 0) throw new Error("Enter an amount greater than zero.");
    return withDB(async (db) => {
      const user = db.users.find((u) => u.id === userId);
      if (!user) throw new Error("User not found.");
      const tx = { id: uid("TX"), type: "topup", status: "completed", name: `Top up · ${source}`, amount, fee: 0, spreadRevenue: 0, createdAt: new Date().toISOString() };
      user.wallet.balance = round2(user.wallet.balance + amount);
      user.transactions = [tx, ...user.transactions];
      return tx;
    });
  },

  async addBeneficiary(userId, b) {
    await wait(500);
    return withDB(async (db) => {
      const user = db.users.find((u) => u.id === userId);
      if (!user) throw new Error("User not found.");
      const beneficiary = { ...b, id: uid("ben") };
      user.beneficiaries = [beneficiary, ...user.beneficiaries];
      return beneficiary;
    });
  },

  async removeBeneficiary(userId, id) {
    await wait(300);
    return withDB(async (db) => {
      const user = db.users.find((u) => u.id === userId);
      if (!user) throw new Error("User not found.");
      user.beneficiaries = user.beneficiaries.filter((b) => b.id !== id);
      return id;
    });
  },

  async sendMoney(userId, { beneficiary, q, method }) {
    await wait(900);
    return withDB(async (db) => {
      const user = db.users.find((u) => u.id === userId);
      if (!user) throw new Error("User not found.");
      if (q.total > user.wallet.balance) throw new Error("That's more than your wallet balance.");
      const tx = {
        id: uid("TX"), type: "send", status: "pending", beneficiaryId: beneficiary.id,
        name: beneficiary.name, amount: q.send, currency: beneficiary.currency,
        rate: q.rate, fee: q.fee, spreadRevenue: q.spreadRevenue, received: q.received,
        method, createdAt: new Date().toISOString(),
      };
      user.wallet.balance = round2(user.wallet.balance - q.send - q.fee);
      user.transactions = [tx, ...user.transactions];
      return tx;
    });
  },

  /** Aggregates every user's real transactions into the admin's platform-wide view. */
  async adminData() {
    await wait(500);
    const db = await getDB();
    const users = db.users.map(toPublicUser).map((u) => ({
      ...u,
      balance: db.users.find((x) => x.id === u.id).wallet.balance,
      sends: db.users.find((x) => x.id === u.id).transactions.filter((t) => t.type === "send").length,
      volume: round2(db.users.find((x) => x.id === u.id).transactions.filter((t) => t.type === "send" && t.status !== "failed").reduce((a, t) => a + t.amount, 0)),
    }));

    const transactions = [];
    for (const user of db.users) {
      for (const t of user.transactions) {
        if (t.type !== "send") continue;
        transactions.push({ id: t.id, user: user.name, corridor: `CAD ▸ ${t.currency}`, amount: t.amount, fee: t.fee, spreadRevenue: t.spreadRevenue, status: t.status, createdAt: t.createdAt });
      }
    }
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const buckets = new Map();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString("en-CA", { month: "short" });
      buckets.set(key, { month: key, fees: 0, spread: 0, volume: 0, transfers: 0 });
    }
    for (const t of transactions) {
      if (t.status === "failed") continue;
      const key = monthKey(t.createdAt);
      const b = buckets.get(key);
      if (!b) continue;
      b.fees = round2(b.fees + t.fee);
      b.spread = round2(b.spread + t.spreadRevenue);
      b.volume = round2(b.volume + t.amount);
      b.transfers += 1;
    }

    return { users, transactions, revenue: [...buckets.values()] };
  },

  async adminCreateUser(u) {
    await wait(500);
    return withDB(async (db) => {
      const salt = randomSalt();
      const passwordHash = await hashPassword(u.password || uid("pw"), salt);
      const user = {
        id: uid("usr"), name: u.name, email: u.email, phone: u.phone || "", country: u.country || "Canada",
        role: u.role || "user", kyc: u.kyc || "unverified", status: u.status || "active", joined: new Date().toISOString(),
        passwordSalt: salt, passwordHash,
        wallet: { balance: 0, currency: "CAD" }, beneficiaries: [], transactions: [],
      };
      db.users.push(user);
      return toPublicUser(user);
    });
  },

  async adminUpdateUser(id, patch) {
    await wait(400);
    return withDB(async (db) => {
      const user = db.users.find((u) => u.id === id);
      if (!user) throw new Error("User not found.");
      Object.assign(user, patch);
      return { id, patch };
    });
  },

  async adminDeleteUser(id) {
    await wait(400);
    return withDB(async (db) => {
      db.users = db.users.filter((u) => u.id !== id);
      return id;
    });
  },
};
