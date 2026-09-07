import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { askAssistant } from "@/lib/api/assistant";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { playAudioCue } from "@/lib/api/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  X,
  Send,
  Trash2,
  Mic,
  MicOff,
  ExternalLink,
  Loader2,
} from "lucide-react";

const QUICK_PROMPTS = [
  "☕ Explain Java Collections vs Arrays",
  "💼 How to answer 'Tell me about yourself'",
  "⚙️ Spring Boot Microservices architecture",
  "🧩 Two Sum DSA optimal approach",
];

const STORAGE_KEY = "hiresense:floating_chat_history";

export function FloatingChatbot() {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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
          "Hello! 👋 I'm your HireSense AI Placement Mentor. Ask me any placement question, code doubts, interview concepts, or HR prep!",
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

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
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content:
            "I ran into a problem fetching the answer. Please check your Gemini API key in Interview Setup or try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: "Chat cleared. What placement topic would you like to explore?",
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  // Hide floating chatbot on full dedicated assistant page to avoid redundant widget
  if (location.pathname === "/assistant") {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* EXPANDED CHAT POPUP */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] max-w-[380px] h-[490px] sm:h-[530px] rounded-2xl shadow-2xl border border-border/90 bg-background/95 backdrop-blur-xl flex flex-col overflow-hidden text-foreground"
          >
            {/* Header */}
            <div className="p-3.5 border-b border-border/80 bg-secondary/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-white shadow-xs">
                  <Bot className="size-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-xs text-foreground">HireSense AI Mentor</h3>
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Placement & Technical Coach</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  onClick={handleClear}
                  title="Clear conversation"
                >
                  <Trash2 className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  asChild
                  title="Open full-page assistant"
                >
                  <Link to="/assistant">
                    <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed break-words shadow-xs ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-xs"
                        : "bg-secondary/70 border border-border/80 text-foreground rounded-bl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-secondary/70 border border-border/80 text-muted-foreground rounded-2xl rounded-bl-xs px-3.5 py-2 flex items-center gap-1.5 shadow-xs">
                    <Loader2 className="size-3 animate-spin text-primary" />
                    <span className="text-[11px]">Thinking…</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions (shown when 1 message) */}
            {messages.length <= 2 && !loading && (
              <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-none">
                {QUICK_PROMPTS.map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(qp.replace(/^[^\s]+\s/, ""))}
                    className="shrink-0 text-[10px] px-2.5 py-1 rounded-full border border-border/80 bg-secondary/40 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-2.5 border-t border-border/80 bg-background/90 flex items-center gap-1.5"
            >
              {isSpeechSupported && (
                <Button
                  type="button"
                  size="icon"
                  variant={isListening ? "destructive" : "ghost"}
                  onClick={toggleMic}
                  className="size-8 shrink-0"
                  title={isListening ? "Stop listening" : "Voice input"}
                >
                  {isListening ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
                </Button>
              )}

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening…" : "Ask placement question…"}
                className="h-8 text-xs bg-secondary/30"
                disabled={loading}
              />

              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || loading}
                className="size-8 shrink-0"
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
              className="relative"
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
