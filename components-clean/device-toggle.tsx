import React from "react";
import { Monitor, Smartphone } from "lucide-react";

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
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onDeviceChange("desktop")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          deviceView === "desktop"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Monitor size={16} />
        Desktop
      </button>
      <button
        onClick={() => onDeviceChange("mobile")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          deviceView === "mobile"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Smartphone size={16} />
        Mobile
      </button>
    </div>
  );
};