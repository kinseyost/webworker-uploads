import io from 'socket.io-client';
const socket = io.connect(':8081');

export function initializeSocket() {
  return socket;
}
