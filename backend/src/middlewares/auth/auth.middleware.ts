import passport from "passport";
import type { IUser } from "../../models/user/user.model.ts";
import type { Request, Response, NextFunction } from "express";

function localAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  passport.authenticate(
    "local",
    (err: any, user: IUser | false, info: { message?: string }) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ success: false, message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({ success: true, message: "Login successful", user });
      });
    },
  )(req, res, next);
}

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ success: false, message: "Unauthorized" });
}

export { localAuthMiddleware, ensureAuthenticated };
