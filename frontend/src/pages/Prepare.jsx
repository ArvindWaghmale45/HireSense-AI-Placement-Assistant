import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import {
  CURATED_TESTS,
  deleteSavedTest,
  getCuratedTestQuestions,
  getMcqs,
  listAttempts,
  listSavedTests,
  saveAttempt,
  saveGeneratedTest,
  shuffleArray,
} from "@/lib/api/prep";
import { generateAiAptitudeTest } from "@/lib/api/ai";
import { HR_PROMPTS } from "@/lib/data/questions";
import { cn } from "@/lib/utils";
import {
  BrainCircuit,
  Target,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Award,
  Zap,
  Clock,
  Shuffle,
  Play,
  Calculator,
  Code2,
  Database,
  Layers,
  Loader2,
  TrendingUp,
  Check,
  Trash2,
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
  const [savedTests, setSavedTests] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState("all");

  useEffect(() => {
    if (user) {
      setAttempts(listAttempts(user.id));
      setSavedTests(listSavedTests(user.id));
    }
  }, [user]);

  if (!user) return null;

  const refreshData = () => {
    setAttempts(listAttempts(user.id));
    setSavedTests(listSavedTests(user.id));
  };
  const refreshAttempts = refreshData;

  // Merged list of user saved AI tests + pre-configured curated tests
  const allTests = useMemo(() => {
    return [...savedTests, ...CURATED_TESTS];
  }, [savedTests]);

  // Starts any test (curated or AI-generated) with fresh shuffled questions
  const startTest = (test) => {
    const questions = test.isAiGenerated
      ? shuffleArray(test.questions)
      : getCuratedTestQuestions(test.id);

    if (!questions || questions.length === 0) {
      toast.error("No questions available for this test track.");
      return;
    }
    setActiveTest({
      id: test.id,
      title: test.title,
      category: test.category,
      topicCategory: test.topicCategory || "General",
      questions,
      durationMins: test.durationMins || Math.ceil(questions.length * 1.5),
      isAiGenerated: !!test.isAiGenerated,
    });
  };

  // Handles launch of AI generated test and adds to saved catalog state
  const handleAiTestGenerated = (savedTestData) => {
    setSavedTests((prev) => [savedTestData, ...prev.filter((t) => t.id !== savedTestData.id)]);
    setIsAiModalOpen(false);
    toast.success("AI Test saved to All Tests catalog! Starting test...");
    startTest(savedTestData);
  };

  const handleDeleteSavedTest = (e, testId) => {
    e.stopPropagation();
    deleteSavedTest(testId);
    setSavedTests((prev) => prev.filter((t) => t.id !== testId));
    toast.success("AI Test removed from All Tests catalog.");
  };

  const filteredTests = useMemo(() => {
    return allTests.filter((t) => {
      if (catalogFilter === "all") return true;
      if (catalogFilter === "ai") return !!t.isAiGenerated;
      return t.category === catalogFilter;
    });
  }, [allTests, catalogFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          badge="Placement Skill Arena"
          title="MNC Aptitude & Technical Assessment"
          subtitle="Take verified campus mock tests, shuffle question banks infinitely, or generate dynamic AI tests."
        />
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => setIsAiModalOpen(true)}
            className="gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 shadow-md shadow-primary/25"
          >
            <Sparkles className="size-4 animate-pulse text-amber-300" />
            Generate AI Aptitude Test
          </Button>
        </div>
      </div>

      {/* Active Test Arena or Catalog View */}
      {activeTest ? (
        <ActiveTestPlayer
          test={activeTest}
          userId={user.id}
          onExit={() => {
            setActiveTest(null);
            refreshData();
          }}
          onCompleted={refreshData}
          onRestartCurated={() => {
            if (activeTest.isAiGenerated) {
              setActiveTest((prev) => ({
                ...prev,
                questions: shuffleArray(prev.questions),
              }));
            } else {
              const questions = getCuratedTestQuestions(activeTest.id);
              setActiveTest((prev) => ({
                ...prev,
                questions,
              }));
            }
          }}
          onOpenAiGenerator={() => setIsAiModalOpen(true)}
        />
      ) : (
        <Tabs defaultValue="tests" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1 rounded-xl border border-border/80">
            <TabsTrigger
              value="tests"
              className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Target className="size-3.5 mr-1.5" /> All Tests ({allTests.length})
            </TabsTrigger>
            <TabsTrigger
              value="flashcards"
              className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Zap className="size-3.5 mr-1.5" /> Rapid Flashcards
            </TabsTrigger>
            <TabsTrigger
              value="hr"
              className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BookOpen className="size-3.5 mr-1.5" /> HR Behavioral Guide
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Award className="size-3.5 mr-1.5" /> Attempts & History
            </TabsTrigger>
          </TabsList>

          {/* Test Catalog Tab */}
          <TabsContent value="tests" className="space-y-5">
            {/* Catalog Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/80 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Filter Track:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    size="sm"
                    variant={catalogFilter === "all" ? "default" : "outline"}
                    className="h-7 text-xs rounded-lg px-2.5"
                    onClick={() => setCatalogFilter("all")}
                  >
                    All Tests ({allTests.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={catalogFilter === "aptitude" ? "default" : "outline"}
                    className="h-7 text-xs rounded-lg px-2.5"
                    onClick={() => setCatalogFilter("aptitude")}
                  >
                    Aptitude & Reasoning ({allTests.filter((t) => t.category === "aptitude").length})
                  </Button>
                  <Button
                    size="sm"
                    variant={catalogFilter === "technical" ? "default" : "outline"}
                    className="h-7 text-xs rounded-lg px-2.5"
                    onClick={() => setCatalogFilter("technical")}
                  >
                    Technical Core ({allTests.filter((t) => t.category === "technical").length})
                  </Button>
                  <Button
                    size="sm"
                    variant={catalogFilter === "ai" ? "default" : "outline"}
                    className={cn(
                      "h-7 text-xs rounded-lg px-2.5 gap-1.5",
                      catalogFilter === "ai"
                        ? "bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground"
                        : "border-primary/40 text-primary hover:bg-primary/10",
                    )}
                    onClick={() => setCatalogFilter("ai")}
                  >
                    <Sparkles className="size-3 text-amber-400" />
                    AI Generated ({savedTests.length})
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shuffle className="size-3.5 text-primary" /> Questions shuffle randomly every test run
              </div>
            </div>

            {/* Test Cards Grid */}
            {filteredTests.length === 0 ? (
              <Card className="border-dashed border-border/80 p-8 text-center bg-card/60">
                <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="size-6 text-amber-400" />
                </div>
                <h3 className="text-base font-semibold mb-1">No Tests in this Category Yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                  {catalogFilter === "ai"
                    ? "You haven't generated any custom AI tests yet. Click below to synthesize your first placement test!"
                    : "No placement tests found matching your selected filter."}
                </p>
                <Button onClick={() => setIsAiModalOpen(true)} className="gap-2 text-xs">
                  <Sparkles className="size-3.5" /> Generate AI Test Now
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTests.map((test) => {
                  const IconComponent = test.isAiGenerated
                    ? BrainCircuit
                    : test.category === "technical"
                    ? test.id.includes("java")
                      ? Code2
                      : Database
                    : test.id.includes("quant")
                    ? Calculator
                    : test.id.includes("logical")
                    ? BrainCircuit
                    : BookOpen;

                  return (
                    <motion.div
                      key={test.id}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className={cn(
                          "h-full flex flex-col justify-between transition-all shadow-xs hover:shadow-md bg-card/90",
                          test.isAiGenerated
                            ? "border-primary/40 bg-gradient-to-br from-card via-card to-primary/5 hover:border-primary/70"
                            : "border-border/80 hover:border-primary/50",
                        )}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5">
                              {test.isAiGenerated ? (
                                <Badge className="bg-primary/20 text-primary border-primary/30 font-mono text-[10px] flex items-center gap-1">
                                  <Sparkles className="size-2.5 text-amber-400" /> AI GENERATED
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="font-mono text-[10px] uppercase tracking-wider"
                                >
                                  {test.topicCategory}
                                </Badge>
                              )}
                              {test.createdAt && (
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {new Date(test.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] font-mono",
                                  test.difficulty?.toLowerCase() === "easy" && "border-emerald-500/40 text-emerald-500",
                                  test.difficulty?.toLowerCase() === "medium" && "border-amber-500/40 text-amber-500",
                                  test.difficulty?.toLowerCase() === "hard" && "border-rose-500/40 text-rose-500",
                                )}
                              >
                                {test.difficulty}
                              </Badge>
                              {test.isAiGenerated && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => handleDeleteSavedTest(e, test.id)}
                                  title="Delete saved test"
                                  className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "p-2.5 rounded-xl shrink-0 mt-0.5",
                                test.isAiGenerated ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary",
                              )}
                            >
                              <IconComponent className="size-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-base font-semibold leading-tight line-clamp-1">
                                {test.title}
                              </CardTitle>
                              <span className="text-[11px] text-primary/80 font-medium block mt-0.5 line-clamp-1">
                                {test.badge || test.topicCategory}
                              </span>
                            </div>
                          </div>
                          <CardDescription className="text-xs line-clamp-2 mt-2">
                            {test.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-0 space-y-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                            <span className="flex items-center gap-1">
                              <Layers className="size-3.5 text-primary" /> {test.count || test.questions?.length} Questions
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="size-3.5 text-muted-foreground" /> ~{test.durationMins} mins
                            </span>
                          </div>

                          <Button
                            onClick={() => startTest(test)}
                            className={cn(
                              "w-full gap-2 font-semibold shadow-xs",
                              test.isAiGenerated && "bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-primary-foreground",
                            )}
                          >
                            <Play className="size-3.5 fill-current" /> Start Test
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}

                {/* Special AI Generator Card in Grid (when on 'all' or 'ai') */}
                {(catalogFilter === "all" || catalogFilter === "ai") && (
                  <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                    <Card className="h-full flex flex-col justify-between border-dashed border-primary/50 bg-gradient-to-br from-primary/5 via-card to-indigo-500/10 hover:border-primary transition-all shadow-xs hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge className="bg-primary/20 text-primary border-primary/30 font-mono text-[10px]">
                            AI ENGINE
                          </Badge>
                          <Sparkles className="size-4 text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-primary/15 text-primary shrink-0 mt-0.5">
                            <BrainCircuit className="size-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold leading-tight">
                              Generate Custom AI Test
                            </CardTitle>
                            <span className="text-[11px] text-primary font-medium block mt-0.5">
                              On-Demand Synthesis
                            </span>
                          </div>
                        </div>
                        <CardDescription className="text-xs mt-2">
                          Need questions on specific topics or company patterns? Generate a fresh test saved directly to this list.
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <Button
                          onClick={() => setIsAiModalOpen(true)}
                          variant="outline"
                          className="w-full gap-2 border-primary/40 hover:bg-primary hover:text-primary-foreground font-semibold shadow-xs"
                        >
                          <Sparkles className="size-3.5" /> Configure & Generate
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Flashcard Practice Tab */}
          <TabsContent value="flashcards" className="space-y-4">
            <FlashcardPractice userId={user.id} onSaved={refreshData} />
          </TabsContent>

          {/* HR Guide Tab */}
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

          {/* Test History Tab */}
          <TabsContent value="history">
            <QuizHistory attempts={attempts} />
          </TabsContent>
        </Tabs>
      )}

      {/* AI Test Generator Dialog */}
      <AiTestGeneratorModal
        open={isAiModalOpen}
        onOpenChange={setIsAiModalOpen}
        onGenerated={handleAiTestGenerated}
        userId={user.id}
      />
    </div>
  );
}

/**
 * Full Interactive Test Player with question card, instant answer checking, explanation,
 * timer, score celebration, and new shuffle retries.
 */
function ActiveTestPlayer({
  test,
  userId,
  onExit,
  onCompleted,
  onRestartCurated,
  onOpenAiGenerator,
}) {
  const questions = test.questions || [];
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [done, setDone] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer effect
  useEffect(() => {
    if (done) return;
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [done]);

  const current = questions[index];
  const isAnswered = picked !== null;

  const handleSelectOption = (optionIndex) => {
    if (isAnswered) return;
    setPicked(optionIndex);
  };

  const handleNext = async () => {
    if (picked === null || !current) return;

    const isCorrect = picked === current.correctIndex;
    const answerRecord = {
      questionId: current.id,
      questionText: current.text,
      topic: current.topic,
      picked,
      correctIndex: current.correctIndex,
      isCorrect,
      explanation: current.explanation,
      options: current.options,
    };

    const nextAnswers = [...userAnswers, answerRecord];
    setUserAnswers(nextAnswers);

    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setPicked(null);
    } else {
      // Completed!
      setDone(true);
      const totalCorrect = nextAnswers.filter((a) => a.isCorrect).length;
      await saveAttempt({
        userId,
        category: test.category || "aptitude",
        topic: test.title,
        total: questions.length,
        correct: totalCorrect,
        timeSpentSec: elapsedSeconds,
      });
      onCompleted();
      toast.success(`Assessment finished! Score: ${totalCorrect}/${questions.length}`);
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setPicked(null);
    setUserAnswers([]);
    setDone(false);
    setElapsedSeconds(0);
    onRestartCurated();
    toast.info("Reshuffled! Test restarted with a fresh sequence of questions.");
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
  };

  // Test Completed View
  if (done) {
    const totalCorrect = userAnswers.filter((a) => a.isCorrect).length;
    const pct = Math.round((totalCorrect / questions.length) * 100);

    return (
      <div className="space-y-6">
        <Card className="border-primary/30 bg-gradient-to-br from-card via-card/95 to-primary/10 shadow-lg p-6">
          <CardHeader className="text-center pb-3">
            <div className="size-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-3 ring-8 ring-primary/10">
              <Award className="size-8" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-display font-extrabold">
              Assessment Completed!
            </CardTitle>
            <CardDescription className="text-sm">
              {test.title} • {questions.length} Questions Completed in {formatTime(elapsedSeconds)}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 max-w-lg mx-auto text-center">
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
              <div className="text-4xl font-extrabold text-foreground mb-1">
                {totalCorrect} <span className="text-xl text-muted-foreground font-normal">/ {questions.length}</span>
              </div>
              <div className="text-sm font-semibold text-primary mb-3">{pct}% Accuracy</div>
              <Progress value={pct} className="h-3" />
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed">
              {pct >= 80
                ? "🌟 Outstanding performance! Your concepts and problem-solving speed meet top MNC campus cutoff benchmarks."
                : pct >= 60
                ? "👍 Solid effort! Review the detailed solutions below to solidify your understanding of tricky formulas."
                : "💡 Good practice session. Aptitude requires repetition. Retake this test with fresh shuffled questions."}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button onClick={handleRestart} className="gap-2 shadow-md shadow-primary/20">
                <Shuffle className="size-4" /> Retake With Shuffled Questions
              </Button>
              <Button onClick={onOpenAiGenerator} variant="outline" className="gap-2">
                <Sparkles className="size-4 text-primary" /> Generate AI Test
              </Button>
              <Button onClick={onExit} variant="ghost" className="gap-2">
                <ArrowLeft className="size-4" /> Return to Catalog
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Solutions Breakdown */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary" /> Answer Explanations & Review ({userAnswers.length} Questions)
            </CardTitle>
            <CardDescription>
              Carefully verify each answer and read the underlying concepts to reinforce your placement preparation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userAnswers.map((ans, idx) => (
              <div
                key={ans.questionId || idx}
                className={cn(
                  "p-4 rounded-xl border text-xs space-y-2.5 transition-all",
                  ans.isCorrect
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-destructive/30 bg-destructive/5",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Q{idx + 1} • {ans.topic}
                    </Badge>
                    <p className="font-semibold text-sm text-foreground pt-1">{ans.questionText}</p>
                  </div>
                  {ans.isCorrect ? (
                    <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shrink-0 text-[10px]">
                      Correct (+1)
                    </Badge>
                  ) : (
                    <Badge className="bg-destructive/20 text-destructive border-destructive/30 shrink-0 text-[10px]">
                      Incorrect (0)
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-card/80 border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">Your Choice:</span>
                    <span
                      className={cn(
                        "font-medium",
                        ans.isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
                      )}
                    >
                      {ans.options[ans.picked] || "Unanswered"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-card/80 border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">Correct Answer:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {ans.options[ans.correctIndex]}
                    </span>
                  </div>
                </div>

                <div className="pt-1 text-muted-foreground bg-secondary/30 p-2.5 rounded-lg border border-border/40 leading-relaxed">
                  <span className="font-semibold text-primary inline-flex items-center gap-1 mr-1.5 text-[11px]">
                    <Sparkles className="size-3" /> Solution:
                  </span>
                  {ans.explanation}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="space-y-4">
      {/* Top Test Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={onExit}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back to Catalog
          </Button>
          <div className="h-4 w-[1px] bg-border" />
          <div>
            <h3 className="text-sm font-semibold text-foreground leading-none">{test.title}</h3>
            <span className="text-[11px] text-muted-foreground">
              {test.isAiGenerated ? "AI Generated Dynamic Test" : "Curated Campus Placement Assessment"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary/60 text-xs font-mono text-muted-foreground">
            <Clock className="size-3.5 text-primary" /> {formatTime(elapsedSeconds)}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRestart}
            title="Reshuffle and restart test"
            className="h-8 gap-1.5 text-xs border-border/80"
          >
            <RotateCcw className="size-3.5" /> Reshuffle
          </Button>
        </div>
      </div>

      {/* Progress Dots / Question Sequence Indicator */}
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

      {/* Active Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Card className="border-border/90 shadow-lg relative overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border/60 bg-secondary/15">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary" className="font-medium text-xs">
                  {current.topic}
                </Badge>
                <Badge variant="outline" className="text-[11px] font-mono text-muted-foreground">
                  Q #{index + 1}
                </Badge>
              </div>
              <CardTitle className="mt-2 text-lg sm:text-xl font-display leading-snug">
                {current.text}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-3.5">
              <div className="space-y-2.5">
                {current.options.map((option, i) => {
                  const isCorrect = i === current.correctIndex;
                  const isSelected = picked === i;
                  return (
                    <motion.button
                      key={option}
                      type="button"
                      disabled={isAnswered}
                      whileHover={!isAnswered ? { scale: 1.008, x: 3 } : {}}
                      whileTap={!isAnswered ? { scale: 0.99 } : {}}
                      onClick={() => handleSelectOption(i)}
                      className={cn(
                        "w-full rounded-xl border p-4 text-left text-sm font-medium transition-all flex items-center justify-between gap-3",
                        !isAnswered &&
                          "border-border/80 bg-secondary/20 hover:border-primary/60 hover:bg-secondary/40",
                        isAnswered &&
                          isCorrect &&
                          "border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs",
                        isAnswered &&
                          !isCorrect &&
                          isSelected &&
                          "border-destructive/60 bg-destructive/10 text-destructive",
                        isAnswered && !isCorrect && !isSelected && "border-border/60 opacity-50",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="size-6 rounded-full flex items-center justify-center text-xs font-mono bg-card border border-border/80 shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                      )}
                      {isAnswered && !isCorrect && isSelected && (
                        <XCircle className="size-4 shrink-0 text-destructive" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Instant Explanation Reveal */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl border border-primary/25 bg-primary/5 p-4 text-xs leading-relaxed text-foreground/90 space-y-1 mt-4"
                >
                  <span className="font-semibold text-primary flex items-center gap-1.5 text-xs">
                    <Sparkles className="size-3.5" /> Concept & Calculation Explanation:
                  </span>
                  <p>{current.explanation}</p>
                </motion.div>
              )}

              <div className="pt-3 flex items-center justify-between border-t border-border/40 mt-2">
                <span className="text-xs text-muted-foreground">
                  {isAnswered ? "Answer revealed. Press next to proceed." : "Select an answer above."}
                </span>
                <Button
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="gap-2 font-semibold shadow-sm shadow-primary/20"
                >
                  {index + 1 === questions.length ? "Finish Assessment" : "Next Question"}
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

/**
 * AI Test Generator Modal
 * Lets candidate choose category, topic, difficulty, question count, and target company pattern.
 * Saves generated tests directly to the "All Tests" catalog for persistent practice.
 */
function AiTestGeneratorModal({ open, onOpenChange, onGenerated, userId }) {
  const [category, setCategory] = useState("aptitude");
  const [topic, setTopic] = useState("Time & Work, Speed, Probability");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [count, setCount] = useState(10);
  const [companyTarget, setCompanyTarget] = useState("");
  const [loading, setLoading] = useState(false);

  const topicPresets = [
    { label: "Quant (Time, Work & Speed)", value: "Time & Work, Speed, Distance, Trains" },
    { label: "Quant (Profit, CI & Ratios)", value: "Profit and Loss, Simple & Compound Interest, Ratios" },
    { label: "Logical (Series & Relations)", value: "Number Series, Blood Relations, Syllogisms" },
    { label: "Verbal (Grammar & Vocab)", value: "Error Spotting, Synonyms, Sentence Correction" },
    { label: "Core Java & OOP", value: "Java OOP, Memory Management, Collections, Multithreading" },
    { label: "DBMS & SQL", value: "SQL Queries, ACID Properties, Indexing, Normalization" },
  ];

  const companyPresets = ["TCS NQT", "Infosys", "Wipro", "Cognizant", "Capgemini", "Amazon"];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      toast.info("Generating placement questions with AI...");
      const questions = await generateAiAptitudeTest({
        category,
        topic: topic || "General Campus Aptitude",
        difficulty,
        count,
        companyTarget,
      });

      if (!questions || questions.length === 0) {
        toast.error("Could not generate questions. Please try again.");
        return;
      }

      const savedTest = await saveGeneratedTest({
        id: `ai-${Date.now()}`,
        title: `${companyTarget ? companyTarget + " " : ""}${topic || "AI Generated"} Test`,
        category,
        topicCategory: companyTarget ? companyTarget : "AI Synthesis",
        companyTarget,
        badge: companyTarget ? `${companyTarget} Pattern` : "AI Synthesis",
        description: `Custom ${difficulty.toLowerCase()} assessment on ${topic || "Campus Placement"}${companyTarget ? ` adhering to ${companyTarget} hiring patterns` : ""}.`,
        difficulty: difficulty.charAt(0) + difficulty.slice(1).toLowerCase(),
        count: questions.length,
        durationMins: Math.ceil(questions.length * 1.5),
        questions,
        userId,
      });

      onGenerated(savedTest);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate test. Using local shuffled fallback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BrainCircuit className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-display">Generate AI Placement Test</DialogTitle>
              <DialogDescription className="text-xs">
                Leverage Google Gemini to synthesize custom aptitude, reasoning, or technical tests.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Domain Category Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Test Domain</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "aptitude", label: "Aptitude & Reasoning" },
                { id: "technical", label: "Core Technical (Java/DB)" },
                { id: "all", label: "Comprehensive Mock" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "p-2.5 rounded-xl border text-xs font-semibold text-center transition-all",
                    category === c.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/80 bg-secondary/20 hover:bg-secondary/40 text-muted-foreground",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Preset Topics */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Focus Topic / Syllabus</Label>
              <span className="text-[10px] text-muted-foreground">Click a preset or type below</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pb-1">
              {topicPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setTopic(preset.value)}
                  className={cn(
                    "text-[10px] px-2 py-1 rounded-lg border transition-all",
                    topic === preset.value
                      ? "bg-primary/20 border-primary text-primary font-semibold"
                      : "bg-secondary/40 border-border/70 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Time & Work, Speed & Distance, Clocks, Java Memory"
              className="text-xs"
            />
          </div>

          {/* Target MNC Pattern */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Target MNC Assessment Pattern (Optional)</Label>
            <div className="flex flex-wrap gap-1.5">
              {companyPresets.map((comp) => (
                <button
                  key={comp}
                  type="button"
                  onClick={() => setCompanyTarget(companyTarget === comp ? "" : comp)}
                  className={cn(
                    "text-[10px] px-2.5 py-1 rounded-lg border transition-all",
                    companyTarget === comp
                      ? "bg-indigo-500/20 border-indigo-500 text-indigo-400 font-semibold"
                      : "bg-secondary/30 border-border/60 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {companyTarget === comp && <Check className="size-3 inline mr-1" />}
                  {comp}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty and Question Count */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Difficulty Level</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {["EASY", "MEDIUM", "HARD"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      "p-2 rounded-lg border text-[11px] font-semibold text-center transition-all",
                      difficulty === d
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/80 bg-secondary/20 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Question Count</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    className={cn(
                      "p-2 rounded-lg border text-[11px] font-semibold text-center transition-all",
                      count === num
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/80 bg-secondary/20 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={handleGenerate}
            className="gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-xs font-semibold shadow-md shadow-primary/25"
          >
            {loading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Synthesizing Test...
              </>
            ) : (
              <>
                <Sparkles className="size-3.5 text-amber-300" />
                Generate & Start Test
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Rapid Flashcard Practice Component
 */
function FlashcardPractice({ userId, onSaved }) {
  const [category, setCategory] = useState("aptitude");
  const [topic, setTopic] = useState("all");
  const [shuffleTrigger, setShuffleTrigger] = useState(0);

  const questions = useMemo(() => {
    const raw = getMcqs(category, topic === "all" ? null : topic, true);
    return raw;
  }, [category, topic, shuffleTrigger]);

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const current = questions[index];

  const handleNext = async () => {
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
      toast.success(`Practice completed! You scored ${total}/${questions.length}`);
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    setDone(false);
    setShuffleTrigger((n) => n + 1);
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
          <CardTitle className="text-2xl font-display font-extrabold">Flashcards Complete!</CardTitle>
          <CardDescription>
            You answered {correct} out of {questions.length} questions correctly ({pct}%).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 max-w-md mx-auto text-center pt-2">
          <Progress value={pct} className="h-3.5" />
          <Button onClick={handleRestart} className="gap-2 shadow-md shadow-primary/20">
            <Shuffle className="size-4" /> Shuffle & Practice Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!current) return null;
  const answered = picked !== null;

  return (
    <div className="space-y-4">
      {/* Category selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/80">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={category === "aptitude" ? "default" : "outline"}
            className="h-7 text-xs rounded-lg px-2.5"
            onClick={() => {
              setCategory("aptitude");
              setIndex(0);
              setPicked(null);
            }}
          >
            Aptitude Bank ({getMcqs("aptitude", null, false).length})
          </Button>
          <Button
            size="sm"
            variant={category === "technical" ? "default" : "outline"}
            className="h-7 text-xs rounded-lg px-2.5"
            onClick={() => {
              setCategory("technical");
              setIndex(0);
              setPicked(null);
            }}
          >
            Technical Bank ({getMcqs("technical", null, false).length})
          </Button>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRestart}
          className="h-7 text-xs gap-1.5 text-muted-foreground"
        >
          <Shuffle className="size-3.5" /> Shuffle Bank
        </Button>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {questions.slice(0, 25).map((_, i) => (
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
          Card {index + 1} of {questions.length}
        </span>
      </div>

      {/* Flashcard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="border-border/90 shadow-lg relative overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border/60 bg-secondary/15">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary" className="font-medium text-xs">
                  {current.topic}
                </Badge>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Card #{index + 1}
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
                  <button
                    key={option}
                    type="button"
                    disabled={answered}
                    onClick={() => setPicked(i)}
                    className={cn(
                      "w-full rounded-xl border p-4 text-left text-sm font-medium transition-all flex items-center justify-between gap-3",
                      !answered &&
                        "border-border/80 bg-secondary/20 hover:border-primary/60 hover:bg-secondary/40",
                      answered &&
                        isCorrect &&
                        "border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs",
                      answered &&
                        !isCorrect &&
                        isSelected &&
                        "border-destructive/60 bg-destructive/10 text-destructive",
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
                  </button>
                );
              })}

              {answered && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-foreground/90 space-y-1 mt-3">
                  <span className="font-semibold text-primary flex items-center gap-1.5 text-xs">
                    <Sparkles className="size-3.5" /> Conceptual Explanation:
                  </span>
                  <p>{current.explanation}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button onClick={handleNext} disabled={!answered} className="gap-2 font-semibold shadow-sm">
                  {index + 1 === questions.length ? "Finish Practice" : "Next Card"}
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

/**
 * Past Attempts History Table
 */
function QuizHistory({ attempts }) {
  return (
    <Card className="border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Award className="size-4 text-primary" /> Test Attempts & Analytics
          </CardTitle>
          <span className="text-xs text-muted-foreground">{attempts.length} attempts logged</span>
        </div>
      </CardHeader>
      <CardContent>
        {attempts.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No test attempts completed yet. Complete a test above to record your score!
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {attempts.map((item) => {
              const pct = Math.round((item.correct / item.total) * 100);
              return (
                <div key={item.id} className="flex items-center justify-between py-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "size-8 rounded-full flex items-center justify-center font-bold text-[10px]",
                        pct >= 70
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-amber-500/15 text-amber-500",
                      )}
                    >
                      {pct}%
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{item.topic || "Placement Test"}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                        <span className="capitalize">{item.category}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        {item.timeSpentSec && (
                          <>
                            <span>•</span>
                            <span>{Math.round(item.timeSpentSec / 60)} mins</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">
                      {item.correct}/{item.total}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        pct >= 70 ? "text-emerald-500 border-emerald-500/30" : "text-amber-500 border-amber-500/30",
                      )}
                    >
                      {pct >= 70 ? "Passed" : "Review"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
