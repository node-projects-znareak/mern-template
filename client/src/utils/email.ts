export const isEmailFormatValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getEmailValidationMessage = (available: boolean): string => {
  return available ? "Email available" : "This email is already registered";
};
