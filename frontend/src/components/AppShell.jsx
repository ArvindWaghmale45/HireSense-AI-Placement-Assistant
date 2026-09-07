import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Sparkles,
  Zap,
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
          <p className="text-xs font-mono uppercase tracking-widest text-primary">Initializing Neural Studio…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-primary/20">
      {/* Futuristic Ambient Volumetric Glow Mesh (Background) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[450px] bg-primary/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 -right-20 w-[450px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-20 left-1/3 w-[550px] h-[350px] bg-purple-500/10 blur-[140px] rounded-full" />
      </div>

      {/* Frosted Glass HUD Header */}
      <header className="sticky top-0 z-40 border-b border-primary/20 bg-card/75 backdrop-blur-xl shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary via-blue-600 to-cyan-400 text-primary-foreground shadow-sm shadow-primary/25">
              <Mic className="size-4" />
            </span>
            <span>
              Hire<span className="text-primary bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">Sense</span>
            </span>
          </Link>

          {/* Telemetry Status Badge */}
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-border/60">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono text-muted-foreground">
              Campus AI Lab <span className="text-emerald-500 font-semibold">• Online</span>
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-secondary/40 text-xs">
              <UserIcon className="size-3.5 text-primary" />
              <span className="font-medium text-foreground">
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

        {/* HUD Pill Navigation with Dynamic Active Pill Indicator */}
        <nav className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-4 sm:px-6 pb-2.5 scrollbar-none">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                  active
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="active-nav-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-blue-600 to-cyan-500 shadow-md shadow-primary/25 -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className="size-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main Page Layout with Cinematic Smooth Transition */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, badge }) {
  return (
    <div className="mb-8 relative">
      <div className="flex flex-wrap items-center gap-2.5 mb-2">
        {badge ? (
          <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider text-primary border-primary/30">
            {badge}
          </Badge>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-[10px] font-mono uppercase tracking-wider text-primary">
            <Sparkles className="size-2.5" /> Active Module
          </span>
        )}
      </div>
      <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-1.5 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">{subtitle}</p> : null}
    </div>
  );
}
