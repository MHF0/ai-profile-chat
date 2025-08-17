import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Search, BarChart3, MessageCircle, History, Download, Trash2 } from "lucide-react";
import Header from "./component/Header";
import Sidebar from "./component/Sidebar";
import MessageBubble from "./component/MessageBubble";
import DataInsights from "./component/DataInsights";
import ProfileSearch from "./component/ProfileSearch";
import QuickActions from "./component/QuickActions";
import ChatHistory from "./component/ChatHistory";

const API_BASE_URL = "http://localhost:5000/api";

const AIRecruitmentChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataOverview, setDataOverview] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [searchableData, setSearchableData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Generate or retrieve session ID on component mount
  useEffect(() => {
    // Try to get existing session ID from localStorage
    const existingSessionId = localStorage.getItem('chat_session_id');
    
    console.log('🔍 localStorage check:', {
      existingSessionId,
      hasLocalStorage: !!localStorage.getItem('chat_session_id')
    });
    
    // TEMPORARY: Use the known existing session ID for testing
    const knownSessionId = 'session_1755433253169_gge7yjpap';
    
    if (existingSessionId) {
      // Use existing session ID from localStorage
      setSessionId(existingSessionId);
      console.log(`🆔 Using existing chat session: ${existingSessionId}`);
    } else {
      // Use the known session ID from database
      localStorage.setItem('chat_session_id', knownSessionId);
      setSessionId(knownSessionId);
      console.log(`🆔 Using known session ID: ${knownSessionId}`);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    loadSuggestions();
  }, []);

  // Load chat history when session changes
  useEffect(() => {
    if (sessionId) {
      loadChatHistory();
    }
  }, [sessionId]);

  const generateSessionId = () => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const loadInitialData = async () => {
    try {
      const [overviewRes, statsRes, searchableRes] = await Promise.all([
        fetch(`${API_BASE_URL}/data/overview`),
        fetch(`${API_BASE_URL}/data/statistics`),
        fetch(`${API_BASE_URL}/data/searchable`)
      ]);

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setDataOverview(overviewData.data);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStatistics(statsData.data);
      }

      if (searchableRes.ok) {
        const searchableData = await searchableRes.json();
        setSearchableData(searchableData.data);
      }
    } catch (error) {
      console.error("❌ Error loading initial data:", error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/suggestions`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("❌ Error loading suggestions:", error);
    }
  };

  const loadChatHistory = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat-history/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data.messages && data.data.messages.length > 0) {
          setMessages(data.data.messages);
          console.log(`📚 Loaded ${data.data.messages.length} messages from history`);
        }
      }
    } catch (error) {
      console.error("❌ Error loading chat history:", error);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Use the new AI analysis endpoint with session ID
      const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: inputValue,
          analysis_type: "general_query",
          session_id: sessionId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: data.data.response,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error("Failed to get AI response");
      }
    } catch (error) {
      console.error("❌ Error getting AI response:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (suggestion) => {
    setInputValue(suggestion);
    setCurrentView("chat");
  };

  const handleSearch = async (query, filters = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/search/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, filters, include_analysis: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data);
        setSearchQuery(query);
        setCurrentView("search");
      }
    } catch (error) {
      console.error("❌ Search error:", error);
    }
  };

  const exportChatHistory = async (format = 'json') => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat-history/${sessionId}/export?format=${format}`);
      if (response.ok) {
        if (format === 'text') {
          const text = await response.text();
          const blob = new Blob([text], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `chat-history-${sessionId}.txt`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `chat-history-${sessionId}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error("❌ Error exporting chat history:", error);
    }
  };

  const clearChatHistory = async () => {
    if (!sessionId || !window.confirm('Are you sure you want to clear this chat session?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat-history/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMessages([]);
        const newSessionId = generateSessionId();
        localStorage.setItem('chat_session_id', newSessionId);
        setSessionId(newSessionId);
        console.log(`🆔 New chat session after clear: ${newSessionId}`);
      }
    } catch (error) {
      console.error("❌ Error clearing chat history:", error);
    }
  };

  const handleLoadSession = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat-history/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data.messages && data.data.messages.length > 0) {
          setMessages(data.data.messages);
          localStorage.setItem('chat_session_id', sessionId);
          setSessionId(sessionId);
          setShowHistory(false);
          setCurrentView("chat");
          console.log(`📚 Loaded session ${sessionId} with ${data.data.messages.length} messages`);
        }
      }
    } catch (error) {
      console.error("❌ Error loading session:", error);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "chat":
        return (
          <div className="flex-1 flex flex-col h-full">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">AI Recruitment Chat</h2>
                    <p className="text-sm text-gray-500">Ask me anything about recruitment or just chat!</p>
                  </div>
                </div>
                
                {/* Chat History Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowHistory(true)}
                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Chat History"
                  >
                    <History className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => exportChatHistory('json')}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Export as JSON"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={clearChatHistory}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Clear Chat"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50"
              style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: '#CBD5E1 #F1F5F9'
              }}
            >
              <div className="min-h-full p-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
                      <Bot className="w-10 h-10 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-gray-700">Welcome to AI Recruitment Chat!</h3>
                    <p className="text-lg text-gray-400 max-w-md leading-relaxed">
                      I'm here to help you with recruitment insights, candidate analysis, or just friendly conversation. 
                      What would you like to know?
                    </p>
                    
                    {/* Quick Start Suggestions */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                      {suggestions.slice(0, 6).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(suggestion)}
                          className="p-4 text-left bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 hover:-translate-y-1 text-sm text-gray-700 hover:text-purple-700"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 max-w-4xl mx-auto">
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-lg max-w-md">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">AI Recruiter</p>
                              <p className="text-xs text-gray-500">Typing...</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Form */}
            <div className="bg-white border-t border-gray-200 p-6 shadow-lg">
              <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask me anything about recruitment or just chat..."
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder-gray-400 transition-all duration-200"
                      disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Send className="w-5 h-5" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
                
                {/* Input Tips */}
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-400">
                    💡 Try: "Show me top candidates" • "Find Python developers" • "How are you?"
                  </p>
                </div>
              </form>
            </div>
          </div>
        );

      case "insights":
        return (
          <DataInsights
            dataOverview={dataOverview}
            statistics={statistics}
            searchableData={searchableData}
          />
        );

      case "search":
        return (
          <ProfileSearch
            searchResults={searchResults}
            searchQuery={searchQuery}
            onSearch={handleSearch}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      <div className="flex h-screen pt-16">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onQuickAction={handleQuickAction}
          suggestions={suggestions}
          dataOverview={dataOverview}
        />
        
        <main className="flex-1 flex flex-col">
          {renderCurrentView()}
        </main>
        
        <QuickActions
          suggestions={suggestions}
          onAction={handleQuickAction}
          onSearch={handleSearch}
          searchableData={searchableData}
        />
      </div>

      {/* Chat History Modal */}
      <ChatHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onLoadSession={handleLoadSession}
        onExportHistory={exportChatHistory}
        sessionId={sessionId}
      />
    </div>
  );
};

export default AIRecruitmentChat;
