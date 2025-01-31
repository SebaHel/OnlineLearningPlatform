import express, { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";

import { RequestValidationError } from "../errors/request-validation-error";
import { BadRequestError } from "../errors/bad-request-error";
import { addUser, findUserByEmail } from "../models/user";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Must be a valid email")
      .normalizeEmail()
      .isLength({ max: 50 })
      .withMessage("Email must be under 50 characters"),
    body("password")
      .trim()
      .isLength({ min: 8, max: 20 })
      .withMessage("Password Must be provided and min 8 characters")
      .matches(/\d/)
      .withMessage("Must contain at least one digit")
      .matches(/[A-Z]/)
      .withMessage("Must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Must contain at least one lowercase letter")
      .matches(/[!@#$%^&*]/)
      .withMessage("Must contain at least one special character"),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(new RequestValidationError(errors.array()));
    }

    const { email, password } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser !== null) {
      return next(new BadRequestError("Choose diffrent Email"));
    } else {
      const user = await addUser({ email, password });
      //Generate JWT
      const userJwt = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        String(process.env.JWTKEY)
      );
      req.session = {
        jwt: userJwt,
      };
      res.status(201).send(user);
    }
  }
);

export { router as signupRouter };
