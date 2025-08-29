import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/schemas/auth";
import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { checkEmailAvailability, checkUsernameAvailability } from "@/utils/http";
import type { EmailCheckResponse } from "@interfaces/email";
import type { UsernameCheckResponse } from "@interfaces/username";

export function useRegisterFormWithValidation(onSubmit: (data: RegisterFormData) => Promise<void>) {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
  } = form;

  // Watch form values
  const email = watch("email");
  const username = watch("username");
  const password = watch("password");
  const passwordConfirm = watch("passwordConfirm");

  // Debounced values for async validation
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");

  // Debounce email
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmail(email);
    }, 500);
    return () => clearTimeout(timer);
  }, [email]);

  // Debounce username
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username);
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  // Email availability check
  const {
    data: emailData,
    isLoading: isCheckingEmail,
    error: emailError,
  } = useQuery<EmailCheckResponse>({
    queryKey: ["checkEmail", debouncedEmail],
    queryFn: () => checkEmailAvailability(debouncedEmail),
    enabled: !!debouncedEmail && debouncedEmail.includes("@") && !errors.email,
    retry: false,
  });

  // Username availability check
  const {
    data: usernameData,
    isLoading: isCheckingUsername,
    error: usernameError,
  } = useQuery<UsernameCheckResponse>({
    queryKey: ["checkUsername", debouncedUsername],
    queryFn: () => checkUsernameAvailability(debouncedUsername),
    enabled: !!debouncedUsername && debouncedUsername.length >= 3 && !errors.username,
    retry: false,
  });

  // Email validation status
  const hasEmailError = !!errors.email || (emailData && !emailData.available) || !!emailError;
  const hasEmailSuccess = emailData?.available === true;
  const emailMessage = emailData?.available === false 
    ? "This email is already registered" 
    : emailData?.available === true
    ? "Email is available"
    : emailError 
    ? "Unable to verify email availability" 
    : "";
  const isEmailNetworkError = !!emailError;

  // Username validation status  
  const hasUsernameError = !!errors.username || (usernameData && !usernameData.available) || !!usernameError;
  const hasUsernameSuccess = usernameData?.available === true;
  const usernameMessage = usernameData?.available === false 
    ? "This username is already taken" 
    : usernameData?.available === true
    ? "Username is available"
    : usernameError 
    ? "Unable to verify username availability" 
    : "";
  const isUsernameNetworkError = !!usernameError;

  // Handle blur events for validation
  const handleEmailBlur = useCallback(() => {
    // Blur handler can be used for additional logic if needed
  }, []);

  const handleUsernameBlur = useCallback(() => {
    // Blur handler can be used for additional logic if needed
  }, []);

  // Check if form is ready for submission
  const isFormReady = isValid && hasEmailSuccess && hasUsernameSuccess;

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      if (!hasEmailSuccess || !hasUsernameSuccess) {
        console.error("Email or username not validated");
        return;
      }
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  });

  return {
    // Form methods
    register,
    handleSubmit: handleFormSubmit,
    errors,
    isSubmitting,
    isValid,
    isFormReady,

    // Form values
    formValues: {
      email,
      username,
      password,
      passwordConfirm,
    },

    // Email validation
    emailValidation: {
      handleEmailBlur,
      isCheckingEmail,
      emailMessage,
      hasEmailError,
      hasEmailSuccess,
      isEmailNetworkError,
    },

    // Username validation
    usernameValidation: {
      handleUsernameBlur,
      isCheckingUsername,
      usernameMessage,
      hasUsernameError,
      hasUsernameSuccess,
      isUsernameNetworkError,
    },
  };
}
