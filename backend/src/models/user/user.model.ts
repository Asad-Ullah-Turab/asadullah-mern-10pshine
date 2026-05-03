import { Types } from "mongoose";
import userModel from "./user.mongoose.ts";

interface IUser {
  id: Types.ObjectId;
  name: string;
  email: string;
}

async function getUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const user = await userModel.findOne({ email, password });
    if (!user) {
      return null;
    }
    return {
      id: user._id,
      name: user.name,
      email: user.email,
    } as IUser;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

async function existsUserWithEmail(email: string) {
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error fetching user:", error);
    return false;
  }
}

async function createUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    const newUser = await userModel.create({ name, email, password });
    return {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    } as IUser;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export { getUser, existsUserWithEmail, createUser, type IUser };
