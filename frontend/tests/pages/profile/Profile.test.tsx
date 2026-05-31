import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Profile from "../../../src/pages/profile/Profile";
import UserContext from "../../../src/store/UserContext";

const navigateMock = jest.fn();
const updateProfileMock = jest.fn();
const logoutMock = jest.fn();
const deleteAccountMock = jest.fn();
const setUserMock = jest.fn();

jest.mock("react-router", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  MemoryRouter: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useNavigate: () => navigateMock,
}));

jest.mock("../../../src/api/auth", () => ({
  updateProfileName: (...args: unknown[]) => updateProfileMock(...args),
  logoutUser: (...args: unknown[]) => logoutMock(...args),
  deleteAccount: (...args: unknown[]) => deleteAccountMock(...args),
}));

function renderProfile(
  value: React.ComponentProps<typeof UserContext.Provider>["value"],
) {
  return render(
    <MemoryRouter>
      <UserContext.Provider value={value}>{<Profile />}</UserContext.Provider>
    </MemoryRouter>,
  );
}

describe("Profile page", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    updateProfileMock.mockReset();
    logoutMock.mockReset();
    deleteAccountMock.mockReset();
    setUserMock.mockReset();
    jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the loading state", () => {
    renderProfile({
      user: null,
      loading: true,
      isAuthenticated: () => false,
      setUser: setUserMock,
    });

    expect(screen.getByText("Loading profile...")).toBeVisible();
  });

  it("renders the unauthenticated state", () => {
    renderProfile({
      user: null,
      loading: false,
      isAuthenticated: () => false,
      setUser: setUserMock,
    });

    expect(screen.getByText("Sign in to manage your account")).toBeVisible();
    expect(screen.getByRole("link", { name: /go to login/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("updates the profile name", async () => {
    const user = userEvent.setup();
    updateProfileMock.mockResolvedValue({
      user: { id: "1", email: "ada@example.com", name: "Ada Lovelace" },
    });

    renderProfile({
      user: { id: "1", email: "ada@example.com", name: "Ada" },
      loading: false,
      isAuthenticated: () => true,
      setUser: setUserMock,
    });

    await user.clear(screen.getByPlaceholderText("Your name"));
    await user.type(screen.getByPlaceholderText("Your name"), "Ada Lovelace");
    await user.click(screen.getByRole("button", { name: /save name/i }));

    expect(updateProfileMock).toHaveBeenCalledWith("Ada Lovelace");
    expect(setUserMock).toHaveBeenCalledWith({
      id: "1",
      email: "ada@example.com",
      name: "Ada Lovelace",
    });
    expect(
      await screen.findByText("Profile updated successfully"),
    ).toBeVisible();
  });

  it("logs out and deletes the account", async () => {
    const user = userEvent.setup();
    logoutMock.mockResolvedValue({ message: "Logged out" });
    deleteAccountMock.mockResolvedValue({ message: "Deleted" });

    renderProfile({
      user: { id: "1", email: "ada@example.com", name: "Ada" },
      loading: false,
      isAuthenticated: () => true,
      setUser: setUserMock,
    });

    await user.click(screen.getByRole("button", { name: /logout/i }));
    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(setUserMock).toHaveBeenCalledWith(null);
    expect(navigateMock).toHaveBeenCalledWith("/login");

    await user.click(screen.getByRole("button", { name: /delete account/i }));
    expect(deleteAccountMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/signup");
  });

  it("shows a name validation error", async () => {
    const user = userEvent.setup();

    renderProfile({
      user: { id: "1", email: "ada@example.com", name: "Ada" },
      loading: false,
      isAuthenticated: () => true,
      setUser: setUserMock,
    });

    await user.clear(screen.getByPlaceholderText("Your name"));
    await user.click(screen.getByRole("button", { name: /save name/i }));

    expect(screen.getByText("Name is required")).toBeVisible();
    expect(updateProfileMock).not.toHaveBeenCalled();
  });
});
