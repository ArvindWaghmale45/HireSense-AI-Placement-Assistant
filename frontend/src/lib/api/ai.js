import { delay, uid } from "./store";
import { TECHNICAL_QUESTIONS, HR_QUESTIONS, MCQ_QUESTIONS } from "../data/questions";

const API_KEY_STORAGE = "hiresense:ai_api_key";
const AI_MODEL_STORAGE = "hiresense:ai_model";
export const PRIMARY_GEMINI_MODEL = "gemini-3.6-flash";
export const FALLBACK_GEMINI_MODEL = "gemini-2.5-pro";
export const SUPPORTED_MODELS = [
  "gemini-3.6-flash",
  "gemini-2.5-pro",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

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
  const stored = localStorage.getItem(AI_MODEL_STORAGE);
  if (stored && SUPPORTED_MODELS.includes(stored)) return stored;
  // Clear any outdated/non-existent model
  try {
    localStorage.removeItem(AI_MODEL_STORAGE);
  } catch { }
  return PRIMARY_GEMINI_MODEL;
}

export async function testGeminiConnection() {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { ok: false, error: "No Gemini API Key found in settings or environment." };
  }
  try {
    const text = await callGeminiApi({
      prompt: "Respond with valid JSON: {\"status\": \"ok\", \"message\": \"HireSense AI is operational\"}",
      responseMimeType: "application/json",
      temperature: 0.1,
    });
    const parsed = JSON.parse(text);
    return { ok: true, model: getAiModel(), data: parsed };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export function setAiModel(model) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AI_MODEL_STORAGE, model);
}

/**
 * Universal Gemini API caller with automatic fallback across verified models
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

  const preferredModel = getAiModel();
  const models = Array.from(new Set([preferredModel, ...SUPPORTED_MODELS]));

  let lastError = null;
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
        lastError = errJson?.error?.message || `Status ${res.status}`;
        console.warn(`Gemini model ${model} returned ${res.status}:`, lastError);
      }
    } catch (err) {
      lastError = err.message;
      console.warn(`Gemini call to ${model} failed:`, err.message);
    }
  }

  throw new Error(`All Gemini API models failed to respond: ${lastError || "Unknown error"}`);
}

/**
 * Retrieves the best available natural female / lady voice across all operating systems & browsers
 */
export function getBestFemaleVoice() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. High-priority natural neural and clear lady voices
  const preferredFemaleVoices = [
    // Edge / Windows Natural Neural Lady Voices
    "Microsoft Jenny Online (Natural) - English (United States)",
    "Microsoft Aria Online (Natural) - English (United States)",
    "Microsoft Sonia Online (Natural) - English (United Kingdom)",
    "Microsoft Neerja Online (Natural) - English (India)",
    "Microsoft Heera - English (India)",
    // Standard Windows Desktop Voices
    "Microsoft Zira Desktop - English (United States)",
    "Microsoft Zira - English (United States)",
    // Google Chrome Voices
    "Google UK English Female",
    "Google US English",
    // Apple Mac / iOS Voices
    "Samantha",
    "Victoria",
    "Karen",
    "Moira",
    "Fiona",
    "Tessa",
  ];

  for (const preferred of preferredFemaleVoices) {
    const match = voices.find((v) => v.name.toLowerCase().includes(preferred.toLowerCase()));
    if (match) return match;
  }

  // 2. Any English voice with female markers in its name
  const femaleMarker = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      /female|woman|lady|zira|jenny|aria|sonia|samantha|victoria|karen|eva|hazel|susan|catherine|neerja/i.test(
        v.name,
      ),
  );
  if (femaleMarker) return femaleMarker;

  // 3. Any natural/online English voice
  const natural = voices.find((v) => v.lang.startsWith("en") && /natural|neural|online|google/i.test(v.name));
  if (natural) return natural;

  // 4. Any English voice fallback
  return voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
}

let currentHumanAudio = null;
let activeUtterances = [];

// Pre-warm voices for Chrome & Edge
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  } catch { }
}

/**
 * Retrieves the best available Indian Male voice across Chrome, Windows, Edge, Mac, and Linux
 */
export function getIndianMaleVoice() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Dedicated Indian Male Natural Neural and system voices
  const preferredIndianMale = [
    // Windows / Edge Indian Male Natural Neural Voices
    "Microsoft Prabhat Online (Natural) - English (India)",
    "Microsoft Madhav Online (Natural) - English (India)",
    "Microsoft Hemant - English (India)",
    "Microsoft Ravi Desktop - English (India)",
    "Microsoft Ravi - English (India)",
    // Google Chrome Indian English voices
    "Google English (India)",
  ];

  for (const preferred of preferredIndianMale) {
    const match = voices.find(
      (v) =>
        v.name.toLowerCase().includes(preferred.toLowerCase()) ||
        v.lang.replace("_", "-").toLowerCase() === preferred.toLowerCase()
    );
    if (match) return match;
  }

  // 2. Any voice with Indian English / Hindi locale and male markers
  const indianMale = voices.find(
    (v) =>
      (v.lang.startsWith("en-IN") || v.lang.startsWith("hi") || /india/i.test(v.name)) &&
      /male|prabhat|madhav|hemant|ravi|arun|mohan|kunal|rajesh/i.test(v.name)
  );
  if (indianMale) return indianMale;

  // 3. Any Indian English / India voice (with masculine pitch = 0.82)
  const anyIndian = voices.find(
    (v) => v.lang.replace("_", "-").toLowerCase() === "en-in" || /india/i.test(v.name)
  );
  if (anyIndian) return anyIndian;

  // 4. Any English Male voice fallback (David, George, Oliver, Guy, etc.)
  const englishMale = voices.find(
    (v) => v.lang.startsWith("en") && /male|david|george|oliver|guy|mark/i.test(v.name)
  );
  if (englishMale) return englishMale;

  // 5. General English fallback
  return voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
}

/**
 * Stops any ongoing speech or human audio playback
 */
export function stopSpeaking() {
  if (typeof window !== "undefined") {
    window.__hiresense_utterance = null;
    if (window.__hiresense_resumeInterval) {
      clearInterval(window.__hiresense_resumeInterval);
      window.__hiresense_resumeInterval = null;
    }
  }
  activeUtterances = [];
  if (currentHumanAudio) {
    try {
      currentHumanAudio.pause();
      currentHumanAudio.currentTime = 0;
    } catch { }
    currentHumanAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch { }
  }
}

export const INDIAN_MALE_VOICE = {
  id: "en-IN",
  name: "Indian Male Voice",
  flag: "🇮🇳",
  accent: "Indian English (Male)",
  badge: "Real Human Voice",
  desc: "Clear & natural Indian corporate placement interviewer male voice",
};
export const INDIAN_HUMAN_VOICE = INDIAN_MALE_VOICE;

/**
 * Splits text into natural sentence chunks for smooth voice playback
 */
export function splitIntoNaturalPhrases(text) {
  if (!text || typeof text !== "string") return [];
  const clean = text.replace(/[*#_`]/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
  const chunks = [];

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if (trimmed.length <= 180) {
      chunks.push(trimmed);
    } else {
      const subParts = trimmed.match(/[^,;:]+[,;:]+|[^,;:]+$/g) || [trimmed];
      chunks.push(...subParts.map((p) => p.trim()).filter(Boolean));
    }
  }

  return chunks.filter((c) => c.length > 0);
}

export function isMobileDevice() {
  if (typeof window === "undefined" || !navigator) return false;
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || "");
}

/**
 * Pre-warms / unlocks both HTML5 Audio and Web Speech API on user gesture (tap/click).
 * Essential for mobile Safari & Android Chrome autoplay compliance.
 */
export function unlockAudioAndSpeech() {
  if (typeof window === "undefined") return;
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.resume();
      const silent = new SpeechSynthesisUtterance(" ");
      silent.volume = 0.01;
      silent.rate = 10;
      window.speechSynthesis.speak(silent);
    }
    const silentAudio = new Audio(
      "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"
    );
    silentAudio.volume = 0.01;
    silentAudio.play().catch(() => {});
  } catch (e) {
    console.warn("Audio unlock notice:", e);
  }
}

/**
 * Plays synthesized Web Audio cues (chimes, mic beeps) with zero external network dependencies.
 * Works seamlessly across mobile browsers and desktop without CORS or 404 risks.
 */
export function playAudioCue(type = "chime") {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "chime" || type === "start") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (type === "mic_on") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === "mic_off") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.16);
    }
  } catch (e) {
    // Ignore audio cue errors silently
  }
}

/**
 * Speaks the question aloud using a natural Indian Male interviewer voice.
 * Works flawlessly across all devices (Desktop Chrome/Edge/Mac, Android, and iOS Safari).
 */
export function speakQuestion(text, onEnd) {
  stopSpeaking();
  if (typeof window === "undefined") return;

  const cleanText = (text || "")
    .replace(/[*#_`]/g, " ")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  // Pre-emptively resume/unlock speech synthesis state synchronously
  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.resume();
    } catch {}
  }

  const phrases = splitIntoNaturalPhrases(cleanText);
  if (!phrases || phrases.length === 0) {
    speakWithIndianMaleSynthesis(cleanText, onEnd);
    return;
  }

  // Try real backend Indian male MP3 stream first (highest quality & universally supported on mobile)
  speakWithAudioStream(
    phrases,
    onEnd,
    () => {
      // Fallback seamlessly to native browser speech synthesis if backend is offline/unreachable
      speakWithIndianMaleSynthesis(cleanText, onEnd);
    }
  );
}

/**
 * Speaks text using the device's native high-performance SpeechSynthesis engine.
 * Guaranteed zero-latency, synchronous user gesture preservation, and Chromium GC protection.
 */
function speakWithIndianMaleSynthesis(text, onEnd) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(text);

    // CRITICAL: Bind to window so Chromium / WebKit garbage collection doesn't kill speech mid-sentence
    window.__hiresense_utterance = utterance;

    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices() || [];
    const maleVoice = getIndianMaleVoice();
    if (maleVoice) {
      utterance.voice = maleVoice;
      utterance.lang = maleVoice.lang || "en-IN";
    } else {
      const fallbackVoice =
        voices.find((v) => v.lang && (v.lang.startsWith("en-IN") || v.lang.startsWith("en_IN"))) ||
        voices.find((v) => v.lang && v.lang.startsWith("en-US")) ||
        voices.find((v) => v.lang && v.lang.startsWith("en")) ||
        voices[0];
      if (fallbackVoice) {
        utterance.voice = fallbackVoice;
        utterance.lang = fallbackVoice.lang;
      } else {
        utterance.lang = "en-IN";
      }
    }

    const cleanup = () => {
      window.__hiresense_utterance = null;
      if (window.__hiresense_resumeInterval) {
        clearInterval(window.__hiresense_resumeInterval);
        window.__hiresense_resumeInterval = null;
      }
    };

    utterance.onend = () => {
      cleanup();
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      console.warn("SpeechSynthesis utterance notice:", err);
      cleanup();
      if (onEnd) onEnd();
    };

    // Keep mobile Chrome / iOS Safari from pausing during playback
    if (window.__hiresense_resumeInterval) {
      clearInterval(window.__hiresense_resumeInterval);
    }
    window.__hiresense_resumeInterval = setInterval(() => {
      if (window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 2500);

    // Speak synchronously right now so mobile user gesture context is preserved!
    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("SpeechSynthesis speak call error:", err);
      cleanup();
      if (onEnd) onEnd();
    }
  } catch (err) {
    console.warn("Speech synthesis invocation failed:", err);
    if (onEnd) onEnd();
  }
}

/**
 * Audio stream playback via backend TTS proxy
 */
function speakWithAudioStream(phrases, onEnd, onFallback) {
  let phraseIndex = 0;
  let hasFailed = false;

  const playNext = () => {
    if (hasFailed) return;
    if (phraseIndex >= phrases.length) {
      currentHumanAudio = null;
      if (onEnd) onEnd();
      return;
    }

    const currentPhrase = phrases[phraseIndex++];
    const envBase =
      (typeof import.meta !== "undefined" && import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)) || "";
    let base = "/api";
    if (envBase) {
      base = envBase.endsWith("/api") ? envBase : `${envBase.replace(/\/+$/, "")}/api`;
    } else if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      base = "http://localhost:8080/api";
    }

    const audioUrl = `${base}/tts?lang=en-IN&text=${encodeURIComponent(currentPhrase)}`;
    const audio = new Audio(audioUrl);
    currentHumanAudio = audio;

    let timeoutId = setTimeout(() => {
      // If audio fails to load within 3s, fall back to speech synthesis immediately
      if (!audio.duration || audio.paused) {
        console.warn("Audio stream timed out, falling back to synthesis");
        hasFailed = true;
        currentHumanAudio = null;
        if (onFallback) onFallback();
      }
    }, 3000);

    audio.onplaying = () => {
      clearTimeout(timeoutId);
    };

    audio.onended = () => {
      clearTimeout(timeoutId);
      playNext();
    };

    audio.onerror = (err) => {
      clearTimeout(timeoutId);
      console.warn("Audio stream error, using fallback:", err);
      hasFailed = true;
      currentHumanAudio = null;
      if (onFallback) onFallback();
      else if (onEnd) onEnd();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((playErr) => {
        clearTimeout(timeoutId);
        console.warn("Audio play() blocked, using fallback:", playErr);
        hasFailed = true;
        currentHumanAudio = null;
        if (onFallback) onFallback();
        else if (onEnd) onEnd();
      });
    }
  };

  playNext();
}

/**
 * Plays a quick preview sample of the Indian Male interviewer voice
 */
export function playVoiceSample(firstArg, secondArg) {
  let onEnd = null;
  if (typeof firstArg === "function") onEnd = firstArg;
  else if (typeof secondArg === "function") onEnd = secondArg;

  const sample = "Hello! I am your AI placement interviewer. I will be asking your technical questions in natural Indian human voice.";
  speakQuestion(sample, onEnd);
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

export const INTERVIEW_TOPICS = {
  ALL: { id: "ALL", label: "Full Technical (Resume & Core Skills)", skillDesc: "Resume Skills, Full Technical Concepts & Projects" },
  JAVA: { id: "JAVA", label: "Java & Spring Boot", skillDesc: "Core Java, OOP, JVM Architecture, Collections, Multithreading, Spring Boot, Hibernate" },
  FRONTEND: { id: "FRONTEND", label: "Frontend Development", skillDesc: "React, JavaScript (ES6+), TypeScript, Virtual DOM, CSS/Tailwind, Web Performance, State Management" },
  BACKEND: { id: "BACKEND", label: "Backend & REST APIs", skillDesc: "Backend Architecture, REST APIs, Microservices, Spring Boot, Node.js, Authentication, Caching" },
  MYSQL: { id: "MYSQL", label: "MySQL & Databases", skillDesc: "MySQL, Relational Databases, SQL Queries, Joins, Indexing, Transactions & ACID, Normalization, Query Optimization" },
  DSA: { id: "DSA", label: "Data Structures & Algorithms", skillDesc: "DSA, Arrays, Strings, HashMaps, Trees, Graphs, Dynamic Programming, Recursion, Time & Space Complexity" },
  ENTC: { id: "ENTC", label: "ENTC / Embedded Systems & IoT", skillDesc: "Embedded C/C++, Microcontrollers (8051/ARM/STM32/ESP32/Arduino), IoT & MQTT, Protocols (UART, SPI, I2C, CAN), Sensors, VLSI/Verilog, DSP" },
  PYTHON: { id: "PYTHON", label: "Python & AI / Data Science", skillDesc: "Python, OOP, Data Structures in Python, Pandas, NumPy, Machine Learning Concepts, APIs" },
  CUSTOM: { id: "CUSTOM", label: "Custom Topic", skillDesc: "" },
};

/**
 * Generates interview questions using Gemini API or smart fallback based on target topic
 */
export async function generateAiQuestions({
  type,
  difficulty,
  count = 5,
  skills = [],
  targetRole = "Software Engineer",
  resumeText = "",
  focusTopic = "ALL",
  customTopic = "",
}) {
  const apiKey = getApiKey();
  const topicMeta = INTERVIEW_TOPICS[focusTopic] || INTERVIEW_TOPICS.ALL;
  const isCustom = focusTopic === "CUSTOM" && customTopic.trim();
  const effectiveTopic = isCustom ? customTopic.trim() : topicMeta.skillDesc || topicMeta.label;
  const skillList = skills.length > 0 ? skills.join(", ") : "Java, SQL, OOP, Data Structures";
  const resumeExcerpt = (resumeText || "").trim().slice(0, 2000);

  if (apiKey) {
    try {
      const difficultyGuidelines = {
        EASY: `DIFFICULTY LEVEL: EASY (Campus Fresher / Basic Placement Level)
- Ask direct, fundamental questions testing core conceptual clarity, basic definitions, or key differences.
- The question must be simple and friendly for college freshers.
- Examples: "What is the difference between an Array and a Linked List?", "Explain method overloading vs method overriding.", "What are the four pillars of OOP?"
- LENGTH CONSTRAINT: Strictly 1 to 2 short sentences (under 25-30 words).`,

        MEDIUM: `DIFFICULTY LEVEL: MEDIUM (Standard Technical Interview Round)
- Ask practical placement questions testing understanding of standard patterns, internal mechanics, or realistic use cases.
- Examples: "How does a HashMap resolve collisions internally?", "How would you detect a loop in a linked list?", "Explain the difference between an Abstract Class and an Interface."
- LENGTH CONSTRAINT: Strictly 1 to 2 clear sentences (under 35 words). Never write long paragraphs.`,

        HARD: `DIFFICULTY LEVEL: HARD (Product MNC / Advanced Round)
- Ask questions on algorithmic trade-offs, concurrency, caching, or memory optimization.
- Still keep it realistic for an oral interview.
- LENGTH CONSTRAINT: Strictly 1 to 2 concise sentences (under 40 words).`,
      };

      const prompt = `You are a friendly, realistic Technical Placement Interviewer conducting an oral interview with an engineering college student.
Round Type: ${type} (TECHNICAL or HR)
${difficultyGuidelines[difficulty] || difficultyGuidelines.MEDIUM}
${topicInstruction}
${contextInstructions}

CRITICAL RULES FOR SPOKEN ORAL INTERVIEW:
1. Every question MUST sound natural, like a real interviewer speaking aloud to a candidate.
2. KEEP EVERY QUESTION STRICTLY 1 TO 2 SHORT SENTENCES (under 35 words).
3. DO NOT write giant paragraphs, complex multi-line stories, or code templates.
4. Generate exactly ${count} distinct questions.

Return ONLY a valid JSON array of objects with the following schema:
[
  {
    "id": "ai_q_1",
    "type": "${type}",
    "difficulty": "${difficulty}",
    "skill": "${isCustom ? customTopic.trim() : (focusTopic !== "ALL" ? topicMeta.label : "Core Concept")}",
    "text": "The full interview question here",
    "keywords": ["key concept 1", "key concept 2", "key concept 3"]
  }
]
Do NOT include markdown backticks around JSON. Return pure JSON.`;

      const raw = await callGeminiApi({
        prompt,
        temperature: 0.6,
      });

      if (raw) {
        let parsed = null;
        try {
          const arrayMatch = raw.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            parsed = JSON.parse(arrayMatch[0]);
          } else {
            const clean = raw.replace(/```json|```/g, "").trim();
            const obj = JSON.parse(clean);
            parsed = Array.isArray(obj) ? obj : (obj.questions || obj.items || Object.values(obj)[0]);
          }
        } catch (parseErr) {
          console.warn("JSON parsing failed, raw was:", raw?.slice(0, 150));
        }

        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed
            .map((item, idx) => ({
              id: item.id || uid(`ai_q_${idx}`),
              type: item.type || type,
              difficulty: item.difficulty || difficulty,
              skill: item.skill || (isCustom ? customTopic.trim() : (focusTopic !== "ALL" ? topicMeta.label : "Core Concept")),
              text: item.text || item.question || item.title || "",
              keywords: Array.isArray(item.keywords) && item.keywords.length > 0
                ? item.keywords
                : [item.skill || "Technical Concept", "Implementation", "Trade-offs"],
            }))
            .filter((q) => q.text && q.text.length > 10);

          if (valid.length > 0) {
            return valid;
          }
        }
      }
    } catch (err) {
      console.warn("AI question generation failed, using fallback:", err);
    }
  }

  // Fallback to randomized local question bank
  await delay(250);

  const shuffleArray = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Dedicated Rich Fallback Banks for every topic so questions NEVER repeat
  if (focusTopic === "DSA") {
    const dsaPool = [
      {
        id: uid("dsa_1"),
        type,
        difficulty,
        skill: "Trees & Graphs",
        text: "How would you detect a cycle in a directed graph vs an undirected graph? Explain DFS with graph coloring and Kahn's algorithm (BFS).",
        keywords: ["DFS", "BFS", "cycle detection", "topological sort", "in-degree", "visited array"],
      },
      {
        id: uid("dsa_2"),
        type,
        difficulty,
        skill: "Dynamic Programming",
        text: "Explain the Longest Common Subsequence (LCS) problem. Walk through the 2D DP matrix state transition and how to optimize space to O(min(M, N)).",
        keywords: ["optimal substructure", "memoization", "tabulation", "state transition", "space optimization"],
      },
      {
        id: uid("dsa_3"),
        type,
        difficulty,
        skill: "Arrays & Two Pointers",
        text: "Given an array of integers, how do you find the maximum subarray sum (Kadane's algorithm)? What is the time and space complexity?",
        keywords: ["Kadane's algorithm", "current sum", "max so far", "O(N) time", "O(1) space"],
      },
      {
        id: uid("dsa_4"),
        type,
        difficulty,
        skill: "Heaps & Priority Queues",
        text: "How does a Min-Heap or Max-Heap maintain heap invariants during insertion and deletion? Walk through the heapify-up and heapify-down steps.",
        keywords: ["complete binary tree", "heapify", "O(log N)", "priority queue", "root extraction"],
      },
      {
        id: uid("dsa_5"),
        type,
        difficulty,
        skill: "Linked Lists",
        text: "Explain Floyd's Cycle-Finding Algorithm (Tortoise and Hare) to detect a loop in a linked list and find the starting node of the cycle.",
        keywords: ["slow and fast pointers", "Floyd's algorithm", "cycle start", "O(N) time", "O(1) space"],
      },
      {
        id: uid("dsa_6"),
        type,
        difficulty,
        skill: "Sliding Window",
        text: "How does the Sliding Window pattern work for solving the 'Longest Substring Without Repeating Characters'? Compare the brute-force vs O(N) window approach.",
        keywords: ["sliding window", "HashMap", "two pointers", "window bounds", "O(N)"],
      },
      {
        id: uid("dsa_7"),
        type,
        difficulty,
        skill: "Binary Search Trees",
        text: "How do you validate if a given binary tree is a valid Binary Search Tree (BST)? Why is simple local node check insufficient?",
        keywords: ["in-order traversal", "lower and upper bounds", "BST property", "recursion", "O(N)"],
      },
      {
        id: uid("dsa_8"),
        type,
        difficulty,
        skill: "Trie & String Algorithms",
        text: "What is a Trie (Prefix Tree) and why is it preferred over a HashMap for autocomplete systems and dictionary prefix searches?",
        keywords: ["prefix tree", "trie node", "character array", "prefix search", "O(L) time complexity"],
      },
    ];
    return shuffleArray(dsaPool).slice(0, count);
  }

  if (focusTopic === "PYTHON") {
    const pythonPool = [
      {
        id: uid("py_1"),
        type,
        difficulty,
        skill: "Python Core & Memory",
        text: "How does Python handle memory management and garbage collection? Explain reference counting and the cyclic garbage collector.",
        keywords: ["reference counting", "GIL", "cyclic references", "gc module", "heap allocations"],
      },
      {
        id: uid("py_2"),
        type,
        difficulty,
        skill: "Python Decorators & Generators",
        text: "Explain how Python decorators work internally using first-class functions and closures. How do generators with 'yield' save memory compared to lists?",
        keywords: ["decorators", "closures", "wrapper function", "generators", "yield keyword", "lazy evaluation"],
      },
      {
        id: uid("py_3"),
        type,
        difficulty,
        skill: "Django & FastAPI Backend",
        text: "Compare Django and FastAPI in terms of asynchronous support (ASGI vs WSGI), ORM, performance, and API schema generation.",
        keywords: ["Django ORM", "FastAPI", "async await", "Pydantic", "ASGI", "automatic OpenAPI docs"],
      },
      {
        id: uid("py_4"),
        type,
        difficulty,
        skill: "Concurrency & GIL",
        text: "What is the Global Interpreter Lock (GIL) in CPython? When should you use the threading module vs the multiprocessing module?",
        keywords: ["GIL", "CPU-bound tasks", "I/O-bound tasks", "threading", "multiprocessing", "processes"],
      },
      {
        id: uid("py_5"),
        type,
        difficulty,
        skill: "Python Full Stack Architecture",
        text: "In a Python full stack application (FastAPI/Django + React), how do you manage user authentication (JWT), CORS, and database connection pooling?",
        keywords: ["JWT", "CORS headers", "connection pooling", "SQLAlchemy", "RESTful endpoints", "state sync"],
      },
    ];
    return shuffleArray(pythonPool).slice(0, count);
  }

  if (focusTopic === "MYSQL") {
    const sqlPool = [
      {
        id: uid("sql_1"),
        type,
        difficulty,
        skill: "Database Indexing",
        text: "Explain how B-Tree indexes work in MySQL (InnoDB). What is the difference between a clustered index and a secondary (non-clustered) index?",
        keywords: ["B-Tree", "InnoDB", "clustered index", "primary key", "index lookup", "leaf pages"],
      },
      {
        id: uid("sql_2"),
        type,
        difficulty,
        skill: "ACID & Transactions",
        text: "Explain the four ACID properties in relational databases and walk through transaction isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable).",
        keywords: ["atomicity", "consistency", "isolation", "durability", "dirty read", "phantom read"],
      },
      {
        id: uid("sql_3"),
        type,
        difficulty,
        skill: "SQL Joins & Performance",
        text: "What is the difference between INNER JOIN, LEFT JOIN, and CROSS JOIN? How do you use EXPLAIN query execution plan to diagnose slow queries?",
        keywords: ["EXPLAIN plan", "index scan", "full table scan", "LEFT JOIN", "hash join"],
      },
      {
        id: uid("sql_4"),
        type,
        difficulty,
        skill: "Normalization",
        text: "Explain 1NF, 2NF, 3NF, and BCNF with concrete examples. When is denormalization preferred in production systems?",
        keywords: ["functional dependency", "partial dependency", "transitive dependency", "1NF", "2NF", "3NF"],
      },
    ];
    return shuffleArray(sqlPool).slice(0, count);
  }

  const pool = type === "HR" ? HR_QUESTIONS : TECHNICAL_QUESTIONS;

  // Filter pool by topic if specific topic selected
  let filteredPool = pool;
  if (focusTopic === "JAVA") {
    filteredPool = pool.filter((q) => /java|spring|oop|jvm|hibernate/i.test(q.skill + " " + q.text));
  } else if (focusTopic === "FRONTEND") {
    filteredPool = pool.filter((q) => /react|javascript|html|css|frontend|web/i.test(q.skill + " " + q.text));
  } else if (focusTopic === "BACKEND") {
    filteredPool = pool.filter((q) => /backend|spring|api|microservice|database/i.test(q.skill + " " + q.text));
  } else if (focusTopic === "ENTC") {
    // Return embedded / hardware / electronics fallback questions
    return shuffleArray([
      {
        id: uid("entc_1"),
        type,
        difficulty,
        skill: "Embedded Systems & Microcontrollers",
        text: "Explain the architectural difference between Harvard and Von Neumann architectures, and why Harvard is predominantly used in microcontrollers like ARM.",
        keywords: ["memory buses", "program and data memory", "ARM", "pipelining", "instruction fetch"],
      },
      {
        id: uid("entc_2"),
        type,
        difficulty,
        skill: "Communication Protocols",
        text: "Compare I2C, SPI, and UART protocols in terms of wiring, speed, master-slave configuration, and typical sensor interfacing use cases.",
        keywords: ["clock line", "synchronous vs asynchronous", "SDA SCL", "MISO MOSI", "baud rate"],
      },
      {
        id: uid("entc_3"),
        type,
        difficulty,
        skill: "IoT & Embedded C",
        text: "What is an Interrupt Service Routine (ISR)? Why should delay or blocking functions never be called inside an ISR?",
        keywords: ["interrupt latency", "non-blocking", "volatile keyword", "context switch", "hardware flags"],
      },
      {
        id: uid("entc_4"),
        type,
        difficulty,
        skill: "Sensors & Signal Processing",
        text: "How does an Analog-to-Digital Converter (ADC) work? Explain sampling rate, resolution (bits), and the Nyquist theorem.",
        keywords: ["quantization", "sampling frequency", "aliasing", "resolution", "Nyquist rate"],
      },
      {
        id: uid("entc_5"),
        type,
        difficulty,
        skill: "Microcontroller Peripherals",
        text: "Explain Pulse Width Modulation (PWM) and how duty cycle is utilized for motor speed control or LED dimming in embedded systems.",
        keywords: ["duty cycle", "frequency", "timers", "analog voltage approximation", "registers"],
      },
    ]).slice(0, count);
  }

  if (filteredPool.length < count) {
    filteredPool = pool;
  }

  const shuffled = shuffleArray(filteredPool);
  return shuffled.slice(0, count);
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

/**
 * Generates an AI-driven Aptitude or Technical placement test using Gemini,
 * with robust fallback to the local shuffled MCQ_QUESTIONS bank.
 */
export async function generateAiAptitudeTest({
  category = "aptitude",
  topic = "General Placement Aptitude",
  difficulty = "MEDIUM",
  count = 10,
  companyTarget = "",
}) {
  const apiKey = getApiKey();
  const validCount = Math.max(3, Math.min(25, Number(count) || 10));

  if (apiKey) {
    try {
      const companyInstruction = companyTarget
        ? `Target Company Pattern: Structure questions matching recent campus assessment patterns for ${companyTarget}.`
        : "Standard Indian MNC campus placement patterns (TCS NQT, Infosys, Cognizant, Wipro, Capgemini, Accenture).";

      const prompt = `You are a Senior Technical & Aptitude Placement Director at a premier engineering university.
Generate a high-quality placement test with exactly ${validCount} multiple-choice questions.

Test Configuration:
- Domain / Category: ${category.toUpperCase()}
- Focus Topic(s): ${topic}
- Difficulty Level: ${difficulty} (EASY, MEDIUM, or HARD)
- ${companyInstruction}

STRICT QUALITY RULES:
1. Every question must have exactly 4 plausible, unambiguous options.
2. Provide 'correctIndex' (0, 1, 2, or 3) indicating the single correct option.
3. For Quantitative/Math: ensure calculations are 100% mathematically correct and realistic for college placement tests.
4. For Logical Reasoning: ensure clear premise and logically sound conclusions.
5. For Technical: ensure verified syntax, standard libraries, and architectural principles.
6. Provide an informative step-by-step 'explanation' so students learn the underlying formula or logic.

Return ONLY a valid JSON array of objects conforming to this schema:
[
  {
    "id": "ai_mcq_1",
    "category": "${category}",
    "topic": "${topic}",
    "text": "Detailed question text...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Clear step-by-step explanation..."
  }
]
Do NOT wrap with markdown syntax or extra text. Pure JSON array only.`;

      const raw = await callGeminiApi({
        prompt,
        temperature: 0.35,
        responseMimeType: "application/json",
      });

      if (raw) {
        let parsed = null;
        try {
          const arrayMatch = raw.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            parsed = JSON.parse(arrayMatch[0]);
          } else {
            const clean = raw.replace(/```json|```/g, "").trim();
            const obj = JSON.parse(clean);
            parsed = Array.isArray(obj) ? obj : (obj.questions || obj.items || Object.values(obj)[0]);
          }
        } catch (e) {
          console.warn("AI MCQ parsing failed, raw was:", raw?.slice(0, 150));
        }

        if (Array.isArray(parsed) && parsed.length > 0) {
          const validated = parsed
            .filter((q) => q && q.text && Array.isArray(q.options) && q.options.length >= 2)
            .map((q, idx) => ({
              id: q.id || uid(`ai_mcq_${idx}`),
              category: (q.category || category).toLowerCase(),
              topic: q.topic || topic,
              text: q.text,
              options: q.options.slice(0, 4),
              correctIndex:
                typeof q.correctIndex === "number" &&
                q.correctIndex >= 0 &&
                q.correctIndex < q.options.length
                  ? q.correctIndex
                  : 0,
              explanation: q.explanation || "Detailed solution not provided.",
            }));

          if (validated.length >= 3) {
            return validated;
          }
        }
      }
    } catch (err) {
      console.warn("Gemini AI aptitude generation failed, falling back to local bank:", err);
    }
  }

  // Fallback to randomized local question bank
  await delay(250);
  let pool = MCQ_QUESTIONS;
  if (category && category !== "all") {
    const catFiltered = MCQ_QUESTIONS.filter(
      (q) => q.category.toLowerCase() === category.toLowerCase(),
    );
    if (catFiltered.length > 0) {
      pool = catFiltered;
    }
  }

  // Filter by topic if possible
  if (topic && topic !== "General Placement Aptitude") {
    const topicFiltered = pool.filter(
      (q) =>
        q.topic.toLowerCase().includes(topic.toLowerCase()) ||
        topic.toLowerCase().includes(q.topic.toLowerCase()),
    );
    if (topicFiltered.length >= 3) {
      pool = topicFiltered;
    }
  }

  // Thorough Fisher-Yates shuffle
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(0, validCount);
}

