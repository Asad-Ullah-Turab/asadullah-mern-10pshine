import dotenv from "dotenv";

dotenv.config();

interface Config {
  PORT: number;
}

const config: Config = {
  PORT: Number(process.env.PORT) || 3000,
};

export default config;
