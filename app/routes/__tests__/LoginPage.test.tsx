import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router";
import LoginPage from "../login";
import { userService } from "~/services/userService";
import { useAuth } from "~/context/AuthContext";

vi.mock("~/services/userService", () => ({
  userService: { login: vi.fn() },
}));

vi.mock("~/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockAuthLogin = vi.fn();
const mockServiceLogin = vi.mocked(userService.login);

function renderPage() {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    token: null,
    login: mockAuthLogin,
    logout: vi.fn(),
    updateUser: vi.fn(),
  });
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div data-testid="home-page" />} />
        <Route path="/home" element={<div data-testid="home-page" />} />
        <Route path="/register" element={<div data-testid="register-page" />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── rendering ─────────────────────────────────────────────────────────────

  it("renders email and password fields", () => {
    renderPage();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders the sign-in button", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders a link to the register page", () => {
    renderPage();
    expect(screen.getByRole("link", { name: /create an account/i })).toBeInTheDocument();
  });

  // ── client-side validation ─────────────────────────────────────────────────

  it("shows error when email is empty on submit", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
  });

  it("shows error when email format is invalid", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "notanemail" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
  });

  it("shows error when password is empty on submit", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText("Password is required")).toBeInTheDocument();
  });

  it("does not call userService when validation fails", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await screen.findByText("Email is required");
    expect(mockServiceLogin).not.toHaveBeenCalled();
  });

  // ── successful login ───────────────────────────────────────────────────────

  it("calls userService.login with the entered email and password", async () => {
    mockServiceLogin.mockResolvedValueOnce({
      token: "tok-123",
      user: { id: 1, name: "Alice", email: "a@b.com", theme: "light" },
    });
    renderPage();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "mypassword" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() =>
      expect(mockServiceLogin).toHaveBeenCalledWith({
        email: "a@b.com",
        password: "mypassword",
      }),
    );
  });

  it("calls auth context login with token and user on success", async () => {
    const user = { id: 1, name: "Alice", email: "a@b.com", theme: "light" as const };
    mockServiceLogin.mockResolvedValueOnce({ token: "tok-123", user });
    renderPage();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "mypassword" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() =>
      expect(mockAuthLogin).toHaveBeenCalledWith("tok-123", user),
    );
  });

  it("navigates to home on successful login", async () => {
    vi.useFakeTimers();
    mockServiceLogin.mockResolvedValueOnce({
      token: "tok-123",
      user: { id: 1, name: "Alice", email: "a@b.com", theme: "light" },
    });
    renderPage();
    await act(async () => {
      fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
      fireEvent.change(screen.getByLabelText("Password"), { target: { value: "mypassword" } });
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
      await vi.runAllTimersAsync();
    });
    vi.useRealTimers();
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  // ── API error handling ─────────────────────────────────────────────────────

  it("shows wrong-credentials message on 401", async () => {
    mockServiceLogin.mockRejectedValueOnce({ response: { status: 401 } });
    renderPage();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText("Incorrect email or password.")).toBeInTheDocument();
  });

  it("shows generic error on network failure", async () => {
    mockServiceLogin.mockRejectedValueOnce(new Error("Network Error"));
    renderPage();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "mypassword" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText("Something went wrong. Please try again.")).toBeInTheDocument();
  });

  it("does not navigate on failed login", async () => {
    mockServiceLogin.mockRejectedValueOnce({ response: { status: 401 } });
    renderPage();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await screen.findByText("Incorrect email or password.");
    expect(screen.queryByTestId("home-page")).not.toBeInTheDocument();
  });
});
