import { strict as assert } from "node:assert";
import sinon from "sinon";
import esmock from "esmock";

const modelPath = "../src/models/user/user.model.ts";
const mongoosePath = "../src/models/user/user.mongoose.ts";
const loggerPath = "../src/services/logger.ts";

function buildUserModel() {
	const userModel = {
		findOne: sinon.stub(),
		create: sinon.stub(),
		findById: sinon.stub(),
		findByIdAndUpdate: sinon.stub(),
		findByIdAndDelete: sinon.stub(),
	};
	const logger = {
		info: sinon.stub(),
		error: sinon.stub(),
	};

	return {
		userModel,
		load: () =>
			esmock(modelPath, {
				[mongoosePath]: { default: userModel },
				[loggerPath]: { default: logger },
			}),
	};
}

function createUserDoc(overrides: Record<string, unknown> = {}) {
	return {
		_id: "user-1",
		name: "Ada",
		email: "ada@example.com",
		type: ["local"],
		password: "hashed-password",
		comparePassword: sinon.stub().resolves(true),
		save: sinon.stub().resolves(undefined),
		...overrides,
	};
}

describe("user model service", () => {
	it("checks passwords against stored users", async () => {
		const { userModel, load } = buildUserModel();
		userModel.findOne.resolves(createUserDoc());
		const { checkUser } = await load();

		const user = await checkUser({ email: "ada@example.com", password: "Password1!" });

		assert.equal(user?.email, "ada@example.com");
		assert.equal((userModel.findOne.firstCall.args[0] as { email: string }).email, "ada@example.com");
	});

	it("returns null for invalid passwords", async () => {
		const { userModel, load } = buildUserModel();
		userModel.findOne.resolves(createUserDoc({ comparePassword: sinon.stub().resolves(false) }));
		const { checkUser } = await load();

		const user = await checkUser({ email: "ada@example.com", password: "wrong" });

		assert.equal(user, null);
	});

	it("checks whether users exist by email", async () => {
		const { userModel, load } = buildUserModel();
		userModel.findOne.resolves(createUserDoc());
		const { existsUserWithEmail } = await load();

		assert.equal(await existsUserWithEmail("ada@example.com"), true);
		userModel.findOne.resolves(null);
		assert.equal(await existsUserWithEmail("missing@example.com"), false);
	});

	it("creates and maps new users", async () => {
		const { userModel, load } = buildUserModel();
		userModel.create.resolves(createUserDoc());
		const { createUser } = await load();

		const user = await createUser({ name: "Ada", email: "ada@example.com", type: ["local"], password: "Password1!" });

		assert.equal(userModel.create.calledOnceWithExactly({
			name: "Ada",
			email: "ada@example.com",
			type: ["local"],
			password: "Password1!",
		}), true);
		assert.equal(user?.id, "user-1");
	});

	it("adds new auth types to existing users", async () => {
		const { userModel, load } = buildUserModel();
		const userDoc = createUserDoc({ type: ["local"] });
		userModel.findById.resolves(userDoc);
		const { addAuthTypeToUser } = await load();

		const user = await addAuthTypeToUser(
			{ id: "user-1", name: "Ada", email: "ada@example.com", type: ["local"] },
			"google",
		);

		assert.equal((userDoc.type as string[]).includes("google"), true);
		assert.equal((userDoc.save as sinon.SinonStub).calledOnce, true);
		assert.equal(user?.type.includes("google"), true);
	});

	it("returns null when the user to update is missing", async () => {
		const { userModel, load } = buildUserModel();
		userModel.findById.resolves(null);
		const { addAuthTypeToUser } = await load();

		assert.equal(
			await addAuthTypeToUser(
				{ id: "user-1", name: "Ada", email: "ada@example.com", type: ["local"] },
				"google",
			),
			null,
		);
	});

	it("updates user profiles with trimmed names", async () => {
		const { userModel, load } = buildUserModel();
		userModel.findByIdAndUpdate.resolves(createUserDoc({ name: "Ada Lovelace" }));
		const { updateUserProfileById } = await load();

		const user = await updateUserProfileById("user-1", { name: "  Ada Lovelace  " });

		assert.equal(userModel.findByIdAndUpdate.calledOnce, true);
		assert.equal(user?.name, "Ada Lovelace");
	});

	it("deletes users by id", async () => {
		const { userModel, load } = buildUserModel();
		userModel.findByIdAndDelete.resolves(createUserDoc());
		const { deleteUserById } = await load();

		assert.equal(await deleteUserById("user-1"), true);
		userModel.findByIdAndDelete.resolves(null);
		assert.equal(await deleteUserById("missing"), false);
	});
});