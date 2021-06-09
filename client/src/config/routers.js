import { lazy } from "react";
import Async from "../Components/LazyComponent";

const Login = lazy(() => import("../Components/Pages/Login/Login"));
const NotFound = lazy(() => import("../Components/Pages/404/404"));
const commonProps = (path) => ({ path, exact: true, private: true });
const routers = [
  // {
  //   component: Async(App),  <--- Private Route
  //   ...commonProps("/home"),
  // },
  {
    component: Async(Login),
    path: "/",
    exact: true,
    redirect: true,
  },
  {
    component: Async(NotFound),
  },
];

export default routers;
