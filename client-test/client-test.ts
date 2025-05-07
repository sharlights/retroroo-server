import { io } from 'socket.io-client';
import axios from 'axios';

async function createNewBoard(): Promise<string> {
  const res = await axios.post('http://localhost:49185/board/create');
  return res.data.token;
}

async function run() {
  const token = await createNewBoard();

  const socket = io('http://localhost:49185', {
    auth: { token },
  });

  socket.on('connect', () => {
    console.log('✅ Connected as', socket.id);
    socket.emit('board:connect');
  });

  socket.onAny((event, data) => {
    console.log('📩 Received:', event, data);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Connect error:', err.message);
  });
}

run();
