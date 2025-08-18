const ProfileAISummary = require("../models/ProfileAISummary");
const Profile = require("../models/Profile");

class CRMService {
  constructor() {
    console.log("✅ CRM Service initialized");
  }

  /**
   * Move a candidate to CRM by updating their moved status
   * @param {string} candidateId - The candidate's UUID
   * @param {string} jobId - Optional job ID for context
   * @returns {Object} Result of the operation
   */
  async moveToCRM(candidateId, jobId = null) {
    try {
      console.log(`🔄 Moving candidate ${candidateId} to CRM...`);
      
      // Find and update the AI summary
      const updateData = { moved: 1, updatedAt: new Date() };
      if (jobId) {
        updateData.job_id = jobId;
      }

      const result = await ProfileAISummary.findOneAndUpdate(
        { uuid: candidateId },
        updateData,
        { new: true, upsert: false }
      );

      if (!result) {
        return {
          success: false,
          error: "Candidate not found in AI summaries"
        };
      }

      console.log(`✅ Candidate ${candidateId} successfully moved to CRM`);
      
      return {
        success: true,
        message: "Candidate successfully moved to CRM",
        candidate_id: candidateId,
        moved_status: result.moved,
        updated_at: result.updatedAt
      };
    } catch (error) {
      console.error("❌ Error moving candidate to CRM:", error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Move multiple candidates to CRM
   * @param {Array} candidateIds - Array of candidate UUIDs
   * @param {string} jobId - Optional job ID for context
   * @returns {Object} Result of the operation
   */
  async moveMultipleToCRM(candidateIds, jobId = null) {
    try {
      console.log(`🔄 Moving ${candidateIds.length} candidates to CRM...`);
      
      const updateData = { moved: 1, updatedAt: new Date() };
      if (jobId) {
        updateData.job_id = jobId;
      }

      const result = await ProfileAISummary.updateMany(
        { uuid: { $in: candidateIds } },
        updateData
      );

      console.log(`✅ ${result.modifiedCount} candidates successfully moved to CRM`);
      
      return {
        success: true,
        message: `${result.modifiedCount} candidates successfully moved to CRM`,
        candidates_moved: result.modifiedCount,
        total_requested: candidateIds.length
      };
    } catch (error) {
      console.error("❌ Error moving multiple candidates to CRM:", error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get candidates filtered by CRM status
   * @param {Object} filters - Filter criteria
   * @returns {Object} Filtered candidates
   */
  async getCandidatesByStatus(filters = {}) {
    try {
      console.log("🔍 Filtering candidates by CRM status...");
      
      const query = {};
      
      // CRM status filter
      if (filters.moved !== undefined) {
        query.moved = filters.moved;
      }
      
      // Job filter
      if (filters.job_id) {
        query.job_id = filters.job_id;
      }
      
      // Fit percentage filter
      if (filters.min_fit_percentage) {
        query.fit_percentage = { $gte: filters.min_fit_percentage };
      }
      
      // Experience filter
      if (filters.experience_years) {
        query.experience_years = { $gte: filters.experience_years };
      }
      
      // Industry filter
      if (filters.industry) {
        query.industry = filters.industry;
      }
      
      // Location filter
      if (filters.location) {
        query.location = filters.location;
      }

      const candidates = await ProfileAISummary.find(query)
        .sort({ fit_percentage: -1, createdAt: -1 })
        .limit(filters.limit || 100);

      const total = await ProfileAISummary.countDocuments(query);
      const movedCount = await ProfileAISummary.countDocuments({ moved: 1 });
      const notMovedCount = await ProfileAISummary.countDocuments({ moved: 0 });

      console.log(`✅ Found ${candidates.length} candidates matching criteria`);
      
      return {
        success: true,
        candidates,
        total,
        moved_count: movedCount,
        not_moved_count: notMovedCount,
        filters_applied: filters
      };
    } catch (error) {
      console.error("❌ Error filtering candidates:", error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get CRM statistics and insights
   * @returns {Object} CRM statistics
   */
  async getCRMStatistics() {
    try {
      console.log("📊 Generating CRM statistics...");
      
      const totalCandidates = await ProfileAISummary.countDocuments();
      const movedToCRM = await ProfileAISummary.countDocuments({ moved: 1 });
      const notMoved = await ProfileAISummary.countDocuments({ moved: 0 });
      
      // Get candidates moved to CRM with details
      const crmCandidates = await ProfileAISummary.find({ moved: 1 })
        .select('uuid job_id fit_percentage createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .limit(20);

      // Get recent CRM movements
      const recentMovements = await ProfileAISummary.find({ moved: 1 })
        .select('uuid updatedAt job_id')
        .sort({ updatedAt: -1 })
        .limit(10);

      console.log(`✅ CRM statistics generated: ${movedToCRM}/${totalCandidates} candidates in CRM`);
      
      return {
        success: true,
        statistics: {
          total_candidates: totalCandidates,
          moved_to_crm: movedToCRM,
          not_moved: notMoved,
          crm_percentage: totalCandidates > 0 ? ((movedToCRM / totalCandidates) * 100).toFixed(2) : 0
        },
        crm_candidates: crmCandidates,
        recent_movements: recentMovements
      };
    } catch (error) {
      console.error("❌ Error generating CRM statistics:", error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remove candidate from CRM (set moved back to 0)
   * @param {string} candidateId - The candidate's UUID
   * @returns {Object} Result of the operation
   */
  async removeFromCRM(candidateId) {
    try {
      console.log(`🔄 Removing candidate ${candidateId} from CRM...`);
      
      const result = await ProfileAISummary.findOneAndUpdate(
        { uuid: candidateId },
        { moved: 0, updatedAt: new Date() },
        { new: true }
      );

      if (!result) {
        return {
          success: false,
          error: "Candidate not found"
        };
      }

      console.log(`✅ Candidate ${candidateId} successfully removed from CRM`);
      
      return {
        success: true,
        message: "Candidate successfully removed from CRM",
        candidate_id: candidateId,
        moved_status: result.moved,
        updated_at: result.updatedAt
      };
    } catch (error) {
      console.error("❌ Error removing candidate from CRM:", error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = { CRMService };
