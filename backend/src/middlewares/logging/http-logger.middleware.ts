import { pinoHttp } from "pino-http";
import type { Request, Response, NextFunction } from "express";
import logger from "../../services/logger.ts";

const requestLogger = pinoHttp({
  logger,
  autoLogging: false,
});

function httpLogger(req: Request, res: Response, next: NextFunction) {
  const startedAt = Date.now();

  requestLogger(req, res, (error?: unknown) => {
    if (error) {
      next(error as Error);
      return;
    }

    res.once("finish", () => {
      const durationMs = Date.now() - startedAt;
      const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

      logger[level](
        {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          durationMs,
          userId: req.user && typeof req.user === "object" ? (req.user as { id?: string }).id : undefined,
        },
        "http request completed",
      );
    });

    next();
  });
}

export default httpLogger;