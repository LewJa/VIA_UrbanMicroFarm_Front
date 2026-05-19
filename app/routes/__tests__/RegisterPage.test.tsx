import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router";
import RegisterPage from "../register";
import { userService } from "~/services/userService";

vi.mock("~/services/userService", () => ({
  userService: { register: vi.fn() },
}));

const mockRegister = vi.mocked(userService.register);

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<div data-testid="login-page" />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── rendering ─────────────────────────────────────────────────────────────

  it("renders name, email, and password fields", () => {
    renderPage();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders the sign-up button", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("renders a link back to login", () => {
    renderPage();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  // ── client-side validation ─────────────────────────────────────────────────

  it("shows error when name is empty", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText("Name is required")).toBeInTheDocument();
  });

  it("shows error when email is empty", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alice" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
  });

  it("shows error when email format is invalid", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "bademail" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
  });

  it("shows error when password is empty", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText("Password is required")).toBeInTheDocument();
  });

  it("shows error when password is shorter than 8 characters", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText("Password must be at least 8 characters")).toBeInTheDocument();
  });

  it("does not call userService when validation fails", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await screen.findByText("Name is required");
    expect(mockRegister).not.toHaveBeenCalled();
  });

  // ── successful registration ────────────────────────────────────────────────

  it("calls userService.register with name, email, and password", async () => {
    mockRegister.mockResolvedValueOnce({ message: "User created" });
    renderPage();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith({
        name: "Alice",
        email: "a@b.com",
        password: "password1",
      }),
    );
  });

  it("redirects to login page on success", async () => {
    mockRegister.mockResolvedValueOnce({ message: "User created" });
    renderPage();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByTestId("login-page")).toBeInTheDocument();
  });

  // ── API error handling ─────────────────────────────────────────────────────

  it("shows duplicate-email message on 409", async () => {
    mockRegister.mockRejectedValueOnce({ response: { status: 409 } });
    renderPage();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(
      await screen.findByText("An account with this email already exists."),
    ).toBeInTheDocument();
  });

  it("shows generic error on network failure", async () => {
    mockRegister.mockRejectedValueOnce(new Error("Network Error"));
    renderPage();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(
      await screen.findByText("Something went wrong. Please try again."),
    ).toBeInTheDocument();
  });

  it("does not navigate on failed registration", async () => {
    mockRegister.mockRejectedValueOnce({ response: { status: 409 } });
    renderPage();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await screen.findByText("An account with this email already exists.");
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
  });
});
