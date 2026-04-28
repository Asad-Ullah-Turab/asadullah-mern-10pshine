import type { VerifyFunction } from "passport-local";
import { getUser } from "../../models/user/user.model.ts";

const verifyUser: VerifyFunction = async (email, password, done) => {
  const user = await getUser({ email, password });
  if (!user) {
    return done(null, false, { message: "Invalid email or password" });
  }
  return done(null, user);
};

const getAuthenticatedUser = (req: any, res: any) => {
  res.json({ user: req.user });
};

export { verifyUser, getAuthenticatedUser };
