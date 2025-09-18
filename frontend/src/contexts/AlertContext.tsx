import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Alert } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';

interface AlertContextType {
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  clearAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage) {
      try {
        const alertData = JSON.parse(lastMessage.data);
        if (alertData.type === 'ALERT') {
          addAlert(alertData.payload);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message', error);
      }
    }
  }, [lastMessage]);

  const addAlert = (alert: Alert) => {
    setAlerts(prev => [alert, ...prev.slice(0, 49)]); // Keep only latest 50 alerts
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const value = {
    alerts,
    addAlert,
    clearAlerts,
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};