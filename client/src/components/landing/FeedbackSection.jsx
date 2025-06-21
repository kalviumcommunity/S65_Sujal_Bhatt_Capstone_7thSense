import React, { useState } from 'react';
import { motion } from 'framer-motion';

const feedbacks = [
  {
    name: 'Alex J.',
    feedback: 'Absolutely thrilling! The competition keeps me coming back every day.',
    avatar: '🧑‍💻',
    accentSolid: 'bg-orange-400',
  },
  {
    name: 'Priya S.',
    feedback: 'The best platform to test your instincts. Love the rewards!',
    avatar: '👩‍🎤',
    accentSolid: 'bg-pink-500',
  },
  {
    name: 'Chris M.',
    feedback: 'Super smooth experience and a great community. Highly recommend!',
    avatar: '🧑‍🚀',
    accentSolid: 'bg-indigo-500',
  },
];

function FeedbackSection() {
  const [vibratingCard, setVibratingCard] = useState(null);

  const handleCardClick = (index) => {
    setVibratingCard(index);
    setTimeout(() => setVibratingCard(null), 500);
  };

  return (
    <section className="w-full space-bg py-40 px-4 flex flex-col items-center">
      <style>
        {`
          @keyframes diagonalMove {
            0% { transform: translate(0, 0); }
            25% { transform: translate(50px, 50px); }
            50% { transform: translate(0, 100px); }
            75% { transform: translate(-50px, 50px); }
            100% { transform: translate(0, 0); }
          }
          @keyframes vibrate {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
          }
          .diagonal-card-1 {
            animation: diagonalMove 15s ease-in-out infinite;
            animation-delay: 0s;
          }
          .diagonal-card-2 {
            animation: diagonalMove 15s ease-in-out infinite;
            animation-delay: 5s;
          }
          .diagonal-card-3 {
            animation: diagonalMove 15s ease-in-out infinite;
            animation-delay: 10s;
          }
          .vibrate {
            animation: vibrate 0.5s linear;
          }
        `}
      </style>
      <motion.h2 
        className="text-3xl sm:text-4xl font-extrabold mb-12 text-center max-w-3xl cursor-pointer"
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.3 }
        }}
      >
        <motion.span 
          className="text-white"
          whileHover={{
            scale: 1.1,
            x: 5,
            color: "#f0f0f0",
            textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
            transition: { duration: 0.3 }
          }}
        >
          Real Ones{" "}
        </motion.span>
        <motion.span 
          className="text-purple-500"
          whileHover={{
            scale: 1.1,
            x: 5,
            color: "#9F7AEA",
            textShadow: "0 0 10px rgba(139, 92, 246, 0.5)",
            transition: { duration: 0.3 }
          }}
        >
          Reacted
        </motion.span>
        <motion.span 
          className="text-white"
          whileHover={{
            scale: 1.1,
            x: 5,
            color: "#f0f0f0",
            textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
            transition: { duration: 0.3 }
          }}
        >
          . You're Still{" "}
        </motion.span>
        <motion.span 
          className="text-purple-500"
          whileHover={{
            scale: 1.1,
            x: 5,
            color: "#9F7AEA",
            textShadow: "0 0 10px rgba(139, 92, 246, 0.5)",
            transition: { duration: 0.3 }
          }}
        >
          Thinking
        </motion.span>
        <motion.span 
          className="text-white"
          whileHover={{
            scale: 1.1,
            x: 5,
            color: "#f0f0f0",
            textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
            transition: { duration: 0.3 }
          }}
        >
          .
        </motion.span>
      </motion.h2>
      <div className="flex flex-wrap justify-center gap-10 w-full max-w-6xl">
        {feedbacks.map((fb, idx) => (
          <div
            key={idx}
            className="flex-1 min-w-[280px] max-w-sm flex justify-center"
          >
            <motion.div
              onClick={() => handleCardClick(idx)}
              className={`relative z-10 bg-neutral-900 rounded-2xl shadow-lg p-8 flex flex-col items-center border border-neutral-800 diagonal-card-${idx + 1} ${vibratingCard === idx ? 'vibrate' : ''} cursor-pointer`}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 8px 24px 0 rgba(139,92,246,0.7),-4px 4px 16px 0 rgba(139,92,246,0.3),4px 4px 16px 0 rgba(139,92,246,0.3)",
                transition: { duration: 0.3 }
              }}
            >
              <motion.div 
                className="text-4xl mb-4"
                whileHover={{
                  scale: 1.2,
                  rotate: 5,
                  transition: { duration: 0.3 }
                }}
              >
                {fb.avatar}
              </motion.div>
              <p className="text-lg mb-5 text-center">
                {idx === 0 && (
                  <>
                    <motion.span 
                      className="text-gray-200"
                      whileHover={{
                        scale: 1.1,
                        color: "#f0f0f0",
                        textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      "
                    </motion.span>
                    <motion.span 
                      className="text-gray-200"
                      whileHover={{
                        scale: 1.1,
                        color: "#f0f0f0",
                        textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      Absolutely{" "}
                    </motion.span>
                    <motion.span 
                      className="text-purple-500"
                      whileHover={{
                        scale: 1.1,
                        color: "#9F7AEA",
                        textShadow: "0 0 10px rgba(139, 92, 246, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      thrilling
                    </motion.span>
                    <motion.span 
                      className="text-gray-200"
                      whileHover={{
                        scale: 1.1,
                        color: "#f0f0f0",
                        textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      ! The{" "}
                    </motion.span>
                    <motion.span 
                      className="text-purple-500"
                      whileHover={{
                        scale: 1.1,
                        color: "#9F7AEA",
                        textShadow: "0 0 10px rgba(139, 92, 246, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      competition
                    </motion.span>
                    <motion.span 
                      className="text-gray-200"
                      whileHover={{
                        scale: 1.1,
                        color: "#f0f0f0",
                        textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      {" "}keeps me coming back every day."
                    </motion.span>
                  </>
                )}
                {idx === 1 && (
                  <>
                    <motion.span 
                      className="text-gray-200"
                      whileHover={{
                        scale: 1.1,
                        color: "#f0f0f0",
                        textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      "
                    </motion.span>
                    <motion.span 
                      className="text-gray-200"
                      whileHover={{
                        scale: 1.1,
                        color: "#f0f0f0",
                        textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      The best platform to test your{" "}
                    </motion.span>
                    <motion.span 
                      className="text-purple-500"
                      whileHover={{
                        scale: 1.1,
                        color: "#9F7AEA",
                        textShadow: "0 0 10px rgba(139, 92, 246, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      instincts
                    </motion.span>
                    <motion.span 
                      className="text-gray-200"
                      whileHover={{
                        scale: 1.1,
                        color: "#f0f0f0",
                        textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      . Love the{" "}
                    </motion.span>
                    <motion.span 
                      className="text-purple-500"
                      whileHover={{
                        scale: 1.1,
                        color: "#9F7AEA",
                        textShadow: "0 0 10px rgba(139, 92, 246, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      rewards
                    </motion.span>
                    <motion.span 
                      className="text-gray-200"
                      whileHover={{
                        scale: 1.1,
                        color: "#f0f0f0",
                        textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      !"
                    </motion.span>
                  </>
                )}
                {idx === 2 && (
                  <>
                    <motion.span 
                      className="text-gray-200"
                      whileHover={{
                        scale: 1.1,
                        color: "#f0f0f0",
                        textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      "
                    </motion.span>
                    <motion.span 
                      className="text-gray-200"
                      whileHover={{
                        scale: 1.1,
                        color: "#f0f0f0",
                        textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      Super{" "}
                    </motion.span>
                    <motion.span 
                      className="text-purple-500"
                      whileHover={{
                        scale: 1.1,
                        color: "#9F7AEA",
                        textShadow: "0 0 10px rgba(139, 92, 246, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      smooth
                    </motion.span>
                    <motion.span 
                      className="text-gray-200"
                      whileHover={{
                        scale: 1.1,
                        color: "#f0f0f0",
                        textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      {" "}experience and a great{" "}
                    </motion.span>
                    <motion.span 
                      className="text-purple-500"
                      whileHover={{
                        scale: 1.1,
                        color: "#9F7AEA",
                        textShadow: "0 0 10px rgba(139, 92, 246, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      community
                    </motion.span>
                    <motion.span 
                      className="text-gray-200"
                      whileHover={{
                        scale: 1.1,
                        color: "#f0f0f0",
                        textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      . Highly recommend!"
                    </motion.span>
                  </>
                )}
              </p>
              <motion.div 
                className="flex items-center gap-3 mt-3"
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
              >
                <motion.span 
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-white font-bold text-lg ${fb.accentSolid}`}
                  whileHover={{
                    scale: 1.2,
                    rotate: 5,
                    transition: { duration: 0.3 }
                  }}
                >
                  {fb.avatar}
                </motion.span>
                <motion.span 
                  className="text-base font-semibold text-gray-100"
                  whileHover={{
                    scale: 1.1,
                    x: 5,
                    color: "#f0f0f0",
                    textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                    transition: { duration: 0.3 }
                  }}
                >
                  {fb.name}
                </motion.span>
              </motion.div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeedbackSection; 