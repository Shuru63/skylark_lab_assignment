import type{ Camera, Alert, CameraFormData } from "../types/index"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Request failed');
    }

    return response.json();
  }

  // Camera methods
  async getCameras(): Promise<Camera[]> {
    return this.request('/api/cameras');
  }

  async getCamera(id: string): Promise<Camera> {
    return this.request(`/api/cameras/${id}`);
  }

  async createCamera(cameraData: CameraFormData): Promise<Camera> {
    return this.request('/api/cameras', {
      method: 'POST',
      body: JSON.stringify(cameraData),
    });
  }

  async updateCamera(id: string, cameraData: Partial<Camera>): Promise<Camera> {
    return this.request(`/api/cameras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cameraData),
    });
  }

  async deleteCamera(id: string): Promise<void> {
    return this.request(`/api/cameras/${id}`, {
      method: 'DELETE',
    });
  }

  // Alert methods
  async getAlerts(cameraId?: string, limit = 50): Promise<Alert[]> {
    const params = new URLSearchParams();
    if (cameraId) params.append('cameraId', cameraId);
    params.append('limit', limit.toString());
    
    return this.request(`/api/alerts?${params}`);
  }

  // Stream control
  async startStream(cameraId: string): Promise<void> {
    return this.request(`/api/cameras/${cameraId}/start`, {
      method: 'POST',
    });
  }

  async stopStream(cameraId: string): Promise<void> {
    return this.request(`/api/cameras/${cameraId}/stop`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();