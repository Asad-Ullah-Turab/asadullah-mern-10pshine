import type { CategoryOption, Note, NoteDraft, NoteCategory } from "./types";

export const categories: CategoryOption[] = [
  { label: "All notes", value: "All" },
  { label: "Ideas", value: "Ideas" },
  { label: "Work", value: "Work" },
  { label: "Personal", value: "Personal" },
  { label: "Research", value: "Research" },
];

export const noteColors = [
  "#fff7b2",
  "#dbeafe",
  "#d9f99d",
  "#fee2e2",
  "#f5d0fe",
  "#f3f4f6",
];

export const defaultDraft: NoteDraft = {
  title: "",
  content: "<p></p>",
  color: noteColors[0],
  category: "Ideas",
  pinned: false,
};

export const importableCategories: NoteCategory[] = [
  "Ideas",
  "Work",
  "Personal",
  "Research",
];

export function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getPreviewTitle(html: string) {
  const text = stripHtml(html);
  return text.length > 20 ? `${text.slice(0, 20)}…` : text;
}

export function getPreviewText(html: string) {
  const text = stripHtml(html);
  return text.length > 140 ? `${text.slice(0, 140)}…` : text;
}

export function normalizeSearchText(value: string) {
  return value.toLowerCase().trim();
}

export function buildNoteTitle(content: string, title: string) {
  const trimmedTitle = title.trim();
  return trimmedTitle || getPreviewTitle(content) || "Untitled note";
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export function toExportableNote(note: Note) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    color: note.color,
    category: note.category,
    pinned: note.pinned,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export function exportNotesAsJson(notesToExport: Note[]) {
  const content = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      notes: notesToExport.map(toExportableNote),
    },
    null,
    2,
  );

  downloadFile(
    `keepit-notes-${new Date().toISOString().slice(0, 10)}.json`,
    content,
    "application/json;charset=utf-8",
  );
}

export function exportNotesAsText(notesToExport: Note[]) {
  const header = [
    "KEEPIT NOTES TEXT EXPORT",
    `exportedAt: ${new Date().toISOString()}`,
    "Each note is stored as one JSON object per line.",
    "",
  ];

  const lines = notesToExport.map((note) =>
    JSON.stringify(toExportableNote(note)),
  );
  const content = [...header, ...lines].join("\n");

  downloadFile(
    `keepit-notes-${new Date().toISOString().slice(0, 10)}.txt`,
    content,
    "text/plain;charset=utf-8",
  );
}

export function parseImportedNote(value: unknown): NoteDraft | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<Note> & {
    title?: string;
    content?: string;
    color?: string;
    category?: string;
    pinned?: boolean;
  };

  const category = importableCategories.includes(
    candidate.category as NoteCategory,
  )
    ? (candidate.category as NoteCategory)
    : null;

  if (!category) {
    return null;
  }

  return {
    title: typeof candidate.title === "string" ? candidate.title : "",
    content:
      typeof candidate.content === "string" && candidate.content.length > 0
        ? candidate.content
        : "<p></p>",
    color:
      typeof candidate.color === "string" && candidate.color.length > 0
        ? candidate.color
        : noteColors[0],
    category,
    pinned: Boolean(candidate.pinned),
  };
}

export function parseImportedNotesFromJson(text: string) {
  const parsed = JSON.parse(text) as unknown;

  if (Array.isArray(parsed)) {
    return parsed
      .map(parseImportedNote)
      .filter((note): note is NoteDraft => Boolean(note));
  }

  if (parsed && typeof parsed === "object" && "notes" in parsed) {
    const notes = (parsed as { notes?: unknown }).notes;
    if (Array.isArray(notes)) {
      return notes
        .map(parseImportedNote)
        .filter((note): note is NoteDraft => Boolean(note));
    }
  }

  return [] as NoteDraft[];
}

export function parseImportedNotesFromText(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("{"))
    .flatMap((line) => {
      try {
        const parsed = JSON.parse(line) as unknown;
        const note = parseImportedNote(parsed);
        return note ? [note] : [];
      } catch {
        return [] as NoteDraft[];
      }
    });
}
