import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

test("renders tutoring scheduler heading", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );

  const heading = screen.getByText(/Tutoring Scheduler/i);
  expect(heading).toBeInTheDocument();
});
