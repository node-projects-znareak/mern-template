import { createBrowserRouter, type RouteObject } from "react-router-dom";
import PrivateRoute from "@components/routes/PrivateRoute";
import RedirectRoute from "@components/routes/RedirectRoute";
import routers from "@config/routes";

const routes: RouteObject[] = routers.map(
  ({ path, element: Element, private: isPrivate, redirect: isRedirect, ...props }) => {
    const { redirectTo = "/", ...routeProps } = props;
    const children = <Element />;

    if (isPrivate) {
      return { ...routeProps, path, element: <PrivateRoute>{children}</PrivateRoute> };
    }

    if (isRedirect) {
      return { ...routeProps, path, element: <RedirectRoute redirectTo={redirectTo}>{children}</RedirectRoute> };
    }

    return { ...routeProps, path, element: children };
  }
);

export const router = createBrowserRouter(routes);
