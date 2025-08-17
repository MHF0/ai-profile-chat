import React from "react";
import { Menu, MessageCircle, BarChart3, Search, Bot } from "lucide-react";

const Header = ({ currentView, onViewChange, onMenuClick }) => {
  const views = [
    { id: "chat", label: "Chat", icon: MessageCircle, color: "text-purple-600" },
    { id: "insights", label: "Insights", icon: BarChart3, color: "text-blue-600" },
    { id: "search", label: "Search", icon: Search, color: "text-green-600" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Recruitment Chat
                </h1>
                <p className="text-xs text-gray-500">Powered by GPT-4</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = currentView === view.id;
              
              return (
                <button
                  key={view.id}
                  onClick={() => onViewChange(view.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{view.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right side - could add user info, notifications, etc. */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>AI Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
