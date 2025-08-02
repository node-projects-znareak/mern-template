import { privateRoute, publicRoute, route, redirectRoute } from "@utils/routes";
import { lazy } from "react";

const routers: ReturnType<typeof route>[] = [
  publicRoute(
    lazy(() => import("@pages/Home")),
    "/"
  ),

  redirectRoute(
    lazy(() => import("@pages/Login")),
    "/login"
  ),

  redirectRoute(
    lazy(() => import("@pages/Register")),
    "/register"
  ),

  privateRoute(
    lazy(() => import("@pages/Profile")),
    "/profile"
  ),
];

export default routers;
