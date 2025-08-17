const Profile = require("../models/Profile");
const ProfileAISummary = require("../models/ProfileAISummary");
const JobInfo = require("../models/JobInfo");

class DataLoader {
  constructor() {
    this.data = null;
  }

  static getInstance() {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  async loadData() {
    if (this.data) return this.data;

    try {
      // Load profiles from MongoDB
      const profiles = await Profile.find();

      // Load AI summaries from MongoDB
      const summariesData = await ProfileAISummary.find();

      // Load job information from MongoDB
      const jobInfo = await JobInfo.findOne(); // Assume one job document

      // Merge profiles with summaries
      const enhancedProfiles = profiles.map((profile) => {
        const summaryEntry = summariesData.find((s) => s.uuid === profile.uuid);
        const summary = summaryEntry
          ? summaryEntry.matched?.full_profile?.summary
          : "No summary available";
        const fitPercentage = summaryEntry ? summaryEntry.fit_percentage : 0;

        const skillsMatch = profile.skills.filter((skill) =>
          jobInfo.skills.some(
            (jobSkill) =>
              jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(jobSkill.toLowerCase())
          )
        );

        const experienceMatch =
          profile.experience_years >=
          (jobInfo.experience_level === "mid" ? 5 : 10);

        return {
          ...profile.toObject(),
          summary,
          fit_percentage: fitPercentage,
          skills_match: skillsMatch,
          experience_match: experienceMatch,
          name:
            profile.full_name || `${profile.first_name} ${profile.last_name}`,
        };
      });

      // Sort by fit percentage
      enhancedProfiles.sort((a, b) => b.fit_percentage - a.fit_percentage);

      this.data = {
        enhancedProfiles,
        jobInfo,
      };

      console.log(
        `Loaded ${enhancedProfiles.length} profiles and 1 job from MongoDB`
      );
      return this.data;
    } catch (error) {
      console.error("Error loading data from MongoDB:", error.message);
      throw new Error("Failed to load data from MongoDB");
    }
  }

  async getData() {
    if (!this.data) {
      return await this.loadData();
    }
    return this.data;
  }

  async refreshData() {
    this.data = null;
    return await this.loadData();
  }
}

module.exports = { DataLoader };
