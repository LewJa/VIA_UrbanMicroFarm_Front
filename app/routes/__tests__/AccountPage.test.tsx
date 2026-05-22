import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router";
import AccountPage from "../account";
import { userService } from "~/services/userService";
import { useAuth } from "~/context/AuthContext";

vi.mock("~/services/userService", () => ({
  userService: {
    updateName: vi.fn(),
    changeEmail: vi.fn(),
    changePassword: vi.fn(),
    setTheme: vi.fn(),
    deleteAccount: vi.fn(),
  },
}));

vi.mock("~/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockUser = { id: 1, email: "alice@example.com", name: "Alice", theme: "light" as const };
const mockUpdateUser = vi.fn();
const mockLogout = vi.fn();

function renderPage(userOverride?: Partial<typeof mockUser>) {
  vi.mocked(useAuth).mockReturnValue({
    user: { ...mockUser, ...userOverride },
    token: "tok",
    login: vi.fn(),
    logout: mockLogout,
    updateUser: mockUpdateUser,
  });
  return render(
    <MemoryRouter initialEntries={["/account"]}>
      <Routes>
        <Route path="/account" element={<AccountPage />} />
        <Route path="/login" element={<div data-testid="login-page" />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AccountPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── profile display ────────────────────────────────────────────────────────

  it("shows the user name and email", () => {
    renderPage();
    expect(screen.getByText("Alice", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("shows avatar initial from name", () => {
    renderPage();
    expect(screen.getByText("A", { selector: "span" })).toBeInTheDocument();
  });

  it("falls back to email initial when name is empty", () => {
    renderPage({ name: "" });
    expect(screen.getByText("A", { selector: "span" })).toBeInTheDocument();
  });

  it("shows current theme label in the Theme row", () => {
    renderPage();
    expect(screen.getAllByText("Light").length).toBeGreaterThan(0);
  });

  // ── log out ────────────────────────────────────────────────────────────────

  it("calls logout and navigates to /login when Log out is clicked", async () => {
    renderPage();
    fireEvent.click(screen.getByText("Log out"));
    await waitFor(() => expect(mockLogout).toHaveBeenCalled());
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });

  // ── name section ──────────────────────────────────────────────────────────

  it("expands the name form when the Name row is clicked", () => {
    renderPage();
    fireEvent.click(screen.getByText("Name"));
    expect(screen.getByLabelText("Display name")).toBeInTheDocument();
  });

  it("collapses the name form when clicked again", () => {
    renderPage();
    fireEvent.click(screen.getByText("Name"));
    fireEvent.click(screen.getByText("Name"));
    expect(screen.queryByRole("button", { name: /^save$/i })).not.toBeInTheDocument();
  });

  it("shows validation error when saving an empty name", async () => {
    renderPage();
    fireEvent.click(screen.getByText("Name"));
    fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    expect(await screen.findByText("Name is required")).toBeInTheDocument();
  });

  it("calls updateName and updateUser on successful name save", async () => {
    vi.mocked(userService.updateName).mockResolvedValueOnce({
      user: { id: 1, name: "Bob", email: "alice@example.com" },
    });
    renderPage();
    fireEvent.click(screen.getByText("Name"));
    fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Bob" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() =>
      expect(userService.updateName).toHaveBeenCalledWith(1, "Bob"),
    );
    expect(mockUpdateUser).toHaveBeenCalledWith({ name: "Bob" });
  });

  // ── theme section ──────────────────────────────────────────────────────────

  it("expands the theme picker when the Theme row is clicked", () => {
    renderPage();
    fireEvent.click(screen.getByText("Theme"));
    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByText("Auto")).toBeInTheDocument();
  });

  it("calls setTheme and updateUser when a theme option is chosen", async () => {
    vi.mocked(userService.setTheme).mockResolvedValueOnce({
      user: { id: 1, email: "alice@example.com", theme: "dark" },
    });
    renderPage();
    fireEvent.click(screen.getByText("Theme"));
    fireEvent.click(screen.getByText("Dark"));
    await waitFor(() =>
      expect(userService.setTheme).toHaveBeenCalledWith(1, { theme: "dark" }),
    );
    expect(mockUpdateUser).toHaveBeenCalledWith({ theme: "dark" });
  });

  // ── password section ───────────────────────────────────────────────────────

  it("expands the change-password form when Change password is clicked", () => {
    renderPage();
    fireEvent.click(screen.getByText("Change password"));
    expect(screen.getByLabelText("Current password")).toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm new password")).toBeInTheDocument();
  });

  it("shows validation errors when password form is submitted empty", async () => {
    renderPage();
    fireEvent.click(screen.getByText("Change password"));
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    expect(await screen.findByText("Current password is required")).toBeInTheDocument();
    expect(screen.getByText("New password is required")).toBeInTheDocument();
  });

  it("shows error when new passwords do not match", async () => {
    renderPage();
    fireEvent.click(screen.getByText("Change password"));
    fireEvent.change(screen.getByLabelText("Current password"), { target: { value: "oldpass" } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "newpass1" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "newpass2" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
  });

  it("shows error when new password is too short", async () => {
    renderPage();
    fireEvent.click(screen.getByText("Change password"));
    fireEvent.change(screen.getByLabelText("Current password"), { target: { value: "old" } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "short" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    expect(await screen.findByText("At least 8 characters")).toBeInTheDocument();
  });

  it("calls changePassword on valid password form submit", async () => {
    vi.mocked(userService.changePassword).mockResolvedValueOnce({ message: "Updated" });
    renderPage();
    fireEvent.click(screen.getByText("Change password"));
    fireEvent.change(screen.getByLabelText("Current password"), { target: { value: "oldpass1" } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "newpass1" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "newpass1" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() =>
      expect(userService.changePassword).toHaveBeenCalledWith(1, {
        currentPassword: "oldpass1",
        newPassword: "newpass1",
      }),
    );
  });

  it("shows API error when changePassword returns 401", async () => {
    vi.mocked(userService.changePassword).mockRejectedValueOnce({ response: { status: 401 } });
    renderPage();
    fireEvent.click(screen.getByText("Change password"));
    fireEvent.change(screen.getByLabelText("Current password"), { target: { value: "wrongpass" } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "newpass12" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "newpass12" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    expect(await screen.findByText("Current password is incorrect.")).toBeInTheDocument();
  });

  // ── delete account ─────────────────────────────────────────────────────────

  it("shows first confirmation step when Delete account is clicked", () => {
    renderPage();
    fireEvent.click(screen.getByText("Delete account"));
    expect(screen.getByText(/permanently delete/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /yes, delete/i })).toBeInTheDocument();
  });

  it("shows final confirmation after first yes", () => {
    renderPage();
    fireEvent.click(screen.getByText("Delete account"));
    fireEvent.click(screen.getByRole("button", { name: /yes, delete my account/i }));
    expect(screen.getByText(/This action is permanent/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete forever/i })).toBeInTheDocument();
  });

  it("calls deleteAccount, then logout, then navigates to /login", async () => {
    vi.mocked(userService.deleteAccount).mockResolvedValueOnce({ message: "Deleted" });
    renderPage();
    fireEvent.click(screen.getByText("Delete account"));
    fireEvent.click(screen.getByRole("button", { name: /yes, delete my account/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete forever/i }));
    await waitFor(() => expect(userService.deleteAccount).toHaveBeenCalledWith(1));
    expect(mockLogout).toHaveBeenCalled();
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });

  it("shows API error when deleteAccount fails", async () => {
    vi.mocked(userService.deleteAccount).mockRejectedValueOnce(new Error("Server error"));
    renderPage();
    fireEvent.click(screen.getByText("Delete account"));
    fireEvent.click(screen.getByRole("button", { name: /yes, delete my account/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete forever/i }));
    expect(await screen.findByText("Could not delete account. Please try again.")).toBeInTheDocument();
  });
});
