const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  settings: {
    model: {
      type: String,
      default: 'gpt-3.5-turbo'
    },
    temperature: {
      type: Number,
      default: 0.7
    },
    maxTokens: {
      type: Number,
      default: 1000
    },
    systemPrompt: {
      type: String,
      default: 'You are a helpful AI assistant.'
    }
  },
  files: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  prompts: [{
    title: String,
    content: String,
    variables: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  chatSessions: [{
    title: String,
    messages: [{
      role: String,
      content: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);