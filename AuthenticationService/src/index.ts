import express from "express";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { currentUserRouter } from "./routes/currentUser";
import { signupRouter } from "./routes/signup";
import { signoutRouter } from "./routes/signout";
import { signinRouter } from "./routes/signin";
import { changePasswordRouter } from "./routes/changePassword";
import { deleteUserRouter } from "./routes/deleteUser";

import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";
import cors from "cors";

export const app = express();

app.use(json());
app.use(cookieSession({ signed: false, secure: false }));
app.use(
  cors({
    origin: process.env.URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(currentUserRouter);
app.use(signupRouter);
app.use(signoutRouter);
app.use(signinRouter);
app.use(changePasswordRouter);
app.use(deleteUserRouter);

app.all("*", (req, res, next) => {
  next(new NotFoundError());
});

app.use(errorHandler);
let server: any;

export const startServer = () => {
  if (!server) {
    server = app.listen(3001, () => {
      console.log(`Listening on port 3001`);
    });
  }
  return server;
};

export const closeServer = () => {
  if (server) {
    server.close(() => console.log("Server closed"));
    server = null;
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}
