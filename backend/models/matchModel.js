const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  // Match Status
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['casual', 'ranked', 'tournament'],
    default: 'casual'
  },
  entryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  prizePool: {
    type: Number,
    default: 0,
    min: 0
  },

  // Players
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    score: {
      type: Number,
      default: 0,
      min: 0
    },
    earnings: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['joined', 'ready', 'playing', 'finished', 'left'],
      default: 'joined'
    },
    answers: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      },
      selectedOption: String,
      isCorrect: Boolean,
      timeTaken: Number,
      points: Number
    }]
  }],

  // Match Details
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  currentQuestion: {
    type: Number,
    default: 0
  },
  startTime: Date,
  endTime: Date,
  duration: {
    type: Number, // in minutes
    default: 5
  },

  // Match Results
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  results: {
    totalQuestions: {
      type: Number,
      default: 0
    },
    questionsAnswered: {
      type: Number,
      default: 0
    },
    averageTimePerQuestion: {
      type: Number,
      default: 0
    }
  },

  // Match Settings
  settings: {
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    category: {
      type: String,
      enum: ['General', 'Science', 'History', 'Geography', 'Sports', 'Entertainment'],
      default: 'General'
    },
    timePerQuestion: {
      type: Number,
      default: 7, // in seconds
      min: 7, // Updated minimum to 7 seconds
      max: 60
    },
    questionsCount: {
      type: Number,
      default: 10,
      min: 5,
      max: 20
    }
  }
}, {
  timestamps: true
});

// Virtual for match duration
matchSchema.virtual('matchDuration').get(function() {
  if (!this.startTime || !this.endTime) return 0;
  return (this.endTime - this.startTime) / 1000; // in seconds
});

// Method to calculate match results
matchSchema.methods.calculateResults = function() {
  this.results.totalQuestions = this.questions.length;
  this.results.questionsAnswered = this.players.reduce((total, player) => 
    total + player.answers.filter(a => a.selectedOption).length, 0);
  
  const totalTime = this.players.reduce((total, player) => 
    total + player.answers.reduce((sum, ans) => sum + (ans.timeTaken || 0), 0), 0);
  
  this.results.averageTimePerQuestion = this.results.questionsAnswered > 0
    ? totalTime / this.results.questionsAnswered
    : 0;

  // Determine winner
  const playerScores = this.players.map(p => ({
    user: p.user,
    score: p.score
  }));
  
  if (playerScores.length > 0) {
    const maxScore = Math.max(...playerScores.map(p => p.score));
    const winners = playerScores.filter(p => p.score === maxScore);
    if (winners.length === 1) {
      this.winner = winners[0].user;
    }
  }
};

// Pre-save middleware
matchSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.calculateResults();
  }
  next();
});

const Match = mongoose.model('Match', matchSchema);
module.exports = Match; 