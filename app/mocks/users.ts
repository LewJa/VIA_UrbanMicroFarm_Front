import type { UserProfile, UserWithName, LoginResponse } from "~/model/user/types";

const MOCK_USER: UserProfile = { id: 1, name: "Test User", email: "user@example.com", theme: "system" };

export const mockUsers = {
  register: async (): Promise<{ message: string }> => ({
    message: "User registered successfully (MOCK)",
  }),

  login: async (): Promise<LoginResponse> => ({
    token: "mock-jwt-token-12345",
    user: MOCK_USER,
  }),

  deleteAccount: async (): Promise<{ message: string }> => ({
    message: "Account deleted successfully (MOCK)",
  }),

  updateName: async (userId: number, name: string): Promise<{ user: UserWithName }> => ({
    user: { id: userId, email: MOCK_USER.email, name },
  }),

  changePassword: async (): Promise<{ message: string }> => ({
    message: "Password updated successfully (MOCK)",
  }),

  changeEmail: async (userId: number, email: string): Promise<{ user: Pick<UserProfile, "id" | "email"> }> => ({
    user: { id: userId, email },
  }),

  setTheme: async (userId: number, theme: UserProfile["theme"]): Promise<{ user: UserProfile }> => ({
    user: { ...MOCK_USER, theme },
  }),
};
