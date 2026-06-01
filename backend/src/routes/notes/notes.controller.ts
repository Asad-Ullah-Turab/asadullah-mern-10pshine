import type { Request, Response } from "express";
import type { IUser } from "../../models/user/user.model.ts";
import {
	createNoteForUser,
	deleteNoteForUser,
	getNoteById,
	getNotesByUserId,
	updateNoteForUser,
} from "../../models/notes/notes.model.ts";
import type { INoteInput } from "../../models/notes/notes.model.ts";

function getUserId(req: Request) {
	const user = req.user as IUser | undefined;
	return user?.id ? String(user.id) : null;
}

function getNoteId(req: Request) {
	const noteId = req.params.id;
	return typeof noteId === "string" ? noteId : null;
}

async function listNotes(req: Request, res: Response) {
	const userId = getUserId(req);
	if (!userId) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const notes = await getNotesByUserId(userId);
	return res.json({ notes });
}

async function createNote(req: Request, res: Response) {
	const userId = getUserId(req);
	if (!userId) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const note = await createNoteForUser(userId, req.body as INoteInput);
	req.log?.info({ userId, noteId: note.id }, "note created");
	return res.status(201).json({ note });
}

async function updateNote(req: Request, res: Response) {
	const userId = getUserId(req);
	if (!userId) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const noteId = getNoteId(req);
	if (!noteId) {
		return res.status(400).json({ message: "Note id is required" });
	}

	const note = await updateNoteForUser(
		userId,
		noteId,
		req.body as INoteInput,
	);

	if (!note) {
		return res.status(404).json({ message: "Note not found" });
	}
	req.log?.info({ userId, noteId }, "note updated");

	return res.json({ note });
}

async function removeNote(req: Request, res: Response) {
	const userId = getUserId(req);
	if (!userId) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const noteId = getNoteId(req);
	if (!noteId) {
		return res.status(400).json({ message: "Note id is required" });
	}

	const note = await deleteNoteForUser(userId, noteId);
	if (!note) {
		return res.status(404).json({ message: "Note not found" });
	}
	req.log?.info({ userId, noteId }, "note deleted");

	return res.json({ message: "Note deleted" });
}

async function getNote(req: Request, res: Response) {
	const userId = getUserId(req);
	if (!userId) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const noteId = getNoteId(req);
	if (!noteId) {
		return res.status(400).json({ message: "Note id is required" });
	}

	const note = await getNoteById(userId, noteId);
	if (!note) {
		return res.status(404).json({ message: "Note not found" });
	}

	return res.json({ note });
}

export { createNote, getNote, listNotes, removeNote, updateNote };
