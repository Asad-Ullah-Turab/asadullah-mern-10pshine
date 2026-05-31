import { strict as assert } from "node:assert";
import sinon from "sinon";
import esmock from "esmock";
import { createMockRequest, createMockResponse } from "./helpers/http.ts";

const middlewarePath = "../src/middlewares/logging/http-logger.middleware.ts";
const loggerPath = "../src/services/logger.ts";

function loadHttpLogger(logger: { info: sinon.SinonStub; warn: sinon.SinonStub; error: sinon.SinonStub }) {
	const pinoHttp = sinon.stub().callsFake(() => {
		return (_req: never, _res: never, next: (error?: unknown) => void) => {
			next();
		};
	});

	return esmock(middlewarePath, {
		"pino-http": { pinoHttp },
		[loggerPath]: { default: logger },
	});
}

describe("http logger middleware", () => {
	it("logs successful requests at info level", async () => {
		const logger = {
			info: sinon.stub(),
			warn: sinon.stub(),
			error: sinon.stub(),
		};
		const { default: httpLogger } = await loadHttpLogger(logger);
		const req = createMockRequest({ method: "GET", originalUrl: "/notes", user: { id: "user-1" } });
		const res = createMockResponse();
		const next = sinon.stub();

		httpLogger(req as never, res as never, next as never);
		res.statusCode = 200;
		res.emit("finish");

		assert.equal(next.calledOnce, true);
		assert.equal(logger.info.calledOnce, true);
		assert.equal(logger.warn.called, false);
		assert.equal(logger.error.called, false);
	});

	it("logs client errors at warn level and server errors at error level", async () => {
		const logger = {
			info: sinon.stub(),
			warn: sinon.stub(),
			error: sinon.stub(),
		};
		const { default: httpLogger } = await loadHttpLogger(logger);
		const req = createMockRequest({ method: "POST", originalUrl: "/notes" });
		const res = createMockResponse();
		const next = sinon.stub();

		httpLogger(req as never, res as never, next as never);
		res.statusCode = 404;
		res.emit("finish");
		assert.equal(logger.warn.calledOnce, true);

		const errorRes = createMockResponse();
		httpLogger(req as never, errorRes as never, next as never);
		errorRes.statusCode = 500;
		errorRes.emit("finish");
		assert.equal(logger.error.calledOnce, true);
	});
});