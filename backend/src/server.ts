import http from "http";
import app from "./app.ts";
import config from "./config/env.ts";
import { ConnectToMongodb, disconnectMongodb } from "./services/mongodb.ts";

const PORT = config.PORT;
const server = http.createServer(app);

async function startServer() {
  await ConnectToMongodb();
  server.listen(PORT, () => {
    console.log(`Server is listening on PORT: ${PORT}`);
  });
}

async function stopServer() {
  await disconnectMongodb();
  server.close(() => {
    console.log("Server stopped.");
  });
}

process.on("SIGINT", stopServer);
process.on("SIGTERM", stopServer);

startServer();
