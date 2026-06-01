import { strict as assert } from "node:assert";
import sinon from "sinon";
import esmock from "esmock";

const modelPath = "../src/models/notes/notes.model.ts";
const notesMongoosePath = "../src/models/notes/notes.mongoose.ts";

function buildNotesModel() {
	const noteModel = {
		find: sinon.stub(),
		findOne: sinon.stub(),
		create: sinon.stub(),
		findOneAndUpdate: sinon.stub(),
		findOneAndDelete: sinon.stub(),
		deleteMany: sinon.stub(),
	};

	return {
		noteModel,
		load: () => esmock(modelPath, { [notesMongoosePath]: { default: noteModel } }),
	};
}

function createNoteDoc(overrides: Record<string, unknown> = {}) {
	return {
		_id: "note-1",
		userId: "user-1",
		title: "Idea",
		content: "<p>Plan</p>",
		color: "#fff7b2",
		category: "Ideas",
		pinned: false,
		createdAt: new Date("2026-01-01T00:00:00.000Z"),
		updatedAt: new Date("2026-01-02T00:00:00.000Z"),
		...overrides,
	};
}

describe("notes model service", () => {
	it("lists notes for a user", async () => {
		const { noteModel, load } = buildNotesModel();
		const chain = { sort: sinon.stub().returns([createNoteDoc(), createNoteDoc({ _id: "note-2" })]) };
		noteModel.find.returns(chain as never);
		const { getNotesByUserId } = await load();

		const notes = await getNotesByUserId("user-1");

		assert.equal(noteModel.find.calledOnceWithExactly({ userId: "user-1" }), true);
		assert.equal(chain.sort.calledOnceWithExactly({ pinned: -1, updatedAt: -1 }), true);
		assert.equal(notes[0].id, "note-1");
		assert.equal(notes[0].createdAt, "2026-01-01T00:00:00.000Z");
	});

	it("looks up a single note by id", async () => {
		const { noteModel, load } = buildNotesModel();
		noteModel.findOne.resolves(createNoteDoc());
		const { getNoteById } = await load();

		const note = await getNoteById("user-1", "note-1");

		assert.equal(note?.id, "note-1");
		assert.equal(noteModel.findOne.calledOnceWithExactly({ _id: "note-1", userId: "user-1" }), true);
	});

	it("normalizes note creation input", async () => {
		const { noteModel, load } = buildNotesModel();
		noteModel.create.resolves(createNoteDoc());
		const { createNoteForUser } = await load();

		const note = await createNoteForUser("user-1", {
			title: "   ",
			content: "   ",
			color: "   ",
			category: "Unsupported" as never,
			pinned: 1 as never,
		});

		assert.equal(noteModel.create.calledOnce, true);
		assert.deepEqual(noteModel.create.firstCall.args[0], {
			userId: "user-1",
			title: "Untitled note",
			content: "<p></p>",
			color: "#fff7b2",
			category: "Ideas",
			pinned: true,
		});
		assert.equal(note?.title, "Idea");
	});

	it("updates and deletes notes", async () => {
		const { noteModel, load } = buildNotesModel();
		noteModel.findOneAndUpdate.resolves(createNoteDoc({ title: "Updated" }));
		noteModel.findOneAndDelete.resolves(createNoteDoc());
		noteModel.deleteMany.resolves({ deletedCount: 3 });
		const { updateNoteForUser, deleteNoteForUser, deleteNotesByUserId } = await load();

		const updatedNote = await updateNoteForUser("user-1", "note-1", { title: "Updated" });
		assert.equal(noteModel.findOneAndUpdate.calledOnce, true);
		assert.equal(updatedNote?.title, "Updated");

		const deletedNote = await deleteNoteForUser("user-1", "note-1");
		assert.equal(noteModel.findOneAndDelete.calledOnceWithExactly({ _id: "note-1", userId: "user-1" }), true);
		assert.equal(deletedNote?.id, "note-1");

		assert.equal(await deleteNotesByUserId("user-1"), 3);
	});
});