import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders active text", () => {
    render(<StatusBadge active={true} />);

    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders inactive text", () => {
    render(<StatusBadge active={false} />);

    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("supports custom status labels", () => {
    render(
      <StatusBadge
        active={false}
        activeText="Enabled"
        inactiveText="Revoked"
      />,
    );

    expect(screen.getByText("Revoked")).toBeInTheDocument();
  });
});
