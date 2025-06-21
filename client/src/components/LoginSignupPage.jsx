import React, { useEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { validateAndRefreshUserData } from "../utils/auth";
import { FaGoogle, FaRocket, FaSatellite, FaSpaceShuttle } from 'react-icons/fa';
import Lottie from "lottie-react";
import loadingAnimation from '../assets/lottie/loading.json';

const API_URL = import.meta.env.VITE_API_URL;

function LoginSignupPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasHandledCallback = useRef(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginContent, setShowLoginContent] = useState(true);

  useEffect(() => {
    // Check if we're in the middle of a login process
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const userData = urlParams.get('userData');
    
    if (token || userData) {
      setShowLoginContent(false);
      setIsLoading(true);
    }
  }, [location]);

  useEffect(() => {
    // Handle OAuth callback on both callback and login-signup routes
    const handleAuthCallback = async () => {
      // Prevent multiple executions
      if (hasHandledCallback.current) {
        console.log('Callback already handled, skipping');
        return;
      }

      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get('token');
      const userData = urlParams.get('userData');
      const error = urlParams.get('error');
      
      console.log('Auth callback received:', {
        hasToken: !!token,
        tokenLength: token?.length,
        hasUserData: !!userData,
        error,
        path: location.pathname,
        fullUrl: window.location.href
      });
      
      if (error) {
        console.error('Auth error:', error);
        setShowLoginContent(true);
        setIsLoading(false);
        return;
      }

      if (token && userData) {
        try {
          hasHandledCallback.current = true;
          setIsValidating(true);
          setShowLoginContent(false);
          setIsLoading(true);
          
          // Decode and parse user data
          const decodedUserData = decodeURIComponent(userData);
          console.log('Decoded user data:', decodedUserData);
          
          const parsedUserData = JSON.parse(decodedUserData);
          
          // Validate token before storing
          if (!token || token === 'null' || token === 'undefined') {
            console.error('Invalid token received from server');
            throw new Error('Invalid token received');
          }

          // Store the token and user data
          console.log('Storing auth data:', {
            tokenLength: token.length,
            userDataKeys: Object.keys(parsedUserData),
            path: location.pathname
          });
          
          // Clear any existing data first
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          
          // Store new data
          localStorage.setItem('token', token.trim());
          localStorage.setItem('userData', JSON.stringify(parsedUserData));

          // Update app state immediately
          if (onLogin) {
            await onLogin(parsedUserData);
          }

          // Add a small delay for smooth transition
          await new Promise(resolve => setTimeout(resolve, 500));

          // Redirect to game-modes
          console.log('Login successful, redirecting to game-modes');
          window.location.href = '/game-modes';
        } catch (error) {
          console.error('Error processing auth data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          if (onLogin) {
            await onLogin(null);
          }
          setShowLoginContent(true);
          setIsLoading(false);
          window.location.href = '/login-signup';
        } finally {
          setIsValidating(false);
        }
      }
    };

    // Handle the callback
    handleAuthCallback();

    // Cleanup function
    return () => {
      hasHandledCallback.current = false;
    };
  }, [location, onLogin]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setShowLoginContent(false);
    const loginUrl = `${API_URL}/auth/google`;
    console.log('Initiating Google login with URL:', loginUrl);
    console.log('API_URL from env:', API_URL);
    console.log('Current location:', window.location.href);
    window.location.href = loginUrl;
  };

  const features = [
    {
      icon: <FaRocket className="text-4xl text-[var(--space-accent)]" />,
      title: "Space Battle Arena",
      description: "Challenge other space explorers in epic quiz battles"
    },
    {
      icon: <FaSatellite className="text-4xl text-[var(--space-success)]" />,
      title: "Cosmic Rewards",
      description: "Earn stardust and climb the galactic leaderboard"
    },
    {
      icon: <FaSpaceShuttle className="text-4xl text-[var(--space-warning)]" />,
      title: "Interstellar Matches",
      description: "Connect with space explorers across the galaxy"
    }
  ];

  // Show loading animation
  if (isLoading) {
    return (
      <div className="fixed inset-0 space-bg flex items-center justify-center z-50">
        <Motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full h-full"
        >
          <Lottie 
            animationData={loadingAnimation} 
            loop={true}
            style={{ width: '100%', height: '100%' }}
          />
        </Motion.div>
      </div>
    );
  }

  // Show login content
  if (showLoginContent) {
    return (
      <div className="min-h-screen space-bg px-5 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left side - Features */}
            <Motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <div>
                <Motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-5xl font-extrabold space-text mb-4"
                >
                  Welcome to <Motion.span 
                    whileHover={{ scale: 1.1, x: 5 }}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--space-accent)] to-[var(--space-accent-hover)]"
                  >
                    Space Quiz Battle
                  </Motion.span>
                </Motion.h1>
                <Motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl space-text-secondary mb-8"
                >
                  Ready to conquer the cosmic quiz universe?
                </Motion.p>
              </div>

              <div className="space-y-6">
                {features.map((feature, index) => (
                  <Motion.div
                    key={index}
                    whileHover={{ 
                      scale: 1.02, 
                      x: 5,
                      boxShadow: "0 8px 24px 0 rgba(139,92,246,0.7),-4px 4px 16px 0 rgba(139,92,246,0.3),4px 4px 16px 0 rgba(139,92,246,0.3)",
                      transition: { duration: 0.3 }
                    }}
                    className="space-card p-6 rounded-xl"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold space-text mb-2">{feature.title}</h3>
                        <p className="space-text-secondary">{feature.description}</p>
                      </div>
                    </div>
                  </Motion.div>
                ))}
              </div>
            </Motion.div>

            {/* Right side - Login */}
            <Motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-card p-8 rounded-2xl"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 8px 24px 0 rgba(139,92,246,0.7),-4px 4px 16px 0 rgba(139,92,246,0.3),4px 4px 16px 0 rgba(139,92,246,0.3)",
                transition: { duration: 0.3 }
              }}
            >
              <h2 className="text-3xl font-bold space-text mb-8 text-center">Begin Your Space Journey</h2>
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoogleLogin}
                className="space-button w-full flex items-center justify-center space-x-3"
              >
                <FaGoogle className="text-xl" />
                <span>Continue with Google</span>
              </Motion.button>
            </Motion.div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default LoginSignupPage;
