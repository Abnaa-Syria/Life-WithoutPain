import { useEffect, useRef } from 'react';
import { getDashboardSocket } from '../services/dashboardSocket';

/**
 * Subscribe to real-time support ticket events (messages, status).
 * @param {number|string|null} ticketId
 * @param {{ onMessage?: (payload) => void, onStatus?: (payload) => void }} handlers
 */
export default function useSupportTicketSocket(ticketId, { onMessage, onStatus } = {}) {
  const handlersRef = useRef({ onMessage, onStatus });
  handlersRef.current = { onMessage, onStatus };

  useEffect(() => {
    if (!ticketId) return undefined;

    const socket = getDashboardSocket();
    if (!socket) return undefined;

    const id = Number(ticketId);

    const handleMessage = (payload) => {
      if (payload?.ticketId === id) {
        handlersRef.current.onMessage?.(payload);
      }
    };

    const handleStatus = (payload) => {
      if (payload?.ticketId === id) {
        handlersRef.current.onStatus?.(payload);
      }
    };

    const joinRoom = () => {
      socket.emit('support:join', { ticketId: id });
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.once('connect', joinRoom);
    }

    socket.on('support:message', handleMessage);
    socket.on('support:status', handleStatus);

    return () => {
      socket.off('support:message', handleMessage);
      socket.off('support:status', handleStatus);
      socket.off('connect', joinRoom);
      socket.emit('support:leave', { ticketId: id });
    };
  }, [ticketId]);
}
