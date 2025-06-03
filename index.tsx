import React, { useState, useCallback, useMemo } from "react";
import { OptinFlowNode } from "./types/popup";

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <div
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    className="flex items-center justify-center"
  >
    <svg
      className="w-[35px] h-[35px] hover:bg-[#F0F0F0] hover:cursor-pointer rounded-[8px]"
      viewBox="0 0 35 35"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(7, 7)">
        <path
          fill="#4A4A4A"
          fillRule="evenodd"
          d="M10.177 3H14.83c.535 0 .98 0 1.345.03.38.03.736.098 1.073.27a2.75 2.75 0 0 1 1.202 1.202c.172.337.24.693.27 1.073.03.365.03.81.03 1.345v5.91c0 .535 0 .98-.03 1.345-.03.38-.098.736-.27 1.073a2.75 2.75 0 0 1-1.201 1.202c-.338.172-.694.24-1.074.27-.365.03-.81.03-1.345.03H9.963c-.196 0-.347 0-.483-.013a2.75 2.75 0 0 1-2.467-2.467C7 14.134 7 13.983 7 13.787v-.037a.75.75 0 0 1 1.5 0c0 .25 0 .32.006.373a1.25 1.25 0 0 0 1.121 1.121c.052.005.123.006.373.006h4.8c.572 0 .957 0 1.252-.025.288-.023.425-.065.515-.111a1.25 1.25 0 0 0 .547-.546c.046-.091.088-.228.111-.515.024-.296.025-.68.025-1.253V6.95c0-.572 0-.957-.025-1.252-.023-.288-.065-.425-.111-.515a1.25 1.25 0 0 0-.547-.547l.339-.663-.338.663c-.091-.046-.228-.088-.516-.111-.295-.024-.68-.025-1.252-.025h-4.55c-.5 0-.641.004-.744.024a1.25 1.25 0 0 0-.982.982c-.02.103-.024.243-.024.744a.75.75 0 0 1-1.5 0v-.073c0-.393 0-.696.053-.963a2.75 2.75 0 0 1 2.16-2.161C9.482 3 9.784 3 10.178 3ZM4.56 10.5l.97.97a.75.75 0 0 1-1.061 1.06l-2.25-2.25a.75.75 0 0 1 0-1.06l2.25-2.25a.75.75 0 1 1 1.06 1.06L4.56 9h6.69a.75.75 0 0 1 0 1.5H4.56Z"
          clipRule="evenodd"
        ></path>
      </g>
    </svg>
  </div>
);

const NodeSelector = ({
  nodes,
  selectedNodeId,
  setSelectedNodeId,
}: {
  nodes: OptinFlowNode[] | undefined;
  selectedNodeId: string | null;
  setSelectedNodeId: (nodeId: string) => void;
}) => {
  const [popoverActive, setPopoverActive] = useState(false);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((active) => !active),
    []
  );

  // Memoize the node selection handler
  const handleNodeSelect = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      setPopoverActive(false);
    },
    [setSelectedNodeId]
  );

  // Memoize the formatNodeType function
  const formatNodeType = useCallback((type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  // Memoize the selected node label
  const selectedNodeLabel = useMemo(() => {
    if (!selectedNodeId || !nodes) return "Select Node";

    const selectedNode = nodes.find(
      (node) => node.id.toString() === selectedNodeId
    );
    return selectedNode ? formatNodeType(selectedNode.type) : "Select Node";
  }, [selectedNodeId, nodes, formatNodeType]);

  return (
    <div className="relative">
      <button 
        onClick={togglePopoverActive}
        className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {selectedNodeLabel}
        <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {popoverActive && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {nodes?.map((node) => (
            <button
              key={node.id}
              onClick={() => handleNodeSelect(node.id.toString())}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                selectedNodeId === node.id.toString() ? 'bg-indigo-600 text-white' : 'text-gray-900'
              }`}
            >
              {formatNodeType(node.type)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const DeviceToggle = ({
  deviceView,
  onDeviceChange,
}: {
  deviceView: "desktop" | "mobile";
  onDeviceChange: (view: "desktop" | "mobile") => void;
}) => (
  <div className="flex items-center gap-[5px] rounded-[8px] p-1 bg-[#F1F1F1]">
    <button
      onClick={() => onDeviceChange("desktop")}
      className={`p-1.5 rounded-[8px] ${
        deviceView === "desktop"
          ? "bg-white shadow-sm border border-[#d0d0d0]"
          : "hover:bg-gray-200"
      }`}
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 16 16"
        fill={deviceView === "desktop" ? "#1a1a1a" : "#6b7177"}
      >
        <path
          fillRule="evenodd"
          d="M1.5 4.25a2.75 2.75 0 0 1 2.75-2.75h7.5a2.75 2.75 0 0 1 2.75 2.75v4.5a2.75 2.75 0 0 1-2.75 2.75h-1.25v1.5h.75a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5h.75v-1.5h-1.25a2.75 2.75 0 0 1-2.75-2.75zm5.5 7.25h2v1.5h-2zm-2.75-8.5c-.69 0-1.25.56-1.25 1.25v3.25h10v-3.25c0-.69-.56-1.25-1.25-1.25zm8.725 6c-.116.57-.62 1-1.225 1h-7.5a1.25 1.25 0 0 1-1.225-1z"
        />
      </svg>
    </button>
    <button
      onClick={() => onDeviceChange("mobile")}
      className={`p-1.5 rounded-[8px] ${
        deviceView === "mobile"
          ? "bg-white shadow-sm border border-[#d0d0d0]"
          : "hover:bg-gray-200"
      }`}
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 16 16"
        fill={deviceView === "mobile" ? "#1a1a1a" : "#6b7177"}
      >
        <path d="M5.75 11.75a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75" />
        <path
          fillRule="evenodd"
          d="M2.75 3.75a2.75 2.75 0 0 1 2.75-2.75h5a2.75 2.75 0 0 1 2.75 2.75v8.5a2.75 2.75 0 0 1-2.75 2.75h-5a2.75 2.75 0 0 1-2.75-2.75zm2.75-1.25c-.69 0-1.25.56-1.25 1.25v8.5c0 .69.56 1.25 1.25 1.25h5c.69 0 1.25-.56 1.25-1.25v-8.5c0-.69-.56-1.25-1.25-1.25h-.531c-.112.431-.503.75-.969.75h-2a1 1 0 0 1-.968-.75z"
        />
      </svg>
    </button>
  </div>
);

export { NodeSelector, BackButton, DeviceToggle };
