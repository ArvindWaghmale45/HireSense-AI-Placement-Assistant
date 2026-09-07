import { delay, uid } from "./store";
import { TECHNICAL_QUESTIONS, HR_QUESTIONS } from "../data/questions";

const API_KEY_STORAGE = "hiresense:ai_api_key";
const AI_MODEL_STORAGE = "hiresense:ai_model";

export function getApiKey() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(API_KEY_STORAGE) || "";
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
  if (typeof window === "undefined") return "gemini-1.5-flash";
  return localStorage.getItem(AI_MODEL_STORAGE) || "gemini-1.5-flash";
}

export function setAiModel(model) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AI_MODEL_STORAGE, model);
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
 * Converts a Blob to a Base64 string
 */
async function blobToBase64(blob) {
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
}) {
  const apiKey = getApiKey();
  const skillList = skills.length > 0 ? skills.join(", ") : "Java, SQL, OOP, Data Structures";

  if (apiKey) {
    try {
      const prompt = `You are an expert technical and HR placement interviewer for campus and off-campus placements.
Generate exactly ${count} interview questions for a candidate preparing for the role of "${targetRole}".
Round Type: ${type} (TECHNICAL or HR)
Difficulty Level: ${difficulty}
Candidate Skills: ${skillList}

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

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item, idx) => ({
              ...item,
              id: item.id || uid(`ai_q_${idx}`),
            }));
          }
        }
      } else {
        console.warn("Gemini API error, falling back to local questions:", response.status);
      }
    } catch (err) {
      console.warn("AI generation failed, using fallback:", err);
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

  // If we have an audio blob and an API key, use Google Gemini's Multimodal Audio model!
  if (apiKey && audioBlob && audioBlob.size > 2000) {
    try {
      const base64Audio = await blobToBase64(audioBlob);
      const mimeType = audioBlob.type.split(";")[0] || "audio/webm";

      const prompt = `You are an expert technical interviewer evaluating a student's answer in a placement interview.
First, listen carefully to the attached audio and transcribe the candidate's spoken response word-for-word into English (catching technical terms like Java, Spring Boot, SQL, etc., even if spoken from a distance or with an accent).
Second, evaluate their response against this question:
Question: "${question.text}"
Skill / Topic: "${question.skill}"
Difficulty: "${question.difficulty}"

Return ONLY a valid JSON object with:
{
  "transcript": "<exact word-for-word English transcription of the audio>",
  "score": <integer from 1 to 10 based on accuracy, clarity, and depth>,
  "strengths": [<1 to 3 positive points candidate mentioned>],
  "improve": [<1 to 3 missing points or concepts candidate should study>],
  "comment": "<2-3 sentences of encouraging but honest examiner feedback>",
  "modelAnswer": "<A concise, high-scoring 3-4 sentence ideal answer explaining the concept with an example>"
}
Return pure JSON without markdown backticks.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Audio,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
          return {
            transcript: parsed.transcript || text,
            score: Number(parsed.score) || 5,
            covered: parsed.strengths || [],
            improve: parsed.improve || [],
            comment: parsed.comment || "Good attempt. Keep refining your technical depth.",
            modelAnswer: parsed.modelAnswer || "",
          };
        }
      } else {
        console.warn("Gemini multimodal audio evaluation returned error:", response.status);
      }
    } catch (err) {
      console.warn("Gemini multimodal audio processing failed, falling back to text:", err);
    }
  }

  // If no audio blob or if audio call had an issue, evaluate text transcript
  if (!text) {
    return {
      transcript: "",
      score: 0,
      covered: [],
      improve: question.keywords || ["No answer provided"],
      comment: "No answer was recorded. Please attempt the question to receive feedback.",
      modelAnswer: `An ideal answer should address: ${(question.keywords || []).join(", ")}.`,
    };
  }

  if (apiKey) {
    try {
      const prompt = `You are an expert technical interviewer evaluating a student's answer in a mock interview.
Question: "${question.text}"
Skill / Topic: "${question.skill}"
Difficulty: "${question.difficulty}"
Candidate's Answer: "${text}"

Evaluate the answer and return ONLY a valid JSON object with:
{
  "score": <integer from 1 to 10 based on accuracy, clarity, and depth>,
  "strengths": [<1 to 3 positive points candidate mentioned>],
  "improve": [<1 to 3 missing points or concepts candidate should study>],
  "comment": "<2-3 sentences of encouraging but honest examiner feedback>",
  "modelAnswer": "<A concise, high-scoring 3-4 sentence ideal answer explaining the concept with an example>"
}
Return pure JSON without markdown backticks.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
          return {
            transcript: text,
            score: Number(parsed.score) || 5,
            covered: parsed.strengths || [],
            improve: parsed.improve || [],
            comment: parsed.comment || "Good attempt. Keep refining your technical depth.",
            modelAnswer: parsed.modelAnswer || "",
          };
        }
      }
    } catch (err) {
      console.warn("AI evaluation error, using fallback:", err);
    }
  }

  // Fallback local evaluation
  await delay(400);
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const keywords = question.keywords || [];

  const covered = keywords.filter((k) => lower.includes(k.toLowerCase()));
  const improve = keywords.filter((k) => !lower.includes(k.toLowerCase()));

  const coverage = covered.length / Math.max(1, keywords.length);
  const depth = Math.min(1, words.length / 50);
  const score = Math.max(2, Math.min(10, Math.round(coverage * 7 + depth * 3)));

  const comment =
    score >= 8
      ? "Outstanding explanation! You covered key concepts clearly with appropriate terminology."
      : score >= 5
      ? "Good answer covering the main principle. To improve, add a real-world code or project example."
      : "Basic attempt. Review the fundamentals of this concept and structure your response with definition + example.";

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
