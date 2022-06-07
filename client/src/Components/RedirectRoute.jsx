import { Navigate, Outlet } from "react-router-dom";
import { isValidToken } from "../Helpers/token";
import LoaderPage from "./Loaders/LoaderPage";
import useUserInfo from "./Hooks/useUserInfo";

export default function RedirectRoute() {
  const { user, isLoading } = useUserInfo();

  if (isLoading) return <LoaderPage />;

  if (user && isValidToken()) return <Navigate to="/home" replace />;
  
  return <Outlet />;
}
