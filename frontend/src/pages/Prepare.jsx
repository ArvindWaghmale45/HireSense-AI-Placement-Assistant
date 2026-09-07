import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
    <>
      <PageHeader
        title="Placement Preparation"
        subtitle="Aptitude and technical quizzes, plus guidance for the HR round."
      />
      <Tabs defaultValue="aptitude">
        <TabsList>
          <TabsTrigger value="aptitude">Aptitude</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="hr">HR</TabsTrigger>
        </TabsList>

        <TabsContent value="aptitude" className="mt-6">
          <Quiz category="aptitude" userId={user.id} onSaved={refresh} />
        </TabsContent>
        <TabsContent value="technical" className="mt-6">
          <Quiz category="technical" userId={user.id} onSaved={refresh} />
        </TabsContent>
        <TabsContent value="hr" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">HR question guidance</CardTitle>
              <CardDescription>
                Open a question to see what interviewers are listening for.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                {HR_PROMPTS.map((prompt) => (
                  <AccordionItem key={prompt.id} value={prompt.id}>
                    <AccordionTrigger className="text-left">{prompt.text}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {prompt.guidance}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Your quiz history</CardTitle>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quiz attempts yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {attempts.slice(0, 8).map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <Badge variant="secondary">{item.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <span className="ml-auto font-medium">
                    {item.correct}/{item.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function Quiz({ category, userId, onSaved }) {
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
      toast.success(`Quiz finished: ${total}/${questions.length}`);
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
        <CardContent className="py-8 text-sm text-muted-foreground">
          No questions available in this section yet.
        </CardContent>
      </Card>
    );
  }

  if (done) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quiz complete</CardTitle>
          <CardDescription>
            You scored {correct} out of {questions.length}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(correct / questions.length) * 100} className="mb-4" />
          <Button onClick={restart}>Try again</Button>
        </CardContent>
      </Card>
    );
  }

  if (!current) return null;

  const answered = picked !== null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{current.topic}</Badge>
          <span className="text-sm text-muted-foreground">
            Question {index + 1} of {questions.length}
          </span>
        </div>
        <CardTitle className="mt-3 text-lg leading-snug">{current.text}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {current.options.map((option, i) => {
          const isCorrect = i === current.correctIndex;
          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => setPicked(i)}
              className={cn(
                "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                !answered && "border-border hover:bg-accent",
                answered && isCorrect && "border-primary bg-primary/10",
                answered && !isCorrect && picked === i && "border-destructive bg-destructive/10",
                answered && !isCorrect && picked !== i && "border-border opacity-60",
              )}
            >
              {option}
            </button>
          );
        })}
        {answered ? (
          <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            {current.explanation}
          </p>
        ) : null}
        <Button onClick={next} disabled={!answered}>
          {index + 1 === questions.length ? "Finish" : "Next question"}
        </Button>
      </CardContent>
    </Card>
  );
}
