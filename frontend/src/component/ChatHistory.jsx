import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  User,
  Bot,
  Calendar,
  Clock,
  Search,
  Download,
  Trash2,
  ArrowLeft,
  Filter,
  Eye,
  FileText,
} from "lucide-react";
import axios from "axios";

const ChatHistory = ({ isOpen, onClose, onLoadSession, onExportHistory, sessionId }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState("all"); // all, recent, long

  useEffect(() => {
    if (isOpen) {
      loadUserSessions();
    }
  }, [isOpen]);

  const loadUserSessions = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Loading user sessions...");
      const response = await axios.get(
        `http://localhost:5000/api/chat-history/user/anonymous/sessions?limit=50`
      );
      console.log("📡 Response status:", response.status);

      if (response.status === 200) {
        const data = await response.data;
        console.log("📊 Sessions data:", data);
        setSessions(data.data || []);
      } else {
        console.error(
          "❌ Failed to load sessions:",
          response.status,
          response.statusText
        );
        // Try to get error details
        try {
          const errorData = await response.json();
          console.error("❌ Error details:", errorData);
        } catch {
          console.error("❌ Could not parse error response");
        }
      }
    } catch (error) {
      console.error("❌ Error loading user sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessionMessages = async (sessionId) => {
    try {
      setIsLoading(true);
      console.log("🔄 Loading session messages for:", sessionId);
      const response = await axios.get(
        `http://localhost:5000/api/chat-history/${sessionId}`
      );

      if (response.status === 200) {
        const data = await response.data;
        console.log("📊 Session messages data:", data);
        setSessionMessages(data.data.messages || []);
        setSelectedSession(sessions.find((s) => s.session_id === sessionId));
      } else {
        console.error("❌ Failed to load session messages:", response.status);
      }
    } catch (error) {
      console.error("❌ Error loading session messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchInSession = async (sessionId, query) => {
    if (!query.trim()) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/chat-history/${sessionId}/search?query=${encodeURIComponent(
          query
        )}`
      );
      if (response.status === 200) {
        const data = await response.data;
        setSessionMessages(data.data.messages || []);
        setSelectedSession(sessions.find((s) => s.session_id === sessionId));
      }
    } catch (error) {
      console.error("❌ Error searching in session:", error);
    }
  };

  const deleteSession = async (sessionId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this chat session? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/chat-history/${sessionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.status === 200) {
        // Remove from sessions list
        setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));

        // Clear selected session if it was deleted
        if (selectedSession?.session_id === sessionId) {
          setSelectedSession(null);
          setSessionMessages([]);
        }

        // Reload sessions
        loadUserSessions();
      }
    } catch (error) {
      console.error("❌ Error deleting session:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSessionPreview = (session) => {
    // This would ideally come from the backend, but for now we'll show basic info
    return `${session.total_messages} messages • ${formatDate(
      session.last_activity
    )}`;
  };

  const filteredSessions = sessions.filter((session) => {
    if (filterType === "recent") {
      const lastActivity = new Date(session.last_activity);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastActivity > weekAgo;
    } else if (filterType === "long") {
      const lastActivity = new Date(session.last_activity);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return lastActivity < monthAgo;
    }
    return true;
  });

  const renderSessionList = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Chat History</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Debug Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800">
            <strong>Debug Info:</strong>
            <div>Current Session ID: {sessionId || 'None'}</div>
            <div>Total Sessions: {sessions.length}</div>
            <div>Selected Session: {selectedSession?.session_id || 'None'}</div>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search in chat history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filterType === "all"
                ? "bg-purple-100 text-purple-700 border border-purple-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("recent")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filterType === "recent"
                ? "bg-purple-100 text-purple-700 border border-purple-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Recent (7 days)
          </button>
          <button
            onClick={() => setFilterType("long")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filterType === "long"
                ? "bg-purple-100 text-purple-700 border border-purple-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Older (1+ month)
          </button>
        </div>
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">No Chat History</h3>
          <p className="text-gray-400">
            Start chatting to see your conversation history here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <div
              key={session.session_id}
              className="bg-white rounded-xl p-4 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => loadSessionMessages(session.session_id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Session {session.session_id.slice(-8)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {getSessionPreview(session)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(session.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(session.last_activity)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{session.total_messages} messages</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExportHistory(session.session_id, "json");
                    }}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Export as JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.session_id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSessionDetail = () => (
    <div className="space-y-4">
      {/* Session Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setSelectedSession(null);
              setSessionMessages([]);
            }}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Session {selectedSession?.session_id?.slice(-8)}
            </h2>
            <p className="text-sm text-gray-500">
              {selectedSession?.total_messages} messages •{" "}
              {formatDate(selectedSession?.created_at)}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onExportHistory(selectedSession.session_id, "json")}
            className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => onLoadSession(selectedSession.session_id)}
            className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Load</span>
          </button>
        </div>
      </div>

      {/* Search in Session */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search in this conversation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              searchInSession(selectedSession.session_id, searchQuery);
            }
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Messages */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sessionMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No messages found</p>
            </div>
          ) : (
            sessionMessages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
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
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {message.text.length > 200
                      ? `${message.text.substring(0, 200)}...`
                      : message.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20">
        <div className="p-6 overflow-y-auto max-h-[90vh]">
          {selectedSession ? renderSessionDetail() : renderSessionList()}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
