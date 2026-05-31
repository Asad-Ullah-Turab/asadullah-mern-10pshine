import express from "express";
import cors from "cors";
import authRouter from "./routes/auth/auth.router.ts";
import notesRouter from "./routes/notes/notes.router.ts";
import config from "./config/config.ts";
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";

const app = express();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(
  session({
    name: "session",
    secret: [config.SESSION_SECRET_01, config.SESSION_SECRET_02],
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
    store: MongoStore.create({
      mongoUrl: config.MONGO_URI,
      ttl: 24 * 60 * 60, // 1 day
    }),
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Routers
app.use("/auth", authRouter);
app.use("/notes", notesRouter);

app.get("/", (_req, res) => {
  res.send("Hello World").status(200);
});

export default app;
