import { delay, uid } from "./store";
import { TECHNICAL_QUESTIONS, HR_QUESTIONS } from "../data/questions";

const API_KEY_STORAGE = "hiresense:ai_api_key";
const AI_MODEL_STORAGE = "hiresense:ai_model";
export const PRIMARY_GEMINI_MODEL = "gemini-3.5-flash";
export const FALLBACK_GEMINI_MODEL = "gemini-flash-latest";

export function getApiKey() {
  if (typeof window !== "undefined") {
    const customKey = localStorage.getItem(API_KEY_STORAGE);
    if (customKey && customKey.trim()) return customKey.trim();
  }
  return import.meta.env.VITE_GEMINI_API_KEY || "";
}

export function setApiKey(key) {
  if (typeof window === "undefined") return;
  if (key) {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(API_KEY_STORAGE);
  }
}

export function getAiModel() {
  if (typeof window === "undefined") return PRIMARY_GEMINI_MODEL;
  return localStorage.getItem(AI_MODEL_STORAGE) || PRIMARY_GEMINI_MODEL;
}

export function setAiModel(model) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AI_MODEL_STORAGE, model);
}

/**
 * Universal Gemini API caller with automatic fallback between 3.5-flash and flash-latest
 */
export async function callGeminiApi({
  prompt,
  inlineData = null,
  responseMimeType = "application/json",
  temperature = 0.3,
  systemInstruction = null,
}) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("No Gemini API key available.");

  const models = [PRIMARY_GEMINI_MODEL, FALLBACK_GEMINI_MODEL];

  for (const model of models) {
    try {
      const parts = [{ text: prompt }];
      if (inlineData) {
        parts.push({ inlineData });
      }

      const body = {
        contents: [{ parts }],
        generationConfig: {
          temperature,
          ...(responseMimeType ? { responseMimeType } : {}),
        },
      };

      if (systemInstruction) {
        body.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.warn(`Gemini model ${model} returned ${res.status}:`, errJson?.error?.message);
      }
    } catch (err) {
      console.warn(`Gemini call to ${model} failed:`, err.message);
    }
  }

  throw new Error("All Gemini API models failed to respond.");
}

/**
 * Text-to-Speech: Speaks the question aloud using the browser's speech synthesis
 */
export function speakQuestion(text, onEnd) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = "en-US";
    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis error:", err);
  }
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Transcribes recorded candidate audio using Gemini Multimodal audio model
 */
export async function transcribeSpokenAudio(audioBlob, questionText = "") {
  const apiKey = getApiKey();
  if (!apiKey || !audioBlob || audioBlob.size < 1000) {
    return null;
  }
  try {
    const base64Audio = await blobToBase64(audioBlob);
    const mimeType = audioBlob.type.split(";")[0] || "audio/webm";

    const prompt = `You are an expert technical interviewer evaluating an Indian campus placement candidate.
Listen carefully to the candidate's audio. Transcribe their spoken response word-for-word into English, capturing technical terms accurately (like Java, Spring Boot, OOP, JVM, Hibernate, REST API, SQL, multithreading, polymorphism, etc.).
Question asked: "${questionText}"

Return ONLY a JSON object:
{
  "transcript": "<exact transcribed English response text>"
}`;

    const raw = await callGeminiApi({
      prompt,
      inlineData: { mimeType, data: base64Audio },
      temperature: 0.1,
    });

    if (raw) {
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      return parsed.transcript || null;
    }
  } catch (err) {
    console.warn("Direct audio transcription error:", err);
  }
  return null;
}

/**
 * Converts a Blob to a Base64 string
 */
export async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result.split(",")[1];
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Generates interview questions using Gemini API or smart local fallback
 */
export async function generateAiQuestions({
  type,
  difficulty,
  count = 5,
  skills = [],
  targetRole = "Software Engineer",
  resumeText = "",
}) {
  const apiKey = getApiKey();
  const skillList = skills.length > 0 ? skills.join(", ") : "Java, SQL, OOP, Data Structures";
  const resumeExcerpt = (resumeText || "").trim().slice(0, 2000);

  if (apiKey) {
    try {
      const contextInstructions = resumeExcerpt
        ? `\nCandidate Resume & Projects Context:\n"""\n${resumeExcerpt}\n"""\nIMPORTANT RESUME TAILORING:\nAt least 2 questions MUST directly probe the candidate's actual projects, tools, architectural decisions, or challenges mentioned in their resume (e.g., "In your project [X], how did you handle...", "You listed [Skill/Project], explain your implementation of...").\n`
        : "";

      const prompt = `You are a Senior Technical and HR Placement Interviewer for top software engineering campus and off-campus placements (e.g. TCS Digital, Infosys, Amazon, Product Startups).
Generate exactly ${count} realistic, challenging interview questions for a candidate preparing for the role of "${targetRole}".
Round Type: ${type} (TECHNICAL or HR)
Difficulty Level: ${difficulty}
Candidate Core Skills: ${skillList}
${contextInstructions}
Return ONLY a valid JSON array of objects with the following schema:
[
  {
    "id": "ai_q_1",
    "type": "${type}",
    "difficulty": "${difficulty}",
    "skill": "skill_name",
    "text": "The full interview question here",
    "keywords": ["key concept 1", "key concept 2", "key concept 3"]
  }
]
Do NOT include markdown backticks around JSON if possible. Return pure JSON.`;

      const raw = await callGeminiApi({
        prompt,
        temperature: 0.7,
      });

      if (raw) {
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => ({
            ...item,
            id: item.id || uid(`ai_q_${idx}`),
          }));
        }
      }
    } catch (err) {
      console.warn("AI question generation failed, using fallback:", err);
    }
  }

  // Fallback to local question bank
  await delay(300);
  const pool = type === "HR" ? HR_QUESTIONS : TECHNICAL_QUESTIONS;
  const byDifficulty = pool.filter((item) => item.difficulty === difficulty);
  const skillSet = new Set(skills.map((s) => s.toLowerCase()));

  const matchesSkill = (item) => skillSet.has(item.skill.toLowerCase());
  const preferred = byDifficulty.filter(matchesSkill);
  const others = byDifficulty.filter((item) => !matchesSkill(item));
  const remaining = pool.filter((item) => item.difficulty !== difficulty);

  const combined = [...preferred, ...others, ...remaining];
  return combined.slice(0, count);
}

/**
 * Evaluates candidate's answer with Google Gemini Multimodal Audio (or Text evaluation)
 */
export async function evaluateAiAnswer(question, answer, userSkills = [], audioBlob = null) {
  const apiKey = getApiKey();
  const text = (answer || "").trim();

  // If candidate submitted an empty or near-empty answer, strictly score 0!
  if (!text && (!audioBlob || audioBlob.size < 1000)) {
    return {
      transcript: "",
      score: 0,
      covered: [],
      improve: question.keywords || ["No answer provided"],
      comment: "No response was recorded for this question. You must attempt the question to receive marks.",
      modelAnswer: `An ideal answer should address: ${(question.keywords || []).join(", ")}.`,
    };
  }

  // If candidate typed fewer than 3 words and no audio
  if (text.split(/\s+/).filter(Boolean).length < 3 && (!audioBlob || audioBlob.size < 1500)) {
    return {
      transcript: text,
      score: 1,
      covered: [],
      improve: question.keywords || ["More detail required"],
      comment: "Answer is too brief to evaluate. Provide a structured explanation with technical definitions and examples.",
      modelAnswer: `An ideal answer should address: ${(question.keywords || []).join(", ")}.`,
    };
  }

  // 1. Multimodal Audio evaluation if audio is present
  if (apiKey && audioBlob && audioBlob.size > 2000) {
    try {
      const base64Audio = await blobToBase64(audioBlob);
      const mimeType = audioBlob.type.split(";")[0] || "audio/webm";

      const prompt = `You are an honest, strict Senior Technical Placement Interviewer evaluating a candidate's answer.
First, listen carefully to the attached audio and transcribe the candidate's spoken response word-for-word into English.
Second, rigorously evaluate their response against this question:
Question: "${question.text}"
Skill / Topic: "${question.skill}"
Difficulty: "${question.difficulty}"

SCORING CRITERIA:
- Score 0-2: Answer is off-topic, gibberish, incorrect, or barely attempts the question.
- Score 3-5: Partial answer. Mentions some buzzwords but lacks clear explanation or contains factual errors.
- Score 6-7: Satisfactory answer. Defines the concept reasonably well with minor gaps.
- Score 8-10: Excellent answer. Clear definitions, correct technical depth, real-world examples, and trade-offs.

Return ONLY a valid JSON object:
{
  "transcript": "<exact word-for-word English transcription of the audio>",
  "score": <integer from 0 to 10>,
  "strengths": [<1 to 3 positive points candidate mentioned>],
  "improve": [<1 to 3 missing points or concepts candidate should study>],
  "comment": "<2-3 sentences of honest, constructive examiner feedback>",
  "modelAnswer": "<A concise, high-scoring 3-4 sentence ideal answer explaining the concept with an example>"
}`;

      const raw = await callGeminiApi({
        prompt,
        inlineData: { mimeType, data: base64Audio },
        temperature: 0.2,
      });

      if (raw) {
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        return {
          transcript: parsed.transcript || text,
          score: Math.max(0, Math.min(10, Number(parsed.score) || 0)),
          covered: parsed.strengths || [],
          improve: parsed.improve || [],
          comment: parsed.comment || "Evaluation completed.",
          modelAnswer: parsed.modelAnswer || "",
        };
      }
    } catch (err) {
      console.warn("Gemini multimodal audio processing error, falling back to text:", err);
    }
  }

  // 2. Text Evaluation with Gemini
  if (apiKey && text) {
    try {
      const prompt = `You are an honest, strict Senior Technical Placement Interviewer evaluating a student's answer.
Question: "${question.text}"
Skill / Topic: "${question.skill}"
Difficulty: "${question.difficulty}"
Candidate's Typed Answer: "${text}"

SCORING CRITERIA:
- Score 0-2: Answer is off-topic, incorrect, or barely attempts the question.
- Score 3-5: Partial answer. Mentions buzzwords but lacks depth or has errors.
- Score 6-7: Good answer covering the main principle clearly.
- Score 8-10: Complete answer with clear explanation and practical example.

Return ONLY a valid JSON object:
{
  "score": <integer from 0 to 10>,
  "strengths": [<1 to 3 positive points candidate mentioned>],
  "improve": [<1 to 3 missing points or concepts candidate should study>],
  "comment": "<2-3 sentences of honest, constructive examiner feedback>",
  "modelAnswer": "<A concise, high-scoring 3-4 sentence ideal answer explaining the concept with an example>"
}`;

      const raw = await callGeminiApi({
        prompt,
        temperature: 0.2,
      });

      if (raw) {
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        return {
          transcript: text,
          score: Math.max(0, Math.min(10, Number(parsed.score) || 0)),
          covered: parsed.strengths || [],
          improve: parsed.improve || [],
          comment: parsed.comment || "Evaluated.",
          modelAnswer: parsed.modelAnswer || "",
        };
      }
    } catch (err) {
      console.warn("AI text evaluation failed, using fallback:", err);
    }
  }

  // 3. Fallback Heuristic Evaluation
  await delay(300);
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const keywords = question.keywords || [];

  const covered = keywords.filter((k) => lower.includes(k.toLowerCase()));
  const improve = keywords.filter((k) => !lower.includes(k.toLowerCase()));

  const coverage = covered.length / Math.max(1, keywords.length);
  const depth = Math.min(1, words.length / 50);
  const score = Math.max(0, Math.min(10, Math.round(coverage * 7 + depth * 3)));

  const comment =
    score >= 8
      ? "Outstanding explanation! You covered key concepts clearly with appropriate terminology."
      : score >= 5
      ? "Good answer covering the main principle. To improve, add a real-world code or project example."
      : score >= 2
      ? "Basic attempt. Review the fundamentals of this concept and structure your response with definition + example."
      : "Insufficient answer. The response was off-target or missed the core concepts.";

  const modelAnswer = `In a placement interview, explain ${question.skill} by defining the core principle, discussing why it is used (e.g. ${keywords.slice(0, 2).join(", ")}), and giving a short example.`;

  return {
    transcript: text,
    score,
    covered,
    improve: improve.slice(0, 3),
    comment,
    modelAnswer,
  };
}
