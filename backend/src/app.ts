import express from "express";
import cors from "cors";
import authRouter from "./routes/auth/auth.router.ts";
import config from "./config/config.ts";
import session from "express-session";
import passport from "passport";

const app = express();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: config.FRONTEND_URL,
  }),
);
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.session());

// Routers
app.use("/auth", authRouter);

app.get("/", (_req, res) => {
  res.send("Hello World").status(200);
});

export default app;
