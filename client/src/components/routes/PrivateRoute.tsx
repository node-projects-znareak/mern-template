import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useSessionContext } from "@context/SessionContext";
import { existsToken } from "@/utils/token";

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, isLoading, isError, isReadySession } = useSessionContext();
 
  if (isError) {
    return <Navigate to="/" replace />;
  }

  if (isLoading || !isReadySession && existsToken()) {
    return null;
  }

  if (user) {
    return children;
  }

  return <Navigate to="/" replace />;
}

export default PrivateRoute;
