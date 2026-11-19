import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { broadcastSession, subscribeToSession } from "@/utils/sessionChannel";
import { logoutUser } from "@/utils/http";
import useSession from "./useSession";
import type { User } from "@interfaces/auth";

export default function useSessionContext() {
  const queryClient = useQueryClient();
  const { session: userFromQuery, isLoading, isFetching, isError, error } = useSession();

  const user = userFromQuery ?? null;
  const isLoadingSession = isLoading;

  useEffect(() => {
    const unsubscribe = subscribeToSession((message) => {
      if (message.type === "logout") {
        queryClient.cancelQueries({ queryKey: ["userSession"] });
        queryClient.setQueryData(["userSession"], null);
        return;
      }

      queryClient.setQueryData(["userSession"], message.user);
    });

    return unsubscribe;
  }, [queryClient]);

  const logout = useCallback(async () => {
    queryClient.setQueryData(["userSession"], null);
    broadcastSession({ type: "logout" });
    try {
      await logoutUser();
    } catch (err) {
      console.error("No se pudo cerrar la sesión en el servidor:", err);
    }
  }, [queryClient]);

  const setUser = useCallback(
    (userData: User | null) => {
      queryClient.setQueryData(["userSession"], userData);
      broadcastSession(userData ? { type: "login", user: userData } : { type: "logout" });
    },
    [queryClient]
  );

  const updateUser = useCallback(
    (updates: Partial<User>) => {
      queryClient.setQueryData<User>(["userSession"], (current) => (current ? { ...current, ...updates } : current));
    },
    [queryClient]
  );

  return {
    user,
    isLoadingSession,
    isLoading,
    isFetching,
    isError,
    error,
    setUser,
    updateUser,
    logout,
    rawUserData: userFromQuery,
  };
}
