import PrivateRoute from "@components/routes/PrivateRoute";
import RedirectRoute from "@components/routes/RedirectRoute";
import routers from "@config/routes";
import { ComponentType } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

function RouteWrapper({
  Element,
  AuthRoute,
}: {
  Element: ComponentType;
  AuthRoute?: React.ComponentType<{ children: React.ReactNode }>;
}) {
  return AuthRoute ? (
    <AuthRoute>
      <Element />
    </AuthRoute>
  ) : (
    <Element />
  );
}

const routes = routers.map(
  ({ path, element: Element, private: isPrivate, redirect: isRedirect, ...props }, i) => {
    const key = path ?? i;
    const AuthRoute = isPrivate ? PrivateRoute : isRedirect ? RedirectRoute : undefined;

    return (
      <Route
        {...props}
        key={key}
        path={path}
        element={<RouteWrapper Element={Element as ComponentType} AuthRoute={AuthRoute} />}
      />
    );
  }
);

export default function Routers() {
  return (
    <BrowserRouter>
      <Routes>{routes}</Routes>
    </BrowserRouter>
  );
}
