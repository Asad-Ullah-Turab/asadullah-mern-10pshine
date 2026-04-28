import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { getAuthenticatedUser, verifyUser } from "./auth.controller.ts";
import {
  ensureAuthenticated,
  localAuthMiddleware,
} from "../../middlewares/auth/auth.middleware.ts";
import type { IUser } from "../../models/user/user.model.ts";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    verifyUser,
  ),
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: IUser, done) => {
  console.log("Deserializing user: ", user);
  done(null, user);
});

const authRouter = express.Router();

authRouter.post("/password", localAuthMiddleware);
authRouter.get("/me", ensureAuthenticated, getAuthenticatedUser);

export default authRouter;
