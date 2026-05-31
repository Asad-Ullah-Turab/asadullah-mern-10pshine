import { Types } from "mongoose";
import type { NoteCategory, NoteDocument } from "./notes.mongoose.ts";
import noteModel from "./notes.mongoose.ts";

export interface INote {
	id: string;
	userId: string;
	title: string;
	content: string;
	color: string;
	category: NoteCategory;
	pinned: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface INoteInput {
	title?: string;
	content?: string;
	color?: string;
	category?: NoteCategory;
	pinned?: boolean;
}

interface NoteDocumentLike {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	title: string;
	content: string;
	color: string;
	category: NoteCategory;
	pinned: boolean;
	createdAt?: Date | string;
	updatedAt?: Date | string;
}

const allowedCategories: NoteCategory[] = [
	"Ideas",
	"Work",
	"Personal",
	"Research",
];

function normalizeNoteInput(input: INoteInput) {
	const title = input.title?.trim();
	const content = input.content?.trim();
	const color = input.color?.trim();
	const category = allowedCategories.includes(input.category ?? "Ideas")
		? input.category ?? "Ideas"
		: "Ideas";

	return {
		title: title && title.length > 0 ? title : "Untitled note",
		content: content && content.length > 0 ? content : "<p></p>",
		color: color && color.length > 0 ? color : "#fff7b2",
		category,
		pinned: Boolean(input.pinned),
	};
}

function serializeNote(note: NoteDocumentLike): INote {
	const createdAt =
		note.createdAt instanceof Date
			? note.createdAt
			: new Date(note.createdAt ?? Date.now());
	const updatedAt =
		note.updatedAt instanceof Date
			? note.updatedAt
			: new Date(note.updatedAt ?? Date.now());

	return {
		id: note._id.toString(),
		userId: note.userId.toString(),
		title: note.title,
		content: note.content,
		color: note.color,
		category: note.category,
		pinned: note.pinned,
		createdAt: createdAt.toISOString(),
		updatedAt: updatedAt.toISOString(),
	};
}

async function getNotesByUserId(userId: string) {
	const notes = await noteModel
		.find({ userId })
		.sort({ pinned: -1, updatedAt: -1 });

	return notes.map(serializeNote);
}

async function getNoteById(userId: string, noteId: string) {
	const note = await noteModel.findOne({ _id: noteId, userId });
	return note ? serializeNote(note) : null;
}

async function createNoteForUser(userId: string, input: INoteInput) {
	const note = await noteModel.create({
		userId,
		...normalizeNoteInput(input),
	});

	return serializeNote(note);
}

async function updateNoteForUser(
	userId: string,
	noteId: string,
	input: INoteInput,
) {
	const note = await noteModel.findOneAndUpdate(
		{ _id: noteId, userId },
		normalizeNoteInput(input),
		{ new: true, runValidators: true },
	);

	return note ? serializeNote(note) : null;
}

async function deleteNoteForUser(userId: string, noteId: string) {
	const note = await noteModel.findOneAndDelete({ _id: noteId, userId });
	return note ? serializeNote(note) : null;
}

async function deleteNotesByUserId(userId: string) {
	const result = await noteModel.deleteMany({ userId });
	return result.deletedCount ?? 0;
}

export {
	createNoteForUser,
	deleteNoteForUser,
	deleteNotesByUserId,
	getNoteById,
	getNotesByUserId,
	updateNoteForUser,
};
