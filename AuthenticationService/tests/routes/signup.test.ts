import request from "supertest";
import { app } from "../../src/index";
import { addUser, findUserByEmail } from "../../src/models/user";
import jwt from "jsonwebtoken";

jest.mock("../../src/models/user");

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mockedjwt"),
}));

describe("Post /api/users/signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const ValidUser = {
    email: "test@example.com",
    password: "Password1!",
  };

  it("Returns 400 if email is invalid", async () => {
    const response = await request(app)
      .post("/api/users/signup")
      .send({ email: "InvalidEmail", password: ValidUser.password })
      .expect(400);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        { field: "email", message: "Must be a valid email" },
      ])
    );
  });

  it("Returns 400 if password is invalid", async () => {
    const response = await request(app)
      .post("/api/users/signup")
      .send({ email: ValidUser.email, password: "short" })
      .expect(400);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        {
          field: "password",
          message: "Password Must be provided and min 8 characters",
        },
      ])
    );
  });

  it("Return 400 if email already registered", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValueOnce(ValidUser);

    const response = await request(app)
      .post("/api/users/signup")
      .send(ValidUser)
      .expect(400);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([{ message: "Choose diffrent Email" }])
    );
  });

  it("Creates a new User and returns JWT token with status code 201", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValueOnce(null);
    (addUser as jest.Mock).mockResolvedValueOnce({
      id: 1,
      email: ValidUser.email,
    });

    const response = await request(app)
      .post("/api/users/signup")
      .send(ValidUser)
      .expect(201);

    expect(addUser).toHaveBeenCalledWith(ValidUser);
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 1, email: ValidUser.email },
      expect.any(String)
    );

    expect(response.body).toEqual({ id: 1, email: ValidUser.email });
    expect(response.headers["set-cookie"]).toBeDefined();
  });
});
