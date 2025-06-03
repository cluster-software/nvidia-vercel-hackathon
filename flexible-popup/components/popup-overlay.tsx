import React from "react";

interface PopupOverlayProps {
  onClose: () => void;
  children: React.ReactNode;
}

const PopupOverlay = ({ onClose, children }: PopupOverlayProps) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "none",
        height: "100dvh",
        zIndex: "var(--cluster-z-index, 9999999)",
        pointerEvents: "auto",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
        e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
};

export default PopupOverlay;
