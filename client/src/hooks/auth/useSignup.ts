import { signupUser, parseError } from "@/utils/http";
import { useMutation } from "@tanstack/react-query";
import { useSessionContext } from "@/context/SessionContext";
import type { LoginResponse } from "@interfaces/auth";

interface SignupCredentials {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
}

export default function useSignup() {
  const { setUser } = useSessionContext();

  const mutation = useMutation({
    mutationFn: (credentials: SignupCredentials) => signupUser(credentials),
    // Sin navigate() aquí: la redirección a /profile la hace RedirectRoute
    // (config/routes.ts) al detectar el usuario, evitando la carrera.
    onSuccess: (data: LoginResponse) => {
      setUser(data.user);
    },
  });

  const handleSignup = async (values: SignupCredentials) => {
    try {
      await mutation.mutateAsync(values);
    } catch (err) {
      console.error(err);
    }
  };

  const onFinish = async (values: SignupCredentials) => {
    await handleSignup(values);
  };

  return {
    handleSignup,
    onFinish,
    isLoading: mutation.isPending,
    error: mutation.error ? parseError(mutation.error) : null,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
  };
}
