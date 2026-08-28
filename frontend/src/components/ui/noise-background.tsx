import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface NoiseBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  gradientColors?: {
    c1?: string;
    c2?: string;
    c3?: string;
    c4?: string;
  };
  noiseOpacity?: number;
  speed?: number;
  interactive?: boolean;
}

export const NoiseBackground: React.FC<NoiseBackgroundProps> = ({
  children,
  className,
  containerClassName,
  gradientColors = {
    c1: 'rgba(56, 189, 248, 0.25)', // Cyan
    c2: 'rgba(99, 102, 241, 0.22)', // Indigo
    c3: 'rgba(251, 191, 36, 0.15)', // Amber
    c4: 'rgba(168, 85, 247, 0.18)', // Purple
  },
  noiseOpacity = 0.07,
  speed = 1,
  interactive = true,
}) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0.5, y: 0.5 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        'relative overflow-hidden bg-studio-bg isolate rounded-3xl border border-studio-border/60 shadow-cinema',
        containerClassName
      )}
    >
      {/* Background Animated Gradient Mesh */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Gradient Orb 1: Cyan / Blue */}
        <motion.div
          animate={{
            x: ['-20%', '30%', '-10%', '-20%'],
            y: ['-10%', '20%', '40%', '-10%'],
            scale: [1, 1.25, 0.9, 1],
          }}
          transition={{
            duration: 18 / speed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: `radial-gradient(circle at center, ${gradientColors.c1} 0%, transparent 70%)`,
          }}
          className="absolute -top-[20%] -left-[10%] w-[65vw] h-[65vw] max-w-[800px] max-h-[800px] rounded-full blur-[90px]"
        />

        {/* Gradient Orb 2: Indigo / Purple */}
        <motion.div
          animate={{
            x: ['20%', '-25%', '15%', '20%'],
            y: ['30%', '-20%', '10%', '30%'],
            scale: [1.1, 0.9, 1.2, 1.1],
          }}
          transition={{
            duration: 22 / speed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: `radial-gradient(circle at center, ${gradientColors.c2} 0%, transparent 70%)`,
          }}
          className="absolute -bottom-[20%] -right-[10%] w-[65vw] h-[65vw] max-w-[800px] max-h-[800px] rounded-full blur-[90px]"
        />

        {/* Gradient Orb 3: Warm Amber Accent */}
        <motion.div
          animate={{
            x: ['-10%', '20%', '-20%', '-10%'],
            y: ['40%', '-10%', '25%', '40%'],
            scale: [0.8, 1.1, 0.9, 0.8],
          }}
          transition={{
            duration: 16 / speed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: `radial-gradient(circle at center, ${gradientColors.c3} 0%, transparent 65%)`,
          }}
          className="absolute top-[30%] left-[25%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full blur-[80px]"
        />

        {/* Interactive Dynamic Mouse Follower Light */}
        {interactive && (
          <motion.div
            animate={{
              x: mousePosition.x * 100 - 50 + '%',
              y: mousePosition.y * 100 - 50 + '%',
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 60 }}
            style={{
              background: `radial-gradient(circle at center, ${gradientColors.c4} 0%, transparent 60%)`,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] rounded-full blur-[70px] pointer-events-none"
          />
        )}
      </div>

      {/* SVG Grain Noise Overlay Texture */}
      <div
        className="absolute inset-0 pointer-events-none -z-0 mix-blend-overlay"
        style={{
          opacity: noiseOpacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Vignette Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none -z-0 bg-radial-vignette opacity-70" />

      {/* Foreground Content */}
      <div className={cn('relative z-10', className)}>{children}</div>
    </div>
  );
};
