import express from "express";
import passport from "passport";
import {
  getAuthenticatedUser,
  signUp,
  updateProfile,
  logout,
  deleteAccount,
} from "./auth.controller.ts";
import {
  ensureAuthenticated,
  localAuthMiddleware,
} from "../../middlewares/auth/auth.middleware.ts";
import config from "../../config/config.ts";
import "./strategies/index.ts";

const authRouter = express.Router();

authRouter.get("/me", ensureAuthenticated, getAuthenticatedUser);
authRouter.put("/me", ensureAuthenticated, updateProfile);
authRouter.delete("/me", ensureAuthenticated, deleteAccount);
authRouter.post("/logout", ensureAuthenticated, logout);

authRouter.post("/password", localAuthMiddleware);
authRouter.post("/signup", signUp);

// Google OAuth routes
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

// GitHub OAuth routes
authRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);
authRouter.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  function (_req, res) {
    res.redirect(config.FRONTEND_URL);
  },
);

export default authRouter;
