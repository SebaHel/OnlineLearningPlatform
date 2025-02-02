import { currentUser } from "../../src/middlewares/current-user";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

jest.mock("jsonwebtoken");

describe("CurrentUser middleware", () => {
  const mockNext: NextFunction = jest.fn();
  const mockRequest = (): Partial<Request> => ({
    session: {
      jwt: "test-jwt",
    },
    currentUser: null,
  });
  const mockResponse = (): Partial<Response> => ({});

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets CurrentUser to null if no session found", () => {
    const req = mockRequest();
    req.session = undefined;
    const res = mockResponse();

    currentUser(req as Request, res as Response, mockNext);

    expect(req.currentUser).toBeNull();
    expect(mockNext).toHaveBeenCalled();
  });

  it("sets currentUser to null if jwt verification fails", () => {
    const req = mockRequest();
    const res = mockResponse();

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    currentUser(req as Request, res as Response, mockNext);

    expect(req.currentUser).toBeNull();
    expect(mockNext).toHaveBeenCalled();
  });

  it("sets currentUser with the decoded payload if jwt verification succeeds", () => {
    const req = mockRequest();
    const res = mockResponse();

    const mockPayload = { id: "123", email: "test@example.com" };
    (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

    currentUser(req as Request, res as Response, mockNext);

    expect(req.currentUser).toEqual(mockPayload);
    expect(mockNext).toHaveBeenCalled();
  });
});
