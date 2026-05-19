import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AuthProvider, useAuth } from "../AuthContext";

function TestConsumer() {
  const { user, token, login, logout, updateUser } = useAuth();
  return (
    <div>
      <span data-testid="token">{token ?? "null"}</span>
      <span data-testid="name">{user?.name ?? "null"}</span>
      <span data-testid="email">{user?.email ?? "null"}</span>
      <span data-testid="theme">{user?.theme ?? "null"}</span>
      <button onClick={() => login("test-token", { id: 1, email: "a@b.com", theme: "light" })}>
        do-login
      </button>
      <button onClick={logout}>do-logout</button>
      <button onClick={() => updateUser({ name: "Bob" })}>do-update-name</button>
      <button onClick={() => updateUser({ theme: "dark" })}>do-update-theme</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts with null token and user", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId("token")).toHaveTextContent("null");
    expect(screen.getByTestId("email")).toHaveTextContent("null");
  });

  it("login sets token in state", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    fireEvent.click(screen.getByText("do-login"));
    expect(screen.getByTestId("token")).toHaveTextContent("test-token");
  });

  it("login sets user email and theme in state", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    fireEvent.click(screen.getByText("do-login"));
    expect(screen.getByTestId("email")).toHaveTextContent("a@b.com");
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("login persists token to localStorage", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    fireEvent.click(screen.getByText("do-login"));
    expect(localStorage.setItem).toHaveBeenCalledWith("token", "test-token");
  });

  it("login persists user to localStorage", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    fireEvent.click(screen.getByText("do-login"));
    const calls = vi.mocked(localStorage.setItem).mock.calls;
    const userCall = calls.find(([key]) => key === "user");
    expect(userCall).toBeDefined();
    expect(JSON.parse(userCall![1])).toMatchObject({ email: "a@b.com", theme: "light" });
  });

  it("logout clears token and user from state", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    fireEvent.click(screen.getByText("do-login"));
    fireEvent.click(screen.getByText("do-logout"));
    expect(screen.getByTestId("token")).toHaveTextContent("null");
    expect(screen.getByTestId("email")).toHaveTextContent("null");
  });

  it("logout removes token and user from localStorage", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    fireEvent.click(screen.getByText("do-login"));
    fireEvent.click(screen.getByText("do-logout"));
    expect(localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(localStorage.removeItem).toHaveBeenCalledWith("user");
  });

  it("updateUser patches name without touching other fields", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    fireEvent.click(screen.getByText("do-login"));
    fireEvent.click(screen.getByText("do-update-name"));
    expect(screen.getByTestId("name")).toHaveTextContent("Bob");
    expect(screen.getByTestId("email")).toHaveTextContent("a@b.com");
  });

  it("updateUser patches theme", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    fireEvent.click(screen.getByText("do-login"));
    fireEvent.click(screen.getByText("do-update-theme"));
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("updateUser persists patched user to localStorage", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    fireEvent.click(screen.getByText("do-login"));
    vi.mocked(localStorage.setItem).mockClear();
    fireEvent.click(screen.getByText("do-update-name"));
    const calls = vi.mocked(localStorage.setItem).mock.calls;
    const userCall = calls.find(([key]) => key === "user");
    expect(JSON.parse(userCall![1])).toMatchObject({ name: "Bob", email: "a@b.com" });
  });

  it("updateUser is a no-op when user is null", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    fireEvent.click(screen.getByText("do-update-name"));
    expect(screen.getByTestId("name")).toHaveTextContent("null");
  });

  it("throws when useAuth is called outside AuthProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useAuth must be used inside AuthProvider",
    );
    spy.mockRestore();
  });
});
