import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  type: { type: String, enum: ["local", "google", "github"], required: true },
});

const userModel = mongoose.model("User", userSchema);

export default userModel;
