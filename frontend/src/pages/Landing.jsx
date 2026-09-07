import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import {
  BrainCircuit,
  FileText,
  MessageSquare,
  Mic,
  Target,
  TrendingUp,
  Briefcase,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    to: "/interview",
    icon: Mic,
    title: "Mock Interviews",
    text: "Technical and HR rounds with real human voice questions and instant AI examiner scoring.",
  },
  {
    to: "/prepare",
    icon: Target,
    title: "Placement Preparation",
    text: "Aptitude, technical and HR question sets with instant results and explanations.",
  },
  {
    to: "/resume",
    icon: FileText,
    title: "Resume Analyzer",
    text: "Upload your resume for a readiness score, detected skills, gaps and concrete fixes.",
  },
  {
    to: "/skills",
    icon: BrainCircuit,
    title: "Skill Analysis",
    text: "See which skills are strong, which need work, and what to learn for your target role.",
  },
  {
    to: "/assistant",
    icon: MessageSquare,
    title: "AI Career Assistant",
    text: "Ask anything about preparation, topics or study plans across saved conversations.",
  },
  {
    to: "/dashboard",
    icon: TrendingUp,
    title: "Progress Tracking",
    text: "Interviews completed, average score, best score and area-wise progress in one profile.",
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
          <Link to="/" className="font-display text-xl font-bold tracking-tight">
            Hire<span className="text-primary">Sense</span>
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  Hi, {(user?.name || "Candidate").split(" ")[0]}
                </span>
                <Button asChild size="sm">
                  <Link to="/dashboard">Go to Dashboard →</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <span className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          Placement preparation, powered by your own resume
        </span>
        <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Walk into your placement
          <br />
          <span className="text-primary">already interviewed.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          HireSense turns your resume into a personal interview coach: skill-matched mock rounds,
          scored feedback on every answer, aptitude and technical practice, and an assistant that
          answers your prep questions.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {user ? (
            <>
              <Button asChild size="lg" className="gap-2">
                <Link to="/interview">
                  Start Mock Interview <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/dashboard">Open Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg">
                <Link to="/register">Start Preparing</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">I already have an account</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-3">
          {[
            ["1. Upload your resume", "Skills, education and target role are pulled out for you."],
            ["2. Practice interviews", "Questions match your stack. Every answer gets a score."],
            ["3. Track and improve", "Analytics show exactly which topics to revise next."],
          ].map(([title, text]) => (
            <div key={title}>
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-display text-3xl font-bold">Everything you need</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Link
              key={feature.title}
              to={feature.to}
              className="block group transition-all duration-200 hover:-translate-y-1"
            >
              <Card className="h-full border-border/80 group-hover:border-primary/50 group-hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <feature.icon className="size-8 text-primary transition-transform group-hover:scale-110" />
                  <h3 className="mt-4 font-display text-lg font-semibold flex items-center justify-between">
                    <span>{feature.title}</span>
                    <ArrowRight className="size-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.text}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
          <Card className="h-full border-dashed">
            <CardContent className="pt-6">
              <Briefcase className="size-8 text-muted-foreground" />
              <h3 className="mt-4 font-display text-lg font-semibold">Job Matching</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Find jobs based on your skills and profile.
              </p>
              <span className="mt-3 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                Coming Soon
              </span>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="font-display text-3xl font-bold">Ready for your first mock round?</h2>
          <p className="mt-3 opacity-90">
            Create an account, add your resume, and start with a five question interview.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link to={user ? "/interview" : "/register"}>
              {user ? "Open Mock Interview" : "Start Preparing"}
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        HireSense — placement and interview preparation.
      </footer>
    </div>
  );
}
