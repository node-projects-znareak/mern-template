import { validationError } from "@helpers/httpResponses";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { AnyObjectSchema } from "yup";

export default function validate(schema: AnyObjectSchema): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (typeof schema.validate !== "function") {
        next("The `schema` params is not a yup schema object");
        return;
      }
      const payload = {
        body: req.body as unknown,
        query: req.query,
        params: req.params,
        files: req.files,
      };
      await schema.validate(payload);
      next();
    } catch (err) {
      validationError(res, err);
    }
  };
}
