import { privateRoute, publicRoute, route, redirectRoute } from "@utils/routes";
import { lazy } from "react";

const routers: ReturnType<typeof route>[] = [
  // Página principal (accesible para todos)
  publicRoute(
    lazy(() => import("@pages/Home")),
    "/"
  ),

  // Rutas públicas (accesibles sin autenticación)
  redirectRoute(
    lazy(() => import("@pages/Login")),
    "/login"
  ),

  redirectRoute(
    lazy(() => import("@pages/Register")),
    "/register"
  ),

  // Rutas privadas (requieren autenticación)
  privateRoute(
    lazy(() => import("@pages/Profile")),
    "/profile"
  ),
];

export default routers;
