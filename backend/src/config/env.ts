import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI is required in environment variables");
}

interface Config {
  PORT: number;
  MONGO_URI: string;
}

const config: Config = {
  PORT: Number(process.env.PORT) || 3000,
  MONGO_URI,
};

export default config;
