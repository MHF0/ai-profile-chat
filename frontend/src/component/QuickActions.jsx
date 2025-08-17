import React, { useState } from "react";
import { Search, Filter, Zap, Send } from "lucide-react";

const QuickActions = ({ suggestions, onAction, onSearch, searchableData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const filters = {};
      if (selectedSkills.length > 0) filters.skills = selectedSkills;
      if (selectedLocation) filters.location = selectedLocation;
      onSearch(searchQuery, filters);
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <div className="hidden xl:block w-80 bg-white border-l border-gray-200 p-6">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-purple-600" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            {suggestions.slice(0, 8).map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onAction(suggestion)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 hover:text-gray-900"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Search */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Search className="w-4 h-4 mr-2 text-blue-600" />
            Advanced Search
          </h3>
          
          <div className="space-y-4">
            {/* Search Input */}
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Skills Filter */}
            {searchableData?.skills && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {searchableData.skills.slice(0, 10).map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                        selectedSkills.includes(skill)
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Location Filter */}
            {searchableData?.locations && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Any location</option>
                  {searchableData.locations.slice(0, 10).map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
