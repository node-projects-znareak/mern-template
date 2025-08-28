import { useSessionContext } from "@/context/SessionContext";
import type { User } from "@/types/auth";

type AuthenticatedSessionContext = Omit<ReturnType<typeof useSessionContext>, "user"> & {
  user: User;
};

export const useAuthenticatedUser = (): AuthenticatedSessionContext => {
  const { user, ...args } = useSessionContext();

  if (!user) {
    throw new Error("useAuthenticatedUser should only be used within PrivateRoute");
  }

  return {
    ...args,
    user,
  };
};
