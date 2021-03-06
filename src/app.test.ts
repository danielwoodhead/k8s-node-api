import request from "supertest";
import createApp from "./app";

const app = createApp();

it("returns 404 for unknown route", async () => {
  await request(app).get("/unknown").expect(404);
});

it("/health returns 200", async () => {
  await request(app).get("/health").expect(200);
});
