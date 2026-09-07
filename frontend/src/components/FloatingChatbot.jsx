import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { askAssistant } from "@/lib/api/assistant";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { playAudioCue, speakQuestion, stopSpeaking, unlockAudioAndSpeech } from "@/lib/api/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Sparkles,
  X,
  Send,
  Trash2,
  Mic,
  MicOff,
  ExternalLink,
  Loader2,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Code2,
  User,
  Zap,
} from "lucide-react";

const CATEGORY_PROMPTS = {
  "🔥 Top Picks": [
    "☕ Java Collections vs Arrays with examples",
    "💼 How to answer 'Tell me about yourself'",
    "⚙️ Spring Boot Microservices architecture",
    "🧩 Two Sum DSA optimal approach",
  ],
  "☕ Java & OOP": [
    "Difference between Method Overloading and Overriding in Java?",
    "How does HashMap work internally in Java?",
    "Explain OOP pillars with real-world analogies",
    "What is Java Garbage Collection and memory leaks?",
  ],
  "🧩 DSA": [
    "How to detect a loop in a Linked List (Floyd's Cycle)?",
    "Explain DFS vs BFS with time complexity",
    "Binary Search optimal edge cases and code",
    "Top 5 Dynamic Programming placement patterns",
  ],
  "💼 HR Round": [
    "How to structure answers using the STAR method?",
    "What are your greatest strengths and weaknesses?",
    "Why should we hire you over other campus candidates?",
    "Where do you see yourself in 3 to 5 years?",
  ],
};

const STORAGE_KEY = "hiresense:floating_chat_history";

export function FloatingChatbot() {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState("🔥 Top Picks");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { }
    return [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! 👋 I'm your HireSense AI Placement Mentor.\n\nAsk me anything about Java, Spring Boot, DSA problems, behavioral HR rounds, or company interview questions!",
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  // Persist session messages
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch { }
  }, [messages]);

  // Speech recognition for voice input
  const {
    isListening,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    lang: "en-IN",
    onResult: (spokenText) => {
      setInput(spokenText);
    },
  });

  const toggleMic = () => {
    unlockAudioAndSpeech();
    if (isListening) {
      playAudioCue("mic_off");
      stopListening();
    } else {
      playAudioCue("mic_on");
      if (isSpeechSupported) {
        startListening();
      }
    }
  };

  const handleSend = async (textToSend) => {
    const q = (textToSend || input).trim();
    if (!q || loading) return;

    if (isListening) {
      stopListening();
    }

    const userMsg = {
      id: "usr-" + Date.now(),
      role: "user",
      content: q,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    playAudioCue("chime");

    try {
      const reply = await askAssistant(q, user?.skills || [], messages);
      setMessages((prev) => [...prev, reply]);
      playAudioCue("chime");
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content:
            "I ran into a brief connection delay. Please ask your question again or explore another placement topic!",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    stopSpeaking();
    setSpeakingMsgId(null);
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: "Chat cleared. What placement topic would you like to explore?",
        createdAt: new Date().toISOString(),
      },
    ]);
    toast.info("Conversation cleared");
  };

  const handleToggleSpeak = (msgId, text) => {
    unlockAudioAndSpeech();
    if (speakingMsgId === msgId) {
      stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      stopSpeaking();
      setSpeakingMsgId(msgId);
      // Clean markdown symbols for natural speech
      const speechText = text.replace(/```[\s\S]*?```/g, " Code snippet provided in chat. ").replace(/[*#_`]/g, " ");
      speakQuestion(speechText, () => setSpeakingMsgId(null));
    }
  };

  // Hide on dedicated full assistant page
  if (location.pathname === "/assistant") {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* EXPANDABLE CHAT POPUP */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={`absolute bottom-16 right-0 rounded-2xl shadow-2xl border border-border/90 bg-background/95 backdrop-blur-xl flex flex-col overflow-hidden text-foreground transition-all duration-300 ${
              isExpanded
                ? "w-[calc(100vw-2rem)] sm:w-[580px] h-[580px] sm:h-[660px]"
                : "w-[calc(100vw-2rem)] sm:w-[410px] h-[510px] sm:h-[560px]"
            }`}
          >
            {/* Top Header */}
            <div className="p-3 sm:p-3.5 border-b border-border/80 bg-secondary/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-white shadow-xs">
                  <Bot className="size-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-xs text-foreground">HireSense AI Mentor</h3>
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span>Placement & Tech Coach</span>
                    <span className="text-primary font-mono font-medium">· Inbuilt AI</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Expand / Minimize Toggle (Desktop) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:inline-flex size-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? "Collapse to compact size" : "Expand chat window"}
                >
                  {isExpanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                </Button>

                {/* Clear Chat */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  onClick={handleClear}
                  title="Clear conversation"
                >
                  <Trash2 className="size-3.5" />
                </Button>

                {/* Full-screen Assistant Link */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  asChild
                  title="Open full page assistant"
                >
                  <Link to="/assistant">
                    <ExternalLink className="size-3.5" />
                  </Link>
                </Button>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    stopSpeaking();
                    setSpeakingMsgId(null);
                    setIsOpen(false);
                  }}
                  title="Close chat"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Topic Filter Chips */}
            <div className="px-3 py-1.5 border-b border-border/60 bg-muted/20 flex gap-1 overflow-x-auto scrollbar-none shrink-0">
              {Object.keys(CATEGORY_PROMPTS).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground font-medium shadow-xs"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
              {messages.map((m) => (
                <ChatMessageCard
                  key={m.id}
                  message={m}
                  isSpeaking={speakingMsgId === m.id}
                  onToggleSpeak={() => handleToggleSpeak(m.id, m.content)}
                  onQuickPrompt={(promptText) => handleSend(promptText)}
                />
              ))}

              {loading && (
                <div className="flex justify-start items-center gap-2 text-muted-foreground animate-pulse">
                  <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Bot className="size-3.5" />
                  </div>
                  <div className="bg-secondary/70 border border-border/80 rounded-2xl rounded-bl-xs px-3.5 py-2 flex items-center gap-2 shadow-xs">
                    <Loader2 className="size-3 animate-spin text-primary" />
                    <span className="text-[11px] font-medium">Crafting expert answer…</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Starter Chips */}
            {messages.length <= 2 && !loading && (
              <div className="px-3 py-2 border-t border-border/40 bg-secondary/15 flex flex-col gap-1.5 shrink-0">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="size-3 text-primary" /> Suggested Questions:
                </span>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                  {CATEGORY_PROMPTS[activeCategory].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt)}
                      className="shrink-0 text-[10.5px] px-2.5 py-1 rounded-lg border border-border/80 bg-background hover:bg-primary/10 hover:border-primary/50 text-foreground transition-all shadow-xs text-left max-w-[240px] truncate"
                      title={prompt}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-2.5 border-t border-border/80 bg-background/90 flex items-center gap-1.5 shrink-0"
            >
              {isSpeechSupported && (
                <Button
                  type="button"
                  size="icon"
                  variant={isListening ? "destructive" : "ghost"}
                  onClick={toggleMic}
                  className={`size-8 shrink-0 ${isListening ? "animate-pulse" : ""}`}
                  title={isListening ? "Stop voice listening" : "Speak question (Speech-to-Text)"}
                >
                  {isListening ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
                </Button>
              )}

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening to your voice…" : "Ask placement question (e.g. OOP, DSA, HR)..."}
                className="h-8.5 text-xs bg-secondary/30 placeholder:text-muted-foreground/70"
                disabled={loading}
              />

              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || loading}
                className="size-8.5 shrink-0 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
                title="Send message"
              >
                <Send className="size-3.5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING TRIGGER BUTTON */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center size-13 rounded-full bg-gradient-to-tr from-primary to-violet-600 text-white shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Open AI Placement Chatbot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="size-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative flex items-center justify-center"
            >
              <Bot className="size-6" />
              <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-emerald-400 border-2 border-background animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Small badge label on desktop */}
        {!isOpen && (
          <span className="hidden sm:inline-flex absolute -top-2 -left-2 bg-emerald-500 text-[9px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 rounded-full shadow-xs">
            AI
          </span>
        )}
      </motion.button>
    </div>
  );
}

/**
 * Renders individual chat message with rich formatting, code blocks, voice playback, and copy action
 */
function ChatMessageCard({ message, isSpeaking, onToggleSpeak, onQuickPrompt }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success("Copied message to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"} group`}>
      {!isUser && (
        <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="size-3.5" />
        </div>
      )}

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[88%]`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 leading-relaxed break-words shadow-xs text-xs ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-xs"
              : "bg-secondary/70 border border-border/80 text-foreground rounded-bl-xs"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <RichFormattedContent content={message.content} />
          )}
        </div>

        {/* Assistant Action Bar (Listen, Copy) */}
        {!isUser && message.id !== "welcome" && (
          <div className="flex items-center gap-1 mt-1 px-1 opacity-80 hover:opacity-100 transition-opacity text-[10px] text-muted-foreground">
            <button
              type="button"
              onClick={onToggleSpeak}
              className={`flex items-center gap-1 hover:text-primary transition-colors px-1.5 py-0.5 rounded ${
                isSpeaking ? "text-primary font-semibold" : ""
              }`}
              title={isSpeaking ? "Stop listening" : "Listen to answer aloud"}
            >
              {isSpeaking ? <VolumeX className="size-3 text-destructive" /> : <Volume2 className="size-3" />}
              <span>{isSpeaking ? "Stop Voice" : "Listen"}</span>
            </button>

            <span>·</span>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 hover:text-foreground transition-colors px-1.5 py-0.5 rounded"
              title="Copy answer"
            >
              {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Rich Formatted Content: parses code snippets, bullet points, numbered lists, and bold text
 */
function RichFormattedContent({ content }) {
  if (!content) return null;

  // Split by code blocks ```lang ... ```
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: content.substring(lastIndex, match.index) });
    }
    parts.push({ type: "code", lang: match[1] || "code", code: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.substring(lastIndex) });
  }

  return (
    <div className="space-y-2">
      {parts.map((part, idx) => {
        if (part.type === "code") {
          return <ChatCodeBlock key={idx} lang={part.lang} code={part.code} />;
        }

        const lines = part.value.split("\n");
        const rendered = [];
        let currentList = [];

        const flushList = () => {
          if (currentList.length > 0) {
            rendered.push(
              <ul key={`list-${rendered.length}`} className="space-y-1 my-1 pl-1">
                {currentList.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-foreground/90">
                    <span className="size-1 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span className="flex-1 leading-normal">{renderInlineTokens(item)}</span>
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

          // Bullet items (* or -)
          if (/^[\*\-•]\s+/.test(line)) {
            currentList.push(line.replace(/^[\*\-•]\s+/, ""));
            return;
          }

          // Numbered items
          if (/^\d+[\.\)]\s+/.test(line)) {
            flushList();
            const num = line.match(/^(\d+[\.\)])\s+/)[1];
            const text = line.replace(/^\d+[\.\)]\s+/, "");
            rendered.push(
              <div key={`num-${lIdx}`} className="flex items-start gap-1.5 my-1 text-foreground/90">
                <span className="font-semibold text-primary text-[11px] shrink-0 mt-0.5">{num}</span>
                <span className="flex-1 leading-normal">{renderInlineTokens(text)}</span>
              </div>
            );
            return;
          }

          // Headings
          if (/^#{1,6}\s+/.test(line)) {
            flushList();
            const heading = line.replace(/^#{1,6}\s+/, "");
            rendered.push(
              <h4 key={`h-${lIdx}`} className="font-bold text-foreground text-xs mt-2 mb-0.5 text-primary">
                {renderInlineTokens(heading)}
              </h4>
            );
            return;
          }

          flushList();
          rendered.push(
            <p key={`p-${lIdx}`} className="my-1 text-foreground/90 leading-relaxed">
              {renderInlineTokens(line)}
            </p>
          );
        });

        flushList();
        return <div key={idx}>{rendered}</div>;
      })}
    </div>
  );
}

/**
 * Code Block with syntax styling and 1-click Copy button
 */
function ChatCodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-xl overflow-hidden border border-border/80 bg-slate-950 text-xs text-slate-100 shadow-md">
      <div className="px-3 py-1 bg-slate-900 flex items-center justify-between border-b border-slate-800 text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1 text-cyan-400">
          <Code2 className="size-3" />
          {lang}
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
      <pre className="p-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-cyan-200">
        {code}
      </pre>
    </div>
  );
}

/**
 * Formats inline bold text (**text**) and code (`code`)
 */
function renderInlineTokens(text) {
  if (!text) return "";
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      const clean = token.slice(2, -2).replace(/\*/g, "").trim();
      return (
        <strong key={idx} className="font-semibold text-foreground">
          {clean}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code key={idx} className="px-1 py-0.5 rounded bg-muted font-mono text-[10.5px] text-primary font-medium">
          {token.slice(1, -1)}
        </code>
      );
    }
    return token.replace(/\*{2,}/g, "").replace(/^#{1,6}\s*/g, "");
  });
}
