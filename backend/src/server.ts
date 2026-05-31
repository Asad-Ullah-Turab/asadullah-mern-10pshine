import http from "http";
import app from "./app.ts";
import config from "./config/config.ts";
import { connectToMongodb, disconnectMongodb } from "./services/mongodb.ts";
import logger from "./services/logger.ts";

const PORT = config.PORT;
const server = http.createServer(app);

async function startServer() {
  await connectToMongodb();
  server.listen(PORT, () => {
    logger.info({ port: PORT }, "server is listening");
  });
}

async function stopServer() {
  await disconnectMongodb();
  server.close(() => {
    logger.info("server stopped");
  });
}

process.on("SIGINT", stopServer);
process.on("SIGTERM", stopServer);

startServer();
