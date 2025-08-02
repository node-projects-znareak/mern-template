import { privateRoute, publicRoute, route, redirectRoute } from "@utils/routes";
import { lazy } from "react";

const routers: ReturnType<typeof route>[] = [
  // Main page (accessible to everyone)
  publicRoute(
    lazy(() => import("@pages/Home")),
    "/"
  ),

  // Public routes (accessible without authentication)
  redirectRoute(
    lazy(() => import("@pages/Login")),
    "/login"
  ),

  redirectRoute(
    lazy(() => import("@pages/Register")),
    "/register"
  ),

  // Private routes (require authentication)
  privateRoute(
    lazy(() => import("@pages/Profile")),
    "/profile"
  ),
];

export default routers;
