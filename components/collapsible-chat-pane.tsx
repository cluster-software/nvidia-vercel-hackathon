import React, { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, FileText, Send, RotateCcw, MousePointer } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CollapsibleChatPaneProps {
  jsonData?: any;
  className?: string;
  jsonPath?: string;
  onJsonUpdate?: (newJsonData: any) => void;
  onInspectorToggle?: (isActive: boolean) => void;
  selectedComponentPath?: string;
  onComponentSelect?: (path: string | null) => void;
}

export const CollapsibleChatPane: React.FC<CollapsibleChatPaneProps> = ({
  jsonData,
  className = "",
  jsonPath = "data/sample-flexible-content.json",
  onJsonUpdate,
  onInspectorToggle,
  selectedComponentPath,
  onComponentSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInspectorActive, setIsInspectorActive] = useState(false);

  // Load conversation from localStorage on component mount
  useEffect(() => {
    const savedConversation = localStorage.getItem('popup-creator-conversation');
    if (savedConversation) {
      try {
        const parsedMessages = JSON.parse(savedConversation);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading conversation from localStorage:', error);
      }
    }
  }, []);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const callPopupCreatorAPI = useCallback(async (conversationHistory: Message[], currentJson: any, componentPath: string | null) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const response = await fetch(`${baseUrl}/v1/popup-creator/shortest-hacks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_json: currentJson,
        messages: conversationHistory,
        selected_component_path: componentPath,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setIsLoading(true);

    // Add user message to conversation
    const newUserMessage: Message = { role: 'user', content: userMessage };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    try {
      // Call API
      const response = await callPopupCreatorAPI(updatedMessages, jsonData, selectedComponentPath || null);
      
      // Add assistant response to conversation
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: response.ai_message || 'No response from assistant'
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update JSON data if provided
      if (response.modified_json && onJsonUpdate) {
        onJsonUpdate(response.modified_json);
      }

      // Save conversation to localStorage
      const finalMessages = [...updatedMessages, assistantMessage];
      localStorage.setItem('popup-creator-conversation', JSON.stringify(finalMessages));

    } catch (error) {
      console.error('Error calling API:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [chatInput, messages, isLoading, callPopupCreatorAPI, onJsonUpdate, jsonData, selectedComponentPath]);

  const handleReset = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('popup-creator-conversation');
  }, []);

  const handleInspectorToggle = useCallback(() => {
    const newState = !isInspectorActive;
    setIsInspectorActive(newState);
    onInspectorToggle?.(newState);
    if (!newState) {
      // If turning off inspector, clear any selection
      onComponentSelect?.(null);
    }
  }, [isInspectorActive, onInspectorToggle, onComponentSelect]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      data-chat-pane
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
        <div className="flex-1 flex flex-col">
          {/* JSON Path Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">JSON Source</h3>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <code className="text-xs text-gray-700 break-all">{jsonPath}</code>
            </div>
          </div>

          {/* Inspector Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MousePointer size={16} className="text-gray-600" />
                <h3 className="text-sm font-medium text-gray-900">Inspector</h3>
              </div>
              <button
                onClick={handleInspectorToggle}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors ${
                  isInspectorActive
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <MousePointer size={12} />
                {isInspectorActive ? 'Active' : 'Inactive'}
              </button>
            </div>
            {selectedComponentPath && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md">
                <div className="text-xs font-medium text-blue-900 mb-1">Selected:</div>
                <code className="text-xs text-blue-700">{selectedComponentPath}</code>
              </div>
            )}
          </div>

          {/* Chat Section */}
          <div className="flex-1 flex flex-col p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Chat</h3>
              {messages.length > 0 && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Reset conversation"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              )}
            </div>
            
            {/* Chat messages area */}
            <div className="flex-1 mb-4 overflow-y-auto max-h-64">
              {messages.length === 0 ? (
                <div className="text-xs text-gray-500 italic">No messages yet...</div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-md text-xs ${
                        message.role === 'user'
                          ? 'bg-blue-100 text-blue-900 ml-4'
                          : 'bg-gray-100 text-gray-900 mr-4'
                      }`}
                    >
                      <div className="font-medium mb-1 capitalize">
                        {message.role}
                      </div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="bg-gray-100 text-gray-900 mr-4 p-2 rounded-md text-xs">
                      <div className="font-medium mb-1">Assistant</div>
                      <div className="flex items-center gap-1">
                        <div className="animate-pulse">Thinking...</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat input */}
            <div className="relative">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isLoading ? "Processing..." : "Type your message..."}
                disabled={isLoading}
                className="w-full p-3 pr-12 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:text-gray-500"
                rows={3}
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isLoading}
                className="absolute bottom-3 right-3 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};