import { render, screen } from "@testing-library/react";
import NotFound from "../../../src/pages/notfound/NotFound";

describe("NotFound page", () => {
  it("renders the 404 message", () => {
    render(<NotFound />);

    expect(screen.getByText("404 Not Found")).toBeVisible();
    expect(
      screen.getByText("The page you are looking for does not exist."),
    ).toBeVisible();
  });
});
