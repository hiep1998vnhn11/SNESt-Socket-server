const socketIO = require('socket.io');
const {
  addUser,
  joinRoom,
  removeUser,
  getUser,
  getSocket,
  getUserInRoom,
} = require('./user.js');

module.exports = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: 'http://localhost:8080',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    /* eslint-disable no-console */
    console.log(`An Client has connected to server: ${socket.id}`);

    socket.on('login', (userId) => {
      addUser({ id: socket.id, userId });
    });

    socket.on('join', ({ userId, roomId }) => {
      joinRoom({ userId, roomId });
      socket.join(`room ${roomId}`);
    });

    socket.on('sendToUser', ({ userId, message }) => {
      const user = getSocket(userId);
      if (!user) console.log(`User ${userId} not login!`);
      else {
        socket
          .to(user.id)
          .emit('receiptMessage', { userId: user.userId, message });
      }
    });

    socket.on('requestAddFriend', ({ userId, requestUserId, data }) => {
      console.log(
        `An user ${requestUserId} has been added friend with user ${userId} and data: ${data}`
      );
      const user = getSocket(userId);
      if (user) {
        socket.to(user.id).emit('responseAddFriend', data);
      }
    });

    socket.on('acceptFriend', ({ userId, response }) => {
      console.log(
        `An user has been added friend with user ${userId} and data: ${response}`
      );
      const user = getSocket(userId);
      if (user) {
        socket.to(user.id).emit('acceptFriendNotification', response);
      }
    });

    socket.on('disconnect', () => {
      removeUser(socket.id);
      console.log(`Client ${socket.id} had disconnected!`);
    });
  });
};
