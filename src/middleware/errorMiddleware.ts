import { NextFunction, Request, Response } from "express";
import { ValidateError } from "tsoa";
import { HttpStatusCode } from "../common/httpStatusCode";
import {
  validationProblemDetails,
  internalServerErrorProblemDetails,
  PROBLEM_JSON_CONTENT_TYPE,
} from "../common/problemDetails";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    next(err);
  } else if (err instanceof ValidateError) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .contentType(PROBLEM_JSON_CONTENT_TYPE)
      .json(validationProblemDetails(err));
  } else {
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .contentType(PROBLEM_JSON_CONTENT_TYPE)
      .json(internalServerErrorProblemDetails());
  }
}
