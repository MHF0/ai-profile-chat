import React from "react";

const TypingIndicator = () => (
  <div className="flex space-x-2">
    <div className="w-3 h-3 rounded-full bg-purple-200 animate-bounce"></div>
    <div className="w-3 h-3 rounded-full bg-purple-200 animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-3 h-3 rounded-full bg-purple-200 animate-bounce [animation-delay:-0.15s]"></div>
  </div>
);

export default TypingIndicator;
