import request from "supertest";
import { deleteUserByEmail } from "../../src/models/user";
import { app } from "../../src";
import { pool } from "../../src/DB/database";
import { DatabaseConnectionError } from "../../src/errors/database-connection-error";
jest.mock("../../src/DB/database", () => {
  return {
    pool: {
      query: jest.fn(),
    },
  };
});
describe("delete /api/users/deleteUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const ValidUser = {
    email: "test@example.com",
  };

  it("Returns 400 if email is not provided", async () => {
    const response = await request(app)
      .delete("/api/users/deleteUser")
      .send({})
      .expect(400);

    expect(response.body).toEqual({ error: "The user does not exist" });
  });

  it("Returns 200 when user is succesfully delted", async () => {
    const response = await request(app)
      .delete("/api/users/deleteUser")
      .send(ValidUser)
      .expect(200);

    await expect(deleteUserByEmail(ValidUser.email)).resolves.not.toThrow();

    expect(response.body).toEqual({ success: true, message: "User removed" });
  });

  it("Returns 500 if deleteUserByEmail throws a DatabaseConnectionError", async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(DatabaseConnectionError);
    const response = await request(app)
      .delete("/api/users/deleteUser")
      .send(ValidUser)
      .expect(500);

    expect(response.body).toEqual({
      error: "Failed to remove user",
    });
  });
});
