import { render, screen } from "@testing-library/react";
import { DataState } from "./DataState";

describe("DataState", () => {
  it("renders loading message", () => {
    render(<DataState type="loading" message="Loading users..." />);

    expect(screen.getByText("Loading users...")).toBeInTheDocument();
  });

  it("renders error message", () => {
    render(<DataState type="error" message="Failed to load users." />);

    expect(screen.getByText("Failed to load users.")).toBeInTheDocument();
  });

  it("renders empty message", () => {
    render(<DataState type="empty" message="No users found." />);

    expect(screen.getByText("No users found.")).toBeInTheDocument();
  });
});
