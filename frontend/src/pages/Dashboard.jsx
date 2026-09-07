import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Card3D } from "@/components/ui/Card3D";
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
  Layers,
  ChevronRight,
} from "lucide-react";

const QUICK = [
  {
    to: "/interview",
    label: "Start AI Mock Interview",
    text: "Spoken technical & HR rounds matched to your resume stack.",
    icon: Mic,
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
  },
  {
    to: "/prepare",
    label: "Placement Question Bank",
    text: "Curated aptitude, core CS, and technical MCQs with instant explanations.",
    icon: Target,
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
  },
  {
    to: "/resume",
    label: "Resume ATS Analyzer",
    text: "Audit resume keywords, readiness score, and placement gap fixes.",
    icon: FileText,
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
  },
  {
    to: "/assistant",
    label: "24/7 AI Career Mentor",
    text: "DSA clarifications, study plans, and final-year project guidance.",
    icon: MessageSquare,
    color: "from-purple-500/20 to-indigo-500/20",
    iconColor: "text-purple-500",
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

  // Circle meter parameters for 3D Holographic Dial
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readiness / 100) * circumference;

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Candidate Cockpit"
        title={`Welcome back, ${firstName}`}
        subtitle={
          user?.targetRole
            ? `Active Target: ${user.targetRole}. Your neural interview readiness score is recalibrated continuously.`
            : "Track your placement interview streak, analyze rubrics, and launch practice rounds."
        }
      />

      {/* TOP ROW: 3D PERSPECTIVE TILT STAT CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card3D maxTilt={7}>
          <div className="p-5 flex flex-col justify-between h-full bg-gradient-to-br from-card to-card/70 border border-border/80 rounded-xl relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Mock Rounds Done</span>
              <div className="size-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Mic className="size-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="font-display text-3xl font-extrabold">{interviews.length}</p>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                <Sparkles className="size-3 text-primary" /> Recorded & AI Evaluated
              </span>
            </div>
          </div>
        </Card3D>

        <Card3D maxTilt={7}>
          <div className="p-5 flex flex-col justify-between h-full bg-gradient-to-br from-card to-card/70 border border-border/80 rounded-xl relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Average Examiner Score</span>
              <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Award className="size-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="font-display text-3xl font-extrabold">
                {interviews.length ? `${avg}` : "—"}
                {interviews.length ? <span className="text-base font-normal text-muted-foreground">/10</span> : ""}
              </p>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="size-3 text-emerald-500" /> Rubric Calibrated
              </span>
            </div>
          </div>
        </Card3D>

        <Card3D maxTilt={7}>
          <div className="p-5 flex flex-col justify-between h-full bg-gradient-to-br from-card to-card/70 border border-border/80 rounded-xl relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Personal Best</span>
              <div className="size-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Flame className="size-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="font-display text-3xl font-extrabold text-primary">
                {best ? `${best}` : "—"}
                {best ? <span className="text-base font-normal text-muted-foreground">/10</span> : ""}
              </p>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                <CheckCircle2 className="size-3 text-primary" /> High-Water Mark
              </span>
            </div>
          </div>
        </Card3D>

        <Card3D maxTilt={7}>
          <div className="p-5 flex flex-col justify-between h-full bg-gradient-to-br from-card to-card/70 border border-border/80 rounded-xl relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">MCQ Quiz Accuracy</span>
              <div className="size-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Zap className="size-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="font-display text-3xl font-extrabold">
                {mcqTotal ? `${accuracy}%` : "—"}
              </p>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                {mcqTotal ? `${mcqCorrect}/${mcqTotal} correct` : "Take first quiz"}
              </span>
            </div>
          </div>
        </Card3D>
      </div>

      {/* 3D HOLOGRAPHIC PLACEMENT READINESS DIAL & TARGET COMPANY RADAR */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Holographic Readiness Dial */}
        <Card className="border-primary/20 bg-gradient-to-br from-card via-card/90 to-primary/5 relative overflow-hidden shadow-lg shadow-black/5 dark:shadow-primary/5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                <CardTitle className="text-lg font-display">Placement Readiness Index</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary">
                AI Composite Metric
              </Badge>
            </div>
            <CardDescription>
              Dynamic calculation blending spoken mock interview feedback, aptitude accuracy, and resume ATS calibration.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-around">
              {/* Animated 3D Radial Gauge SVG */}
              <div className="relative size-44 flex items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 160 160">
                  {/* Outer Track Ring */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="stroke-muted/40"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Glowing Meter Ring */}
                  <motion.circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="stroke-primary"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))",
                    }}
                  />
                </svg>

                {/* Dial Center Values */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="font-display text-4xl font-extrabold tracking-tight">
                    {readiness}%
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground mt-0.5">
                    Readiness
                  </span>
                </div>
              </div>

              {/* Status & Qualitative Breakdown */}
              <div className="space-y-3 max-w-xs text-center sm:text-left">
                <div>
                  <Badge
                    variant="secondary"
                    className={`text-xs px-3 py-1 font-semibold ${
                      readiness >= 75
                        ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                        : readiness >= 50
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                    }`}
                  >
                    {readiness >= 75
                      ? "🔥 Tier 1 Product Ready"
                      : readiness >= 50
                      ? "⚡ Placement Sprint Mode"
                      : "🌱 Foundation Phase"}
                  </Badge>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {readiness < 40
                      ? "Complete 2-3 mock interview rounds to calibrate your technical speech profile."
                      : readiness < 75
                      ? "Solid trajectory. Target core CS algorithms and system design to unlock Tier 1."
                      : "Outstanding readiness! Your communication and technical answers are in high offer territory."}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Mock Interview:</span>
                    <span className="font-semibold">{interviews.length ? `${avg}/10 avg` : "Not started"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">MCQ Accuracy:</span>
                    <span className="font-semibold">{mcqTotal ? `${accuracy}%` : "Not started"}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Company Tier Matrix */}
        <Card className="border-border/80 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Layers className="size-4 text-primary" /> Target Tier Benchmark
            </CardTitle>
            <CardDescription className="text-xs">
              Calibrated against hiring criteria from campus placement records.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                tier: "Product Giants (Tier 1)",
                companies: "Google, Microsoft, Amazon",
                targetScore: "8.5+ / 10",
                ready: readiness >= 80,
              },
              {
                tier: "FinTech & Growth Unicorns",
                companies: "J.P. Morgan, Razorpay, PhonePe",
                targetScore: "7.5+ / 10",
                ready: readiness >= 65,
              },
              {
                tier: "Global IT Leaders",
                companies: "TCS Digital, Infosys, Cognizant",
                targetScore: "6.0+ / 10",
                ready: readiness >= 45,
              },
            ].map((item) => (
              <div
                key={item.tier}
                className="p-3 rounded-lg border border-border/80 bg-secondary/30 flex items-center justify-between text-xs"
              >
                <div>
                  <h5 className="font-semibold text-foreground">{item.tier}</h5>
                  <p className="text-[11px] text-muted-foreground">{item.companies}</p>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      item.ready
                        ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10 font-bold"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {item.ready ? "✓ On Track" : item.targetScore}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* QUICK ACTIONS LAUNCHPAD (WRAPPED IN 3D TILT CARDS) */}
      <div>
        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <Zap className="size-4 text-primary" /> High-Impact Practice Launchpad
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK.map((item) => (
            <Card3D key={item.to} maxTilt={6}>
              <div className="p-5 flex flex-col justify-between h-full bg-card rounded-xl border border-border/80 hover:border-primary/40 transition-colors">
                <div>
                  <div className={`size-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                    <item.icon className={`size-5 ${item.iconColor}`} />
                  </div>
                  <h4 className="font-display text-base font-bold">{item.label}</h4>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{item.text}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between">
                  <Button asChild size="sm" variant="ghost" className="p-0 text-xs font-semibold text-primary hover:text-primary gap-1">
                    <Link to={item.to}>
                      Launch Now <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>

      {/* RECENT INTERVIEWS LOG */}
      <Card className="border-border/80">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg font-display">Recent Mock Interview Sessions</CardTitle>
            <CardDescription className="text-xs">Your last simulated rounds and examiner feedback scores.</CardDescription>
          </div>
          <Button asChild size="sm" variant="outline" className="text-xs h-8">
            <Link to="/interview">Start New Round →</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {interviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-secondary/20">
              <BrainCircuit className="mx-auto mb-3 size-8 text-primary/60" />
              <p className="text-sm font-medium">No recorded mock interview sessions yet.</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                Launch a 5-question mock round with speech recognition to establish your baseline candidate score.
              </p>
              <Button asChild className="mt-4 shadow-sm shadow-primary/20" size="sm">
                <Link to="/interview">Launch First Session</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {interviews.slice(0, 5).map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {item.type === "HR" ? "HR" : "TECH"}
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm capitalize">
                        {item.type.toLowerCase()} Round ({item.difficulty.toLowerCase()})
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        {item.attempted}/{item.totalQuestions} questions completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-display text-lg font-bold text-primary">
                        {item.score}/10
                      </span>
                      <span className="text-[10px] block text-muted-foreground">Examiner Score</span>
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
    </div>
  );
}
