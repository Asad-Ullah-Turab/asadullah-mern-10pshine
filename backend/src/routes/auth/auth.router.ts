import express from "express";
import passport from "passport";
import { getAuthenticatedUser, signUp } from "./auth.controller.ts";
import {
  ensureAuthenticated,
  localAuthMiddleware,
} from "../../middlewares/auth/auth.middleware.ts";
import config from "../../config/config.ts";
import "./strategies/index.ts";

const authRouter = express.Router();

authRouter.get("/me", ensureAuthenticated, getAuthenticatedUser);

authRouter.post("/password", localAuthMiddleware);
authRouter.post("/signup", signUp);

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${config.FRONTEND_URL}/login`,
  }),
  (_req, res) => {
    res.redirect(config.FRONTEND_URL);
  },
);

export default authRouter;
