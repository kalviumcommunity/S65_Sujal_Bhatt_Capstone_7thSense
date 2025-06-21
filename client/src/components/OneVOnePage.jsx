import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { handleAuthRedirect } from "../utils/auth";
import { FaTrophy, FaUser, FaClock, FaCheck, FaTimes, FaFire, FaBrain, FaUserCircle, FaHandshake, FaExclamationTriangle } from 'react-icons/fa';
import Lottie from "lottie-react";
import loadingAnimation from '../assets/lottie/loading.json';

const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

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

function OneVOnePage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomId = queryParams.get('room');
  const [socket, setSocket] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [opponentData, setOpponentData] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [queuePosition, setQueuePosition] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false);
  const [gameState, setGameState] = useState({
    status: 'waiting',
    currentQuestion: null,
    scores: {},
    timeLeft: 7,
    questionNumber: 0,
    totalQuestions: 10,
    selectedAnswer: null,
    lastAnswerCorrect: null,
    showAnswerFeedback: false,
    firstAnswer: null,
    difficulty: 'easy',
    category: '',
    lastAnswer: null,
    streaks: { [user?._id]: 0 },
    timerInterval: null,
    isReady: false
  });

  useEffect(() => {
    if (!user) {
      handleAuthRedirect(navigate, '/login-signup');
      return;
    }

    // Always disconnect any existing socket before creating a new one
    if (socket) {
      console.log('[DEBUG] Disconnecting previous socket before creating new one');
      socket.disconnect();
    }

    console.log('[DEBUG] Initializing socket connection for user:', user._id);
    
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket'],
      secure: import.meta.env.PROD
    });

    // Debug: log all socket events
    const debugEvents = [
      'connect', 'connect_error', 'disconnect', 'queuePosition', 'matchFound', 'gameStart',
      'questionUpdate', 'scoreUpdate', 'gameEnd', 'waitingForPlayers', 'countdownStart',
      'countdownUpdate', 'matchState', 'timerUpdate', 'error', 'gameError'
    ];
    debugEvents.forEach(event => {
      newSocket.on(event, (...args) => {
        console.log(`[SOCKET DEBUG] Event '${event}' received for user ${user._id} (socket ${newSocket.id}):`, ...args);
      });
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnectionError(null);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionError('Failed to connect to game server. Please try again.');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        console.log('Attempting to reconnect...');
        newSocket.connect();
      }
    });

    newSocket.on('queuePosition', (position) => { 
      console.log('Received queue position:', position);
      setQueuePosition(position);
    });

    newSocket.on('matchFound', ({ roomId, players }) => {
      const opponentId = players.find(id => id !== user._id);
      setOpponent(opponentId);
      setQueuePosition(null);
      setGameState(prev => ({ ...prev, status: 'countdown' }));
      console.log('Match found, opponent:', opponentId);
    });

    newSocket.on('gameStart', ({ players, scores }) => {
      const opponentId = players.find(id => id !== user._id);
      setOpponent(opponentId);
      setGameState(prev => ({
        ...prev,
        status: 'playing',
        scores,
        questionNumber: 1,
        timeLeft: 7
      }));
      console.log('Game started, opponent:', opponentId, 'players:', players);
    });

    newSocket.on('questionUpdate', ({ question, options, correct, questionNumber, category, difficulty }) => {
      console.log('Question update received:', { questionNumber, category, difficulty });
      
      // Clear any existing timer
      if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
      }

      // Set up a new timer for 7 seconds
      const startTime = Date.now();
      const initialTimeLeft = 7; // Fixed 7 seconds for each question
      
      const timerInterval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const calculatedTimeLeft = Math.max(0, initialTimeLeft - elapsedSeconds);
        
        setGameState(prev => ({
          ...prev,
          timeLeft: calculatedTimeLeft
        }));

        if (calculatedTimeLeft <= 0) {
          clearInterval(timerInterval);
          // Emit time's up event to server
          socket?.emit('timeUp', { roomId, userId: user._id });
        }
      }, 100); // Update more frequently for smoother countdown

      // Update the question state
      setGameState(prev => ({
        ...prev,
        status: 'playing',
        currentQuestion: { question, options, correct },
        questionNumber: questionNumber || prev.questionNumber + 1,
        timeLeft: initialTimeLeft,
        category,
        difficulty,
        selectedAnswer: null,
        showAnswerFeedback: false,
        firstAnswer: null,
        timerInterval
      }));
    });

    newSocket.on('scoreUpdate', ({ scores, lastAnswer }) => {
      console.log('Score update received:', { scores, lastAnswer });
      setGameState(prev => ({
        ...prev,
        scores,
        lastAnswer,
        streaks: {
          ...prev.streaks,
          [lastAnswer.userId]: lastAnswer.streak
        }
      }));
    });

    newSocket.on('gameEnd', ({ scores, winner, finalScore, stats }) => {
      console.log('=== Game End Event Debug ===');
      console.log('Game end event received:', { scores, winner, finalScore, stats });
      
      setGameState(prev => ({
        ...prev,
        status: 'ended',
        scores,
        winner,
        finalScore,
        stats
      }));

      // Refresh user data after match ends
      const fetchUserData = async () => {
        try {
          console.log('Fetching updated user data after match...');
          const token = localStorage.getItem('token');
          console.log('Using token:', token ? 'Token exists' : 'No token found');
          
          const response = await fetch(`${API_URL}/api/profile`, {
            credentials: "include",
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          console.log('Profile fetch response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Received updated user data:', data);
            if (data.user) {
              // Update localStorage with fresh data
              localStorage.setItem('userData', JSON.stringify(data.user));
              console.log('Updated localStorage with new user data:', {
                matchesPlayed: data.user.matchesPlayed,
                matchesWon: data.user.matchesWon,
                winRate: data.user.winRate,
                currentStreak: data.user.currentStreak,
                bestStreak: data.user.bestStreak,
                totalEarnings: data.user.totalEarnings
              });
              
              // Dispatch custom event to notify profile page of data update
              window.dispatchEvent(new Event('profileDataUpdate'));
            } else {
              console.error('No user data in response');
            }
          } else {
            const errorText = await response.text();
            console.error('Failed to fetch user data:', response.status, errorText);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchUserData();
    });

    newSocket.on('waitingForPlayers', () => {
      console.log('Waiting for players to be ready');
      setGameState(prev => ({
        ...prev,
        status: 'waitingForReady',
        isReady: false
      }));
    });

    newSocket.on('countdownStart', () => {
      console.log('Countdown starting');
      setGameState(prev => ({ ...prev, status: 'countdown' }));
      setCountdown(3); // Default to 3 if no update yet
    });

    newSocket.on('countdownUpdate', (count) => {
      console.log('Countdown update:', count);
      setCountdown(count);
    });

    newSocket.on('matchState', ({ players, scores, countdown, status }) => {
      const opponentId = players.find(id => id !== user._id);
      setOpponent(opponentId);
      setGameState(prev => ({
        ...prev,
        scores,
        status: status === 'countdown' ? 'countdown' : 'playing',
      }));
      if (status === 'countdown' && typeof countdown === 'number') {
        setCountdown(countdown);
      }
      console.log('Received matchState:', { players, scores, countdown, status, opponentId });
    });

    setSocket(newSocket);

    if (roomId) {
      console.log('[DEBUG] Emitting joinMatchRoom:', roomId, 'for user:', user._id);
      newSocket.emit('joinMatchRoom', { roomId, userId: user._id });
      // Emit debug event to confirm join
      newSocket.emit('debugJoinRoom', { roomId, userId: user._id });
    }

    return () => {
      console.log('[DEBUG] Cleaning up socket connection');
      if (newSocket) {
        newSocket.disconnect();
      }
      if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
      }
    };
  }, [user, navigate, roomId]);

  // Fetch opponent data when opponent ID is set
  useEffect(() => {
    const fetchOpponentData = async () => {
      if (!opponent) return;
      try {
        console.log('Fetching opponent data for ID:', opponent);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/users/${opponent}`, {
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          let finalPictureUrl = data.profilePictureUrl || data.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=6366f1&textColor=ffffff`;
          if (finalPictureUrl.includes('googleusercontent.com') || finalPictureUrl.includes('lh3.googleusercontent.com')) {
            finalPictureUrl = `${API_URL}/api/profile-picture-proxy?url=${encodeURIComponent(finalPictureUrl)}`;
          } else if (finalPictureUrl.startsWith('http') && !finalPictureUrl.startsWith(API_URL) && !finalPictureUrl.includes('dicebear.com')) {
            finalPictureUrl = `${API_URL}/api/profile-picture-proxy?url=${encodeURIComponent(finalPictureUrl)}`;
          }
          setOpponentData({ ...data, picture: finalPictureUrl });
          console.log('Fetched and set opponent data:', { ...data, picture: finalPictureUrl });
        } else {
          setOpponentData({ name: 'Opponent', picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent('Opponent')}&backgroundColor=6366f1&textColor=ffffff` });
          console.error('Failed to fetch opponent data:', response.status);
        }
      } catch (error) {
        setOpponentData({ name: 'Opponent', picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent('Opponent')}&backgroundColor=6366f1&textColor=ffffff` });
        console.error('Error fetching opponent data:', error);
      }
    };
    fetchOpponentData();
  }, [opponent]);

  // Start countdown when both players are ready
  useEffect(() => {
    if (gameState.status === 'countdown' && opponentData) {
      let count = 3;
      setCountdown(count);
      
      const countdownInterval = setInterval(() => {
        count--;
        setCountdown(count);
        
        if (count === 0) {
          clearInterval(countdownInterval);
          // Don't change status here, wait for server's gameStart event
          socket?.emit('playerReady', { roomId, userId: user._id });
        }
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [gameState.status, opponentData, socket, roomId, user._id]);

  // Handle countdown updates
  useEffect(() => {
    if (!socket) return;

    const handleCountdownUpdate = (countdownValue) => {
      console.log('Countdown update:', countdownValue);
      setCountdown(countdownValue);
      // Clear any existing question timer when countdown is active
      if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        setGameState(prev => ({
          ...prev,
          timerInterval: null,
          timeLeft: 0
        }));
      }
    };

    socket.on('countdownUpdate', handleCountdownUpdate);

    return () => {
      socket.off('countdownUpdate', handleCountdownUpdate);
    };
  }, [socket, gameState.timerInterval]);

  // Handle game start
  useEffect(() => {
    if (!socket) return;

    const handleGameStart = ({ players, scores }) => {
      console.log('Game started:', { players, scores });
      // Clear any existing timers
      if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
      }
      
      setGameState(prev => ({
        ...prev,
        status: 'playing',
        scores,
        questionNumber: 0, // Start at 0, will be incremented when first question arrives
        timeLeft: 0, // Start at 0, will be set when question arrives
        currentQuestion: null,
        selectedAnswer: null,
        showAnswerFeedback: false,
        firstAnswer: null,
        timerInterval: null
      }));
      
      // Clear the countdown state
      setCountdown(null);
    };

    socket.on('gameStart', handleGameStart);

    return () => {
      socket.off('gameStart', handleGameStart);
    };
  }, [socket, gameState.timerInterval]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
      }
    };
  }, [gameState.timerInterval]);

  const handleAnswer = (answer) => {
    if (!socket || !gameState.currentQuestion || gameState.selectedAnswer || !roomId) return;

    // Clear the timer when an answer is selected
    if (gameState.timerInterval) {
      clearInterval(gameState.timerInterval);
    }

    // Debug: log the values being compared
    console.log('[DEBUG] User selected answer:', answer, '| Correct answer:', gameState.currentQuestion.correct);

    // Normalize comparison to avoid whitespace/case issues
    const normalizedSelected = (answer ?? '').toString().trim();
    const normalizedCorrect = (gameState.currentQuestion.correct ?? '').toString().trim();
    const isCorrect = normalizedSelected === normalizedCorrect;

    setGameState(prev => ({
      ...prev,
      selectedAnswer: answer,
      lastAnswerCorrect: isCorrect,
      showAnswerFeedback: true,
      timerInterval: null // Clear the timer interval
    }));

    socket.emit('submitAnswer', {
      roomId: roomId,
      userId: user._id,
      answer,
      timeLeft: gameState.timeLeft // Send remaining time to server
    });

    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        showAnswerFeedback: false
      }));
    }, 1500);
  };

  // Handle ready button click
  const handleReady = () => {
    if (!socket || !roomId) return;
    console.log('Player ready:', user._id);
    socket.emit('playerReady', { roomId, userId: user._id });
    setGameState(prev => ({
      ...prev,
      isReady: true
    }));
  };

  // Add quit handler function after handleAnswer
  const handleQuit = () => {
    setShowQuitConfirmation(true);
  };

  const confirmQuit = () => {
    if (!socket || !roomId) return;
    
    // Clear any existing timer
    if (gameState.timerInterval) {
      clearInterval(gameState.timerInterval);
    }
    
    // Emit quit event to server
    socket.emit('playerQuit', { roomId, userId: user._id });
    
    // Update local state
    setGameState(prev => ({
      ...prev,
      status: 'ended',
      winner: opponent, // Opponent wins when player quits
      timerInterval: null
    }));
    
    setShowQuitConfirmation(false);
  };

  const cancelQuit = () => {
    setShowQuitConfirmation(false);
  };

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Connection Error</h2>
          <p className="text-red-400 mb-6">{connectionError}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full"
          >
            Retry Connection
          </motion.button>
        </div>
      </div>
    );
  }

  if (gameState.status === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Finding an Opponent...</h2>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="animate-pulse">
              <FaUser className="text-4xl text-purple-400" />
            </div>
            <div className="animate-pulse">
              <FaUser className="text-4xl text-purple-400" />
            </div>
          </div>
          {queuePosition !== null && (
            <p className="text-purple-200 mb-4">
              Position in queue: {queuePosition}
            </p>
          )}
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          {connectionError && (
            <p className="text-red-400 mt-4">{connectionError}</p>
          )}
        </div>
      </div>
    );
  }

  if (gameState.status === 'countdown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 p-0 m-0">
        {/* Blurred, dark overlay */}
        <div className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-md bg-black/70" />
        {/* Profile pictures in the background, faded and large */}
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none select-none">
          <div className="flex items-center justify-center w-full">
            <div className="flex-1 flex justify-end">
              <img
                src={processProfilePictureUrl(user.picture, user.name)}
                alt={user.name}
                className="w-40 h-40 md:w-56 md:h-56 rounded-full object-cover opacity-30 blur-sm shadow-2xl"
                style={{ filter: 'blur(2px)' }}
              />
            </div>
            <div className="flex-1 flex justify-start">
              <img
                src={processProfilePictureUrl(opponentData?.picture, opponentData?.name || 'Opponent')}
                alt={opponentData?.name || 'Opponent'}
                className="w-40 h-40 md:w-56 md:h-56 rounded-full object-cover opacity-30 blur-sm shadow-2xl"
                style={{ filter: 'blur(2px)' }}
              />
            </div>
          </div>
        </div>
        {/* Vibrating countdown number and Get Ready text */}
        <div className="fixed inset-0 z-60 flex flex-col items-center justify-center">
          <motion.div
            key={countdown}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: [1.2, 1], opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 400, damping: 10 }}
            className="text-white text-[7rem] md:text-[10rem] font-extrabold drop-shadow-lg mb-2 select-none"
            style={{ textShadow: '0 0 40px #a855f7, 0 0 10px #fff' }}
          >
            {countdown}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-purple-200 drop-shadow-lg mb-8 select-none"
          >
            Get Ready!
          </motion.div>
        </div>
      </div>
    );
  }

  if (gameState.status === 'ended') {
    const isWinner = gameState.winner === user._id;
    const isDraw = gameState.winner === 'draw';
    const userScore = gameState.scores[user._id] || 0;
    const opponentScore = gameState.scores[opponent] || 0;
    const scoreDifference = Math.abs(userScore - opponentScore);
    const stats = gameState.stats || {};

    return (
      <div className="min-h-screen space-bg flex items-center justify-center p-4">
        {/* Removed animated background elements for space theme consistency */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-4xl w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/10"
        >
          {/* Result Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: isDraw ? [0, 5, -5, 0] : isWinner ? [0, 10, -10, 0] : [0, -10, 10, 0]
              }}
              transition={{ duration: 0.5, repeat: 1 }}
              className="mb-6"
            >
              {isDraw ? (
                <FaHandshake className="text-6xl mx-auto text-blue-400 drop-shadow-lg" />
              ) : isWinner ? (
                <FaTrophy className="text-6xl mx-auto text-yellow-400 drop-shadow-lg" />
              ) : (
                <FaTimes className="text-6xl mx-auto text-red-400 drop-shadow-lg" />
              )}
            </motion.div>
            <motion.h2 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={`text-4xl font-bold mb-2 ${
                isDraw ? 'text-blue-400' : isWinner ? 'text-yellow-400' : 'text-red-400'
              }`}
            >
              {isDraw ? 'Draw!' : isWinner ? 'Victory!' : 'Game Over'}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-purple-200"
            >
              {isDraw 
                ? 'The match ended in a tie!' 
                : isWinner 
                ? 'Congratulations on your victory!' 
                : 'Better luck next time!'}
            </motion.p>
          </motion.div>

          {/* Score Display */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 rounded-2xl p-6 mb-8"
          >
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <div className="text-lg text-purple-200 mb-2">You</div>
                <div className={`text-4xl font-bold ${
                  isDraw ? 'text-blue-400' : isWinner ? 'text-yellow-400' : 'text-white'
                }`}>
                  {userScore}
                </div>
              </div>
              <div className="text-2xl text-purple-300 mx-4">vs</div>
              <div className="text-center flex-1">
                <div className="text-lg text-purple-200 mb-2">Opponent</div>
                <div className={`text-4xl font-bold ${
                  isDraw ? 'text-blue-400' : !isWinner ? 'text-yellow-400' : 'text-white'
                }`}>
                  {opponentScore}
                </div>
              </div>
            </div>
            {!isDraw && scoreDifference > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center mt-4 text-purple-300"
              >
                {isWinner 
                  ? `You won by ${scoreDifference} point${scoreDifference > 1 ? 's' : ''}!`
                  : `You lost by ${scoreDifference} point${scoreDifference > 1 ? 's' : ''}`
                }
              </motion.div>
            )}
          </motion.div>

          {/* Match Statistics */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-purple-200 mb-1">Questions</div>
              <div className="text-2xl font-bold text-white">{gameState.totalQuestions}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-purple-200 mb-1">Streak</div>
              <div className="text-2xl font-bold text-white">{stats.streak || 0}x</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-purple-200 mb-1">First Correct</div>
              <div className="text-2xl font-bold text-white">{stats.firstCorrect || 0}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-purple-200 mb-1">Accuracy</div>
              <div className="text-2xl font-bold text-white">{stats.accuracy || 0}%</div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/game-modes')}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
            >
              Play Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/profile')}
              className="flex-1 bg-white/10 text-white font-bold py-4 px-8 rounded-xl hover:bg-white/20 transition-all duration-200"
            >
              View Profile
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 p-8">
      {/* Countdown Display */}
      {gameState.status === 'countdown' && countdown !== null && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-black bg-opacity-70">
          <div className="text-7xl font-extrabold text-white mb-4 animate-pulse">{countdown}</div>
          <div className="text-2xl text-purple-200">Get Ready!</div>
        </div>
      )}
      {/* Quit Button */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleQuit}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaTimes className="text-sm" />
          Quit Game
        </motion.button>
      </div>

      {/* Quit Confirmation Modal */}
      <AnimatePresence>
        {showQuitConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={cancelQuit}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-red-900/90 to-red-800/90 backdrop-blur-md rounded-3xl p-8 max-w-md w-full mx-4 border border-red-500/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Warning Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", damping: 15 }}
                className="flex justify-center mb-6"
              >
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-400/50">
                  <FaExclamationTriangle className="text-4xl text-red-400" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white text-center mb-4"
              >
                Quit Game?
              </motion.h3>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-red-200 text-center mb-8 leading-relaxed"
              >
                Are you sure you want to quit? Your opponent will automatically win this match.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={cancelQuit}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-white/20"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmQuit}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
                >
                  Quit Game
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(gameState.timeLeft / 7) * 100}%` }}
            className="bg-purple-500 h-2 rounded-full"
          />
        </div>
      </div>
      {/* Score Display with User Profiles */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-6">
        {/* Current User */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 border-2 border-purple-500">
            {user.picture ? (
              <img 
                src={processProfilePictureUrl(user.picture, user.name)} 
                alt={user.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = processProfilePictureUrl(null, user.name);
                }}
              />
            ) : (
              <FaUserCircle className="w-full h-full text-purple-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user.name}</h3>
            <p className="text-3xl font-bold text-purple-400">{gameState.scores[user._id] || 0}</p>
            {gameState.streaks[user._id] >= 3 && (
              <div className="flex items-center text-yellow-400">
                <FaFire className="mr-1" />
                <span>{gameState.streaks[user._id]}x Streak!</span>
              </div>
            )}
          </div>
        </div>
        {/* Category and Difficulty */}
        <div className="text-center">
          <div className="mt-2 text-sm text-purple-300">
            {gameState.category} • {gameState.difficulty}
          </div>
        </div>
        {/* Opponent */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 border-2 border-purple-500">
            {opponentData?.picture ? (
              <img 
                src={processProfilePictureUrl(opponentData.picture, opponentData.name || 'Opponent')} 
                alt={opponentData.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Error loading opponent profile picture:', e);
                  e.target.onerror = null;
                  e.target.src = processProfilePictureUrl(null, opponentData.name || 'Opponent');
                }}
                crossOrigin="anonymous"
              />
            ) : (
              <FaUserCircle className="w-full h-full text-purple-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{opponentData?.name || 'Opponent'}</h3>
            <p className="text-3xl font-bold text-purple-400">{gameState.scores[opponent] || 0}</p>
            {gameState.streaks[opponent] >= 3 && (
              <div className="flex items-center text-yellow-400">
                <FaFire className="mr-1" />
                <span>{gameState.streaks[opponent]}x Streak!</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Timer */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-center">
        <motion.div
          animate={{ 
            scale: gameState.timeLeft <= 3 ? [1, 1.1, 1] : 1,
            rotate: gameState.timeLeft <= 3 ? [0, 5, -5, 0] : 0
          }}
          transition={{ 
            repeat: gameState.timeLeft <= 3 ? Infinity : 0, 
            duration: 0.5 
          }}
          className="relative w-24 h-24"
        >
          {/* Circular Progress Background */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={gameState.timeLeft <= 3 ? "#ef4444" : "#a855f7"}
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ pathLength: 1 }}
              animate={{ 
                pathLength: gameState.timeLeft / 7, // Fixed 7-second timer
                stroke: gameState.timeLeft <= 3 ? "#ef4444" : "#a855f7"
              }}
              transition={{ duration: 0.1 }}
              style={{
                transformOrigin: "center",
                transform: "rotate(-90deg)"
              }}
            />
          </svg>
          
          {/* Timer Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <FaClock className={`text-xl ${gameState.timeLeft <= 3 ? 'text-red-400' : 'text-purple-400'} mb-1`} />
              <span className={`text-2xl font-bold ${gameState.timeLeft <= 3 ? 'text-red-400' : 'text-white'}`}>
                {Math.ceil(gameState.timeLeft)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
      {/* Last Answer Feedback */}
      {gameState.lastAnswer && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="max-w-4xl mx-auto mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaBrain className={`text-2xl ${gameState.lastAnswer.isCorrect ? 'text-green-400' : 'text-red-400'} mr-2`} />
              <span className="text-white">
                {gameState.lastAnswer.userId === user._id ? 'You' : 'Opponent'} answered in {gameState.lastAnswer.timeTaken}s
                {gameState.lastAnswer.isFirstCorrect && (
                  <span className="text-green-400 ml-2">(First Correct!)</span>
                )}
              </span>
            </div>
            <div className="text-right">
              <span className={`text-xl font-bold ${gameState.lastAnswer.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {gameState.lastAnswer.isCorrect ? `+${gameState.lastAnswer.score}` : 'Incorrect'}
              </span>
              {gameState.lastAnswer.streak >= 3 && (
                <div className="text-yellow-400 text-sm">
                  {gameState.lastAnswer.streak}x Streak Bonus!
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      {/* Question Display */}
      {gameState.currentQuestion && (
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">{gameState.currentQuestion.question}</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-purple-300">{gameState.category}</span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/30 text-purple-200">
                {gameState.difficulty}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {gameState.currentQuestion.options.map((option, index) => {
              const isSelected = gameState.selectedAnswer === option;
              const isCorrect = option === gameState.currentQuestion.correct;
              const showFeedback = gameState.showAnswerFeedback;

              let buttonClass = 'relative p-6 rounded-xl text-lg font-medium transition-all ';
              if (gameState.selectedAnswer) {
                buttonClass += 'cursor-not-allowed opacity-70 ';
              } else {
                buttonClass += 'hover:bg-white/30 ';
              }

              if (showFeedback) {
                if (isCorrect) {
                  buttonClass += 'bg-green-500/50 text-white ';
                } else if (isSelected) {
                  buttonClass += 'bg-red-500/50 text-white ';
                } else {
                  buttonClass += 'bg-white/20 text-white ';
                }
              } else {
                buttonClass += 'bg-white/20 text-white ';
              }

              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: gameState.selectedAnswer ? 1 : 1.02 }}
                  whileTap={{ scale: gameState.selectedAnswer ? 1 : 0.98 }}
                  onClick={() => handleAnswer(option)}
                  disabled={gameState.selectedAnswer}
                  className={buttonClass}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default OneVOnePage;