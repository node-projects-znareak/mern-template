import type { Express } from "express";

export interface EndpointInfo {
  readonly path: string;
  readonly methods: string[];
  readonly middlewares: string[];
}

interface RouteLike {
  readonly path: string;
  readonly methods?: Record<string, boolean>;
  readonly stack?: { readonly handle?: { readonly name?: string } }[];
}

interface LayerLike {
  readonly rawPath?: unknown;
  readonly route?: RouteLike;
  readonly handle?: { readonly stack?: readonly LayerLike[] };
}

interface RouterLike {
  readonly stack?: readonly LayerLike[];
}

function joinPaths(basePath: string, path: string): string {
  return path === "/" ? basePath : `${basePath}${path}`;
}

function toRouteMiddlewares(route: RouteLike): string[] {
  return (route.stack ?? []).map((item) => {
    const name = item.handle?.name ?? "";
    return name === "" ? "anonymous" : name;
  });
}

function collectEndpoints(
  stack: readonly LayerLike[],
  basePath: string,
  endpoints: EndpointInfo[],
): void {
  for (const layer of stack) {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods ?? {})
        .filter((method) => method !== "_all")
        .map((method) => method.toUpperCase());

      endpoints.push({
        path: joinPaths(basePath, layer.route.path) || "/",
        methods,
        middlewares: toRouteMiddlewares(layer.route),
      });
      continue;
    }

    const handle = layer.handle;
    if (handle && Array.isArray(handle.stack)) {
      const { rawPath } = layer;

      if (typeof rawPath === "string") {
        collectEndpoints(handle.stack, joinPaths(basePath, rawPath), endpoints);
      } else if (Array.isArray(rawPath)) {
        for (const path of rawPath) {
          if (typeof path === "string") {
            collectEndpoints(handle.stack, joinPaths(basePath, path), endpoints);
          }
        }
      } else {
        collectEndpoints(handle.stack, basePath, endpoints);
      }
    }
  }
}

/**
 * Enumera las rutas registradas en una aplicación Express 5.
 * Sustituye a express-list-endpoints, que no soporta Express 5 (`app._router` ya no existe).
 */
export function listAppEndpoints(app: Express): EndpointInfo[] {
  const router = (app as Express & { readonly router?: RouterLike }).router;
  const endpoints: EndpointInfo[] = [];

  if (router && Array.isArray(router.stack)) {
    collectEndpoints(router.stack, "", endpoints);
  }

  return endpoints;
}
