const shared = {
  Profile: {
    uuid: "string",
    first_name: "string",
    last_name: "string",
    full_name: "string",
    location_raw: "string",
    skills: ["string"],
    experience_years: "number",
    summary: "string",
  },
  JobInfo: {
    title: "string",
    company: "string",
    location: "string",
    skills: ["string"],
    experience_level: "string",
    requirements: ["string"],
  },
  EnhancedProfile: {
    uuid: "string",
    first_name: "string",
    last_name: "string",
    full_name: "string",
    location_raw: "string",
    skills: ["string"],
    experience_years: "number",
    summary: "string",
    fit_percentage: "number",
    skills_match: ["string"],
    experience_match: "boolean",
    name: "string",
  },
  DataContext: {
    enhancedProfiles: ["EnhancedProfile"],
    jobInfo: "JobInfo",
  },
  ChatQuery: {
    query: "string",
    context: {
      profiles: ["EnhancedProfile"],
      jobInfo: "JobInfo",
    },
  },
  AIResponse: {
    response: "string",
    profiles: ["EnhancedProfile"],
    reasoning: "string",
    confidence: "number",
  },
};

module.exports = shared;
