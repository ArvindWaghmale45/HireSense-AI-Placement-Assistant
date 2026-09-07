import { useEffect, useState, useRef } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  listThreads,
  createThread,
  deleteThread,
  sendChatMessage,
} from "@/lib/api/assistant";
import { Bot, Send, Plus, Trash2, User, Sparkles } from "lucide-react";

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
  }, [threads, activeThreadId]);

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
    "Give me a 30-day placement preparation plan",
    "Explain OOP Polymorphism with Java examples",
    "How should I explain my final year project to HR?",
    "What are commonly asked SQL interview questions?",
  ];

  return (
    <>
      <PageHeader
        title="AI Career Assistant"
        subtitle="Ask anything about preparation, concepts, study plans, or placement rounds."
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr] h-[calc(100vh-220px)] min-h-[500px]">
        {/* Sidebar */}
        <Card className="flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-border">
            <Button onClick={handleNewChat} className="w-full gap-2" size="sm">
              <Plus className="size-4" /> New Conversation
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {threads.length === 0 ? (
              <p className="p-4 text-center text-xs text-muted-foreground">
                No chats yet. Click above to start one!
              </p>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                    activeThreadId === thread.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="truncate pr-2">{thread.title}</span>
                  <button
                    onClick={(e) => handleDelete(thread.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    title="Delete conversation"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!activeThread || activeThread.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <Sparkles className="size-6" />
                </div>
                <h3 className="font-semibold text-lg">How can I help your preparation today?</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
                  Ask conceptual doubts, request personalized schedules, or practice sample answers.
                </p>
                <div className="grid gap-2 sm:grid-cols-2 max-w-lg w-full text-left">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="p-3 rounded-lg border border-border text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                      {s}
                    </button>
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
                    <div className="size-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Bot className="size-4" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-4 py-3 max-w-[80%] text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground border border-border"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="size-8 shrink-0 rounded-full bg-secondary flex items-center justify-center text-foreground">
                      <User className="size-4" />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-border bg-card">
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
                placeholder="Ask about placement topics, DSA, Spring Boot, HR questions…"
                disabled={busy}
                className="flex-1"
              />
              <Button type="submit" disabled={busy || !input.trim()} size="icon">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
}
