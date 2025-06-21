import { motion } from "framer-motion";

function RulesSection() {
  return (
    <section className="w-full py-8 space-bg">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold space-text text-center mb-16"
        >
          <span className="text-[var(--space-text)]">Why </span>
          <span className="text-[var(--space-accent)]">7th Sense?</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Rules Description and consolidated points */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-card p-8 rounded-[50px]"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 8px 24px 0 rgba(139,92,246,0.7),-4px 4px 16px 0 rgba(139,92,246,0.3),4px 4px 16px 0 rgba(139,92,246,0.3)",
              transition: { duration: 0.3 }
            }}
          >
            <h3 className="text-2xl font-bold space-text mb-6">
              <span className="text-[var(--space-text)]">Basic </span>
              <span className="text-[var(--space-accent)]">Rules</span>
            </h3>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start space-x-3">
                <span className="text-[var(--space-accent)] mt-1">•</span>
                <p className="space-text-secondary">
                  Answer multiple-choice questions quickly and accurately.
                </p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[var(--space-accent)] mt-1">•</span>
                <p className="space-text-secondary">
                  Each question has a 7-second time limit.
                </p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[var(--space-accent)] mt-1">•</span>
                <p className="space-text-secondary">
                  Correct answers earn you points; incorrect answers may cost you.
                </p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[var(--space-accent)] mt-1">•</span>
                <p className="space-text-secondary">
                  Tests your quick thinking and decision-making skills
                </p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[var(--space-accent)] mt-1">•</span>
                <p className="space-text-secondary">
                  Creates intense, adrenaline-pumping gameplay
                </p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[var(--space-accent)] mt-1">•</span>
                <p className="space-text-secondary">
                  Levels the playing field for all players
                </p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[var(--space-accent)] mt-1">•</span>
                <p className="space-text-secondary">
                  Perfect balance between challenge and fun
                </p>
              </li>
            </ul>

            <h3 className="text-2xl font-bold space-text mb-6">
              <span className="text-[var(--space-text)]">Advanced </span>
              <span className="text-[var(--space-accent)]">Strategies</span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <span className="text-[var(--space-accent)] mt-1">•</span>
                <p className="space-text-secondary">
                  Utilize power-ups strategically to gain an edge.
                </p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[var(--space-accent)] mt-1">•</span>
                <p className="space-text-secondary">
                  Observe opponent's play style to predict their moves.
                </p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[var(--space-accent)] mt-1">•</span>
                <p className="space-text-secondary">
                  Master different question categories to become a versatile player.
                </p>
              </li>
            </ul>

            <p className="space-text-secondary text-center mt-8 p-4 border border-[var(--space-accent)] rounded-[50px]">
              <span className="text-[var(--space-accent)]">Fair Play Notice:</span> Cheating or any form of unfair advantage will result in immediate account termination. Play fair and have fun!
            </p>
          </motion.div>

          {/* Rules Animation (placeholder) - Remove this section */}
          
        </div>
      </div>
    </section>
  );
}

export default RulesSection;
