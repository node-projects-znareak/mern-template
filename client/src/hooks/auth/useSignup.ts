import { signupUser, parseError } from "@/utils/http";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useSessionContext } from "@/context/SessionContext";
import { setToken } from "@/utils/token";
import type { LoginResponse } from "@interfaces/auth";

interface SignupCredentials {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
}

export default function useSignup() {
  const navigate = useNavigate();
  const { setUser } = useSessionContext();

  const mutation = useMutation({
    mutationFn: (credentials: SignupCredentials) => signupUser(credentials),
    onSuccess: (data: LoginResponse) => {
      setUser(data.user);
      setToken(data.token);
      navigate("/profile");
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
