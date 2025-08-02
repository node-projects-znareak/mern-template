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
    retry: 2,
    staleTime: 30000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
