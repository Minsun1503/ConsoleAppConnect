const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Screen Sharing Server is running');
});

// Connection tracking
const connections = new Map();
const rooms = new Map();

// Socket.io connections
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Create or join a room
  socket.on('create-room', (roomId) => {
    socket.join(roomId);
    rooms.set(roomId, { host: socket.id });
    socket.emit('room-created', roomId);
    console.log(`Room created: ${roomId} by ${socket.id}`);
  });

  socket.on('join-room', (roomId) => {
    if (rooms.has(roomId)) {
      socket.join(roomId);
      const hostId = rooms.get(roomId).host;
      connections.set(socket.id, { roomId, type: 'viewer' });
      
      // Notify the host that a viewer has joined
      io.to(hostId).emit('viewer-joined', { viewerId: socket.id });
      socket.emit('joined-room', { roomId, hostId });
      console.log(`Client ${socket.id} joined room: ${roomId}`);
    } else {
      socket.emit('error', { message: 'Room not found' });
    }
  });

  // Screen sharing events
  socket.on('screen-data', (data) => {
    const { roomId, imageData } = data;
    socket.to(roomId).emit('screen-data', { imageData });
  });

  // Keyboard events
  socket.on('key-event', (data) => {
    const { roomId, key, type } = data;
    const hostId = rooms.get(roomId)?.host;
    
    if (hostId) {
      io.to(hostId).emit('key-event', { key, type });
    }
  });

  // Configuration events
  socket.on('update-allowed-keys', (data) => {
    const { roomId, allowedKeys } = data;
    if (rooms.has(roomId) && rooms.get(roomId).host === socket.id) {
      rooms.get(roomId).allowedKeys = allowedKeys;
      console.log(`Updated allowed keys for room ${roomId}`);
    }
  });

  // Emergency stop
  socket.on('emergency-stop', (roomId) => {
    socket.to(roomId).emit('emergency-stop');
    console.log(`Emergency stop triggered in room ${roomId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Check if socket was a room host
    for (const [roomId, room] of rooms.entries()) {
      if (room.host === socket.id) {
        io.to(roomId).emit('host-disconnected');
        rooms.delete(roomId);
        console.log(`Room ${roomId} closed because host disconnected`);
        break;
      }
    }
    
    connections.delete(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 