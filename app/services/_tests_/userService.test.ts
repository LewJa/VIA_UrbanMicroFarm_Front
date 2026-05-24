import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import api from "../../api/client";
import { userService } from "../userService";
import type { LoginResponse, UserProfile, UserWithName } from "../../model/user/types";

vi.mock("../../api/client", () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
  },
}));
vi.mock("~/mocks/index", () => ({ isMockEnabled: false }));

const mockPost = vi.mocked(api.post);
const mockDelete = vi.mocked(api.delete);
const mockPatch = vi.mocked(api.patch);
const mockPut = vi.mocked(api.put);

const makeAxiosError = (status: number) =>
  Object.assign(new Error(`HTTP ${status}`), { response: { status } });

const userProfile: UserProfile = { id: 1, email: "user@example.com", theme: "light" };
const userWithName: UserWithName = { id: 1, name: "Alice", email: "user@example.com" };
const loginResponse: LoginResponse = { token: "jwt-token-abc", user: userProfile };

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ── register ──────────────────────────────────────────────────────────────

  describe("register", () => {
    it("posts to /api/users with name, email, and password", async () => {
      mockPost.mockResolvedValueOnce({ data: { message: "User created" } });
      await userService.register({ name: "Alice", email: "user@example.com", password: "secret" });
      expect(mockPost).toHaveBeenCalledWith("/api/users", {
        name: "Alice",
        email: "user@example.com",
        password: "secret",
      });
    });

    it("returns the message from the response", async () => {
      mockPost.mockResolvedValueOnce({ data: { message: "User created" } });
      const result = await userService.register({ name: "Alice", email: "user@example.com", password: "secret" });
      expect(result).toEqual({ message: "User created" });
    });

    it("propagates 409 conflict errors", async () => {
      mockPost.mockRejectedValueOnce(makeAxiosError(409));
      await expect(
        userService.register({ name: "Alice", email: "user@example.com", password: "secret" }),
      ).rejects.toMatchObject({ response: { status: 409 } });
    });

    it("propagates 422 validation errors", async () => {
      mockPost.mockRejectedValueOnce(makeAxiosError(422));
      await expect(
        userService.register({ name: "Alice", email: "user@example.com", password: "secret" }),
      ).rejects.toMatchObject({ response: { status: 422 } });
    });

    it("propagates network errors", async () => {
      mockPost.mockRejectedValueOnce(new Error("Network Error"));
      await expect(
        userService.register({ name: "Alice", email: "user@example.com", password: "secret" }),
      ).rejects.toThrow("Network Error");
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe("login", () => {
    it("posts to /api/users/login with email and password", async () => {
      mockPost.mockResolvedValueOnce({ data: loginResponse });
      await userService.login({ email: "user@example.com", password: "secret" });
      expect(mockPost).toHaveBeenCalledWith("/api/users/login", {
        email: "user@example.com",
        password: "secret",
      });
    });

    it("stores the JWT in localStorage under the 'token' key", async () => {
      mockPost.mockResolvedValueOnce({ data: loginResponse });
      await userService.login({ email: "user@example.com", password: "secret" });
      expect(localStorage.setItem).toHaveBeenCalledWith("token", "jwt-token-abc");
    });

    it("returns the full login response including token and user", async () => {
      mockPost.mockResolvedValueOnce({ data: loginResponse });
      const result = await userService.login({ email: "user@example.com", password: "secret" });
      expect(result).toEqual(loginResponse);
    });

    it("propagates 401 unauthorized errors", async () => {
      mockPost.mockRejectedValueOnce(makeAxiosError(401));
      await expect(
        userService.login({ email: "user@example.com", password: "wrong" }),
      ).rejects.toMatchObject({ response: { status: 401 } });
    });

    it("does not call localStorage.setItem when login fails", async () => {
      mockPost.mockRejectedValueOnce(makeAxiosError(401));
      await userService.login({ email: "user@example.com", password: "wrong" }).catch(() => {});
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it("propagates network errors", async () => {
      mockPost.mockRejectedValueOnce(new Error("Network Error"));
      await expect(
        userService.login({ email: "user@example.com", password: "secret" }),
      ).rejects.toThrow("Network Error");
    });
  });

  // ── deleteAccount ─────────────────────────────────────────────────────────

  describe("deleteAccount", () => {
    it("sends DELETE to /api/users/:userId", async () => {
      mockDelete.mockResolvedValueOnce({ data: { message: "Deleted" } });
      await userService.deleteAccount(42);
      expect(mockDelete).toHaveBeenCalledWith("/api/users/42");
    });

    it("returns the message from the response", async () => {
      mockDelete.mockResolvedValueOnce({ data: { message: "Deleted" } });
      const result = await userService.deleteAccount(42);
      expect(result).toEqual({ message: "Deleted" });
    });

    it("propagates 401 errors", async () => {
      mockDelete.mockRejectedValueOnce(makeAxiosError(401));
      await expect(userService.deleteAccount(42)).rejects.toMatchObject({ response: { status: 401 } });
    });

    it("propagates 404 errors", async () => {
      mockDelete.mockRejectedValueOnce(makeAxiosError(404));
      await expect(userService.deleteAccount(99)).rejects.toMatchObject({ response: { status: 404 } });
    });

    it("propagates network errors", async () => {
      mockDelete.mockRejectedValueOnce(new Error("Network Error"));
      await expect(userService.deleteAccount(42)).rejects.toThrow("Network Error");
    });
  });

  // ── updateName ────────────────────────────────────────────────────────────

  describe("updateName", () => {
    it("sends PATCH to /api/users/:userId with the new name", async () => {
      mockPatch.mockResolvedValueOnce({ data: { user: userWithName } });
      await userService.updateName(1, "Alice");
      expect(mockPatch).toHaveBeenCalledWith("/api/users/1", { name: "Alice" });
    });

    it("returns the updated user", async () => {
      mockPatch.mockResolvedValueOnce({ data: { user: userWithName } });
      const result = await userService.updateName(1, "Alice");
      expect(result).toEqual({ user: userWithName });
    });

    it("propagates 401 errors", async () => {
      mockPatch.mockRejectedValueOnce(makeAxiosError(401));
      await expect(userService.updateName(1, "Alice")).rejects.toMatchObject({ response: { status: 401 } });
    });

    it("propagates network errors", async () => {
      mockPatch.mockRejectedValueOnce(new Error("Network Error"));
      await expect(userService.updateName(1, "Alice")).rejects.toThrow("Network Error");
    });
  });

  // ── changePassword ────────────────────────────────────────────────────────

  describe("changePassword", () => {
    const payload = { currentPassword: "old", newPassword: "new" };

    it("sends PUT to /api/users/:userId/password", async () => {
      mockPut.mockResolvedValueOnce({ data: { message: "Password updated" } });
      await userService.changePassword(1, payload);
      expect(mockPut).toHaveBeenCalledWith("/api/users/1/password", payload);
    });

    it("returns the message from the response", async () => {
      mockPut.mockResolvedValueOnce({ data: { message: "Password updated" } });
      const result = await userService.changePassword(1, payload);
      expect(result).toEqual({ message: "Password updated" });
    });

    it("propagates 401 errors", async () => {
      mockPut.mockRejectedValueOnce(makeAxiosError(401));
      await expect(userService.changePassword(1, payload)).rejects.toMatchObject({ response: { status: 401 } });
    });

    it("propagates 422 validation errors", async () => {
      mockPut.mockRejectedValueOnce(makeAxiosError(422));
      await expect(userService.changePassword(1, payload)).rejects.toMatchObject({ response: { status: 422 } });
    });

    it("propagates network errors", async () => {
      mockPut.mockRejectedValueOnce(new Error("Network Error"));
      await expect(userService.changePassword(1, payload)).rejects.toThrow("Network Error");
    });
  });

  // ── changeEmail ───────────────────────────────────────────────────────────

  describe("changeEmail", () => {
    const payload = { currentPassword: "secret", newEmail: "new@example.com" };

    it("sends PUT to /api/users/:userId/email", async () => {
      mockPut.mockResolvedValueOnce({ data: { user: { id: 1, email: "new@example.com" } } });
      await userService.changeEmail(1, payload);
      expect(mockPut).toHaveBeenCalledWith("/api/users/1/email", payload);
    });

    it("returns the updated user with id and email", async () => {
      mockPut.mockResolvedValueOnce({ data: { user: { id: 1, email: "new@example.com" } } });
      const result = await userService.changeEmail(1, payload);
      expect(result).toEqual({ user: { id: 1, email: "new@example.com" } });
    });

    it("propagates 401 errors", async () => {
      mockPut.mockRejectedValueOnce(makeAxiosError(401));
      await expect(userService.changeEmail(1, payload)).rejects.toMatchObject({ response: { status: 401 } });
    });

    it("propagates 409 conflict (email taken)", async () => {
      mockPut.mockRejectedValueOnce(makeAxiosError(409));
      await expect(userService.changeEmail(1, payload)).rejects.toMatchObject({ response: { status: 409 } });
    });

    it("propagates network errors", async () => {
      mockPut.mockRejectedValueOnce(new Error("Network Error"));
      await expect(userService.changeEmail(1, payload)).rejects.toThrow("Network Error");
    });
  });

  // ── setTheme ──────────────────────────────────────────────────────────────

  describe("setTheme", () => {
    it("sends PATCH to /api/users/:userId/theme", async () => {
      mockPatch.mockResolvedValueOnce({ data: { user: userProfile } });
      await userService.setTheme(1, { theme: "dark" });
      expect(mockPatch).toHaveBeenCalledWith("/api/users/1/theme", { theme: "dark" });
    });

    it("returns the updated user profile", async () => {
      mockPatch.mockResolvedValueOnce({ data: { user: userProfile } });
      const result = await userService.setTheme(1, { theme: "light" });
      expect(result).toEqual({ user: userProfile });
    });

    it("accepts all valid theme values", async () => {
      for (const theme of ["light", "dark", "system"] as const) {
        mockPatch.mockResolvedValueOnce({ data: { user: { ...userProfile, theme } } });
        const result = await userService.setTheme(1, { theme });
        expect(result.user.theme).toBe(theme);
      }
    });

    it("propagates 401 errors", async () => {
      mockPatch.mockRejectedValueOnce(makeAxiosError(401));
      await expect(userService.setTheme(1, { theme: "dark" })).rejects.toMatchObject({ response: { status: 401 } });
    });

    it("propagates network errors", async () => {
      mockPatch.mockRejectedValueOnce(new Error("Network Error"));
      await expect(userService.setTheme(1, { theme: "dark" })).rejects.toThrow("Network Error");
    });
  });
});
