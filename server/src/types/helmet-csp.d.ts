declare module "helmet-csp" {
  import type { RequestHandler } from "express";

  interface HelmetCspOptions {
    useDefaults?: boolean;
    directives?: Record<string, unknown>;
    reportOnly?: boolean;
  }

  function contentSecurityPolicy(_options?: HelmetCspOptions): RequestHandler;

  export = contentSecurityPolicy;
}
