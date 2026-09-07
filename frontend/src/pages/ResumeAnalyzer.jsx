import { useState, useRef } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { analyzeResume } from "@/lib/api/resume";
import { Upload, FileCheck2, CheckCircle2, AlertCircle, Sparkles, BrainCircuit } from "lucide-react";

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
      toast.success("Resume analyzed successfully!");
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

  return (
    <>
      <PageHeader
        title="Resume Analyzer"
        subtitle="Get an instant ATS readiness score, detected skills, and key areas to enhance."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Resume</CardTitle>
              <CardDescription>Upload PDF, DOCX, or TXT format</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg border-2 border-dashed border-border bg-secondary/30 p-8 text-center cursor-pointer hover:bg-secondary/50 transition-colors"
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
                  <div className="space-y-2">
                    <Sparkles className="mx-auto size-8 animate-spin text-primary" />
                    <p className="text-sm font-medium">Extracting skills & evaluating ATS score…</p>
                  </div>
                ) : analysis ? (
                  <div className="space-y-2">
                    <FileCheck2 className="mx-auto size-8 text-primary" />
                    <p className="text-sm font-semibold">{analysis.fileName}</p>
                    <p className="text-xs text-muted-foreground">Click to upload a different resume</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto size-8 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to select or drop your resume</p>
                    <p className="text-xs text-muted-foreground">Supports PDF, DOCX, TXT</p>
                  </div>
                )}
              </div>

              {user?.resumeFileName && !analysis && (
                <div className="mt-4 p-3 rounded-lg border border-border bg-muted/40 text-sm">
                  <span className="text-muted-foreground">Current resume on profile: </span>
                  <span className="font-medium text-foreground">{user.resumeFileName}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Extracted Profile Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Candidate Name: </span>
                  <span className="font-medium">{analysis.name || user?.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Education: </span>
                  <span className="font-medium">{analysis.education || user?.education || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Inferred Target Role: </span>
                  <span className="font-medium">{analysis.targetRole || user?.targetRole || "Software Engineer"}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          {analysis ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>ATS Readiness Score</span>
                    <span className="font-display text-2xl font-bold text-primary">{analysis.score}/100</span>
                  </CardTitle>
                  <CardDescription>
                    {analysis.score >= 75
                      ? "Excellent! Your resume covers core requirements well."
                      : analysis.score >= 50
                      ? "Moderate match. Consider adding more project details and missing keywords."
                      : "Needs improvement. Fill missing core competencies to stand out."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={analysis.score} className="h-3" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BrainCircuit className="size-4 text-primary" />
                    Detected Skills ({analysis.skills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-primary" /> Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                      {analysis.strengths.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertCircle className="size-4 text-amber-500" /> Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                      {analysis.suggestions.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[300px]">
              <CardContent className="text-center py-12">
                <FileCheck2 className="mx-auto size-12 text-muted-foreground mb-3 opacity-40" />
                <h3 className="font-semibold text-lg">No resume analyzed yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  Upload your resume on the left to see your ATS score, detected skills, and personalized feedback.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
