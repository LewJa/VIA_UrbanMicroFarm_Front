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

export const userService = {
  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/api/users", data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/api/users/login", data);
    localStorage.setItem("token", response.data.token);
    return response.data;
  },

  deleteAccount: async (userId: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/api/users/${userId}`);
    return response.data;
  },

  updateName: async (userId: number, name: string): Promise<{ user: UserWithName }> => {
    const response = await api.patch<{ user: UserWithName }>(`/api/users/${userId}`, { name });
    return response.data;
  },

  changePassword: async (userId: number, data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(`/api/users/${userId}/password`, data);
    return response.data;
  },

  changeEmail: async (userId: number, data: ChangeEmailRequest): Promise<{ user: Pick<UserProfile, "id" | "email"> }> => {
    const response = await api.put<{ user: Pick<UserProfile, "id" | "email"> }>(`/api/users/${userId}/email`, data);
    return response.data;
  },

  setTheme: async (userId: number, data: SetThemeRequest): Promise<{ user: UserProfile }> => {
    const response = await api.patch<{ user: UserProfile }>(`/api/users/${userId}/theme`, data);
    return response.data;
  },
};
