import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * HireSense Professional Brand Logo
 * Displays the 3D neural glassmorphism emblem paired with polished typography.
 */
export function HireSenseLogo({
  size = "md",
  showText = true,
  showBadge = false,
  asLink = true,
  href = "/dashboard",
  className = "",
}) {
  const sizeMap = {
    sm: { img: "size-7", text: "text-lg", badge: "text-[9px] px-1.5 py-0" },
    md: { img: "size-9", text: "text-xl", badge: "text-[10px] px-2 py-0.5" },
    lg: { img: "size-11", text: "text-2xl", badge: "text-[11px] px-2 py-0.5" },
    xl: { img: "size-14", text: "text-3xl", badge: "text-xs px-2.5 py-1" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 group select-none", className)}>
      {/* 3D Glassmorphism Logo Emblem */}
      <div className="relative shrink-0">
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 opacity-30 blur-sm group-hover:opacity-60 transition duration-300" />
        <img
          src="/hiresense-logo.png"
          alt="HireSense Logo"
          className={cn(
            currentSize.img,
            "relative rounded-xl object-cover shadow-sm border border-border/50 ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-200",
          )}
          onError={(e) => {
            // Fallback to SVG if PNG fails
            e.currentTarget.src = "/favicon.svg";
          }}
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex items-center gap-2">
          <span className={cn(currentSize.text, "font-display font-extrabold tracking-tight text-foreground leading-none")}>
            Hire
            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
              Sense
            </span>
          </span>

          {showBadge && (
            <Badge
              variant="outline"
              className={cn(
                currentSize.badge,
                "hidden sm:inline-flex font-mono uppercase tracking-wider text-primary border-primary/40 bg-primary/5",
              )}
            >
              AI 2.0
            </Badge>
          )}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link to={href} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}

export default HireSenseLogo;
