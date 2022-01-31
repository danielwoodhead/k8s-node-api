import { Response } from "supertest";
import { PROBLEM_DETAILS } from "../../src/common/problemDetails";

export const toBeValidationProblemDetails = (received: Response) => {
  if (
    !received.body.type ||
    received.body.type !== PROBLEM_DETAILS.VALIDATION.type
  ) {
    return {
      message: () =>
        `Response did not have the expected type of ${PROBLEM_DETAILS.VALIDATION.type}`,
      pass: false,
    };
  }
  if (
    !received.body.title ||
    received.body.title !== PROBLEM_DETAILS.VALIDATION.title
  ) {
    return {
      message: () =>
        `Response did not have the expected title of ${PROBLEM_DETAILS.VALIDATION.title}`,
      pass: false,
    };
  }
  if (
    !received.body.status ||
    received.body.status !== PROBLEM_DETAILS.VALIDATION.status
  ) {
    return {
      message: () =>
        `Response did not have the expected status of ${PROBLEM_DETAILS.VALIDATION.status}`,
      pass: false,
    };
  }
  return {
    message: () => "",
    pass: true,
  };
};
