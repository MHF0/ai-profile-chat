const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { createServer } = require("http");
const { Server } = require("socket.io");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const path = require("path");

const chatRoutes = require("./routes/chat");
const { DataLoader } = require("./data/loader");
const { AIService } = require("./services/ai-service");
const { connectDB } = require("./db");

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

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
console.log("Registering routes: /api/chat, /health");
app.use("/api/chat", chatRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    dataLoaded: !!dataLoader.getData(),
  });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.emit("data-summary", {
    message: "Welcome to AI Recruitment Chat!",
    timestamp: new Date().toISOString(),
  });

  socket.on("chat-message", async (data) => {
    try {
      const { query } = data;
      console.log("Received chat message:", query);

      const dataContext = await dataLoader.getData(); // Now async from MongoDB

      let relevantProfiles = dataContext.enhancedProfiles;

      const queryLower = query.toLowerCase();
      if (queryLower.includes("top") || queryLower.includes("best")) {
        relevantProfiles = dataContext.enhancedProfiles.slice(0, 5);
      } else if (
        queryLower.includes("python") ||
        queryLower.includes("javascript") ||
        queryLower.includes("react")
      ) {
        relevantProfiles = dataContext.enhancedProfiles
          .filter((p) =>
            p.skills.some((skill) => skill.toLowerCase().includes(queryLower))
          )
          .slice(0, 5);
      } else if (
        queryLower.includes("experience") ||
        queryLower.includes("years")
      ) {
        relevantProfiles = dataContext.enhancedProfiles.slice(0, 8);
      }

      const chatQuery = {
        query,
        context: { profiles: relevantProfiles, jobInfo: dataContext.jobInfo },
      };

      const aiResponse = await aiService.processQuery(chatQuery);

      socket.emit("chat-response", {
        id: Date.now().toString(),
        text: aiResponse.response,
        isUser: false,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Socket error:", error.message);
      socket.emit("error", { message: "Failed to process message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Connect to MongoDB and start server
const startServer = async () => {
  await connectDB(); // Connect to MongoDB Atlas
  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`🚀 AI Recruitment Chat Backend running on port ${PORT}`);
  });
};

startServer();
