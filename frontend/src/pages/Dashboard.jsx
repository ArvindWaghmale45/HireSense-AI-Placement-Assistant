import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserInterviews, listInterviews } from "@/lib/api/interviews";
import { listAttempts } from "@/lib/api/prep";
import { BrainCircuit, FileText, MessageSquare, Mic, Target, TrendingUp } from "lucide-react";

const QUICK = [
  {
    to: "/interview",
    label: "Start a mock interview",
    text: "Technical or HR questions picked from your resume skills.",
    icon: Mic,
  },
  {
    to: "/prepare",
    label: "Placement preparation",
    text: "Aptitude and technical MCQs plus HR answer guidance.",
    icon: Target,
  },
  {
    to: "/assistant",
    label: "Ask the AI assistant",
    text: "Study plans, concept explanations and interview tips.",
    icon: MessageSquare,
  },
  {
    to: "/resume",
    label: "Analyze your resume",
    text: "Get a score with strengths, gaps and fixes.",
    icon: FileText,
  },
];

export default function Dashboard() {
  return (
    <AppShell>
      <DashboardBody />
    </AppShell>
  );
}

function DashboardBody() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    if (!user) return;
    setInterviews(listInterviews(user.id));
    setAttempts(listAttempts(user.id));

    fetchUserInterviews().then((items) => {
      if (items && items.length > 0) {
        setInterviews(items);
      }
    });
  }, [user]);

  if (!user) return null;

  const avg = interviews.length
    ? Math.round(
        (interviews.reduce((sum, item) => sum + item.score, 0) / interviews.length) * 10,
      ) / 10
    : 0;
  const best = interviews.reduce((max, item) => Math.max(max, item.score), 0);
  const mcqTotal = attempts.reduce((sum, item) => sum + item.total, 0);
  const mcqCorrect = attempts.reduce((sum, item) => sum + item.correct, 0);
  const accuracy = mcqTotal ? Math.round((mcqCorrect / mcqTotal) * 100) : 0;
  const readiness = Math.round(avg * 6 + accuracy * 0.4);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle={
          user.targetRole
            ? `Preparing for ${user.targetRole}. Keep the streak going.`
            : "Let's get you interview ready."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Interviews completed" value={String(interviews.length)} />
        <StatCard label="Average score" value={interviews.length ? `${avg}/10` : "—"} />
        <StatCard label="Best score" value={best ? `${best}/10` : "—"} />
        <StatCard label="MCQ accuracy" value={mcqTotal ? `${accuracy}%` : "—"} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="size-5 text-primary" /> Interview readiness
          </CardTitle>
          <CardDescription>
            A blended view of your mock interview scores and practice accuracy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={Math.min(100, readiness)} />
          <p className="mt-2 text-sm text-muted-foreground">
            {Math.min(100, readiness)}% ready.{" "}
            {readiness < 40
              ? "Start with a mock interview to build a baseline."
              : readiness < 75
                ? "Solid progress — target your weakest areas next."
                : "You are in great shape. Keep revising."}
          </p>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {QUICK.map((item) => (
          <Card key={item.to} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </div>
              <CardTitle className="text-base">{item.label}</CardTitle>
              <CardDescription>{item.text}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm">
                <Link to={item.to}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Recent interviews</CardTitle>
          <CardDescription>Your last sessions and how they scored.</CardDescription>
        </CardHeader>
        <CardContent>
          {interviews.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <BrainCircuit className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No interviews yet. Your first session takes about 10 minutes.
              </p>
              <Button asChild className="mt-4" size="sm">
                <Link to="/interview">Start now</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {interviews.slice(0, 5).map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <Badge variant="secondary">{item.type === "HR" ? "HR" : "Technical"}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {item.difficulty.toLowerCase()} · {item.attempted}/{item.totalQuestions}{" "}
                    answered
                  </span>
                  <span className="ml-auto font-display text-lg font-semibold">
                    {item.score}/10
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

function StatCard({ label, value }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
