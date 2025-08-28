import { useState, useCallback, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { existsToken, removeToken } from "@/utils/token";
import useSession from "./useSession";
import type { User } from "@interfaces/auth";

export default function useSessionContext() {
  const queryClient = useQueryClient();

  const { session: userFromQuery, isLoading, isFetching, isError, error } = useSession();

  const [pendingUpdates, setPendingUpdates] = useState<Partial<User> | null>(null);

  const user = useMemo(() => {
    if (!userFromQuery) return null;
    
    return pendingUpdates ? { ...userFromQuery, ...pendingUpdates } : userFromQuery;
  }, [userFromQuery, pendingUpdates]);

  const isAuthenticated = !!user;
  const hasToken = existsToken();
  const isLoadingSession = isLoading || (hasToken && !user && !isError);

  const logout = useCallback(() => {
    queryClient.removeQueries({ queryKey: ["userSession"] });
    queryClient.removeQueries({ queryKey: ["user"] });

    removeToken();
    setPendingUpdates(null);
  }, [queryClient]);

  const setUser = useCallback(
    (userData: User | null) => {
      queryClient.setQueryData(["userSession"], userData);
      setPendingUpdates(null);
    },
    [queryClient]
  );

  const updateUser = useCallback(
    (updates: Partial<User>) => {
      if (!userFromQuery) return;

      setPendingUpdates((prev) => ({ ...prev, ...updates }));

      const updatedUser = { ...userFromQuery, ...updates };
      queryClient.setQueryData(["userSession"], updatedUser);
    },
    [queryClient, userFromQuery]
  );

  useEffect(() => {
    if (isError && hasToken) {
      logout();
    }
  }, [isError, hasToken, logout, error]);

  useEffect(() => {
    if (userFromQuery) {
      setPendingUpdates(null);
    }
  }, [userFromQuery]);

  return {
    user,
    isAuthenticated,
    isLoadingSession,
    isLoading,
    isFetching,
    isError,
    error,
    setUser,
    updateUser,
    logout,
    hasToken,
    rawUserData: userFromQuery,
  };
}
