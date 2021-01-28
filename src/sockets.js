const socketIO = require('socket.io');
/* eslint-disable no-unused-vars */
const {
  addUserRedis,
  removeUserRedis,
  getUserRedis,
  getSocketRedis
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
      addUserRedis({ id: socket.id, userId });
      socket.broadcast.emit('userLoggedIn', userId);
    });

    socket.on('join', ({ userId, roomId }) => {
      // joinRoom({ userId, roomId });
      socket.join(`room ${roomId}`);
    });
    /* eslint-disable object-curly-newline */
    socket.on('sendToUser', ({ userId, roomId, message, userName }) => {
      const user = getSocketRedis(userId);
      if (user) {
        socket.to(user.id).emit('receiptMessage', {
          userId: user.userId,
          roomId,
          message,
          userName,
        });
      }
    });

    socket.on('requestAddFriend', ({ userId, requestUserId, data }) => {
      console.log(
        `An user ${requestUserId} has been added friend with user ${userId} and data: ${data}`
      );
      const user = getSocketRedis(userId);
      if (user) {
        socket.to(user.id).emit('responseAddFriend', data);
      }
    });

    socket.on('acceptFriend', ({ userId, response }) => {
      console.log(
        `An user has been added friend with user ${userId} and data: ${response}`
      );
      const user = getSocketRedis(userId);
      if (user) {
        socket.to(user.id).emit('acceptFriendNotification', response);
      }
    });

    socket.on('likePost', ({ user, post }) => {
      console.log(
        `An user ${user.name} had been like user ${post.user_id} post ${post.id}`
      );
      const USER = getSocketRedis(post.user_id);
      if (USER) {
        socket.to(USER.id).emit('likePost', { user, post });
      }
    });

    socket.on('commentPost', ({ user, comment, post }) => {
      console.log(
        `An user ${user.name} had been comment user ${post.user_id} post ${post.id}: ${comment.content}`
      );
      const USER = getSocketRedis(post.user_id);
      if (USER) {
        socket.to(USER.id).emit('commentPost', { user, comment, post });
      }
    });

    socket.on('disconnect', () => {
      // const user = getUserRedis(socket.id);
      // if (user) {
      //   socket.broadcast.emit('userLoggedOut', user);
      // }
      removeUserRedis(socket.id);
      console.log(`Client ${socket.id} had disconnected!`);
    });
  });
};
