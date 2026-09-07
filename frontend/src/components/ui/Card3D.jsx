import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Card3D: A realistic 3D perspective tilt physics component.
 * Uses Framer Motion spring physics to simulate realistic physical depth,
 * card elevation, and dynamic specular glare that follows cursor coordinates.
 */
export function Card3D({
  children,
  className = "",
  maxTilt = 8,
  glare = true,
  scaleOnHover = 1.02,
  ...props
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Raw mouse coordinates normalized from -0.5 to 0.5 relative to card center
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for organic feel
  const springConfig = { damping: 20, stiffness: 260, mass: 0.6 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Perspective 3D rotation transforms
  const rotateX = useTransform(springY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-maxTilt, maxTilt]);

  // Dynamic specular glare coordinates (0% to 100%)
  const glareX = useTransform(springX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(springY, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Center offset: -0.5 to +0.5
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="inline-block w-full h-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          scale: isHovered ? scaleOnHover : 1,
          boxShadow: isHovered
            ? "0 20px 35px -10px rgba(0, 0, 0, 0.25), 0 0 25px 2px rgba(59, 130, 246, 0.15)"
            : "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        }}
        transition={{ scale: { duration: 0.2 } }}
        className={cn(
          "relative rounded-xl border border-border/80 bg-card transition-colors overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Dynamic Specular Glare Overlay */}
        {glare && isHovered && (
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-xl z-20 opacity-40 mix-blend-overlay transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 280px at ${glareX.get()} ${glareY.get()}, rgba(255, 255, 255, 0.35), transparent 70%)`,
            }}
          />
        )}

        {/* Card Content Container with preserved 3D child depth */}
        <div style={{ transform: "translateZ(15px)" }} className="h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export default Card3D;
