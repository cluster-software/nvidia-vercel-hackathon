import { useEffect, RefObject } from "react";

interface UsePopupEffectsProps {
  isOpen: boolean;
  onClose: () => void;
  popupRef: RefObject<HTMLDivElement>;
}

export const usePopupEffects = ({
  isOpen,
  onClose,
  popupRef,
}: UsePopupEffectsProps) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.classList.add("no-scroll-body");
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    } else {
      document.body.classList.remove("no-scroll-body");
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.body.classList.remove("no-scroll-body");
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose, popupRef]);
};
