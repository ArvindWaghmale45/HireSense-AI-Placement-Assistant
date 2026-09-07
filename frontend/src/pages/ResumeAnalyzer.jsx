import { useState, useRef } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card3D } from "@/components/ui/Card3D";
import { useAuth } from "@/hooks/useAuth";
import { analyzeResume } from "@/lib/api/resume";
import {
  Upload,
  FileText,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BrainCircuit,
  FolderGit2,
  ScanLine,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function ResumeAnalyzer() {
  return (
    <AppShell>
      <ResumeBody />
    </AppShell>
  );
}

function ResumeBody() {
  const { user, patchProfile } = useAuth();
  const fileRef = useRef(null);
  const [analysis, setAnalysis] = useState(null);
  const [parsing, setParsing] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    setParsing(true);
    try {
      const result = await analyzeResume(file);
      setAnalysis(result);
      toast.success("Resume scanned & evaluated with neural ATS heuristics!");
      if (user) {
        await patchProfile({
          resumeFileName: result.fileName,
          resumeText: result.resumeText ? result.resumeText.slice(0, 8000) : "",
          skills: Array.from(new Set([...(user.skills || []), ...result.skills])),
          ...(result.education && !user.education ? { education: result.education } : {}),
          ...(result.targetRole && !user.targetRole ? { targetRole: result.targetRole } : {}),
        });
      }
    } catch {
      toast.error("Could not parse file. Try a PDF, DOCX, or TXT file.");
    } finally {
      setParsing(false);
    }
  };

  // Radial score gauge constants
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const score = analysis?.score ?? 0;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume & ATS Readiness Analyzer"
        subtitle="Upload your resume to check your ATS match score, extract technical skills, and identify missing keywords for your target role."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.5fr]">
        {/* LEFT COLUMN: RESUME UPLOAD DROPZONE & CANDIDATE DETAILS */}
        <div className="space-y-6">
          <Card className="border-border/80 bg-card overflow-hidden relative shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <FileText className="size-4 text-primary" /> Upload Resume
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono border-border/80 text-muted-foreground">
                  PDF • DOCX • TXT
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Upload your updated CV for automated parsing and scoring.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="relative rounded-xl border-2 border-dashed border-border/80 bg-secondary/20 p-8 text-center cursor-pointer hover:bg-secondary/40 hover:border-primary/50 transition-all overflow-hidden group"
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                />

                {parsing ? (
                  <div className="space-y-3 py-4">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary animate-pulse">
                      <Sparkles className="size-6 animate-spin" />
                    </div>
                    <p className="text-sm font-semibold text-primary">Analyzing Resume…</p>
                    <p className="text-xs text-muted-foreground">
                      Extracting technical skills, projects, and keywords…
                    </p>
                  </div>
                ) : analysis ? (
                  <div className="space-y-2.5 py-3">
                    <div className="size-12 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                      <FileCheck2 className="size-6" />
                    </div>
                    <p className="text-sm font-bold text-foreground truncate max-w-xs mx-auto">
                      {analysis.fileName}
                    </p>
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      ✓ Analyzed Successfully
                    </Badge>
                    <p className="text-xs text-muted-foreground pt-1">
                      Click to upload another version
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 py-4">
                    <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Upload className="size-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Drop your resume here or browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        High-speed parsing for campus placement readiness
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {user?.resumeFileName && !analysis && (
                <div className="mt-4 p-3 rounded-lg border border-border/80 bg-muted/40 text-xs flex items-center justify-between">
                  <span className="text-muted-foreground">Active profile resume:</span>
                  <span className="font-semibold text-foreground font-mono truncate max-w-[180px]">
                    {user.resumeFileName}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Extraction Details Card */}
          {analysis && (
            <Card className="border-border/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Layers className="size-4 text-primary" /> Parsed Candidate Telemetry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border/60">
                  <span className="text-muted-foreground">Candidate Name:</span>
                  <span className="font-semibold">{analysis.name || user?.name || "Candidate"}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border/60">
                  <span className="text-muted-foreground">Education Degree:</span>
                  <span className="font-semibold">{analysis.education || user?.education || "Not specified"}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border/60">
                  <span className="text-muted-foreground">Inferred Target Role:</span>
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    {analysis.targetRole || user?.targetRole || "Software Engineer"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: 3D ATS RADIAL SCORE GAUGE & INTERACTIVE SKILL CHIPS */}
        <div>
          {analysis ? (
            <div className="space-y-6">
              {/* Circular Holographic ATS Score Gauge */}
              <Card className="border-primary/25 bg-gradient-to-br from-card via-card/90 to-primary/5 shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                      <ShieldCheck className="size-5 text-primary" /> ATS Placement Readiness Gauge
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        score >= 75
                          ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                          : score >= 50
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                      }`}
                    >
                      {score >= 75 ? "Tier 1 ATS Match" : score >= 50 ? "Solid Baseline" : "Action Needed"}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Calibrated with modern automated screening filters used by Fortune 500 recruiting teams.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex flex-col sm:flex-row items-center gap-6 justify-around">
                    {/* Animated Circular Gauge */}
                    <div className="relative size-36 flex items-center justify-center">
                      <svg className="size-full -rotate-90" viewBox="0 0 130 130">
                        <circle
                          cx="65"
                          cy="65"
                          r={radius}
                          className="stroke-muted/40"
                          strokeWidth="9"
                          fill="transparent"
                        />
                        <motion.circle
                          cx="65"
                          cy="65"
                          r={radius}
                          className={
                            score >= 75
                              ? "stroke-emerald-500"
                              : score >= 50
                              ? "stroke-primary"
                              : "stroke-amber-500"
                          }
                          strokeWidth="9"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          strokeLinecap="round"
                          fill="transparent"
                          style={{
                            filter: "drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))",
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <span className="font-display text-3xl font-extrabold tracking-tight">
                          {score}
                        </span>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                          out of 100
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs max-w-sm text-center sm:text-left">
                      <h4 className="font-semibold text-sm">
                        {score >= 75
                          ? "High ATS Pass Probability"
                          : score >= 50
                          ? "Moderate Match with Growth Potential"
                          : "Critical Keywords Missing"}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {score >= 75
                          ? "Your resume strongly emphasizes core engineering competencies, frameworks, and actionable project bullets."
                          : score >= 50
                          ? "Decent foundation. Ensure measurable metrics (e.g., % throughput, latency) accompany your project descriptions."
                          : "Include specific language keywords (Java, SQL, Spring Boot) and quantify outcomes to clear automated recruiter screening."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive 3D Skill Pill Tags */}
              <Card className="border-border/80">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-display flex items-center gap-2">
                      <BrainCircuit className="size-4 text-primary" /> Detected Skills ({analysis.skills.length})
                    </CardTitle>
                    <span className="text-[11px] text-muted-foreground">
                      Auto-synced to your placement profile
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills.map((skill) => (
                      <motion.div
                        key={skill}
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-primary/30 bg-primary/10 text-primary shadow-xs cursor-default transition-colors hover:bg-primary/20"
                      >
                        <CheckCircle2 className="size-3 text-primary" />
                        <span>{skill}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Projects Breakdown */}
              {analysis.projects && analysis.projects.length > 0 && (
                <Card className="border-border/80">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-display flex items-center gap-2">
                      <FolderGit2 className="size-4 text-primary" /> Highlighted Projects ({analysis.projects.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-border/80 bg-card/60 space-y-1.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-semibold text-sm">{proj.title}</h4>
                          <div className="flex flex-wrap gap-1">
                            {(proj.techStack || []).map((t) => (
                              <Badge key={t} variant="outline" className="text-[10px] py-0 border-primary/30 text-primary">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {proj.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {proj.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Strengths & Recommendations */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-4" /> Detected Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {analysis.strengths.map((s) => (
                        <li key={s} className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <AlertCircle className="size-4" /> Recommended Additions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {analysis.suggestions.map((s) => (
                        <li key={s} className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[360px] border-dashed">
              <CardContent className="text-center py-12">
                <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <ScanLine className="size-8" />
                </div>
                <h3 className="font-display font-bold text-lg">No Resume Scanned Yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1.5 leading-relaxed">
                  Upload your CV or technical resume on the left to start the 3D laser scan and receive instant ATS scoring & rubric fixes.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
