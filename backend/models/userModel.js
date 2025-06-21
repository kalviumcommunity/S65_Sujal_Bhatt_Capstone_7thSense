const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() { return !this.googleId; }, // Required only if not using Google auth
    minlength: 8,
    maxlength: 16
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  accessToken: String,
  refreshToken: String,

  // Profile
  name: {
    type: String,
    required: true,
    trim: true
  },
  picture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },

  // Game Stats
  matchesPlayed: {
    type: Number,
    default: 0,
    min: 0
  },
  matchesWon: {
    type: Number,
    default: 0,
    min: 0
  },
  winRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  bestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  rank: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'Bronze'
  },

  // Match History
  matchHistory: [{
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    },
    opponent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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
    result: {
      type: String,
      enum: ['Win', 'Loss', 'Draw'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],

  // Settings
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    sound: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  }
}, {
  timestamps: true
});

// Virtual for profile picture URL
userSchema.virtual('profilePictureUrl').get(function() {
  return this.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.name)}&backgroundColor=6366f1&textColor=ffffff`;
});

// Method to validate user data
userSchema.methods.validateData = function() {
  // Ensure all numeric fields are valid numbers
  this.matchesPlayed = Math.max(0, Number(this.matchesPlayed) || 0);
  this.matchesWon = Math.max(0, Number(this.matchesWon) || 0);
  // Don't reset currentStreak to 0, preserve negative values
  this.currentStreak = Number(this.currentStreak) || 0;
  this.bestStreak = Math.max(0, Number(this.bestStreak) || 0);
  this.totalEarnings = Math.max(0, Number(this.totalEarnings) || 0);
  
  // Calculate win rate
  this.winRate = this.matchesPlayed > 0 
    ? Math.min(100, Math.max(0, (this.matchesWon / this.matchesPlayed) * 100))
    : 0;
  
  // Update rank based on total earnings
  if (this.totalEarnings >= 10000) this.rank = 'Diamond';
  else if (this.totalEarnings >= 5000) this.rank = 'Platinum';
  else if (this.totalEarnings >= 1000) this.rank = 'Gold';
  else if (this.totalEarnings >= 500) this.rank = 'Silver';
  else this.rank = 'Bronze';

  // Validate match history
  if (Array.isArray(this.matchHistory)) {
    this.matchHistory = this.matchHistory.map(match => ({
      ...match,
      score: Math.max(0, Number(match.score) || 0),
      earnings: Math.max(0, Number(match.earnings) || 0),
      date: match.date || new Date(),
      matchId: match.matchId || null,
      opponent: match.opponent || null,
      result: ['Win', 'Loss', 'Draw'].includes(match.result) ? match.result : 'Draw'
    }));
  } else {
    this.matchHistory = [];
  }
};

// Pre-save middleware
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.validateData();
  next();
});

// Pre-update middleware for findOneAndUpdate operations
userSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  
  // Get the current document
  const doc = await this.model.findOne(this.getQuery());
  if (!doc) {
    return next();
  }

  // Handle $inc operations
  if (update.$inc) {
    // Apply increments to the current values
    if (update.$inc.matchesPlayed) {
      doc.matchesPlayed = (doc.matchesPlayed || 0) + Number(update.$inc.matchesPlayed);
    }
    if (update.$inc.matchesWon) {
      doc.matchesWon = (doc.matchesWon || 0) + Number(update.$inc.matchesWon);
    }
    if (update.$inc.currentStreak) {
      // Preserve negative values for currentStreak
      doc.currentStreak = (doc.currentStreak || 0) + Number(update.$inc.currentStreak);
    }
    if (update.$inc.totalEarnings) {
      doc.totalEarnings = (doc.totalEarnings || 0) + Number(update.$inc.totalEarnings);
    }
  }

  // Handle $set operations
  if (update.$set) {
    if (update.$set.currentStreak !== undefined) {
      // Preserve negative values for currentStreak
      doc.currentStreak = Number(update.$set.currentStreak);
    }
    if (update.$set.bestStreak !== undefined) {
      doc.bestStreak = Math.max(0, Number(update.$set.bestStreak));
    }
  }

  // Handle $push operations for match history
  if (update.$push && update.$push.matchHistory) {
    const newMatch = update.$push.matchHistory;
    if (!doc.matchHistory) {
      doc.matchHistory = [];
    }
    doc.matchHistory.push({
      ...newMatch,
      score: Math.max(0, Number(newMatch.score) || 0),
      earnings: Math.max(0, Number(newMatch.earnings) || 0),
      date: newMatch.date || new Date()
    });
  }

  // Calculate win rate
  doc.winRate = doc.matchesPlayed > 0 
    ? Math.min(100, Math.max(0, (doc.matchesWon / doc.matchesPlayed) * 100))
    : 0;

  // Update rank based on total earnings
  if (doc.totalEarnings >= 10000) doc.rank = 'Diamond';
  else if (doc.totalEarnings >= 5000) doc.rank = 'Platinum';
  else if (doc.totalEarnings >= 1000) doc.rank = 'Gold';
  else if (doc.totalEarnings >= 500) doc.rank = 'Silver';
  else doc.rank = 'Bronze';

  // Save the document
  await doc.save();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User; 