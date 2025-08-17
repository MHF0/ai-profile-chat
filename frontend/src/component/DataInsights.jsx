import React from 'react';
import { BarChart3, Users, Briefcase, TrendingUp, MapPin, Code, Building2, Award } from 'lucide-react';

const DataInsights = ({ statistics, dataOverview, searchableData }) => {
  const formatNumber = (value) => {
    if (!value) return '0';
    return value.toLocaleString();
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 bg-clip-text text-transparent mb-4">
            Data Insights & Analytics
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive overview of your recruitment data and trends with intelligent insights
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Total Candidates</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {formatNumber(dataOverview.profiles_count)}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Total Jobs</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                  {formatNumber(dataOverview.jobs_count)}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">AI Summaries</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                  {formatNumber(dataOverview.ai_summaries_count)}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Avg Experience</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                  {statistics.average_experience?.toFixed(1) || 0} years
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Skills Distribution */}
        {statistics.skills_distribution && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
              Top Skills Distribution
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.skills_distribution.slice(0, 12).map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group">
                  <span className="font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">{skill.skill}</span>
                  <span className="text-sm text-gray-500 bg-white px-3 py-2 rounded-full font-medium border border-gray-200 group-hover:border-blue-200 transition-colors">
                    {skill.count} candidates
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Distribution */}
        {statistics.location_distribution && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              Location Distribution
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.location_distribution.slice(0, 9).map((location, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-green-200 transition-all duration-300 hover:shadow-lg group">
                  <span className="font-semibold text-gray-700 group-hover:text-green-700 transition-colors">{location.location}</span>
                  <span className="text-sm text-gray-500 bg-white px-3 py-2 rounded-full font-medium border border-gray-200 group-hover:border-green-200 transition-colors">
                    {location.count} candidates
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Industry Distribution */}
        {statistics.industry_distribution && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              Industry Distribution
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.industry_distribution.slice(0, 9).map((industry, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-lg group">
                  <span className="font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">{industry.industry}</span>
                  <span className="text-sm text-gray-500 bg-white px-3 py-2 rounded-full font-medium border border-gray-200 group-hover:border-purple-200 transition-colors">
                    {industry.count} candidates
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seniority Distribution */}
        {statistics.seniority_distribution && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              Seniority Distribution
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.seniority_distribution.map((seniority, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-orange-200 transition-all duration-300 hover:shadow-lg group">
                  <span className="font-semibold text-gray-700 group-hover:text-orange-700 transition-colors">{seniority.seniority}</span>
                  <span className="text-sm text-gray-500 bg-white px-3 py-2 rounded-full font-medium border border-gray-200 group-hover:border-orange-200 transition-colors">
                    {seniority.count} candidates
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Searchable Data Overview */}
        {searchableData && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              Available Search Data
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-600" />
                  Skills
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {searchableData.skills?.length || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">unique skills available for search</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Locations
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {searchableData.locations?.length || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">different locations available</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Industries
                </h3>
                <p className="text-2xl font-bold text-purple-600">
                  {searchableData.industries?.length || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">industry categories available</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                  Companies
                </h3>
                <p className="text-2xl font-bold text-orange-600">
                  {searchableData.companies?.length || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">company names available</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataInsights;
