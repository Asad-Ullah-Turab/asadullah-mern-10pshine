import { useContext, useMemo, useState } from "react";
import ReactQuill from "react-quill-new";
import "quill/dist/quill.snow.css";
import UserContext from "../../store/UserContext";
import Logo from "../../components/ui/Logo";

type NoteCategory = "Ideas" | "Work" | "Personal" | "Research";

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  category: NoteCategory;
  updatedAt: string;
  pinned: boolean;
}

interface NoteDraft {
  title: string;
  content: string;
  color: string;
  category: NoteCategory;
  pinned: boolean;
}

const categories: Array<{ label: string; value: NoteCategory | "All" }> = [
  { label: "All notes", value: "All" },
  { label: "Ideas", value: "Ideas" },
  { label: "Work", value: "Work" },
  { label: "Personal", value: "Personal" },
  { label: "Research", value: "Research" },
];

const noteColors = [
  "#fff7b2",
  "#dbeafe",
  "#d9f99d",
  "#fee2e2",
  "#f5d0fe",
  "#f3f4f6",
];

const initialNotes: Note[] = [
  {
    id: "1",
    title: "Landing page copy",
    content:
      "<p>Use a cleaner promise for Keepit. Show quick capture, beautiful cards, and fast editing.</p><ul><li>Lead with speed</li><li>Highlight rich text</li><li>Keep it minimal</li></ul>",
    color: "#fff7b2",
    category: "Work",
    updatedAt: "2h ago",
    pinned: true,
  },
  {
    id: "2",
    title: "Weekend ideas",
    content:
      "<p>Record voice notes on mobile, capture receipts, and group quick thoughts by color.</p>",
    color: "#dbeafe",
    category: "Ideas",
    updatedAt: "Yesterday",
    pinned: false,
  },
  {
    id: "3",
    title: "Client follow-up",
    content:
      "<p>Send the revised notes UI to the team once the backend mock API is ready.</p>",
    color: "#d9f99d",
    category: "Work",
    updatedAt: "3d ago",
    pinned: false,
  },
  {
    id: "4",
    title: "Reading list",
    content:
      "<p>Read about note-taking workflows, visual hierarchy, and empty-state polish.</p>",
    color: "#f5d0fe",
    category: "Research",
    updatedAt: "1w ago",
    pinned: false,
  },
];

const defaultDraft: NoteDraft = {
  title: "",
  content: "<p></p>",
  color: noteColors[0],
  category: "Ideas",
  pinned: false,
};

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getPreviewText(html: string) {
  const text = stripHtml(html);
  return text.length > 140 ? `${text.slice(0, 140)}…` : text;
}

function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["blockquote", "link", "clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "align",
    "blockquote",
    "link",
  ];

  return (
    <div className="overflow-hidden rounded-[28px] bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-950/5">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder="Capture your thoughts, tasks, and ideas..."
        modules={modules}
        formats={formats}
      />
    </div>
  );
}

function Home() {
  const { user, loading, isAuthenticated } = useContext(UserContext);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [filter, setFilter] =
    useState<(typeof categories)[number]["value"]>("All");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<NoteDraft>(defaultDraft);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );

  const visibleNotes = useMemo(() => {
    const sorted = [...notes].sort((left, right) => {
      if (left.pinned === right.pinned) {
        return (
          Number(new Date(right.updatedAt)) - Number(new Date(left.updatedAt))
        );
      }

      return left.pinned ? -1 : 1;
    });

    return sorted.filter(
      (note) => filter === "All" || note.category === filter,
    );
  }, [filter, notes]);

  const openComposer = (note?: Note) => {
    if (note) {
      setSelectedNoteId(note.id);
      setDraft({
        title: note.title,
        content: note.content,
        color: note.color,
        category: note.category,
        pinned: note.pinned,
      });
    } else {
      setSelectedNoteId(null);
      setDraft(defaultDraft);
    }

    setIsComposerOpen(true);
  };

  const closeComposer = () => {
    setIsComposerOpen(false);
  };

  const saveNote = () => {
    const trimmedTitle = draft.title.trim();
    const noteTitle =
      trimmedTitle || getPreviewText(draft.content) || "Untitled note";

    if (selectedNote) {
      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === selectedNote.id
            ? {
                ...note,
                title: noteTitle,
                content: draft.content,
                color: draft.color,
                category: draft.category,
                pinned: draft.pinned,
                updatedAt: "Just now",
              }
            : note,
        ),
      );
    } else {
      const nextNote: Note = {
        id: `${Date.now()}`,
        title: noteTitle,
        content: draft.content,
        color: draft.color,
        category: draft.category,
        updatedAt: "Just now",
        pinned: draft.pinned,
      };

      setNotes((currentNotes) => [nextNote, ...currentNotes]);
      setSelectedNoteId(nextNote.id);
    }

    setIsComposerOpen(false);
  };

  const deleteNote = (id: string) => {
    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      setIsComposerOpen(false);
    }
  };

  const profileLabel = user?.name ?? "Guest profile";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(253,224,71,0.22),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(251,146,60,0.16),_transparent_22%),linear-gradient(180deg,_#fffaf0_0%,_#f8fafc_36%,_#eef2ff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-[28px] border border-white/60 bg-white/75 px-4 py-3 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Logo className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-black/90 p-1.5 shadow-lg shadow-amber-400/10" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500">
                Keepit
              </p>
              <h1 className="text-lg font-semibold text-slate-900">
                Notes that feel quick to capture
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => openComposer()}
            >
              + New note
            </button>
          </div>
        </header>

        {loading ? (
          <div className="grid flex-1 place-items-center rounded-[32px] border border-white/60 bg-white/70 text-slate-600 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            Loading notes...
          </div>
        ) : isAuthenticated() ? (
          <main className="grid flex-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="rounded-[32px] border border-white/70 bg-white/75 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
              <button
                type="button"
                className="mb-5 flex w-full items-center gap-3 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:bg-white"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-semibold text-white shadow-lg shadow-orange-500/20">
                  {(user?.name ?? "G").slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900">
                    {profileLabel}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {user?.email ?? "Signed in preview"}
                  </span>
                </span>
              </button>

              <div className="space-y-2">
                <p className="px-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Categories
                </p>
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFilter(category.value)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition ${
                      filter === category.value
                        ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20"
                        : "bg-transparent text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{category.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        filter === category.value
                          ? "bg-white/15"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {category.value === "All"
                        ? notes.length
                        : notes.filter(
                            (note) => note.category === category.value,
                          ).length}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] bg-gradient-to-br from-amber-100 to-orange-100 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Quick actions
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Create a note, color it, and assign a category before the
                  backend is ready.
                </p>
                <button
                  type="button"
                  onClick={() => openComposer()}
                  className="mt-4 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Create note
                </button>
              </div>
            </aside>

            <section className="space-y-5">
              <div className="rounded-[32px] border border-white/70 bg-white/75 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Your workspace
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                      Notes, colors, categories, and fast edits
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => openComposer()}
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    Add note
                  </button>
                </div>
              </div>

              <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
                {visibleNotes.map((note) => (
                  <article
                    key={note.id}
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
                        <h3 className="text-lg font-semibold text-slate-950">
                          {note.title}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteNote(note.id)}
                        className="rounded-full bg-white/70 p-2 text-slate-600 transition hover:bg-white hover:text-rose-600"
                        aria-label={`Delete ${note.title}`}
                      >
                        ✕
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => openComposer(note)}
                      className="mt-4 w-full rounded-[22px] bg-white/55 p-4 text-left transition hover:bg-white/80"
                    >
                      <p className="line-clamp-5 text-sm leading-6 text-slate-800">
                        {getPreviewText(note.content)}
                      </p>
                    </button>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
                      <span>{note.updatedAt}</span>
                      <button
                        type="button"
                        onClick={() => openComposer(note)}
                        className="rounded-full bg-slate-950/90 px-3 py-1.5 font-medium text-white transition hover:bg-slate-900"
                      >
                        Edit note
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {visibleNotes.length === 0 && (
                <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/75 p-10 text-center shadow-[0_18px_70px_rgba(15,23,42,0.05)]">
                  <p className="text-lg font-semibold text-slate-900">
                    No notes in this category yet.
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Create a new note or switch filters in the sidebar.
                  </p>
                </div>
              )}
            </section>
          </main>
        ) : (
          <div className="grid flex-1 place-items-center rounded-[32px] border border-white/60 bg-white/70 p-8 text-center shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="max-w-md space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Authentication required
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                You are not signed in.
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                Connect this page to your backend session flow and the notes
                workspace will open here.
              </p>
            </div>
          </div>
        )}
      </div>

      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="w-full max-w-4xl overflow-hidden rounded-[32px] bg-[#fffdf7] shadow-[0_30px_120px_rgba(15,23,42,0.35)]">
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
                onClick={closeComposer}
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
                    setDraft((current) => ({
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
                    setDraft((current) => ({ ...current, content }))
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
                          setDraft((current) => ({ ...current, color }))
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
                      setDraft((current) => ({
                        ...current,
                        category: event.target.value as NoteCategory,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-amber-300"
                  >
                    {categories
                      .filter((category) => category.value !== "All")
                      .map((category) => (
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
                      setDraft((current) => ({
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
                    onClick={saveNote}
                    className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Save note
                  </button>

                  {selectedNote && (
                    <button
                      type="button"
                      onClick={() => {
                        deleteNote(selectedNote.id);
                        closeComposer();
                      }}
                      className="rounded-full bg-rose-100 px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-200"
                    >
                      Delete note
                    </button>
                  )}
                </div>

                <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-slate-700">
                  This editor is powered by Tiptap and can be wired to backend
                  note objects later.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
