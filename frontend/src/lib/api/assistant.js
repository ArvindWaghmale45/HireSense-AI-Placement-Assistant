import { delay, readStore, uid, writeStore } from "./store";
import { getApiKey, callGeminiApi } from "./ai";

const THREADS_KEY = "chat-threads";

function all() {
  return readStore(THREADS_KEY, []);
}

function persist(threads) {
  writeStore(THREADS_KEY, threads);
}

/** GET /api/assistant/threads */
export function listThreads(userId) {
  return all()
    .filter((thread) => thread.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getThread(id) {
  return all().find((thread) => thread.id === id) ?? null;
}

/** POST /api/assistant/threads */
export function createThread(userId) {
  const thread = {
    id: uid("thr"),
    userId,
    title: "New conversation",
    messages: [],
    updatedAt: new Date().toISOString(),
  };
  persist([thread, ...all()]);
  return thread;
}

export function deleteThread(id) {
  persist(all().filter((thread) => thread.id !== id));
}

export function saveThread(thread) {
  const threads = all();
  const index = threads.findIndex((item) => item.id === thread.id);
  if (index === -1) persist([thread, ...threads]);
  else {
    threads[index] = thread;
    persist(threads);
  }
}

/**
 * Calls Gemini 3.5 Flash for true conversational placement mentoring
 */
export async function askAssistant(question, skills = [], history = []) {
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      const systemInstruction = `You are "HireSense AI Placement Mentor", an expert technical career coach and mock interviewer helping college students crack engineering campus drives (TCS Digital, Infosys, Amazon, Cognizant, Startups).
Candidate Core Skills: ${(skills || []).join(", ") || "Java, Spring Boot, SQL, DSA, OOP"}.

INSTRUCTIONS:
1. Provide accurate, high-impact technical explanations with concise code snippets (Java, SQL, JavaScript, Python).
2. Answer interview preparation questions, explain algorithmic complexity, and structure behavioral HR responses using the STAR method.
3. Be encouraging, clear, and professional.
4. Format your output with markdown bold headings, bullet points, and syntax-highlighted code blocks.`;

      // Build context from previous conversation turns
      const recentHistory = (history || []).slice(-6);
      const historyContext = recentHistory.length > 0
        ? recentHistory.map((m) => `${m.role === "user" ? "Student" : "Mentor"}: ${m.content}`).join("\n\n") + "\n\n"
        : "";

      const prompt = `${historyContext}Student: ${question}\n\nMentor:`;

      const reply = await callGeminiApi({
        prompt,
        systemInstruction,
        responseMimeType: null,
        temperature: 0.6,
      });

      if (reply && reply.trim()) {
        return {
          id: uid("msg"),
          role: "assistant",
          content: reply.trim(),
          createdAt: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn("AI Assistant Gemini call failed, using fallback:", err);
    }
  }

  // Fallback response
  await delay(400);
  return {
    id: uid("msg"),
    role: "assistant",
    content: fallbackReply(question, skills),
    createdAt: new Date().toISOString(),
  };
}

function fallbackReply(question, skills = []) {
  const q = question.toLowerCase();
  const skillLine = skills.length ? skills.slice(0, 5).join(", ") : "Java, SQL, OOP, DSA";

  if (q.includes("30") && q.includes("day")) {
    return `### 30-Day Campus Placement Strategy\n\n- **Week 1: Core Fundamentals**: Deep dive into ${skillLine}.\n- **Week 2: Data Structures & Algorithms**: Arrays, Strings, HashMaps, Two-Pointers, and Recursion.\n- **Week 3: Database & Projects**: SQL queries, Joins, Indexing, and architecture of your top resume project.\n- **Week 4: Mock Rounds & HR**: Complete 2 HireSense mock interviews daily, study common HR questions using the STAR framework.`;
  }
  if (q.includes("java") && (q.includes("prepare") || q.includes("interview"))) {
    return `### Top Java Placement Topics to Revise\n\n1. **OOP Concepts**: Real examples of Abstraction vs Interface, Runtime Polymorphism.\n2. **Collections Framework**: Internal working of \`HashMap\` (buckets, hashing, collisions), \`ArrayList\` vs \`LinkedList\`.\n3. **Multithreading**: Synchronization, \`volatile\`, \`Thread\` vs \`Runnable\`.\n4. **JVM Architecture**: Heap vs Stack, Garbage Collection phases.\n5. **Spring Boot**: Inversion of Control (IoC), Dependency Injection, and Spring Data JPA annotations.`;
  }
  return `I am here to guide your placement preparation for **${skillLine}**!\n\nFeel free to ask me:\n- To explain any technical concept or code snippet\n- For a 1-week or 30-day study roadmap\n- To conduct a quick Q&A on your resume projects\n- For tips on clearing aptitude or technical rounds!`;
}

export function userMessage(content) {
  return { id: uid("msg"), role: "user", content, createdAt: new Date().toISOString() };
}

export async function sendChatMessage(threadId, content, skills = []) {
  const userMsg = userMessage(content);
  const thread = getThread(threadId);
  if (!thread) throw new Error("Thread not found");

  const title = thread.messages.length === 0 ? content.slice(0, 32) : thread.title;
  thread.title = title;
  thread.messages.push(userMsg);
  thread.updatedAt = new Date().toISOString();
  saveThread(thread);

  const assistantMsg = await askAssistant(content, skills, thread.messages.slice(0, -1));
  thread.messages.push(assistantMsg);
  thread.updatedAt = new Date().toISOString();
  saveThread(thread);

  return { thread, reply: assistantMsg };
}
