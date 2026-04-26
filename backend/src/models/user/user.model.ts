import userModel from "./user.mongoose.ts";
async function getUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const user = userModel.find({ email, password });
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export { getUser };
