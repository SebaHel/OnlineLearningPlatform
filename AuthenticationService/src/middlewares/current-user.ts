import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload | null;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.jwt) {
    req.currentUser = null;
    return next();
  }
  try {
    const payload = jwt.verify(
      req.session.jwt,
      String(process.env.JWTKEY)
    ) as UserPayload;
    req.currentUser = payload;
  } catch (err) {
    req.currentUser = null;
  }
  next();
};
