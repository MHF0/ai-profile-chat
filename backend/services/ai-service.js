const OpenAI = require("openai");

class AIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing in .env file");
    }
    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.systemPrompt = `You are an expert recruitment AI assistant specializing in matching candidate profiles to job requirements.

Your role is to:
1. Analyze candidate profiles against job requirements.
2. Provide insights on skills matches and experience levels.
3. Recommend top candidates with clear reasoning.
4. Answer questions about recruitment data in a helpful, professional manner.

Always respond in markdown format with:
- Clear explanations for recommendations.
- Tables for candidate comparisons (name, fit %, skills, experience).
- Actionable insights for recruiters.

Be concise but thorough.`;
  }

  async processQuery(query) {
    try {
      const context = this.buildContext(query);
      const userPrompt = this.buildUserPrompt(query, context);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response =
        completion.choices[0]?.message?.content || "No response generated";

      return {
        response,
        profiles: query.context?.profiles || [],
        reasoning: this.extractReasoning(response),
        confidence: 0.9,
      };
    } catch (error) {
      console.error("AI service error:", error.message);
      return {
        response:
          "I apologize, but I encountered an error processing your request. Please try again or contact support.",
        confidence: 0.0,
      };
    }
  }

  buildContext(query) {
    if (!query.context) return "No context provided";

    const { profiles, jobInfo } = query.context;
    let context = "";

    if (jobInfo) {
      context += `\n\nJOB INFORMATION:\n`;
      context += `Title: ${jobInfo.title}\n`;
      context += `Company: ${jobInfo.company}\n`;
      context += `Required Skills: ${jobInfo.skills.join(", ")}\n`;
      context += `Experience Level: ${jobInfo.experience_level}\n`;
      context += `Requirements: ${jobInfo.requirements.join(", ")}\n`;
    }

    if (profiles && profiles.length > 0) {
      context += `\n\nCANDIDATE PROFILES (Top ${profiles.length}):\n`;
      profiles.forEach((profile, index) => {
        context += `\n${index + 1}. ${profile.name} (${
          profile.fit_percentage
        }% fit)\n`;
        context += `   Skills: ${profile.skills.join(", ")}\n`;
        context += `   Experience: ${profile.experience_years} years\n`;
        context += `   Summary: ${profile.summary}\n`;
        context += `   Skills Match: ${profile.skills_match.join(", ")}\n`;
      });
    }

    return context;
  }

  buildUserPrompt(query, context) {
    return `User Query: ${query.query}

${context}

Please provide a comprehensive response addressing the user's query. Use markdown tables for candidate comparisons.`;
  }

  extractReasoning(response) {
    const reasoningMatch = response.match(/Reasoning[:\s]+(.+?)(?=\n|$)/i);
    return reasoningMatch
      ? reasoningMatch[1].trim()
      : "Reasoning not explicitly provided";
  }

  async getQuickInsights(profiles, jobInfo) {
    const topProfiles = profiles.slice(0, 3);
    const query = {
      query:
        "Give me a quick overview of the top candidates and their key strengths for this role",
      context: { profiles: topProfiles, jobInfo },
    };

    const response = await this.processQuery(query);
    return response.response;
  }
}

module.exports = { AIService };
