import { strict as assert } from "node:assert";
import sinon from "sinon";
import esmock from "esmock";
import { createMockRequest, createMockResponse } from "./helpers/http.ts";

const controllerPath = "../src/routes/auth/auth.controller.ts";
const userModelPath = "../src/models/user/user.model.ts";
const noteModelPath = "../src/models/notes/notes.model.ts";
const loggerPath = "../src/services/logger.ts";

function buildAuthController() {
	const userModel = {
		checkUser: sinon.stub(),
		createUser: sinon.stub(),
		existsUserWithEmail: sinon.stub(),
		getUserByEmail: sinon.stub(),
		addAuthTypeToUser: sinon.stub(),
		updateUserProfileById: sinon.stub(),
		deleteUserById: sinon.stub(),
	};
	const notesModel = {
		deleteNotesByUserId: sinon.stub(),
	};
	const logger = {
		info: sinon.stub(),
		error: sinon.stub(),
	};

	return {
		userModel,
		notesModel,
		logger,
		load: () =>
			esmock(controllerPath, {
				[userModelPath]: userModel,
				[noteModelPath]: notesModel,
				[loggerPath]: { default: logger },
			}),
	};
}

describe("auth controller", () => {
	it("verifies local users", async () => {
		const { userModel, load } = buildAuthController();
		const user = { id: "user-1", name: "Ada", email: "ada@example.com", type: ["local"] };
		userModel.checkUser.resolves(user);
		const { verifyUser } = await load();
		const done = sinon.stub();

		await verifyUser("ada@example.com", "Password1!", done as never);

		assert.equal(done.calledOnceWithExactly(null, user), true);
	});

	it("rejects invalid local credentials", async () => {
		const { userModel, load } = buildAuthController();
		userModel.checkUser.resolves(null);
		const { verifyUser } = await load();
		const done = sinon.stub();

		await verifyUser("ada@example.com", "bad-password", done as never);

		assert.equal(
			done.calledOnceWithExactly(null, false, { message: "Invalid email or password" }),
			true,
		);
	});

	it("links Google logins to existing users", async () => {
		const { userModel, load } = buildAuthController();
		const user = { id: "user-1", name: "Ada", email: "ada@example.com", type: ["local"] };
		userModel.getUserByEmail.resolves(user);
		const { verifyGoogleUser } = await load();
		const done = sinon.stub();

		await verifyGoogleUser(
			"access-token",
			"refresh-token",
			{
				displayName: "Ada",
				emails: [{ value: "ada@example.com" }],
			},
			done as never,
		);

		assert.equal(userModel.addAuthTypeToUser.calledOnceWithExactly(user, "google"), true);
		assert.equal(done.calledOnceWithExactly(null, user), true);
	});

	it("creates Google users when they do not exist", async () => {
		const { userModel, logger, load } = buildAuthController();
		const user = { id: "user-2", name: "Grace", email: "grace@example.com", type: ["google"] };
		userModel.getUserByEmail.resolves(null);
		userModel.createUser.resolves(user);
		const { verifyGoogleUser } = await load();
		const done = sinon.stub();

		await verifyGoogleUser(
			"access-token",
			"refresh-token",
			{
				displayName: "Grace",
				emails: [{ value: "grace@example.com" }],
			},
			done as never,
		);

		assert.equal(userModel.createUser.calledOnceWithExactly({
			name: "Grace",
			email: "grace@example.com",
			type: ["google"],
		}), true);
		assert.equal(logger.info.calledOnce, true);
		assert.equal(done.calledOnceWithExactly(null, user), true);
	});

	it("rejects Google profiles without an email", async () => {
		const { load } = buildAuthController();
		const { verifyGoogleUser } = await load();
		const done = sinon.stub();

		await verifyGoogleUser("access-token", "refresh-token", { displayName: "Ada" } as never, done as never);

		assert.equal(done.calledOnce, true);
		assert.equal(done.firstCall.args[0] instanceof Error, true);
	});

	it("creates GitHub users when they do not exist", async () => {
		const { userModel, logger, load } = buildAuthController();
		const user = { id: "user-3", name: "Linus", email: "linus@example.com", type: ["github"] };
		userModel.getUserByEmail.resolves(null);
		userModel.createUser.resolves(user);
		const { verifyGitHubUser } = await load();
		const done = sinon.stub();

		await verifyGitHubUser(
			"access-token",
			"refresh-token",
			{
				displayName: "Linus",
				emails: [{ value: "linus@example.com" }],
			},
			done as never,
		);

		assert.equal(userModel.createUser.calledOnceWithExactly({
			name: "Linus",
			email: "linus@example.com",
			type: ["github"],
		}), true);
		assert.equal(logger.info.calledOnce, true);
		assert.equal(done.calledOnceWithExactly(null, user), true);
	});

	it("signs users up and logs them in", async () => {
		const { userModel, load } = buildAuthController();
		const createdUser = { id: "user-4", name: "Ada", email: "ada@example.com", type: ["local"] };
		userModel.existsUserWithEmail.resolves(false);
		userModel.createUser.resolves(createdUser);
		const { signUp } = await load();
		const req = createMockRequest({
			body: { name: "Ada", email: "ada@example.com", password: "Password1!" },
			login: sinon.stub().callsFake((_user, callback) => callback?.()),
		});
		const res = createMockResponse();

		await signUp(req as never, res as never);

		assert.equal(userModel.createUser.calledOnceWithExactly({
			name: "Ada",
			email: "ada@example.com",
			password: "Password1!",
			type: ["local"],
		}), true);
		assert.equal((req.login as sinon.SinonStub).calledOnce, true);
		assert.equal(res.body?.message, "User created and logged in successfully");
		assert.equal(res.body?.user, createdUser);
	});

	it("rejects duplicate signups", async () => {
		const { userModel, load } = buildAuthController();
		userModel.existsUserWithEmail.resolves(true);
		const { signUp } = await load();
		const req = createMockRequest({
			body: { name: "Ada", email: "ada@example.com", password: "Password1!" },
			login: sinon.stub(),
		});
		const res = createMockResponse();

		await signUp(req as never, res as never);

		assert.equal(res.statusCode, 400);
		assert.deepEqual(res.body, { message: "Email is already in use" });
		assert.equal(userModel.createUser.called, false);
	});

	it("updates profiles for authenticated users", async () => {
		const { userModel, load } = buildAuthController();
		const updatedUser = { id: "user-1", name: "Ada Lovelace", email: "ada@example.com", type: ["local"] };
		userModel.updateUserProfileById.resolves(updatedUser);
		const { updateProfile } = await load();
		const req = createMockRequest({
			user: { id: "user-1" },
			body: { name: "Ada Lovelace" },
		});
		const res = createMockResponse();

		await updateProfile(req as never, res as never);

		assert.equal(userModel.updateUserProfileById.calledOnceWithExactly("user-1", { name: "Ada Lovelace" }), true);
		assert.equal(res.body?.user, updatedUser);
	});

	it("rejects profile updates without a name", async () => {
		const { load } = buildAuthController();
		const { updateProfile } = await load();
		const req = createMockRequest({ user: { id: "user-1" }, body: { name: "   " } });
		const res = createMockResponse();

		await updateProfile(req as never, res as never);

		assert.equal(res.statusCode, 400);
		assert.deepEqual(res.body, { message: "Name is required" });
	});

	it("logs users out and clears the session cookie", async () => {
		const { load } = buildAuthController();
		const { logout } = await load();
		const req = createMockRequest({
			user: { id: "user-1" },
			logout: sinon.stub().callsFake((callback) => callback?.()),
			session: {
				destroy: sinon.stub().callsFake((callback) => callback?.()),
			},
		});
		const res = createMockResponse();

		await logout(req as never, res as never);

		assert.equal((req.logout as sinon.SinonStub).calledOnce, true);
		assert.equal((req.session.destroy as sinon.SinonStub).calledOnce, true);
		assert.equal(res.body?.message, "Logged out successfully");
		assert.equal(res.clearCookie.calledOnceWithExactly("session"), true);
	});

	it("deletes accounts and their notes", async () => {
		const { userModel, notesModel, load } = buildAuthController();
		userModel.deleteUserById.resolves(true);
		notesModel.deleteNotesByUserId.resolves(1);
		const { deleteAccount } = await load();
		const req = createMockRequest({
			user: { id: "user-1" },
			logout: sinon.stub().callsFake((callback) => callback?.()),
			session: {
				destroy: sinon.stub().callsFake((callback) => callback?.()),
			},
		});
		const res = createMockResponse();

		await deleteAccount(req as never, res as never);

		assert.equal(notesModel.deleteNotesByUserId.calledOnceWithExactly("user-1"), true);
		assert.equal(userModel.deleteUserById.calledOnceWithExactly("user-1"), true);
		assert.equal(res.body?.message, "Account deleted successfully");
	});
});