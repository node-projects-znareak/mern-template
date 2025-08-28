import { useState, useCallback } from "react";

interface PasswordValidationProps {
  password: string;
  passwordConfirm: string;
}

export const usePasswordValidation = ({ password, passwordConfirm }: PasswordValidationProps) => {
  const [showPasswordMismatch, setShowPasswordMismatch] = useState(false);

  const validatePasswordMatch = useCallback(() => {
    if (password && passwordConfirm) {
      return password === passwordConfirm;
    }
    return true;
  }, [password, passwordConfirm]);

  const validatePasswordStrength = useCallback(() => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    return passwordRegex.test(password);
  }, [password]);

  const handlePasswordConfirmFocus = () => {
    if (password && passwordConfirm && password !== passwordConfirm) {
      setShowPasswordMismatch(true);
    }
  };

  const handlePasswordConfirmBlur = () => {
    if (password && passwordConfirm) {
      setShowPasswordMismatch(password !== passwordConfirm);
    } else {
      setShowPasswordMismatch(false);
    }
  };

  const handlePasswordConfirmChange = (value: string) => {
    if (password && value) {
      setShowPasswordMismatch(password !== value);
    } else {
      setShowPasswordMismatch(false);
    }
  };

  const handlePasswordBlur = () => {
    if (password && passwordConfirm) {
      setShowPasswordMismatch(password !== passwordConfirm);
    }
  };

  const handlePasswordChange = (value: string) => {
    if (passwordConfirm) {
      setShowPasswordMismatch(value !== passwordConfirm);
    }
  };

  return {
    showPasswordMismatch,
    validatePasswordMatch,
    validatePasswordStrength,
    handlePasswordConfirmFocus,
    handlePasswordConfirmBlur,
    handlePasswordConfirmChange,
    handlePasswordBlur,
    handlePasswordChange,
  };
};
