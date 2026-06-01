import { strict as assert } from "node:assert";
import sinon from "sinon";
import esmock from "esmock";
import { createMockRequest, createMockResponse } from "./helpers/http.ts";

const controllerPath = "../src/routes/notes/notes.controller.ts";
const notesModelPath = "../src/models/notes/notes.model.ts";

function buildNotesController() {
	const notesModel = {
		createNoteForUser: sinon.stub(),
		deleteNoteForUser: sinon.stub(),
		getNoteById: sinon.stub(),
		getNotesByUserId: sinon.stub(),
		updateNoteForUser: sinon.stub(),
	};

	return {
		notesModel,
		load: () => esmock(controllerPath, { [notesModelPath]: notesModel }),
	};
}

describe("notes controller", () => {
	it("lists notes for authenticated users", async () => {
		const { notesModel, load } = buildNotesController();
		const notes = [{ id: "note-1" }, { id: "note-2" }];
		notesModel.getNotesByUserId.resolves(notes);
		const { listNotes } = await load();
		const req = createMockRequest({ user: { id: "user-1" } });
		const res = createMockResponse();

		await listNotes(req as never, res as never);

		assert.equal(notesModel.getNotesByUserId.calledOnceWithExactly("user-1"), true);
		assert.deepEqual(res.body, { notes });
	});

	it("rejects unauthenticated list requests", async () => {
		const { load } = buildNotesController();
		const { listNotes } = await load();
		const req = createMockRequest();
		const res = createMockResponse();

		await listNotes(req as never, res as never);

		assert.equal(res.statusCode, 401);
		assert.deepEqual(res.body, { message: "Unauthorized" });
	});

	it("creates notes for authenticated users", async () => {
		const { notesModel, load } = buildNotesController();
		const note = { id: "note-1", title: "Idea" };
		notesModel.createNoteForUser.resolves(note);
		const { createNote } = await load();
		const req = createMockRequest({
			user: { id: "user-1" },
			body: { title: "Idea", content: "<p>Plan</p>" },
		});
		const res = createMockResponse();

		await createNote(req as never, res as never);

		assert.equal(notesModel.createNoteForUser.calledOnceWithExactly("user-1", { title: "Idea", content: "<p>Plan</p>" }), true);
		assert.equal(res.statusCode, 201);
		assert.deepEqual(res.body, { note });
	});

	it("updates notes and handles missing notes", async () => {
		const { notesModel, load } = buildNotesController();
		notesModel.updateNoteForUser.onFirstCall().resolves(null);
		notesModel.updateNoteForUser.onSecondCall().resolves({ id: "note-1", title: "Updated" });
		const { updateNote } = await load();

		const missingIdReq = createMockRequest({ user: { id: "user-1" }, params: {} });
		const missingIdRes = createMockResponse();
		await updateNote(missingIdReq as never, missingIdRes as never);
		assert.equal(missingIdRes.statusCode, 400);

		const missingNoteReq = createMockRequest({ user: { id: "user-1" }, params: { id: "note-1" }, body: { title: "Updated" } });
		const missingNoteRes = createMockResponse();
		await updateNote(missingNoteReq as never, missingNoteRes as never);
		assert.equal(missingNoteRes.statusCode, 404);

		const foundNoteReq = createMockRequest({ user: { id: "user-1" }, params: { id: "note-1" }, body: { title: "Updated" } });
		const foundNoteRes = createMockResponse();
		await updateNote(foundNoteReq as never, foundNoteRes as never);
		assert.equal(foundNoteRes.body?.note?.title, "Updated");
	});

	it("deletes notes and returns not found for missing notes", async () => {
		const { notesModel, load } = buildNotesController();
		notesModel.deleteNoteForUser.onFirstCall().resolves(null);
		notesModel.deleteNoteForUser.onSecondCall().resolves({ id: "note-1" });
		const { removeNote } = await load();

		const missingNoteReq = createMockRequest({ user: { id: "user-1" }, params: { id: "note-1" } });
		const missingNoteRes = createMockResponse();
		await removeNote(missingNoteReq as never, missingNoteRes as never);
		assert.equal(missingNoteRes.statusCode, 404);

		const foundNoteReq = createMockRequest({ user: { id: "user-1" }, params: { id: "note-1" } });
		const foundNoteRes = createMockResponse();
		await removeNote(foundNoteReq as never, foundNoteRes as never);
		assert.deepEqual(foundNoteRes.body, { message: "Note deleted" });
	});

	it("fetches individual notes", async () => {
		const { notesModel, load } = buildNotesController();
		notesModel.getNoteById.onFirstCall().resolves(null);
		notesModel.getNoteById.onSecondCall().resolves({ id: "note-1", title: "Idea" });
		const { getNote } = await load();

		const missingNoteReq = createMockRequest({ user: { id: "user-1" }, params: { id: "note-1" } });
		const missingNoteRes = createMockResponse();
		await getNote(missingNoteReq as never, missingNoteRes as never);
		assert.equal(missingNoteRes.statusCode, 404);

		const foundNoteReq = createMockRequest({ user: { id: "user-1" }, params: { id: "note-1" } });
		const foundNoteRes = createMockResponse();
		await getNote(foundNoteReq as never, foundNoteRes as never);
		assert.equal(foundNoteRes.body?.note?.title, "Idea");
	});
});