import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { verifyUser } from "./auth.controller.ts";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    verifyUser,
  ),
);

const authRouter = express.Router();

authRouter.post(
  "/password",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login?error=Invalid%20credentials",
  }),
);

export default authRouter;
