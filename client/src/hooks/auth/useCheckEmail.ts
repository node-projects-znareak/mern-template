import { useQuery } from "@tanstack/react-query";
import { checkEmailAvailability } from "@/utils/http";
import { isEmailFormatValid } from "@/utils/email";

interface UseCheckEmailReturn {
  data: { available: boolean; inUse: boolean } | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useCheckEmail = (email: string, enabled: boolean = false): UseCheckEmailReturn => {
  const query = useQuery({
    queryKey: ["checkEmail", email],
    queryFn: () => checkEmailAvailability(email),
    enabled: enabled && !!email && isEmailFormatValid(email),
    // El servidor rate-limita este endpoint: retry corto y staleTime para no
    // quemar el límite mientras se escribe o se cambia de pestaña.
    retry: 1,
    staleTime: 30_000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
