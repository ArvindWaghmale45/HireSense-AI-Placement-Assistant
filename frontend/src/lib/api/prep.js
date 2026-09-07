import { MCQ_QUESTIONS } from "@/lib/data/questions";
import { delay, readStore, uid, writeStore } from "./store";

const ATTEMPTS_KEY = "prep-attempts";

/**
 * Robust Fisher-Yates array shuffler.
 * Guarantees questions and choices are randomized on every test start/restart.
 */
export function shuffleArray(arr) {
  if (!Array.isArray(arr)) return [];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Curated placement tests catalog.
 * Provides distinct focused tests across Aptitude, Reasoning, Verbal, and Core Technical domains.
 */
export const CURATED_TESTS = [
  {
    id: "quant-speed-sprint",
    title: "Quantitative Speed Sprint",
    category: "aptitude",
    topicCategory: "Quant",
    badge: "Speed & Accuracy",
    description: "Time & Work, Trains & Speed, Profit & Loss, Compound Interest, Permutations & Probability.",
    count: 10,
    durationMins: 15,
    difficulty: "Medium",
    topics: ["Time and Work", "Time, Speed & Distance", "Profit and Loss", "Simple & Compound Interest", "Probability", "Permutations & Combinations", "Ratios and Proportions", "Problems on Ages"],
  },
  {
    id: "logical-reasoning-arena",
    title: "Logical Reasoning Arena",
    category: "aptitude",
    topicCategory: "Logical",
    badge: "Analytical Mind",
    description: "Number & Letter Series, Blood Relations, Syllogisms, Direction Sense, Clocks & Calendars.",
    count: 10,
    durationMins: 15,
    difficulty: "Medium",
    topics: ["Series Completion", "Blood Relations", "Coding - Decoding", "Syllogisms", "Direction Sense", "Clocks & Angles", "Calendar Logic", "Arrangement & Puzzles"],
  },
  {
    id: "verbal-ability-grammar",
    title: "Verbal Ability & Grammar",
    category: "aptitude",
    topicCategory: "Verbal",
    badge: "Communication",
    description: "Spotting Errors, Synonyms, Antonyms, Idioms & Phrases, and Sentence Correction.",
    count: 10,
    durationMins: 12,
    difficulty: "Easy",
    topics: ["Error Spotting", "Synonyms & Antonyms", "Idioms & Phrases", "Sentence Correction"],
  },
  {
    id: "campus-allrounder-mock",
    title: "Campus All-Rounder Mock Assessment",
    category: "aptitude",
    topicCategory: "Comprehensive",
    badge: "Full Assessment",
    description: "Comprehensive multi-domain placement paper mirroring TCS NQT, Infosys, and Cognizant rounds.",
    count: 15,
    durationMins: 25,
    difficulty: "Hard",
    topics: [], // Includes all aptitude topics
  },
  {
    id: "java-core-oop",
    title: "Core Java & OOP Concepts",
    category: "technical",
    topicCategory: "Java Core",
    badge: "Object-Oriented",
    description: "JVM Internals, Memory Management, Collections Framework, Multithreading, and Exception Handling.",
    count: 10,
    durationMins: 15,
    difficulty: "Medium",
    topics: ["Java OOP", "Java Memory Management", "Java Collections", "Multithreading", "Spring Boot", "JVM Architecture"],
  },
  {
    id: "fullstack-web-dbms",
    title: "Full Stack, Databases & Systems",
    category: "technical",
    topicCategory: "Web & Data",
    badge: "Architecture & SQL",
    description: "SQL Joins & Indexing, ACID Transactions, React Internals, REST APIs, and Operating Systems.",
    count: 10,
    durationMins: 15,
    difficulty: "Hard",
    topics: ["Database Indexing", "ACID & Transactions", "SQL Queries", "React Internals", "Web Protocols", "Operating Systems", "Data Structures"],
  },
];

/** GET /api/placement/questions - Returns questions optionally shuffled */
export function getMcqs(category, topic, shouldShuffle = true) {
  const filtered = MCQ_QUESTIONS.filter(
    (item) =>
      (!category || item.category.toLowerCase() === category.toLowerCase()) &&
      (!topic || item.topic.toLowerCase() === topic.toLowerCase()),
  );
  return shouldShuffle ? shuffleArray(filtered) : filtered;
}

/**
 * Returns a dynamically shuffled subset of questions for a specific curated test.
 * Every time this is invoked, questions are fresh and shuffled.
 */
export function getCuratedTestQuestions(testId) {
  const test = CURATED_TESTS.find((t) => t.id === testId);
  if (!test) {
    return shuffleArray(MCQ_QUESTIONS).slice(0, 10);
  }

  let pool = MCQ_QUESTIONS.filter(
    (q) => q.category.toLowerCase() === test.category.toLowerCase(),
  );

  if (test.topics && test.topics.length > 0) {
    const topicFiltered = pool.filter((q) =>
      test.topics.some(
        (t) =>
          q.topic.toLowerCase().includes(t.toLowerCase()) ||
          t.toLowerCase().includes(q.topic.toLowerCase()),
      ),
    );
    if (topicFiltered.length >= test.count) {
      pool = topicFiltered;
    }
  }

  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, Math.min(test.count, shuffled.length));
}

export function getTopics(category) {
  return Array.from(new Set(getMcqs(category, null, false).map((item) => item.topic)));
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
