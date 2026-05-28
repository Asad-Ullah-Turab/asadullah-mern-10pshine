import type { Note } from "../types";

interface NoteCardProps {
  note: Note;
  previewText: string;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({
  note,
  previewText,
  onEdit,
  onDelete,
}: NoteCardProps) {
  return (
    <article
      className="mb-4 break-inside-avoid rounded-[28px] p-4 shadow-[0_16px_50px_rgba(15,23,42,0.09)] ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(15,23,42,0.14)]"
      style={{ backgroundColor: note.color }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-slate-600">
            <span className="rounded-full bg-white/70 px-2.5 py-1 font-semibold text-slate-700">
              {note.category}
            </span>
            {note.pinned && (
              <span className="rounded-full bg-slate-950 px-2.5 py-1 font-semibold text-white">
                Pinned
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-950">{note.title}</h3>
        </div>

        <button
          type="button"
          onClick={() => onDelete(note.id)}
          className="rounded-full bg-white/70 p-2 text-slate-600 transition hover:bg-white hover:text-rose-600"
          aria-label={`Delete ${note.title}`}
        >
          ✕
        </button>
      </div>

      <button
        type="button"
        onClick={() => onEdit(note)}
        className="mt-4 w-full rounded-[22px] bg-white/55 p-4 text-left transition hover:bg-white/80"
      >
        <p className="line-clamp-5 text-sm leading-6 text-slate-800">
          {previewText}
        </p>
      </button>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
        <span>{note.updatedAt}</span>
        <button
          type="button"
          onClick={() => onEdit(note)}
          className="rounded-full bg-slate-950/90 px-3 py-1.5 font-medium text-white transition hover:bg-slate-900"
        >
          Edit note
        </button>
      </div>
    </article>
  );
}
