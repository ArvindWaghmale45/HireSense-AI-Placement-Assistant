import { delay, readStore, uid, writeStore } from "./store";

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

function reply(question, skills = []) {
  const q = question.toLowerCase();
  const skillLine = skills.length ? skills.slice(0, 5).join(", ") : "your core subjects";

  if (q.includes("30") && q.includes("day")) {
    return `**30-day placement plan**\n\n- Days 1-7: Core language revision (${skillLine}) plus 2 aptitude sets a day.\n- Days 8-14: DBMS and SQL, write 20 queries from scratch.\n- Days 15-21: Data structures — arrays, strings, linked lists, hash maps, trees.\n- Days 22-26: One mock interview a day in HireSense, review every low score.\n- Days 27-30: HR answers, resume polish, and two full mock rounds.`;
  }
  if (q.includes("polymorphism")) {
    return `**Polymorphism** means one interface, many forms.\n\n- *Compile time* (overloading): same method name, different parameters.\n- *Runtime* (overriding): a child class redefines a parent method and the JVM picks the implementation at runtime.\n\nExample: a \`Shape\` reference pointing to \`Circle\` or \`Square\` calls each one's own \`area()\`.`;
  }
  if (q.includes("java") && (q.includes("prepare") || q.includes("interview"))) {
    return `**Preparing for a Java interview**\n\n1. OOP pillars with examples you can code on paper.\n2. Collections: List vs Set vs Map, and when to use each.\n3. Exception handling, threads basics, and the string pool.\n4. JVM memory and garbage collection at a high level.\n5. Two projects you can explain end to end.\n\nRun a Technical mock interview on Medium difficulty and review the feedback.`;
  }
  if (q.includes("resume")) {
    return `**Resume tips**\n\n- One page, clean sections: summary, skills, projects, education.\n- Every bullet: action verb + what you built + result.\n- Match the keywords in the job description.\n\nUpload your resume in the Resume Analyzer for a scored breakdown.`;
  }
  if (q.includes("skill") || q.includes("learn")) {
    return `Based on your profile (${skillLine}), a solid order is: strengthen one language deeply, then data structures, then DBMS/SQL, then one framework. Check the Skill Analysis page to see where your practice scores are lowest.`;
  }
  return `Here is how I would approach that:\n\n1. Break the goal into weekly milestones.\n2. Practise actively — write code and answers, don't just read.\n3. Use HireSense mock interviews to test yourself, then fix the weakest area first.\n\nYour listed skills: ${skillLine}. Ask me about a specific topic and I'll go deeper.`;
}

/** POST /api/assistant/chat — swap for the backend AI endpoint later. */
export async function askAssistant(question, skills) {
  await delay(700);
  return {
    id: uid("msg"),
    role: "assistant",
    content: reply(question, skills),
    createdAt: new Date().toISOString(),
  };
}

export function userMessage(content) {
  return { id: uid("msg"), role: "user", content, createdAt: new Date().toISOString() };
}

export async function sendChatMessage(threadId, content, skills = []) {
  const userMsg = userMessage(content);
  const thread = getThread(threadId);
  if (!thread) throw new Error("Thread not found");

  const title = thread.messages.length === 0 ? content.slice(0, 30) : thread.title;
  thread.title = title;
  thread.messages.push(userMsg);
  thread.updatedAt = new Date().toISOString();
  saveThread(thread);

  const assistantMsg = await askAssistant(content, skills);
  thread.messages.push(assistantMsg);
  thread.updatedAt = new Date().toISOString();
  saveThread(thread);

  return { thread, reply: assistantMsg };
}
