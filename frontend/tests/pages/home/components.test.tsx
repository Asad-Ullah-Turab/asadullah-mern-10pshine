import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type {
  CategoryOption,
  Note,
  NoteDraft,
} from "../../../src/pages/home/types";
import {
  categories,
  defaultDraft,
  noteColors,
} from "../../../src/pages/home/utils";
import { HomeHeader } from "../../../src/pages/home/components/HomeHeader";
import { HomeSearchBar } from "../../../src/pages/home/components/HomeSearchBar";
import { HomeSidebar } from "../../../src/pages/home/components/HomeSidebar";
import { NoteCard } from "../../../src/pages/home/components/NoteCard";
import { NoteEditorModal } from "../../../src/pages/home/components/NoteEditorModal";
import Logo from "../../../src/components/ui/Logo";

const navigateMock = jest.fn();

jest.mock("react-router", () => ({
  useNavigate: () => navigateMock,
}));

jest.mock("../../../src/pages/home/components/RichTextEditor", () => ({
  RichTextEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <textarea
      aria-label="Rich text editor"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

describe("home components", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("updates and clears the search bar", async () => {
    const onChange = jest.fn();

    const { rerender } = render(<HomeSearchBar value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText(
      /search notes by title, content, or category/i,
    );
    fireEvent.change(input, { target: { value: "meeting" } });
    expect(onChange).toHaveBeenLastCalledWith("meeting");

    rerender(<HomeSearchBar value="meeting" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("renders the header shell and search input", () => {
    render(<HomeHeader searchQuery="draft" onSearchChange={jest.fn()} />);

    expect(screen.getByText("Notes that feel quick to capture")).toBeVisible();
    expect(screen.getByPlaceholderText(/search notes/i)).toHaveValue("draft");
    expect(screen.getByAltText("KeepIT Logo")).toBeInTheDocument();
  });

  it("navigates and triggers sidebar actions", async () => {
    const user = userEvent.setup();
    const onFilterChange = jest.fn();
    const onCreateNote = jest.fn();
    const onImportNotes = jest.fn();
    const onExportJson = jest.fn();
    const onExportText = jest.fn();
    const notes: Note[] = [
      {
        id: "1",
        title: "One",
        content: "<p>One</p>",
        color: noteColors[0],
        category: "Ideas",
        updatedAt: "2026-05-31T10:00:00.000Z",
        pinned: false,
      },
      {
        id: "2",
        title: "Two",
        content: "<p>Two</p>",
        color: noteColors[1],
        category: "Work",
        updatedAt: "2026-05-31T10:00:00.000Z",
        pinned: false,
      },
    ];

    const { container } = render(
      <HomeSidebar
        userName="Ada Lovelace"
        userEmail="ada@example.com"
        userInitial="A"
        categories={categories}
        filter="All"
        onFilterChange={onFilterChange}
        notes={notes}
        onCreateNote={onCreateNote}
        onImportNotes={onImportNotes}
        onExportJson={onExportJson}
        onExportText={onExportText}
        isImporting={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: /ada lovelace/i }));
    expect(navigateMock).toHaveBeenCalledWith("/profile");

    await user.click(screen.getByRole("button", { name: /^work\s+1$/i }));
    expect(onFilterChange).toHaveBeenCalledWith("Work");

    await user.click(screen.getByRole("button", { name: /create note/i }));
    await user.click(screen.getByRole("button", { name: /export as json/i }));
    await user.click(screen.getByRole("button", { name: /export as text/i }));
    expect(onCreateNote).toHaveBeenCalledTimes(1);
    expect(onExportJson).toHaveBeenCalledTimes(1);
    expect(onExportText).toHaveBeenCalledTimes(1);

    const file = new File(["[]"], "notes.json", { type: "application/json" });
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement | null;
    expect(fileInput).not.toBeNull();
    fireEvent.change(fileInput as HTMLInputElement, {
      target: { files: [file] },
    });
    expect(onImportNotes).toHaveBeenCalledWith(file);
  });

  it("shows note actions and formatted timestamps", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-31T12:00:00.000Z"));

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const note: Note = {
      id: "note-1",
      title: "Weekly plan",
      content: "<p>Plan the release</p>",
      color: "#fff7b2",
      category: "Work",
      pinned: true,
      updatedAt: "2026-05-31T11:30:00.000Z",
    };
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(
      <NoteCard
        note={note}
        previewText="Plan the release"
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("Pinned")).toBeVisible();
    expect(screen.getByText("30m ago")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: /delete weekly plan/i }),
    );
    expect(onDelete).toHaveBeenCalledWith("note-1");

    await user.click(screen.getByRole("button", { name: /edit note/i }));
    expect(onEdit).toHaveBeenCalledWith(note);

    jest.useRealTimers();
  });

  it("renders and edits the note modal", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onSave = jest.fn();
    const onDelete = jest.fn();
    const onDraftChange = jest.fn();
    const draft: NoteDraft = {
      ...defaultDraft,
      title: "Draft title",
      content: "<p>Draft content</p>",
      color: noteColors[0],
      category: "Ideas",
      pinned: false,
    };

    render(
      <NoteEditorModal
        open
        selectedNote={null}
        draft={draft}
        noteColors={noteColors}
        categories={categories.filter(
          (category): category is CategoryOption => category.value !== "All",
        )}
        isSaving={false}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
        onDraftChange={onDraftChange}
      />,
    );

    expect(screen.getByText("Create note")).toBeVisible();

    fireEvent.change(screen.getByPlaceholderText(/note title/i), {
      target: { value: "Updated title" },
    });
    expect(onDraftChange).toHaveBeenCalledWith(expect.any(Function));

    fireEvent.change(screen.getByLabelText(/rich text editor/i), {
      target: { value: "<p>Draft content</p> + extra" },
    });
    expect(onDraftChange).toHaveBeenLastCalledWith(expect.any(Function));

    await user.click(screen.getByLabelText(/select note color #dbeafe/i));
    expect(onDraftChange).toHaveBeenLastCalledWith(expect.any(Function));

    await user.selectOptions(screen.getByRole("combobox"), "Work");
    expect(onDraftChange).toHaveBeenLastCalledWith(expect.any(Function));

    await user.click(screen.getByRole("checkbox", { name: /pin this note/i }));
    expect(onDraftChange).toHaveBeenLastCalledWith(expect.any(Function));

    await user.click(screen.getByRole("button", { name: /save note/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("button", { name: /delete note/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close/i })).toBeEnabled();
  });

  it("renders the edit modal delete action", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onDelete = jest.fn();

    render(
      <NoteEditorModal
        open
        selectedNote={{
          id: "note-1",
          title: "Weekly plan",
          content: "<p>Draft content</p>",
          color: noteColors[0],
          category: "Ideas",
          pinned: false,
          updatedAt: "2026-05-31T10:00:00.000Z",
        }}
        draft={defaultDraft}
        noteColors={noteColors}
        categories={categories.filter((category) => category.value !== "All")}
        isSaving={false}
        onClose={onClose}
        onSave={jest.fn()}
        onDelete={onDelete}
        onDraftChange={jest.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /delete note/i }));
    expect(onDelete).toHaveBeenCalledWith("note-1");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders the logo image", () => {
    render(<Logo className="h-10 w-10" />);

    expect(screen.getByAltText("KeepIT Logo")).toHaveAttribute(
      "src",
      "/assets/logo.png",
    );
  });
});
