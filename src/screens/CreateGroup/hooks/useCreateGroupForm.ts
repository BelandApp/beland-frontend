import { useState } from "react";
import { FormErrors } from "../../../business/validation/groupValidation";
import { useNotify } from "src/hooks";

export const useCreateGroupForm = () => {
  const [newParticipantName, setNewParticipantName] = useState("");
  const [newParticipantInstagram, setNewParticipantInstagram] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const notify = useNotify();
 

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const setError = (field: keyof FormErrors, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    // Estados
    newParticipantName,
    newParticipantInstagram,
    errors,
    isLoading,
    // Setters
    setNewParticipantName,
    setNewParticipantInstagram,
    setErrors,
    setIsLoading,
    clearError,
    setError,
    clearAllErrors,
  };
};
