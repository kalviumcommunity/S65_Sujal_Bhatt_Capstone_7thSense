import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getUserData, handleLogout, processProfilePictureUrl } from "../utils/auth";
import { FaTrophy, FaMedal, FaCoins, FaChartLine, FaHistory, FaCrown, FaUser, FaEdit, FaSignOutAlt, FaWallet, FaStar } from 'react-icons/fa';
import Lottie from "lottie-react";
import loadingAnimation from '../assets/lottie/loading.json';

const API_URL = import.meta.env.VITE_API_URL;

function ProfilePage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [stats, setStats] = useState({
    matchesPlayed: 0,
    matchesWon: 0,
    winRate: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalEarnings: 0
  });
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [isProfilePictureLoading, setIsProfilePictureLoading] = useState(false);
  const [profilePictureError, setProfilePictureError] = useState(false);

  const validateStats = (stats) => {
    return {
      matchesPlayed: Math.max(0, Number(stats.matchesPlayed) || 0),
      matchesWon: Math.max(0, Number(stats.matchesWon) || 0),
      winRate: Math.min(100, Math.max(0, Number(stats.winRate) || 0)),
      currentStreak: Math.max(0, Number(stats.currentStreak) || 0),
      bestStreak: Math.max(0, Number(stats.bestStreak) || 0),
      totalEarnings: Math.max(0, Number(stats.totalEarnings) || 0)
    };
  };

  const fetchUserData = async () => {
    if (userData) {
      // Already have user data, no need to fetch again
      return;
    }

    try {
      console.log('=== Profile Page Fetch Debug ===');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/profile`, {
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.user) {
          console.error('No user data in response');
          return;
        }

        // Set user data first
        setUserData(data.user);
        
        // Debug the profile picture data
        console.log('Profile picture data received:', {
          picture: data.user.picture,
          profilePictureUrl: data.user.profilePictureUrl,
          hasPicture: !!data.user.picture,
          hasProfilePictureUrl: !!data.user.profilePictureUrl
        });
        
        // Only update profile picture if it's different from current
        const newPictureUrl = data.user.picture || data.user.profilePictureUrl || getFallbackAvatarUrl(data.user.name);
        console.log('Selected profile picture URL:', newPictureUrl);
        
        if (newPictureUrl !== profilePictureUrl) {
          console.log('Updating profile picture URL:', newPictureUrl);
          
          // If it's a Google profile picture (likely to have CORS issues), use our proxy
          let finalUrl = newPictureUrl;
          if (newPictureUrl.includes('googleusercontent.com') || newPictureUrl.includes('lh3.googleusercontent.com')) {
            finalUrl = `${API_URL}/api/profile-picture-proxy?url=${encodeURIComponent(newPictureUrl)}`;
            console.log('Using proxy for Google profile picture:', finalUrl);
          } else if (newPictureUrl.startsWith('http') && !newPictureUrl.startsWith(API_URL)) {
            // For other external URLs, use proxy as well
            finalUrl = `${API_URL}/api/profile-picture-proxy?url=${encodeURIComponent(newPictureUrl)}`;
            console.log('Using proxy for external profile picture:', finalUrl);
          } else if (!newPictureUrl.startsWith('http')) {
            // If the URL is from our backend, ensure it has the correct origin
            finalUrl = `${API_URL}${newPictureUrl.startsWith('/') ? '' : '/'}${newPictureUrl}`;
            console.log('Using backend URL:', finalUrl);
          }
          
          console.log('Final profile picture URL being set:', finalUrl);
          setProfilePictureUrl(finalUrl);
          setIsProfilePictureLoading(true);
          setProfilePictureError(false);
        }

        // Set stats
        const validatedStats = validateStats({
          matchesPlayed: data.user.matchesPlayed || 0,
          matchesWon: data.user.matchesWon || 0,
          winRate: data.user.winRate || 0,
          currentStreak: data.user.currentStreak || 0,
          bestStreak: data.user.bestStreak || 0,
          totalEarnings: data.user.totalEarnings || 0
        });
        setStats(validatedStats);

        // Update localStorage with all data including profile picture URL
        localStorage.setItem('userData', JSON.stringify({
          ...data.user,
          ...validatedStats,
          profilePictureUrl: newPictureUrl // Save the proxy URL if available
        }));
      } else {
        console.error('Profile fetch failed:', response.status);
        const localData = getUserData();
        if (localData) {
          setUserData(localData);
          // Use existing profile picture URL from localStorage
          if (localData.profilePictureUrl && localData.profilePictureUrl !== profilePictureUrl) {
            let finalUrl = localData.profilePictureUrl;
            
            // If it's a Google profile picture, use proxy
            if (localData.profilePictureUrl.includes('googleusercontent.com') || localData.profilePictureUrl.includes('lh3.googleusercontent.com')) {
              finalUrl = `${API_URL}/api/profile-picture-proxy?url=${encodeURIComponent(localData.profilePictureUrl)}`;
              console.log('Using proxy for localStorage Google profile picture:', finalUrl);
            } else if (localData.profilePictureUrl.startsWith('http') && !localData.profilePictureUrl.startsWith(API_URL)) {
              finalUrl = `${API_URL}/api/profile-picture-proxy?url=${encodeURIComponent(localData.profilePictureUrl)}`;
              console.log('Using proxy for localStorage external profile picture:', finalUrl);
            } else if (!localData.profilePictureUrl.startsWith('http')) {
              finalUrl = `${API_URL}${localData.profilePictureUrl.startsWith('/') ? '' : '/'}${localData.profilePictureUrl}`;
            }
            
            setProfilePictureUrl(finalUrl);
            setIsProfilePictureLoading(true);
            setProfilePictureError(false);
          }
          setStats(validateStats({
            matchesPlayed: localData.matchesPlayed || 0,
            matchesWon: localData.matchesWon || 0,
            winRate: localData.winRate || 0,
            currentStreak: localData.currentStreak || 0,
            bestStreak: localData.bestStreak || 0,
            totalEarnings: localData.totalEarnings || 0
          }));
        } else {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      navigate('/login');
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (!userData) {
      fetchUserData();
    }
  }, [userData]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    handleLogout(navigate);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

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

  const getTierGradient = (tier) => {
    const gradients = {
      bronze: 'from-amber-600 to-amber-800',
      silver: 'from-gray-300 to-gray-500',
      gold: 'from-yellow-400 to-yellow-600',
      platinum: 'from-blue-400 to-blue-600',
      diamond: 'from-purple-400 to-purple-600'
    };
    return gradients[tier?.toLowerCase()] || gradients.bronze;
  };

  // Show loading state
  if (!userData) {
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
                  e.target.src = processProfilePictureUrl(null, userData.name);
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
                  Level {userData.level || 1}
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
                className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl flex items-center space-x-2 space-text font-medium transition-colors"
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
              <p className="space-text-secondary mb-6">Are you sure you want to logout? You'll need to sign in again to access your account.</p>
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

        {/* Profile Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div 
              className="space-card p-8"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 8px 24px 0 rgba(139,92,246,0.7),-4px 4px 16px 0 rgba(139,92,246,0.3),4px 4px 16px 0 rgba(139,92,246,0.3)",
                transition: { duration: 0.3 }
              }}
            >
              <div className="flex flex-col items-center">
                <motion.img
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  src={processProfilePictureUrl(userData.picture, userData.name)}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-[var(--space-accent)] mb-4 object-cover"
                />
                <h2 className="text-2xl font-bold space-text mb-2">{userData.name}</h2>
                <p className="space-text-secondary mb-4">Level {userData.level || 1}</p>
                <div className="w-full bg-[var(--space-card-bg)] rounded-full h-2 mb-4">
                  <div 
                    className="bg-[var(--space-accent)] h-2 rounded-full"
                    style={{ width: `${(userData.xp || 0) / 100}%` }}
                  />
                </div>
                <p className="space-text-secondary text-sm mb-6">
                  {userData.xp || 0} XP / 100 XP to next level
                </p>
                <motion.button
                  onClick={() => navigate('/game-modes')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="space-button w-full"
                >
                  Play Now
                </motion.button>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div 
              className="space-card p-8"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 8px 24px 0 rgba(139,92,246,0.7),-4px 4px 16px 0 rgba(139,92,246,0.3),4px 4px 16px 0 rgba(139,92,246,0.3)",
                transition: { duration: 0.3 }
              }}
            >
              <h3 className="text-xl font-bold space-text mb-6">Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="space-text-secondary">Games Played</span>
                  <span className="space-text font-bold">{userData.gamesPlayed || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="space-text-secondary">Wins</span>
                  <span className="space-text font-bold">{userData.wins || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="space-text-secondary">Win Rate</span>
                  <span className="space-text font-bold">
                    {userData.gamesPlayed ? Math.round((userData.wins || 0) / userData.gamesPlayed * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="space-text-secondary">Total Earnings</span>
                  <span className="space-text font-bold">${userData.totalEarnings || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="space-text-secondary">Current Balance</span>
                  <span className="space-text font-bold">${userData.balance || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="space-text-secondary">Global Rank</span>
                  <span className="space-text font-bold">
                    {userData.rank ? `#${userData.rank}` : 'N/A'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Achievements Card */}
            <motion.div 
              className="space-card p-8"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 8px 24px 0 rgba(139,92,246,0.7),-4px 4px 16px 0 rgba(139,92,246,0.3),4px 4px 16px 0 rgba(139,92,246,0.3)",
                transition: { duration: 0.3 }
              }}
            >
              <h3 className="text-xl font-bold space-text mb-6">Achievements</h3>
              <div className="space-y-4">
                {userData.achievements?.map((achievement, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center space-x-4 p-3 rounded-lg bg-[var(--space-card-bg)]"
                  >
                    <div className="w-12 h-12 rounded-full bg-[var(--space-accent)]/20 flex items-center justify-center">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div>
                      <h4 className="space-text font-medium">{achievement.title}</h4>
                      <p className="space-text-secondary text-sm">{achievement.description}</p>
                    </div>
                  </motion.div>
                ))}
                {(!userData.achievements || userData.achievements.length === 0) && (
                  <p className="space-text-secondary text-center py-4">
                    No achievements yet. Keep playing to earn achievements!
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Recent Games */}
          <motion.div 
            className="mt-8 space-card p-8"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 8px 24px 0 rgba(139,92,246,0.7),-4px 4px 16px 0 rgba(139,92,246,0.3),4px 4px 16px 0 rgba(139,92,246,0.3)",
              transition: { duration: 0.3 }
            }}
          >
            <h3 className="text-xl font-bold space-text mb-6">Recent Games</h3>
            <div className="space-y-4">
              {userData.recentGames?.map((game, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-[var(--space-card-bg)]"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      game.result === 'win' ? 'bg-[var(--space-success)]/20' : 'bg-[var(--space-error)]/20'
                    }`}>
                      <span className="text-2xl">
                        {game.result === 'win' ? '🎉' : '😢'}
                      </span>
                    </div>
                    <div>
                      <h4 className="space-text font-medium">
                        vs {game.opponent}
                      </h4>
                      <p className="space-text-secondary text-sm">
                        {new Date(game.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      game.result === 'win' ? 'text-[var(--space-success)]' : 'text-[var(--space-error)]'
                    }`}>
                      {game.result === 'win' ? '+$' + game.amount : '-$' + game.amount}
                    </p>
                    <p className="space-text-secondary text-sm">
                      {game.score} - {game.opponentScore}
                    </p>
                  </div>
                </motion.div>
              ))}
              {(!userData.recentGames || userData.recentGames.length === 0) && (
                <p className="space-text-secondary text-center py-4">
                  No games played yet. Start your first game now!
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}

export default ProfilePage;
