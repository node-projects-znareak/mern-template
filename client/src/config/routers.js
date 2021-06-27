import { lazy } from "react";
import Async from "../Components/LazyComponent";

const Login = lazy(() => import("../Components/Pages/Login/Login"));
const Signup = lazy(() => import("../Components/Pages/Signup/Signup"));
const Home = lazy(() => import("../Components/Pages/Home/Home"));
const NotFound = lazy(() => import("../Components/Pages/404/404"));
const commonProps = (path) => ({ path, exact: true, private: true });
const routers = [
  {
    component: Async(Home),
    ...commonProps("/home"),
  },
  {
    component: Async(Login),
    path: "/",
    exact: true,
    redirect: true,
  },
  {
    component: Async(Signup),
    path: "/signup",
    exact: true,
    redirect: true,
  },
  {
    component: Async(NotFound),
  },
];

export default routers;
