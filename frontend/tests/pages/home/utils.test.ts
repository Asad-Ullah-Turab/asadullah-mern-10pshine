import type { Note } from "../../../src/pages/home/types";
import {
  buildNoteTitle,
  categories,
  defaultDraft,
  exportNotesAsJson,
  exportNotesAsText,
  getErrorMessage,
  getPreviewText,
  getPreviewTitle,
  noteColors,
  normalizeSearchText,
  parseImportedNote,
  parseImportedNotesFromJson,
  parseImportedNotesFromText,
  stripHtml,
  toExportableNote,
} from "../../../src/pages/home/utils";

const sampleNote: Note = {
  id: "note-1",
  title: "Weekly plan",
  content: "<p>Finish the <strong>release</strong></p>",
  color: "#dbeafe",
  category: "Work",
  pinned: true,
  createdAt: "2026-05-31T09:00:00.000Z",
  updatedAt: "2026-05-31T10:00:00.000Z",
};

describe("home utils", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("exports the base note defaults", () => {
    expect(categories[0]).toEqual({ label: "All notes", value: "All" });
    expect(noteColors[0]).toBe("#fff7b2");
    expect(defaultDraft).toEqual({
      title: "",
      content: "<p></p>",
      color: "#fff7b2",
      category: "Ideas",
      pinned: false,
    });
  });

  it("strips HTML and normalizes whitespace", () => {
    expect(stripHtml("<p>Hello&nbsp;<strong>world</strong></p>")).toBe(
      "Hello world",
    );
  });

  it("builds preview titles and text with truncation", () => {
    expect(getPreviewTitle("<p>01234567890123456789012345</p>")).toBe(
      "01234567890123456789…",
    );
    expect(getPreviewText("<p>" + "a".repeat(141) + "</p>")).toBe(
      `${"a".repeat(140)}…`,
    );
  });

  it("normalizes search text and builds fallback titles", () => {
    expect(normalizeSearchText("  HeLLo  ")).toBe("hello");
    expect(buildNoteTitle("<p>Quarterly planning</p>", "")).toBe(
      "Quarterly planning",
    );
    expect(buildNoteTitle("<p></p>", "")).toBe("Untitled note");
    expect(buildNoteTitle("<p>ignored</p>", "  Explicit title  ")).toBe(
      "Explicit title",
    );
  });

  it("returns readable error messages", () => {
    expect(getErrorMessage(new Error("Boom"))).toBe("Boom");
    expect(getErrorMessage({})).toBe("Something went wrong");
  });

  it("parses imported notes from JSON and text", () => {
    expect(
      parseImportedNote({
        title: "Imported",
        content: "<p>Body</p>",
        color: "#dbeafe",
        category: "Work",
        pinned: true,
      }),
    ).toEqual({
      title: "Imported",
      content: "<p>Body</p>",
      color: "#dbeafe",
      category: "Work",
      pinned: true,
    });

    expect(parseImportedNote({ category: "Unknown" })).toBeNull();

    expect(
      parseImportedNotesFromJson(
        JSON.stringify({
          notes: [
            { title: "One", category: "Ideas" },
            { title: "Two", category: "Invalid" },
          ],
        }),
      ),
    ).toEqual([
      {
        title: "One",
        content: "<p></p>",
        color: "#fff7b2",
        category: "Ideas",
        pinned: false,
      },
    ]);

    expect(
      parseImportedNotesFromText(
        [
          "not json",
          JSON.stringify({ title: "One", category: "Ideas" }),
          JSON.stringify({ title: "Two", category: "Nope" }),
        ].join("\n"),
      ),
    ).toEqual([
      {
        title: "One",
        content: "<p></p>",
        color: "#fff7b2",
        category: "Ideas",
        pinned: false,
      },
    ]);
  });

  it("exports notes as JSON and text files", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-31T10:15:00.000Z"));

    const createObjectURLMock = jest.fn(() => "blob:mock-url");
    const revokeObjectURLMock = jest.fn();
    const originalBlob = global.Blob;
    class MockBlob {
      parts: BlobPart[];
      type: string;

      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        this.parts = parts;
        this.type = options?.type ?? "";
      }
    }
    Object.defineProperty(global, "Blob", {
      value: MockBlob,
      writable: true,
    });
    Object.defineProperty(URL, "createObjectURL", {
      value: createObjectURLMock,
      writable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: revokeObjectURLMock,
      writable: true,
    });

    const anchor = document.createElement("a");
    const clickMock = jest.fn();
    Object.defineProperty(anchor, "click", { value: clickMock });

    const createElementSpy = jest
      .spyOn(document, "createElement")
      .mockReturnValue(anchor);

    exportNotesAsJson([sampleNote]);

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    expect(anchor.download).toBe("keepit-notes-2026-05-31.json");
    expect(anchor.href).toBe("blob:mock-url");
    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:mock-url");

    const jsonCall = createObjectURLMock.mock.calls.at(0) as
      | [MockBlob]
      | undefined;
    if (!jsonCall) {
      throw new Error("Expected JSON export to create a blob");
    }
    const jsonBlob = jsonCall[0];
    const jsonText = String(jsonBlob.parts[0]);
    expect(jsonText).toContain('"exportedAt": "2026-05-31T10:15:00.000Z"');
    expect(jsonText).toContain('"title": "Weekly plan"');

    createObjectURLMock.mockClear();
    clickMock.mockClear();
    revokeObjectURLMock.mockClear();
    createElementSpy.mockReturnValue(anchor);

    exportNotesAsText([sampleNote]);

    expect(anchor.download).toBe("keepit-notes-2026-05-31.txt");
    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(createObjectURLMock).toHaveBeenCalledTimes(1);

    const textCall = createObjectURLMock.mock.calls.at(0) as
      | [MockBlob]
      | undefined;
    if (!textCall) {
      throw new Error("Expected text export to create a blob");
    }
    const textBlob = textCall[0];
    const textText = String(textBlob.parts[0]);
    expect(textText).toContain("KEEPIT NOTES TEXT EXPORT");
    expect(textText).toContain('"category":"Work"');

    Object.defineProperty(global, "Blob", {
      value: originalBlob,
      writable: true,
    });

    jest.useRealTimers();
  });

  it("maps notes to the export shape", () => {
    expect(toExportableNote(sampleNote)).toEqual(sampleNote);
  });
});
