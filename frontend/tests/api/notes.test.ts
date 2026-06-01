import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "../../src/api/notes";

jest.mock("../../src/config/config", () => ({
  __esModule: true,
  default: {
    BACKEND_URL: "https://api.example.com",
  },
}));

describe("notes api", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as typeof fetch;
  });

  it("loads notes", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ notes: [{ id: "1", title: "One" }] }),
    });

    await expect(getNotes()).resolves.toEqual({
      notes: [{ id: "1", title: "One" }],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/notes",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
      }),
    );
  });

  it("creates, updates, and deletes notes", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ note: { id: "1", title: "Created" } }),
    });
    await expect(
      createNote({
        title: "Created",
        content: "<p>Body</p>",
        color: "#fff7b2",
        category: "Ideas",
        pinned: false,
      }),
    ).resolves.toEqual({ note: { id: "1", title: "Created" } });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ note: { id: "1", title: "Updated" } }),
    });
    await expect(
      updateNote("1", {
        title: "Updated",
        content: "<p>Body</p>",
        color: "#dbeafe",
        category: "Work",
        pinned: true,
      }),
    ).resolves.toEqual({ note: { id: "1", title: "Updated" } });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Deleted" }),
    });
    await expect(deleteNote("1")).resolves.toEqual({ message: "Deleted" });
  });

  it("throws when the server rejects a request", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Validation failed" }),
    });

    await expect(
      createNote({
        title: "Bad",
        content: "<p>Body</p>",
        color: "#fff7b2",
        category: "Ideas",
        pinned: false,
      }),
    ).rejects.toThrow("Validation failed");
  });
});
