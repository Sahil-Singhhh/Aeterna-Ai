import React from 'react';
import { motion } from 'framer-motion';

interface LongevityClockProps {
  score: number;
}

const LongevityClock: React.FC<LongevityClockProps> = ({ score }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  // Map 0-100 to stroke-dashoffset (100 = full circle, 0 = empty)
  // Actually, let's map it to an arc, maybe 270 degrees.
  const arcLength = circumference * 0.75; 
  const strokeDashoffset = arcLength - (arcLength * ((score || 0) / 100));

  // Determine color based on score
  let color = '#00F2FF'; // Default accent
  if (score >= 85) color = '#39FF14'; // Success
  else if (score < 50) color = '#FF4D4D'; // Danger

  return (
    <div className="relative flex flex-col items-center justify-center p-6 glassmorphism rounded-2xl w-full max-w-sm glow-effect transition-all duration-300">
      <h2 className="text-xl font-bold text-text-muted mb-4 tracking-wider uppercase">Vitality Pulse</h2>
      <div className="relative flex items-center justify-center">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="transform -rotate-135"
        >
          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="12"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Animated Value Arc */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset }}
            transition={{ type: 'spring', stiffness: 40, damping: 10 }}
            style={{
              filter: `drop-shadow(0 0 8px ${color}80)`
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute flex flex-col items-center justify-center mt-[10%]">
          <motion.div
            key={score}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-extrabold"
            style={{ color }}
          >
            {Math.round(score)}
          </motion.div>
          <span className="text-sm text-text-muted font-medium tracking-widest mt-1">INDEX</span>
        </div>
      </div>
    </div>
  );
};

export default LongevityClock;
