import { pool } from "../../src/DB/database";
import { DatabaseConnectionError } from "../../src/errors/database-connection-error";
import { findUserByEmail } from "../../src/models/user";

jest.mock("../../src/DB/database", () => {
  return {
    pool: {
      query: jest.fn(),
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
});
