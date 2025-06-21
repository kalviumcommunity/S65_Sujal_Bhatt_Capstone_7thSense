import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket, isSocketConnected } from "../utils/socket";
import { handleAuthRedirect } from "../utils/auth";
import { FaGamepad, FaUsers, FaTrophy, FaClock, FaSearch, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import Lottie from "lottie-react";
import loadingAnimation from '../assets/lottie/loading.json';

function MatchmakingPage({ user }) {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [socket, setSocket] = useState(null);
  const [searchTime, setSearchTime] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    if (!user) {
      handleAuthRedirect(navigate, '/login-signup');
      return;
    }

    // Initialize socket connection with retry logic
    const initializeSocket = () => {
      const socketInstance = getSocket(user._id);
      
      if (!socketInstance) {
        console.error('Failed to initialize socket');
        setConnectionStatus('error');
        return;
      }

      setSocket(socketInstance);
      
      // Check if socket is already connected
      if (socketInstance.connected) {
        console.log('Socket already connected');
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('connecting');
      }

      // Socket event listeners
      socketInstance.on("connect", () => {
        console.log("Socket connected in MatchmakingPage");
        setConnectionStatus('connected');
      });

      socketInstance.on("connect_error", (error) => {
        console.error("Socket connection error in MatchmakingPage:", error);
        setConnectionStatus('error');
      });

      socketInstance.on("disconnect", (reason) => {
        console.log("Socket disconnected in MatchmakingPage:", reason);
        setConnectionStatus('disconnected');
      });

      socketInstance.on("matchFound", ({ roomId, players }) => {
        console.log("Match found!", roomId, players);
        setIsSearching(false);
        navigate(`/1v1?room=${roomId}`);
      });

      socketInstance.on("queuePosition", (position) => {
        setQueuePosition(position);
      });
    };

    initializeSocket();

    // Cleanup function
    return () => {
      if (socket) {
        if (isSearching) {
          socket.emit("leaveMatchmaking", user._id);
        }
        socket.off("connect");
        socket.off("connect_error");
        socket.off("disconnect");
        socket.off("matchFound");
        socket.off("queuePosition");
      }
    };
  }, [user, navigate]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (isSearching) {
      timer = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    } else {
      setSearchTime(0);
    }
    return () => clearInterval(timer);
  }, [isSearching]);

  const handleStartMatchmaking = () => {
    if (!socket || !user || connectionStatus !== 'connected') {
      console.error('Cannot start matchmaking: Socket not connected');
      return;
    }
    
    setIsSearching(true);
    setQueuePosition(1);
    socket.emit("joinMatchmaking", user._id);
  };

  const handleCancelMatchmaking = () => {
    if (!socket || !user) return;
    setIsSearching(false);
    setQueuePosition(0);
    socket.emit("leaveMatchmaking", user._id);
  };

  const handleRetryConnection = () => {
    if (socket) {
      socket.connect();
    } else {
      const newSocket = getSocket(user._id);
      setSocket(newSocket);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show connection error state
  if (connectionStatus === 'error') {
    return (
      <div className="min-h-screen space-bg flex items-center justify-center">
        <div className="text-center p-8 space-card rounded-2xl">
          <FaExclamationTriangle className="text-4xl text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connection Error</h2>
          <p className="text-red-200 mb-6">Failed to connect to the game server. Please try again.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRetryConnection}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full"
          >
            Retry Connection
          </motion.button>
        </div>
      </div>
    );
  }

  // Show connecting state
  if (connectionStatus === 'connecting') {
    return (
      <div className="min-h-screen space-bg flex items-center justify-center">
        <div className="text-center p-8 space-card rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-4">Connecting...</h2>
          <p className="text-purple-200">Establishing connection to game server</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-bg">
      {/* Top navigation bar */}
      <div className="relative space-card p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 text-white hover:text-purple-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </motion.button>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1 
            whileHover={{ scale: 1.05, y: -5 }}
            className="text-4xl font-bold text-white mb-4 cursor-pointer"
          >
            Find Your Opponent
          </motion.h1>
          <motion.p 
            whileHover={{ scale: 1.05, x: 5 }}
            className="text-xl text-purple-200 cursor-pointer"
          >
            Challenge players from around the world in real-time battles!
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isSearching ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/10"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-gradient-to-br from-indigo-600/30 to-purple-600/30 rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-center justify-center mb-4">
                    <FaGamepad className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Quick Matches</h3>
                  <p className="text-purple-200">Find opponents instantly and start playing!</p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-gradient-to-br from-indigo-600/30 to-purple-600/30 rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-center justify-center mb-4">
                    <FaTrophy className="h-8 w-8 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Win Prizes</h3>
                  <p className="text-purple-200">Compete for cash prizes and climb the ranks!</p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-gradient-to-br from-indigo-600/30 to-purple-600/30 rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-center justify-center mb-4">
                    <FaUsers className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Global Community</h3>
                  <p className="text-purple-200">Play against players from around the world!</p>
                </motion.div>
              </div>

              <motion.button
                onClick={handleStartMatchmaking}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-xl shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
              >
                Start Matchmaking
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="searching"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/10"
            >
              <div className="flex flex-col items-center space-y-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 rounded-full border-4 border-purple-500 border-t-transparent"
                />

                <div className="text-center space-y-4">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-bold text-white mb-4"
                  >
                    Matchmaking
                  </motion.h2>
                  
                  <div className="flex items-center justify-center space-x-4 text-purple-200">
                    <FaClock className="h-5 w-5" />
                    <span className="text-xl">{formatTime(searchTime)}</span>
                  </div>

                  <div className="flex items-center justify-center space-x-4 text-purple-200">
                    <FaSearch className="h-5 w-5" />
                    <span>Position in queue: {queuePosition}</span>
                  </div>
                </div>

                <motion.button
                  onClick={handleCancelMatchmaking}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl font-semibold transition-colors"
                >
                  <FaTimes className="h-5 w-5" />
                  <span>Cancel Search</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MatchmakingPage;
