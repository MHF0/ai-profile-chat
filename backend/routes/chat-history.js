const express = require('express');
const router = express.Router();
const { ChatHistoryService } = require('../services/chat-history-service');

const chatHistoryService = new ChatHistoryService();

// Get chat history for a session
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50 } = req.query;
    
    const history = await chatHistoryService.getChatHistory(sessionId, parseInt(limit));
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('❌ Error getting chat history:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add a message to chat history
router.post('/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    
    if (!message || !message.text) {
      return res.status(400).json({
        success: false,
        error: 'Message text is required'
      });
    }
    
    const session = await chatHistoryService.addMessage(sessionId, message);
    
    res.json({
      success: true,
      data: {
        session_id: session.session_id,
        total_messages: session.total_messages,
        last_activity: session.last_activity
      }
    });
  } catch (error) {
    console.error('❌ Error adding message to chat history:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all sessions for a user
router.get('/user/:userId/sessions', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;
    
    const sessions = await chatHistoryService.getUserSessions(userId, parseInt(limit));
    
    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('❌ Error getting user sessions:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search chat history
router.get('/:sessionId/search', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { query, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const results = await chatHistoryService.searchChatHistory(sessionId, query, parseInt(limit));
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('❌ Error searching chat history:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete a chat session
router.delete('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const deleted = await chatHistoryService.deleteSession(sessionId);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Chat session deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
  } catch (error) {
    console.error('❌ Error deleting chat session:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Export chat history
router.get('/:sessionId/export', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { format = 'json' } = req.query;
    
    const exportData = await chatHistoryService.exportChatHistory(sessionId, format);
    
    if (format === 'text') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="chat-${sessionId}.txt"`);
      res.send(exportData);
    } else {
      res.json({
        success: true,
        data: exportData
      });
    }
  } catch (error) {
    console.error('❌ Error exporting chat history:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get chat statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await chatHistoryService.getChatStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting chat statistics:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cleanup old sessions (admin endpoint)
router.post('/cleanup', async (req, res) => {
  try {
    const { daysOld = 30 } = req.body;
    
    const deletedCount = await chatHistoryService.cleanupOldSessions(daysOld);
    
    res.json({
      success: true,
      data: {
        deleted_sessions: deletedCount,
        days_old: daysOld
      }
    });
  } catch (error) {
    console.error('❌ Error cleaning up old sessions:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
