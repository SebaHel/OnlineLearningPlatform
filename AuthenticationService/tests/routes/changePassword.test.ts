import request from "supertest";

import { app } from "../../src/index";
import { findUserByEmail, updateUser } from "../../src/models/user";
import { Password } from "../../src/authorization/passwordManager";

jest.mock("../../src/models/user");
jest.mock("../../src/authorization/passwordManager", () => ({
  Password: {
    comparePassword: jest.fn(),
  },
}));

describe("Post /api/users/changePassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const ValidUser = {
    id: 1,
    email: "test@example.com",
    password: "OldPassword1!",
  };
  const newPassword = "NewPassword1!";

  it("Return 400 if old password is invalid", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValueOnce(ValidUser);
    (Password.comparePassword as jest.Mock).mockResolvedValueOnce(false);

    const response = await request(app)
      .post("/api/users/changePassword")
      .send({
        oldPassword: "WrongPassword1!",
        password: newPassword,
        currentUser: ValidUser,
      })
      .expect(400);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([{ message: "Bad Request Error" }])
    );
  });
  it("Returns 400 if new Password is invalid", async () => {
    const response = await request(app)
      .post("/api/users/changePassword")
      .send({
        oldPassword: ValidUser.password,
        password: "short",
        currentUser: ValidUser,
      })
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

  it("Return 400 if not find user", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app)
      .post("/api/users/changePassword")
      .send({
        oldPassword: ValidUser.password,
        password: newPassword,
        currentUser: ValidUser,
      })
      .expect(400);

    expect(response.body.errors).toEqual([{ message: "Bad Request Error" }]);
  });

  it("Returns 200 and updates password", async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(ValidUser);
    (Password.comparePassword as jest.Mock).mockResolvedValue(true);
    (updateUser as jest.Mock).mockResolvedValue({
      id: 1,
      email: ValidUser.email,
    });
    const response = await request(app)
      .post("/api/users/changePassword")
      .send({
        oldPassword: ValidUser.password,
        password: newPassword,
        currentUser: ValidUser,
      })
      .expect(200);

    expect(updateUser).toHaveBeenCalledWith(1, ValidUser.email, newPassword);
    expect(response.body).toEqual({ id: 1, email: ValidUser.email });
  });
});
