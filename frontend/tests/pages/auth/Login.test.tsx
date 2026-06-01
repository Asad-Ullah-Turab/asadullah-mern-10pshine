import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Login from "../../../src/pages/auth/Login";
import UserContext from "../../../src/store/UserContext";

const navigateMock = jest.fn();
const loginMock = jest.fn();
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
  LoginWithEmailPassword: (...args: unknown[]) => loginMock(...args),
}));

jest.mock("../../../src/config/config", () => ({
  __esModule: true,
  default: { BACKEND_URL: "https://api.example.com" },
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <UserContext.Provider
        value={{
          user: null,
          loading: false,
          isAuthenticated: () => false,
          setUser: setUserMock,
        }}
      >
        <Login />
      </UserContext.Provider>
    </MemoryRouter>,
  );
}

describe("Login page", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    loginMock.mockReset();
    setUserMock.mockReset();
  });

  it("shows validation errors when submitted blank", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByText("Email is required")).toBeVisible();
    expect(screen.getByText("Password is required")).toBeVisible();
  });

  it("logs in and navigates on success", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({
      user: { id: "1", email: "ada@example.com", name: "Ada" },
    });
    renderLogin();

    await user.type(screen.getByPlaceholderText("Email"), "ada@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "Secret123!");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(loginMock).toHaveBeenCalledWith("ada@example.com", "Secret123!");
    expect(setUserMock).toHaveBeenCalledWith({
      id: "1",
      email: "ada@example.com",
      name: "Ada",
    });
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("shows the backend error when login fails", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({ error: "Invalid credentials" });
    renderLogin();

    await user.type(screen.getByPlaceholderText("Email"), "ada@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "Secret123!");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Invalid credentials")).toBeVisible();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
