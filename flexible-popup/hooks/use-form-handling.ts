import { useState } from "react";
import { InputProperties } from "../../ui";
import { validateFormData } from "../utils/validation-utils";

interface UseFormHandlingProps {
  node: any;
  flexible_content: any;
  sessionId: string;
  optinSubmit: (payload: any) => void;
  discountPrimarySubmit: (payload: any) => void;
  discountSecondarySubmit: (payload: any) => void;
  onClose: () => void;
}

export const useFormHandling = ({
  node,
  flexible_content,
  sessionId,
  optinSubmit,
  discountPrimarySubmit,
  discountSecondarySubmit,
  onClose,
}: UseFormHandlingProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const { errors, isValid } = validateFormData(formData, flexible_content);
    setFormErrors(errors);
    return isValid;
  };

  const handleQuizSubmit = (answer: string) => {
    const formInfo = {
      type: "quiz",
      quiz_answer: answer,
    };

    const optinPayload = {
      org_id: node.org_id,
      session_id: sessionId,
      node_id: node.id,
      node_type: node.type,
      next_node_id: node.next_node_id,
      form_info: [formInfo],
    };

    optinSubmit(optinPayload);
  };

  const handleSubmit = (e: React.FormEvent | null, submitType = "default") => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const basePayload = {
      org_id: node.org_id,
      session_id: sessionId,
      node_id: node.id,
      node_type: node.type,
      next_node_id: node.next_node_id,
    };

    switch (submitType) {
      case "discount_primary":
        discountPrimarySubmit(basePayload);
        break;
      case "discount_secondary":
        const secondaryPayload = {
          ...basePayload,
          discount_info: node.discount?.secondary_button?.discount_info,
        };
        discountSecondarySubmit(secondaryPayload);
        break;
      default:
        const formInfoArray = Object.entries(formData).map(([key, value]) => {
          // Find the component
          const foundComponent = Object.values(flexible_content.sections)
            .flatMap((section: any) => section.components)
            .find((comp: any) => comp.id === key);

          // Set field type with optional chaining and nullish coalescing
          const fieldType =
            (foundComponent?.properties as InputProperties).field_type ||
            (foundComponent?.properties as InputProperties).input_type ||
            "text";

          // Map field types to expected API types
          let apiType = fieldType;
          if (fieldType === "email") apiType = "email";
          else if (fieldType === "tel") apiType = "phone";
          else if (fieldType === "quiz") apiType = "quiz";
          else if (
            fieldType === "text" &&
            ((foundComponent?.properties as InputProperties).name === "name" ||
              (foundComponent?.properties as InputProperties).field_type ===
                "name" ||
              (foundComponent?.properties as InputProperties).input_type ===
                "name")
          )
            apiType = "name";

          return {
            type: apiType,
            [apiType]: value,
          };
        });

        const optinPayload = {
          ...basePayload,
          form_info: formInfoArray,
        };

        optinSubmit(optinPayload);
        break;
    }
  };

  return {
    formData,
    formErrors,
    setFormData,
    validateForm,
    handleSubmit,
    handleQuizSubmit,
  };
};
