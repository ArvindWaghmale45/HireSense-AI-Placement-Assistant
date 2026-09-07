import { delay, readStore, removeStore, uid, writeStore } from "./store";

const USERS_KEY = "users";
const SESSION_KEY = "session";
const TOKEN_KEY = "hiresense:token";
const STORED_USER_KEY = "hiresense:user";
const API_BASE_URL = "http://localhost:8080/api";

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORED_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(STORED_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORED_USER_KEY);
}

function getUsers() {
  return readStore(USERS_KEY, []);
}

function saveUsers(users) {
  writeStore(USERS_KEY, users);
}

function strip(user) {
  const { password: _password, ...rest } = user;
  return rest;
}

/** POST /api/auth/register */
export async function register(input) {
  const email = input.email.trim().toLowerCase();

  // Try Spring Boot Backend first
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name.trim(),
        email,
        password: input.password,
        targetRole: input.targetRole || "Software Engineer",
        skills: input.skills || [],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setAuthToken(data.token);
      setStoredUser(data.user);
      writeStore(SESSION_KEY, data.user.id);
      return data.user;
    } else {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Registration failed on server.");
    }
  } catch (err) {
    // If backend gave a real validation error, throw it
    if (err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
      throw err;
    }
    console.warn("Spring Boot backend offline, falling back to local registration:", err);
  }

  // Local fallback
  await delay(200);
  const users = getUsers();
  if (users.some((u) => u.email === email)) {
    throw new Error("An account with this email already exists.");
  }
  const user = {
    id: uid("usr"),
    name: input.name.trim(),
    email,
    password: input.password,
    education: input.education ?? "",
    targetRole: input.targetRole ?? "Software Engineer",
    skills: input.skills ?? [],
    resumeFileName: input.resumeFileName,
    resumeText: input.resumeText,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  writeStore(SESSION_KEY, user.id);
  setStoredUser(strip(user));
  return strip(user);
}

/** POST /api/auth/login */
export async function login(email, password) {
  const cleanEmail = email.trim().toLowerCase();

  // Try Spring Boot Backend first
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setAuthToken(data.token);
      setStoredUser(data.user);
      writeStore(SESSION_KEY, data.user.id);
      return data.user;
    } else {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Invalid email or password.");
    }
  } catch (err) {
    if (err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
      throw err;
    }
    console.warn("Spring Boot backend offline, checking local login fallback:", err);
  }

  // Local fallback
  await delay(200);
  const user = getUsers().find((item) => item.email === cleanEmail);
  if (!user || user.password !== password) {
    throw new Error("Invalid email or password.");
  }
  writeStore(SESSION_KEY, user.id);
  const safeUser = strip(user);
  setStoredUser(safeUser);
  return safeUser;
}

export function logout() {
  setAuthToken(null);
  setStoredUser(null);
  removeStore(SESSION_KEY);
}

export function getCurrentUser() {
  const stored = getStoredUser();
  if (stored) return stored;

  const id = readStore(SESSION_KEY, null);
  if (!id) return null;
  const user = getUsers().find((item) => item.id === id);
  return user ? strip(user) : null;
}

/** PUT /api/auth/profile */
export async function updateProfile(userId, patch) {
  const token = getAuthToken();

  // Update in Spring Boot Backend if authenticated
  if (token) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
      });

      if (res.ok) {
        const updated = await res.json();
        setStoredUser(updated);
        return updated;
      }
    } catch (err) {
      console.warn("Backend profile update error, saving locally:", err);
    }
  }

  // Local update fallback
  await delay(150);
  const users = getUsers();
  const index = users.findIndex((user) => user.id === userId);
  if (index !== -1) {
    const updated = { ...users[index], ...patch };
    users[index] = updated;
    saveUsers(users);
    const safe = strip(updated);
    setStoredUser(safe);
    return safe;
  }

  const current = getStoredUser() || {};
  const updated = { ...current, ...patch };
  setStoredUser(updated);
  return updated;
}
