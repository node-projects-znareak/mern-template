export const isEmailFormatValid = (email: string): boolean => {
  // Comprobación posicional sin regex con backtracking: la validación real de
  // formato la hace el servidor (yup); esto es solo UX inmediata en el cliente.
  if (email.length === 0 || email.length > 100 || /\s/.test(email)) {
    return false;
  }
  const at = email.indexOf("@");
  if (at <= 0) {
    return false;
  }
  const dot = email.lastIndexOf(".");
  return dot > at + 1 && dot < email.length - 1;
};

export const getEmailValidationMessage = (available: boolean): string => {
  return available ? "Email available" : "This email is already registered";
};
