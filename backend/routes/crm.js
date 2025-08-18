const express = require("express");
const { CRMService } = require("../services/crm-service");

const router = express.Router();
const crmService = new CRMService();

// Move a single candidate to CRM
router.post("/move/:candidateId", async (req, res) => {
  console.log("Route: POST /api/crm/move/:candidateId");
  try {
    const { candidateId } = req.params;
    const { job_id } = req.body;

    if (!candidateId) {
      return res.status(400).json({ 
        success: false, 
        error: "Candidate ID is required" 
      });
    }

    const result = await crmService.moveToCRM(candidateId, job_id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("❌ Move to CRM error:", error.message);
    res.status(500).json({ 
      success: false, 
      error: "Failed to move candidate to CRM" 
    });
  }
});

// Move multiple candidates to CRM
router.post("/move-multiple", async (req, res) => {
  console.log("Route: POST /api/crm/move-multiple");
  try {
    const { candidate_ids, job_id } = req.body;

    if (!candidate_ids || !Array.isArray(candidate_ids) || candidate_ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Array of candidate IDs is required" 
      });
    }

    const result = await crmService.moveMultipleToCRM(candidate_ids, job_id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("❌ Move multiple to CRM error:", error.message);
    res.status(500).json({ 
      success: false, 
      error: "Failed to move candidates to CRM" 
    });
  }
});

// Remove candidate from CRM
router.post("/remove/:candidateId", async (req, res) => {
  console.log("Route: POST /api/crm/remove/:candidateId");
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).json({ 
        success: false, 
        error: "Candidate ID is required" 
      });
    }

    const result = await crmService.removeFromCRM(candidateId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("❌ Remove from CRM error:", error.message);
    res.status(500).json({ 
      success: false, 
      error: "Failed to remove candidate from CRM" 
    });
  }
});

// Get candidates filtered by CRM status
router.get("/candidates", async (req, res) => {
  console.log("Route: GET /api/crm/candidates");
  try {
    const filters = {
      moved: req.query.moved !== undefined ? parseInt(req.query.moved) : undefined,
      job_id: req.query.job_id,
      min_fit_percentage: req.query.min_fit_percentage ? parseInt(req.query.min_fit_percentage) : undefined,
      experience_years: req.query.experience_years ? parseInt(req.query.experience_years) : undefined,
      industry: req.query.industry,
      location: req.query.location,
      limit: req.query.limit ? parseInt(req.query.limit) : 100
    };

    const result = await crmService.getCandidatesByStatus(filters);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("❌ Get CRM candidates error:", error.message);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get CRM candidates" 
    });
  }
});

// Get CRM statistics
router.get("/statistics", async (req, res) => {
  console.log("Route: GET /api/crm/statistics");
  try {
    const result = await crmService.getCRMStatistics();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("❌ Get CRM statistics error:", error.message);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get CRM statistics" 
    });
  }
});

// Get candidates in CRM
router.get("/in-crm", async (req, res) => {
  console.log("Route: GET /api/crm/in-crm");
  try {
    const filters = {
      moved: 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 100
    };

    const result = await crmService.getCandidatesByStatus(filters);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("❌ Get candidates in CRM error:", error.message);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get candidates in CRM" 
    });
  }
});

// Get candidates not in CRM
router.get("/not-in-crm", async (req, res) => {
  console.log("Route: GET /api/crm/not-in-crm");
  try {
    const filters = {
      moved: 0,
      limit: req.query.limit ? parseInt(req.query.limit) : 100
    };

    const result = await crmService.getCandidatesByStatus(filters);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("❌ Get candidates not in CRM error:", error.message);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get candidates not in CRM" 
    });
  }
});

module.exports = router;
