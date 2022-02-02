import { Response } from "supertest";
import { HttpStatusCode } from "../../src/common/httpStatusCode";
import { PROBLEM_DETAILS } from "../../src/common/problemDetails";

export const toBeInternalServerErrorProblemDetails = (received: Response) => {
  if (received.statusCode !== HttpStatusCode.INTERNAL_SERVER_ERROR) {
    return {
      message: () =>
        `Response did not have the expected status code of ${HttpStatusCode.INTERNAL_SERVER_ERROR}`,
      pass: false,
    };
  }
  if (
    !received.body.type ||
    received.body.type !== PROBLEM_DETAILS.INTERNAL_SERVER_ERROR.type
  ) {
    return {
      message: () =>
        `Response did not have the expected type of ${PROBLEM_DETAILS.INTERNAL_SERVER_ERROR.type}`,
      pass: false,
    };
  }
  if (
    !received.body.title ||
    received.body.title !== PROBLEM_DETAILS.INTERNAL_SERVER_ERROR.title
  ) {
    return {
      message: () =>
        `Response did not have the expected title of ${PROBLEM_DETAILS.INTERNAL_SERVER_ERROR.title}`,
      pass: false,
    };
  }
  if (
    !received.body.status ||
    received.body.status !== PROBLEM_DETAILS.INTERNAL_SERVER_ERROR.status
  ) {
    return {
      message: () =>
        `Response did not have the expected status of ${PROBLEM_DETAILS.INTERNAL_SERVER_ERROR.status}`,
      pass: false,
    };
  }
  return {
    message: () => "",
    pass: true,
  };
};
