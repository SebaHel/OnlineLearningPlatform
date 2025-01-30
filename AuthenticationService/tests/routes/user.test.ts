import { pool } from "../../src/DB/database";
import { Password } from "../../src/authorization/passwordManager";
import { BadRequestError } from "../../src/errors/bad-request-error";
import { DatabaseConnectionError } from "../../src/errors/database-connection-error";
import {
  addUser,
  deleteUserByEmail,
  findUserByEmail,
  updateUser,
} from "../../src/models/user";

jest.mock("../../src/DB/database", () => {
  return {
    pool: {
      query: jest.fn(),
    },
  };
});

jest.mock("../../src/authorization/passwordManager", () => {
  return {
    Password: {
      hashPassword: jest.fn(),
    },
  };
});

describe("findUserByEmail()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Returns user if email exist", async () => {
    const MockedUser = {
      id: 1,
      email: "test@example.com",
      password: "HashedPassword",
    };

    (pool.query as jest.Mock).mockResolvedValue({
      rows: [MockedUser],
    });

    const result = await findUserByEmail("test@example.com");

    expect(result).toEqual(MockedUser);
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE email = $1;",
      ["test@example.com"]
    );
  });

  it("Returns null if email not exist", async () => {
    (pool.query as jest.Mock).mockResolvedValue({
      rows: [],
    });

    const result = await findUserByEmail("test@example.com");

    expect(result).toBeNull;
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE email = $1;",
      ["test@example.com"]
    );
  });

  it("throws DatabaseConnectionError if the query fails", async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(
      new Error("Database query failed")
    );

    await expect(findUserByEmail("test@example.com")).rejects.toThrow(
      DatabaseConnectionError
    );
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE email = $1;",
      ["test@example.com"]
    );
  });
});

describe("deleteUserByEmail()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Deletes User with the provided email", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce(undefined);

    await expect(deleteUserByEmail("test@example.com")).resolves.not.toThrow();

    expect(pool.query).toHaveBeenCalledWith(
      `
  DELETE FROM users
  WHERE email = $1;
`,
      ["test@example.com"]
    );
  });

  it("Throws Error if db query fails", async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(
      new Error("Database query failed")
    );
    await expect(deleteUserByEmail("test@example.com")).rejects.toThrow(
      "Database query failed"
    );
    expect(pool.query).toHaveBeenCalledWith(
      `
  DELETE FROM users
  WHERE email = $1;
`,
      ["test@example.com"]
    );
  });
});

describe("updateUser()", () => {
  const mockId = 1;
  const mockEmail = "test@example.com";
  const mockPassword = "newPassword";
  const hashedMockPassword = "hashedNewPassword";
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Updates the user data and returns updated user", async () => {
    (Password.hashPassword as jest.Mock).mockResolvedValueOnce(
      hashedMockPassword
    );

    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: mockId, email: mockEmail }],
    });

    const result = await updateUser(mockId, mockEmail, mockPassword);

    expect(result).toEqual({ id: mockId, email: mockEmail });
    expect(Password.hashPassword).toHaveBeenCalledWith(mockPassword);
    expect(pool.query).toHaveBeenCalledWith(
      `
        UPDATE Users
        SET 
            email = $1, 
            password = $2
        WHERE 
            id = $3
        RETURNING id, email;
    `,
      [mockEmail, hashedMockPassword, mockId]
    );
  });

  it("Throws Error if provided wrong data", async () => {
    (Password.hashPassword as jest.Mock).mockResolvedValueOnce(
      hashedMockPassword
    );
    (pool.query as jest.Mock).mockRejectedValueOnce(
      new Error("Bad Request Error")
    );
    await expect(updateUser(mockId, mockEmail, mockPassword)).rejects.toThrow(
      BadRequestError
    );
    expect(Password.hashPassword).toHaveBeenCalledWith(mockPassword);
    expect(pool.query).toHaveBeenCalledWith(
      `
        UPDATE Users
        SET 
            email = $1, 
            password = $2
        WHERE 
            id = $3
        RETURNING id, email;
    `,
      [mockEmail, hashedMockPassword, mockId]
    );
  });
});

describe("addUser()", () => {
  const hashedMockPassword = "hashedNewPassword";
  const mockId = 1;
  const mockUser = {
    email: "test@example.com",
    password: "newPassword",
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("Creates user and returns with provided data", async () => {
    (Password.hashPassword as jest.Mock).mockResolvedValueOnce(
      hashedMockPassword
    );

    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: mockId, email: mockUser.email }],
    });

    const result = await addUser(mockUser);

    expect(result).toEqual({ id: mockId, email: mockUser.email });
    expect(Password.hashPassword).toHaveBeenCalledWith(mockUser.password);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO users"),
      [mockUser.email, hashedMockPassword]
    );
  });

  it("Throws Error when provided bad inputs", async () => {
    (Password.hashPassword as jest.Mock).mockResolvedValueOnce(
      hashedMockPassword
    );

    (pool.query as jest.Mock).mockRejectedValueOnce(
      new Error("Bad Request Error")
    );

    await expect(addUser(mockUser)).rejects.toThrow(BadRequestError);
    expect(Password.hashPassword).toHaveBeenCalledWith(mockUser.password);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO users"),
      [mockUser.email, hashedMockPassword]
    );
  });
});
