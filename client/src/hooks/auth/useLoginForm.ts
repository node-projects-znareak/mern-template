import { useState, ChangeEvent, FormEvent } from "react";

interface UseLoginForm {
  emailError: string;
  passwordError: string;
  handleEmailChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>, onFinish: (data: { email: string; password: string }) => void) => void;
}

function isValidEmail(email: string) {
  return email && email.includes("@") && email.includes(".");
}

function isValidPassword(password: string) {
  return password && password.length >= 8;
}

export const useLoginForm = (): UseLoginForm => {
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (emailError && isValidEmail(value)) setEmailError("");
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (passwordError && isValidPassword(value)) setPasswordError("");
  };

  const handleSubmit = (
    e: FormEvent<HTMLFormElement>,
    onFinish: (data: { email: string; password: string }) => void
  ) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    const form = e.currentTarget;
    const email = (form.email as HTMLInputElement).value.trim();
    const password = (form.password as HTMLInputElement).value;

    let hasError = false;
    if (!isValidEmail(email)) {
      setEmailError("Por favor ingresa un email válido");
      hasError = true;
    }
    if (!isValidPassword(password)) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres");
      hasError = true;
    }
    if (hasError) return;
    onFinish({ email, password });
  };

  return {
    emailError,
    passwordError,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  };
};
