import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  listThreads,
  createThread,
  deleteThread,
  sendChatMessage,
} from "@/lib/api/assistant";
import {
  Bot,
  Send,
  Plus,
  Trash2,
  User,
  Sparkles,
  Terminal,
  Copy,
  Check,
  Zap,
  Code2,
  ChevronRight,
} from "lucide-react";

export default function Assistant() {
  return (
    <AppShell>
      <AssistantBody />
    </AppShell>
  );
}

function AssistantBody() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const list = listThreads(user.id);
    setThreads(list);
    if (list.length > 0 && !activeThreadId) {
      setActiveThreadId(list[0].id);
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads, activeThreadId, busy]);

  if (!user) return null;

  const activeThread = threads.find((t) => t.id === activeThreadId) || null;

  const handleNewChat = () => {
    const thread = createThread(user.id);
    setThreads([thread, ...threads]);
    setActiveThreadId(thread.id);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteThread(id);
    const updated = threads.filter((t) => t.id !== id);
    setThreads(updated);
    if (activeThreadId === id) {
      setActiveThreadId(updated[0]?.id ?? null);
    }
  };

  const handleSend = async (textToSend) => {
    const messageText = textToSend ?? input;
    if (!messageText.trim() || busy) return;

    let currentId = activeThreadId;
    if (!currentId) {
      const newT = createThread(user.id);
      currentId = newT.id;
      setThreads([newT, ...threads]);
      setActiveThreadId(currentId);
    }

    setInput("");
    setBusy(true);

    try {
      const { thread } = await sendChatMessage(currentId, messageText, user.skills || []);
      setThreads((prev) =>
        prev.map((t) => (t.id === thread.id ? thread : t))
      );
    } finally {
      setBusy(false);
    }
  };

  const suggestions = [
    "Give me a 30-day placement preparation timetable for Java Full Stack",
    "Explain Polymorphism vs Abstraction with real Java production examples",
    "How do I explain my final year project architecture during an HR round?",
    "What are the most commonly asked SQL query questions in technical interviews?",
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        badge="Neural Career Cockpit"
        title="AI Career Assistant & Mentor"
        subtitle="24/7 technical interviewer & code tutor for DSA, system architecture, behavioral STAR stories, and placement study plans."
      />

      {/* Terminal Cockpit Container */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr] h-[calc(100vh-230px)] min-h-[520px]">
        {/* Left: Chat Session Threads Navigation */}
        <Card className="flex flex-col h-full overflow-hidden border-border/80 bg-card/80 backdrop-blur-md">
          <div className="p-3 border-b border-border/80 flex items-center justify-between">
            <Button onClick={handleNewChat} className="w-full gap-2 text-xs font-semibold shadow-xs" size="sm">
              <Plus className="size-3.5" /> New Session
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-none">
            {threads.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No active conversations yet. Click New Session above!
              </div>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                    activeThreadId === thread.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="truncate pr-2">{thread.title}</span>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(thread.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right: Cockpit Chat Display Area */}
        <Card className="flex flex-col h-full overflow-hidden border-border/80 bg-card relative shadow-sm">
          {/* Terminal Top Bar */}
          <div className="h-10 px-4 border-b border-border/80 bg-secondary/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-red-500/80" />
              <span className="size-2.5 rounded-full bg-amber-500/80" />
              <span className="size-2.5 rounded-full bg-emerald-500/80" />
              <span className="font-mono text-[11px] text-muted-foreground ml-2">
                hiresense-neural-shell: v2.4
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI Engine Online</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {!activeThread || activeThread.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                <div className="size-14 rounded-2xl bg-gradient-to-tr from-primary to-cyan-500 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 mb-4">
                  <Terminal className="size-7" />
                </div>
                <h3 className="font-display font-bold text-xl">How can I assist your placement prep today?</h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mt-1.5 mb-6 leading-relaxed">
                  Clarify DSA concepts, generate customized 30-day revision schedules, or rehearse answers for final rounds.
                </p>

                {/* Floating Suggestion Chips */}
                <div className="grid gap-2.5 sm:grid-cols-2 max-w-xl w-full text-left">
                  {suggestions.map((s) => (
                    <motion.button
                      key={s}
                      whileHover={{ y: -2, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSend(s)}
                      className="p-3 rounded-xl border border-border/80 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/60 text-xs text-muted-foreground hover:text-foreground transition-all flex items-center justify-between gap-2 text-left"
                    >
                      <span className="line-clamp-2">{s}</span>
                      <ChevronRight className="size-3.5 shrink-0 text-primary" />
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              activeThread.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="size-8 shrink-0 rounded-xl bg-gradient-to-tr from-primary to-cyan-500 text-primary-foreground flex items-center justify-center shadow-xs">
                      <Bot className="size-4" />
                    </div>
                  )}
                  <div
                    className={`rounded-xl px-4 py-3 max-w-[85%] text-xs sm:text-sm shadow-xs ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground font-medium"
                        : "bg-secondary/40 text-foreground border border-border/80"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <FormattedMessage content={msg.content} />
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="size-8 shrink-0 rounded-xl bg-secondary flex items-center justify-center text-foreground font-semibold text-xs border border-border">
                      <User className="size-4" />
                    </div>
                  )}
                </div>
              ))
            )}

            {busy && (
              <div className="flex gap-3 justify-start items-center">
                <div className="size-8 shrink-0 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <Bot className="size-4 animate-spin" />
                </div>
                <div className="rounded-xl px-4 py-2.5 bg-secondary/40 border border-border/80 text-xs text-muted-foreground flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary animate-ping" />
                  <span>Synthesizing placement response…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Control Console */}
          <div className="p-3 border-t border-border/80 bg-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Java concepts, DSA, system design, or behavioral questions…"
                disabled={busy}
                className="flex-1 text-xs sm:text-sm"
              />
              <Button type="submit" disabled={busy || !input.trim()} size="icon" className="shadow-xs">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}

function FormattedMessage({ content }) {
  if (!content) return null;

  // Split content by code blocks
  const segments = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed">
      {segments.map((seg, sIdx) => {
        if (seg.startsWith("```")) {
          const firstLineEnd = seg.indexOf("\n");
          const lang = seg.slice(3, firstLineEnd).trim();
          const code = seg.slice(firstLineEnd + 1, -3).trim();
          return <CodeSnippet key={sIdx} lang={lang} code={code} />;
        }

        const lines = seg.split("\n");
        const rendered = [];
        let currentList = [];

        const flushList = () => {
          if (currentList.length > 0) {
            rendered.push(
              <ul key={`list-${rendered.length}`} className="space-y-1 my-1.5 pl-1">
                {currentList.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground/90">
                    <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span className="flex-1">{renderInlineText(item)}</span>
                  </li>
                ))}
              </ul>
            );
            currentList = [];
          }
        };

        lines.forEach((rawLine, lIdx) => {
          const line = rawLine.trim();
          if (!line) {
            flushList();
            return;
          }

          // Bullet items
          if (/^[\*\-•]\s+/.test(line)) {
            currentList.push(line.replace(/^[\*\-•]\s+/, ""));
            return;
          }

          // Numbered list items
          if (/^\d+[\.\)]\s+/.test(line)) {
            flushList();
            const num = line.match(/^(\d+[\.\)])\s+/)[1];
            const text = line.replace(/^\d+[\.\)]\s+/, "");
            rendered.push(
              <div key={`num-${lIdx}`} className="flex items-start gap-2 my-1 text-foreground/90">
                <span className="font-semibold text-primary text-xs shrink-0 mt-0.5">{num}</span>
                <span className="flex-1">{renderInlineText(text)}</span>
              </div>
            );
            return;
          }

          // Headings
          if (/^#{1,6}\s+/.test(line)) {
            flushList();
            const heading = line.replace(/^#{1,6}\s+/, "");
            rendered.push(
              <h4 key={`h-${lIdx}`} className="font-bold text-foreground text-xs sm:text-sm mt-3 mb-1">
                {renderInlineText(heading)}
              </h4>
            );
            return;
          }

          flushList();
          rendered.push(
            <p key={`p-${lIdx}`} className="my-1 text-foreground/90">
              {renderInlineText(line)}
            </p>
          );
        });

        flushList();
        return <div key={sIdx}>{rendered}</div>;
      })}
    </div>
  );
}

function CodeSnippet({ lang, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code snippet copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-border/80 bg-slate-950 text-xs text-slate-100 shadow-md">
      <div className="px-3.5 py-1.5 bg-slate-900 flex items-center justify-between border-b border-slate-800 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <Code2 className="size-3 text-cyan-400" />
          {lang || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto font-mono leading-relaxed text-cyan-300">
        {code}
      </pre>
    </div>
  );
}

function renderInlineText(text) {
  if (!text) return "";
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      const cleanBold = token.slice(2, -2).replace(/\*/g, "").trim();
      return (
        <strong key={idx} className="font-semibold text-foreground">
          {cleanBold}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-muted/80 font-mono text-xs text-primary font-medium">
          {token.slice(1, -1)}
        </code>
      );
    }
    const cleaned = token.replace(/\*{2,}/g, "").replace(/^#{1,6}\s*/g, "");
    return cleaned;
  });
}
