import api from "../api/client";
import type {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  UserProfile,
  UserWithName,
  ChangePasswordRequest,
  ChangeEmailRequest,
  SetThemeRequest,
} from "../model/user/types";
import { MockService, isMockEnabled } from "./mockService";

export const userService = {
  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    if (isMockEnabled) return MockService.register();
    const response = await api.post<{ message: string }>("/api/users", data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    if (isMockEnabled) {
      const resp = await MockService.login();
      localStorage.setItem("token", resp.token);
      return resp;
    }
    const response = await api.post<LoginResponse>("/api/users/login", data);
    localStorage.setItem("token", response.data.token);
    return response.data;
  },

  deleteAccount: async (userId: number): Promise<{ message: string }> => {
    if (isMockEnabled) return MockService.deleteAccount();
    const response = await api.delete<{ message: string }>(`/api/users/${userId}`);
    return response.data;
  },

  updateName: async (userId: number, name: string): Promise<{ user: UserWithName }> => {
    if (isMockEnabled) return MockService.updateName(userId, name);
    const response = await api.patch<{ user: UserWithName }>(`/api/users/${userId}`, { name });
    return response.data;
  },

  changePassword: async (userId: number, data: ChangePasswordRequest): Promise<{ message: string }> => {
    if (isMockEnabled) return MockService.changePassword();
    const response = await api.put<{ message: string }>(`/api/users/${userId}/password`, data);
    return response.data;
  },

  changeEmail: async (userId: number, data: ChangeEmailRequest): Promise<{ user: Pick<UserProfile, "id" | "email"> }> => {
    if (isMockEnabled) return MockService.changeEmail(userId, data.newEmail);
    const response = await api.put<{ user: Pick<UserProfile, "id" | "email"> }>(`/api/users/${userId}/email`, data);
    return response.data;
  },

  setTheme: async (userId: number, data: SetThemeRequest): Promise<{ user: UserProfile }> => {
    if (isMockEnabled) return MockService.setTheme(userId, data.theme);
    const response = await api.patch<{ user: UserProfile }>(`/api/users/${userId}/theme`, data);
    return response.data;
  },
};
