import { Link, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { register } from "@/lib/api/auth";
import { analyzeResume } from "@/lib/api/resume";
import { useAuth } from "@/hooks/useAuth";
import { Upload, FileCheck2 } from "lucide-react";
import { HireSenseLogo } from "@/components/HireSenseLogo";

export default function Register() {
  const navigate = useNavigate();
  const { user, ready, setUser } = useAuth();
  const fileRef = useRef(null);

  useEffect(() => {
    if (ready && user) {
      navigate("/dashboard");
    }
  }, [ready, user, navigate]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [education, setEducation] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [resume, setResume] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onResume(file) {
    if (!file) return;
    setParsing(true);
    try {
      const analysis = await analyzeResume(file);
      setResume(analysis);
      if (!name && analysis.name) setName(analysis.name);
      if (!email && analysis.email) setEmail(analysis.email);
      if (!education) setEducation(analysis.education);
      if (!targetRole) setTargetRole(analysis.targetRole);
      toast.success(`Resume read — ${analysis.skills.length} skills detected`);
    } catch {
      toast.error("Could not read that file. Try a PDF, DOCX or TXT resume.");
    } finally {
      setParsing(false);
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    try {
      const user = await register({
        name,
        email,
        password,
        education,
        targetRole,
        skills: resume?.skills || [],
        resumeFileName: resume?.fileName,
        resumeText: resume ? JSON.stringify(resume) : undefined,
      });
      setUser(user);
      toast.success("Account created");
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex justify-center">
          <HireSenseLogo size="lg" showBadge={true} href="/" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Add your resume and we will fill in your skills, education and target role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div
                className="rounded-lg border border-dashed border-border bg-secondary/40 p-4 text-center cursor-pointer"
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter") fileRef.current?.click();
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  className="hidden"
                  onChange={(event) => onResume(event.target.files?.[0])}
                />
                {resume ? (
                  <div className="space-y-2">
                    <FileCheck2 className="mx-auto size-6 text-primary" />
                    <p className="text-sm font-medium">{resume.fileName}</p>
                    <div className="flex flex-wrap justify-center gap-1">
                      {resume.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Click to replace</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="mx-auto size-6 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {parsing ? "Reading your resume…" : "Upload your resume (optional)"}
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, DOCX or TXT</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    value={education}
                    onChange={(event) => setEducation(event.target.value)}
                    placeholder="B.Tech Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Target role</Label>
                  <Input
                    id="role"
                    value={targetRole}
                    onChange={(event) => setTargetRole(event.target.value)}
                    placeholder="Java Backend Developer"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    required
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                  />
                </div>
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Creating account…" : "Register"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already registered?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
