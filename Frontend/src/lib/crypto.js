const toHex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");

const digest = async (text) => toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));

export const randomSalt = () => toHex(crypto.getRandomValues(new Uint8Array(16)));

export const hashPassword = async (password, salt) => digest(`${salt}:${password}`);

export const verifyPassword = async (password, salt, hash) => (await hashPassword(password, salt)) === hash;
