import { delay, readStore, removeStore, uid, writeStore } from "./store";

const USERS_KEY = "users";
const SESSION_KEY = "session";

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
  await delay();
  const users = getUsers();
  const email = input.email.trim().toLowerCase();
  if (users.some((user) => user.email === email)) {
    throw new Error("An account with this email already exists.");
  }
  const user = {
    id: uid("usr"),
    name: input.name.trim(),
    email,
    password: input.password,
    education: input.education ?? "",
    targetRole: input.targetRole ?? "",
    skills: input.skills ?? [],
    resumeFileName: input.resumeFileName,
    resumeText: input.resumeText,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  writeStore(SESSION_KEY, user.id);
  return strip(user);
}

/** POST /api/auth/login */
export async function login(email, password) {
  await delay();
  const user = getUsers().find((item) => item.email === email.trim().toLowerCase());
  if (!user || user.password !== password) {
    throw new Error("Invalid email or password.");
  }
  writeStore(SESSION_KEY, user.id);
  return strip(user);
}

export function logout() {
  removeStore(SESSION_KEY);
}

export function getCurrentUser() {
  const id = readStore(SESSION_KEY, null);
  if (!id) return null;
  const user = getUsers().find((item) => item.id === id);
  return user ? strip(user) : null;
}

/** PUT /api/profile */
export async function updateProfile(userId, patch) {
  await delay(200);
  const users = getUsers();
  const index = users.findIndex((user) => user.id === userId);
  const existing = users[index];
  if (!existing) throw new Error("User not found.");
  const updated = { ...existing, ...patch };
  users[index] = updated;
  saveUsers(users);
  return strip(updated);
}
