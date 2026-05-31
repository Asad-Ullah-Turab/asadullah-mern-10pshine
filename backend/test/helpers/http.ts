import { EventEmitter } from "node:events";
import sinon from "sinon";

function createMockResponse() {
	const res = new EventEmitter() as EventEmitter & {
		statusCode?: number;
		body?: unknown;
		status: sinon.SinonStub;
		json: sinon.SinonStub;
		send: sinon.SinonStub;
		clearCookie: sinon.SinonStub;
		redirect: sinon.SinonStub;
	};

	res.status = sinon.stub().callsFake((statusCode: number) => {
		res.statusCode = statusCode;
		return res;
	});
	res.json = sinon.stub().callsFake((body: unknown) => {
		res.body = body;
		return res;
	});
	res.send = sinon.stub().callsFake((body: unknown) => {
		res.body = body;
		return res;
	});
	res.clearCookie = sinon.stub().returns(res);
	res.redirect = sinon.stub().returns(res);

	return res;
}

function createMockRequest(overrides: Record<string, unknown> = {}) {
	return {
		body: {},
		params: {},
		query: {},
		user: undefined,
		path: "/",
		method: "GET",
		originalUrl: "/",
		log: {
			info: sinon.stub(),
			warn: sinon.stub(),
			error: sinon.stub(),
		},
		logIn: sinon.stub(),
		logout: sinon.stub(),
		session: {
			destroy: sinon.stub(),
		},
		isAuthenticated: sinon.stub().returns(false),
		...overrides,
	};
}

export { createMockRequest, createMockResponse };