// src/types.ts
export interface User {
  id: string;
  username: string;
}

export interface Camera {
  id: string;
  name: string;
  rtspUrl: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: string;
  confidence: number;
  imageUrl?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
}

export interface CameraFormData {
  name: string;
  rtspUrl: string;
  location?: string;
}

// Response from login/register
export interface AuthResponse {
  user: User;
  token: string;
}
