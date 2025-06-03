import React from "react";

export type DeviceView = "desktop" | "mobile";

interface DeviceToggleProps {
  deviceView: DeviceView;
  onDeviceChange: (view: DeviceView) => void;
}

export const DeviceToggle: React.FC<DeviceToggleProps> = ({
  deviceView,
  onDeviceChange,
}) => {
  return (
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
};