import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { appleAudio } from '../lib/appleAudio';

export interface NotificationPayload {
  id?: string;
  title: string;
  description?: string;
  type?: 'success' | 'copy' | 'share' | 'favorite' | 'info';
  duration?: number;
}

interface NotificationContextType {
  notification: NotificationPayload | null;
  notify: (payload: NotificationPayload) => void;
  dismiss: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationPayload | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setNotification(null);
  }, []);

  const notify = useCallback(
    (payload: NotificationPayload) => {
      // 1. Play zero-latency Apple Pay sound immediately
      appleAudio.play();

      // 2. Clear any active timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // 3. Set notification state with unique ID for animation keying
      const id = Date.now().toString();
      setNotification({ ...payload, id });

      // 4. Auto dismiss after 1.0 second (1000ms)
      const duration = payload.duration ?? 1000;
      timerRef.current = setTimeout(() => {
        setNotification((current) => (current?.id === id ? null : current));
      }, duration);
    },
    []
  );

  return (
    <NotificationContext.Provider value={{ notification, notify, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
