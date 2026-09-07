import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HireSenseLogo } from "@/components/HireSenseLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  BrainCircuit,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Mic,
  Target,
  User as UserIcon,
  Sparkles,
} from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-500" },
  { to: "/interview", label: "Mock Interview", icon: Mic, color: "text-indigo-500" },
  { to: "/prepare", label: "Placement Prep", icon: Target, color: "text-amber-500" },
  { to: "/assistant", label: "AI Assistant", icon: MessageSquare, color: "text-sky-500" },
  { to: "/resume", label: "Resume Analyzer", icon: FileText, color: "text-emerald-500" },
  { to: "/skills", label: "Skill Analysis", icon: BrainCircuit, color: "text-rose-500" },
  { to: "/profile", label: "Profile", icon: UserIcon, color: "text-violet-500" },
];

export function AppShell({ children }) {
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (ready && !user && !isLoggingOut) {
      navigate("/login", { state: { from: pathname }, replace: true });
    }
  }, [ready, user, navigate, pathname, isLoggingOut]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs font-medium text-muted-foreground">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-primary/20">
      {/* Subtle ambient gradient mesh for depth */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-40 dark:opacity-25">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[450px] bg-blue-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 -right-20 w-[450px] h-[400px] bg-violet-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-20 left-1/3 w-[550px] h-[350px] bg-emerald-500/10 blur-[140px] rounded-full" />
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <HireSenseLogo size="sm" showBadge={true} href="/dashboard" />

            <span className="hidden sm:inline-flex text-[11px] font-medium text-muted-foreground border-l border-border/70 pl-3">
              Placement Preparation
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle size="sm" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-secondary/50 text-xs">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-foreground max-w-[120px] sm:max-w-none truncate">
                {user?.name || user?.email || "Candidate"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-1.5 hover:text-destructive hover:border-destructive/40"
              onClick={() => {
                setIsLoggingOut(true);
                signOut();
                navigate("/", { replace: true });
              }}
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>

        {/* Tab Navigation with Fluid Active Indicator */}
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 pb-2 scrollbar-none">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="active-nav-pill"
                    className="absolute inset-0 rounded-full bg-primary shadow-xs -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <item.icon className={cn("size-3.5", !active && item.color)} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main Container with Smooth Motion */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-8">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Floating Bottom Navigation Dock */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {[
          { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { to: "/interview", label: "Interview", icon: Mic },
          { to: "/prepare", label: "Prep", icon: Target },
          { to: "/resume", label: "Resume", icon: FileText },
          { to: "/profile", label: "Profile", icon: UserIcon },
        ].map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors",
                active ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("size-5 mb-0.5", active ? "text-primary scale-110 transition-transform" : "text-muted-foreground")} />
              <span>{item.label}</span>
              {active && (
                <span className="size-1 rounded-full bg-primary mt-0.5 shadow-xs" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function PageHeader({ title, subtitle, badge }) {
  return (
    <div className="mb-8">
      {badge && (
        <div className="mb-2">
          <Badge variant="outline" className="text-xs font-medium text-primary border-primary/30">
            {badge}
          </Badge>
        </div>
      )}
      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1.5 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
