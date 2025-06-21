import React, { useRef, useEffect, useState } from "react";
import HeroSection from "./landing/HeroSection";
import HowItWorksSection from "./landing/HowItWorksSection";
import RulesSection from "./landing/RulesSection";
import TimerSection from "./landing/TimerSection";
import EngageBattleSection from "./landing/EngageBattleSection";
import FriendsSection from "./landing/FriendsSection";
import PayoutSection from "./landing/PayoutSection";
import RankSection from "./landing/RankSection";
import FeedbackSection from "./landing/FeedbackSection";
import FAQSection from "./landing/FAQSection";
import Footer from "./landing/Footer";

function LandingPage() {
  const timerSectionRef = useRef(null);
  const faqSectionRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollToTimerSection = () => {
    timerSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  // --- Rank animation play-on-scroll logic ---
  const rankRef = useRef(null);
  const [playRank, setPlayRank] = useState(false);

  useEffect(() => {
    let scrollTimeout;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setIsScrolling(false), 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function onScroll() {
      if (!rankRef.current || playRank) return;
      const rect = rankRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < windowHeight && rect.bottom > 0) {
        setPlayRank(true);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    // Check on mount in case already in view
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [playRank]);

  // --- end logic ---

  return (
    <div
      className="w-full min-h-screen flex flex-col relative"
      style={{
        fontFamily: "'Inter', 'Montserrat', 'Poppins', Arial, sans-serif",
        overflowX: "hidden",
        maxWidth: "100vw"
      }}
    >
      <HeroSection onHowItWorksClick={scrollToTimerSection} />
      <HowItWorksSection />
      <RulesSection />
      <div ref={timerSectionRef} className="mb-8">
        <TimerSection />
      </div>
      <EngageBattleSection />
      <div className="mb-8">
        <FriendsSection />
      </div>
      <div className="mb-8">
        <PayoutSection />
      </div>
      <div className="mb-8">
        <RankSection />
      </div>
      <FeedbackSection />
      <FAQSection />
      <Footer />
    </div>
  );
}

export default LandingPage;
