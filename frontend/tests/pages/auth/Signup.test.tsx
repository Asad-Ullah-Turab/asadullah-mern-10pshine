import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Signup from "../../../src/pages/auth/Signup";
import UserContext from "../../../src/store/UserContext";

const navigateMock = jest.fn();
const signupMock = jest.fn();
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
  signUpWithEmailPassword: (...args: unknown[]) => signupMock(...args),
}));

jest.mock("../../../src/config/config", () => ({
  __esModule: true,
  default: { BACKEND_URL: "https://api.example.com" },
}));

function renderSignup() {
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
        <Signup />
      </UserContext.Provider>
    </MemoryRouter>,
  );
}

describe("Signup page", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    signupMock.mockReset();
    setUserMock.mockReset();
  });

  it("shows validation errors when submitted blank", async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(screen.getByText("Name is required")).toBeVisible();
    expect(screen.getByText("Email is required")).toBeVisible();
    expect(screen.getByText("Password is required")).toBeVisible();
    expect(screen.getByText("Confirm Password is required")).toBeVisible();
  });

  it("shows password and confirmation validation errors", async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByPlaceholderText("Name"), "Ada");
    await user.type(screen.getByPlaceholderText("Email"), "ada@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "short");
    await user.type(
      screen.getByPlaceholderText("Confirm Password"),
      "different",
    );
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(
      await screen.findByText("Password must be at least 10 characters long"),
    ).toBeVisible();
    expect(await screen.findByText("Passwords do not match")).toBeVisible();
  });

  it("signs up and navigates on success", async () => {
    const user = userEvent.setup();
    signupMock.mockResolvedValue({
      user: { id: "1", email: "ada@example.com", name: "Ada" },
    });
    renderSignup();

    await user.type(screen.getByPlaceholderText("Name"), "Ada");
    await user.type(screen.getByPlaceholderText("Email"), "ada@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "Secret123!");
    await user.type(
      screen.getByPlaceholderText("Confirm Password"),
      "Secret123!",
    );
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(signupMock).toHaveBeenCalledWith(
      "Ada",
      "ada@example.com",
      "Secret123!",
    );
    expect(setUserMock).toHaveBeenCalledWith({
      id: "1",
      email: "ada@example.com",
      name: "Ada",
    });
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("shows the backend error when signup fails", async () => {
    const user = userEvent.setup();
    signupMock.mockResolvedValue({ error: "Email already exists" });
    renderSignup();

    await user.type(screen.getByPlaceholderText("Name"), "Ada");
    await user.type(screen.getByPlaceholderText("Email"), "ada@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "Secret123!");
    await user.type(
      screen.getByPlaceholderText("Confirm Password"),
      "Secret123!",
    );
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(await screen.findByText("Email already exists")).toBeVisible();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
