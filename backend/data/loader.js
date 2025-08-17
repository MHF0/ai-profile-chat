const Profile = require("../models/Profile");
const ProfileAISummary = require("../models/ProfileAISummary");
const JobInfo = require("../models/JobInfo");

class DataLoader {
  constructor() {
    this.data = null;
    this.lastRefresh = null;
    this.refreshInterval = 5 * 60 * 1000; // 5 minutes
  }

  static getInstance() {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  async loadData() {
    try {
      console.log("🔄 Loading data from all database models...");

      // Load all profiles with comprehensive data
      const profiles = await Profile.find().lean();
      console.log(`📊 Loaded ${profiles.length} profiles`);

      // Load all AI summaries
      const summariesData = await ProfileAISummary.find().lean();
      console.log(`🤖 Loaded ${summariesData.length} AI summaries`);

      // Load all job information
      const jobInfoData = await JobInfo.find().lean();
      console.log(`💼 Loaded ${jobInfoData.length} job entries`);

      // Create comprehensive data structure
      const enhancedProfiles = profiles.map((profile) => {
        const summaryEntry = summariesData.find((s) => s.uuid === profile.uuid);
        
        // Enhanced profile with all available data
        const enhancedProfile = {
          ...profile,
          // Basic info
          id: profile.uuid,
          name: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          display_name: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          
          // Experience calculations
          experience_years: profile.years_of_experience || profile.months_of_experience / 12 || 0,
          experience_months: profile.months_of_experience || 0,
          
          // AI Summary data
          ai_summary: summaryEntry?.matched?.full_profile?.summary || "No AI summary available",
          fit_percentage: summaryEntry?.fit_percentage || 0,
          ai_analysis: summaryEntry?.matched || {},
          
          // Enhanced skills analysis
          skills: profile.skills || [],
          skills_count: (profile.skills || []).length,
          
          // Location info
          location: {
            name: profile.location_name,
            code: profile.location_code,
            raw: profile.location_raw,
            country: profile.location_raw?.split(',').pop()?.trim()
          },
          
          // Professional info
          current_role: profile.job_title || profile.current_title,
          industry: profile.current_industry,
          seniority: profile.seniority_level,
          functional_area: profile.functional_area,
          
          // Company info
          current_company: profile.current_company || {},
          
          // Contact info
          contact: {
            emails: [...(profile.work_emails || []), ...(profile.personal_emails || [])],
            phones: profile.phones || [],
            linkedin: profile.linkedin_url,
            social: profile.social_links || []
          },
          
          // Education and certifications
          education: profile.education || [],
          certifications: profile.certifications || [],
          
          // Experience details
          work_experience: profile.experiences || [],
          
          // Additional info
          languages: profile.languages || [],
          awards: profile.awards || [],
          publications: profile.publications || [],
          patents: profile.patents || [],
          memberships: profile.memberships || [],
          
          // Metadata
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          content_hash: profile.content_hash
        };

        return enhancedProfile;
      });

      // Create comprehensive job information
      const enhancedJobInfo = jobInfoData.map(job => ({
        id: job.id || job.job_id,
        uuid: job.uuid || job.id || job.job_id,
        job_flow_id: job.job_flow_id,
        attributes: job.attributes || {},
        created_at: job.createdAt,
        updated_at: job.updatedAt,
        
        // Extract common job attributes
        title: job.attributes?.title || job.attributes?.job_title || "Unknown Position",
        company: job.attributes?.company || job.attributes?.company_name || "Unknown Company",
        skills: job.attributes?.skills || job.attributes?.required_skills || [],
        experience_level: job.attributes?.experience_level || job.attributes?.seniority || "Not specified",
        requirements: job.attributes?.requirements || job.attributes?.qualifications || [],
        location: job.attributes?.location || job.attributes?.job_location || "Not specified",
        industry: job.attributes?.industry || job.attributes?.sector || "Not specified",
        employment_type: job.attributes?.employment_type || job.attributes?.type || "Not specified",
        salary_range: job.attributes?.salary_range || job.attributes?.compensation || "Not specified",
        remote_policy: job.attributes?.remote_policy || job.attributes?.work_model || "Not specified",
        description: job.attributes?.description || job.attributes?.summary || "No description available",
        benefits: job.attributes?.benefits || job.attributes?.perks || [],
        company_size: job.attributes?.company_size || "Not specified",
        company_industry: job.attributes?.company_industry || job.attributes?.sector || "Not specified"
      }));

      // Create comprehensive data context
      const comprehensiveData = {
        // Profile data
        profiles: enhancedProfiles,
        profiles_count: enhancedProfiles.length,
        
        // Job data
        jobs: enhancedJobInfo,
        jobs_count: enhancedJobInfo.length,
        
        // AI Summary data
        ai_summaries: summariesData,
        ai_summaries_count: summariesData.length,
        
        // Statistics
        statistics: {
          total_candidates: enhancedProfiles.length,
          total_jobs: enhancedJobInfo.length,
          average_experience: enhancedProfiles.reduce((sum, p) => sum + p.experience_years, 0) / enhancedProfiles.length,
          skills_distribution: this.getSkillsDistribution(enhancedProfiles),
          location_distribution: this.getLocationDistribution(enhancedProfiles),
          seniority_distribution: this.getSeniorityDistribution(enhancedProfiles),
          industry_distribution: this.getIndustryDistribution(enhancedProfiles),
          company_distribution: this.getCompanyDistribution(enhancedProfiles),
          experience_distribution: this.getExperienceDistribution(enhancedProfiles),
          top_candidates: this.getTopCandidates(enhancedProfiles, 20),
          skill_demand_analysis: this.getTopSkillsByDemand(enhancedProfiles, enhancedJobInfo),
          location_insights: this.getLocationInsights(enhancedProfiles),
          ai_summaries_count: summariesData.length
        },
        
        // Searchable data
        searchable_data: {
          skills: [...new Set(enhancedProfiles.flatMap(p => p.skills))],
          locations: [...new Set(enhancedProfiles.map(p => p.location.name).filter(Boolean))],
          industries: [...new Set(enhancedProfiles.map(p => p.industry).filter(Boolean))],
          companies: [...new Set(enhancedProfiles.map(p => p.current_company.name).filter(Boolean))],
          job_titles: [...new Set(enhancedProfiles.map(p => p.current_role).filter(Boolean))],
          seniority_levels: [...new Set(enhancedProfiles.map(p => p.seniority).filter(Boolean))],
          functional_areas: [...new Set(enhancedProfiles.map(p => p.functional_area).filter(Boolean))],
          certifications: [...new Set(enhancedProfiles.flatMap(p => p.certifications || []))],
          languages: [...new Set(enhancedProfiles.flatMap(p => p.languages || []))],
          education_degrees: [...new Set(enhancedProfiles.flatMap(p => p.education?.map(e => e.degree) || []))],
          education_fields: [...new Set(enhancedProfiles.flatMap(p => p.education?.map(e => e.field) || []))],
          job_skills: [...new Set(enhancedJobInfo.flatMap(j => j.skills))],
          job_locations: [...new Set(enhancedJobInfo.map(j => j.location).filter(Boolean))],
          job_industries: [...new Set(enhancedJobInfo.map(j => j.industry).filter(Boolean))],
          job_companies: [...new Set(enhancedJobInfo.map(j => j.company).filter(Boolean))],
          employment_types: [...new Set(enhancedJobInfo.map(j => j.employment_type).filter(Boolean))]
        },
        
        // Metadata
        last_updated: new Date(),
        data_version: "2.0"
      };

      this.data = comprehensiveData;
      this.lastRefresh = new Date();
      
      console.log(`✅ Data loaded successfully: ${enhancedProfiles.length} profiles, ${enhancedJobInfo.length} jobs`);
      return this.data;
      
    } catch (error) {
      console.error("❌ Error loading data from MongoDB:", error.message);
      throw new Error(`Failed to load data from MongoDB: ${error.message}`);
    }
  }

  getSkillsDistribution(profiles) {
    const skillCount = {};
    profiles.forEach(profile => {
      profile.skills.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });
    return Object.entries(skillCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([skill, count]) => ({ skill, count }));
  }

  getLocationDistribution(profiles) {
    const locationCount = {};
    profiles.forEach(profile => {
      const location = profile.location.name || profile.location.country || 'Unknown';
      locationCount[location] = (locationCount[location] || 0) + 1;
    });
    return Object.entries(locationCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([location, count]) => ({ location, count }));
  }

  getSeniorityDistribution(profiles) {
    const seniorityCount = {};
    profiles.forEach(profile => {
      const seniority = profile.seniority || 'Not specified';
      seniorityCount[seniority] = (seniorityCount[seniority] || 0) + 1;
    });
    return Object.entries(seniorityCount)
      .map(([seniority, count]) => ({ seniority, count }));
  }

  getIndustryDistribution(profiles) {
    const industryCount = {};
    profiles.forEach(profile => {
      const industry = profile.industry || 'Not specified';
      industryCount[industry] = (industryCount[industry] || 0) + 1;
    });
    return Object.entries(industryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([industry, count]) => ({ industry, count }));
  }

  getCompanyDistribution(profiles) {
    const companyCount = {};
    profiles.forEach(profile => {
      const company = profile.current_company?.name || 'Not specified';
      companyCount[company] = (companyCount[company] || 0) + 1;
    });
    return Object.entries(companyCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([company, count]) => ({ company, count }));
  }

  getExperienceDistribution(profiles) {
    const experienceRanges = {
      '0-2 years': 0,
      '3-5 years': 0,
      '6-10 years': 0,
      '11-15 years': 0,
      '16+ years': 0
    };

    profiles.forEach(profile => {
      const years = profile.experience_years || 0;
      if (years <= 2) experienceRanges['0-2 years']++;
      else if (years <= 5) experienceRanges['3-5 years']++;
      else if (years <= 10) experienceRanges['6-10 years']++;
      else if (years <= 15) experienceRanges['11-15 years']++;
      else experienceRanges['16+ years']++;
    });

    return Object.entries(experienceRanges)
      .map(([range, count]) => ({ range, count }));
  }

  getTopCandidates(profiles, limit = 10) {
    return profiles
      .filter(p => p.fit_percentage > 0)
      .sort((a, b) => b.fit_percentage - a.fit_percentage)
      .slice(0, limit)
      .map(profile => ({
        uuid: profile.uuid,
        name: profile.name,
        fit_percentage: profile.fit_percentage,
        current_role: profile.current_role,
        experience_years: profile.experience_years,
        skills: profile.skills.slice(0, 8),
        location: profile.location.name,
        industry: profile.industry,
        company: profile.current_company?.name
      }));
  }

  getTopSkillsByDemand(profiles, jobs) {
    const skillDemand = {};
    const skillSupply = {};

    // Count skills in job requirements
    jobs.forEach(job => {
      job.skills.forEach(skill => {
        skillDemand[skill] = (skillDemand[skill] || 0) + 1;
      });
    });

    // Count skills in candidate profiles
    profiles.forEach(profile => {
      profile.skills.forEach(skill => {
        skillSupply[skill] = (skillSupply[skill] || 0) + 1;
      });
    });

    // Calculate demand vs supply ratio
    const skillAnalysis = Object.keys(skillDemand).map(skill => ({
      skill,
      demand: skillDemand[skill],
      supply: skillSupply[skill] || 0,
      ratio: skillDemand[skill] / (skillSupply[skill] || 1)
    }));

    return skillAnalysis
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 20);
  }

  getLocationInsights(profiles) {
    const locationData = {};
    
    profiles.forEach(profile => {
      const location = profile.location.name || 'Unknown';
      if (!locationData[location]) {
        locationData[location] = {
          count: 0,
          avg_experience: 0,
          top_skills: {},
          industries: {},
          companies: {}
        };
      }
      
      locationData[location].count++;
      locationData[location].avg_experience += profile.experience_years || 0;
      
      // Track skills per location
      profile.skills.forEach(skill => {
        locationData[location].top_skills[skill] = (locationData[location].top_skills[skill] || 0) + 1;
      });
      
      // Track industries per location
      if (profile.industry) {
        locationData[location].industries[profile.industry] = (locationData[location].industries[profile.industry] || 0) + 1;
      }
      
      // Track companies per location
      if (profile.current_company?.name) {
        locationData[location].companies[profile.current_company.name] = (locationData[location].companies[profile.current_company.name] || 0) + 1;
      }
    });

    // Calculate averages and get top items
    Object.keys(locationData).forEach(location => {
      const data = locationData[location];
      data.avg_experience = data.avg_experience / data.count;
      
      // Get top skills for this location
      data.top_skills = Object.entries(data.top_skills)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([skill, count]) => ({ skill, count }));
      
      // Get top industries for this location
      data.industries = Object.entries(data.industries)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([industry, count]) => ({ industry, count }));
      
      // Get top companies for this location
      data.companies = Object.entries(data.companies)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([company, count]) => ({ company, count }));
    });

    return locationData;
  }

  async getData() {
    // Check if data needs refresh
    if (!this.data || !this.lastRefresh || 
        (Date.now() - this.lastRefresh.getTime()) > this.refreshInterval) {
      return await this.loadData();
    }
    return this.data;
  }

  async refreshData() {
    this.data = null;
    this.lastRefresh = null;
    return await this.loadData();
  }

  async searchProfiles(query, filters = {}) {
    const data = await this.getData();
    let results = data.profiles;

    // Text search
    if (query) {
      const queryLower = query.toLowerCase();
      results = results.filter(profile => 
        profile.name?.toLowerCase().includes(queryLower) ||
        profile.current_role?.toLowerCase().includes(queryLower) ||
        profile.skills.some(skill => skill.toLowerCase().includes(queryLower)) ||
        profile.industry?.toLowerCase().includes(queryLower) ||
        profile.location.name?.toLowerCase().includes(queryLower)
      );
    }

    // Apply filters
    if (filters.skills && filters.skills.length > 0) {
      results = results.filter(profile =>
        filters.skills.some(skill => 
          profile.skills.some(pSkill => 
            pSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    if (filters.experience_min !== undefined) {
      results = results.filter(profile => profile.experience_years >= filters.experience_min);
    }

    if (filters.experience_max !== undefined) {
      results = results.filter(profile => profile.experience_years <= filters.experience_max);
    }

    if (filters.location) {
      results = results.filter(profile =>
        profile.location.name?.toLowerCase().includes(filters.location.toLowerCase()) ||
        profile.location.country?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.industry) {
      results = results.filter(profile =>
        profile.industry?.toLowerCase().includes(filters.industry.toLowerCase())
      );
    }

    if (filters.seniority) {
      results = results.filter(profile =>
        profile.seniority?.toLowerCase().includes(filters.seniority.toLowerCase())
      );
    }

    // Sort by relevance
    results.sort((a, b) => b.fit_percentage - a.fit_percentage);

    return {
      results,
      total: results.length,
      query,
      filters
    };
  }

  async getProfileById(uuid) {
    const data = await this.getData();
    return data.profiles.find(p => p.uuid === uuid);
  }

  async getJobById(id) {
    const data = await this.getData();
    return data.jobs.find(j => j.id === id);
  }

  async getStatistics() {
    const data = await this.getData();
    return data.statistics;
  }
}

module.exports = { DataLoader };
