import { io } from 'socket.io-client';
import axios from 'axios';

async function createNewBoard(): Promise<{ token: string; boardId: string }> {
  const res = await axios.post('http://localhost:49185/board/create');
  return { token: res.data.token, boardId: res.data.boardId };
}

async function run() {
  const { token, boardId } = await createNewBoard();

  const socket = io('http://localhost:49185', {
    auth: { token },
  });

  socket.on('connect', () => {
    console.log('✅ Connected');

    socket.on('connect_error', (err) => {
      console.error('❌ Connect error:', err.message);
    });

    socket.emit('lists:get', boardId, (data: any) => {
      console.log('📩 Got response:', data);
    });
  });
}

run();