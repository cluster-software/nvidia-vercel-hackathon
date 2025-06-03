import { useRef } from "react";

import PopupContent from "./components/popup-content";
import PopupOverlay from "./components/popup-overlay";

import { usePopupEffects } from "./hooks/use-popup-effects";
import { useFormHandling } from "./hooks/use-form-handling";

import { FlexiblePopupProps } from "../ui";

/**
 * FlexiblePopup - A standalone component that renders content based on the flexible_content structure
 */
const FlexiblePopup = ({
  node,
  isOpen = true,
  onClose,
  optinSubmit,
  discountPrimarySubmit,
  discountSecondarySubmit,
  sessionId,
  isOptinSubmitLoading,
  isPreviewMode,
  isMobileDevice,
  overrideBreakpoint,
}: FlexiblePopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const { flexible_content } = node || {};

  // Setup form handling
  const { formData, formErrors, setFormData, handleSubmit, handleQuizSubmit } =
    useFormHandling({
      node,
      flexible_content,
      sessionId,
      optinSubmit,
      discountPrimarySubmit,
      discountSecondarySubmit,
      onClose,
    });

  // Setup side effects (click outside, ESC key)
  usePopupEffects({
    isOpen,
    onClose,
    popupRef,
  });

  // Return null for invalid states
  if (!isOpen || !node) return null;
  if (!flexible_content) {
    console.warn("FlexiblePopup: Node has no flexible_content property");
    return null;
  }

  // In preview mode, render with overlay
  if (isPreviewMode) {
    return (
      <PopupOverlay onClose={onClose}>
        <PopupContent
          ref={popupRef}
          node={node}
          flexible_content={flexible_content}
          formData={formData}
          formErrors={formErrors}
          setFormData={setFormData}
          onClose={onClose}
          handleSubmit={handleSubmit}
          handleQuizSubmit={handleQuizSubmit}
          isOptinSubmitLoading={isOptinSubmitLoading || false}
          isPreviewMode={isPreviewMode}
        />
      </PopupOverlay>
    );
  }

  // In editor mode, only render content (no overlay)
  if (!isMobileDevice) {
    return (
      <PopupContent
        ref={popupRef}
        node={node}
        flexible_content={flexible_content}
        formData={formData}
        formErrors={formErrors}
        setFormData={setFormData}
        onClose={onClose}
        handleSubmit={handleSubmit}
        handleQuizSubmit={handleQuizSubmit}
        isOptinSubmitLoading={isOptinSubmitLoading || false}
        isPreviewMode={false}
        className="h-full w-full"
        overrideBreakpoint={overrideBreakpoint}
      />
    );
  }

  return null;
};

export default FlexiblePopup;
