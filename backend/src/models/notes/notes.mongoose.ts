import mongoose, { type HydratedDocument, type Types } from "mongoose";

export type NoteCategory = "Ideas" | "Work" | "Personal" | "Research";

export interface INoteSchema {
	userId: Types.ObjectId;
	title: string;
	content: string;
	color: string;
	category: NoteCategory;
	pinned: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

export type NoteDocument = HydratedDocument<
	INoteSchema & {
		createdAt: Date;
		updatedAt: Date;
	}
>;

const noteSchema = new mongoose.Schema<INoteSchema>(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		title: { type: String, required: true, trim: true, default: "Untitled note" },
		content: { type: String, required: true, default: "<p></p>" },
		color: { type: String, required: true, default: "#fff7b2" },
		category: {
			type: String,
			enum: ["Ideas", "Work", "Personal", "Research"],
			required: true,
			default: "Ideas",
		},
		pinned: { type: Boolean, default: false },
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

noteSchema.index({ userId: 1, pinned: -1, updatedAt: -1 });

const noteModel = mongoose.model<INoteSchema>("Note", noteSchema);

export default noteModel;
