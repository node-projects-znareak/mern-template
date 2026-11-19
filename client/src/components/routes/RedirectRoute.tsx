import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import Spinner from "@components/ui/spinner";
import { useSessionContext } from "@/context/SessionContext";

function RedirectRoute({ children, redirectTo = "/" }: { children: ReactNode; redirectTo?: string }) {
  const { user, isLoadingSession } = useSessionContext();

  if (isLoadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Cargando sesión..." />
      </div>
    );
  }

  // Sin sesión o con error al verificarla: mostrar la página de auth.
  // No se redirige por error para no bloquear el acceso a /login y /register
  // cuando la API no responde.
  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default RedirectRoute;
