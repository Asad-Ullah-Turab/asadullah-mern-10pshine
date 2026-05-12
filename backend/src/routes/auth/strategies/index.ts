import type { IUser } from "../../../models/user/user.model.ts";
import "./google.strategy.ts";
import "./github.strategy.ts";
import "./local.strategy.ts";

import passport from "passport";

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: IUser, done) => {
  done(null, user);
});
