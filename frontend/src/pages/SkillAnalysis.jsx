import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { SKILL_LIBRARY } from "@/lib/data/questions";
import { BrainCircuit, Check, Plus, Target, Award } from "lucide-react";

const ROLE_REQUIREMENTS = {
  "Java Full Stack Developer": [
    "Java",
    "Spring Boot",
    "Hibernate",
    "SQL",
    "DBMS",
    "React",
    "JavaScript",
    "HTML/CSS",
    "Git",
    "REST APIs",
  ],
  "Java Backend Developer": [
    "Java",
    "Spring Boot",
    "Hibernate",
    "SQL",
    "DBMS",
    "Data Structures",
    "Algorithms",
    "System Design",
    "Git",
  ],
  "Frontend Developer": [
    "React",
    "JavaScript",
    "HTML/CSS",
    "TypeScript",
    "Tailwind CSS",
    "Git",
    "REST APIs",
  ],
  "Software Engineer (Campus)": [
    "Java",
    "C++",
    "Python",
    "Data Structures",
    "Algorithms",
    "DBMS",
    "OOP",
    "Operating Systems",
    "Computer Networks",
  ],
};

export default function SkillAnalysis() {
  return (
    <AppShell>
      <SkillBody />
    </AppShell>
  );
}

function SkillBody() {
  const { user, patchProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState("Java Full Stack Developer");

  if (!user) return null;

  const currentSkills = user.skills || [];
  const requiredSkills = ROLE_REQUIREMENTS[selectedRole] || [];

  const matchedSkills = requiredSkills.filter((s) =>
    currentSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = requiredSkills.filter(
    (s) => !currentSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );

  const matchPercentage = requiredSkills.length
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  const handleToggleSkill = async (skill) => {
    const exists = currentSkills.includes(skill);
    const updated = exists
      ? currentSkills.filter((s) => s !== skill)
      : [...currentSkills, skill];

    try {
      await patchProfile({ skills: updated });
      toast.success(exists ? `Removed ${skill}` : `Added ${skill} to your skills`);
    } catch {
      toast.error("Could not update skill");
    }
  };

  return (
    <>
      <PageHeader
        title="Skill Analysis"
        subtitle="Compare your acquired skills against market requirements for your target placement role."
      />

      {/* Role Selection & Match Bar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr] mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="size-5 text-primary" /> Target Role
            </CardTitle>
            <CardDescription>Select a profile to analyze requirement coverage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.keys(ROLE_REQUIREMENTS).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedRole === role
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {role}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{selectedRole} Readiness</CardTitle>
                <CardDescription>
                  You possess {matchedSkills.length} of {requiredSkills.length} key competencies
                </CardDescription>
              </div>
              <span className="font-display text-3xl font-bold text-primary">
                {matchPercentage}%
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={matchPercentage} className="h-3" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4 bg-primary/5">
                <div className="flex items-center gap-2 mb-2 font-medium text-sm text-primary">
                  <Award className="size-4" /> Ready Competencies ({matchedSkills.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchedSkills.map((s) => (
                    <Badge key={s} variant="secondary" className="gap-1">
                      <Check className="size-3 text-primary" /> {s}
                    </Badge>
                  ))}
                  {matchedSkills.length === 0 && (
                    <p className="text-xs text-muted-foreground">None added yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-border p-4 bg-muted/40">
                <div className="flex items-center gap-2 mb-2 font-medium text-sm text-muted-foreground">
                  <Plus className="size-4" /> Recommended to Learn ({missingSkills.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {missingSkills.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleToggleSkill(s)}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      title="Click to add to your profile"
                    >
                      <Plus className="size-3" /> {s}
                    </button>
                  ))}
                  {missingSkills.length === 0 && (
                    <p className="text-xs text-primary font-medium">All role requirements matched!</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Available Skills Library */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BrainCircuit className="size-5 text-primary" /> Complete Skill Library
          </CardTitle>
          <CardDescription>
            Click any skill to toggle it on or off in your profile. Questions in mock interviews are matched to these.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SKILL_LIBRARY.map((skill) => {
              const active = currentSkills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => handleToggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {skill} {active ? "✓" : "+"}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
