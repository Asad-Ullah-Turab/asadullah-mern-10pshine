import express from "express";

const app = express();

app.get("/", (_req, res) => {
  res.send("Hello World").status(200);
});

export default app;
