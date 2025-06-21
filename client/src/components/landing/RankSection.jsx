import React from 'react';
import LottiePlayer from '../LottiePlayer';
import girlOutline from '../../assets/lottie/girl-outline.json';
import timerAnimation from '../../assets/lottie/timer.json';

function RankSection() {
  return (
    <div className="space-bg w-full py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-start justify-between gap-12 flex-wrap">
        {/* Lottie animation on the left */}
        <div className="flex-1 flex items-center justify-start -mt-48">
          <LottiePlayer animationData={girlOutline} width={700} height={700} loop={true} />
        </div>
        {/* Text on the right */}
        <div className="flex-1 flex flex-col items-end justify-center text-right pr-16 -mt-12">
          <h2
            className="text-4xl md:text-5xl font-bold leading-tight mb-1"
            style={{ fontFamily: "'Montserrat', 'Poppins', 'Inter', Arial, sans-serif" }}
          >
            <span className="text-[var(--space-text)]">Ranks don't lie.</span>
            <span className="text-[var(--space-accent)]"> But your excuses do.</span>
            <br />
            <span className="text-lg font-semibold text-[var(--space-text-secondary)]">
              Rank and Level Progression
            </span>
          </h2>
        </div>
      </div>

      {/* Timer Section - Text on left, Animation on right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-start justify-between gap-12 flex-wrap mt-120 -mb-16">
        {/* Text on the left */}
        <div className="flex-1 flex flex-col items-start justify-center text-left pl-16 -mt-12">
          <h2
            className="text-4xl md:text-5xl font-bold leading-tight mb-1"
            style={{ fontFamily: "'Montserrat', 'Poppins', 'Inter', Arial, sans-serif" }}
          >
            <span className="text-[var(--space-text)]">Time is ticking.</span>
            <span className="text-[var(--space-accent)]"> Make every second count.</span>
            <br />
            <span className="text-lg font-semibold text-[var(--space-text-secondary)]">
              7-Second Challenge Mode
            </span>
          </h2>
        </div>
        {/* Timer Lottie animation on the right */}
        <div className="flex-1 flex items-center justify-end -mt-48">
          <LottiePlayer animationData={timerAnimation} width={700} height={700} loop={true} />
        </div>
      </div>
    </div>
  );
}

export default RankSection; 