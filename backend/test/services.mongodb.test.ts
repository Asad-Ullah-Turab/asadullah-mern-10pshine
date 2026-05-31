import { strict as assert } from "node:assert";
import sinon from "sinon";
import esmock from "esmock";

const servicePath = "../src/services/mongodb.ts";
const configPath = "../src/config/config.ts";
const loggerPath = "../src/services/logger.ts";
const mongoosePath = "mongoose";

function buildMongoService() {
	const connect = sinon.stub().resolves(undefined);
	const disconnect = sinon.stub().resolves(undefined);
	const command = sinon.stub().resolves({ ok: 1 });
	const logger = {
		info: sinon.stub(),
		error: sinon.stub(),
	};
	const mongoose = {
		connect,
		disconnect,
		connection: {
			db: {
				admin: () => ({ command }),
			},
		},
	};

	return {
		connect,
		disconnect,
		command,
		logger,
		load: () =>
			esmock(servicePath, {
				[configPath]: {
					default: { MONGO_URI: "mongodb://localhost:27017/test" },
				},
				[loggerPath]: { default: logger },
				[mongoosePath]: { default: mongoose },
			}),
	};
}

describe("mongodb service", () => {
	it("connects and pings MongoDB", async () => {
		const { connect, command, logger, load } = buildMongoService();
		const { connectToMongodb } = await load();

		await connectToMongodb();

		assert.equal(connect.calledOnce, true);
		assert.equal(command.calledOnceWithExactly({ ping: 1 }), true);
		assert.equal(logger.info.calledOnce, true);
	});

	it("throws when MongoDB does not expose a database handle", async () => {
		const { connect, logger } = buildMongoService();
		const service = await esmock(servicePath, {
			[configPath]: {
				default: { MONGO_URI: "mongodb://localhost:27017/test" },
			},
			[loggerPath]: { default: logger },
			[mongoosePath]: {
				default: {
					connect,
					disconnect: sinon.stub().resolves(undefined),
					connection: { db: null },
				},
			},
		});

		await assert.rejects(service.connectToMongodb(), /Failed to get MongoDB database instance/);
		assert.equal(logger.error.called, true);
	});

	it("disconnects from MongoDB", async () => {
		const { disconnect, logger, load } = buildMongoService();
		const { disconnectMongodb } = await load();

		await disconnectMongodb();

		assert.equal(disconnect.calledOnce, true);
		assert.equal(logger.info.calledOnce, true);
	});
});