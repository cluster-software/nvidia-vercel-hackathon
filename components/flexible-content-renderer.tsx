"use client";

import React, { useState } from "react";
import { DeviceToggle, DeviceView } from "./device-toggle";
import { CollapsibleChatPane } from "./collapsible-chat-pane";
import { InspectorOverlay } from "./inspector-overlay";
import FlexiblePopup from "../flexible-popup";
import { FlexibleContent, Breakpoint } from "../ui";
import { OptinFlowNode } from "../types/popup";

interface FlexibleContentRendererProps {
  flexibleContent: FlexibleContent;
  title?: string;
  className?: string;
}

export const FlexibleContentRenderer: React.FC<FlexibleContentRendererProps> = ({
  flexibleContent: initialFlexibleContent,
  title = "Flexible Content Preview",
  className = "",
}) => {
  const [deviceView, setDeviceView] = useState<DeviceView>("desktop");
  const [flexibleContent, setFlexibleContent] = useState<FlexibleContent>(initialFlexibleContent);
  const [isInspectorActive, setIsInspectorActive] = useState(false);
  const [selectedComponentPath, setSelectedComponentPath] = useState<string | null>(null);
  const [hoveredComponentPath, setHoveredComponentPath] = useState<string | null>(null);

  // Convert device view to breakpoint override
  const overrideBreakpoint: Breakpoint | undefined =
    deviceView === "mobile" ? Breakpoint.MAX_SM : undefined;

  // Create a mock node structure for FlexiblePopup
  const mockNode: OptinFlowNode = {
    id: 1,
    org_id: "preview",
    type: "preview",
    flexible_content: flexibleContent,
  };

  // No-op handlers for preview mode
  const noOpSubmit = () => {};
  const noOpClose = () => {};

  // Handler for JSON updates from chat
  const handleJsonUpdate = (newJsonData: any) => {
    setFlexibleContent(newJsonData);
  };

  // Inspector handlers
  const handleInspectorToggle = (isActive: boolean) => {
    setIsInspectorActive(isActive);
    if (!isActive) {
      setSelectedComponentPath(null);
      setHoveredComponentPath(null);
    }
  };

  const handleComponentSelect = (path: string | null) => {
    setSelectedComponentPath(path);
  };

  return (
    <div className={`h-screen flex flex-col bg-gray-50 ${className}`}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <DeviceToggle
            deviceView={deviceView}
            onDeviceChange={setDeviceView}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Preview Area */}
        <div className="flex-1 py-[12px] px-[6px] h-full relative">
          <div
            data-preview-area
            className={`bg-white rounded-lg mx-auto transition-all duration-300 ease-in-out ${
              deviceView === "mobile"
                ? "w-[390px] h-full"
                : "w-[calc(100%-48px)] h-[calc(100vh-96px)]"
            }`}
          >
            <div className="h-full w-full relative">
              <FlexiblePopup
                node={mockNode}
                isOpen={true}
                onClose={noOpClose}
                optinSubmit={noOpSubmit}
                discountPrimarySubmit={noOpSubmit}
                discountSecondarySubmit={noOpSubmit}
                sessionId="preview"
                isOptinSubmitLoading={false}
                isPreviewMode={false}
                isMobileDevice={false}
                overrideBreakpoint={overrideBreakpoint}
              />
            </div>
          </div>
        </div>

        {/* Collapsible Chat Pane */}
        <CollapsibleChatPane 
          jsonData={flexibleContent} 
          onJsonUpdate={handleJsonUpdate}
          onInspectorToggle={handleInspectorToggle}
          selectedComponentPath={selectedComponentPath}
          onComponentSelect={handleComponentSelect}
        />
      </div>

      {/* Inspector Overlay */}
      <InspectorOverlay
        isActive={isInspectorActive}
        onComponentSelect={handleComponentSelect}
        selectedComponentPath={selectedComponentPath}
      />
    </div>
  );
};