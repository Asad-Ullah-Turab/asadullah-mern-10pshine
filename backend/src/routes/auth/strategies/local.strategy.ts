import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { verifyUser } from "../auth.controller.ts";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    verifyUser,
  ),
);
