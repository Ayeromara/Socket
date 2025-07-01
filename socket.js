// socket.js
const messages = {}; // { roomName: [{ username, text, timestamp }] }

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', ({ username, room }) => {
      socket.join(room);
      console.log(`${username} joined room: ${room}`);

      // Send existing messages to the user
      if (!messages[room]) {
        messages[room] = [];
      }

      io.to(socket.id).emit('roomMessages', { room, messages: messages[room] });
      io.to(room).emit('message', { room, message: { username: 'System', text: `${username} has joined the chat`, timestamp: new Date() } });
    });

    socket.on('sendMessage', ({ room, message, username }) => {
      if (!messages[room]) {
        messages[room] = [];
      }

      const newMessage = { username, text: message, timestamp: new Date() };
      messages[room].push(newMessage);

      io.to(room).emit('message', { room, message: newMessage });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};
