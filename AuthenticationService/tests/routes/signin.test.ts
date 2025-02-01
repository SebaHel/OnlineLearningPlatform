import jwt from "jsonwebtoken";
import request from "supertest";

import { app } from "../../src/index";
import { findUserByEmail } from "../../src/models/user";
import { Password } from "../../src/authorization/passwordManager";

jest.mock("../../src/models/user");
jest.mock("../../src/authorization/passwordManager");

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mockedjwt"),
}));

describe("Post /api/users/signin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const ValidUser = {
    id: 1,
    email: "test@example.com",
    password: "Password1!",
  };
  it("Return 400 if provided invalid email", async () => {
    const response = await request(app)
      .post("/api/users/signin")
      .send({ email: "invalidEmail", password: ValidUser.password })
      .expect(400);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        { field: "email", message: "Must be a valid email" },
      ])
    );
  });
  it("Return 400 if provided invalid password", async () => {
    const response = await request(app)
      .post("/api/users/signin")
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
    (findUserByEmail as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app)
      .post("/api/users/signin")
      .send(ValidUser)
      .expect(400);

    expect(response.body.errors).toEqual([{ message: "Bad Request Error" }]);
  });

  it("Return 400 if password is incorrect", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(ValidUser);
    (Password.comparePassword as jest.Mock).mockResolvedValue(false);

    const response = await request(app)
      .post("/api/users/signin")
      .send({
        email: ValidUser.email,
        password: "WrongPassword1!",
      })
      .expect(400);

    expect(response.body.errors).toEqual([{ message: "Bad Request Error" }]);
  });

  it("Returns 200 and JWT if user is log in succesfully", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(ValidUser);
    (Password.comparePassword as jest.Mock).mockResolvedValue(true);

    const response = await request(app)
      .post("/api/users/signin")
      .send({ email: ValidUser.email, password: ValidUser.password });

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: ValidUser.id, email: ValidUser.email },
      expect.any(String)
    );
    expect(response.body).toEqual({ id: ValidUser.id, email: ValidUser.email });
    expect(response.headers["set-cookie"]).toBeDefined();
  });
});
