const Message = require('./models/message');

module.exports = function (io) {
  const rooms = new Set();

  io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', ({ username, category }) => {
      if (!rooms.has(category)) {
        rooms.add(category);
      }
      socket.join(category);
      io.emit('availableRooms', Array.from(rooms));

      // Send messages for this room
      Message.find({ room: category }).then((messages) => {
        socket.emit('roomMessages', { room: category, messages });
      });
    });

    socket.on('sendMessage', async ({ room, message }) => {
      const newMessage = new Message({ room, username: socket.id, text: message });
      await newMessage.save();
      io.to(room).emit('message', { room, message: newMessage });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};