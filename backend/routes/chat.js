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
    "Hi!",
    "Show me top candidates",
    "What jobs are available?",
    "Analyze our data",
    "Find Python developers",
    "Compare candidates",
    "Skills overview",
    "How are you?"
  ];

  res.json({ suggestions });
});

// Get quick insights
router.get("/insights", async (req, res) => {
  console.log("Route: GET /api/chat/insights");
  try {
    const data = await dataLoader.getData();

    const insights = await aiService.getQuickInsights(
      data.profiles,
      data.jobs,
      data.statistics
    );

    res.json({ 
      success: true,
      insights,
      data_summary: {
        total_candidates: data.profiles_count,
        total_jobs: data.jobs_count,
        average_experience: data.statistics.average_experience
      }
    });
  } catch (error) {
    console.error("❌ Insights error:", error.message);
    res.status(500).json({ success: false, error: "Failed to generate insights" });
  }
});

// Get data summary
router.get("/summary", async (req, res) => {
  console.log("Route: GET /api/chat/summary");
  try {
    const data = await dataLoader.getData();

    const summary = {
      totalCandidates: data.profiles_count,
      totalJobs: data.jobs_count,
      topFit: data.profiles
        .filter(p => p.fit_percentage > 0)
        .sort((a, b) => b.fit_percentage - a.fit_percentage)[0]?.fit_percentage || 0,
      averageFit: data.profiles
        .filter(p => p.fit_percentage > 0)
        .reduce((sum, p) => sum + p.fit_percentage, 0) / 
        data.profiles.filter(p => p.fit_percentage > 0).length || 0,
      averageExperience: data.statistics.average_experience,
      topSkills: data.statistics.skills_distribution.slice(0, 5),
      topLocations: data.statistics.location_distribution.slice(0, 5),
      topIndustries: data.statistics.industry_distribution.slice(0, 5)
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    console.error("❌ Summary error:", error.message);
    res.status(500).json({ success: false, error: "Failed to get summary" });
  }
});

// Get candidate recommendations for a specific job
router.get("/recommendations/:jobId", async (req, res) => {
  console.log("Route: GET /api/chat/recommendations/:jobId");
  try {
    const { jobId } = req.params;
    const data = await dataLoader.getData();
    
    const recommendations = await aiService.getJobRecommendations(jobId, data);
    
    res.json({ 
      success: true, 
      recommendations,
      job_id: jobId
    });
  } catch (error) {
    console.error("❌ Recommendations error:", error.message);
    res.status(500).json({ success: false, error: "Failed to get recommendations" });
  }
});

// Get profile analysis
router.get("/profile/:uuid", async (req, res) => {
  console.log("Route: GET /api/chat/profile/:uuid");
  try {
    const { uuid } = req.params;
    const data = await dataLoader.getData();
    
    const analysis = await aiService.analyzeProfile(uuid, data);
    
    res.json({ 
      success: true, 
      analysis,
      profile_uuid: uuid
    });
  } catch (error) {
    console.error("❌ Profile analysis error:", error.message);
    res.status(500).json({ success: false, error: "Failed to analyze profile" });
  }
});

// Get comprehensive data insights
router.get("/insights/comprehensive", async (req, res) => {
  console.log("Route: GET /api/chat/insights/comprehensive");
  try {
    const data = await dataLoader.getData();
    
    const insights = await aiService.getDataInsights(data);
    
    res.json({ 
      success: true, 
      insights,
      data_timestamp: data.last_updated
    });
  } catch (error) {
    console.error("❌ Comprehensive insights error:", error.message);
    res.status(500).json({ success: false, error: "Failed to get comprehensive insights" });
  }
});

// Search candidates with AI analysis
router.post("/search", async (req, res) => {
  console.log("Route: POST /api/chat/search");
  try {
    const { query, filters, include_analysis } = req.body;
    
    if (!query) {
      return res.status(400).json({ success: false, error: "Search query is required" });
    }

    const searchResults = await dataLoader.searchProfiles(query, filters);
    
    let analysis = null;
    if (include_analysis && searchResults.results.length > 0) {
      const analysisQuery = {
        query: `Analyze these search results for: "${query}". Provide insights on the candidates found and their suitability.`,
        context: {
          profiles: searchResults.results,
          statistics: (await dataLoader.getData()).statistics
        }
      };
      
      const aiResponse = await aiService.processQuery(analysisQuery);
      analysis = aiResponse.response;
    }

    res.json({ 
      success: true, 
      search_results: searchResults,
      analysis,
      query,
      filters
    });
  } catch (error) {
    console.error("❌ Search error:", error.message);
    res.status(500).json({ success: false, error: "Failed to perform search" });
  }
});

module.exports = router;
