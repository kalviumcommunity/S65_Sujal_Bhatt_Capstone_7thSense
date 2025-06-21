import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LottiePlayer from "../LottiePlayer";
import space from "../../assets/lottie/space.json";
import { handleAuthRedirect } from "../../utils/auth";

function AnimatedTextFill({ text, className }) {
  // Split text into characters for better caret sync
  return (
    <div className={`relative inline-block ${className}`} style={{ lineHeight: 1 }}>
      {/* Outlined text (bottom layer) */}
      <span
        className="block absolute inset-0 select-none"
        style={{
          color: "transparent",
          WebkitTextStroke: "2px white",
          fontWeight: 800,
          zIndex: 1,
        }}
        aria-hidden="true"
      >
        {text}
      </span>
      {/* Filled text (top layer, masked) */}
      <span
        className="block select-none overflow-hidden"
        style={{
          color: "white",
          fontWeight: 800,
          position: "relative",
          zIndex: 2,
        }}
      >
        <span className="animated-text-fill-inner" style={{ position: "relative", display: "inline-block" }}>
          {text}
        </span>
      </span>
      {/* Caret */}
      <span
        className="animated-caret"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 4,
          height: "100%",
          background: "white",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />
      <style>{`
        .animated-text-fill-inner {
          background: linear-gradient(90deg, white 100%, transparent 0%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          animation: text-fill-anim-pingpong 4s linear infinite;
        }
        .animated-caret {
          width: 4px;
          height: 100%;
          background: white;
          animation: caret-move-anim-pingpong 4s linear infinite;
        }
        /* Forward (0-80%): very slow, Backward (80-100%): very fast */
        @keyframes text-fill-anim-pingpong {
          0% { width: 0; }
          80% { width: 100%; }
          90% { width: 100%; }
          100% { width: 0; }
        }
        @keyframes caret-move-anim-pingpong {
          0% { left: 0; }
          80% { left: 100%; }
          90% { left: 100%; }
          100% { left: 0; }
        }
      `}</style>
    </div>
  );
}

function HeroSection({ onHowItWorksClick }) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    handleAuthRedirect(navigate, '/game-modes');
  };

  const handleHowItWorks = () => {
    if (onHowItWorksClick) {
      onHowItWorksClick();
    } else {
      // Fallback for isolated testing
      navigate('/how-it-works');
    }
  };

  return (
    <div className="relative w-full min-h-[900px] flex items-center justify-center overflow-hidden space-bg py-20 px-4">
      {/* Lottie Animation in Top Right Corner */}
      <div className="absolute top-0 right-0 z-10 opacity-70">
        <LottiePlayer animationData={space} width={800} height={800} loop={true} />
      </div>

      <div className="max-w-7xl mx-auto z-10 w-full relative pt-16 md:pt-0">
        {/* Top: Think Faster (original style) */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-left whitespace-nowrap mb-2">
          <span className="text-[var(--space-text)]">Think </span>
          <span className="text-[var(--space-accent)]">Faster</span>
        </h1>
        {/* Bottom: Win Faster (animated caret fill) */}
        <AnimatedTextFill text="Win Faster" className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-left whitespace-nowrap mb-4" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-8 text-lg sm:text-2xl font-medium space-text-secondary ml-10 cursor-default"
          whileHover={{
            scale: 1.05,
            x: 5,
            transition: { duration: 0.3 }
          }}
        >
          <span className="text-[var(--space-text)]">Trust your gut. </span>
          <span className="text-[var(--space-accent)]">Prove your 7th Sense.</span>
        </motion.h2>
        <div className="mt-8 flex gap-6 ml-10 relative overflow-hidden rounded-lg group">
          <motion.button
            onClick={handleGetStarted}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="space-button z-10 cursor-pointer"
          >
            <motion.span
              className="relative z-10"
              whileHover={{
                scale: 1.1,
                x: 5,
                transition: { duration: 0.3 }
              }}
            >
              Sign In
            </motion.span>
            <motion.span
              className="absolute inset-0 rounded-lg bg-[var(--space-accent)] opacity-0"
              whileHover={{ opacity: 0.15 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
          <motion.button
            onClick={handleHowItWorks}
            initial={{ scale: 1 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 20px rgba(147, 112, 219, 0.2)", /* Updated shadow color */
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative px-10 py-3 rounded-lg border-2 border-[var(--space-accent)] space-text-secondary bg-[var(--space-card-bg)] font-semibold text-lg shadow-md overflow-hidden z-10 cursor-pointer"
          >
            <motion.span 
              className="relative z-10"
              whileHover={{
                scale: 1.1,
                x: 5,
                transition: { duration: 0.3 }
              }}
            >
              How it works
            </motion.span>
            <motion.span
              className="absolute inset-0 rounded-lg bg-[var(--space-accent)] opacity-0"
              whileHover={{ opacity: 0.15 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
