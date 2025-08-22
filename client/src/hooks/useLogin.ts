import { loginUser, parseError } from "@/utils/http";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useSessionContext } from "@context/SessionContext";
import { setToken } from "@/utils/token";
import type { LoginCredentials, LoginResponse } from "@/types/auth";

export default function useUserLogin() {
  const navigate = useNavigate();
  const { setUser } = useSessionContext();

  const mutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => loginUser(credentials),
    onSuccess: (data: LoginResponse) => {
      setUser(data.user);
      setToken(data.token);
      navigate("/");
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
