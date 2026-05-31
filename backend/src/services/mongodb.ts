import mongoose from "mongoose";
import config from "../config/config.ts";
import logger from "./logger.ts";

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
    logger.info({ uri: uri }, "connected to MongoDB");
  } catch (error) {
    logger.error({ err: error }, "error connecting to MongoDB");
    throw error;
  }
}

async function disconnectMongodb() {
  try {
    await mongoose.disconnect();
    logger.info("disconnected from MongoDB");
  } catch (error) {
    logger.error({ err: error }, "error disconnecting from MongoDB");
  }
}

export { connectToMongodb, disconnectMongodb };
