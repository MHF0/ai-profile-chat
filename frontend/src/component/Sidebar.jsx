import React from "react";
import { X, Users, Briefcase, TrendingUp, Zap, MessageCircle } from "lucide-react";

const Sidebar = ({ isOpen, onClose, onQuickAction, suggestions, dataOverview }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 lg:translate-x-0 lg:relative lg:z-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Data Overview */}
            {dataOverview && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                  Data Overview
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Candidates:</span>
                    <span className="font-semibold text-gray-900">{dataOverview.profiles_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Jobs:</span>
                    <span className="font-semibold text-gray-900">{dataOverview.jobs_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">AI Summaries:</span>
                    <span className="font-semibold text-gray-900">{dataOverview.ai_summaries_count || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-purple-600" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                {suggestions.slice(0, 6).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onQuickAction(suggestion);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 hover:text-gray-900"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                Navigation
              </h3>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-gray-50 text-sm text-gray-600">
                  <div className="font-medium">Chat</div>
                  <div className="text-xs text-gray-500">Ask questions and get AI responses</div>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 text-sm text-gray-600">
                  <div className="font-medium">Insights</div>
                  <div className="text-xs text-gray-500">View data analytics and trends</div>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 text-sm text-gray-600">
                  <div className="font-medium">Search</div>
                  <div className="text-xs text-gray-500">Find specific candidates and jobs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
