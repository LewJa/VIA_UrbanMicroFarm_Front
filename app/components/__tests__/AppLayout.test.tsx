import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router";
import AppLayout from "../AppLayout";
import { useAuth } from "~/context/AuthContext";

vi.mock("~/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

function renderLayout(token: string | null) {
  vi.mocked(useAuth).mockReturnValue({
    user: token ? { id: 1, name: "Alice", email: "a@b.com", theme: "light" } : null,
    token,
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
  });
  return render(
    <MemoryRouter initialEntries={["/home"]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<div data-testid="protected-page" />} />
        </Route>
        <Route path="/login" element={<div data-testid="login-page" />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AppLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the outlet when token is present", () => {
    renderLayout("valid-token");
    expect(screen.getByTestId("protected-page")).toBeInTheDocument();
  });

  it("renders nothing for the protected content when token is absent", () => {
    renderLayout(null);
    expect(screen.queryByTestId("protected-page")).not.toBeInTheDocument();
  });

  it("redirects to /login when token is absent", async () => {
    renderLayout(null);
    await waitFor(() =>
      expect(screen.getByTestId("login-page")).toBeInTheDocument(),
    );
  });

  it("does not redirect when token is present", () => {
    renderLayout("valid-token");
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
  });
});
