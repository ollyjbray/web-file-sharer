const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    // If no room is specified, create a new one
    const room = roomId || crypto.randomBytes(4).toString('hex');
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
    
    // Tell the client what room they joined so they can show the ID
    socket.emit('room-joined', room);
    
    // Notify others in the room
    socket.to(room).emit('user-connected', socket.id);
  });

  socket.on('offer', (payload) => {
    socket.to(payload.target).emit('offer', payload);
  });

  socket.on('answer', (payload) => {
    socket.to(payload.target).emit('answer', payload);
  });

  socket.on('ice-candidate', (payload) => {
    socket.to(payload.target).emit('ice-candidate', payload);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
