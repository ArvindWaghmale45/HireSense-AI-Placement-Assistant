import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import { getMcqs, listAttempts, saveAttempt } from "@/lib/api/prep";
import { HR_PROMPTS } from "@/lib/data/questions";
import { cn } from "@/lib/utils";
import {
  BrainCircuit,
  Target,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Zap,
} from "lucide-react";

export default function Prepare() {
  return (
    <AppShell>
      <PrepareBody />
    </AppShell>
  );
}

function PrepareBody() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    if (user) setAttempts(listAttempts(user.id));
  }, [user]);

  if (!user) return null;

  const refresh = () => setAttempts(listAttempts(user.id));

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Placement Skill Arena"
        title="Interactive 3D Practice Flashcards"
        subtitle="Master quantitative aptitude, technical concepts, and HR behavioral questions with instant explanation reveals."
      />

      <Tabs defaultValue="aptitude" className="space-y-6">
        <TabsList className="bg-secondary/50 p-1 rounded-xl border border-border/80">
          <TabsTrigger value="aptitude" className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Aptitude Arena
          </TabsTrigger>
          <TabsTrigger value="technical" className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Technical Arena
          </TabsTrigger>
          <TabsTrigger value="hr" className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            HR Behavioral Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="aptitude">
          <FlashcardQuiz category="aptitude" userId={user.id} onSaved={refresh} />
        </TabsContent>
        <TabsContent value="technical">
          <FlashcardQuiz category="technical" userId={user.id} onSaved={refresh} />
        </TabsContent>
        <TabsContent value="hr">
          <Card className="border-border/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <BookOpen className="size-5 text-primary" /> HR Behavioral Answer Frameworks
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                  STAR Method Guidance
                </Badge>
              </div>
              <CardDescription>
                Expand each question to see what hiring managers and HR directors evaluate in your response.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                {HR_PROMPTS.map((prompt) => (
                  <AccordionItem
                    key={prompt.id}
                    value={prompt.id}
                    className="border border-border/80 rounded-xl px-4 py-1 data-[state=open]:border-primary/40 data-[state=open]:bg-secondary/20 transition-colors"
                  >
                    <AccordionTrigger className="text-left font-semibold text-sm hover:no-underline">
                      {prompt.text}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/40">
                      <div className="p-3 rounded-lg bg-card/60 border border-border/60">
                        <span className="font-semibold text-primary block mb-1 text-[11px] uppercase tracking-wider">
                          Key Evaluation Criteria:
                        </span>
                        {prompt.guidance}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quiz History */}
      <Card className="border-border/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Award className="size-4 text-primary" /> Recent Test Attempts
            </CardTitle>
            <span className="text-xs text-muted-foreground">Logged on candidate profile</span>
          </div>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No test attempts completed yet. Finish a quiz above to start your practice streak!
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {attempts.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Badge variant="secondary" className="text-[10px] font-mono capitalize">
                      {item.category}
                    </Badge>
                    <span className="text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">
                      {item.correct}/{item.total} correct
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      ({Math.round((item.correct / item.total) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FlashcardQuiz({ category, userId, onSaved }) {
  const questions = useMemo(() => getMcqs(category), [category]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const current = questions[index];

  const next = async () => {
    if (picked === null || !current) return;
    const gotIt = picked === current.correctIndex;
    const total = correct + (gotIt ? 1 : 0);
    setCorrect(total);
    setPicked(null);

    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      setDone(true);
      await saveAttempt({
        userId,
        category,
        topic: current.topic,
        total: questions.length,
        correct: total,
      });
      onSaved();
      toast.success(`Arena completed! You scored ${total}/${questions.length}`);
    }
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    setDone(false);
  };

  if (!questions.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No practice questions configured for this track yet.
        </CardContent>
      </Card>
    );
  }

  if (done) {
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="size-14 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Award className="size-7" />
          </div>
          <CardTitle className="text-2xl font-display font-extrabold">Practice Arena Complete!</CardTitle>
          <CardDescription>
            You scored {correct} out of {questions.length} questions correctly ({pct}%).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 max-w-md mx-auto text-center pt-2">
          <Progress value={pct} className="h-3.5" />
          <Button onClick={restart} className="gap-2 shadow-md shadow-primary/20">
            <RotateCcw className="size-4" /> Try Arena Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!current) return null;
  const answered = picked !== null;

  return (
    <div className="space-y-4">
      {/* Animated Progress Milestones Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`size-2.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "bg-primary scale-125 ring-2 ring-primary/40"
                  : i < index
                  ? "bg-emerald-500"
                  : "bg-muted"
              }`}
              title={`Question ${i + 1}`}
            />
          ))}
        </div>
        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
          Question {index + 1} of {questions.length}
        </span>
      </div>

      {/* 3D Modular Flashcard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, rotateX: 6, y: 15 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          exit={{ opacity: 0, rotateX: -6, y: -15 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ perspective: 1000 }}
        >
          <Card className="border-border/90 shadow-lg relative overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border/60 bg-secondary/15">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary" className="font-medium text-xs">
                  {current.topic}
                </Badge>
                <span className="text-[11px] font-mono text-muted-foreground">
                  ID: #{category.slice(0, 3).toUpperCase()}-{index + 1}
                </span>
              </div>
              <CardTitle className="mt-2 text-lg sm:text-xl font-display leading-snug">
                {current.text}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-3.5">
              {current.options.map((option, i) => {
                const isCorrect = i === current.correctIndex;
                const isSelected = picked === i;
                return (
                  <motion.button
                    key={option}
                    type="button"
                    disabled={answered}
                    whileHover={!answered ? { scale: 1.01, x: 3 } : {}}
                    whileTap={!answered ? { scale: 0.99 } : {}}
                    onClick={() => setPicked(i)}
                    className={cn(
                      "w-full rounded-xl border p-4 text-left text-sm font-medium transition-all flex items-center justify-between gap-3",
                      !answered && "border-border/80 bg-secondary/20 hover:border-primary/60 hover:bg-secondary/40",
                      answered && isCorrect && "border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs",
                      answered && !isCorrect && isSelected && "border-destructive/60 bg-destructive/10 text-destructive",
                      answered && !isCorrect && !isSelected && "border-border/60 opacity-50",
                    )}
                  >
                    <span>{option}</span>
                    {answered && isCorrect && (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    )}
                    {answered && !isCorrect && isSelected && (
                      <XCircle className="size-4 shrink-0 text-destructive" />
                    )}
                  </motion.button>
                );
              })}

              {/* Card-Flip Explanation Reveal */}
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-foreground/90 space-y-1 mt-3"
                >
                  <span className="font-semibold text-primary flex items-center gap-1.5 text-xs">
                    <Sparkles className="size-3.5" /> Conceptual Explanation:
                  </span>
                  <p>{current.explanation}</p>
                </motion.div>
              )}

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={next}
                  disabled={!answered}
                  className="gap-2 font-semibold shadow-sm shadow-primary/20"
                >
                  {index + 1 === questions.length ? "Finish Arena" : "Next Flashcard"}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
