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

export { getUser, type IUser };
