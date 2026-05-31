import { strict as assert } from "node:assert";
import sinon from "sinon";
import passport from "passport";
import logger from "../src/services/logger.ts";
import {
	ensureAuthenticated,
	localAuthMiddleware,
	validateEmailAndPassword,
} from "../src/middlewares/auth/auth.middleware.ts";
import { createMockRequest, createMockResponse } from "./helpers/http.ts";

describe("auth middleware", () => {
	afterEach(() => {
		sinon.restore();
	});

	it("rejects malformed signup payloads", () => {
		const req = createMockRequest({ body: {} });
		const res = createMockResponse();
		const next = sinon.stub();

		validateEmailAndPassword(req as never, res as never, next);

		assert.equal(res.statusCode, 400);
		assert.deepEqual(res.body, {
			message: "Name, Email and Password are required",
		});
		assert.equal(next.called, false);
	});

	it("rejects invalid login email and password formats", () => {
		const invalidEmailReq = createMockRequest({
			body: { name: "Ada", email: "not-an-email", password: "Passw0rd!" },
		});
		const invalidEmailRes = createMockResponse();

		validateEmailAndPassword(invalidEmailReq as never, invalidEmailRes as never, sinon.stub());

		assert.equal(invalidEmailRes.statusCode, 400);
		assert.deepEqual(invalidEmailRes.body, { message: "Invalid email format" });

		const invalidPasswordReq = createMockRequest({
			body: { name: "Ada", email: "ada@example.com", password: "password" },
		});
		const invalidPasswordRes = createMockResponse();

		validateEmailAndPassword(invalidPasswordReq as never, invalidPasswordRes as never, sinon.stub());

		assert.equal(invalidPasswordRes.statusCode, 400);
		assert.match(
			String(invalidPasswordRes.body?.message),
			/Password must be 10-20 characters long/,
		);
	});

	it("passes valid signup payloads to next", () => {
		const req = createMockRequest({
			body: {
				name: "Ada",
				email: "ada@example.com",
				password: "Password1!",
			},
		});
		const res = createMockResponse();
		const next = sinon.stub();

		validateEmailAndPassword(req as never, res as never, next);

		assert.equal(next.calledOnce, true);
	});

	it("allows authenticated requests through", () => {
		const req = createMockRequest({ isAuthenticated: () => true });
		const res = createMockResponse();
		const next = sinon.stub();

		ensureAuthenticated(req as never, res as never, next);

		assert.equal(next.calledOnce, true);
		assert.equal(res.statusCode, undefined);
	});

	it("rejects unauthenticated requests", () => {
		const req = createMockRequest({ path: "/notes", method: "GET" });
		const res = createMockResponse();
		const next = sinon.stub();
		const warnStub = sinon.stub(logger, "warn");

		ensureAuthenticated(req as never, res as never, next);

		assert.equal(next.called, false);
		assert.equal(res.statusCode, 401);
		assert.deepEqual(res.body, { success: false, message: "Unauthorized" });
		assert.equal(warnStub.called, true);
	});

	it("logs in users with the local strategy", () => {
		const authenticateStub = sinon.stub(passport, "authenticate").callsFake((_strategy, callback) => {
			return (req: never, res: never, next: never) => {
				callback(null, { id: "user-1", email: "ada@example.com" }, { message: "ok" });
				return next;
			};
		});
		const infoStub = sinon.stub(logger, "info");
		const req = createMockRequest({ body: { email: "ada@example.com" } });
		(req as { logIn: sinon.SinonStub }).logIn = sinon.stub().callsFake((_user, done) => done?.());
		const res = createMockResponse();
		const next = sinon.stub();

		localAuthMiddleware(req as never, res as never, next as never);

		assert.equal(authenticateStub.calledOnceWithExactly("local", sinon.match.func), true);
		assert.equal((req.logIn as sinon.SinonStub).calledOnce, true);
		assert.equal(res.body?.success, true);
		assert.equal(infoStub.called, true);
		assert.equal(next.called, false);
	});

	it("returns 401 when the local strategy does not authenticate", () => {
		sinon.stub(passport, "authenticate").callsFake((_strategy, callback) => {
			return (req: never, res: never, next: never) => {
				callback(null, false, { message: "Invalid email or password" });
				return next;
			};
		});
		const warnStub = sinon.stub(logger, "warn");
		const req = createMockRequest({ body: { email: "bad@example.com" } });
		const res = createMockResponse();
		const next = sinon.stub();

		localAuthMiddleware(req as never, res as never, next as never);

		assert.equal(res.statusCode, 401);
		assert.deepEqual(res.body, {
			success: false,
			message: "Invalid email or password",
		});
		assert.equal(warnStub.called, true);
		assert.equal((req.logIn as sinon.SinonStub).called, false);
		assert.equal(next.called, false);
	});
});