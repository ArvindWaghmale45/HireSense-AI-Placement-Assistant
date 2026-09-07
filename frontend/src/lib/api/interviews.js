import { HR_QUESTIONS, TECHNICAL_QUESTIONS } from "@/lib/data/questions";
import { delay, readStore, uid, writeStore } from "./store";
import { getAuthToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const RESULTS_KEY = "interviews";

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = copy[i];
    const b = copy[j];
    copy[i] = b;
    copy[j] = a;
  }
  return copy;
}

/** GET /api/interviews/questions — skill aware selection from the resume. */
export async function getQuestions(config) {
  await delay(250);
  const pool = config.type === "HR" ? HR_QUESTIONS : TECHNICAL_QUESTIONS;
  const byDifficulty = pool.filter((item) => item.difficulty === config.difficulty);
  const skillSet = new Set((config.skills || []).map((skill) => skill.toLowerCase()));

  const matchesSkill = (item) => skillSet.has(item.skill.toLowerCase());

  const preferred = shuffle(byDifficulty.filter(matchesSkill));
  const sameDifficulty = shuffle(byDifficulty.filter((item) => !matchesSkill(item)));
  const skillOtherDifficulty = shuffle(
    pool.filter((item) => item.difficulty !== config.difficulty && matchesSkill(item)),
  );
  const rest = shuffle(
    pool.filter((item) => item.difficulty !== config.difficulty && !matchesSkill(item)),
  );

  const ordered = [...preferred, ...skillOtherDifficulty, ...sameDifficulty, ...rest];
  return ordered.slice(0, config.count);
}

/** POST /api/interviews/evaluate — replace with the AI-backed endpoint later. */
export async function evaluateAnswer(question, answer) {
  await delay(500);
  const text = (answer || "").trim().toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  const keywords = question.keywords || [];
  const covered = keywords.filter((keyword) => text.includes(keyword.toLowerCase()));
  const improve = keywords.filter((keyword) => !text.includes(keyword.toLowerCase()));

  if (!words.length) {
    return {
      score: 0,
      covered: [],
      improve: keywords,
      comment: "No answer was given for this question.",
    };
  }

  const coverage = covered.length / Math.max(1, keywords.length);
  const depth = Math.min(1, words.length / 60);
  const raw = coverage * 7 + depth * 3;
  const score = Math.max(1, Math.min(10, Math.round(raw)));

  const comment =
    score >= 8
      ? "Strong answer. You covered the key ideas clearly and with enough depth."
      : score >= 5
        ? "Decent answer. The main idea is there, but add an example and more detail."
        : "The answer is too brief or off target. Explain the concept step by step and give an example.";

  return { score, covered, improve: improve.slice(0, 3), comment };
}

/** POST /api/interviews — persists to Spring Boot backend, falls back to localStorage */
export async function saveInterview(input) {
  const answers = input.answers || [];
  const totalQuestions = Math.max(1, input.totalQuestions || answers.length);
  const attempted = answers.filter((item) => (item.answer || "").trim().length > 0).length;
  const total = answers.reduce((sum, item) => sum + (item.feedback?.score || 0), 0);
  const score = Math.max(0, Math.min(10, Math.round(total / totalQuestions)));

  const strong = answers.filter((item) => (item.feedback?.score || 0) >= 7);
  const weak = answers.filter((item) => (item.feedback?.score || 0) < 6);

  const strengths = strong.length
    ? Array.from(new Set(strong.map((item) => item.skill)))
    : ["Attempted interview questions"];
  const improvements = weak.length
    ? Array.from(new Set(weak.flatMap((item) => item.feedback?.improve || []))).slice(0, 6)
    : ["Revise weak topics and practice structuring technical answers"];

  const summary =
    score >= 8
      ? "Excellent session! Strong technical depth and clear articulation."
      : score >= 5
        ? "Decent baseline. Revise the weaker topics and practice explaining concepts with concrete project examples."
        : score >= 2
          ? "Needs significant preparation. Focus on core technical definitions, practice speaking answers aloud, and re-attempt."
          : "Incomplete or off-target session. Make sure to attempt every question with clear technical explanations.";

  const detailsJson = JSON.stringify({
    strengths,
    improvements,
    answers,
  });

  const token = getAuthToken();
  if (token) {
    try {
      const res = await fetch(`${API_BASE_URL}/interviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: typeof input.userId === "number" ? input.userId : null,
          type: input.type,
          difficulty: input.difficulty,
          totalQuestions: input.totalQuestions,
          attempted,
          score,
          summary,
          detailsJson,
        }),
      });

      if (res.ok) {
        const savedBackend = await res.json();
        const result = {
          id: String(savedBackend.id),
          userId: savedBackend.userId,
          type: savedBackend.type,
          difficulty: savedBackend.difficulty,
          totalQuestions: savedBackend.totalQuestions,
          attempted: savedBackend.attempted,
          score: savedBackend.score,
          strengths,
          improvements,
          summary: savedBackend.summary,
          answers,
          createdAt: savedBackend.createdAt || new Date().toISOString(),
        };
        const all = readStore(RESULTS_KEY, []);
        writeStore(RESULTS_KEY, [result, ...all.filter((x) => String(x.id) !== String(result.id))]);
        return result;
      }
    } catch (err) {
      console.warn("Spring Boot interview save offline, falling back to local storage:", err);
    }
  }

  // Fallback to local store
  await delay(200);
  const result = {
    id: uid("int"),
    userId: input.userId,
    type: input.type,
    difficulty: input.difficulty,
    totalQuestions: input.totalQuestions,
    attempted,
    score,
    strengths,
    improvements,
    summary,
    answers,
    createdAt: new Date().toISOString(),
  };

  const all = readStore(RESULTS_KEY, []);
  writeStore(RESULTS_KEY, [result, ...all]);
  return result;
}

/** Fetches interviews from Spring Boot backend and syncs local cache */
export async function fetchUserInterviews() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/interviews`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const list = await res.json();
      const mapped = list.map((item) => {
        let details = {};
        try {
          if (item.detailsJson) details = JSON.parse(item.detailsJson);
        } catch {}
        return {
          id: String(item.id),
          userId: item.userId,
          type: item.type,
          difficulty: item.difficulty,
          totalQuestions: item.totalQuestions,
          attempted: item.attempted,
          score: item.score,
          summary: item.summary,
          strengths: details.strengths || [],
          improvements: details.improvements || [],
          answers: details.answers || [],
          createdAt: item.createdAt,
        };
      });

      const all = readStore(RESULTS_KEY, []);
      const existingOther = all.filter((x) => !mapped.some((m) => String(m.id) === String(x.id)));
      writeStore(RESULTS_KEY, [...mapped, ...existingOther]);
      return mapped;
    }
  } catch (err) {
    console.warn("Failed to fetch interviews from Spring Boot backend:", err);
  }
  return null;
}

/** GET /api/interviews (Cached) */
export function listInterviews(userId) {
  return readStore(RESULTS_KEY, []).filter(
    (item) => item.userId === userId || String(item.userId) === String(userId),
  );
}

/** GET /api/interviews/{id} (Cached) */
export function getInterview(id) {
  return (
    readStore(RESULTS_KEY, []).find(
      (item) => item.id === id || String(item.id) === String(id),
    ) ?? null
  );
}

