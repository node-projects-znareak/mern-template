import { ComponentType } from "react";
import { RouteProps } from "@interfaces/routes";
import Async from "@components/routes/LazyComponent";

export const route = (component: ComponentType, path = "*", rest: RouteProps) => ({
  element: Async(component),
  path,
  ...rest,
});

export const privateRoute = (component: ComponentType, path = "/", props?: RouteProps) =>
  route(component, path, { private: true, ...props });

export const redirectRoute = (component: ComponentType, path = "/", props?: RouteProps) =>
  route(component, path, { redirect: true, ...props });

export const publicRoute = (component: ComponentType, path = "/", props?: RouteProps) =>
  route(component, path, { public: true, ...props });
