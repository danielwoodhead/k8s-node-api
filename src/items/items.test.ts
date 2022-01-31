import request from "supertest";
import * as matchers from "../../test/matchers";
import createApp from "../app";
import { find } from "./items.service";
import { Item } from "./items.types";

expect.extend(matchers);
jest.mock("./items.service", () => ({
  find: jest.fn(() => Promise.resolve()),
}));

const app = createApp();
const mockFind = find as jest.MockedFunction<typeof find>;

describe("GET items/{id}", () => {
  it("returns validation problem details for invalid item ID", async () => {
    const response = await request(app).get("/items/foo");
    expect(response.statusCode).toEqual(400);
    expect(response).toBeValidationProblemDetails();
  });

  it("returns internal server error problem details for unhandled error", async () => {
    mockFind.mockRejectedValueOnce(new Error("error"));
    const response = await request(app).get("/items/1");
    expect(response.statusCode).toEqual(500);
    expect(response).toBeInternalServerErrorProblemDetails();
  });

  it("returns not found problem details for unknown item", async () => {
    mockFind.mockResolvedValueOnce(undefined as unknown as Item);
    const response = await request(app).get("/items/1");
    expect(response.statusCode).toEqual(404);
    expect(response).toBeNotFoundProblemDetails("Item not found");
  });

  it("returns the item", async () => {
    const item: Item = {
      id: 1,
      name: "Burger",
      price: 599,
      description: "Tasty",
      image: "https://cdn.auth0.com/blog/whatabyte/burger-sm.png",
    };
    mockFind.mockResolvedValueOnce(item);
    const response = await request(app).get("/items/1");
    expect(response.statusCode).toEqual(200);
    expect(response.body).toMatchObject(item);
  });
});
