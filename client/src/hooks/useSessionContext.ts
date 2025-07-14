import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { removeToken } from "@/utils/token";
import useSession from "./useSession";
import type { User } from "@interfaces/auth";

export default function useSessionContext() {
  const queryClient = useQueryClient();
  const { session: userFromQuery, isLoading, isFetching, isError, error } = useSession();
  const [user, setUserState] = useState<User | null>(null);
  const isReadySession = user && userFromQuery;

  const logout = useCallback(() => {
    queryClient.clear();
    removeToken();
    setUserState(null);
  }, [queryClient]);

  useEffect(() => {
    if (userFromQuery && !user) {
      setUserState(userFromQuery);
    }
  }, [userFromQuery, user]);

  useEffect(() => {
    if (isError) {
      logout();
    }
  }, [isError, logout]);

  const setUser = useCallback(
    (userData: User | null) => {
      setUserState(userData);
      queryClient.setQueryData(["userSession"], userData);
    },
    [queryClient]
  );

  return {
    user,
    session: userFromQuery,
    isReadySession,
    setUser,
    logout,
    isLoading,
    isFetching,
    isError,
    error,
  };
}
