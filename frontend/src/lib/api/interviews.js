import { HR_QUESTIONS, TECHNICAL_QUESTIONS } from "@/lib/data/questions";
import { delay, readStore, uid, writeStore } from "./store";

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

/** POST /api/interviews */
export async function saveInterview(input) {
  await delay(250);
  const answers = input.answers || [];
  const attempted = answers.filter((item) => (item.answer || "").trim().length > 0).length;
  const total = answers.reduce((sum, item) => sum + (item.feedback?.score || 0), 0);
  const score = answers.length ? Math.round(total / answers.length) : 0;

  const strong = answers.filter((item) => (item.feedback?.score || 0) >= 7);
  const weak = answers.filter((item) => (item.feedback?.score || 0) < 7);

  const strengths = strong.length
    ? Array.from(new Set(strong.map((item) => item.skill)))
    : ["Willingness to attempt every question"];
  const improvements = weak.length
    ? Array.from(new Set(weak.flatMap((item) => item.feedback?.improve || []))).slice(0, 6)
    : ["Keep practising to maintain this level"];

  const summary =
    score >= 8
      ? "Excellent session. You are close to interview ready for this area."
      : score >= 5
        ? "Good base. Revise the weaker topics and add examples to your answers."
        : "Focus on fundamentals first, then repeat this interview to measure progress.";

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

/** GET /api/interviews */
export function listInterviews(userId) {
  return readStore(RESULTS_KEY, []).filter((item) => item.userId === userId);
}

/** GET /api/interviews/{id} */
export function getInterview(id) {
  return readStore(RESULTS_KEY, []).find((item) => item.id === id) ?? null;
}
