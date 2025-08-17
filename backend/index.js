const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const path = require("path");

const chatRoutes = require("./routes/chat");
const chatHistoryRoutes = require("./routes/chat-history");
const { DataLoader } = require("./data/loader");
const { AIService } = require("./services/ai-service");
const { connectDB } = require("./db");

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100000"),
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Log all registered routes
app.use((req, res, next) => {
  console.log(`Route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// Initialize data loader and AI service
const dataLoader = DataLoader.getInstance();
const aiService = new AIService();

// Routes
console.log("Registering routes: /api/chat, /api/data, /api/search, /health");
app.use("/api/chat", chatRoutes);
app.use("/api/chat-history", chatHistoryRoutes);

// New comprehensive data API endpoints
app.get("/api/data/overview", async (req, res) => {
  try {
    const data = await dataLoader.getData();
    res.json({
      success: true,
      data: {
        profiles_count: data.profiles_count,
        jobs_count: data.jobs_count,
        ai_summaries_count: data.ai_summaries_count,
        statistics: data.statistics,
        last_updated: data.last_updated,
      },
    });
  } catch (error) {
    console.error("❌ Error getting data overview:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/data/statistics", async (req, res) => {
  try {
    const statistics = await dataLoader.getStatistics();
    res.json({ success: true, data: statistics });
  } catch (error) {
    console.error("❌ Error getting statistics:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/data/searchable", async (req, res) => {
  try {
    const data = await dataLoader.getData();
    res.json({ success: true, data: data.searchable_data });
  } catch (error) {
    console.error("❌ Error getting searchable data:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/search/profiles", async (req, res) => {
  try {
    const { query, filters } = req.body;
    const searchResults = await dataLoader.searchProfiles(query, filters);
    res.json({ success: true, data: searchResults });
  } catch (error) {
    console.error("❌ Error searching profiles:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/profiles/:uuid", async (req, res) => {
  try {
    const { uuid } = req.params;
    const profile = await dataLoader.getProfileById(uuid);
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, error: "Profile not found" });
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error("❌ Error getting profile:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const job = await dataLoader.getJobById(id);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }
    res.json({ success: true, data: job });
  } catch (error) {
    console.error("❌ Error getting job:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Analysis endpoint
app.post("/api/ai/analyze", async (req, res) => {
  try {
    const { query, analysis_type = "general_query", session_id } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query is required",
      });
    }

    console.log(`🤖 AI Analysis Request: ${analysis_type} - "${query}"`);

    // Get comprehensive data context
    const allData = await dataLoader.getData();
    
    // Create analysis query
    const analysisQuery = {
      query: query,
      context: allData,
    };

    // Process with AI service
    const aiResponse = await aiService.processQuery(analysisQuery);

    // Save to chat history if session_id is provided
    if (session_id) {
      try {
        const { ChatHistoryService } = require('./services/chat-history-service');
        const chatHistoryService = new ChatHistoryService();
        
        // Save user message
        await chatHistoryService.addMessage(session_id, {
          id: Date.now().toString(),
          text: query,
          isUser: true,
          timestamp: new Date(),
          metadata: { analysis_type }
        });
        
        // Save AI response
        await chatHistoryService.addMessage(session_id, {
          id: (Date.now() + 1).toString(),
          text: aiResponse.response,
          isUser: false,
          timestamp: new Date(),
          metadata: { analysis_type, query }
        });
        
        console.log(`💾 Saved chat history for session: ${session_id}`);
      } catch (historyError) {
        console.error('⚠️ Warning: Failed to save chat history:', historyError.message);
        // Don't fail the main request if history saving fails
      }
    }

    res.json({
      success: true,
      data: aiResponse,
    });
  } catch (error) {
    console.error("❌ Error processing AI analysis:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      data_loader: "active",
      ai_service: "active",
      database: "connected",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res
    .status(500)
    .json({ error: "Something went wrong!", details: err.message });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB Atlas
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 AI Recruitment Chat Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();