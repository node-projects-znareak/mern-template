import { loginUser, parseError } from "@/utils/http";
import { useMutation } from "@tanstack/react-query";
import { useSessionContext } from "@/context/SessionContext";
import type { LoginCredentials, LoginResponse } from "@interfaces/auth";

export default function useUserLogin() {
  const { setUser } = useSessionContext();

  const mutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => loginUser(credentials),
    // Sin navigate() aquí: la redirección la hace RedirectRoute al detectar el
    // usuario, evitando la carrera entre navigate("/") y el Navigate del wrapper.
    onSuccess: (data: LoginResponse) => {
      setUser(data.user);
    },
  });

  const onFinish = async (values: LoginCredentials) => {
    try {
      await mutation.mutateAsync(values);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    onFinish,
    isLoading: mutation.isPending,
    error: mutation.error ? parseError(mutation.error) : null,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
  };
}
