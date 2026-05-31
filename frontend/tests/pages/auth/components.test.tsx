import { render, screen } from "@testing-library/react";
import AuthButton from "../../../src/pages/auth/components/AuthButton";
import AuthWithGoogleBtn from "../../../src/pages/auth/components/AuthWithGoogleBtn";
import AuthWithGithubBtn from "../../../src/pages/auth/components/AuthWithGithubBtn";
import FormError from "../../../src/pages/auth/components/FormError";
import Logo from "../../../src/components/ui/Logo";

jest.mock("../../../src/config/config", () => ({
  __esModule: true,
  default: {
    BACKEND_URL: "https://api.example.com",
  },
}));

describe("auth components", () => {
  it("renders the submit button", () => {
    render(<AuthButton text="Login" className="mt-4" />);

    expect(screen.getByRole("button", { name: "Login" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("renders social auth links with backend URLs", () => {
    render(
      <>
        <AuthWithGoogleBtn text="Login With Google" />
        <AuthWithGithubBtn text="Login With GitHub" />
      </>,
    );

    expect(
      screen.getByRole("link", { name: /login with google/i }),
    ).toHaveAttribute("href", "https://api.example.com/auth/google");
    expect(
      screen.getByRole("link", { name: /login with github/i }),
    ).toHaveAttribute("href", "https://api.example.com/auth/github");
  });

  it("renders form errors conditionally", () => {
    const { rerender } = render(<FormError text="Required" />);

    expect(screen.getByText("Required")).toBeVisible();

    rerender(<FormError />);
    expect(screen.queryByText("Required")).not.toBeInTheDocument();
  });

  it("renders the logo", () => {
    render(<Logo />);

    expect(screen.getByAltText("KeepIT Logo")).toBeInTheDocument();
  });
});
