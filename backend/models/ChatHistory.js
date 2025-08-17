const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    index: true
  },
  user_id: {
    type: String,
    default: 'anonymous',
    index: true
  },
  job_id: {
    type: String,
    required: true,
    index: true
  },
  job_title: {
    type: String,
    required: true
  },
  company_name: {
    type: String,
    required: true
  },
  messages: [{
    id: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    isUser: {
      type: Boolean,
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  total_messages: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  last_activity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
chatHistorySchema.index({ session_id: 1, created_at: -1 });
chatHistorySchema.index({ user_id: 1, last_activity: -1 });
chatHistorySchema.index({ job_id: 1, last_activity: -1 });
chatHistorySchema.index({ user_id: 1, job_id: 1, last_activity: -1 });

// Update last_activity when messages are added
chatHistorySchema.pre('save', function(next) {
  this.last_activity = new Date();
  this.total_messages = this.messages.length;
  next();
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

module.exports = ChatHistory;
