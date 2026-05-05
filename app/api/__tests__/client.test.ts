import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { authInterceptor } from "../client";
import type { InternalAxiosRequestConfig } from "axios";
import { AxiosHeaders } from "axios";

const makeConfig = (
  extra: Record<string, string> = {},
): InternalAxiosRequestConfig => ({
  headers: new AxiosHeaders(extra),
  method: "get",
  url: "/test",
});

describe("authInterceptor", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", { getItem: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads the token from the 'token' key in localStorage", () => {
    vi.mocked(localStorage.getItem).mockReturnValue("jwt-abc");
    authInterceptor(makeConfig());
    expect(localStorage.getItem).toHaveBeenCalledWith("token");
  });

  it("sets Authorization: Bearer <token> when token is present", () => {
    vi.mocked(localStorage.getItem).mockReturnValue("my-jwt-token");
    const result = authInterceptor(makeConfig());
    expect(result.headers.Authorization).toBe("Bearer my-jwt-token");
  });

  it("does not set Authorization header when no token is stored", () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    const result = authInterceptor(makeConfig());
    expect(result.headers.Authorization).toBeUndefined();
  });

  it("preserves pre-existing headers alongside the Authorization header", () => {
    vi.mocked(localStorage.getItem).mockReturnValue("tok");
    const result = authInterceptor(
      makeConfig({ "Content-Type": "application/json" }),
    );
    expect(result.headers["Content-Type"]).toBe("application/json");
    expect(result.headers.Authorization).toBe("Bearer tok");
  });

  it("returns the config object (required by axios interceptor contract)", () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    const config = makeConfig();
    expect(authInterceptor(config)).toBe(config);
  });
});
