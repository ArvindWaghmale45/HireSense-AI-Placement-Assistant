import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import {
  BrainCircuit,
  Check,
  Plus,
  Target,
  Award,
  Search,
  Sparkles,
  TrendingUp,
  Layers,
  Briefcase,
  Code2,
  Database,
  Server,
  Cloud,
  ShieldCheck,
  Cpu,
  BarChart3,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Layout,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const ROLE_CATALOG = [
  {
    id: "java-fullstack",
    title: "Java Full Stack Developer",
    category: "Full Stack",
    demand: "🔥 Very High Demand",
    experience: "Fresher / 0-2 Yrs",
    package: "₹6 - 16 LPA",
    desc: "End-to-end enterprise web systems built with Java, Spring Boot microservices, relational databases, and modern React frontends.",
    requiredSkills: [
      "Java",
      "Spring Boot",
      "Hibernate",
      "REST APIs",
      "Microservices",
      "SQL",
      "DBMS",
      "React",
      "JavaScript",
      "HTML/CSS",
      "Git",
    ],
    recommendedSkills: ["Docker", "MySQL", "PostgreSQL", "Tailwind CSS", "Redux", "Problem Solving"],
  },
  {
    id: "java-backend",
    title: "Java Backend Engineer",
    category: "Backend",
    demand: "⚡ High Demand",
    experience: "Fresher / 0-3 Yrs",
    package: "₹7 - 18 LPA",
    desc: "High-throughput server-side architecture, relational database design, caching, Spring Boot, and distributed REST APIs.",
    requiredSkills: [
      "Java",
      "Spring Boot",
      "Hibernate",
      "REST APIs",
      "Microservices",
      "SQL",
      "DBMS",
      "Data Structures",
      "Algorithms",
      "Git",
    ],
    recommendedSkills: ["Redis", "PostgreSQL", "Docker", "System Design", "Linux", "JUnit"],
  },
  {
    id: "mern-stack",
    title: "MERN Stack Developer",
    category: "Full Stack",
    demand: "🚀 High Growth",
    experience: "Fresher / 0-2 Yrs",
    package: "₹5 - 14 LPA",
    desc: "Full stack reactive JavaScript applications spanning React, Node.js, Express, and document databases.",
    requiredSkills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "REST APIs",
      "HTML/CSS",
      "Git",
    ],
    recommendedSkills: ["Next.js", "Tailwind CSS", "Redux", "Docker", "Postman"],
  },
  {
    id: "frontend-engineer",
    title: "Frontend Engineer (React / Next.js)",
    category: "Frontend",
    demand: "🌟 High Demand",
    experience: "Fresher / 0-2 Yrs",
    package: "₹5 - 15 LPA",
    desc: "High-performance, accessible, responsive client interfaces and design systems with React, TypeScript, and modern styling.",
    requiredSkills: [
      "React",
      "JavaScript",
      "TypeScript",
      "HTML/CSS",
      "Tailwind CSS",
      "REST APIs",
      "Git",
    ],
    recommendedSkills: ["Next.js", "Redux", "Problem Solving", "Postman"],
  },
  {
    id: "python-backend",
    title: "Python & Backend Developer",
    category: "Backend",
    demand: "⚡ Rapid Growth",
    experience: "Fresher / 0-2 Yrs",
    package: "₹6 - 15 LPA",
    desc: "Scalable web backends, microservices, and automation pipelines with Python, Django, or FastAPI.",
    requiredSkills: [
      "Python",
      "Django",
      "FastAPI",
      "REST APIs",
      "SQL",
      "DBMS",
      "Git",
    ],
    recommendedSkills: ["PostgreSQL", "Docker", "Redis", "Linux", "Data Structures"],
  },
  {
    id: "sde-campus",
    title: "SDE-1 / Campus Core Software Engineer",
    category: "Core CS",
    demand: "💎 Evergreen (Top MNCs)",
    experience: "Fresher (Product Companies)",
    package: "₹8 - 24 LPA",
    desc: "Core algorithm design, competitive problem solving, CS fundamentals, and clean object-oriented architecture.",
    requiredSkills: [
      "Data Structures",
      "Algorithms",
      "Java",
      "C++",
      "OOP",
      "DBMS",
      "Operating Systems",
      "Computer Networks",
      "SQL",
    ],
    recommendedSkills: ["System Design", "Python", "Problem Solving", "Git"],
  },
  {
    id: "data-analyst",
    title: "Data Analyst & BI Specialist",
    category: "Data & AI",
    demand: "📊 High Demand",
    experience: "Fresher / 0-2 Yrs",
    package: "₹5 - 12 LPA",
    desc: "Transforming raw business data into actionable dashboards, KPIs, automated reports, and predictive insights.",
    requiredSkills: [
      "SQL",
      "Python",
      "Pandas",
      "NumPy",
      "Power BI",
      "DBMS",
      "Problem Solving",
    ],
    recommendedSkills: ["PostgreSQL", "Machine Learning", "Communication", "Git"],
  },
  {
    id: "ai-ml-engineer",
    title: "AI / Machine Learning Engineer",
    category: "Data & AI",
    demand: "🤖 Top Trending",
    experience: "Fresher / 0-2 Yrs",
    package: "₹8 - 22 LPA",
    desc: "Building mathematical predictive models, neural architectures, NLP pipelines, and LLM implementations.",
    requiredSkills: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "Pandas",
      "NumPy",
      "Algorithms",
      "SQL",
      "Git",
    ],
    recommendedSkills: ["Docker", "Linux", "FastAPI", "Problem Solving"],
  },
  {
    id: "devops-cloud",
    title: "DevOps & Cloud Engineer",
    category: "Cloud & DevOps",
    demand: "☁️ High Demand",
    experience: "Fresher / 0-3 Yrs",
    package: "₹6 - 18 LPA",
    desc: "Automating cloud infrastructure, CI/CD pipelines, container orchestration, and continuous monitoring.",
    requiredSkills: [
      "Linux",
      "AWS",
      "Docker",
      "Kubernetes",
      "Git",
      "CI/CD",
    ],
    recommendedSkills: ["Python", "REST APIs", "Problem Solving", "Cybersecurity"],
  },
  {
    id: "embedded-iot",
    title: "Embedded Systems & IoT Engineer (ENTC)",
    category: "Hardware & ENTC",
    demand: "⚡ Specialized Growth",
    experience: "Fresher / 0-2 Yrs",
    package: "₹5 - 13 LPA",
    desc: "Firmware programming, microcontroller interfaces, serial sensor protocols, and IoT hardware systems.",
    requiredSkills: [
      "Embedded C",
      "C",
      "C++",
      "Microcontrollers",
      "IoT",
      "Git",
    ],
    recommendedSkills: ["Linux", "Python", "Problem Solving"],
  },
  {
    id: "android-developer",
    title: "Android Mobile App Developer",
    category: "Mobile",
    demand: "📱 Steady Demand",
    experience: "Fresher / 0-2 Yrs",
    package: "₹5 - 14 LPA",
    desc: "Native mobile experiences for Android leveraging Kotlin, Jetpack Compose, and robust background REST integrations.",
    requiredSkills: [
      "Kotlin",
      "Java",
      "REST APIs",
      "Git",
      "OOP",
    ],
    recommendedSkills: ["SQL", "DBMS", "Problem Solving"],
  },
  {
    id: "qa-automation",
    title: "QA & Automation Test Engineer",
    category: "Core CS",
    demand: "🛡️ High Demand",
    experience: "Fresher / 0-2 Yrs",
    package: "₹4.5 - 11 LPA",
    desc: "Automated test suites, end-to-end regression pipelines, API payload validation, and software quality assurance.",
    requiredSkills: [
      "Java",
      "Selenium",
      "JUnit",
      "Postman",
      "SQL",
      "Git",
    ],
    recommendedSkills: ["Python", "REST APIs", "CI/CD", "Problem Solving"],
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity & SOC Analyst",
    category: "Security",
    demand: "🔒 Rapid Growth",
    experience: "Fresher / 0-2 Yrs",
    package: "₹6 - 16 LPA",
    desc: "Network penetration auditing, vulnerability assessments, security policy compliance, and threat mitigation.",
    requiredSkills: [
      "Cybersecurity",
      "Computer Networks",
      "Operating Systems",
      "Linux",
      "Python",
      "Git",
    ],
    recommendedSkills: ["SQL", "Problem Solving", "Communication"],
  },
  {
    id: "database-engineer",
    title: "Database Administrator / SQL Engineer",
    category: "Databases",
    demand: "🗄️ Core Evergreen",
    experience: "Fresher / 0-2 Yrs",
    package: "₹5 - 14 LPA",
    desc: "Relational database performance tuning, normalization, ACID safety, stored procedures, and schema optimization.",
    requiredSkills: [
      "SQL",
      "DBMS",
      "MySQL",
      "PostgreSQL",
      "Linux",
      "Git",
    ],
    recommendedSkills: ["Redis", "MongoDB", "Python", "Problem Solving"],
  },
];

export const SKILL_CATEGORIES = [
  {
    name: "Programming Languages",
    icon: Code2,
    skills: ["Java", "Python", "C++", "C", "JavaScript", "TypeScript", "SQL", "Kotlin"],
  },
  {
    name: "Core CS Fundamentals",
    icon: Layers,
    skills: ["Data Structures", "Algorithms", "OOP", "DBMS", "Operating Systems", "Computer Networks", "System Design"],
  },
  {
    name: "Backend & Microservices",
    icon: Server,
    skills: ["Spring Boot", "Hibernate", "REST APIs", "Microservices", "Node.js", "Express.js", "Django", "FastAPI"],
  },
  {
    name: "Frontend & UI Design",
    icon: Layout,
    skills: ["React", "Next.js", "HTML/CSS", "Tailwind CSS", "Redux"],
  },
  {
    name: "Databases & Storage",
    icon: Database,
    skills: ["MySQL", "PostgreSQL", "MongoDB", "Redis"],
  },
  {
    name: "Cloud, DevOps & Tooling",
    icon: Cloud,
    skills: ["Git", "Docker", "Kubernetes", "AWS", "Linux", "CI/CD"],
  },
  {
    name: "Data Science & AI",
    icon: BarChart3,
    skills: ["Machine Learning", "Deep Learning", "Pandas", "NumPy", "Power BI"],
  },
  {
    name: "Embedded & Hardware (ENTC)",
    icon: Cpu,
    skills: ["Embedded C", "Microcontrollers", "IoT"],
  },
  {
    name: "Testing & Security",
    icon: ShieldCheck,
    skills: ["JUnit", "Selenium", "Postman", "Cybersecurity"],
  },
  {
    name: "Professional & Soft Skills",
    icon: GraduationCap,
    skills: ["Communication", "Problem Solving"],
  },
];

const CATEGORY_TABS = [
  "All Roles",
  "Full Stack",
  "Backend",
  "Frontend",
  "Core CS",
  "Data & AI",
  "Cloud & DevOps",
  "Hardware & ENTC",
];

export default function SkillAnalysis() {
  return (
    <AppShell>
      <SkillBody />
    </AppShell>
  );
}

function SkillBody() {
  const { user, patchProfile } = useAuth();
  const [selectedRoleId, setSelectedRoleId] = useState("java-fullstack");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("All Roles");
  const [roleSearch, setRoleSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [activeSkillCategory, setActiveSkillCategory] = useState("All");

  if (!user) return null;

  const currentSkills = user.skills || [];

  // Filter roles based on category and search
  const filteredRoles = useMemo(() => {
    return ROLE_CATALOG.filter((role) => {
      const matchesTab =
        selectedCategoryTab === "All Roles" || role.category === selectedCategoryTab;
      const matchesSearch =
        !roleSearch.trim() ||
        role.title.toLowerCase().includes(roleSearch.toLowerCase()) ||
        role.desc.toLowerCase().includes(roleSearch.toLowerCase()) ||
        role.requiredSkills.some((s) => s.toLowerCase().includes(roleSearch.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [selectedCategoryTab, roleSearch]);

  const activeRole = useMemo(() => {
    return ROLE_CATALOG.find((r) => r.id === selectedRoleId) || ROLE_CATALOG[0];
  }, [selectedRoleId]);

  const requiredSkills = activeRole.requiredSkills;
  const recommendedSkills = activeRole.recommendedSkills || [];

  const matchedSkills = requiredSkills.filter((s) =>
    currentSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = requiredSkills.filter(
    (s) => !currentSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );

  const matchedRecommended = recommendedSkills.filter((s) =>
    currentSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );
  const missingRecommended = recommendedSkills.filter(
    (s) => !currentSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );

  const matchPercentage = requiredSkills.length
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  const handleToggleSkill = async (skill) => {
    const exists = currentSkills.some((s) => s.toLowerCase() === skill.toLowerCase());
    const updated = exists
      ? currentSkills.filter((s) => s.toLowerCase() !== skill.toLowerCase())
      : [...currentSkills, skill];

    try {
      await patchProfile({ skills: updated });
      toast.success(exists ? `Removed ${skill}` : `Added ${skill} to your skills`);
    } catch {
      toast.error("Could not update skill");
    }
  };

  const handleAddAllMissing = async () => {
    if (missingSkills.length === 0) return;
    const updated = Array.from(new Set([...currentSkills, ...missingSkills]));
    try {
      await patchProfile({ skills: updated });
      toast.success(`Added ${missingSkills.length} mandatory skills for ${activeRole.title}!`);
    } catch {
      toast.error("Could not update skills");
    }
  };

  // Filter skills in library
  const filteredSkillCategories = useMemo(() => {
    return SKILL_CATEGORIES.map((cat) => {
      const skills = cat.skills.filter((skill) => {
        const matchesCategory = activeSkillCategory === "All" || cat.name === activeSkillCategory;
        const matchesSearch =
          !skillSearch.trim() || skill.toLowerCase().includes(skillSearch.toLowerCase());
        return matchesCategory && matchesSearch;
      });
      return { ...cat, skills };
    }).filter((cat) => cat.skills.length > 0);
  }, [activeSkillCategory, skillSearch]);

  const totalCatalogSkills = useMemo(() => {
    const set = new Set();
    SKILL_CATEGORIES.forEach((c) => c.skills.forEach((s) => set.add(s)));
    return set.size;
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Skill Gap & Job Role Analysis"
        subtitle="Benchmark your skills against real market requirements across 14+ software engineering & placement profiles."
      />

      {/* TOP: TARGET ROLE SELECTOR & READINESS ANALYSIS */}
      <div className="space-y-4">
        {/* MOBILE ONLY ROLE PICKER (screens < lg) */}
        <div className="block lg:hidden">
          <Card className="border-border">
            <CardContent className="p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <Target className="size-3.5 text-primary" /> Target Role:
                </label>
                <Badge variant="secondary" className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {matchPercentage}% Match · {activeRole.package}
                </Badge>
              </div>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              >
                {ROLE_CATALOG.map((r) => {
                  const reqs = r.requiredSkills;
                  const matches = reqs.filter((s) =>
                    currentSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
                  );
                  const pct = Math.round((matches.length / reqs.length) * 100);
                  return (
                    <option key={r.id} value={r.id}>
                      {r.title} ({pct}% Match · {r.package})
                    </option>
                  );
                })}
              </select>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
          {/* DESKTOP ONLY: Comprehensive Role Selector Sidebar */}
          <Card className="border-border hidden lg:flex flex-col h-full">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 font-display">
                  <Target className="size-4 text-primary" /> Target Roles ({ROLE_CATALOG.length})
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  Market Aligned
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Select a placement profile to analyze your competency coverage.
              </CardDescription>

              {/* Search Input */}
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search job roles or skills…"
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  className="pl-8 text-xs h-8"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1 overflow-x-auto pt-2 pb-1 scrollbar-none">
                {CATEGORY_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedCategoryTab(tab)}
                    className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors ${
                      selectedCategoryTab === tab
                        ? "bg-primary text-primary-foreground font-medium"
                        : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-2 space-y-1 overflow-y-auto max-h-[480px]">
              {filteredRoles.map((role) => {
                const reqs = role.requiredSkills;
                const matches = reqs.filter((s) =>
                  currentSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
                );
                const pct = Math.round((matches.length / reqs.length) * 100);
                const isSelected = selectedRoleId === role.id;

                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-all border ${
                      isSelected
                        ? "bg-primary/10 border-primary text-foreground shadow-xs font-medium"
                        : "border-transparent hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-foreground truncate">{role.title}</span>
                      <span
                        className={`text-[10px] font-bold ${
                          pct >= 75
                            ? "text-emerald-500"
                            : pct >= 50
                            ? "text-amber-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {pct}% Match
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{role.category}</span>
                      <span>{role.package}</span>
                    </div>

                    <div className="mt-1.5 w-full bg-secondary rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-primary"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}

              {filteredRoles.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No roles match your search filter.
                </div>
              )}
            </CardContent>
          </Card>

          {/* RIGHT: Detailed Readiness Breakdown */}
          <Card className="border-border min-w-0">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">{activeRole.title}</h3>
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                      {activeRole.demand}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {activeRole.experience}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                    {activeRole.desc}
                  </p>
                </div>

                {/* Match Score Badge */}
                <div className="w-full sm:w-auto shrink-0 bg-secondary/30 border border-border/80 p-3 rounded-xl flex sm:flex-col items-center sm:items-end justify-between gap-1">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Coverage Score
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {matchedSkills.length} of {requiredSkills.length} Skills
                    </div>
                  </div>
                  <div className="font-display text-2xl sm:text-3xl font-extrabold text-primary">
                    {matchPercentage}%
                  </div>
                </div>
              </div>

              {/* Progress Bar with Milestones */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Current Readiness Level</span>
                  <span className="font-semibold text-foreground">
                    {matchPercentage >= 80
                      ? "🎉 Placement Ready"
                      : matchPercentage >= 50
                      ? "⚡ Moderate Preparation"
                      : "🌱 Foundational Phase"}
                  </span>
                </div>
                <Progress value={matchPercentage} className="h-2.5" />
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Estimated CTC:</span>
                  <Badge variant="secondary" className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {activeRole.package}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {missingSkills.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddAllMissing}
                      className="text-xs h-8 gap-1.5 flex-1 sm:flex-none"
                    >
                      <CheckCircle2 className="size-3.5 text-primary" /> Add Missing ({missingSkills.length})
                    </Button>
                  )}
                  <Button asChild size="sm" className="text-xs h-8 gap-1.5 flex-1 sm:flex-none">
                    <Link to="/interview">
                      <Sparkles className="size-3.5" /> Practice Mock Interview →
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-6">
              {/* Interactive Node-Based Competency Constellation Graph */}
              <div className="rounded-xl border border-border/80 bg-secondary/20 p-3.5 sm:p-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <Sparkles className="size-3.5 text-primary" /> Placement Competency Constellation & Roadmap
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">4 Core Milestones</span>
                </div>

                {/* 4 Node Steps with Visual Status - Responsive on all screen sizes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
                  {[
                    {
                      step: "01",
                      title: "Languages & Core",
                      desc: "Java / Python / OOP / DSA",
                      skills: ["Java", "Python", "C++", "C", "Data Structures", "Algorithms", "OOP", "JavaScript", "TypeScript"],
                    },
                    {
                      step: "02",
                      title: "Frameworks & APIs",
                      desc: "Spring Boot / React / REST",
                      skills: ["Spring Boot", "Hibernate", "REST APIs", "Microservices", "React", "Node.js", "Express.js"],
                    },
                    {
                      step: "03",
                      title: "Data & Storage",
                      desc: "SQL / DBMS / Redis / Mongo",
                      skills: ["SQL", "DBMS", "MySQL", "PostgreSQL", "MongoDB", "Redis"],
                    },
                    {
                      step: "04",
                      title: "Cloud & Delivery",
                      desc: "AWS / Docker / Git / CI-CD",
                      skills: ["Git", "Docker", "AWS", "Kubernetes", "Linux", "CI/CD", "System Design"],
                    },
                  ].map((node) => {
                    const acquiredCount = node.skills.filter((s) =>
                      currentSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
                    ).length;
                    const isNodeActive = acquiredCount > 0;

                    return (
                      <div
                        key={node.step}
                        className={`p-3 rounded-xl border transition-all text-xs relative flex flex-col justify-between ${
                          isNodeActive
                            ? "bg-card border-primary/40 shadow-sm shadow-primary/10"
                            : "bg-secondary/40 border-border/60 opacity-60"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isNodeActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}>
                              STAGE {node.step}
                            </span>
                            {isNodeActive ? (
                              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            ) : (
                              <span className="size-2 rounded-full bg-muted-foreground/40" />
                            )}
                          </div>
                          <h5 className="font-semibold text-xs text-foreground break-words">{node.title}</h5>
                          <p className="text-[10px] text-muted-foreground break-words mt-0.5">{node.desc}</p>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-border/40 text-[10px] font-medium flex items-center justify-between text-muted-foreground">
                          <span>{acquiredCount} active</span>
                          <span className={isNodeActive ? "text-emerald-500 font-bold" : ""}>
                            {isNodeActive ? "Illuminated" : "Locked"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            {/* MANDATORY COMPETENCIES */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Award className="size-4 text-primary" />
                  <h4 className="font-semibold text-sm">Mandatory Technical Requirements</h4>
                  <span className="text-xs text-muted-foreground">
                    ({matchedSkills.length}/{requiredSkills.length} acquired)
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Acquired Skills */}
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Check className="size-3.5" /> Ready in Profile ({matchedSkills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => handleToggleSkill(skill)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
                        title="Click to toggle or remove from profile"
                      >
                        <Check className="size-3" /> {skill}
                      </button>
                    ))}
                    {matchedSkills.length === 0 && (
                      <p className="text-xs text-muted-foreground py-1">
                        None of the mandatory competencies are added to your profile yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="rounded-lg border border-border bg-secondary/20 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="size-3.5" /> Skill Gaps to Prepare ({missingSkills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {missingSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => handleToggleSkill(skill)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-background border border-border text-foreground hover:border-primary hover:text-primary transition-colors group"
                        title="Click to add this skill to your profile"
                      >
                        <Plus className="size-3 text-muted-foreground group-hover:text-primary" /> {skill}
                      </button>
                    ))}
                    {missingSkills.length === 0 && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium py-1">
                        🎉 All mandatory skills for this role are satisfied!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RECOMMENDED & GOOD-TO-HAVE SKILLS */}
            {recommendedSkills.length > 0 && (
              <div className="pt-2 border-t border-border/60">
                <div className="flex items-center gap-2 mb-2.5">
                  <TrendingUp className="size-4 text-primary" />
                  <h4 className="font-semibold text-sm">Recommended High-Impact Additions</h4>
                  <span className="text-xs text-muted-foreground">
                    (Gives a competitive edge in interviews)
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {recommendedSkills.map((skill) => {
                    const hasSkill = currentSkills.some(
                      (cs) => cs.toLowerCase() === skill.toLowerCase()
                    );
                    return (
                      <button
                        key={skill}
                        onClick={() => handleToggleSkill(skill)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                          hasSkill
                            ? "bg-primary/15 text-primary border border-primary/30 font-medium"
                            : "bg-secondary/40 border border-border/80 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {hasSkill ? <Check className="size-3" /> : <Plus className="size-3" />}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>

      {/* BOTTOM: COMPREHENSIVE CATEGORIZED SKILL LIBRARY */}
      <Card className="border-border">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2 font-display">
                <BrainCircuit className="size-5 text-primary" /> Placement Competency Skill Library ({totalCatalogSkills} Skills)
              </CardTitle>
              <CardDescription className="text-xs">
                Click any skill badge to toggle it on/off in your profile. Your mock interview questions, AI feedback, and resume ATS benchmarks match directly to these skills.
              </CardDescription>
            </div>

            {/* Skill Library Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter skill library…"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pt-2 pb-1 scrollbar-none">
            <button
              onClick={() => setActiveSkillCategory("All")}
              className={`px-3 py-1 rounded-full text-xs transition-colors whitespace-nowrap ${
                activeSkillCategory === "All"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              All Categories ({SKILL_CATEGORIES.length})
            </button>
            {SKILL_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveSkillCategory(cat.name)}
                className={`px-3 py-1 rounded-full text-xs transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeSkillCategory === cat.name
                    ? "bg-primary text-primary-foreground font-medium"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <cat.icon className="size-3" />
                {cat.name}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            {filteredSkillCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.name}
                  className="rounded-xl border border-border/80 p-4 bg-card/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                      <Icon className="size-4 text-primary" />
                      {category.name}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {category.skills.filter((s) =>
                        currentSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
                      ).length}
                      /{category.skills.length} added
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {category.skills.map((skill) => {
                      const isActive = currentSkills.some(
                        (cs) => cs.toLowerCase() === skill.toLowerCase()
                      );
                      const isRequiredForActiveRole = activeRole.requiredSkills.some(
                        (rs) => rs.toLowerCase() === skill.toLowerCase()
                      );

                      return (
                        <button
                          key={skill}
                          onClick={() => handleToggleSkill(skill)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all inline-flex items-center gap-1.5 ${
                            isActive
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : isRequiredForActiveRole
                              ? "border border-amber-500/50 bg-amber-500/5 text-foreground hover:border-primary hover:text-primary"
                              : "border border-border/80 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                          title={
                            isRequiredForActiveRole
                              ? `Required for ${activeRole.title} - Click to toggle`
                              : "Click to toggle skill in your profile"
                          }
                        >
                          {skill}
                          {isActive ? (
                            <Check className="size-3" />
                          ) : isRequiredForActiveRole ? (
                            <span className="text-[10px] text-amber-500 font-bold">★</span>
                          ) : (
                            <Plus className="size-3 opacity-60" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSkillCategories.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-xs">
              No skills match your search query.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
