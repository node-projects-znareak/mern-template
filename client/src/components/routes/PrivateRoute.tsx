import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import Spinner from "@components/ui/spinner";
import { useSessionContext } from "@/context/SessionContext";

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, isError, isLoadingSession } = useSessionContext();

  if (isLoadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Cargando sesión..." />
      </div>
    );
  }

  if (isError) {
    return <Navigate to="/" replace />;
  }

  if (user) {
    return children;
  }

  return <Navigate to="/" replace />;
}

export default PrivateRoute;
