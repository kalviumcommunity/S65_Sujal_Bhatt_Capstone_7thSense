import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { handleAuthRedirect, handleLogout } from "../utils/auth";
import { getUserData } from "../utils/auth";
import { FaRocket, FaRobot, FaUserAstronaut, FaWallet, FaStar, FaSignOutAlt } from 'react-icons/fa';
import Lottie from "lottie-react";
import loadingAnimation from '../assets/lottie/loading.json';

const API_URL = import.meta.env.VITE_API_URL;

// Function to process profile picture URLs and use proxy for Google pictures
const processProfilePictureUrl = (url, userName) => {
  if (!url) {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}&backgroundColor=6366f1&textColor=ffffff`;
  }
  
  // If it's a Google profile picture, use our proxy
  if (url.includes('googleusercontent.com') || url.includes('lh3.googleusercontent.com')) {
    return `${API_URL}/api/profile-picture-proxy?url=${encodeURIComponent(url)}`;
  } else if (url.startsWith('http') && !url.startsWith(API_URL) && !url.includes('dicebear.com')) {
    // For other external URLs (but not Dicebear), use proxy as well
    return `${API_URL}/api/profile-picture-proxy?url=${encodeURIComponent(url)}`;
  }
  
  return url;
};

function GameModesPage({ user }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  const getTierColor = (tier) => {
    const colors = {
      bronze: 'text-amber-600',
      silver: 'text-gray-300',
      gold: 'text-yellow-400',
      platinum: 'text-blue-400',
      diamond: 'text-purple-400'
    };
    return colors[tier?.toLowerCase()] || colors.bronze;
  };

  useEffect(() => {
    // Get user data from localStorage first for immediate display
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        // If we have valid stored data, we can consider the user authenticated
        setIsValidating(false);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }

    // Only validate if we don't have user data
    if (!storedUserData && user) {
      validateAndRefreshUserData(0, true)
        .then(validatedUser => {
          if (validatedUser) {
            setUserData(validatedUser);
            localStorage.setItem('userData', JSON.stringify(validatedUser));
          } else {
            // Only redirect if we're not already on the login page
            if (window.location.pathname !== '/login-signup') {
              localStorage.removeItem('token');
              localStorage.removeItem('userData');
              navigate('/login-signup', { replace: true });
            }
          }
        })
        .catch(error => {
          console.error('Error refreshing user data:', error);
          // Only redirect if we're not already on the login page
          if (window.location.pathname !== '/login-signup') {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            navigate('/login-signup', { replace: true });
          }
        })
        .finally(() => {
          setIsValidating(false);
        });
    } else if (!storedUserData && !user) {
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login-signup') {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        navigate('/login-signup', { replace: true });
      }
      setIsValidating(false);
    }
  }, [user, navigate]);

  const handleModeSelect = (mode) => {
    if (!userData) {
      console.error('No user data found');
      handleAuthRedirect(navigate, '/login-signup');
      return;
    }

    // Log the navigation attempt
    console.log('Attempting to navigate to mode:', mode);

    // Use absolute path and force navigation
    if (mode === 'match-making') {
      window.location.href = '/match-making';
    } else {
      window.location.href = `/${mode}`;
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    handleLogout(navigate);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Show loading state
  if (isValidating && !userData) {
    return (
      <div className="h-screen w-full flex items-center justify-center space-bg">
        <div className="w-screen h-screen">
          <Lottie 
            animationData={loadingAnimation} 
            loop={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    );
  }

  // If we have user data, show the page
  if (userData) {
    return (
      <div className="min-h-screen space-bg">
        {/* Top Bar */}
        <div className="space-card p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <motion.img
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                src={processProfilePictureUrl(userData.picture, userData.name)}
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-[var(--space-accent)] cursor-pointer object-cover"
                onClick={() => navigate('/profile')}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = processProfilePictureUrl(userData.picture, userData.name);
                }}
                crossOrigin="anonymous"
              />
              <div className="space-text cursor-pointer" onClick={() => navigate('/profile')}>
                <motion.h2 
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="font-bold text-xl"
                >
                  {userData.name}
                </motion.h2>
                <motion.p 
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="text-sm space-text-secondary"
                >
                  Space Explorer Level {userData.level || 1}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.div 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl flex items-center space-x-2"
              >
                <FaWallet className="text-purple-300" />
                <span className="space-text font-bold">${userData.balance || 0}</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl flex items-center space-x-2"
              >
                <FaStar className={getTierColor(userData.rank)} />
                <span className="space-text font-bold">
                  {userData.rank ? `Rank ${userData.rank}` : 'Rank N/A'}
                </span>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogoutClick}
                className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl flex items-center space-x-2 space-text font-medium transition-colors cursor-pointer"
              >
                <FaSignOutAlt className="text-red-400" />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="space-card p-8 rounded-2xl max-w-md w-full mx-4"
            >
              <h3 className="text-2xl font-bold space-text mb-4">Confirm Logout</h3>
              <p className="space-text-secondary mb-6">Are you sure you want to leave the space station? You'll need to sign in again to continue your journey.</p>
              <div className="flex justify-end space-x-4">
                <motion.button
                  onClick={handleCancelLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="space-button bg-[var(--space-card-bg)]"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleConfirmLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="space-button bg-[var(--space-error)]"
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Game Modes */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.h1 
            whileHover={{ scale: 1.05, y: -5 }}
            className="text-4xl font-bold space-text text-center mb-12"
          >
            Choose Your Space Mission
          </motion.h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 1v1 Mode */}
            <motion.div
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                boxShadow: "0 8px 24px 0 rgba(139,92,246,0.7),-4px 4px 16px 0 rgba(139,92,246,0.3),4px 4px 16px 0 rgba(139,92,246,0.3)",
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleModeSelect('match-making')}
              className="space-card p-8 cursor-pointer"
            >
              <div className="flex items-center space-x-4 mb-4">
                <FaRocket className="text-3xl text-[var(--space-accent)]" />
                <motion.h2 
                  whileHover={{ scale: 1.1, x: 5 }}
                  className="text-2xl font-bold space-text"
                >
                  1v1 Battle 
                </motion.h2>
              </div>
              <motion.p 
                whileHover={{ scale: 1.05, x: 5 }}
                className="space-text-secondary mb-6"
              >
                Challenge another space explorer in an epic battle of cosmic knowledge!
              </motion.p>
              <motion.ul 
                className="space-y-2 space-text-secondary"
              >
                <motion.li whileHover={{ scale: 1.05, x: 5 }}>• 7 seconds per question</motion.li>
                <motion.li whileHover={{ scale: 1.05, x: 5 }}>• Real-time space combat</motion.li>
                <motion.li whileHover={{ scale: 1.05, x: 5 }}>• Win cosmic rewards</motion.li>
              </motion.ul>
            </motion.div>

            {/* AI Challenge Mode */}
            <motion.div
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                boxShadow: "0 8px 24px 0 rgba(139,92,246,0.7),-4px 4px 16px 0 rgba(139,92,246,0.3),4px 4px 16px 0 rgba(139,92,246,0.3)",
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
              className="space-card p-8 cursor-pointer opacity-50"
            >
              <div className="flex items-center space-x-4 mb-4">
                <FaRobot className="text-3xl text-[var(--space-success)]" />
                <motion.h2 
                  whileHover={{ scale: 1.1, x: 5 }}
                  className="text-2xl font-bold space-text"
                >
                  AI Challenge
                </motion.h2>
              </div>
              <motion.p 
                whileHover={{ scale: 1.05, x: 5 }}
                className="space-text-secondary mb-6"
              >
                Coming soon: Test your skills against our advanced AI space station!
              </motion.p>
              <motion.ul 
                className="space-y-2 space-text-secondary"
              >
                <motion.li whileHover={{ scale: 1.05, x: 5 }}>• Training mode</motion.li>
                <motion.li whileHover={{ scale: 1.05, x: 5 }}>• Adaptive difficulty</motion.li>
                <motion.li whileHover={{ scale: 1.05, x: 5 }}>• Master the cosmos</motion.li>
              </motion.ul>
            </motion.div>

            {/* Coming Soon Mode */}
            <motion.div
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                boxShadow: "0 8px 24px 0 rgba(139,92,246,0.7),-4px 4px 16px 0 rgba(139,92,246,0.3),4px 4px 16px 0 rgba(139,92,246,0.3)",
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
              className="space-card p-8 cursor-pointer opacity-50"
            >
              <div className="flex items-center space-x-4 mb-4">
                <FaUserAstronaut className="text-3xl text-[var(--space-warning)]" />
                <motion.h2 
                  whileHover={{ scale: 1.1, x: 5 }}
                  className="text-2xl font-bold space-text"
                >
                  Battle Royale
                </motion.h2>
              </div>
              <motion.p 
                whileHover={{ scale: 1.05, x: 5 }}
                className="space-text-secondary mb-6"
              >
                Coming soon: Team up with other space explorers for epic missions!
              </motion.p>
              <motion.ul 
                className="space-y-2 space-text-secondary"
              >
                <motion.li whileHover={{ scale: 1.05, x: 5 }}>• Team battles</motion.li>
                <motion.li whileHover={{ scale: 1.05, x: 5 }}>• Strategic gameplay</motion.li>
                <motion.li whileHover={{ scale: 1.05, x: 5 }}>• Special rewards</motion.li>
              </motion.ul>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // If we don't have user data and we're not validating, redirect to login
  if (!isValidating && !userData) {
    if (window.location.pathname !== '/login-signup') {
      navigate('/login-signup', { replace: true });
    }
    return null;
  }

  return null;
}

export default GameModesPage;
