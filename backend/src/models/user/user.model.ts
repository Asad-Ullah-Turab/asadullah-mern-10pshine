import { Types } from "mongoose";
import userModel from "./user.mongoose.ts";

interface IUser {
  id: Types.ObjectId;
  name: string;
  email: string;
  type: "local" | "google" | "github";
}

async function checkUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const user = await userModel.findOne({ email });

    if (!user || !user.password) {
      return null;
    }

    if (await user.comparePassword(password)) {
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
      } as IUser;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

async function existsUserWithEmail(email: string) {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error checking user existence by email:", error);
    return false;
  }
}

async function getUserByEmail(email: string) {
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return null;
    }
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
    } as IUser;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
}

async function createUser({
  name,
  email,
  type,
  password,
}: {
  name: string;
  email: string;
  type: "local" | "google" | "github";
  password?: string;
}) {
  try {
    const userData: any = { name, email, type };
    if (password) userData.password = password;

    const newUser = await userModel.create(userData);
    return {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      type: newUser.type,
    } as IUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export {
  checkUser,
  existsUserWithEmail,
  getUserByEmail,
  createUser,
  type IUser,
};
