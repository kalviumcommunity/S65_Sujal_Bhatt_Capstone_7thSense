import React from 'react';
import LottiePlayer from '../LottiePlayer';
import money from '../../assets/lottie/money.json';

function PayoutSection() {
  return (
    <div className="space-bg w-full py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-12 flex-wrap-reverse">
        {/* Text on the left */}
        <div className="flex-1 flex flex-col items-start justify-center text-left min-w-[400px] pl-8 relative" style={{ zIndex: 2 }}>
          <h2
            className="text-4xl md:text-5xl font-bold leading-tight mb-1 absolute left-8 -top-80"
            style={{ fontFamily: "'Montserrat', 'Poppins', 'Inter', Arial, sans-serif", zIndex: 2 }}
          >
            <span className="text-[var(--space-text)]">Winners Cash Out.</span>
            <span className="text-[var(--space-accent)]"> Losers Complain.</span>
            <br />
            <span className="text-lg font-semibold text-[var(--space-text-secondary)]">
              If You're Good, Your Wallet Knows It.
            </span>
          </h2>
        </div>
        {/* Lottie animation on the right */}
        <div className="flex-1 flex items-center justify-end min-w-[400px] ml-8">
          <LottiePlayer animationData={money} width={800} height={800} loop={true} />
        </div>
      </div>
    </div>
  );
}

export default PayoutSection; 