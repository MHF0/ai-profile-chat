import React from "react";
import { User, Bot, MapPin, Clock, Briefcase } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MessageBubble = ({ message }) => {
  const isUser = message.isUser;
  const metadata = message.metadata || {};

  const renderProfiles = (profiles) => (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {profiles.map((profile) => (
        <div
          key={profile.id}
          className="p-4 rounded-xl bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-900">{profile.name}</h4>
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
              {profile.fit_percentage}% Fit
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3">{profile.summary}</p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              {profile.location || "Unknown"}
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              {profile.experience_years} years experience
            </div>
            <div className="flex items-center text-gray-600">
              <Briefcase className="w-4 h-4 mr-2" />
              {profile.experience_match
                ? "Matches required experience"
                : "Below required experience"}
            </div>
          </div>

          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Key Skills</p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Matching Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.skills_match.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`mb-6 last:mb-0 flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-4xl px-6 py-4 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
          isUser
            ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white"
            : "bg-white border border-gray-200 hover:border-gray-300"
        }`}
      >
        {/* Message Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? "bg-white/20 text-white/90" 
              : "bg-gradient-to-r from-purple-500 to-blue-600 text-white"
          }`}>
            {isUser ? (
              <User className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {isUser ? "You" : "AI Recruiter"}
            </p>
            <p className="text-xs opacity-70">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Message Content */}
        {isUser ? (
          <p className="text-base leading-relaxed whitespace-pre-wrap">{message.text}</p>
        ) : (
          <div className={`prose prose-sm max-w-none ${
            isUser ? 'text-white' : 'text-gray-700'
          }`}>
            {message.text ? (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom styling for markdown elements
                  h1: ({...props}) => <h1 className="text-2xl font-bold mb-4 text-gray-900" {...props} />,
                  h2: ({...props}) => <h2 className="text-xl font-bold mb-3 text-gray-800" {...props} />,
                  h3: ({...props}) => <h3 className="text-lg font-semibold mb-2 text-gray-800" {...props} />,
                  h4: ({...props}) => <h4 className="text-base font-semibold mb-2 text-gray-700" {...props} />,
                  p: ({...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                  ul: ({...props}) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                  li: ({...props}) => <li className="text-gray-700" {...props} />,
                  strong: ({...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                  em: ({...props}) => <em className="italic text-gray-800" {...props} />,
                  code: ({inline, ...props}) => 
                    inline ? (
                      <code className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono" {...props} />
                    ) : (
                      <code className="block p-3 bg-gray-100 text-gray-800 rounded text-sm font-mono overflow-x-auto" {...props} />
                    ),
                  blockquote: ({...props}) => (
                    <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-700 mb-3" {...props} />
                  ),
                  table: ({...props}) => (
                    <div className="overflow-x-auto mb-4">
                      <table className="min-w-full border border-gray-300 rounded-lg" {...props} />
                    </div>
                  ),
                  th: ({...props}) => (
                    <th className="px-4 py-2 bg-gray-100 border border-gray-300 text-left font-semibold text-gray-700" {...props} />
                  ),
                  td: ({...props}) => (
                    <td className="px-4 py-2 border border-gray-300 text-gray-700" {...props} />
                  ),
                  tr: ({...props}) => (
                    <tr className="hover:bg-gray-50" {...props} />
                  ),
                }}
              >
                {message.text}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-500 italic">No message content</p>
            )}
          </div>
        )}

        {/* Profile Metadata */}
        {metadata.profiles && renderProfiles(metadata.profiles)}
      </div>
    </div>
  );
};

export default MessageBubble;
