import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { HireSenseLogo } from "@/components/HireSenseLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  BrainCircuit,
  FileText,
  MessageSquare,
  Mic,
  Target,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Code2,
  Terminal,
  Layers,
  Award,
  Users,
  CheckCircle2,
} from "lucide-react";

const COMPANIES = [
  { name: "Google", tier: "Tier-1 Product", color: "from-blue-500 to-red-500" },
  { name: "Microsoft", tier: "Tier-1 Product", color: "from-blue-600 to-cyan-500" },
  { name: "Amazon", tier: "Tier-1 Product", color: "from-amber-500 to-orange-500" },
  { name: "TCS Digital & Ninja", tier: "Prime / NQT", color: "from-blue-600 to-teal-500" },
  { name: "Infosys", tier: "Power Programmer", color: "from-blue-500 to-indigo-500" },
  { name: "Wipro", tier: "Turbo & Elite", color: "from-green-500 to-emerald-600" },
  { name: "Cognizant", tier: "GenC Next", color: "from-cyan-500 to-blue-600" },
  { name: "Accenture", tier: "Advanced Assoc.", color: "from-purple-600 to-pink-600" },
  { name: "Capgemini", tier: "Tech Challenge", color: "from-sky-500 to-blue-700" },
  { name: "J.P. Morgan", tier: "FinTech & SDE", color: "from-amber-600 to-yellow-600" },
];

const FLOATING_SKILLS = [
  { name: "Java 21", icon: Code2, pos: "top-12 left-4 md:left-12", delay: 0, anim: "animate-float-slow" },
  { name: "Spring Boot 3", icon: Layers, pos: "top-28 right-4 md:right-16", delay: 1, anim: "animate-float-delayed" },
  { name: "React 19", icon: Zap, pos: "bottom-16 left-6 md:left-20", delay: 2, anim: "animate-float-reverse" },
  { name: "AWS Cloud", icon: Sparkles, pos: "bottom-20 right-6 md:right-24", delay: 0.5, anim: "animate-float-slow" },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <HireSenseLogo size="md" showBadge={true} href="/" />

          <nav className="flex items-center gap-2.5">
            <ThemeToggle size="sm" />
            {user ? (
              <>
                <span className="hidden text-sm text-muted-foreground sm:inline font-medium">
                  Welcome, {(user?.name || "Candidate").split(" ")[0]}
                </span>
                <Button asChild size="sm" className="shadow-md shadow-primary/20">
                  <Link to="/dashboard">Go to Dashboard →</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="font-medium">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="shadow-md shadow-primary/20">
                  <Link to="/register">Get Started Free</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section with Spotlight & Mesh Gradient */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        {/* Glowing Spotlight Mesh Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[350px] bg-gradient-to-tr from-primary/30 via-cyan-500/20 to-purple-600/20 blur-[130px] rounded-full" />
          <div className="absolute top-10 right-1/4 w-[350px] h-[250px] bg-blue-500/15 blur-[100px] rounded-full" />
        </div>

        {/* Floating Skill Badges */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          {FLOATING_SKILLS.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: item.delay }}
              className={`absolute hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-card/80 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-primary/5 text-xs font-semibold ${item.pos} ${item.anim}`}
            >
              <item.icon className="size-3.5 text-primary" />
              <span>{item.name}</span>
            </motion.div>
          ))}

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary shadow-inner"
            >
              <Sparkles className="size-3.5 animate-pulse text-primary" />
              <span>Next-Gen Placement Preparation & Realistic AI Mock Rounds</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.12]"
            >
              Walk into your placement <br />
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-indigo-500 bg-clip-text text-transparent">
                already interviewed.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed"
            >
              HireSense analyzes your real resume, asks voice-synthesized interview questions
              customized to your stack, and gives instant AI examiner scores, aptitude practice,
              and concrete feedback before company placement season.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-9 flex flex-wrap items-center justify-center gap-4"
            >
              {user ? (
                <>
                  <Button asChild size="lg" className="h-12 px-7 gap-2 shadow-lg shadow-primary/25 font-semibold text-base">
                    <Link to="/interview">
                      Start Mock Interview <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
                    <Link to="/dashboard">Open Candidate Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="h-12 px-8 gap-2 shadow-lg shadow-primary/25 font-semibold text-base">
                    <Link to="/register">
                      Start Practicing Free <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </motion.div>

            {/* Quick trust metrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-primary" /> Real Voice Speech Recognition
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-primary" /> Full-Stack Java & Cloud Questions
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-primary" /> 100% Free for Students
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Infinite Animated Marquee Ticker */}
      <section className="border-y border-border/70 bg-card/40 py-8 overflow-hidden backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Trusted Preparation For Candidates Interviewing At Top Tech Giants
          </p>
        </div>

        <div className="relative w-full overflow-hidden">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          {/* Marquee Track */}
          <div className="animate-marquee flex items-center gap-6">
            {[...COMPANIES, ...COMPANIES].map((comp, idx) => (
              <div
                key={`${comp.name}-${idx}`}
                className="flex items-center gap-3 px-5 py-2.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md shadow-xs hover:border-primary/40 hover:shadow-md transition-all whitespace-nowrap cursor-default group"
              >
                <div className={`size-3 rounded-full bg-gradient-to-br ${comp.color} shadow-xs`} />
                <div>
                  <span className="font-bold text-sm text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {comp.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-2 font-mono">
                    {comp.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Feature Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 lg:py-28">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider text-primary border-primary/30 mb-3">
            Holistic Ecosystem
          </Badge>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
            Engineered for High-Stakes Tech Placements
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Everything from speech-enabled mock interviews and instant resume auditing to personalized career mentoring.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {/* Bento Card 1 (Large 2 Cols): Mock Interviews */}
          <motion.div
            whileHover={{ y: -4 }}
            className="md:col-span-2 lg:col-span-2 rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 hover:shadow-[0_0_35px_rgba(59,130,246,0.12)] transition-all"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 group-hover:bg-primary/20 transition-all" />
            <div>
              <div className="size-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-5 shadow-xs">
                <Mic className="size-6" />
              </div>
              <Badge variant="secondary" className="mb-3 text-[11px]">
                Core Capability
              </Badge>
              <h3 className="font-display text-2xl font-bold tracking-tight">
                Realistic AI Mock Interviews
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Experience technical and HR interviews with active Indian English voice speech recognition, live webcam preview, soundwave visualizer, and instant question-by-question scoring.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-border/50 flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">Technical • HR • System Design</span>
              <Button asChild size="sm" variant="ghost" className="text-primary hover:text-primary gap-1 p-0">
                <Link to="/interview">
                  Try Interview <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Bento Card 2: Resume Analyzer */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 flex flex-col justify-between relative group hover:border-primary/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all"
          >
            <div>
              <div className="size-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                <FileText className="size-5" />
              </div>
              <h3 className="font-display text-xl font-bold">Resume Analyzer</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Extract skills, detect keyword gaps, and get readiness scores calibrated against real campus hiring rubrics.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-border/50 flex items-center justify-between">
              <Badge variant="outline" className="text-[10px]">Instant Audit</Badge>
              <Link to="/resume" className="text-xs font-semibold text-primary hover:underline">
                Upload →
              </Link>
            </div>
          </motion.div>

          {/* Bento Card 3: Skill Matrix */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 flex flex-col justify-between relative group hover:border-primary/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all"
          >
            <div>
              <div className="size-11 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
                <BrainCircuit className="size-5" />
              </div>
              <h3 className="font-display text-xl font-bold">Skill Gap Matrix</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Benchmark your Java, React, SQL, and CS core capabilities to identify high-leverage topics for next rounds.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-border/50 flex items-center justify-between">
              <Badge variant="outline" className="text-[10px]">Target Roles</Badge>
              <Link to="/skills" className="text-xs font-semibold text-primary hover:underline">
                Inspect →
              </Link>
            </div>
          </motion.div>

          {/* Bento Card 4: Placement Preparation */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 flex flex-col justify-between relative group hover:border-primary/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all"
          >
            <div>
              <div className="size-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                <Target className="size-5" />
              </div>
              <h3 className="font-display text-xl font-bold">Question Bank</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Curated aptitude, quantitative, core technical, and HR question sets with instant explanations.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-border/50 flex items-center justify-between">
              <Badge variant="outline" className="text-[10px]">MCQ & Subjective</Badge>
              <Link to="/prepare" className="text-xs font-semibold text-primary hover:underline">
                Practice →
              </Link>
            </div>
          </motion.div>

          {/* Bento Card 5 (2 Cols): AI Career Assistant */}
          <motion.div
            whileHover={{ y: -4 }}
            className="md:col-span-2 lg:col-span-2 rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-cyan-500/5 p-6 sm:p-8 flex flex-col justify-between relative group hover:border-primary/50 hover:shadow-[0_0_35px_rgba(59,130,246,0.12)] transition-all"
          >
            <div>
              <div className="size-12 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center mb-5">
                <MessageSquare className="size-6" />
              </div>
              <Badge variant="secondary" className="mb-3 text-[11px]">
                24/7 AI Mentor
              </Badge>
              <h3 className="font-display text-2xl font-bold tracking-tight">
                AI Career Assistant & Coding Tutor
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Clarify DSA solutions, simulate behavioral questions using the STAR framework, or generate personalized revision timetables before placement drives.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-border/50 flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">Persistent Sessions • Markdown Support</span>
              <Button asChild size="sm" variant="ghost" className="text-primary hover:text-primary gap-1 p-0">
                <Link to="/assistant">
                  Chat Now <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Bento Card 6: Progress Analytics */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 flex flex-col justify-between relative group hover:border-primary/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all"
          >
            <div>
              <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <TrendingUp className="size-5" />
              </div>
              <h3 className="font-display text-xl font-bold">Progress Analytics</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Track interview frequency, average score progression, and verified candidate readiness scores.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-border/50 flex items-center justify-between">
              <Badge variant="outline" className="text-[10px]">Real-Time Metrics</Badge>
              <Link to="/dashboard" className="text-xs font-semibold text-primary hover:underline">
                View Profile →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3-Step Journey */}
      <section className="border-t border-border bg-card/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display text-2xl sm:text-4xl font-bold">
              3 Steps to Campus Placement Readiness
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              A structured roadmap from resume ingestion to the final offer letter.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Upload Resume or Profile",
                desc: "HireSense extracts your technical stack, projects, and target role in seconds.",
              },
              {
                step: "02",
                title: "Practice AI Mock Interviews",
                desc: "Real voice questions challenge your concepts with authentic interviewer follow-ups.",
              },
              {
                step: "03",
                title: "Address Gaps & Win Placements",
                desc: "Review detailed rubrics, model answers, and study roadmaps before actual drives.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-border/80 bg-card p-6 shadow-xs hover:border-primary/40 transition-colors"
              >
                <span className="font-mono text-3xl font-extrabold text-primary/40 block mb-2">
                  {item.step}
                </span>
                <h3 className="font-display text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA with Glowing Backdrop */}
      <section className="relative border-t border-border py-20 overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[250px] bg-primary/20 blur-[120px] rounded-full" />
        </div>

        <div className="mx-auto max-w-3xl px-4 text-center">
          <Badge variant="secondary" className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
            Start Today
          </Badge>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready for your first AI mock round?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Sign up in under 30 seconds, attach your resume, and face realistic interview questions instantly.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 font-semibold shadow-lg shadow-primary/30">
              <Link to={user ? "/interview" : "/register"}>
                {user ? "Launch Mock Interview →" : "Create Free Account →"}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7">
              <Link to="/prepare">Explore Question Bank</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/80 py-10 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} HireSense — AI Placement & Mock Interview Assistant.</p>
          <div className="flex items-center gap-6">
            <Link to="/prepare" className="hover:text-foreground transition-colors">Questions</Link>
            <Link to="/resume" className="hover:text-foreground transition-colors">Resume</Link>
            <Link to="/interview" className="hover:text-foreground transition-colors">Interviews</Link>
            <Link to="/skills" className="hover:text-foreground transition-colors">Skills</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
