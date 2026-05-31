import { strict as assert } from "node:assert";
import sinon from "sinon";
import esmock from "esmock";

const configModulePath = "../src/config/config.ts";

const requiredEnv = {
	MONGO_URI: "mongodb://localhost:27017/notes-test",
	SESSION_SECRET_01: "secret-one",
	SESSION_SECRET_02: "secret-two",
	GOOGLE_CLIENT_ID: "google-client-id",
	GOOGLE_CLIENT_SECRET: "google-client-secret",
	GITHUB_CLIENT_ID: "github-client-id",
	GITHUB_CLIENT_SECRET: "github-client-secret",
};

function snapshotEnv() {
	return {
		PORT: process.env.PORT,
		FRONTEND_URL: process.env.FRONTEND_URL,
		...requiredEnv,
	};
}

function restoreEnv(snapshot: Record<string, string | undefined>) {
	for (const [key, value] of Object.entries(snapshot)) {
		if (value === undefined) {
			delete process.env[key];
		} else {
			process.env[key] = value;
		}
	}
}

async function loadConfig() {
	return (await esmock(configModulePath, {
		dotenv: {
			default: {
				config: sinon.stub().returns(undefined),
			},
		},
	})).default as {
		PORT: number;
		MONGO_URI: string;
		SESSION_SECRET_01: string;
		SESSION_SECRET_02: string;
		FRONTEND_URL: string;
		GOOGLE_CLIENT_ID: string;
		GOOGLE_CLIENT_SECRET: string;
		GITHUB_CLIENT_ID: string;
		GITHUB_CLIENT_SECRET: string;
	};
}

describe("config", () => {
	it("loads required settings and defaults", async () => {
		const snapshot = snapshotEnv();
		Object.assign(process.env, requiredEnv, {
			PORT: "4321",
			FRONTEND_URL: "http://example.test",
		});

		try {
			const config = await loadConfig();

			assert.equal(config.PORT, 4321);
			assert.equal(config.MONGO_URI, requiredEnv.MONGO_URI);
			assert.equal(config.SESSION_SECRET_01, requiredEnv.SESSION_SECRET_01);
			assert.equal(config.SESSION_SECRET_02, requiredEnv.SESSION_SECRET_02);
			assert.equal(config.FRONTEND_URL, "http://example.test");
			assert.equal(config.GOOGLE_CLIENT_ID, requiredEnv.GOOGLE_CLIENT_ID);
			assert.equal(config.GOOGLE_CLIENT_SECRET, requiredEnv.GOOGLE_CLIENT_SECRET);
			assert.equal(config.GITHUB_CLIENT_ID, requiredEnv.GITHUB_CLIENT_ID);
			assert.equal(config.GITHUB_CLIENT_SECRET, requiredEnv.GITHUB_CLIENT_SECRET);
		} finally {
			restoreEnv(snapshot);
		}
	});

	it("throws when a required variable is missing", async () => {
		const snapshot = snapshotEnv();
		Object.assign(process.env, requiredEnv);
		delete process.env.MONGO_URI;

		try {
			await assert.rejects(loadConfig(), /MONGO_URI is required/);
		} finally {
			restoreEnv(snapshot);
		}
	});
});