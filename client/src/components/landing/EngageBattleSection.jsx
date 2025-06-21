import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function EngageBattleSection() {
  const navigate = useNavigate();

  const handleNavigateToGameModes = () => {
    navigate('/game-modes');
  };

  return (
    <section className="w-full py-20 space-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col space-y-16">
          {/* "Engage in Battle" Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-card p-8 w-full max-w-6xl mx-auto rounded-[50px]"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 8px 24px 0 rgba(139,92,246,0.7),-4px 4px 16px 0 rgba(139,92,246,0.3),4px 4px 16px 0 rgba(139,92,246,0.3)",
              transition: { duration: 0.3 }
            }}
          >
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 rounded-full bg-[var(--space-accent)]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-4xl space-text">⚔️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-4xl font-bold space-text mb-6">
                  <motion.span 
                    className="text-[var(--space-text)]"
                    whileHover={{
                      scale: 1.05,
                      color: "#f0f0f0",
                      textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    Engage in{" "}
                  </motion.span>
                  <motion.span 
                    className="text-[var(--space-accent)]"
                    whileHover={{
                      scale: 1.05,
                      color: "#9F7AEA",
                      textShadow: "0 0 10px rgba(139, 92, 246, 0.5)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    Battle
                  </motion.span>
                </h3>
                <ul className="space-y-4 space-text-secondary mb-6 text-lg">
                  <motion.li
                    whileHover={{
                      scale: 1.02,
                      x: 5,
                      color: "#f0f0f0",
                      textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    Dive into 1v1 duels, intense Battle Royales, or strategic AI challenges.
                  </motion.li>
                  <motion.li
                    whileHover={{
                      scale: 1.02,
                      x: 5,
                      color: "#f0f0f0",
                      textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    Experience dynamic matchmaking for thrilling, competitive gameplay.
                  </motion.li>
                  <motion.li
                    whileHover={{
                      scale: 1.02,
                      x: 5,
                      color: "#f0f0f0",
                      textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    Seamlessly connect and jump into action with intuitive controls.
                  </motion.li>
                </ul>
                <motion.button
                  className="space-button cursor-pointer px-8 py-4 text-lg"
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                  onClick={handleNavigateToGameModes}
                >
                  Launch Game
                  <motion.span
                    className="absolute inset-0 rounded-lg bg-[var(--space-accent)] opacity-0"
                    whileHover={{ opacity: 0.15 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* "Master the Clock" Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-card p-8 w-full max-w-6xl mx-auto rounded-[50px]"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 8px 24px 0 rgba(139,92,246,0.7),-4px 4px 16px 0 rgba(139,92,246,0.3),4px 4px 16px 0 rgba(139,92,246,0.3)",
              transition: { duration: 0.3 }
            }}
          >
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 rounded-full bg-[var(--space-accent)]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-4xl space-text">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-4xl font-bold space-text mb-6">
                  <motion.span 
                    className="text-[var(--space-text)]"
                    whileHover={{
                      scale: 1.05,
                      color: "#f0f0f0",
                      textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    Master the{" "}
                  </motion.span>
                  <motion.span 
                    className="text-[var(--space-accent)]"
                    whileHover={{
                      scale: 1.05,
                      color: "#9F7AEA",
                      textShadow: "0 0 10px rgba(139, 92, 246, 0.5)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    Clock
                  </motion.span>
                </h3>
                <ul className="space-y-4 space-text-secondary mb-6 text-lg">
                  <motion.li
                    whileHover={{
                      scale: 1.02,
                      x: 5,
                      color: "#f0f0f0",
                      textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    Conquer questions under pressure with a strict 7-second time limit.
                  </motion.li>
                  <motion.li
                    whileHover={{
                      scale: 1.02,
                      x: 5,
                      color: "#f0f0f0",
                      textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    Engage in exhilarating, high-speed quizzes that demand quick reflexes.
                  </motion.li>
                  <motion.li
                    whileHover={{
                      scale: 1.02,
                      x: 5,
                      color: "#f0f0f0",
                      textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    Sharpen your knowledge and decision-making skills in real-time scenarios.
                  </motion.li>
                </ul>
                <motion.button
                  className="space-button cursor-pointer px-8 py-4 text-lg"
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                  onClick={handleNavigateToGameModes}
                >
                  Challenge Yourself
                  <motion.span
                    className="absolute inset-0 rounded-lg bg-[var(--space-accent)] opacity-0"
                    whileHover={{ opacity: 0.15 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* "Claim Your Glory" Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-card p-8 w-full max-w-6xl mx-auto rounded-[50px]"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 8px 24px 0 rgba(139,92,246,0.7),-4px 4px 16px 0 rgba(139,92,246,0.3),4px 4px 16px 0 rgba(139,92,246,0.3)",
              transition: { duration: 0.3 }
            }}
          >
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 rounded-full bg-[var(--space-accent)]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-4xl space-text">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-4xl font-bold space-text mb-6">
                  <motion.span 
                    className="text-[var(--space-text)]"
                    whileHover={{
                      scale: 1.05,
                      color: "#f0f0f0",
                      textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    Claim Your{" "}
                  </motion.span>
                  <motion.span 
                    className="text-[var(--space-accent)]"
                    whileHover={{
                      scale: 1.05,
                      color: "#9F7AEA",
                      textShadow: "0 0 10px rgba(139, 92, 246, 0.5)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    Glory
                  </motion.span>
                </h3>
                <ul className="space-y-4 space-text-secondary mb-6 text-lg">
                  <motion.li
                    whileHover={{
                      scale: 1.02,
                      x: 5,
                      color: "#f0f0f0",
                      textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    Compete for cash rewards, prestigious ranks, and powerful in-game advantages.
                  </motion.li>
                  <motion.li
                    whileHover={{
                      scale: 1.02,
                      x: 5,
                      color: "#f0f0f0",
                      textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    Ascend through the galactic leaderboard to prove your dominance.
                  </motion.li>
                  <motion.li
                    whileHover={{
                      scale: 1.02,
                      x: 5,
                      color: "#f0f0f0",
                      textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    Unlock exclusive cosmetic items and rare power-ups as you progress.
                  </motion.li>
                </ul>
                <motion.button
                  className="space-button cursor-pointer px-8 py-4 text-lg"
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                  onClick={handleNavigateToGameModes}
                >
                  View Modes
                  <motion.span
                    className="absolute inset-0 rounded-lg bg-[var(--space-accent)] opacity-0"
                    whileHover={{ opacity: 0.15 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default EngageBattleSection; 