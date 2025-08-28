import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useSessionContext } from "@/context/SessionContext";

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, isError, isLoadingSession } = useSessionContext();
  
  if (isError) {
    return <Navigate to="/" replace />;
  }

  if (isLoadingSession) {
    return null;
  }

  if (user) {
    return children;
  }

  return <Navigate to="/" replace />;
}

export default PrivateRoute;
