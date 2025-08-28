import { useState, useCallback } from "react";

interface PasswordValidationProps {
  password: string;
  passwordConfirm: string;
}

export const usePasswordValidation = ({ password, passwordConfirm }: PasswordValidationProps) => {
  const [showPasswordMismatch, setShowPasswordMismatch] = useState(false);
  const [showConfirmPasswordRequired, setShowConfirmPasswordRequired] = useState(false);

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
    if (password && !passwordConfirm) {
      setShowConfirmPasswordRequired(true);
    }
  };

  const handlePasswordConfirmBlur = () => {
    if (password && passwordConfirm) {
      setShowPasswordMismatch(password !== passwordConfirm);
      setShowConfirmPasswordRequired(false);
    } else if (password && !passwordConfirm) {
      setShowConfirmPasswordRequired(true);
      setShowPasswordMismatch(false);
    } else {
      setShowPasswordMismatch(false);
      setShowConfirmPasswordRequired(false);
    }
  };

  const handlePasswordConfirmChange = (value: string) => {
    if (password && value) {
      setShowPasswordMismatch(password !== value);
      setShowConfirmPasswordRequired(false);
    } else if (password && !value) {
      setShowConfirmPasswordRequired(true);
      setShowPasswordMismatch(false);
    } else {
      setShowPasswordMismatch(false);
      setShowConfirmPasswordRequired(false);
    }
  };

  const handlePasswordBlur = () => {
    if (password && passwordConfirm) {
      setShowPasswordMismatch(password !== passwordConfirm);
    }
    if (password && !passwordConfirm) {
      setShowConfirmPasswordRequired(true);
    }
  };

  const handlePasswordChange = (value: string) => {
    if (passwordConfirm) {
      setShowPasswordMismatch(value !== passwordConfirm);
    }
    if (!value) {
      setShowConfirmPasswordRequired(false);
      setShowPasswordMismatch(false);
    }
    if (value && !passwordConfirm) {
      setShowConfirmPasswordRequired(true);
    }
  };

  return {
    showPasswordMismatch,
    showConfirmPasswordRequired,
    validatePasswordMatch,
    validatePasswordStrength,
    handlePasswordConfirmFocus,
    handlePasswordConfirmBlur,
    handlePasswordConfirmChange,
    handlePasswordBlur,
    handlePasswordChange,
  };
};
