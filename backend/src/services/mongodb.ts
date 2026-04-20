import mongoose from "mongoose";
import config from "../config/env.ts";

const clientOptions: mongoose.ConnectOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

const uri = config.MONGO_URI;

async function connectToMongodb() {
  try {
    await mongoose.connect(uri, clientOptions);
    if (!mongoose.connection.db) {
      throw new Error("Failed to get MongoDB database instance");
    }
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

async function disconnectMongodb() {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
  }
}

export { connectToMongodb, disconnectMongodb };
