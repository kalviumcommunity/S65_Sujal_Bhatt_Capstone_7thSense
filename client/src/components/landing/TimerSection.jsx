import LottiePlayer from "../LottiePlayer";
import timer from "../../assets/lottie/timer.json";
import { motion } from "framer-motion";
import UserflowConcentric from "../UserflowConcentric";

function TimerSection() {
  return (
    <section id="timer-section" className="w-full py-24 space-bg" style={{ scrollMarginTop: '100px' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Userflow Concentric Animation */}
          <div className="flex justify-center mt-62 mb-42">
            <UserflowConcentric text="Userflow" size={450} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default TimerSection;
