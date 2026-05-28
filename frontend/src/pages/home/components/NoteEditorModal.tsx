import type { Dispatch, SetStateAction } from "react";
import type { CategoryOption, Note, NoteDraft } from "../types";
import { RichTextEditor } from "./RichTextEditor";

interface NoteEditorModalProps {
  open: boolean;
  selectedNote: Note | null;
  draft: NoteDraft;
  noteColors: string[];
  categories: CategoryOption[];
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onDraftChange: Dispatch<SetStateAction<NoteDraft>>;
}

export function NoteEditorModal({
  open,
  selectedNote,
  draft,
  noteColors,
  categories,
  isSaving,
  onClose,
  onSave,
  onDelete,
  onDraftChange,
}: NoteEditorModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="w-full max-w-4xl overflow-hidden rounded-4xl bg-[#fffdf7] shadow-[0_30px_120px_rgba(15,23,42,0.35)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Note editor
            </p>
            <h3 className="text-lg font-semibold text-slate-900">
              {selectedNote ? "Edit note" : "Create note"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            <input
              type="text"
              value={draft.title}
              onChange={(event) =>
                onDraftChange((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Note title"
              className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-lg font-semibold text-slate-900 outline-none transition focus:border-amber-300"
            />

            <RichTextEditor
              value={draft.content}
              onChange={(content) =>
                onDraftChange((current) => ({ ...current, content }))
              }
            />
          </div>

          <div className="space-y-4 rounded-[28px] bg-slate-50 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Color
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {noteColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      onDraftChange((current) => ({ ...current, color }))
                    }
                    className={`h-10 w-10 rounded-full border-2 transition ${
                      draft.color === color
                        ? "border-slate-900 scale-105"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select note color ${color}`}
                  />
                ))}
              </div>
            </div>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Category
              </span>
              <select
                value={draft.category}
                onChange={(event) =>
                  onDraftChange((current) => ({
                    ...current,
                    category: event.target.value as NoteDraft["category"],
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-amber-300"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800">
              <input
                type="checkbox"
                checked={draft.pinned}
                onChange={(event) =>
                  onDraftChange((current) => ({
                    ...current,
                    pinned: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-900"
              />
              Pin this note
            </label>

            <div className="grid gap-2">
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {isSaving ? "Saving..." : "Save note"}
              </button>

              {selectedNote && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(selectedNote.id);
                    onClose();
                  }}
                  disabled={isSaving}
                  className="rounded-full bg-rose-100 px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-200"
                >
                  Delete note
                </button>
              )}
            </div>

            <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-slate-700">
              Notes are stored in MongoDB for the signed-in session and sync as
              soon as you save.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
