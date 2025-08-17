const OpenAI = require("openai");

class AIService {
  constructor() {
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

    // Simple, clear system prompt
    this.systemPrompt = `You are a highly knowledgeable AI recruitment assistant with COMPLETE access to a comprehensive recruitment database.

You have access to ALL candidate profiles, job listings, skills, locations, industries, companies, and detailed statistics.

Your capabilities include:
- Answering ANY question about individual candidates (experience, skills, education, work history, contact info)
- Providing detailed analysis of job listings and requirements
- Comparing candidates and jobs based on multiple criteria
- Analyzing skills distribution, location trends, and industry insights
- Finding specific candidates or jobs based on detailed criteria
- Providing comprehensive recruitment insights and recommendations
- Answering general questions and casual conversation

When answering recruitment-related questions:
- Use the comprehensive database data provided
- Be specific and detailed in your responses
- Reference specific candidates, jobs, or data points when relevant
- Provide actionable insights and recommendations
- Use markdown formatting for better readability

For casual questions, chat naturally and friendly.

You are now the most knowledgeable recruitment AI available - use your comprehensive data access to provide exceptional insights!`;
  }

  async processQuery(query) {
    try {
      console.log("🤖 Processing AI query:", query.query);
      
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
