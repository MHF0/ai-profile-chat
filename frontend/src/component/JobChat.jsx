import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, MessageCircle, ArrowLeft, Download, Trash2, Briefcase, Building } from "lucide-react";
import axios from "axios";

const JobChat = ({ job, isOpen, onClose, onExportHistory }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    if (isOpen && job) {
      initializeJobChat();
    }
  }, [isOpen, job]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeJobChat = async () => {
    try {
      // Create a new job-specific chat session
      const response = await axios.post(`${API_BASE_URL}/job-chat/sessions`, {
        job_id: job.uuid || job.id,
        user_id: 'anonymous'
      });

      if (response.data.success) {
        setSessionId(response.data.data.session_id);
        console.log(`🆔 Created job chat session: ${response.data.data.session_id}`);
        
        // Load job-specific suggestions
        loadJobSuggestions();
      }
    } catch (error) {
      console.error("❌ Error initializing job chat:", error);
    }
  };

  const loadJobSuggestions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/job-chat/${job.uuid || job.id}/suggestions`);
      if (response.data.success) {
        setSuggestions(response.data.data.suggestions);
      }
    } catch (error) {
      console.error("❌ Error loading job suggestions:", error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !sessionId) return;

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
      const response = await axios.post(`${API_BASE_URL}/job-chat/${job.uuid || job.id}/chat`, {
        session_id: sessionId,
        message: { text: inputValue },
        user_id: 'anonymous'
      });

      if (response.data.success) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: response.data.data.response,
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

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear this chat?')) {
      setMessages([]);
      initializeJobChat();
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Briefcase className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">{job.title}</h2>
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <Building className="w-4 h-4" />
                    <span>{job.company}</span>
                    {job.location && (
                      <>
                        <span>•</span>
                        <span>{job.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={clearChat}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                title="Clear Chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => onExportHistory(sessionId, "json")}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                title="Export Chat"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col h-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-96">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Job-Specific AI Assistant</h3>
                <p className="text-gray-400 mb-6">
                  I'm here to help you with questions about the {job.title} position at {job.company}.
                </p>
                
                {/* Job-specific suggestions */}
                {suggestions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="p-3 text-left bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg transition-all duration-200 text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl ${
                      message.isUser
                        ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {message.isUser ? (
                        <User className="w-4 h-4 text-white/80" />
                      ) : (
                        <Bot className="w-4 h-4 text-purple-500" />
                      )}
                      <span className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div 
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: message.text.replace(/\n/g, '<br>') 
                      }}
                    />
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Ask me about the ${job.title} position...`}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobChat;
