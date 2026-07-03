const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  timestamp: { type: Date, default: Date.now },
  isStreaming: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  isStopped: { type: Boolean, default: false }
});

const conversationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, default: '新对话' },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  model: { type: String, default: 'gpt-4o-mini' }
});

module.exports = mongoose.model('Conversation', conversationSchema);
