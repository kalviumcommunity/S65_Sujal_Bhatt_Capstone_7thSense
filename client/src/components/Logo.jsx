import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LottiePlayer from "./LottiePlayer";
import logo from "../assets/lottie/logo.json";

function Logo() {
  const navigate = useNavigate();
  const location = useLocation();
  const logoLottieRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

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
    if (logoLottieRef.current) {
      if (isScrolling) {
        logoLottieRef.current.play();
      } else {
        logoLottieRef.current.pause();
      }
    }
  }, [isScrolling]);

  const handleLogoClick = () => {
    navigate("/");
  };

  // Do not render the logo on the 1v1 page for a distraction-free experience
  if (location.pathname.startsWith('/1v1')) {
    return null;
  }

  // Show big logo on landing page
  if (location.pathname === "/") {
    return (
      <div 
        className="fixed top-4 left-4 z-50 cursor-pointer hover:scale-110 transition-transform duration-200"
        onClick={handleLogoClick}
        title="Go to Home"
      >
        <LottiePlayer 
          animationData={logo} 
          width={100} 
          height={100} 
          loop={true} 
          lottieRef={logoLottieRef} 
        />
      </div>
    );
  }

  // Show smaller logo on other pages
  return (
    <div 
      className="fixed top-2 left-2 z-50 cursor-pointer hover:scale-110 transition-transform duration-200"
      onClick={handleLogoClick}
      title="Go to Home"
    >
      <LottiePlayer 
        animationData={logo} 
        width={60} 
        height={60} 
        loop={true} 
        lottieRef={logoLottieRef} 
      />
    </div>
  );
}

export default Logo; 