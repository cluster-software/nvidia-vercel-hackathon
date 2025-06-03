import { InputProperties } from "../../ui";

export const validateFormData = (
  formData: Record<string, string>,
  flexible_content: any
) => {
  const errors: Record<string, string> = {};
  let isValid = true;

  // Find all input components across all sections
  const allInputs: any[] = [];
  Object.values(flexible_content.sections).forEach((section: any) => {
    section.components.forEach((component: any) => {
      if (component.type === "input" && component.visible) {
        allInputs.push(component);
      }
    });
  });

  // Validate each input
  allInputs.forEach((input) => {
    const { id, properties } = input;
    if (
      (properties as InputProperties).required &&
      (!formData[id] || formData[id].trim() === "")
    ) {
      errors[id] = "This field is required";
      isValid = false;
    }

    // Email validation
    if (
      (properties as InputProperties).input_type === "email" &&
      formData[id]
    ) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData[id])) {
        errors[id] = "Please enter a valid email address";
        isValid = false;
      }
    }

    // Phone validation
    if ((properties as InputProperties).input_type === "tel" && formData[id]) {
      // Simple phone validation - can be enhanced
      const phoneRegex = /^\+?[0-9\s\-()]{7,}$/;
      if (!phoneRegex.test(formData[id])) {
        errors[id] = "Please enter a valid phone number";
        isValid = false;
      }
    }
  });

  return { errors, isValid };
};
