import { app } from "../../src";
import request from "supertest";

describe("Post /api/users/signout", () => {
  it("clears session cookie after sign out", async () => {
    const response = await request(app).post("/api/users/signout").expect(200);

    expect(response.body).toEqual({});

    expect(response.headers["set-cookie"]).toBeDefined();
    expect(response.headers["set-cookie"][0]).toMatch(/session=;/);
  });
});
