const express = require("express");
const { AIService } = require("../services/ai-service");
const { DataLoader } = require("../data/loader");

const router = express.Router();
const aiService = new AIService();
const dataLoader = DataLoader.getInstance();

// Get chat suggestions
router.get("/suggestions", (req, res) => {
  console.log("Route: GET /api/chat/suggestions");
  const suggestions = [
    "Show me the top 3 candidates for this role",
    "Which candidates have Python experience?",
    "Find candidates with 5+ years of experience",
    "Analyze skills gaps for the top candidates",
    "Compare candidate fit percentages",
    "What are the key strengths of the best matches?",
    "Show me candidates with matching education requirements",
  ];

  res.json({ suggestions });
});

// Get quick insights
router.get("/insights", async (req, res) => {
  console.log("Route: GET /api/chat/insights");
  try {
    const data = await dataLoader.getData(); // Now async from MongoDB

    const topProfiles = data.enhancedProfiles.slice(0, 3);

    const insights = await aiService.getQuickInsights(
      topProfiles,
      data.jobInfo
    );

    res.json({ insights });
  } catch (error) {
    console.error("Insights error:", error.message);
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

// Get data summary
router.get("/summary", (req, res) => {
  console.log("Route: GET /api/chat/summary");
  try {
    const data = dataLoader.getData();

    const summary = {
      totalCandidates: data.enhancedProfiles.length,
      topFit: data.enhancedProfiles[0]?.fit_percentage || 0,
      averageFit:
        data.enhancedProfiles.reduce((sum, p) => sum + p.fit_percentage, 0) /
        data.enhancedProfiles.length,
      jobTitle: data.jobInfo.title,
      requiredSkills: data.jobInfo.skills.length,
      experienceLevel: data.jobInfo.experience_level,
    };

    res.json(summary);
  } catch (error) {
    console.error("Summary error:", error.message);
    res.status(500).json({ error: "Failed to get summary" });
  }
});

module.exports = router;
