import express from "express";
import { ensureAuthenticated } from "../../middlewares/auth/auth.middleware.ts";
import {
	createNote,
	getNote,
	listNotes,
	removeNote,
	updateNote,
} from "./notes.controller.ts";

const notesRouter = express.Router();

notesRouter.use(ensureAuthenticated);

notesRouter.get("/", listNotes);
notesRouter.get("/:id", getNote);
notesRouter.post("/", createNote);
notesRouter.put("/:id", updateNote);
notesRouter.delete("/:id", removeNote);

export default notesRouter;
