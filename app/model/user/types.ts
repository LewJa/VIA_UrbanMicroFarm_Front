export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  theme: "light" | "dark" | "system";
}

export interface UserWithName {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailRequest {
  currentPassword: string;
  newEmail: string;
}

export interface SetThemeRequest {
  theme: "light" | "dark" | "system";
}
