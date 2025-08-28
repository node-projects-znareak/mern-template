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
    retry: 3,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
