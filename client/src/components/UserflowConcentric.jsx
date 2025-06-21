import React from "react";
import { motion } from "framer-motion";

const circleConfigs = [
  { inset: -70, opacity: 0.07 }, // Big innermost circle, darkest
  { inset: -40, opacity: 0.10 }, // Big innermost circle, darkest
  { inset: -10, opacity: 0.15 }, // Big innermost circle, darkest
  { inset: 20, opacity: 0.20 },
  { inset: 50, opacity: 0.25 },
  { inset: 80, opacity: 0.30 },

  { inset: 110, opacity: 0.40 }, // new outer circle

];

function UserflowConcentric({ text = "Userflow", size = 500 }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Concentric Circles */}
      {circleConfigs.map((cfg, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-b from-white/5 to-black/0"
          style={{
            inset: cfg.inset,
            border: `2px solid rgba(255,255,255,${cfg.opacity})`,
            boxShadow: `0 0 80px 10px rgba(0,0,0,${cfg.opacity})`,
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: i * 0.12 }}
        />
      ))}
      {/* Center Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg select-none">
          {text}
        </span>
      </div>
    </div>
  );
}

export default UserflowConcentric; 