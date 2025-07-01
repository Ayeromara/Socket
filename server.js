// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const chatroomRoutes = require('./routes/chatroom');
const Message = require('/models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use('/api/chatroom', chatroomRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('join', ({ username, category }) => {
    socket.username = username;
    socket.join(category);
    console.log(`${username} joined ${category}`);
  });

  socket.on('sendMessage', async ({ room, message }) => {
    const newMessage = new Message({ room, username: socket.username, text: message });
    await newMessage.save();

    io.to(room).emit('message', { room, message: newMessage });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
