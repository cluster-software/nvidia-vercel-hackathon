import { useEffect } from "react";

import { PopupHeaderProps } from "../../ui";
import { useState } from "react";

/**
 * Renders a header with a close button
 */
const PopupHeader = ({
  onClose,
  closeIconPosition = "right",
  iconColor = "#FFFFFF",
  delay = 1000,
  fadeStyle = {
    opacity: 0.6,
    transition: "opacity 0.5s ease-in-out",
  },
}: PopupHeaderProps) => {
  const [isVisible, setIsVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  return (
    <div
      className="absolute w-full flex items-center z-[150] pb-2 pt-[5px] md:rounded-t-[10px] md:pt-[5px]"
      style={{
        justifyContent:
          closeIconPosition === "left" ? "flex-start" : "flex-end",
      }}
    >
      <button
        type="button"
        style={{
          ...fadeStyle,
          marginLeft: closeIconPosition === "left" ? "16px" : "0",
          marginRight: closeIconPosition === "left" ? "0" : "16px",
          marginTop: "12px",
          opacity: isVisible ? fadeStyle.opacity || 1 : 0,
          pointerEvents: isVisible ? "auto" : "none",
        }}
        className="hover:scale-125"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={iconColor}
          stroke={iconColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
};

export default PopupHeader;
