import { useState, useEffect } from 'react';
import type{ Camera } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useCameras = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchCameras();
    }
  }, [token]);

  const fetchCameras = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getCameras();
      setCameras(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cameras');
    } finally {
      setIsLoading(false);
    }
  };

  const addCamera = async (cameraData: Omit<Camera, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => {
    try {
      const newCamera = await apiService.createCamera(cameraData);
      setCameras(prev => [...prev, newCamera]);
      return newCamera;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add camera');
    }
  };

  const updateCamera = async (id: string, cameraData: Partial<Camera>) => {
    try {
      const updatedCamera = await apiService.updateCamera(id, cameraData);
      setCameras(prev => prev.map(cam => cam.id === id ? updatedCamera : cam));
      return updatedCamera;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update camera');
    }
  };

  const deleteCamera = async (id: string) => {
    try {
      await apiService.deleteCamera(id);
      setCameras(prev => prev.filter(cam => cam.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete camera');
    }
  };

  const toggleCamera = async (id: string, isActive: boolean) => {
    try {
      const updatedCamera = await apiService.updateCamera(id, { isActive });
      setCameras(prev => prev.map(cam => cam.id === id ? updatedCamera : cam));
      return updatedCamera;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to toggle camera');
    }
  };

  return {
    cameras,
    isLoading,
    error,
    fetchCameras,
    addCamera,
    updateCamera,
    deleteCamera,
    toggleCamera,
  };
};