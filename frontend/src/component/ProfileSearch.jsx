import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, User, MapPin, Briefcase, Star, Zap, Eye, Code } from 'lucide-react';

const ProfileSearch = ({ searchResults, searchQuery, onSearch }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery || '');

  const formatExperience = (years) => {
    if (!years) return 'Not specified';
    return `${years} years`;
  };

  const getFitColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100 border-green-200';
    if (percentage >= 70) return 'text-blue-600 bg-blue-100 border-blue-200';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-gray-600 bg-gray-100 border-gray-200';
  };

  const handleAnalyzeProfile = (profileId) => {
    // For now, just log the profile ID - this could be enhanced later
    console.log('Analyzing profile:', profileId);
    // You could implement profile analysis here or navigate to chat view
  };

  const renderProfileCard = (profile) => (
    <div 
      key={profile.uuid}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 cursor-pointer"
      onClick={() => setSelectedProfile(profile)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{profile.name}</h3>
          <p className="text-gray-600 mb-3">{profile.current_role || 'Role not specified'}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{profile.location?.name || 'Location not specified'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-green-600" />
              <span>{formatExperience(profile.experience_years)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getFitColor(profile.fit_percentage)}`}>
              {profile.fit_percentage}% fit
            </span>
            {profile.industry && (
              <span className="px-3 py-1 rounded-full text-sm font-semibold text-purple-600 bg-purple-100 border border-purple-200">
                {profile.industry}
              </span>
            )}
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2 font-semibold">Top Skills:</p>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.slice(0, 6).map((skill, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
                >
                  {skill}
                </span>
              ))}
              {profile.skills?.length > 6 && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
                  +{profile.skills.length - 6} more
                </span>
              )}
            </div>
          </div>

          {profile.current_company?.name && (
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Company:</span> {profile.current_company.name}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAnalyzeProfile(profile.uuid);
            }}
            className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-colors duration-200"
            title="Analyze Profile"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderProfileDetail = (profile) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
        <button
          onClick={() => setSelectedProfile(null)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <span className="font-medium">{profile.current_role || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Experience:</span>
              <span className="font-medium">{formatExperience(profile.experience_years)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{profile.location?.name || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Industry:</span>
              <span className="font-medium">{profile.industry || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Company:</span>
              <span className="font-medium">{profile.current_company?.name || 'Not specified'}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Fit</h3>
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getFitColor(profile.fit_percentage)}`}>
              {profile.fit_percentage}% fit
            </span>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-2 font-semibold">Skills ({profile.skills?.length || 0}):</p>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((skill, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {profile.ai_summary && profile.ai_summary !== "No AI summary available" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Summary</h3>
          <p className="text-gray-700 leading-relaxed">{profile.ai_summary}</p>
        </div>
      )}
    </div>
  );

  if (!searchResults) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold mb-2">Search Candidates</h3>
          <p className="text-gray-400 mb-6">Use the search form to find candidates</p>
          
          <div className="max-w-md w-full">
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search candidates..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => onSearch(searchInput)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedProfile) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        {renderProfileDetail(selectedProfile)}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Search Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Results</h2>
        <p className="text-gray-600">
          Found {searchResults.results?.length || 0} candidates for "{searchQuery}"
        </p>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        {searchResults.results?.map((profile) => renderProfileCard(profile))}
      </div>

      {searchResults.results?.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
          <p className="text-gray-400">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default ProfileSearch;
