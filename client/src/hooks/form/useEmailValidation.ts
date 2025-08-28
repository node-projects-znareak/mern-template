import { useState, useMemo } from "react";
import { useCheckEmail } from "../auth/useCheckEmail";
import { isEmailFormatValid, getEmailValidationMessage } from "@/utils/email";

export const useEmailValidation = () => {
  const [email, setEmail] = useState("");

  const isValidFormat = isEmailFormatValid(email);
  const { data, isLoading, error } = useCheckEmail(email, !!email && isValidFormat);

  const isAvailable = !!data?.available;
  const isNetworkError = !!error && /Network Error|fetch/i.test(error.message || "");
  const hasError = !!email && (!isValidFormat || (!isAvailable && !isLoading) || !!error);
  const hasSuccess = !!email && isValidFormat && isAvailable && !isLoading && !error;
  const canSubmit = !email || hasSuccess;

  const message = useMemo(() => {
    if (!email) return "";
    if (!isValidFormat) return "Invalid email format";
    if (isLoading) return "Checking email...";
    if (error) return isNetworkError ? "Connection error. Check your internet" : "Error checking email";
    return getEmailValidationMessage(isAvailable);
  }, [email, isValidFormat, isLoading, error, isAvailable, isNetworkError]);

  return {
    email,
    setEmail,
    isChecking: isLoading,
    isAvailable,
    canSubmit,
    message,
    hasError,
    hasSuccess,
    isNetworkError,
  };
};
