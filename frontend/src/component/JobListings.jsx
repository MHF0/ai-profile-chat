import React, { useState, useEffect } from "react";
import { Briefcase, Building, MapPin, Clock, DollarSign, MessageCircle, Search, Filter } from "lucide-react";

const JobListings = ({ dataOverview, statistics, onJobSelect }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    industry: "",
    location: "",
    experience: "",
    employment: ""
  });

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchQuery, filters]);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/jobs`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setJobs(data.data);
          console.log(`✅ Loaded ${data.data.length} jobs`);
        } else {
          console.log("⚠️ No jobs found in response");
        }
      }
    } catch (error) {
      console.error("❌ Error loading jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        (job.description && job.description.toLowerCase().includes(query)) ||
        (job.skills && job.skills.some(skill => skill.toLowerCase().includes(query)))
      );
    }

    // Apply filters
    if (filters.industry) {
      filtered = filtered.filter(job => job.industry === filters.industry);
    }
    if (filters.location) {
      filtered = filtered.filter(job => job.location === filters.location);
    }
    if (filters.experience) {
      filtered = filtered.filter(job => job.experience_level === filters.experience);
    }
    if (filters.employment) {
      filtered = filtered.filter(job => job.employment_type === filters.employment);
    }

    setFilteredJobs(filtered);
  };

  const handleJobSelect = (job) => {
    if (onJobSelect) {
      onJobSelect(job);
    }
  };

  const getUniqueValues = (field) => {
    const values = jobs.map(job => job[field]).filter(Boolean);
    return [...new Set(values)].sort();
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return "Not specified";
    return salaryRange;
  };

  const formatSkills = (skills, maxSkills = 3) => {
    if (!skills || skills.length === 0) return "No skills specified";
    if (skills.length <= maxSkills) return skills.join(", ");
    return `${skills.slice(0, maxSkills).join(", ")} +${skills.length - maxSkills} more`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 bg-clip-text text-transparent mb-4">
            Job Listings
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Browse available positions and start job-specific AI conversations
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/40 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Industry Filter */}
            <select
              value={filters.industry}
              onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Industries</option>
              {getUniqueValues('industry').map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              {getUniqueValues('location').map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            {/* Experience Filter */}
            <select
              value={filters.experience}
              onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Experience Levels</option>
              {getUniqueValues('experience_level').map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              <span>Filters applied</span>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No Jobs Found</h3>
            <p className="text-gray-400">
              {searchQuery || Object.values(filters).some(f => f) 
                ? "Try adjusting your search or filters" 
                : "No jobs available at the moment"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredJobs.map((job, index) => (
              <div
                key={job.uuid || job.id || index}
                className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/40 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 group"
              >
                {/* Job Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300 mb-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                      <Building className="w-4 h-4" />
                      <span className="font-medium">{job.company}</span>
                    </div>
                    {job.location && (
                      <div className="flex items-center space-x-2 text-gray-500 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-200 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="w-6 h-6 text-purple-600" />
                  </div>
                </div>

                {/* Job Details */}
                <div className="space-y-3 mb-6">
                  {job.salary_range && (
                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">{formatSalary(job.salary_range)}</span>
                    </div>
                  )}
                  
                  {job.experience_level && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">{job.experience_level}</span>
                    </div>
                  )}

                  {job.employment_type && (
                    <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {job.employment_type}
                    </div>
                  )}
                </div>

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Required Skills</h4>
                    <p className="text-sm text-gray-600">{formatSkills(job.skills)}</p>
                  </div>
                )}

                {/* Description Preview */}
                {job.description && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {job.description.length > 150 
                        ? `${job.description.substring(0, 150)}...` 
                        : job.description}
                    </p>
                  </div>
                )}

                {/* Chat Button */}
                <button
                  onClick={() => handleJobSelect(job)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 group-hover:shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Start Job Chat</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListings;
