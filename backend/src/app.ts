import express from "express";
import cors from "cors";
import authRouter from "./routes/auth/auth.router.ts";
import config from "./config/config.ts";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: config.FRONTEND_URL,
  }),
);

app.get("/", (_req, res) => {
  res.send("Hello World").status(200);
});

app.use("/auth", authRouter);

export default app;
