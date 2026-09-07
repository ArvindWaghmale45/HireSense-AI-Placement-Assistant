import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserInterviews, listInterviews } from "@/lib/api/interviews";
import { listAttempts } from "@/lib/api/prep";
import {
  BrainCircuit,
  FileText,
  MessageSquare,
  Mic,
  Target,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
  Flame,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Calendar,
  BookOpen,
  User as UserIcon,
} from "lucide-react";

const QUICK_ACTIONS = [
  {
    to: "/interview",
    title: "Mock Interview",
    desc: "AI technical & HR rounds tailored to your stack with real-time scoring.",
    icon: Mic,
    theme: "border-indigo-500/30 hover:border-indigo-500 bg-gradient-to-br from-indigo-500/10 via-card to-card",
    iconBg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    badge: "Voice Enabled",
  },
  {
    to: "/prepare",
    title: "Question Bank",
    desc: "Aptitude, quantitative, CS core, and technical practice with instant hints.",
    icon: Target,
    theme: "border-amber-500/30 hover:border-amber-500 bg-gradient-to-br from-amber-500/10 via-card to-card",
    iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    badge: "Practice MCQs",
  },
  {
    to: "/resume",
    title: "Resume Analyzer",
    desc: "Upload your resume for ATS match scoring, detected skills, and concrete fixes.",
    icon: FileText,
    theme: "border-emerald-500/30 hover:border-emerald-500 bg-gradient-to-br from-emerald-500/10 via-card to-card",
    iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    badge: "ATS Readiness",
  },
  {
    to: "/assistant",
    title: "Career Assistant",
    desc: "Ask technical doubts, request 30-day prep roadmaps, or polish STAR stories.",
    icon: MessageSquare,
    theme: "border-sky-500/30 hover:border-sky-500 bg-gradient-to-br from-sky-500/10 via-card to-card",
    iconBg: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    badge: "24/7 Guidance",
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
        (interviews.reduce((sum, item) => sum + (Number(item?.score) || 0), 0) / interviews.length) * 10,
      ) / 10
    : 0;
  const best = interviews.reduce((max, item) => Math.max(max, Number(item?.score) || 0), 0);
  const mcqTotal = attempts.reduce((sum, item) => sum + (Number(item?.total) || 0), 0);
  const mcqCorrect = attempts.reduce((sum, item) => sum + (Number(item?.correct) || 0), 0);
  const accuracy = mcqTotal ? Math.round((mcqCorrect / mcqTotal) * 100) : 0;
  const readiness = Math.min(100, Math.round(avg * 6 + accuracy * 0.4));

  const firstName = (user?.name || "Candidate").split(" ")[0];

  // Radial gauge measurements
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readiness / 100) * circumference;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle={
          user?.targetRole
            ? `Preparing for ${user.targetRole}. Track your interview readiness, practice sets, and recent scores.`
            : "Track your placement readiness, practice questions, and monitor your score improvements."
        }
      />

      {/* 4 Metric Summary Cards with Scroll Entrance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Completed Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-xl border border-indigo-500/20 bg-card p-5 relative overflow-hidden shadow-xs hover:border-indigo-500/40 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Interviews Completed
            </span>
            <div className="size-9 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Mic className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
              {interviews.length}
            </span>
            <span className="text-xs text-muted-foreground block mt-1">
              {interviews.length === 1 ? "1 session recorded" : `${interviews.length} total sessions`}
            </span>
          </div>
        </motion.div>

        {/* Card 2: Average Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-emerald-500/20 bg-card p-5 relative overflow-hidden shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Average Score
            </span>
            <div className="size-9 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
                {interviews.length ? avg : "—"}
              </span>
              {interviews.length > 0 && (
                <span className="text-sm font-semibold text-muted-foreground">/10</span>
              )}
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
              {interviews.length ? "Based on all rounds" : "Complete a round to see"}
            </span>
          </div>
        </motion.div>

        {/* Card 3: Personal Best */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-xl border border-amber-500/20 bg-card p-5 relative overflow-hidden shadow-xs hover:border-amber-500/40 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Highest Score
            </span>
            <div className="size-9 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
                {best ? best : "—"}
              </span>
              {best > 0 && (
                <span className="text-sm font-semibold text-muted-foreground">/10</span>
              )}
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium block mt-1">
              {best >= 7 ? "High score milestone" : best > 0 ? "Target: 8.0+" : "No rounds yet"}
            </span>
          </div>
        </motion.div>

        {/* Card 4: MCQ Accuracy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl border border-purple-500/20 bg-card p-5 relative overflow-hidden shadow-xs hover:border-purple-500/40 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Question Accuracy
            </span>
            <div className="size-9 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Zap className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
              {mcqTotal ? `${accuracy}%` : "—"}
            </span>
            <span className="text-xs text-muted-foreground block mt-1">
              {mcqTotal ? `${mcqCorrect} of ${mcqTotal} correct` : "No quizzes taken yet"}
            </span>
          </div>
        </motion.div>
      </div>

      {/* PLACEMENT READINESS SECTION (CLEAN, WITHOUT TARGET BENCHMARKS CARD) */}
      <Card className="border-border/80 bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" /> Placement Readiness Summary
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Composite evaluation combining your mock interview performance, aptitude practice, and profile skills.
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className={`text-xs px-3 py-1 font-semibold ${
                readiness >= 75
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                  : readiness >= 50
                  ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30"
                  : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
              }`}
            >
              {readiness >= 75 ? "Placement Ready" : readiness >= 50 ? "Solid Progress" : "Building Baseline"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left: Clean Radial Progress Gauge */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative size-40 flex items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 144 144">
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-muted"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className={
                      readiness >= 75
                        ? "stroke-emerald-500"
                        : readiness >= 50
                        ? "stroke-primary"
                        : "stroke-amber-500"
                    }
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
                    {readiness}%
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                    Readiness
                  </span>
                </div>
              </div>
            </div>

            {/* Middle: Clear Progress Feedback */}
            <div className="space-y-3 md:col-span-2">
              <div>
                <h4 className="font-semibold text-base text-foreground">
                  {readiness >= 75
                    ? "Strong Candidate Readiness"
                    : readiness >= 50
                    ? "Consistent Preparation Track"
                    : "Initial Placement Preparation Phase"}
                </h4>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {readiness < 40
                    ? "Complete your first few mock interviews and aptitude practice sets to build your baseline placement score."
                    : readiness < 75
                    ? "Good momentum. Target your weaker technical topics and practice multi-round interviews to reach high offer probability."
                    : "Outstanding consistency. Your interview scores and accuracy put you in a very competitive tier for campus drives."}
                </p>
              </div>

              {/* Breakdown Metric Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/60">
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/60">
                  <span className="text-xs text-muted-foreground block">Interview Score</span>
                  <span className="font-semibold text-sm text-foreground">
                    {interviews.length ? `${avg} / 10` : "Not taken yet"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/60">
                  <span className="text-xs text-muted-foreground block">Practice Accuracy</span>
                  <span className="font-semibold text-sm text-foreground">
                    {mcqTotal ? `${accuracy}% accuracy` : "No attempts yet"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/60">
                  <span className="text-xs text-muted-foreground block">Target Role</span>
                  <span className="font-semibold text-sm text-foreground truncate block">
                    {user.targetRole || "Software Engineer"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QUICK ACTIONS WITH DISTINCT COLOR THEMES & MOTION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-foreground">
            Preparation Modules
          </h3>
          <span className="text-xs text-muted-foreground">Jump into your daily prep</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <motion.div
              key={action.to}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Link to={action.to} className="block h-full group">
                <Card className={`h-full border transition-all duration-200 ${action.theme}`}>
                  <CardContent className="p-5 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`size-10 rounded-lg flex items-center justify-center ${action.iconBg}`}>
                          <action.icon className="size-5" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-medium border-border/80">
                          {action.badge}
                        </Badge>
                      </div>
                      <h4 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {action.desc}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                      <span>Open module</span>
                      <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RECENT INTERVIEW SESSIONS LIST */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Calendar className="size-4 text-primary" /> Recent Mock Interview Sessions
              </CardTitle>
              <CardDescription className="text-xs">
                History of your latest interview simulations and performance marks.
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline" className="text-xs h-8">
              <Link to="/interview">Start New Session →</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {interviews.length === 0 ? (
            <div className="p-8 text-center">
              <div className="size-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mx-auto mb-3">
                <Mic className="size-5" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">No interview sessions recorded yet</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Take a quick 5-question mock round to get your technical answers scored with instant feedback.
              </p>
              <Button asChild size="sm" className="mt-4">
                <Link to="/interview">Start First Interview</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {interviews.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.type === "HR"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {item.type}
                    </span>
                    <div>
                      <span className="font-semibold text-sm text-foreground capitalize">
                        {item.type.toLowerCase()} Round ({item.difficulty.toLowerCase()})
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        {item.attempted}/{item.totalQuestions} questions answered
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-display text-lg font-bold text-foreground">
                        {item.score}
                        <span className="text-xs font-normal text-muted-foreground">/10</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground block">Score</span>
                    </div>
                    <Button asChild size="sm" variant="ghost" className="text-xs h-8">
                      <Link to="/interview">Review →</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dashboard Footer with Quick Navigation Links */}
      <footer className="mt-14 pt-8 border-t border-border/70 text-xs text-muted-foreground">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-display font-bold text-sm text-foreground">HireSense AI</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Intelligent Campus Placement & Full Stack Technical Mock Interview Ecosystem.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-mono">
              <span>● Cloud Backend Live</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider mb-3 font-mono">
              Placement Prep
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/interview" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <Mic className="size-3 text-indigo-500" /> AI Mock Interview
                </Link>
              </li>
              <li>
                <Link to="/prepare" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <Target className="size-3 text-amber-500" /> Question Bank
                </Link>
              </li>
              <li>
                <Link to="/skills" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <BrainCircuit className="size-3 text-rose-500" /> Skill Analysis
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider mb-3 font-mono">
              Candidate Tools
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/resume" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <FileText className="size-3 text-emerald-500" /> Resume Analyzer
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <MessageSquare className="size-3 text-sky-500" /> Career Mentor
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <UserIcon className="size-3 text-violet-500" /> Profile & Tech Stack
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider mb-3 font-mono">
              Quick Shortcuts
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Platform Home
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="hover:text-primary transition-colors text-left"
                >
                  Scroll to Top ↑
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© {new Date().getFullYear()} HireSense — Designed for Campus Drive Excellence.</p>
          <div className="flex items-center gap-4">
            <Link to="/interview" className="hover:text-foreground transition-colors">Mock Rounds</Link>
            <Link to="/prepare" className="hover:text-foreground transition-colors">Questions</Link>
            <Link to="/skills" className="hover:text-foreground transition-colors">Skills</Link>
            <Link to="/resume" className="hover:text-foreground transition-colors">Resume</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
