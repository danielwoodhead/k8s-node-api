import { Response } from "supertest";
import { PROBLEM_DETAILS } from "../../src/common/problemDetails";

export const toBeNotFoundProblemDetails = (
  received: Response,
  title: string
) => {
  if (
    !received.body.type ||
    received.body.type !== PROBLEM_DETAILS.NOT_FOUND.type
  ) {
    return {
      message: () =>
        `Response did not have the expected type of ${PROBLEM_DETAILS.NOT_FOUND.type}`,
      pass: false,
    };
  }
  if (!received.body.title || received.body.title !== title) {
    return {
      message: () => `Response did not have the expected title of ${title}`,
      pass: false,
    };
  }
  if (
    !received.body.status ||
    received.body.status !== PROBLEM_DETAILS.NOT_FOUND.status
  ) {
    return {
      message: () =>
        `Response did not have the expected status of ${PROBLEM_DETAILS.NOT_FOUND.status}`,
      pass: false,
    };
  }
  return {
    message: () => "",
    pass: true,
  };
};
