import { uid, daysAgo, round2 } from "./format.js";
import { BASE_RATES, CORRIDORS, PAYOUT_METHODS } from "./constants.js";
import { quote } from "./pricing.js";
import { randomSalt, hashPassword } from "./crypto.js";

const DB_KEY = "heha_db_v1";
const DB_VERSION = 2;

const SEED_BENEFICIARIES = [
  { id: "ben_1", name: "Aoko Odhiambo", relation: "Mother", currency: "KES", country: "Kenya", flag: "🇰🇪", method: "mobile", account: "+254 722 481 093", bank: "M-Pesa" },
  { id: "ben_2", name: "Brian Otieno", relation: "Brother", currency: "KES", country: "Kenya", flag: "🇰🇪", method: "bank", account: "0142 8890 3341", bank: "Equity Bank" },
  { id: "ben_3", name: "Grace Nakato", relation: "Cousin", currency: "UGX", country: "Uganda", flag: "🇺🇬", method: "mobile", account: "+256 771 220 884", bank: "MTN MoMo" },
];

const SEED_TRANSACTIONS = [
  { id: "TX_9F41A2", type: "send", status: "completed", beneficiaryId: "ben_1", name: "Aoko Odhiambo", amount: 320, currency: "KES", rate: 110.98, fee: 2.88, spreadRevenue: 1.12, received: 35513.6, method: "mobile", createdAt: daysAgo(2) },
  { id: "TX_7C08D5", type: "topup", status: "completed", name: "Top up · Visa ·1042", amount: 500, fee: 0, spreadRevenue: 0, createdAt: daysAgo(3) },
  { id: "TX_4B77E1", type: "send", status: "pending", beneficiaryId: "ben_2", name: "Brian Otieno", amount: 180, currency: "KES", rate: 111.2, fee: 1.62, spreadRevenue: 0.63, received: 20016, method: "bank", createdAt: daysAgo(0.2) },
  { id: "TX_2A19C7", type: "send", status: "completed", beneficiaryId: "ben_3", name: "Grace Nakato", amount: 95, currency: "UGX", rate: 2702.1, fee: 0.86, spreadRevenue: 0.33, received: 256699.5, method: "mobile", createdAt: daysAgo(12) },
  { id: "TX_8E52B0", type: "topup", status: "completed", name: "Top up · Interac", amount: 750, fee: 0, spreadRevenue: 0, createdAt: daysAgo(16) },
  { id: "TX_1D63F9", type: "send", status: "completed", beneficiaryId: "ben_1", name: "Aoko Odhiambo", amount: 400, currency: "KES", rate: 109.74, fee: 3.6, spreadRevenue: 1.4, received: 43896, method: "mobile", createdAt: daysAgo(31) },
  { id: "TX_6A25C4", type: "send", status: "completed", beneficiaryId: "ben_2", name: "Brian Otieno", amount: 250, currency: "KES", rate: 108.9, fee: 2.25, spreadRevenue: 0.88, received: 27225, method: "bank", createdAt: daysAgo(44) },
  { id: "TX_3F90A8", type: "send", status: "failed", beneficiaryId: "ben_3", name: "Grace Nakato", amount: 60, currency: "UGX", rate: 2688, fee: 0.54, spreadRevenue: 0.21, received: 161280, method: "cash", createdAt: daysAgo(52) },
  { id: "TX_5C11D3", type: "send", status: "completed", beneficiaryId: "ben_1", name: "Aoko Odhiambo", amount: 275, currency: "KES", rate: 107.6, fee: 2.48, spreadRevenue: 0.96, received: 29590, method: "mobile", createdAt: daysAgo(62) },
  { id: "TX_0B48E6", type: "topup", status: "completed", name: "Top up · Visa ·1042", amount: 600, fee: 0, spreadRevenue: 0, createdAt: daysAgo(70) },
  { id: "TX_9D37F2", type: "send", status: "completed", beneficiaryId: "ben_2", name: "Brian Otieno", amount: 510, currency: "KES", rate: 106.4, fee: 4.5, spreadRevenue: 1.79, received: 54264, method: "bank", createdAt: daysAgo(88) },
  { id: "TX_7E64B1", type: "send", status: "completed", beneficiaryId: "ben_1", name: "Aoko Odhiambo", amount: 330, currency: "KES", rate: 105.2, fee: 2.97, spreadRevenue: 1.16, received: 34716, method: "mobile", createdAt: daysAgo(119) },
  { id: "TX_2C80A5", type: "send", status: "completed", beneficiaryId: "ben_3", name: "Grace Nakato", amount: 140, currency: "UGX", rate: 2640, fee: 1.26, spreadRevenue: 0.49, received: 369600, method: "mobile", createdAt: daysAgo(146) },
];

const OTHER_SEED_USERS = [
  { name: "Wanjiru Kamau", email: "admin@heha.app", password: "admin123", phone: "+1 416 555 0100", country: "Canada", role: "admin", kyc: "verified", status: "active", joinedDays: 400, balance: 0, sendCount: 0 },
  { name: "Fatima Yusuf", email: "fatima.y@mail.com", password: "password123", phone: "+1 647 555 0198", country: "Canada", role: "user", kyc: "verified", status: "active", joinedDays: 168, balance: 342.15, sendCount: 5 },
  { name: "Daniel Mwangi", email: "d.mwangi@mail.com", password: "password123", phone: "+1 905 555 0733", country: "Canada", role: "user", kyc: "pending", status: "active", joinedDays: 96, balance: 88.0, sendCount: 2 },
  { name: "Chidera Okafor", email: "chidera@mail.com", password: "password123", phone: "+44 7700 900 812", country: "United Kingdom", role: "user", kyc: "verified", status: "active", joinedDays: 84, balance: 1910.4, sendCount: 6 },
  { name: "Samuel Tesfaye", email: "s.tesfaye@mail.com", password: "password123", phone: "+1 780 555 0455", country: "Canada", role: "user", kyc: "rejected", status: "suspended", joinedDays: 61, balance: 0, sendCount: 1 },
  { name: "Nyasha Moyo", email: "nyasha.m@mail.com", phone: "+61 412 555 776", password: "password123", country: "Australia", role: "user", kyc: "verified", status: "active", joinedDays: 38, balance: 655.9, sendCount: 3 },
  { name: "Amina Hassan", email: "amina.h@mail.com", password: "password123", phone: "+1 613 555 0290", country: "Canada", role: "user", kyc: "pending", status: "active", joinedDays: 11, balance: 214.75, sendCount: 1 },
];

/** Deterministic-ish filler transactions so the admin revenue trend has real, aggregatable data. */
function genTransactions(seedIndex, count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const corridor = CORRIDORS[(seedIndex + i) % CORRIDORS.length];
    const rate = BASE_RATES[corridor.code] * (0.94 + ((seedIndex * 7 + i * 13) % 12) / 100);
    const amount = 60 + ((seedIndex * 37 + i * 53) % 18) * 25;
    const q = quote(amount, rate);
    const ageDays = 3 + i * (150 / count) + (seedIndex % 5);
    const status = i % 9 === 8 ? "failed" : i === 0 ? "pending" : "completed";
    out.push({
      id: uid("TX"),
      type: "send",
      status,
      beneficiaryId: null,
      name: `Recipient ${i + 1}`,
      amount: q.send,
      currency: corridor.code,
      rate,
      fee: q.fee,
      spreadRevenue: q.spreadRevenue,
      received: q.received,
      method: PAYOUT_METHODS[i % PAYOUT_METHODS.length].id,
      createdAt: daysAgo(ageDays),
    });
  }
  return out;
}

async function buildSeedUser({ name, email, password, phone, country, role, kyc, status, joinedDays, balance, sendCount }, index) {
  const salt = randomSalt();
  const passwordHash = await hashPassword(password, salt);
  const isDemo = email === "demo@heha.app";
  return {
    id: uid("usr"),
    name, email, phone, country, role, kyc, status,
    joined: daysAgo(joinedDays),
    passwordSalt: salt,
    passwordHash,
    wallet: { balance, currency: "CAD" },
    beneficiaries: isDemo ? SEED_BENEFICIARIES : [],
    transactions: isDemo ? SEED_TRANSACTIONS : genTransactions(index, sendCount),
  };
}

async function seedDB() {
  const demoUser = { name: "Emmanuel Koroso", email: "demo@heha.app", password: "demo1234", phone: "+1 416 555 0142", country: "Canada", role: "user", kyc: "verified", status: "active", joinedDays: 210, balance: 1284.5, sendCount: SEED_TRANSACTIONS.length };
  const specs = [demoUser, ...OTHER_SEED_USERS];
  const users = await Promise.all(specs.map((spec, i) => buildSeedUser(spec, i)));
  return {
    version: DB_VERSION,
    users,
    session: null,
    rates: { pairs: { ...BASE_RATES }, updatedAt: new Date().toISOString() },
  };
}

let dbPromise = null;

async function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.version === DB_VERSION) return parsed;
      /* seed data shape changed since this was stored, fall through to reseed */
    } catch {
      /* corrupt entry, fall through to reseed */
    }
  }
  const seeded = await seedDB();
  saveDB(seeded);
  return seeded;
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

/** Single in-memory handle over the persisted DB, loaded once per session. */
export async function getDB() {
  if (!dbPromise) dbPromise = loadDB();
  return dbPromise;
}

export async function withDB(fn) {
  const db = await getDB();
  const result = await fn(db);
  saveDB(db);
  return result;
}

export const DEMO_LOGIN_HINT = { user: "demo@heha.app / demo1234", admin: "admin@heha.app / admin123" };
