import type { Request } from "express";

export function isRequestAjaxOrApi(req: Request): boolean {
  return !req.accepts("html") || req.xhr;
}
