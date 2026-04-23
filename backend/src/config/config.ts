import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI is required in environment variables");
}

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

interface Config {
  PORT: number;
  MONGO_URI: string;
  FRONTEND_URL: string;
}

const config: Config = {
  PORT: Number(process.env.PORT) || 3000,
  MONGO_URI,
  FRONTEND_URL,
};

export default config;
