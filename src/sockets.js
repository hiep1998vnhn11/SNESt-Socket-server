const socketIO = require('socket.io');
/* eslint-disable no-unused-vars */
const {
  addUserRedis,
  removeUserRedis,
  getSocketRedis,
  client
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
      client.sismember(`room:${roomId}`, userId);
      socket.join(`room ${roomId}`);
    });
    /* eslint-disable object-curly-newline */
    socket.on('sendToUser', ({ userId, roomId, message, userName }) => {
      client.get(`user:id:${userId}`, (err, value) => {
        socket.to(value).emit('receiptMessage', {
          userId: value,
          roomId,
          message,
          userName,
        });
      });
    });

    socket.on('requestAddFriend', ({ userId, requestUserId, data }) => {
      console.log(
        `An user ${requestUserId} has been added friend with user ${userId} and data: ${data}`
      );
      client.get(`user:id:${userId}`, (err, value) => {
        socket.to(value).emit('responseAddFriend', data);
      });
    });

    socket.on('acceptFriend', ({ userId, response }) => {
      console.log(
        `An user has been added friend with user ${userId} and data: ${response}`
      );
      client.get(`user:id:${userId}`, (err, value) => {
        socket.to(value).emit('acceptFriendNotification', response);
      });
    });

    socket.on('likePost', ({ user, post }) => {
      console.log(
        `An user ${user.name} had been like user ${post.user_id} post ${post.id}`
      );
      client.get(`user:id:${post.user_id}`, (err, value) => {
        socket.to(value).emit('likePost', { user, post });
      });
    });

    socket.on('commentPost', ({ user, comment, post }) => {
      console.log(
        `An user ${user.name} had been comment user ${post.user_id} post ${post.id}: ${comment.content}`
      );
      client.get(`user:id:${post.user_id}`, (err, value) => {
        socket.to(value).emit('commentPost', { user, comment, post });
      });
    });

    socket.on('disconnect', async () => {
      await removeUserRedis(socket.id);
      console.log(`Client ${socket.id} had disconnected!`);
    });
  });
};
