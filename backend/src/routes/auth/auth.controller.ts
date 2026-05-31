import type { VerifyFunction } from "passport-local";
import {
  createUser,
  existsUserWithEmail,
  checkUser,
  getUserByEmail,
  addAuthTypeToUser,
  updateUserProfileById,
  deleteUserById,
} from "../../models/user/user.model.ts";
import { deleteNotesByUserId } from "../../models/notes/notes.model.ts";
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
        user,
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ message });
  }
};

const updateProfile = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { name } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const updatedUser = await updateUserProfileById(String(userId), {
      name,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: updatedUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ message });
  }
};

const logout = async (req: any, res: any) => {
  req.logout((error: Error) => {
    if (error) {
      return res.status(500).json({ message: "Failed to logout" });
    }

    req.session.destroy((sessionError: Error) => {
      if (sessionError) {
        return res.status(500).json({ message: "Failed to logout" });
      }

      res.clearCookie("session");
      return res.json({ message: "Logged out successfully" });
    });
  });
};

const deleteAccount = async (req: any, res: any) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await deleteNotesByUserId(String(userId));
    const deleted = await deleteUserById(String(userId));

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    req.logout((error: Error) => {
      if (error) {
        return res.status(500).json({ message: "Failed to delete account" });
      }

      req.session.destroy(() => {
        res.clearCookie("session");
        return res.json({ message: "Account deleted successfully" });
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
  updateProfile,
  logout,
  deleteAccount,
};
