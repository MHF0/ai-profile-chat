const express = require("express");
const { AIService } = require("../services/ai-service");
const { ChatHistoryService } = require("../services/chat-history-service");
const { DataLoader } = require("../data/loader");

const router = express.Router();
const chatHistoryService = new ChatHistoryService();
const dataLoader = DataLoader.getInstance();

// Create a new job-specific chat session
router.post("/sessions", async (req, res) => {
  try {
    const { job_id, user_id = 'anonymous' } = req.body;
    
    if (!job_id) {
      return res.status(400).json({
        success: false,
        error: "Job ID is required"
      });
    }

    // Get job information
    const data = await dataLoader.getData();
    const job = data.jobs.find(j => j.uuid === job_id || j.id === job_id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found"
      });
    }

    // Create new job-specific chat session
    const session = await chatHistoryService.createJobSession(user_id, job);
    
    res.json({
      success: true,
      data: {
        session_id: session.session_id,
        job_id: session.job_id,
        job_title: session.job_title,
        company_name: session.company_name,
        created_at: session.created_at
      }
    });
  } catch (error) {
    console.error("❌ Error creating job chat session:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all chat sessions for a specific job
router.get("/:jobId/sessions", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { limit = 20 } = req.query;
    
    const sessions = await chatHistoryService.getJobSessions(jobId, parseInt(limit));
    
    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error("❌ Error getting job sessions:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send a message in a job-specific chat
router.post("/message", async (req, res) => {
  try {
    const { session_id, message, job_id, user_id = 'anonymous' } = req.body;
    
    if (!message || !job_id) {
      return res.status(400).json({
        success: false,
        error: "Message and job_id are required"
      });
    }

    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required"
      });
    }

    // Get job information for AI context
    const data = await dataLoader.getData();
    const job = data.jobs.find(j => j.uuid === job_id || j.id === job_id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found"
      });
    }

    // Create job-specific AI service
    const aiService = AIService.createJobSpecificAI(job);
    
    // Process the query with job-specific context
    const analysisQuery = {
      query: message,
      context: data,
    };

    const aiResponse = await aiService.processQuery(analysisQuery);

    // Save user message
    await chatHistoryService.addMessage(session_id, {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
      metadata: { job_id: job_id, type: 'job_chat' }
    });
    
    // Save AI response
    await chatHistoryService.addMessage(session_id, {
      id: (Date.now() + 1).toString(),
      text: aiResponse.response,
      isUser: false,
      timestamp: new Date(),
      metadata: { job_id: job_id, type: 'job_chat', query: message }
    });

    res.json({
      success: true,
      data: {
        message: aiResponse.response,
        session_id: session_id,
        job_id: job_id,
        job_title: job.title,
        company_name: job.company
      }
    });
  } catch (error) {
    console.error("❌ Error processing job chat message:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send a message in a job-specific chat (alternative endpoint)
router.post("/:jobId/chat", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { session_id, message, user_id = 'anonymous' } = req.body;
    
    if (!message || !message.text) {
      return res.status(400).json({
        success: false,
        error: "Message text is required"
      });
    }

    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required"
      });
    }

    // Get job information for AI context
    const data = await dataLoader.getData();
    const job = data.jobs.find(j => j.uuid === jobId || j.id === jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found"
      });
    }

    // Create job-specific AI service
    const aiService = AIService.createJobSpecificAI(job);
    
    // Process the query with job-specific context
    const analysisQuery = {
      query: message.text,
      context: data,
    };

    const aiResponse = await aiService.processQuery(analysisQuery);

    // Save user message
    await chatHistoryService.addMessage(session_id, {
      id: Date.now().toString(),
      text: message.text,
      isUser: true,
      timestamp: new Date(),
      metadata: { job_id: jobId, type: 'job_chat' }
    });
    
    // Save AI response
    await chatHistoryService.addMessage(session_id, {
      id: (Date.now() + 1).toString(),
      text: aiResponse.response,
      isUser: false,
      timestamp: new Date(),
      metadata: { job_id: jobId, type: 'job_chat', query: message.text }
    });

    res.json({
      success: true,
      data: {
        response: aiResponse.response,
        session_id: session_id,
        job_id: jobId,
        job_title: job.title,
        company_name: job.company
      }
    });
  } catch (error) {
    console.error("❌ Error processing job chat message:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get job-specific chat suggestions
router.get("/:jobId/suggestions", async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Get job information
    const data = await dataLoader.getData();
    const job = data.jobs.find(j => j.uuid === jobId || j.id === jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found"
      });
    }

    // Generate job-specific suggestions
    const suggestions = [
      `Tell me about the requirements for ${job.title}`,
      `What skills are most important for this position?`,
      `Compare candidates for ${job.title}`,
      `What interview questions should I ask?`,
      `Analyze the job requirements`,
      `Find the best candidates for this role`,
      `What experience level is needed?`,
      `How does this job compare to similar positions?`
    ];

    res.json({ 
      success: true,
      suggestions,
      job_info: {
        title: job.title,
        company: job.company,
        location: job.location
      }
    });
  } catch (error) {
    console.error("❌ Error getting job suggestions:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
