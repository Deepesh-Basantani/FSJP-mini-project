import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

const NOTIFICATION_SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocketNotifications() {
  const { user } = useAuth();
  const [socketConnected, setSocketConnected] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    let socket;
    try {
      socket = io(NOTIFICATION_SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 3000,
        reconnectionAttempts: 3
      });

      socket.on('connect', () => {
        setSocketConnected(true);
        socket.emit('join', { userId: user.id });
      });

      socket.on('disconnect', () => {
        setSocketConnected(false);
      });

      socket.on('connect_error', () => {
        setSocketConnected(false);
      });

      socket.on('notification', (data) => {
        setLiveAlerts((prev) => [data, ...prev]);
      });
    } catch (e) {
      setSocketConnected(false);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [user?.id]);

  const clearAlert = (index) => {
    setLiveAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  return { socketConnected, liveAlerts, clearAlert };
}
