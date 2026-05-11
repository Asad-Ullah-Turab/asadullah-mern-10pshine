import type { VerifyFunction } from "passport-local";
import {
  createUser,
  existsUserWithEmail,
  checkUser,
  getUserByEmail,
  addAuthTypeToUser,
} from "../../models/user/user.model.ts";
import type { Profile as GoogleProfile } from "passport-google-oauth20";
import type { Profile as GitHubProfile } from "passport-github2";

const verifyUser: VerifyFunction = async (email, password, done) => {
  const user = await checkUser({ email, password });
  if (!user) {
    return done(null, false, { message: "Invalid email or password" });
  }
  return done(null, user);
};

const verifyGoogleUser = async (
  _accessToken: string,
  _refreshToken: string,
  profile: GoogleProfile,
  done: (error: any, user: any) => void,
) => {
  try {
    if (!profile.emails?.[0]?.value) {
      return done(new Error("No email found in Google profile"), null);
    }
    let user = await getUserByEmail(profile.emails[0].value);
    if (user) {
      if (!user.type.includes("google")) {
        addAuthTypeToUser(user, "google");
      }
      return done(null, user);
    }

    user = await createUser({
      name: profile.displayName,
      email: profile.emails[0].value,
      type: ["google"],
    });
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
};

const verifyGitHubUser = async (
  _accessToken: string,
  _refreshToken: string,
  profile: GitHubProfile,
  done: (error: any, user: any) => void,
) => {
  try {
    if (!profile.emails?.[0]?.value) {
      return done(new Error("No email found in Github profile"), null);
    }
    let user = await getUserByEmail(profile.emails[0].value);
    if (user) {
      if (!user.type.includes("github")) {
        addAuthTypeToUser(user, "github");
      }
      return done(null, user);
    }
    user = await createUser({
      name: profile.displayName,
      email: profile.emails[0].value,
      type: ["github"],
    });
    done(null, user);
  } catch (error) {
    return done(error, null);
  }
};

const getAuthenticatedUser = (req: any, res: any) => {
  res.json({ user: req.user });
};

const signUp = async (req: any, res: any) => {
  const { name, email, password } = req.body;

  if (await existsUserWithEmail(email)) {
    return res.status(400).json({ message: "Email is already in use" });
  }
  try {
    const user = await createUser({ name, email, password, type: ["local"] });
    req.login(user, (err: Error) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error logging in after sign up" });
      }
      return res.json({
        message: "User created and logged in successfully",
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ message });
  }
};

export {
  verifyUser,
  verifyGoogleUser,
  verifyGitHubUser,
  getAuthenticatedUser,
  signUp,
};
