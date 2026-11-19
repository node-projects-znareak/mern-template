import { RouteProps as OriginalRouteProps } from "react-router-dom";
import { ComponentType, ReactNode } from "react";

export type RouteProps = Omit<OriginalRouteProps, "element" | "children"> & {
  private?: boolean;
  redirect?: boolean;
  public?: boolean;
  redirectTo?: string;
};

export interface LazyComponentProps {
  component: ComponentType;
  loader?: ReactNode;
}
