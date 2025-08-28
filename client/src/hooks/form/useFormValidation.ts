interface FormData {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
}

interface FormValidationProps {
  formData: FormData;
  hasSuccess: boolean;
  validatePasswordMatch: () => boolean;
  validatePasswordStrength: () => boolean;
}

export const useFormValidation = ({
  formData,
  hasSuccess,
  validatePasswordMatch,
  validatePasswordStrength,
}: FormValidationProps) => {
  const isFormValid = () => {
    const isNameValid = formData.name.trim().length > 0;
    const isEmailValid = formData.email.includes("@") && formData.email.includes(".");
    const isPasswordValid = formData.password.length >= 8;
    const isPasswordConfirmValid = validatePasswordMatch();
    const isPasswordStrongEnough = validatePasswordStrength();
    const isEmailConfirmedAvailable = hasSuccess;
    
    return isNameValid && 
           isEmailValid && 
           isEmailConfirmedAvailable && 
           isPasswordValid && 
           isPasswordConfirmValid && 
           isPasswordStrongEnough;
  };

  const validateFormSubmission = (canSubmit: boolean) => {
    if (!formData.name.trim()) {
      alert("Please enter your name");
      return false;
    }

    if (!formData.email || !formData.email.includes("@") || !formData.email.includes(".")) {
      alert("Please enter a valid email");
      return false;
    }

    if (!canSubmit) {
      alert("Please verify that the email is available before continuing.");
      return false;
    }

    if (!formData.password || formData.password.length < 8) {
      alert("Password must be at least 8 characters");
      return false;
    }

    if (!validatePasswordMatch()) {
      alert("Passwords do not match");
      return false;
    }

    if (!validatePasswordStrength()) {
      alert("Password must contain uppercase, lowercase letters and a number");
      return false;
    }

    return true;
  };

  return {
    isFormValid,
    validateFormSubmission,
  };
};
