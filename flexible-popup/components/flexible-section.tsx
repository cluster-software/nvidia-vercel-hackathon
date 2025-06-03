import { FlexibleComponent } from "./flexible-component";
import { cn } from "../../lib/utils";

import { useResponsiveStyles } from "../../use-responsive-styles";

import { FlexibleSectionProps } from "../../ui";

/**
 * Renders a section with its components
 */
export const FlexibleSection = ({
  section,
  formData,
  formErrors,
  setFormData,
  handleSubmit,
  handleClose,
  isOptinSubmitLoading,
  nodeType,
  handleQuizSubmit,
  overrideBreakpoint,
}: FlexibleSectionProps) => {
  const { id, components, styles, layout } = section;
  const responsiveStyles = useResponsiveStyles(styles, overrideBreakpoint);

  return (
    <div
      id={id}
      data-section-id={id}
      style={responsiveStyles}
      className={cn(
        "flex",
        layout === "vertical" && "flex-col",
        layout === "horizontal" && "flex-row items-center",
        layout === "grid" && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      )}
    >
      {components.map((component) => (
        <FlexibleComponent
          key={component.id}
          component={component}
          formData={formData}
          setFormData={setFormData}
          formErrors={formErrors}
          handleSubmit={handleSubmit}
          handleClose={handleClose}
          isOptinSubmitLoading={isOptinSubmitLoading}
          nodeType={nodeType}
          handleQuizSubmit={handleQuizSubmit}
          overrideBreakpoint={overrideBreakpoint}
        />
      ))}
    </div>
  );
};
