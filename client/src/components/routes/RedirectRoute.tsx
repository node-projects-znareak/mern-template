import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useSessionContext } from "@/context/SessionContext";

function RedirectRoute({ children }: { children: ReactNode }) {
  const { user, isError, isLoadingSession } = useSessionContext();

  if (isError) {
    return <Navigate to="/" replace />;
  }

  if (isLoadingSession) {
    return null;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RedirectRoute;
