import React, { useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

interface CollapsibleChatPaneProps {
  jsonData?: any;
  className?: string;
}

export const CollapsibleChatPane: React.FC<CollapsibleChatPaneProps> = ({
  jsonData,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`bg-white border-l border-gray-200 transition-all duration-300 flex flex-col ${
        isExpanded ? "w-80" : "w-12"
      } ${className}`}
    >
      {/* Toggle Button */}
      <div className="border-b border-gray-200 p-3">
        <button
          onClick={toggleExpanded}
          className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-colors"
          title={isExpanded ? "Collapse panel" : "Expand panel"}
        >
          {isExpanded ? (
            <ChevronRight size={20} className="text-gray-600" />
          ) : (
            <ChevronLeft size={20} className="text-gray-600" />
          )}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">JSON Preview</h3>
          </div>
          
          {jsonData ? (
            <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto bg-gray-50 p-3 rounded-md">
              {JSON.stringify(jsonData, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-gray-500">No JSON data provided</p>
          )}
        </div>
      )}
    </div>
  );
};