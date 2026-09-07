import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BrainCircuit,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Mic,
  Target,
  User as UserIcon,
} from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/interview", label: "Mock Interview", icon: Mic },
  { to: "/prepare", label: "Placement Prep", icon: Target },
  { to: "/assistant", label: "AI Assistant", icon: MessageSquare },
  { to: "/resume", label: "Resume Analyzer", icon: FileText },
  { to: "/skills", label: "Skill Analysis", icon: BrainCircuit },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

export function AppShell({ children }) {
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    if (ready && !user) navigate("/login");
  }, [ready, user, navigate]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Link to="/dashboard" className="font-display text-xl font-bold tracking-tight">
            Hire<span className="text-primary">Sense</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                signOut();
                navigate("/login");
              }}
            >
              <LogOut className="mr-1 size-4" /> Sign out
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 pb-2">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-1 text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}
