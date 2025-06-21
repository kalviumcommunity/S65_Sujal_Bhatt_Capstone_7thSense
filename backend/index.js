const dotenv = require("dotenv");
dotenv.config();
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("./passport");
const matchRouter = require("./routes/matchRoutes");
const revenueRouter = require("./routes/revenueRoutes");
const systemRouter = require("./routes/systemRoutes");
const userRouter = require("./routes/userRoutes");
const questionRouter = require("./routes/questionRoutes");
const db = require("./config/db.js");
const multer = require("multer");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios"); // Import axios for HTTP requests
const Razorpay = require("razorpay");
const jwt = require("jsonwebtoken");
const User = require("./models/userModel");
const mongoose = require('mongoose');
const Match = require("./models/matchModel");
const questionService = require("./services/questionService");

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            process.env.FRONTEND_URL,
            `${process.env.FRONTEND_URL}/*`,
            process.env.PRODUCTION_URL,
            `${process.env.PRODUCTION_URL}/*`
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"]
    },
});

// Initialize question service and preload some questions
let isQuestionServiceReady = false;

// Move question service initialization to after database connection
async function initializeQuestionService() {
  try {
    await questionService.initialize();
    isQuestionServiceReady = true;
    console.log('Question service initialized with fallback questions and API preloading');
  } catch (error) {
    console.error('Error initializing question service:', error);
    isQuestionServiceReady = true; // Still allow the app to run with fallback
  }
}

// Matchmaking queue
const matchmakingQueue = new Map(); // userId -> socketId

// Store active matches
const activeMatches = new Map();
const statsUpdated = new Set(); // Track which matches have had their stats updated
const activeRooms = new Set(); // Track active room IDs to prevent duplicates
const socketToUser = new Map(); // socketId -> userId for disconnect cleanup

// Function to clean up used questions when match ends
async function cleanupUsedQuestions(roomId) {
  const match = activeMatches.get(roomId);
  if (match && match.usedQuestions.size > 0) {
    try {
      const Question = require('./models/questionModel');
      const questionIds = Array.from(match.usedQuestions).map(q => q._id || q).filter(id => id);
      
      if (questionIds.length > 0) {
        // Mark questions as used instead of deleting them
        const result = await Question.updateMany(
          { _id: { $in: questionIds } },
          { $set: { isUsed: true } }
        );
        console.log(`✅ Marked ${result.modifiedCount} used questions as 'isUsed: true' from match: ${roomId}`);
      }
    } catch (error) {
      console.error('❌ Failed to mark used questions:', error.message);
    }
  }
}

// Handle matchmaking
io.on('connection', (socket) => {
  console.log('[SOCKET DEBUG] User connected:', socket.id);

  // Debug: log all incoming events
  const debugEvents = [
    'joinMatchmaking', 'joinMatchRoom', 'submitAnswer', 'playerQuit', 'gameEnd', 'playerReady', 'timeUp', 'debugJoinRoom'
  ];
  debugEvents.forEach(event => {
    socket.on(event, (...args) => {
      console.log(`[SOCKET DEBUG] Event '${event}' received from socket ${socket.id}:`, ...args);
    });
  });

  // Add debugJoinRoom event for confirmation
  socket.on('debugJoinRoom', ({ roomId, userId }) => {
    console.log(`[SOCKET DEBUG] debugJoinRoom received for room ${roomId}, user ${userId}, socket ${socket.id}`);
    socket.emit('debugJoinRoomConfirmation', { roomId, userId, socketId: socket.id });
  });

  socket.on('joinMatchmaking', async (userId) => {
    console.log('=== Matchmaking Debug ===');
    console.log('User joined matchmaking:', userId, 'Socket ID:', socket.id);
    console.log('Current queue before adding:', Array.from(matchmakingQueue.entries()));
    
    // Store socket to user mapping for disconnect cleanup
    socketToUser.set(socket.id, userId);
    
    // Check if user is already in queue with a different socket
    if (matchmakingQueue.has(userId)) {
      console.log('User already in queue, updating socket ID');
      const oldSocketId = matchmakingQueue.get(userId);
      const oldSocket = io.sockets.sockets.get(oldSocketId);
      if (oldSocket) {
        oldSocket.disconnect();
      }
      socketToUser.delete(oldSocketId);
    }
    
    matchmakingQueue.set(userId, socket.id);
    
    console.log('Current queue after adding:', Array.from(matchmakingQueue.entries()));
    console.log('Queue size:', matchmakingQueue.size);
    
    if (matchmakingQueue.size >= 2) {
      console.log('Found enough players for a match');
      const players = Array.from(matchmakingQueue.entries()).slice(0, 2);
      const [player1, player2] = players;
      
      console.log('Selected players:', { player1, player2 });
      
      // Create consistent room ID by sorting player IDs alphabetically
      const sortedPlayers = [player1[0], player2[0]].sort();
      const matchRoom = `match_${sortedPlayers[0]}_${sortedPlayers[1]}`;
      
      // Check if this room already exists
      if (activeRooms.has(matchRoom)) {
        console.log('Room already exists, skipping creation:', matchRoom);
        matchmakingQueue.delete(player1[0]);
        matchmakingQueue.delete(player2[0]);
        return;
      }
      
      console.log('Created match room:', matchRoom);
      activeRooms.add(matchRoom);
      
      matchmakingQueue.delete(player1[0]);
      matchmakingQueue.delete(player2[0]);
      
      console.log('Queue after removing matched players:', Array.from(matchmakingQueue.entries()));
      
      const player1Socket = io.sockets.sockets.get(player1[1]);
      const player2Socket = io.sockets.sockets.get(player2[1]);
      
      console.log('Socket status:', {
        player1Socket: !!player1Socket,
        player2Socket: !!player2Socket
      });
      
      if (player1Socket && player2Socket) {
        player1Socket.join(matchRoom);
        player2Socket.join(matchRoom);
        
        console.log('Players joined room:', matchRoom);
        
        io.to(matchRoom).emit('matchFound', {
          roomId: matchRoom,
          players: [player1[0], player2[0]]
        });

        // Initialize match state with enhanced game mechanics
        activeMatches.set(matchRoom, {
          players: [player1[0], player2[0]],
          scores: { [player1[0]]: 0, [player2[0]]: 0 },
          currentQuestion: null,
          questionStartTime: null,
          questionNumber: 0,
          answeredPlayers: new Set(),
          usedQuestions: new Set(),
          firstAnswer: null,
          streaks: { [player1[0]]: 0, [player2[0]]: 0 },
          categories: new Set(['General']),
          difficulty: 'easy',
          timeLimit: 7,
          lastAnswerTime: null,
          startTime: new Date(),
          joinedUsers: new Set(),
          countdownStarted: false,
          countdownInProgress: false,
          currentCountdown: null
        });

        console.log('Match state initialized:', activeMatches.get(matchRoom));
      } else {
        console.log('One or both players disconnected before match could start');
        matchmakingQueue.delete(player1[0]);
        matchmakingQueue.delete(player2[0]);
        activeRooms.delete(matchRoom);
      }
    } else {
      console.log('Not enough players for a match, current queue size:', matchmakingQueue.size);
      socket.emit('queuePosition', matchmakingQueue.size);
    }
  });

  socket.on('joinMatchRoom', (data) => {
    // Support both old and new signatures
    let roomId, userId;
    if (typeof data === 'object' && data !== null) {
      roomId = data.roomId;
      userId = data.userId;
    } else {
      roomId = data;
      userId = socketToUser.get(socket.id);
    }

    console.log('=== Room Join Debug ===');
    console.log('Player joining room:', roomId, 'Socket ID:', socket.id, 'User ID:', userId);

    // Check if room exists and is active
    if (!activeRooms.has(roomId)) {
      console.log('Room not found or not active:', roomId);
      socket.emit('roomNotFound');
      return;
    }

    socket.join(roomId);

    const match = activeMatches.get(roomId);
    if (match) {
      const room = io.sockets.adapter.rooms.get(roomId);
      console.log('Room size:', room?.size);
      console.log('Match state:', match);

      // Always set mapping and add to joinedUsers
      if (userId) {
        match.joinedUsers.add(userId);
        socketToUser.set(socket.id, userId);
        console.log('User joined match room:', userId, 'Joined users:', Array.from(match.joinedUsers));
      } else {
        console.warn('Could not determine userId for socket:', socket.id);
      }
      // --- Emit matchState to the joining socket ---
      socket.emit('matchState', {
        players: match.players,
        scores: match.scores,
        countdown: match.countdownInProgress ? match.currentCountdown : null,
        status: match.countdownInProgress ? 'countdown' : 'playing',
      });
      // --- End emit matchState ---

      if (match.countdownInProgress) {
        if (typeof match.currentCountdown === 'number') {
          socket.emit('countdownStart');
          socket.emit('countdownUpdate', match.currentCountdown);
        }
      }

      // --- Only start countdown when both users have joined ---
      if (match.joinedUsers.size === 2 && !match.countdownStarted) {
        console.log('Both users joined match room, starting countdown');
        io.to(roomId).emit('countdownStart');
        let countdown = 3;
        match.countdownInProgress = true;
        match.countdownStarted = true;
        match.currentCountdown = countdown;
        const countdownInterval = setInterval(() => {
          if (countdown > 0) {
            io.to(roomId).emit('countdownUpdate', countdown);
            match.currentCountdown = countdown;
            countdown--;
          } else {
            clearInterval(countdownInterval);
            match.countdownInProgress = false;
            match.currentCountdown = null;
            // Start the game after countdown reaches 0
            console.log('Countdown finished, starting game');
            io.to(roomId).emit('gameStart', {
              players: match.players,
              scores: match.scores
            });
            setTimeout(() => {
              if (activeMatches.has(roomId)) {
                console.log('Starting first question in room:', roomId);
                startNewQuestion(roomId);
              }
            }, 1000);
          }
        }, 1000);
      }
      // --- End countdown logic ---
    } else {
      console.log('No match found for room:', roomId);
    }
  });

  socket.on('submitAnswer', async ({ roomId, userId, answer }) => {
    console.log('=== Answer Submission ===');
    console.log('Room:', roomId, 'User:', userId);
    
    const match = activeMatches.get(roomId);
    if (!match) {
      console.log('No match found for room:', roomId);
      return;
    }

    // If both players have already answered, ignore this submission
    if (match.answeredPlayers.size >= 2) {
      console.log('Both players already answered, ignoring submission');
      return;
    }

    const currentTime = Date.now();
    const timeTaken = (currentTime - match.questionStartTime) / 1000;
    console.log(`Answer submitted at ${timeTaken}s for question ${match.questionNumber}`);
    
    const isCorrect = answer === match.currentQuestion.correct;
    
    // Calculate score based on time taken and difficulty
    let score = 0;
    let isFirstCorrect = false;

    if (isCorrect) {
      // Check if this is the first correct answer
      if (!match.firstAnswer) {
        isFirstCorrect = true;
        const timeBonus = Math.max(0, match.timeLimit - timeTaken);
        const difficultyMultiplier = match.difficulty === 'easy' ? 1 : match.difficulty === 'medium' ? 1.5 : 2;
        score = Math.round((100 + timeBonus * 10) * difficultyMultiplier);
        
        // Streak bonus
        match.streaks[userId]++;
        if (match.streaks[userId] >= 3) {
          score = Math.round(score * 1.5); // 50% bonus for 3+ streak
        }
        match.firstAnswer = userId;
      } else {
        // Second correct answer gets points too, but with a time penalty
        const timeBonus = Math.max(0, match.timeLimit - timeTaken);
        const difficultyMultiplier = match.difficulty === 'easy' ? 1 : match.difficulty === 'medium' ? 1.5 : 2;
        score = Math.round((50 + timeBonus * 5) * difficultyMultiplier); // Half points for second correct answer
        
        // Streak bonus still applies
        match.streaks[userId]++;
        if (match.streaks[userId] >= 3) {
          score = Math.round(score * 1.5);
        }
      }
    } else {
      match.streaks[userId] = 0;
    }

    // Update score for both first and second correct answers
    if (isCorrect) {
      match.scores[userId] += score;
    }

    match.answeredPlayers.add(userId);
    match.lastAnswerTime = currentTime;

    // Notify all players in the room of the score update
    io.to(roomId).emit('scoreUpdate', {
      scores: match.scores,
      lastAnswer: {
        userId,
        isCorrect,
        score,
        timeTaken: Math.round(timeTaken * 10) / 10,
        streak: match.streaks[userId],
        isFirstCorrect
      }
    });

    // If both players have answered, wait for the full time limit before starting next question
    if (match.answeredPlayers.size >= 2) {
      console.log('Both players answered, waiting for full time limit');
      // Don't clear the timer - let it run until the full 7 seconds are up
      // The timer will handle starting the next question when time is up
    }
  });

  socket.on('playerQuit', async ({ roomId, userId }) => {
    console.log('=== Player Quit Event ===');
    console.log('Room:', roomId, 'User:', userId);
    
    const match = activeMatches.get(roomId);
    if (!match) {
      console.log('No match found for room:', roomId);
      return;
    }

    // Get the opponent's ID
    const opponentId = match.players.find(id => id !== userId);
    if (!opponentId) {
      console.log('No opponent found for quitting player');
      return;
    }

    // Clear any existing timer
    if (match.timerInterval) {
      clearInterval(match.timerInterval);
      match.timerInterval = null;
    }

    // Emit game end event with opponent as winner
    io.to(roomId).emit('gameEnd', {
      scores: match.scores,
      winner: opponentId, // Opponent wins when player quits
      finalScore: match.scores[opponentId],
      stats: {
        streaks: match.streaks,
        categories: Array.from(match.categories)
      },
      quitBy: userId // Add this to indicate who quit
    });

    // Clean up the match
    (async () => {
      await cleanupUsedQuestions(roomId);
      activeMatches.delete(roomId);
      activeRooms.delete(roomId);
    })();
  });

  socket.on('gameEnd', async ({ scores, winner }) => {
    console.log('=== Game End Event Debug ===');
    console.log('Socket ID:', socket.id);
    console.log('Scores:', scores);
    console.log('Winner:', winner);
    
    // Get the roomId from the socket's rooms
    const rooms = Array.from(socket.rooms);
    console.log('Socket rooms:', rooms);
    const matchRoom = rooms.find(room => room.startsWith('match_'));
    console.log('Match room:', matchRoom);
    
    if (!matchRoom) {
      console.error('No match room found for socket:', socket.id);
      return;
    }

    // Check if stats were already updated for this match
    if (statsUpdated.has(matchRoom)) {
      console.log('Stats already updated for match:', matchRoom);
      return;
    }

    // Update user stats in database
    const match = activeMatches.get(matchRoom);
    console.log('Active match data:', match);
    
    if (match) {
      const [player1, player2] = match.players;
      console.log('Players:', { player1, player2 });
      
      const player1Score = scores[player1];
      const player2Score = scores[player2];
      const player1Won = player1Score > player2Score;
      const player2Won = player2Score > player1Score;

      console.log('Match results:', {
        player1: { 
          id: player1,
          score: player1Score, 
          won: player1Won
        },
        player2: { 
          id: player2,
          score: player2Score, 
          won: player2Won
        }
      });

      // Calculate earnings
      const entryFee = 10;
      const winnerEarnings = Math.floor(entryFee * 1.6);

      // Update player 1 stats
      const updatePlayer1 = async () => {
        try {
          // First check current stats
          const currentUser = await User.findById(player1);
          console.log('Current player 1 stats before update:', {
            id: player1,
            matchesPlayed: currentUser.matchesPlayed,
            matchesWon: currentUser.matchesWon,
            currentStreak: currentUser.currentStreak,
            bestStreak: currentUser.bestStreak,
            totalEarnings: currentUser.totalEarnings
          });

          // Create a new Match document with valid settings
          const newMatch = await Match.create({
            players: [
              {
                user: new mongoose.Types.ObjectId(player1),
                score: player1Score,
                earnings: player1Won ? winnerEarnings : 0,
                status: 'finished'
              },
              {
                user: new mongoose.Types.ObjectId(player2),
                score: player2Score,
                earnings: player2Won ? winnerEarnings : 0,
                status: 'finished'
              }
            ],
            winner: player1Won ? new mongoose.Types.ObjectId(player1) : new mongoose.Types.ObjectId(player2),
            status: 'completed',
            startTime: match.startTime,
            endTime: new Date(),
            type: 'casual',
            entryFee: 10,
            prizePool: winnerEarnings * 2,
            settings: {
              difficulty: match.difficulty || 'easy',
              category: Array.from(match.categories)[0] || 'General',
              timePerQuestion: 7,
              questionsCount: match.questionNumber || 10
            }
          });

          if (!newMatch) {
            console.error('Failed to create match document for player 1 stats update');
            return;
          }

          // Store the match ID in the match state for player 2 to use
          match.matchId = newMatch._id;

          // Update player stats
          const updateData = {
            $inc: {
              matchesPlayed: 1,
              matchesWon: player1Won ? 1 : 0,
              totalEarnings: player1Won ? winnerEarnings : 0
            },
            $set: {
              currentStreak: player1Won ? (currentUser.currentStreak || 0) + 1 : -1,
              bestStreak: Math.max(currentUser.bestStreak || 0, player1Won ? (currentUser.currentStreak || 0) + 1 : 0)
            },
            $push: {
              matchHistory: {
                matchId: newMatch._id,
                opponent: new mongoose.Types.ObjectId(player2),
                result: player1Won ? 'Win' : 'Loss',
                score: player1Score,
                earnings: player1Won ? winnerEarnings : 0,
                date: new Date()
              }
            }
          };

          console.log('Updating player 1 with data:', updateData);

          const updatedUser = await User.findByIdAndUpdate(
            new mongoose.Types.ObjectId(player1),
            updateData,
            { new: true, runValidators: true }
          );

          if (!updatedUser) {
            throw new Error('Failed to update player 1 stats');
          }

          console.log('Player 1 stats after update:', {
            id: updatedUser._id,
            matchesPlayed: updatedUser.matchesPlayed,
            matchesWon: updatedUser.matchesWon,
            currentStreak: updatedUser.currentStreak,
            bestStreak: updatedUser.bestStreak,
            totalEarnings: updatedUser.totalEarnings,
            winRate: updatedUser.winRate,
            rank: updatedUser.rank
          });

          // Verify the update in database
          const verifiedUser = await User.findById(player1);
          console.log('Verified player 1 stats in database:', {
            id: verifiedUser._id,
            matchesPlayed: verifiedUser.matchesPlayed,
            matchesWon: verifiedUser.matchesWon,
            currentStreak: verifiedUser.currentStreak,
            bestStreak: verifiedUser.bestStreak,
            totalEarnings: verifiedUser.totalEarnings,
            winRate: verifiedUser.winRate,
            rank: verifiedUser.rank
          });

        } catch (error) {
          console.error('Error updating player 1 stats:', error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            playerId: player1
          });
          throw error; // Re-throw to be caught by Promise.all
        }
      };

      // Update player 2 stats
      const updatePlayer2 = async () => {
        try {
          // First check current stats
          const currentUser = await User.findById(player2);
          console.log('Current player 2 stats:', {
            id: player2,
            currentMatchesPlayed: currentUser.matchesPlayed,
            currentMatchesWon: currentUser.matchesWon
          });

          // Use the stored match ID if available (from player 1's update)
          let newMatch;
          if (match.matchId) {
            newMatch = await Match.findById(match.matchId);
            if (!newMatch) {
              console.error(`Match document not found for stored ID: ${match.matchId}`);
              // Fallback to search by players and start time
              newMatch = await Match.findOne({
                players: { 
                  $all: [
                    new mongoose.Types.ObjectId(player1), 
                    new mongoose.Types.ObjectId(player2)
                  ]
                },
                startTime: match.startTime
              }).sort({ createdAt: -1 });
            }
          } else {
            // Try to find the match by players and start time
            newMatch = await Match.findOne({
              players: { 
                $all: [
                  new mongoose.Types.ObjectId(player1), 
                  new mongoose.Types.ObjectId(player2)
                ]
              },
              startTime: match.startTime
            }).sort({ createdAt: -1 });
          }

          if (!newMatch) {
            console.error('Could not find the match document for player 2 stats update');
            console.error('Search criteria:', {
              player1,
              player2,
              startTime: match.startTime,
              storedMatchId: match.matchId
            });
            return;
          }

          const updatedUser = await User.findByIdAndUpdate(
            new mongoose.Types.ObjectId(player2),
            {
              $inc: {
                matchesPlayed: 1,
                matchesWon: isDraw ? 0 : (player2Score > player1Score ? 1 : 0),
                totalEarnings: isDraw ? Math.floor(entryFee * 0.8) : (player2Score > player1Score ? winnerEarnings : 0)
              },
              $set: {
                currentStreak: isDraw ? 0 : (player2Score > player1Score ? (currentUser.currentStreak || 0) + 1 : 0),
                bestStreak: Math.max(currentUser.bestStreak || 0, player2Score > player1Score ? (currentUser.currentStreak || 0) + 1 : 0)
              },
              $push: {
                matchHistory: {
                  matchId: newMatch._id,
                  opponent: new mongoose.Types.ObjectId(player1),
                  result: isDraw ? 'Draw' : (player2Score > player1Score ? 'Win' : 'Loss'),
                  score: player2Score,
                  earnings: isDraw ? Math.floor(entryFee * 0.8) : (player2Score > player1Score ? winnerEarnings : 0),
                  date: new Date()
                }
              }
            },
            { new: true }
          );
          console.log('Player 2 stats updated successfully:', {
            id: updatedUser._id,
            matchesPlayed: updatedUser.matchesPlayed,
            matchesWon: updatedUser.matchesWon,
            currentStreak: updatedUser.currentStreak,
            bestStreak: updatedUser.bestStreak,
            totalEarnings: updatedUser.totalEarnings
          });
        } catch (error) {
          console.error('Error updating player 2 stats:', error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            playerId: player2
          });
        }
      };

      // Update both players' stats and then emit game end event
      Promise.all([updatePlayer1(), updatePlayer2()])
        .then(() => {
          console.log('Both players stats updated successfully');
          // Mark this match as having its stats updated
          statsUpdated.add(matchRoom);
          // Emit game end event to both players
          io.to(matchRoom).emit('gameEnd', {
            scores,
            winner,
            finalScore: scores[winner],
            stats: {
              streaks: match.streaks,
              categories: Array.from(match.categories)
            }
          });
          // Clean up the match after stats are updated
          (async () => {
            await cleanupUsedQuestions(matchRoom);
            activeMatches.delete(matchRoom);
            activeRooms.delete(matchRoom);
          })();
          // Clean up the stats updated flag after a delay
          setTimeout(() => {
            statsUpdated.delete(matchRoom);
          }, 5000);
        })
        .catch(error => {
          console.error('Error updating player stats:', error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            matchRoom
          });
          // Emit error to clients
          io.to(matchRoom).emit('gameError', {
            message: 'Failed to update match statistics'
          });
        });
    } else {
      console.error('No active match found for room:', matchRoom);
    }
  });

  socket.on('disconnect', async () => {
    console.log('=== Disconnect Debug ===');
    console.log('User disconnected:', socket.id);
    
    // Get userId from socket mapping
    const userId = socketToUser.get(socket.id);
    socketToUser.delete(socket.id);
    
    if (userId) {
      console.log('Disconnected user ID:', userId);
      
      // Remove from matchmaking queue
      if (matchmakingQueue.has(userId)) {
        console.log('Removing disconnected user from queue:', userId);
        matchmakingQueue.delete(userId);
      }
      
      // Clean up any active matches this user was part of
      for (const [roomId, match] of activeMatches.entries()) {
        if (match.players.includes(userId)) {
          console.log('Cleaning up match due to disconnect:', roomId);
          
          // Clear any existing timer
          if (match.timerInterval) {
            clearInterval(match.timerInterval);
            match.timerInterval = null;
          }
          
          // Emit game end event with opponent as winner
          const opponentId = match.players.find(id => id !== userId);
          if (opponentId) {
            io.to(roomId).emit('gameEnd', {
              scores: match.scores,
              winner: opponentId,
              finalScore: match.scores[opponentId],
              stats: {
                streaks: match.streaks,
                categories: Array.from(match.categories)
              },
              quitBy: userId
            });
          }
          
          // Clean up the match
          (async () => {
            await cleanupUsedQuestions(roomId);
            activeMatches.delete(roomId);
            activeRooms.delete(roomId);
          })();
          break;
        }
      }
    }
    
    console.log('Current queue after disconnect:', Array.from(matchmakingQueue.entries()));
  });
});

async function startNewQuestion(roomId) {
  console.log('=== Starting New Question ===');
  console.log('Room:', roomId);
  
  const match = activeMatches.get(roomId);
  if (!match) {
    console.log('No match found for room:', roomId);
    return;
  }

  // Clear any existing timer for this room
  if (match.timerInterval) {
    console.log('Clearing existing timer for room:', roomId);
    clearInterval(match.timerInterval);
    match.timerInterval = null;
  }

  match.questionNumber++;
  console.log('Question number:', match.questionNumber);

  if (match.questionNumber > 10) {
    console.log('Game over - reached question limit');
    
    // Check if stats were already updated for this match
    if (statsUpdated.has(roomId)) {
      console.log('Stats already updated for match:', roomId);
      return;
    }

    // Game over
    const scores = match.scores;
    const [player1, player2] = match.players;
    const player1Score = scores[player1];
    const player2Score = scores[player2];
    
    // Determine winner or draw
    let winner;
    let isDraw = false;
    
    if (player1Score === player2Score) {
      winner = 'draw';
      isDraw = true;
    } else {
      winner = player1Score > player2Score ? player1 : player2;
    }

    // Calculate earnings (winner gets 80% of the entry fee, 20% goes to house)
    const entryFee = 10; // Base entry fee
    const winnerEarnings = Math.floor(entryFee * 1.6);

    // Update player 1 stats
    const updatePlayer1 = async () => {
      try {
        // First check current stats
        const currentUser = await User.findById(player1);
        console.log('Current player 1 stats:', {
          id: player1,
          currentMatchesPlayed: currentUser.matchesPlayed,
          currentMatchesWon: currentUser.matchesWon
        });

        // Create a new Match document first
        const newMatch = await Match.create({
          players: [
            {
              user: new mongoose.Types.ObjectId(player1),
              score: player1Score,
              earnings: isDraw ? Math.floor(entryFee * 0.8) : (player1Score > player2Score ? winnerEarnings : 0),
              status: 'finished'
            },
            {
              user: new mongoose.Types.ObjectId(player2),
              score: player2Score,
              earnings: isDraw ? Math.floor(entryFee * 0.8) : (player2Score > player1Score ? winnerEarnings : 0),
              status: 'finished'
            }
          ],
          winner: isDraw ? null : new mongoose.Types.ObjectId(winner),
          status: 'completed',
          startTime: match.startTime,
          endTime: new Date(),
          type: 'casual',
          entryFee: 10,
          prizePool: isDraw ? entryFee * 1.6 : winnerEarnings * 2,
          settings: {
            difficulty: match.difficulty || 'easy',
            category: Array.from(match.categories)[0] || 'General',
            timePerQuestion: 7,
            questionsCount: match.questionNumber || 10
          },
          isDraw: isDraw // Add this field to indicate if it was a draw
        });

        if (!newMatch) {
          console.error('Failed to create match document for player 1 stats update');
          return;
        }

        // Store the match ID in the match state for player 2 to use
        match.matchId = newMatch._id;

        // Update player stats
        const updateData = {
            $inc: {
              matchesPlayed: 1,
            matchesWon: isDraw ? 0 : (player1Score > player2Score ? 1 : 0),
            totalEarnings: isDraw ? Math.floor(entryFee * 0.8) : (player1Score > player2Score ? winnerEarnings : 0)
            },
            $set: {
            currentStreak: isDraw ? 0 : (player1Score > player2Score ? (currentUser.currentStreak || 0) + 1 : 0),
            bestStreak: Math.max(currentUser.bestStreak || 0, player1Score > player2Score ? (currentUser.currentStreak || 0) + 1 : 0)
            },
            $push: {
              matchHistory: {
                matchId: newMatch._id,
                opponent: new mongoose.Types.ObjectId(player2),
              result: isDraw ? 'Draw' : (player1Score > player2Score ? 'Win' : 'Loss'),
                score: player1Score,
              earnings: isDraw ? Math.floor(entryFee * 0.8) : (player1Score > player2Score ? winnerEarnings : 0),
                date: new Date()
              }
            }
        };

        console.log('Updating player 1 with data:', updateData);

        const updatedUser = await User.findByIdAndUpdate(
          new mongoose.Types.ObjectId(player1),
          updateData,
          { new: true }
        );
        console.log('Player 1 stats updated successfully:', {
          id: updatedUser._id,
          matchesPlayed: updatedUser.matchesPlayed,
          matchesWon: updatedUser.matchesWon,
          currentStreak: updatedUser.currentStreak,
          bestStreak: updatedUser.bestStreak,
          totalEarnings: updatedUser.totalEarnings
        });
      } catch (error) {
        console.error('Error updating player 1 stats:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          playerId: player1
        });
      }
    };

    // Update player 2 stats
    const updatePlayer2 = async () => {
      try {
        // First check current stats
        const currentUser = await User.findById(player2);
        console.log('Current player 2 stats:', {
          id: player2,
          currentMatchesPlayed: currentUser.matchesPlayed,
          currentMatchesWon: currentUser.matchesWon
        });

        // Use the stored match ID if available (from player 1's update)
        let newMatch;
        if (match.matchId) {
          newMatch = await Match.findById(match.matchId);
          if (!newMatch) {
            console.error(`Match document not found for stored ID: ${match.matchId}`);
            // Fallback to search by players and start time
            newMatch = await Match.findOne({
              players: { 
                $all: [
                  new mongoose.Types.ObjectId(player1), 
                  new mongoose.Types.ObjectId(player2)
                ]
              },
              startTime: match.startTime
            }).sort({ createdAt: -1 });
          }
        } else {
          // Try to find the match by players and start time
          newMatch = await Match.findOne({
            players: { 
              $all: [
                new mongoose.Types.ObjectId(player1), 
                new mongoose.Types.ObjectId(player2)
              ]
            },
            startTime: match.startTime
          }).sort({ createdAt: -1 });
        }

        if (!newMatch) {
          console.error('Could not find the match document for player 2 stats update');
          console.error('Search criteria:', {
            player1,
            player2,
            startTime: match.startTime,
            storedMatchId: match.matchId
          });
          return;
        }

        const updatedUser = await User.findByIdAndUpdate(
          new mongoose.Types.ObjectId(player2),
          {
            $inc: {
              matchesPlayed: 1,
              matchesWon: isDraw ? 0 : (player2Score > player1Score ? 1 : 0),
              totalEarnings: isDraw ? Math.floor(entryFee * 0.8) : (player2Score > player1Score ? winnerEarnings : 0)
            },
            $set: {
              currentStreak: isDraw ? 0 : (player2Score > player1Score ? (currentUser.currentStreak || 0) + 1 : 0),
              bestStreak: Math.max(currentUser.bestStreak || 0, player2Score > player1Score ? (currentUser.currentStreak || 0) + 1 : 0)
            },
            $push: {
              matchHistory: {
                matchId: newMatch._id,
                opponent: new mongoose.Types.ObjectId(player1),
                result: isDraw ? 'Draw' : (player2Score > player1Score ? 'Win' : 'Loss'),
                score: player2Score,
                earnings: isDraw ? Math.floor(entryFee * 0.8) : (player2Score > player1Score ? winnerEarnings : 0),
                date: new Date()
              }
            }
          },
          { new: true }
        );
        console.log('Player 2 stats updated successfully:', {
          id: updatedUser._id,
          matchesPlayed: updatedUser.matchesPlayed,
          matchesWon: updatedUser.matchesWon,
          currentStreak: updatedUser.currentStreak,
          bestStreak: updatedUser.bestStreak,
          totalEarnings: updatedUser.totalEarnings
        });
      } catch (error) {
        console.error('Error updating player 2 stats:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          playerId: player2
        });
      }
    };

    // Update both players' stats and then emit game end event
    Promise.all([updatePlayer1(), updatePlayer2()])
      .then(() => {
        console.log('Both players stats updated successfully');
        // Mark this match as having its stats updated
        statsUpdated.add(roomId);
        // Emit game end event to both players
        io.to(roomId).emit('gameEnd', {
          scores,
          winner,
          finalScore: isDraw ? null : scores[winner],
          stats: {
            streaks: match.streaks,
            categories: Array.from(match.categories)
          },
          isDraw // Add this to indicate if it was a draw
        });
        // Clean up the match after stats are updated
        (async () => {
          await cleanupUsedQuestions(roomId);
          activeMatches.delete(roomId);
          activeRooms.delete(roomId);
        })();
        // Clean up the stats updated flag after a delay
        setTimeout(() => {
          statsUpdated.delete(roomId);
        }, 5000); // Remove after 5 seconds
      })
      .catch(error => {
        console.error('Error updating player stats:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          matchRoom: roomId
        });
      });
    
    return;
  }

  // Get questions matching current difficulty
  let question;
  
  try {
    // Use the question service to get a new question
    const category = Array.from(match.categories)[0] || 'General';
    const usedQuestionIds = Array.from(match.usedQuestions).map(q => q._id || q);
    
    question = await questionService.getRandomQuestion(
      category, 
      match.difficulty, 
      usedQuestionIds
    );
    
    if (!question) {
      console.log('No question available from service, using fallback');
      // Fallback to database questions
      const Question = require('./models/questionModel');
      question = await Question.findOne({
        _id: { $nin: usedQuestionIds },
        category: category,
        difficulty: match.difficulty,
        isActive: true
      });
    }
    
    if (question) {
      // Add to used questions (store the question object or ID)
      match.usedQuestions.add(question._id || question);
      match.categories.add(question.category);
      
      // Mark the question as used instead of deleting
      try {
        const Question = require('./models/questionModel');
        if (question._id) {
          // Question exists in database, mark as used
          await Question.findByIdAndUpdate(question._id, { isUsed: true });
          console.log(`✅ Marked used question as isUsed: true in database: ${question._id}`);
        } else {
          // On-demand generated question, save it as used
          const tempQuestion = new Question({
            text: question.text,
            options: question.options,
            correct: question.correct,
            category: question.category,
            difficulty: question.difficulty,
            timeLimit: question.timeLimit || 7,
            isActive: false, // Mark as inactive so it won't be used again
            isUsed: true,
            source: question.source || 'on-demand',
            createdAt: new Date()
          });
          await tempQuestion.save();
          console.log(`✅ Saved and marked on-demand question as used: ${tempQuestion._id}`);
        }
      } catch (deleteError) {
        console.error('❌ Failed to mark used question:', deleteError.message);
        // Continue with the game even if marking fails
      }
      
      match.currentQuestion = question;
      match.questionStartTime = Date.now();
      match.timeLimit = question.timeLimit || 7; // Use question's time limit or default
      match.answeredPlayers.clear();
      match.firstAnswer = null;

      console.log('Starting timer for question', match.questionNumber, 'in room:', roomId);

      // Clear any existing timer before starting a new one
      if (match.timerInterval) {
        console.log('Clearing existing timer for room:', roomId);
        clearInterval(match.timerInterval);
        match.timerInterval = null;
      }

      // Send question to all players in the room simultaneously
      io.to(roomId).emit('questionUpdate', {
        question: question.text,
        options: question.options,
        correct: question.correct,
        timeLeft: match.timeLimit,
        category: question.category,
        difficulty: match.difficulty
      });

      // Send timer updates every 100ms for smoother countdown
      let timeRemaining = match.timeLimit;
      const timerInterval = setInterval(() => {
        if (!activeMatches.has(roomId)) {
          console.log('Match no longer exists, clearing timer for room:', roomId);
          clearInterval(timerInterval);
          return;
        }

        timeRemaining -= 0.1;
        const roundedTimeRemaining = Math.ceil(timeRemaining * 10) / 10;
        
        // Send timer update to all clients
        io.to(roomId).emit('timerUpdate', {
          timeLeft: roundedTimeRemaining
        });

        if (roundedTimeRemaining <= 0) {
          console.log(`Time up for question ${match.questionNumber} in room ${roomId}`);
          clearInterval(timerInterval);
          match.timerInterval = null;
          
          // Add a 1-second delay before starting next question for better transition
          setTimeout(() => {
            if (activeMatches.has(roomId)) {
              console.log(`Starting next question after time up in room ${roomId}`);
              startNewQuestion(roomId);
            }
          }, 1000); // Reduced to 1 second for better flow
        }
      }, 100); // Update every 100ms for smoother countdown

      // Store the interval ID in the match state
      match.timerInterval = timerInterval;
    } else {
      console.error('No questions available for category:', category, 'difficulty:', match.difficulty);
      // Send error to clients
      io.to(roomId).emit('error', { message: 'No questions available. Please try again.' });
    }
  } catch (error) {
    console.error('Error getting question from service:', error);
    // Send error to clients
    io.to(roomId).emit('error', { message: 'Error loading question. Please try again.' });
  }
}

app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        `${process.env.FRONTEND_URL}/*`,
        process.env.PRODUCTION_URL,
        `${process.env.PRODUCTION_URL}/*`
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["set-cookie"]
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            ttl: 7 * 24 * 60 * 60, // Session expiration time in seconds (7 days)
        }),
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'none', // Changed from 'lax' to 'none' for cross-origin requests
            domain: process.env.NODE_ENV === 'production' ? process.env.SESSION_DOMAIN : undefined,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).send("Please upload a file");
    res.status(200).send("File uploaded successfully!");
});

app.get("/auth/google",
  (req, res, next) => {
    console.log('=== Google OAuth Initiation ===');
    console.log('Request origin:', req.get('origin'));
    console.log('Request headers:', req.headers);
    console.log('Session ID:', req.sessionID);
    console.log('Is authenticated:', req.isAuthenticated());
    console.log('Callback URL:', process.env.GOOGLE_CALLBACK_URL);
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

app.get("/auth/google/callback",
  (req, res, next) => {
    console.log('=== Google OAuth Callback ===');
    console.log('Callback URL:', req.originalUrl);
    console.log('Query params:', req.query);
    console.log('Request headers:', req.headers);
    console.log('Session ID:', req.sessionID);
    console.log('Is authenticated:', req.isAuthenticated());
    next();
  },
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/auth/callback?error=auth_failed`,
    session: true
  }),
  async (req, res) => {
    try {
      console.log('=== Google OAuth Success ===');
      console.log('User data:', {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      });
      
      if (!req.user) {
        console.error('No user data received after authentication');
        return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=no_user_data`);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Prepare user data
      const userData = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        picture: req.user.picture,
        profilePicture: req.user.profilePicture,
        level: req.user.level,
        wallet: req.user.wallet
      };

      // Log the session state
      console.log('Session after authentication:', {
        id: req.sessionID,
        isAuthenticated: req.isAuthenticated(),
        user: req.user ? {
          id: req.user._id,
          name: req.user.name
        } : null
      });

      // Set both session and cookie
      req.session.user = userData;
      req.session.token = token;
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Set auth cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Construct redirect URL with encoded data
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}&userData=${encodeURIComponent(JSON.stringify(userData))}`;
      console.log('Redirecting to:', redirectUrl);
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Error in Google OAuth callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=server_error`);
    }
  }
);

app.get("/logout", (req, res) => {
    req.logout(() => res.redirect("/"));
});

app.post("/api/payment/order", async (req, res) => {
    const { amount, currency } = req.body;

    try {
        const options = {
            amount: amount * 100, // Convert to paisa
            currency: currency || "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpayInstance.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ success: false, message: "Failed to create order" });
    }
});

app.post("/api/payment/verify", (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);

    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
        res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
        res.status(400).json({ success: false, message: "Invalid signature" });
    }
});

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Mount routes
app.use("/api", matchRouter);
app.use("/api", revenueRouter);
app.use("/api", systemRouter);
app.use("/api", userRouter);  // Mount user routes under /api prefix
app.use("/api", questionRouter);  // Mount question routes under /api prefix

server.listen(PORT, async () => {
    try {
        await db();
        console.log(`Server running on port ${PORT}`);
        
        // Initialize question service after database connection is established
        await initializeQuestionService();
    } catch (error) {
        console.error(error.message);
    }
});


