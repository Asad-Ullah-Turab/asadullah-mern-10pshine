import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { verifyGitHubUser } from "../auth.controller.ts";
import config from "../../../config/config.ts";

passport.use(
  new GitHubStrategy(
    {
      clientID: config.GITHUB_CLIENT_ID,
      clientSecret: config.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    verifyGitHubUser,
  ),
);
