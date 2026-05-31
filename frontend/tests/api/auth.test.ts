import {
  GetLoggedInUser,
  LoginWithEmailPassword,
  deleteAccount,
  logoutUser,
  signUpWithEmailPassword,
  updateProfileName,
} from "../../src/api/auth";

jest.mock("../../src/config/config", () => ({
  __esModule: true,
  default: {
    BACKEND_URL: "https://api.example.com",
  },
}));

describe("auth api", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as typeof fetch;
  });

  it("logs in with email and password", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { id: "1", email: "ada@example.com", name: "Ada" },
      }),
    });

    await expect(
      LoginWithEmailPassword("ada@example.com", "secret"),
    ).resolves.toEqual({
      user: { id: "1", email: "ada@example.com", name: "Ada" },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/auth/password",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "ada@example.com", password: "secret" }),
      }),
    );
  });

  it("returns a login error message when the response is not ok", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    });

    await expect(
      LoginWithEmailPassword("ada@example.com", "secret"),
    ).resolves.toEqual({ error: "Invalid credentials" });
  });

  it("fetches the logged-in user", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { id: "1", email: "ada@example.com", name: "Ada" },
      }),
    });

    await expect(GetLoggedInUser()).resolves.toEqual({
      id: "1",
      email: "ada@example.com",
      name: "Ada",
    });
  });

  it("returns a signup error message when the response is not ok", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Email already exists" }),
    });

    await expect(
      signUpWithEmailPassword("Ada", "ada@example.com", "secret"),
    ).resolves.toEqual({ error: "Email already exists" });
  });

  it("updates the profile name", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { id: "1", email: "ada@example.com", name: "Ada Lovelace" },
      }),
    });

    await expect(updateProfileName("Ada Lovelace")).resolves.toEqual({
      user: { id: "1", email: "ada@example.com", name: "Ada Lovelace" },
    });
  });

  it("logs out and deletes an account", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Logged out" }),
    });
    await expect(logoutUser()).resolves.toEqual({ message: "Logged out" });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Account deleted" }),
    });
    await expect(deleteAccount()).resolves.toEqual({
      message: "Account deleted",
    });
  });

  it("returns an error when fetching the logged-in user fails", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "No session" }),
    });

    await expect(GetLoggedInUser()).resolves.toEqual({ error: "No session" });
  });
});
