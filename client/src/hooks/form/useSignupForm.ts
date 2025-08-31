import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/schemas/auth";
import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { checkEmailAvailability, checkUsernameAvailability } from "@/utils/http";
import type { EmailCheckResponse } from "@interfaces/email";
import type { UsernameCheckResponse } from "@interfaces/username";

export function useSignupForm(onSubmit: (data: RegisterFormData) => Promise<void>) {
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

  const email = watch("email");
  const username = watch("username");
  const password = watch("password");
  const passwordConfirm = watch("passwordConfirm");

  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");

  const {
    data: emailData,
    isLoading: isCheckingEmail,
    isFetching: isFetchingEmail,
    error: emailError,
  } = useQuery<EmailCheckResponse>({
    queryKey: ["checkEmail", debouncedEmail],
    queryFn: () => checkEmailAvailability(debouncedEmail),
    enabled: !!debouncedEmail && debouncedEmail.includes("@") && !errors.email,
    retry: false,
  });

  const {
    data: usernameData,
    isLoading: isCheckingUsername,
    isFetching: isFetchingUsername,
    error: usernameError,
  } = useQuery<UsernameCheckResponse>({
    queryKey: ["checkUsername", debouncedUsername],
    queryFn: () => checkUsernameAvailability(debouncedUsername),
    enabled: !!debouncedUsername && debouncedUsername.length >= 3 && !errors.username,
    retry: false,
  });

  const hasEmailError = !!errors.email || (emailData && !emailData.available) || !!emailError;
  const hasEmailSuccess = emailData?.available === true && !emailError;

  const emailMessage =
    emailError
      ? "Unable to verify email availability"
      : emailData?.available === false
      ? "This email is already registered"
      : emailData?.available === true
      ? "Email is available"
      : "";
  const isEmailNetworkError = !!emailError;

  const hasUsernameError = !!errors.username || (usernameData && !usernameData.available) || !!usernameError;
  const hasUsernameSuccess = usernameData?.available === true && !usernameError;

  const usernameMessage =
    usernameError
      ? "Unable to verify username availability"
      : usernameData?.available === false
      ? "This username is already taken"
      : usernameData?.available === true
      ? "Username is available"
      : "";
  const isUsernameNetworkError = !!usernameError;

  const handleEmailBlur = useCallback(() => {
    if (email && email.includes("@") && !errors.email) {
      setDebouncedEmail(email);
    } else if (!email) {
      setDebouncedEmail("");
    }
  }, [email, errors.email]);

  const handleUsernameBlur = useCallback(() => {
    if (username && username.length >= 3 && !errors.username) {
      setDebouncedUsername(username);
    } else if (!username) {
      setDebouncedUsername("");
    }
  }, [username, errors.username]);

  useEffect(() => {
    if (!email) {
      setDebouncedEmail("");
    }
  }, [email]);

  useEffect(() => {
    if (!username) {
      setDebouncedUsername("");
    }
  }, [username]);

  const isFormReady = isValid && hasEmailSuccess && hasUsernameSuccess;

  const hasSpecificValidationErrors =
    (hasEmailError && !isEmailNetworkError && emailMessage.includes("already registered")) ||
    (hasUsernameError && !isUsernameNetworkError && usernameMessage.includes("already taken")) ||
    isEmailNetworkError ||
    isUsernameNetworkError;

  const shouldShowValidationMessage = hasSpecificValidationErrors;

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
    register,
    handleSubmit: handleFormSubmit,
    errors,
    isSubmitting,
    isValid,
    isFormReady,
    shouldShowValidationMessage,

    formValues: {
      email,
      username,
      password,
      passwordConfirm,
    },

    emailValidation: {
      handleEmailBlur,
      isCheckingEmail,
     isFetchingEmail,
      emailMessage,
      hasEmailError,
      hasEmailSuccess,
      isEmailNetworkError,
    },

    usernameValidation: {
      handleUsernameBlur,
      isCheckingUsername,
      isFetchingUsername,
      usernameMessage,
      hasUsernameError,
      hasUsernameSuccess,
      isUsernameNetworkError,
    },
  };
}
