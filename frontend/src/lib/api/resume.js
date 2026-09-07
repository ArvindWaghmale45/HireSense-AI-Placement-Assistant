import { SKILL_LIBRARY } from "@/lib/data/questions";
import { delay } from "./store";

const ROLE_HINTS = [
  { role: "Java Backend Developer", words: ["java", "spring", "hibernate", "backend"] },
  { role: "Frontend Developer", words: ["react", "javascript", "css", "frontend", "ui"] },
  { role: "Full Stack Developer", words: ["full stack", "fullstack", "mern", "end to end"] },
  { role: "Data Analyst", words: ["python", "pandas", "analytics", "power bi", "tableau"] },
  { role: "Software Engineer", words: ["software", "engineer", "developer"] },
];

const EDU_HINTS = [
  "b.tech",
  "btech",
  "b.e",
  "bachelor",
  "master",
  "m.tech",
  "mca",
  "bca",
  "b.sc",
  "engineering",
  "diploma",
];

async function readFileText(file) {
  const buffer = await file.arrayBuffer();
  const raw = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  return raw
    .replace(/[^\x20-\x7E\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractSkills(text) {
  const lower = text.toLowerCase();
  const found = SKILL_LIBRARY.filter((skill) => {
    const needle = skill.toLowerCase();
    if (needle === "html/css") return lower.includes("html") || lower.includes("css");
    if (needle === "oop") return lower.includes("oop") || lower.includes("object oriented");
    if (needle === "data structures") return lower.includes("data structure") || lower.includes("dsa");
    return lower.includes(needle);
  });
  return found.length ? found : ["Communication"];
}

/** Analyse an uploaded resume. Swap this body for a POST to /api/resume/analyze later. */
export async function analyzeResume(file) {
  await delay(600);
  const text = await readFileText(file);
  const lower = text.toLowerCase();
  const skills = extractSkills(text);

  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] ?? "";
  const nameGuess =
    text.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})/)?.[1] ??
    file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");

  const education =
    EDU_HINTS.filter((hint) => lower.includes(hint))
      .slice(0, 2)
      .map((hint) => hint.toUpperCase())
      .join(" / ") || "Not detected";

  const targetRole =
    ROLE_HINTS.find((hint) => hint.words.some((word) => lower.includes(word)))?.role ??
    "Software Engineer";

  const wordCount = text.split(" ").filter(Boolean).length;

  const strengths = [];
  if (skills.length >= 4) strengths.push(`Broad technical base: ${skills.slice(0, 5).join(", ")}`);
  if (lower.includes("project")) strengths.push("Projects section present, good for fresher roles");
  if (lower.includes("intern")) strengths.push("Internship experience mentioned");
  if (email) strengths.push("Contact details are easy to find");
  if (!strengths.length) strengths.push("Resume uploaded and parsed successfully");

  const gaps = [];
  if (!lower.includes("project")) gaps.push("No clear projects section");
  if (!lower.includes("github") && !lower.includes("portfolio"))
    gaps.push("No GitHub or portfolio link");
  if (skills.length < 4) gaps.push("Few recognisable technical skills listed");
  if (wordCount < 150) gaps.push("Resume looks short on detail");
  if (!gaps.length) gaps.push("No major gaps detected");

  const suggestions = [
    "Start bullet points with action verbs (built, designed, improved).",
    "Add measurable results, for example 'reduced load time by 40%'.",
    "Keep the resume to one page and group skills by category.",
    `Tailor the summary line to your target role: ${targetRole}.`,
  ];

  const score = Math.max(
    35,
    Math.min(
      95,
      40 + skills.length * 6 + (lower.includes("project") ? 10 : 0) + (email ? 5 : 0) +
        (wordCount > 200 ? 8 : 0),
    ),
  );

  return {
    fileName: file.name,
    score,
    skills,
    education,
    targetRole,
    name: nameGuess,
    email,
    strengths,
    gaps,
    suggestions,
    wordCount,
    resumeText: text,
  };
}
