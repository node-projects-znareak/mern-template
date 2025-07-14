import { RouteProps as OriginalRouteProps } from "react-router-dom";
import { ComponentType, ReactNode } from "react";

export type RouteProps = {
  private?: boolean;
  redirect?: boolean;
  public?: boolean;
} & OriginalRouteProps;

export interface LazyComponentProps {
  component: ComponentType;
  loader?: ReactNode;
}
