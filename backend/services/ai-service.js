const OpenAI = require("openai");
const { CRMService } = require("./crm-service");

class AIService {
  constructor(jobInfo = null) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is required for AI service to function");
    }
    
    try {
      this.openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log("✅ AI Service initialized with OpenRouter");
    } catch (error) {
      console.error("❌ Failed to initialize OpenAI:", error.message);
      throw error;
    }

    // Set job-specific or general system prompt
    this.jobInfo = jobInfo;
    this.systemPrompt = this.buildSystemPrompt();
    
    // Initialize CRM service
    this.crmService = new CRMService();
  }

  buildSystemPrompt() {
    if (this.jobInfo) {
      // Job-specific AI assistant
      return `You are a highly knowledgeable AI recruitment assistant specifically focused on the job: "${this.jobInfo.title}" at ${this.jobInfo.company}.

This job has the following requirements and details:
- Title: ${this.jobInfo.title}
- Company: ${this.jobInfo.company}
- Location: ${this.jobInfo.location || 'Not specified'}
- Experience Level: ${this.jobInfo.experience_level || 'Not specified'}
- Industry: ${this.jobInfo.industry || 'Not specified'}
- Employment Type: ${this.jobInfo.employment_type || 'Not specified'}
- Salary Range: ${this.jobInfo.salary_range || 'Not specified'}
- Remote Policy: ${this.jobInfo.remote_policy || 'Not specified'}
- Required Skills: ${this.jobInfo.skills ? this.jobInfo.skills.join(', ') : 'Not specified'}
- Description: ${this.jobInfo.description || 'Not specified'}

Your role is to:
- Answer questions specifically related to this job posting
- Help evaluate candidates for this position
- Provide insights about skills, experience, and qualifications needed
- Compare candidates against the job requirements
- Suggest questions for interviews or assessments
- Help with job-specific recruitment strategies

IMPORTANT: All your responses should be focused on and relevant to this specific job. If someone asks about unrelated topics, politely redirect them back to questions about this job or recruitment for this position.

You have access to comprehensive candidate profiles and recruitment data. Use this information to provide detailed, job-specific insights and recommendations.

Always use markdown formatting for better readability.`;
    } else {
      // General recruitment assistant (fallback)
      return `You are a highly knowledgeable AI recruitment assistant with COMPLETE access to a comprehensive recruitment database.

You have access to ALL candidate profiles, job listings, skills, locations, industries, companies, and detailed statistics.

Your capabilities include:
- Answering ANY question about individual candidates (experience, skills, education, work history, contact info)
- Providing detailed analysis of job listings and requirements
- Comparing candidates and jobs based on multiple criteria
- Analyzing skills distribution, location trends, and industry insights
- Finding specific candidates or jobs based on detailed criteria
- Providing comprehensive recruitment insights and recommendations
- **CRM Management**: Move candidates to/from CRM, filter by CRM status, get CRM statistics
- Answering general questions and casual conversation

**CRM Commands You Can Handle:**
- "Move [candidate name] to CRM" - Move specific candidate to CRM
- "Move all candidates to CRM" - Move all candidates to CRM
- "Move top 5 candidates to CRM" - Move top 5 candidates by fit percentage
- "Move candidates with Python skills to CRM" - Move candidates with specific skills
- "Show candidates in CRM" - Display candidates currently in CRM
- "Show candidates not in CRM" - Display candidates not in CRM
- "Filter CRM candidates by 80% fit" - Filter CRM candidates by criteria
- "Show CRM statistics" - Display CRM overview and metrics

When answering recruitment-related questions:
- Use the comprehensive database data provided
- Be specific and detailed in your responses
- Reference specific candidates, jobs, or data points when relevant
- Provide actionable insights and recommendations
- Use markdown formatting for better readability

For casual questions, chat naturally and friendly.

You are now the most knowledgeable recruitment AI available - use your comprehensive data access to provide exceptional insights!`;
    }
  }

  // Create a job-specific AI service instance
  static createJobSpecificAI(jobInfo) {
    return new AIService(jobInfo);
  }

  async processQuery(query) {
    try {
      console.log("🤖 Processing AI query:", query.query);
      
      // Check for CRM commands first
      const crmResult = await this.handleCRMCommands(query.query, query.context);
      if (crmResult) {
        return crmResult;
      }
      
      const context = this.buildSimpleContext(query);
      const userPrompt = this.buildSimplePrompt(query, context);

      const completion = await this.openai.chat.completions.create({
        model: "openai/gpt-4o",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content || "No response generated";

      return {
        response,
        query: query.query,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("❌ AI service error:", error.message);
      throw error;
    }
  }

  buildSimpleContext(query) {
    if (!query.context) return "No data available";
    
    const { profiles = [], jobs = [], statistics = {}, searchable_data = {} } = query.context;
    
    let context = "=== COMPREHENSIVE RECRUITMENT DATABASE ===\n\n";
    
    // Basic stats
    context += `📊 DATABASE OVERVIEW:\n`;
    context += `- Total Candidates: ${profiles.length}\n`;
    context += `- Total Jobs: ${jobs.length}\n`;
    context += `- Average Experience: ${statistics?.average_experience?.toFixed(1) || 0} years\n`;
    context += `- AI Summaries Available: ${statistics?.ai_summaries_count || 0}\n\n`;
    
    // COMPLETE CANDIDATE PROFILES - All data for deep analysis
    if (profiles.length > 0) {
      context += `👥 COMPLETE CANDIDATE PROFILES (${profiles.length} total):\n`;
      context += `==========================================\n\n`;
      
      profiles.forEach((profile, index) => {
        context += `CANDIDATE ${index + 1}: ${profile.name}\n`;
        context += `----------------------------------------\n`;
        context += `ID: ${profile.uuid}\n`;
        context += `Current Role: ${profile.current_role || 'Not specified'}\n`;
        context += `Experience: ${profile.experience_years || 0} years\n`;
        context += `Fit Percentage: ${profile.fit_percentage || 0}%\n`;
        context += `Industry: ${profile.industry || 'Not specified'}\n`;
        context += `Seniority: ${profile.seniority || 'Not specified'}\n`;
        context += `Location: ${profile.location?.name || 'Not specified'}\n`;
        context += `Country: ${profile.location?.country || 'Not specified'}\n`;
        context += `Current Company: ${profile.current_company?.name || 'Not specified'}\n`;
        context += `Company Size: ${profile.current_company?.size || 'Not specified'}\n`;
        context += `Company Industry: ${profile.current_company?.industry || 'Not specified'}\n`;
        
        // Complete skills list
        if (profile.skills && profile.skills.length > 0) {
          context += `Skills (${profile.skills.length} total): ${profile.skills.join(', ')}\n`;
        }
        
        // Education details
        if (profile.education && profile.education.length > 0) {
          context += `Education:\n`;
          profile.education.forEach((edu, eduIndex) => {
            context += `  ${eduIndex + 1}. ${edu.degree || 'Degree'} in ${edu.field || 'Field'} from ${edu.institution || 'Institution'} (${edu.year || 'Year'})\n`;
          });
        }
        
        // Work experience
        if (profile.work_experience && profile.work_experience.length > 0) {
          context += `Work Experience:\n`;
          profile.work_experience.forEach((work, workIndex) => {
            context += `  ${workIndex + 1}. ${work.title || 'Title'} at ${work.company || 'Company'} (${work.duration || 'Duration'})\n`;
            if (work.description) context += `     Description: ${work.description}\n`;
          });
        }
        
        // Certifications
        if (profile.certifications && profile.certifications.length > 0) {
          context += `Certifications: ${profile.certifications.join(', ')}\n`;
        }
        
        // Languages
        if (profile.languages && profile.languages.length > 0) {
          context += `Languages: ${profile.languages.join(', ')}\n`;
        }
        
        // AI Summary (if available)
        if (profile.ai_summary && profile.ai_summary !== "No AI summary available") {
          context += `AI Summary: ${profile.ai_summary}\n`;
        }
        
        // Contact information
        if (profile.contact) {
          if (profile.contact.emails && profile.contact.emails.length > 0) {
            context += `Emails: ${profile.contact.emails.join(', ')}\n`;
          }
          if (profile.contact.phones && profile.contact.phones.length > 0) {
            context += `Phones: ${profile.contact.phones.join(', ')}\n`;
          }
          if (profile.contact.linkedin) {
            context += `LinkedIn: ${profile.contact.linkedin}\n`;
          }
        }
        
        context += `\n`;
      });
    }
    
    // COMPLETE JOB LISTINGS - All data for deep analysis
    if (jobs.length > 0) {
      context += `💼 COMPLETE JOB LISTINGS (${jobs.length} total):\n`;
      context += `==========================================\n\n`;
      
      jobs.forEach((job, index) => {
        context += `JOB ${index + 1}: ${job.title}\n`;
        context += `----------------------------------------\n`;
        context += `ID: ${job.uuid}\n`;
        context += `Company: ${job.company}\n`;
        context += `Location: ${job.location || 'Not specified'}\n`;
        context += `Experience Level: ${job.experience_level || 'Not specified'}\n`;
        context += `Industry: ${job.industry || 'Not specified'}\n`;
        context += `Employment Type: ${job.employment_type || 'Not specified'}\n`;
        context += `Salary Range: ${job.salary_range || 'Not specified'}\n`;
        context += `Remote Policy: ${job.remote_policy || 'Not specified'}\n`;
        
        // Complete skills list
        if (job.skills && job.skills.length > 0) {
          context += `Required Skills (${job.skills.length} total): ${job.skills.join(', ')}\n`;
        }
        
        // Job description
        if (job.description) {
          context += `Description: ${job.description}\n`;
        }
        
        // Requirements
        if (job.requirements && job.requirements.length > 0) {
          context += `Requirements:\n`;
          job.requirements.forEach((req, reqIndex) => {
            context += `  ${reqIndex + 1}. ${req}\n`;
          });
        }
        
        // Benefits
        if (job.benefits && job.benefits.length > 0) {
          context += `Benefits: ${job.benefits.join(', ')}\n`;
        }
        
        context += `\n`;
      });
    }
    
    // COMPREHENSIVE STATISTICS - All available data insights
    if (statistics) {
      context += `📈 COMPREHENSIVE STATISTICS:\n`;
      context += `==========================================\n`;
      
      // Experience distribution
      if (statistics.experience_distribution) {
        context += `Experience Distribution:\n`;
        statistics.experience_distribution.forEach((exp, index) => {
          context += `  ${exp.range}: ${exp.count} candidates\n`;
        });
        context += `\n`;
      }
      
      // Skills distribution (top skills)
      if (statistics.skills_distribution && statistics.skills_distribution.length > 0) {
        context += `Top Skills Distribution:\n`;
        statistics.skills_distribution.slice(0, 20).forEach((skill, index) => {
          context += `  ${index + 1}. ${skill.skill}: ${skill.count} candidates\n`;
        });
        context += `\n`;
      }
      
      // Location distribution
      if (statistics.location_distribution && statistics.location_distribution.length > 0) {
        context += `Location Distribution:\n`;
        statistics.location_distribution.slice(0, 15).forEach((loc, index) => {
          context += `  ${index + 1}. ${loc.location}: ${loc.count} candidates\n`;
        });
        context += `\n`;
      }
      
      // Industry distribution
      if (statistics.industry_distribution && statistics.industry_distribution.length > 0) {
        context += `Industry Distribution:\n`;
        statistics.industry_distribution.slice(0, 15).forEach((ind, index) => {
          context += `  ${index + 1}. ${ind.industry}: ${ind.count} candidates\n`;
        });
        context += `\n`;
      }
      
      // Company distribution
      if (statistics.company_distribution && statistics.company_distribution.length > 0) {
        context += `Company Distribution:\n`;
        statistics.company_distribution.slice(0, 15).forEach((comp, index) => {
          context += `  ${index + 1}. ${comp.company}: ${comp.count} candidates\n`;
        });
        context += `\n`;
      }
    }
    
    // COMPLETE SEARCHABLE DATA - All available options
    if (searchable_data) {
      context += `🔍 COMPLETE SEARCHABLE DATA:\n`;
      context += `==========================================\n`;
      
      // All skills
      if (searchable_data.skills && searchable_data.skills.length > 0) {
        context += `All Available Skills (${searchable_data.skills.length} total):\n`;
        context += `${searchable_data.skills.join(', ')}\n\n`;
      }
      
      // All locations
      if (searchable_data.locations && searchable_data.locations.length > 0) {
        context += `All Available Locations (${searchable_data.locations.length} total):\n`;
        context += `${searchable_data.locations.join(', ')}\n\n`;
      }
      
      // All industries
      if (searchable_data.industries && searchable_data.industries.length > 0) {
        context += `All Available Industries (${searchable_data.industries.length} total):\n`;
        context += `${searchable_data.industries.join(', ')}\n\n`;
      }
      
      // All companies
      if (searchable_data.companies && searchable_data.companies.length > 0) {
        context += `All Available Companies (${searchable_data.companies.length} total):\n`;
        context += `${searchable_data.companies.join(', ')}\n\n`;
      }
      
      // All job titles
      if (searchable_data.job_titles && searchable_data.job_titles.length > 0) {
        context += `All Available Job Titles (${searchable_data.job_titles.length} total):\n`;
        context += `${searchable_data.job_titles.join(', ')}\n\n`;
      }
    }
    
    context += `\n=== END OF DATABASE ===\n`;
    context += `You now have access to ALL the data above. You can answer ANY question about:\n`;
    context += `- Individual candidate profiles and their complete information\n`;
    context += `- Job listings and requirements\n`;
    context += `- Skills, locations, industries, companies\n`;
    context += `- Statistics and trends\n`;
    context += `- Comparisons between candidates or jobs\n`;
    context += `- Specific searches and analysis\n`;
    context += `- Any recruitment-related question using this comprehensive data\n\n`;
    
    return context;
  }

  buildSimplePrompt(query, context) {
    return `User Question: ${query.query}

COMPREHENSIVE DATABASE ACCESS:
${context}

INSTRUCTIONS:
- You have access to ALL the data above including complete candidate profiles, job listings, skills, statistics, and searchable data
- For recruitment questions: Use the comprehensive data to provide detailed, specific answers with actionable insights
- For casual questions: Chat naturally and friendly
- Always use markdown formatting for better readability
- Be specific and reference actual data when answering recruitment questions
- You can answer ANY question about candidates, jobs, skills, locations, industries, companies, or trends

Answer the user's question using your comprehensive knowledge of the recruitment database.`;
  }

  /**
   * Handle CRM-related commands from AI chat
   * @param {string} query - The user's query
   * @param {Object} context - The data context
   * @returns {Object|null} CRM result or null if not a CRM command
   */
  async handleCRMCommands(query, context) {
    try {
      const lowerQuery = query.toLowerCase();
      
      // Check for move to CRM commands
      if (lowerQuery.includes('move') && (lowerQuery.includes('crm') || lowerQuery.includes('to crm'))) {
        return await this.handleMoveToCRMCommand(query, context);
      }
      
      // Check for CRM filtering commands
      if (lowerQuery.includes('filter') && (lowerQuery.includes('crm') || lowerQuery.includes('moved'))) {
        return await this.handleCRMFilterCommand(query, context);
      }
      
      // Check for CRM statistics commands
      if (lowerQuery.includes('crm') && (lowerQuery.includes('stats') || lowerQuery.includes('statistics') || lowerQuery.includes('overview'))) {
        return await this.handleCRMStatsCommand();
      }
      
      // Check for show candidates in/not in CRM
      if (lowerQuery.includes('show') && lowerQuery.includes('crm')) {
        return await this.handleShowCRMCommand(query, context);
      }
      
      return null; // Not a CRM command
    } catch (error) {
      console.error("❌ Error handling CRM commands:", error.message);
      return {
        response: `❌ Error processing CRM command: ${error.message}`,
        query: query,
        timestamp: new Date().toISOString(),
        crm_action: true
      };
    }
  }

  /**
   * Handle move to CRM commands
   */
  async handleMoveToCRMCommand(query, context) {
    try {
      const lowerQuery = query.toLowerCase();
      const profiles = context?.profiles || [];
      
      // Extract candidate names or IDs from the query
      const candidateIdentifiers = this.extractCandidateIdentifiers(query, profiles);
      
      if (candidateIdentifiers.length === 0) {
        return {
          response: `❌ **No candidates found to move to CRM.**\n\nPlease specify which candidate(s) you'd like to move. You can use:\n- Full name\n- Partial name\n- "all" for all candidates\n- "top 5" for top 5 candidates\n- Specific skills or criteria`,
          query: query,
          timestamp: new Date().toISOString(),
          crm_action: true
        };
      }
      
      let result;
      if (candidateIdentifiers.length === 1) {
        result = await this.crmService.moveToCRM(candidateIdentifiers[0]);
      } else {
        result = await this.crmService.moveMultipleToCRM(candidateIdentifiers);
      }
      
      if (result.success) {
        const candidateNames = this.getCandidateNames(candidateIdentifiers, profiles);
        return {
          response: `✅ **Successfully moved ${result.candidates_moved || 1} candidate(s) to CRM!**\n\n**Candidates moved:**\n${candidateNames.map(name => `- ${name}`).join('\n')}\n\n**CRM Status:** ${result.candidates_moved || 1} candidate(s) now in CRM pipeline.`,
          query: query,
          timestamp: new Date().toISOString(),
          crm_action: true,
          crm_result: result
        };
      } else {
        return {
          response: `❌ **Failed to move candidates to CRM:** ${result.error}`,
          query: query,
          timestamp: new Date().toISOString(),
          crm_action: true
        };
      }
    } catch (error) {
      console.error("❌ Error in move to CRM command:", error.message);
      return {
        response: `❌ **Error processing move to CRM command:** ${error.message}`,
        query: query,
        timestamp: new Date().toISOString(),
        crm_action: true
      };
    }
  }

  /**
   * Handle CRM filtering commands
   */
  async handleCRMFilterCommand(query, context) {
    try {
      const filters = this.extractFiltersFromQuery(query);
      const result = await this.crmService.getCandidatesByStatus(filters);
      
      if (result.success) {
        const filterDescription = this.describeFilters(filters);
        const candidateList = this.formatCandidateList(result.candidates);
        
        return {
          response: `🔍 **CRM Filter Results**\n\n**Filters applied:** ${filterDescription}\n\n**Found ${result.candidates.length} candidates:**\n${candidateList}\n\n**Summary:**\n- Total candidates: ${result.total}\n- In CRM: ${result.moved_count}\n- Not in CRM: ${result.not_moved_count}`,
          query: query,
          timestamp: new Date().toISOString(),
          crm_action: true,
          crm_result: result
        };
      } else {
        return {
          response: `❌ **Failed to filter CRM candidates:** ${result.error}`,
          query: query,
          timestamp: new Date().toISOString(),
          crm_action: true
        };
      }
    } catch (error) {
      console.error("❌ Error in CRM filter command:", error.message);
      return {
        response: `❌ **Error processing CRM filter command:** ${error.message}`,
        query: query,
        timestamp: new Date().toISOString(),
        crm_action: true
      };
    }
  }

  /**
   * Handle CRM statistics commands
   */
  async handleCRMStatsCommand() {
    try {
      const result = await this.crmService.getCRMStatistics();
      
      if (result.success) {
        const stats = result.statistics;
        const recentList = result.recent_movements.map(movement => 
          `- ${movement.uuid} (${new Date(movement.updatedAt).toLocaleDateString()})`
        ).join('\n');
        
        return {
          response: `📊 **CRM Statistics Overview**\n\n**Current Status:**\n- Total candidates: ${stats.total_candidates}\n- Moved to CRM: ${stats.moved_to_crm}\n- Not moved: ${stats.not_moved}\n- CRM percentage: ${stats.crm_percentage}%\n\n**Recent CRM Movements:**\n${recentList}\n\n**CRM Pipeline:** ${stats.moved_to_crm} candidates are currently in your CRM pipeline.`,
          query: "Show CRM statistics",
          timestamp: new Date().toISOString(),
          crm_action: true,
          crm_result: result
        };
      } else {
        return {
          response: `❌ **Failed to get CRM statistics:** ${result.error}`,
          query: "Show CRM statistics",
          timestamp: new Date().toISOString(),
          crm_action: true
        };
      }
    } catch (error) {
      console.error("❌ Error in CRM stats command:", error.message);
      return {
        response: `❌ **Error getting CRM statistics:** ${error.message}`,
        query: "Show CRM statistics",
        timestamp: new Date().toISOString(),
        crm_action: true
      };
    }
  }

  /**
   * Handle show CRM candidates commands
   */
  async handleShowCRMCommand(query, context) {
    try {
      const lowerQuery = query.toLowerCase();
      let filters = { moved: 1 }; // Default to show candidates in CRM
      
      if (lowerQuery.includes('not in') || lowerQuery.includes('not moved')) {
        filters.moved = 0;
      }
      
      // Extract additional filters
      const additionalFilters = this.extractFiltersFromQuery(query);
      Object.assign(filters, additionalFilters);
      
      const result = await this.crmService.getCandidatesByStatus(filters);
      
      if (result.success) {
        const statusText = filters.moved === 1 ? "in CRM" : "not in CRM";
        const candidateList = this.formatCandidateList(result.candidates);
        
        return {
          response: `👥 **Candidates ${statusText}**\n\n**Found ${result.candidates.length} candidates:**\n${candidateList}\n\n**Total ${statusText}:** ${filters.moved === 1 ? result.moved_count : result.not_moved_count}`,
          query: query,
          timestamp: new Date().toISOString(),
          crm_action: true,
          crm_result: result
        };
      } else {
        return {
          response: `❌ **Failed to get CRM candidates:** ${result.error}`,
          query: query,
          timestamp: new Date().toISOString(),
          crm_action: true
        };
      }
    } catch (error) {
      console.error("❌ Error in show CRM command:", error.message);
      return {
        response: `❌ **Error showing CRM candidates:** ${error.message}`,
        query: query,
        timestamp: new Date().toISOString(),
        crm_action: true
      };
    }
  }

  /**
   * Extract candidate identifiers from query
   */
  extractCandidateIdentifiers(query, profiles) {
    const lowerQuery = query.toLowerCase();
    const identifiers = [];
    
    // Check for "all" command
    if (lowerQuery.includes('all') || lowerQuery.includes('everyone')) {
      return profiles.map(p => p.uuid);
    }
    
    // Check for "top N" command
    const topMatch = lowerQuery.match(/top\s+(\d+)/);
    if (topMatch) {
      const topN = parseInt(topMatch[1]);
      const sortedProfiles = profiles
        .filter(p => p.fit_percentage > 0)
        .sort((a, b) => b.fit_percentage - a.fit_percentage)
        .slice(0, topN);
      return sortedProfiles.map(p => p.uuid);
    }
    
    // Check for specific names
    for (const profile of profiles) {
      if (profile.name && lowerQuery.includes(profile.name.toLowerCase())) {
        identifiers.push(profile.uuid);
      }
    }
    
    // Check for skills-based selection
    if (lowerQuery.includes('with') && lowerQuery.includes('skills')) {
      const skillMatch = lowerQuery.match(/with\s+([a-zA-Z\s]+)\s+skills/);
      if (skillMatch) {
        const skill = skillMatch[1].trim().toLowerCase();
        const matchingProfiles = profiles.filter(p => 
          p.skills && p.skills.some(s => s.toLowerCase().includes(skill))
        );
        return matchingProfiles.map(p => p.uuid);
      }
    }
    
    return identifiers;
  }

  /**
   * Extract filters from query
   */
  extractFiltersFromQuery(query) {
    const filters = {};
    const lowerQuery = query.toLowerCase();
    
    // Fit percentage filter
    const fitMatch = lowerQuery.match(/(\d+)%?\s*fit/);
    if (fitMatch) {
      filters.min_fit_percentage = parseInt(fitMatch[1]);
    }
    
    // Experience filter
    const expMatch = lowerQuery.match(/(\d+)\s*years?/);
    if (expMatch) {
      filters.experience_years = parseInt(expMatch[1]);
    }
    
    // Industry filter
    const industryMatch = lowerQuery.match(/industry[:\s]+([a-zA-Z\s]+)/);
    if (industryMatch) {
      filters.industry = industryMatch[1].trim();
    }
    
    // Location filter
    const locationMatch = lowerQuery.match(/location[:\s]+([a-zA-Z\s]+)/);
    if (locationMatch) {
      filters.location = locationMatch[1].trim();
    }
    
    return filters;
  }

  /**
   * Get candidate names from UUIDs
   */
  getCandidateNames(uuids, profiles) {
    return uuids.map(uuid => {
      const profile = profiles.find(p => p.uuid === uuid);
      return profile ? profile.name : uuid;
    });
  }

  /**
   * Describe filters in human-readable format
   */
  describeFilters(filters) {
    const descriptions = [];
    
    if (filters.moved !== undefined) {
      descriptions.push(filters.moved === 1 ? "In CRM" : "Not in CRM");
    }
    if (filters.min_fit_percentage) {
      descriptions.push(`Min fit: ${filters.min_fit_percentage}%`);
    }
    if (filters.experience_years) {
      descriptions.push(`Min experience: ${filters.experience_years} years`);
    }
    if (filters.industry) {
      descriptions.push(`Industry: ${filters.industry}`);
    }
    if (filters.location) {
      descriptions.push(`Location: ${filters.location}`);
    }
    
    return descriptions.length > 0 ? descriptions.join(", ") : "No specific filters";
  }

  /**
   * Format candidate list for display
   */
  formatCandidateList(candidates) {
    if (candidates.length === 0) return "No candidates found";
    
    return candidates.slice(0, 10).map((candidate, index) => {
      const fitText = candidate.fit_percentage ? ` (${candidate.fit_percentage}% fit)` : "";
      const movedText = candidate.moved === 1 ? " ✅ CRM" : "";
      return `${index + 1}. ${candidate.uuid}${fitText}${movedText}`;
    }).join('\n') + (candidates.length > 10 ? `\n... and ${candidates.length - 10} more` : "");
  }

  // Simple helper methods
  async getQuickInsights(profiles, jobs, statistics) {
    const query = {
      query: "Give me a quick overview of the top candidates and available jobs",
      context: { profiles, jobs, statistics }
    };
    const response = await this.processQuery(query);
    return response.response;
  }

  async analyzeProfile(profileId, allData) {
    const profile = allData.profiles.find(p => p.uuid === profileId);
    if (!profile) return "Profile not found";
    
    const query = {
      query: `Analyze this candidate: ${profile.name}`,
      context: { profiles: [profile], jobs: allData.jobs, statistics: allData.statistics }
    };
    const response = await this.processQuery(query);
    return response.response;
  }

  async compareProfiles(profileIds, allData) {
    const profiles = allData.profiles.filter(p => profileIds.includes(p.uuid));
    if (profiles.length === 0) return "No profiles found";
    
    const query = {
      query: `Compare these candidates: ${profiles.map(p => p.name).join(', ')}`,
      context: { profiles, jobs: allData.jobs, statistics: allData.statistics }
    };
    const response = await this.processQuery(query);
    return response.response;
  }

  async getJobRecommendations(jobId, allData) {
    const job = allData.jobs.find(j => j.id === jobId);
    if (!job) return "Job not found";
    
    const query = {
      query: `Recommend candidates for: ${job.title} at ${job.company}`,
      context: { profiles: allData.profiles, jobs: [job], statistics: allData.statistics }
    };
    const response = await this.processQuery(query);
    return response.response;
  }

  async getDataInsights(allData) {
    const query = {
      query: "Provide insights and analysis of this recruitment data",
      context: allData
    };
    const response = await this.processQuery(query);
    return response.response;
  }
}

module.exports = { AIService };
