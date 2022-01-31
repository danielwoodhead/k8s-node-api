import { Request, Response } from "express";
import { HttpStatusCode } from "../common/httpStatusCode";

export function notFoundMiddleware(_req: Request, res: Response) {
  res.status(HttpStatusCode.NOT_FOUND).send();
}
