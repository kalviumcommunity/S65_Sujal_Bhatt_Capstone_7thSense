import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "Think you're fast enough to play 7th Sense?",
    answer: "This isn't trivia night. It's war at 7 seconds per move. Outthink, outtap, outlast — or be forgotten."
  },
  {
    question: "Real money? Or just hype?",
    answer: "It's not hype if your UPI buzzes. Win a round, cash out instantly. No waitlists, no nonsense — just pure payout."
  },
  {
    question: "What if someone tries to cheat?",
    answer: "Let them try. Our AI watches everything — one blink off-screen, and they're gone. This arena respects skill, not shortcuts."
  },
  {
    question: "What kind of game modes you got?",
    answer: "No boring modes here. Just heat.\n\n1v1 Face-offs for bragging rights\n\nBattle Royale for bloodthirsty winners\n\nAI Challenges if you dare to solo"
  },
  {
    question: "How do I get paid when I win?",
    answer: "You play smart, you earn hard. Winnings drop straight into your account. We don't hold your money hostage — ever."
  },
  {
    question: "Is there a rank system or are we all equals?",
    answer: "No one's equal here.\nClimb from Bronze to Platinum, or stay invisible. Every win earns you status. Every loss writes your story."
  },
  {
    question: "Can I crush my friends on this?",
    answer: "Yes — and you should. Send them a link, let the questions fly, and prove who's been all talk this whole time."
  },
  {
    question: "What if my net dies mid-match?",
    answer: "Then you die too. No mercy. This is real-time — lag is your problem, not ours."
  },
  {
    question: "Is this game safe for kids?",
    answer: "7th Sense is for all players who can handle pressure, speed, and the sting of losing. All it needs is command over your knowledge"
  }
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq-section" className="w-full py-20 space-bg" style={{ scrollMarginTop: '100px' }}>
      <div className="max-w-4xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-12"
        >
          <span className="text-white">Think you know it all? </span>
          <span className="text-purple-500">Think again</span>
        </motion.h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="border border-purple-500/20 rounded-xl overflow-hidden bg-black/50"
              initial={false}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 8px 24px 0 rgba(139,92,246,0.7),-4px 4px 16px 0 rgba(139,92,246,0.3),4px 4px 16px 0 rgba(139,92,246,0.3)",
                transition: { duration: 0.3 }
              }}
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-purple-500/10 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-xl font-semibold text-white flex items-center gap-3">
                  <span className="text-purple-500">❓</span>
                  {faq.question}
                </span>
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-purple-500"
                >
                  ▼
                </motion.span>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 text-gray-300 whitespace-pre-line">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQSection; 