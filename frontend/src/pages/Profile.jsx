import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserInterviews, listInterviews } from "@/lib/api/interviews";
import { listAttempts } from "@/lib/api/prep";
import { SKILL_LIBRARY } from "@/lib/data/questions";

export default function Profile() {
  return (
    <AppShell>
      <ProfileBody />
    </AppShell>
  );
}

function ProfileBody() {
  const { user, patchProfile } = useAuth();
  const [name, setName] = useState("");
  const [education, setEducation] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [skills, setSkills] = useState([]);
  const [saving, setSaving] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setEducation(user.education || "");
    setTargetRole(user.targetRole || "");
    setSkills(user.skills || []);
    setInterviews(listInterviews(user.id));
    setAttempts(listAttempts(user.id));

    fetchUserInterviews().then((items) => {
      if (items && items.length > 0) {
        setInterviews(items);
      }
    });
  }, [user]);

  if (!user) return null;

  const toggleSkill = (skill) =>
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((item) => item !== skill) : [...prev, skill],
    );

  const save = async () => {
    setSaving(true);
    try {
      await patchProfile({ name, education, targetRole, skills });
      toast.success("Profile updated");
    } catch {
      toast.error("Could not save your profile");
    } finally {
      setSaving(false);
    }
  };

  const avg = interviews.length
    ? Math.round((interviews.reduce((s, i) => s + (Number(i?.score) || 0), 0) / interviews.length) * 10) / 10
    : 0;
  const best = interviews.reduce((m, i) => Math.max(m, Number(i?.score) || 0), 0);
  const technical = interviews.filter((i) => i.type === "TECHNICAL");
  const hr = interviews.filter((i) => i.type === "HR");
  const mcqTotal = attempts.reduce((s, a) => s + (Number(a?.total) || 0), 0);
  const mcqCorrect = attempts.reduce((s, a) => s + (Number(a?.correct) || 0), 0);

  return (
    <>
      <PageHeader title="Profile & Analytics" subtitle="Your details and how your practice is going." />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your details</CardTitle>
            <CardDescription>Skills here decide which questions you get.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="B.E. Computer Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Target role</Label>
              <Input
                id="role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Java Backend Developer"
              />
            </div>
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2">
                {SKILL_LIBRARY.map((skill) => {
                  const on = skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={
                        on
                          ? "rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground"
                          : "rounded-full border border-border px-3 py-1 text-sm text-muted-foreground hover:bg-accent"
                      }
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
            {user.resumeFileName ? (
              <p className="text-sm text-muted-foreground">
                Resume on file: <span className="text-foreground">{user.resumeFileName}</span>
              </p>
            ) : null}
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analytics</CardTitle>
              <CardDescription>Based on every session you have completed.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Stat label="Interviews" value={String(interviews.length)} />
              <Stat label="Average score" value={interviews.length ? `${avg}/10` : "—"} />
              <Stat label="Best score" value={best ? `${best}/10` : "—"} />
              <Stat
                label="MCQ accuracy"
                value={mcqTotal ? `${Math.round((mcqCorrect / mcqTotal) * 100)}%` : "—"}
              />
              <Stat label="Technical rounds" value={String(technical.length)} />
              <Stat label="HR rounds" value={String(hr.length)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent focus areas</CardTitle>
              <CardDescription>Topics flagged in your latest feedback.</CardDescription>
            </CardHeader>
            <CardContent>
              {interviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Complete a mock interview to see your focus areas.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(interviews.flatMap((i) => i.improvements)))
                    .slice(0, 12)
                    .map((item) => (
                      <Badge key={item} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
