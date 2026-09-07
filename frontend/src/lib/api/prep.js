import { MCQ_QUESTIONS } from "@/lib/data/questions";
import { delay, readStore, uid, writeStore } from "./store";

const ATTEMPTS_KEY = "prep-attempts";

/** GET /api/placement/questions */
export function getMcqs(category, topic) {
  return MCQ_QUESTIONS.filter(
    (item) => item.category === category && (!topic || item.topic === topic),
  );
}

export function getTopics(category) {
  return Array.from(new Set(getMcqs(category).map((item) => item.topic)));
}

/** POST /api/placement/attempts */
export async function saveAttempt(input) {
  await delay(200);
  const attempt = { ...input, id: uid("prep"), createdAt: new Date().toISOString() };
  writeStore(ATTEMPTS_KEY, [attempt, ...readStore(ATTEMPTS_KEY, [])]);
  return attempt;
}

/** GET /api/placement/attempts */
export function listAttempts(userId) {
  return readStore(ATTEMPTS_KEY, []).filter((item) => item.userId === userId);
}
