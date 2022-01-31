import { HttpStatusCodeLiteral, ValidateError } from "tsoa";
import { HttpStatusCode } from "./httpStatusCode";

export interface ProblemDetails {
  type: string;
  title: string;
  /**
   * @isInt
   */
  status: number;
  detail?: string;
  instance?: string;
}

/**
 * @tsoaModel
 * @example
 * {
 *   "type": "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.1",
 *   "title": "One or more validation errors occurred",
 *   "status": 400,
 *   "errors": {
 *     "id": {
 *       "message": "id",
 *       "value": "invalid"
 *     }
 *   }
 * }
 */
export interface ValidationProblemDetails extends ProblemDetails {
  errors: {
    [name: string]: {
      message: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value?: any;
    };
  };
}

export const PROBLEM_DETAILS = {
  VALIDATION: {
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.1",
    title: "One or more validation errors occurred",
    status: HttpStatusCode.BAD_REQUEST,
  },
  NOT_FOUND: {
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.4",
    title: "Not Found",
    status: HttpStatusCode.NOT_FOUND,
  },
  INTERNAL_SERVER_ERROR: {
    type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.1",
    title: "Internal Server Error",
    status: HttpStatusCode.INTERNAL_SERVER_ERROR,
  },
};

export const PROBLEM_JSON_CONTENT_TYPE = "application/problem+json";

const CONTENT_TYPE_HEADER = {
  "Content-Type": PROBLEM_JSON_CONTENT_TYPE,
};

export const validationProblemDetails = (
  err: ValidateError
): ValidationProblemDetails => {
  return {
    type: PROBLEM_DETAILS.VALIDATION.type,
    title: PROBLEM_DETAILS.VALIDATION.title,
    status: PROBLEM_DETAILS.VALIDATION.status,
    errors: err.fields,
  };
};

export const notFoundProblemDetails = (title: string): ProblemDetails => {
  return {
    type: PROBLEM_DETAILS.NOT_FOUND.type,
    title,
    status: PROBLEM_DETAILS.NOT_FOUND.status,
  };
};

export const internalServerErrorProblemDetails = (): ProblemDetails => {
  return PROBLEM_DETAILS.INTERNAL_SERVER_ERROR;
};

export const notFoundResponseArgs = (
  title: string
): [HttpStatusCodeLiteral, ProblemDetails, { "Content-Type": string }] => [
  HttpStatusCode.NOT_FOUND,
  notFoundProblemDetails(title),
  CONTENT_TYPE_HEADER,
];
