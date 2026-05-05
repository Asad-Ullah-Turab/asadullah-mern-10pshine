import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI is required in environment variables");
}

const SESSION_SECRET_01 = process.env.SESSION_SECRET_01;
if (!SESSION_SECRET_01) {
  throw new Error("SESSION_SECRET_01 is required in environment variables");
}

const SESSION_SECRET_02 = process.env.SESSION_SECRET_02;
if (!SESSION_SECRET_02) {
  throw new Error("SESSION_SECRET_02 is required in environment variables");
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is required in environment variables");
}

const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
if (!GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_SECRET is required in environment variables");
}

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

interface Config {
  PORT: number;
  MONGO_URI: string;
  SESSION_SECRET_01: string;
  SESSION_SECRET_02: string;
  FRONTEND_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

const config: Config = {
  PORT: Number(process.env.PORT) || 3000,
  MONGO_URI,
  SESSION_SECRET_01,
  SESSION_SECRET_02,
  FRONTEND_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
};

export default config;
