const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correct: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return this.options.includes(v);
      },
      message: 'Correct answer must be one of the options'
    }
  },
  explanation: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    enum: [
      'General',
      'Science',
      'History',
      'Geography',
      'Sports',
      'Entertainment',
      'Literature',
      'Art',
      'Technology',
      'Politics',
      'Business',
      'Economics',
      'Philosophy',
      'Religion',
      'Mythology',
      'Language',
      'Food & Drink',
      'Nature',
      'Animals',
      'Space',
      'Medicine',
      'Health',
      'Fashion',
      'Music',
      'Movies',
      'TV',
      'Pop Culture',
      'Inventions',
      'Engineering',
      'Law',
      'Education',
      'Psychology',
      'Sociology',
      'Current Events',
      'General Knowledge'
    ],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  timeLimit: {
    type: Number,
    default: 7, // in seconds
    min: 5,
    max: 60
  },
  points: {
    type: Number,
    default: function() {
      switch(this.difficulty) {
        case 'easy': return 10;
        case 'medium': return 20;
        case 'hard': return 30;
        default: return 10;
      }
    },
    min: 5,
    max: 50
  },
  tags: [{
    type: String,
    trim: true
  }],
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  successRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  averageTimeTaken: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient querying
questionSchema.index({ category: 1, difficulty: 1, isActive: 1 });
questionSchema.index({ tags: 1 });

// Method to update question statistics
questionSchema.methods.updateStats = function(totalAnswers, correctAnswers, totalTime) {
  this.usageCount += totalAnswers;
  this.successRate = totalAnswers > 0 
    ? (correctAnswers / totalAnswers) * 100 
    : 0;
  this.averageTimeTaken = totalAnswers > 0 
    ? totalTime / totalAnswers 
    : 0;
};

// Static method to get random questions
questionSchema.statics.getRandomQuestions = async function(count, category, difficulty) {
  const query = { isActive: true };
  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;

  return this.aggregate([
    { $match: query },
    { $sample: { size: count } }
  ]);
};

// Pre-save middleware to ensure options are unique
questionSchema.pre('save', function(next) {
  this.options = [...new Set(this.options)];
  if (this.options.length < 2) {
    next(new Error('Question must have at least 2 unique options'));
  }
  next();
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question; 