import mongoose from "mongoose";
import bcrypt from "bcrypt";

interface IUserSchema extends mongoose.Document {
  name: string;
  email: string;
  password?: string;
  type: "local" | "google" | "github";
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUserSchema>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  type: { type: String, enum: ["local", "google", "github"], required: true },
});

userSchema.pre<IUserSchema>("save", async function () {
  if (!this.password || !this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  const ans = await bcrypt.compare(candidatePassword, this.password);
  return ans;
};

const userModel = mongoose.model<IUserSchema>("User", userSchema);

export default userModel;
