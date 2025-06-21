const mongoose = require('mongoose');

const systemSchema = new mongoose.Schema({
  // Game Rules
  rules: {
    minimumPlayers: {
      type: Number,
      default: 2,
      min: 2
    },
    maximumPlayers: {
      type: Number,
      default: 4,
      min: 2,
      max: 10
    },
    minimumEntryFee: {
      type: Number,
      default: 10,
      min: 0
    },
    maximumEntryFee: {
      type: Number,
      default: 1000,
      min: 0
    },
    platformFee: {
      type: Number,
      default: 10, // percentage
      min: 0,
      max: 30
    },
    minimumWithdrawal: {
      type: Number,
      default: 100,
      min: 0
    },
    maximumWithdrawal: {
      type: Number,
      default: 10000,
      min: 0
    },
    dailyWithdrawalLimit: {
      type: Number,
      default: 50000,
      min: 0
    },
    matchmakingTimeout: {
      type: Number,
      default: 60, // seconds
      min: 30,
      max: 300
    }
  },

  // Match Settings
  matchSettings: {
    defaultMatchDuration: {
      type: Number,
      default: 5, // minutes
      min: 1,
      max: 30
    },
    defaultQuestionsPerMatch: {
      type: Number,
      default: 10,
      min: 5,
      max: 20
    },
    defaultTimePerQuestion: {
      type: Number,
      default: 30, // seconds
      min: 10,
      max: 60
    },
    categories: [{
      type: String,
      enum: ['General', 'Science', 'History', 'Geography', 'Sports', 'Entertainment']
    }],
    difficulties: [{
      type: String,
      enum: ['easy', 'medium', 'hard']
    }]
  },

  // Payment Settings
  paymentSettings: {
    enabledPaymentMethods: [{
      type: String,
      enum: ['razorpay', 'paytm', 'bank_transfer']
    }],
    razorpay: {
      keyId: String,
      keySecret: String,
      isActive: {
        type: Boolean,
        default: false
      }
    },
    paytm: {
      merchantId: String,
      merchantKey: String,
      isActive: {
        type: Boolean,
        default: false
      }
    }
  },

  // System Status
  status: {
    maintenance: {
      type: Boolean,
      default: false
    },
    maintenanceMessage: String,
    newRegistrations: {
      type: Boolean,
      default: true
    },
    matchmaking: {
      type: Boolean,
      default: true
    },
    withdrawals: {
      type: Boolean,
      default: true
    },
    deposits: {
      type: Boolean,
      default: true
    }
  },

  // Analytics
  analytics: {
    totalUsers: {
      type: Number,
      default: 0
    },
    activeUsers: {
      type: Number,
      default: 0
    },
    totalMatches: {
      type: Number,
      default: 0
    },
    totalTransactions: {
      type: Number,
      default: 0
    },
    totalVolume: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },

  // Version Control
  version: {
    current: {
      type: String,
      required: true
    },
    minimumRequired: {
      type: String,
      required: true
    },
    updateAvailable: {
      type: Boolean,
      default: false
    },
    updateMessage: String,
    updateUrl: String
  }
}, {
  timestamps: true
});

// Method to check if system is operational
systemSchema.methods.isOperational = function() {
  return !this.status.maintenance && 
         this.status.matchmaking && 
         this.status.newRegistrations;
};

// Method to update analytics
systemSchema.methods.updateAnalytics = async function(stats) {
  this.analytics = {
    ...this.analytics,
    ...stats,
    lastUpdated: new Date()
  };
  await this.save();
};

// Static method to get system settings
systemSchema.statics.getSettings = async function() {
  const settings = await this.findOne().select('-paymentSettings.razorpay.keySecret -paymentSettings.paytm.merchantKey');
  if (!settings) {
    throw new Error('System settings not found');
  }
  return settings;
};

const System = mongoose.model('System', systemSchema);
module.exports = System; 