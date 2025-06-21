import { io } from "socket.io-client";

let socket = null;
let isConnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

export const getSocket = (userId) => {
  if (!socket || !socket.connected) {
    if (isConnecting) {
      console.log('Socket connection already in progress...');
      return socket;
    }
    
    isConnecting = true;
    console.log('Initializing new socket connection...');
    
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket'],
      secure: import.meta.env.PROD,
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    socket.on('connect', () => {
      console.log('Socket connected successfully');
      isConnecting = false;
      reconnectAttempts = 0;
      if (userId) {
        socket.emit('authenticate', userId);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      isConnecting = false;
      reconnectAttempts++;
      
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error('Max reconnection attempts reached');
        disconnectSocket();
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        socket.connect();
      }
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('Disconnecting socket...');
    socket.disconnect();
    socket = null;
    isConnecting = false;
    reconnectAttempts = 0;
  }
};

export const isSocketConnected = () => {
  return socket && socket.connected;
};
