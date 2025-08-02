import { useState, useCallback } from "react";
import { checkEmailAvailability, formatError } from "@/utils/http";

interface UseCheckEmailReturn {
  checkEmail: (email: string) => Promise<{ available: boolean; inUse: boolean } | null>;
  isChecking: boolean;
  error: string | null;
  clearError: () => void;
}

export const useCheckEmail = (): UseCheckEmailReturn => {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEmail = useCallback(async (email: string) => {
    if (!email || !email.includes("@")) {
      setError("Por favor, ingresa un email válido");
      return null;
    }

    setIsChecking(true);
    setError(null);

    try {
      const result = await checkEmailAvailability(email);
      return result;
    } catch (err) {
      const errorMessage = formatError(err);
      setError(errorMessage);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    checkEmail,
    isChecking,
    error,
    clearError,
  };
};
