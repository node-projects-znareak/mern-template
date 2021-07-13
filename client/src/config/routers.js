import { lazy } from "react";
import { privateRoute, redirectRoute, route } from "../Helpers/utils";

const Login = lazy(() => import("../Components/Pages/Login/Login"));
const Signup = lazy(() => import("../Components/Pages/Signup/Signup"));
const Home = lazy(() => import("../Components/Pages/Home/Home"));
const NotFound = lazy(() => import("../Components/Pages/404/404"));

const routers = [
  privateRoute(Home, "/home"),
  redirectRoute(Signup, "/signup"),
  redirectRoute(Login, "/"),
  route(NotFound),
];

export default routers;
