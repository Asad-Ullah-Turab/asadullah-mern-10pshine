import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import UserContext from "../../store/UserContext";
import { type Note, type NoteDraft } from "./types";
import { HomeHeader } from "./components/HomeHeader";
import { HomeSidebar } from "./components/HomeSidebar";
import { NoteCard } from "./components/NoteCard";
import { NoteEditorModal } from "./components/NoteEditorModal";
import { createNote, deleteNote, getNotes, updateNote } from "../../api/notes";
import {
  buildNoteTitle,
  categories,
  defaultDraft,
  exportNotesAsJson,
  exportNotesAsText,
  getErrorMessage,
  getPreviewText,
  normalizeSearchText,
  noteColors,
  parseImportedNotesFromJson,
  parseImportedNotesFromText,
  stripHtml,
} from "./utils";

function Home() {
  const { user, loading } = useContext(UserContext);
  const [notes, setNotes] = useState<Note[]>([]);
  const [filter, setFilter] =
    useState<(typeof categories)[number]["value"]>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<NoteDraft>(defaultDraft);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );

  useEffect(() => {
    let cancelled = false;

    const loadNotes = async () => {
      if (loading) {
        return;
      }

      if (!user) {
        setNotes([]);
        setSelectedNoteId(null);
        setNotesError(null);
        return;
      }

      setIsLoadingNotes(true);
      setNotesError(null);

      try {
        const response = await getNotes();
        if (cancelled) {
          return;
        }

        setNotes(response.notes);
        setSelectedNoteId((currentSelectedId) =>
          response.notes.some((note) => note.id === currentSelectedId)
            ? currentSelectedId
            : null,
        );
      } catch (error) {
        if (!cancelled) {
          setNotesError(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingNotes(false);
        }
      }
    };

    loadNotes();

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

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

  const saveNote = async () => {
    if (!user) {
      return;
    }

    const noteTitle = buildNoteTitle(draft.content, draft.title);

    setIsSaving(true);
    setNotesError(null);

    try {
      if (selectedNote) {
        const response = await updateNote(selectedNote.id, {
          ...draft,
          title: noteTitle,
        });

        setNotes((currentNotes) =>
          currentNotes.map((note) =>
            note.id === selectedNote.id ? response.note : note,
          ),
        );
        setSelectedNoteId(response.note.id);
      } else {
        const response = await createNote({
          ...draft,
          title: noteTitle,
        });

        setNotes((currentNotes) => [
          response.note,
          ...currentNotes.filter((note) => note.id !== response.note.id),
        ]);
        setSelectedNoteId(response.note.id);
      }

      setIsComposerOpen(false);
    } catch (error) {
      setNotesError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const removeNote = async (id: string) => {
    setNotesError(null);

    try {
      await deleteNote(id);
      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
      setSelectedNoteId((currentSelectedId) =>
        currentSelectedId === id ? null : currentSelectedId,
      );

      if (selectedNoteId === id) {
        setIsComposerOpen(false);
      }
    } catch (error) {
      setNotesError(getErrorMessage(error));
    }
  };

  const handleImportNotes = async (file: File) => {
    if (!user) {
      return;
    }

    setIsImporting(true);
    setNotesError(null);

    try {
      const text = await file.text();
      const extension = file.name.split(".").pop()?.toLowerCase();

      let importedNotes: NoteDraft[] = [];
      if (extension === "json") {
        importedNotes = parseImportedNotesFromJson(text);
      } else {
        importedNotes = parseImportedNotesFromText(text);
      }

      if (importedNotes.length === 0) {
        throw new Error("No valid notes were found in the imported file");
      }

      for (const note of importedNotes) {
        await createNote({
          ...note,
          title: buildNoteTitle(note.content, note.title),
        });
      }

      const response = await getNotes();
      setNotes(response.notes);
    } catch (error) {
      setNotesError(getErrorMessage(error));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(253,224,71,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.16),transparent_22%),linear-gradient(180deg,#fffaf0_0%,#f8fafc_36%,#eef2ff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <HomeHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        {loading || isLoadingNotes ? (
          <div className="grid flex-1 place-items-center rounded-4xl border border-white/60 bg-white/70 text-slate-600 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            {loading ? "Checking your session..." : "Loading notes..."}
          </div>
        ) : user ? (
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
              onImportNotes={handleImportNotes}
              onExportJson={() => exportNotesAsJson(notes)}
              onExportText={() => exportNotesAsText(notes)}
              isImporting={isImporting}
            />

            <section className="space-y-5">
              {notesError && (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {notesError}
                </div>
              )}

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
                    onDelete={removeNote}
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
                Please sign in to continue
              </p>
              <Link
                to="/login"
                className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Go to login
              </Link>
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
        isSaving={isSaving}
        onClose={closeComposer}
        onSave={saveNote}
        onDelete={removeNote}
        onDraftChange={setDraft}
      />
    </div>
  );
}

export default Home;
