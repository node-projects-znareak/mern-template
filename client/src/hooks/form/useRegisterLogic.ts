import { useRegisterForm } from "./useRegisterForm";
import { usePasswordValidation } from "./usePasswordValidation";
import { useFormValidation } from "./useFormValidation";

interface FormData {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
}

interface UseRegisterLogicProps {
  hasSuccess: boolean;
  canSubmit: boolean;
  setEmail: (email: string) => void;
  onFinish: (formData: FormData) => void;
}

export const useRegisterLogic = ({
  hasSuccess,
  canSubmit,
  setEmail,
  onFinish,
}: UseRegisterLogicProps) => {
  const { formData, handleChange: baseHandleChange, resetForm, hasUserInteracted } = useRegisterForm();
  
  const passwordValidation = usePasswordValidation({
    password: formData.password,
    passwordConfirm: formData.passwordConfirm,
  });

  const { isFormValid, validateFormSubmission } = useFormValidation({
    formData,
    hasSuccess,
    validatePasswordMatch: passwordValidation.validatePasswordMatch,
    validatePasswordStrength: passwordValidation.validatePasswordStrength,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    baseHandleChange(e);
    
    if (name === 'password') {
      passwordValidation.handlePasswordChange(value);
    }
  };

  const handleEmailInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    baseHandleChange(e);
    passwordValidation.handlePasswordConfirmChange(value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateFormSubmission(canSubmit)) {
      onFinish(formData);
    }
  };

  return {
    formData,
    handleChange,
    handleEmailInputBlur,
    handlePasswordConfirmChange,
    handleSubmit,
    isFormValid,
    resetForm,
    passwordValidation,
    hasUserInteracted,
  };
};
