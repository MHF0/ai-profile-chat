const ChatHistory = require('../models/ChatHistory');
const { v4: uuidv4 } = require('uuid');

class ChatHistoryService {
  constructor() {
    this.activeSessions = new Map(); // In-memory session tracking
  }

  // Generate a unique session ID
  generateSessionId() {
    return uuidv4();
  }

  // Create or get existing chat session
  async getOrCreateSession(sessionId, userId = 'anonymous') {
    try {
      let session = await ChatHistory.findOne({ session_id: sessionId });
      
      if (!session) {
        session = new ChatHistory({
          session_id: sessionId,
          user_id: userId,
          messages: [],
          total_messages: 0
        });
        await session.save();
        console.log(`✅ Created new chat session: ${sessionId}`);
      }
      
      return session;
    } catch (error) {
      console.error('❌ Error getting/creating chat session:', error.message);
      throw error;
    }
  }

  // Add a message to chat history
  async addMessage(sessionId, message) {
    try {
      const session = await this.getOrCreateSession(sessionId);
      
      // Add the new message
      session.messages.push({
        id: message.id,
        text: message.text,
        isUser: message.isUser,
        timestamp: message.timestamp,
        metadata: message.metadata || {}
      });
      
      // Update session
      session.last_activity = new Date();
      session.total_messages = session.messages.length;
      
      await session.save();
      console.log(`💬 Added message to session ${sessionId}: ${message.isUser ? 'User' : 'AI'}`);
      
      return session;
    } catch (error) {
      console.error('❌ Error adding message to chat history:', error.message);
      throw error;
    }
  }

  // Get chat history for a session
  async getChatHistory(sessionId, limit = 50) {
    try {
      const session = await ChatHistory.findOne({ session_id: sessionId });
      
      if (!session) {
        return { messages: [], total: 0 };
      }
      
      // Return recent messages (limit to prevent memory issues)
      const recentMessages = session.messages.slice(-limit);
      
      return {
        messages: recentMessages,
        total: session.total_messages,
        session_id: session.session_id,
        created_at: session.created_at,
        last_activity: session.last_activity
      };
    } catch (error) {
      console.error('❌ Error getting chat history:', error.message);
      throw error;
    }
  }

  // Get all sessions for a user
  async getUserSessions(userId, limit = 20) {
    try {
      const sessions = await ChatHistory.find({ user_id: userId })
        .sort({ last_activity: -1 })
        .limit(limit)
        .select('session_id total_messages created_at last_activity')
        .lean();
      
      return sessions;
    } catch (error) {
      console.error('❌ Error getting user sessions:', error.message);
      throw error;
    }
  }

  // Search chat history
  async searchChatHistory(sessionId, query, limit = 20) {
    try {
      const session = await ChatHistory.findOne({ session_id: sessionId });
      
      if (!session) {
        return { messages: [], total: 0 };
      }
      
      const queryLower = query.toLowerCase();
      const matchingMessages = session.messages.filter(message => 
        message.text.toLowerCase().includes(queryLower)
      );
      
      return {
        messages: matchingMessages.slice(-limit),
        total: matchingMessages.length,
        query: query
      };
    } catch (error) {
      console.error('❌ Error searching chat history:', error.message);
      throw error;
    }
  }

  // Delete a chat session
  async deleteSession(sessionId) {
    try {
      const result = await ChatHistory.deleteOne({ session_id: sessionId });
      
      if (result.deletedCount > 0) {
        console.log(`🗑️ Deleted chat session: ${sessionId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error deleting chat session:', error.message);
      throw error;
    }
  }

  // Clear old sessions (cleanup)
  async cleanupOldSessions(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const result = await ChatHistory.deleteMany({
        last_activity: { $lt: cutoffDate }
      });
      
      console.log(`🧹 Cleaned up ${result.deletedCount} old chat sessions`);
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Error cleaning up old sessions:', error.message);
      throw error;
    }
  }

  // Get chat statistics
  async getChatStatistics() {
    try {
      const stats = await ChatHistory.aggregate([
        {
          $group: {
            _id: null,
            total_sessions: { $sum: 1 },
            total_messages: { $sum: '$total_messages' },
            avg_messages_per_session: { $avg: '$total_messages' }
          }
        }
      ]);
      
      const sessionCount = await ChatHistory.countDocuments();
      const messageCount = await ChatHistory.aggregate([
        { $unwind: '$messages' },
        { $count: 'total' }
      ]);
      
      return {
        total_sessions: sessionCount,
        total_messages: messageCount[0]?.total || 0,
        avg_messages_per_session: stats[0]?.avg_messages_per_session || 0
      };
    } catch (error) {
      console.error('❌ Error getting chat statistics:', error.message);
      throw error;
    }
  }

  // Export chat history for a session
  async exportChatHistory(sessionId, format = 'json') {
    try {
      const session = await ChatHistory.findOne({ session_id: sessionId });
      
      if (!session) {
        throw new Error('Session not found');
      }
      
      if (format === 'json') {
        return {
          session_id: session.session_id,
          user_id: session.user_id,
          created_at: session.created_at,
          last_activity: session.last_activity,
          total_messages: session.total_messages,
          messages: session.messages
        };
      } else if (format === 'text') {
        let text = `Chat Session: ${session.session_id}\n`;
        text += `User: ${session.user_id}\n`;
        text += `Created: ${session.created_at}\n`;
        text += `Last Activity: ${session.last_activity}\n`;
        text += `Total Messages: ${session.total_messages}\n\n`;
        text += 'Conversation:\n';
        text += '='.repeat(50) + '\n\n';
        
        session.messages.forEach((message, index) => {
          const role = message.isUser ? 'User' : 'AI';
          const timestamp = new Date(message.timestamp).toLocaleString();
          text += `[${timestamp}] ${role}: ${message.text}\n\n`;
        });
        
        return text;
      }
      
      throw new Error('Unsupported export format');
    } catch (error) {
      console.error('❌ Error exporting chat history:', error.message);
      throw error;
    }
  }
}

module.exports = { ChatHistoryService };
