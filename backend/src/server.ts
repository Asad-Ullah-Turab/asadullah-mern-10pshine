import http from "http";
import app from "./app.ts";
import config from "./config/env.ts";

const PORT = config.PORT;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is listening on PORT: ${PORT}`);
});
