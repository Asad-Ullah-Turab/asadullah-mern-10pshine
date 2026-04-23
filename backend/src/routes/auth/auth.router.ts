import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { verifyUser } from "./auth.controller.ts";
import config from "../../config/config.ts";

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

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

const authRouter = express.Router();

authRouter.post(
  "/password",
  passport.authenticate("local", {
    successRedirect: `${config.FRONTEND_URL}/`,
    failureRedirect: `${config.FRONTEND_URL}/login?error=Invalid%20credentials`,
  }),
);

export default authRouter;
