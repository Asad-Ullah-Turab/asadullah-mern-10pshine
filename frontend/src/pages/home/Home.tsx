import { useContext, useMemo, useState } from "react";
import UserContext from "../../store/UserContext";
import { type CategoryOption, type Note, type NoteDraft } from "./types";
import { HomeHeader } from "./components/HomeHeader";
import { HomeSidebar } from "./components/HomeSidebar";
import { NoteCard } from "./components/NoteCard";
import { NoteEditorModal } from "./components/NoteEditorModal";

const categories: CategoryOption[] = [
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

function getPreviewTitle(html: string) {
  const text = stripHtml(html);
  return text.length > 20 ? `${text.slice(0, 20)}…` : text;
}

function getPreviewText(html: string) {
  const text = stripHtml(html);
  return text.length > 140 ? `${text.slice(0, 140)}…` : text;
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().trim();
}

function Home() {
  const { user, loading, isAuthenticated } = useContext(UserContext);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [filter, setFilter] =
    useState<(typeof categories)[number]["value"]>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<NoteDraft>(defaultDraft);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );

  const visibleNotes = useMemo(() => {
    const normalizedSearch = normalizeSearchText(searchQuery);
    const sorted = [...notes].sort((left, right) => {
      if (left.pinned === right.pinned) {
        return (
          Number(new Date(right.updatedAt)) - Number(new Date(left.updatedAt))
        );
      }

      return left.pinned ? -1 : 1;
    });

    return sorted.filter((note) => {
      const categoryMatches = filter === "All" || note.category === filter;
      const searchableText = normalizeSearchText(
        [note.title, stripHtml(note.content), note.category].join(" "),
      );

      const searchMatches =
        normalizedSearch.length === 0 ||
        searchableText.includes(normalizedSearch);

      return categoryMatches && searchMatches;
    });
  }, [filter, notes, searchQuery]);

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
      trimmedTitle || getPreviewTitle(draft.content) || "Untitled note";

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(253,224,71,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.16),transparent_22%),linear-gradient(180deg,#fffaf0_0%,#f8fafc_36%,#eef2ff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <HomeHeader
          onCreateNote={() => openComposer()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {loading ? (
          <div className="grid flex-1 place-items-center rounded-4xl border border-white/60 bg-white/70 text-slate-600 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            Loading notes...
          </div>
        ) : isAuthenticated() ? (
          <main className="grid flex-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <HomeSidebar
              userName={user?.name ?? "Guest profile"}
              userEmail={user?.email ?? "Signed in preview"}
              userInitial={(user?.name ?? "G").slice(0, 1).toUpperCase()}
              categories={categories}
              filter={filter}
              onFilterChange={setFilter}
              notes={notes}
              onCreateNote={() => openComposer()}
            />

            <section className="space-y-5">
              <div className="rounded-4xl border border-white/70 bg-white/75 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
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
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={openComposer}
                    onDelete={deleteNote}
                    previewText={getPreviewText(note.content)}
                  />
                ))}
              </div>

              {visibleNotes.length === 0 && (
                <div className="rounded-4xl border border-dashed border-slate-300 bg-white/75 p-10 text-center shadow-[0_18px_70px_rgba(15,23,42,0.05)]">
                  <p className="text-lg font-semibold text-slate-900">
                    {searchQuery
                      ? "No notes match your search."
                      : "No notes in this category yet."}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {searchQuery
                      ? "Try a different keyword or clear the search bar."
                      : "Create a new note or switch filters in the sidebar."}
                  </p>
                </div>
              )}
            </section>
          </main>
        ) : (
          <div className="grid flex-1 place-items-center rounded-4xl border border-white/60 bg-white/70 p-8 text-center shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
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

      <NoteEditorModal
        open={isComposerOpen}
        selectedNote={selectedNote}
        draft={draft}
        noteColors={noteColors}
        categories={categories.filter((category) => category.value !== "All")}
        onClose={closeComposer}
        onSave={saveNote}
        onDelete={deleteNote}
        onDraftChange={setDraft}
      />
    </div>
  );
}

export default Home;
