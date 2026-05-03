import type { VerifyFunction } from "passport-local";
import {
  createUser,
  existsUserWithEmail,
  getUser,
} from "../../models/user/user.model.ts";

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

// TODO: Add middleware to validate email and password before creating user
const signUp = async (req: any, res: any) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, Email and Password are required" });
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,20}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be 10-20 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
    });
  }

  if (await existsUserWithEmail(email)) {
    return res.status(400).json({ message: "Email is already in use" });
  }

  const user = await createUser({ name, email, password });
  if (!user) {
    return res.status(500).json({ message: "Error creating user" });
  }

  req.login(user, (err: any) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error logging in after sign up" });
    }
    return res.json({
      message: "User created and logged in successfully",
    });
  });
};

export { verifyUser, getAuthenticatedUser, signUp };
