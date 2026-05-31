import passport from "passport";
import type { IUser } from "../../models/user/user.model.ts";
import type { Request, Response, NextFunction } from "express";
import logger from "../../services/logger.ts";

function localAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  passport.authenticate(
    "local",
    (err: any, user: IUser | false, info: { message?: string }) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.log?.warn({ email: req.body?.email }, "invalid login attempt");
        logger.warn({ email: req.body?.email }, "invalid login attempt");
        return res.status(401).json({ success: false, message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        req.log?.info({ userId: user.id, email: user.email }, "user logged in");
        logger.info({ userId: user.id, email: user.email }, "user logged in");
        return res.json({ success: true, message: "Login successful", user });
      });
    },
  )(req, res, next);
}

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.log?.warn({ path: req.path, method: req.method }, "unauthorized request");
  logger.warn({ path: req.path, method: req.method }, "unauthorized request");
  return res.status(401).json({ success: false, message: "Unauthorized" });
}

function validateEmailAndPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, Email and Password are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,20}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be 10-20 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
    });
  }

  next();
}

export { localAuthMiddleware, ensureAuthenticated, validateEmailAndPassword };
