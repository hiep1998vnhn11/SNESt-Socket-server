const socketIO = require('socket.io');
/* eslint-disable no-unused-vars */
const { addUser, removeUser, getUser, getSocket } = require('./user.js');

const client = require('./redis');

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
      socket.broadcast.emit('userLoggedIn', userId);
    });

    socket.on('join', ({ userId, roomId }) => {
      // joinRoom({ userId, roomId });
      // client.sismember(`room:${roomId}`, userId);
      socket.join(`room ${roomId}`);
    });
    /* eslint-disable object-curly-newline */
    socket.on('sendToUser', async ({ userId, roomId, message, userName }) => {
      const socketByUser = await getSocket(userId);
      socket.to(socketByUser).emit('receiptMessage', {
        userId,
        roomId,
        message,
        userName,
      });
    });

    socket.on('join-call', async ({ call_id, peer_id, user_id }) => {
      const call = await client.scard(`call:${call_id}`);
      if (!call) {
        socket.emit('call_not_found', call_id);
      } else {
        await client.sadd(`call:${call_id}`, peer_id);
        // create room named call:call_id
        socket.join(`call:${call_id}`);
        client.set(`user:${socket.id}:call`, call_id);
        // broadcast in room a person had join!
        socket
          .to(`call:${call_id}`)
          .broadcast.emit('user-join', { user_id, peer_id });
      }
      console.log('join-call');
    });

    socket.on('create-call', async ({ call_id, user_id, user }) => {
      const call = await client.scard(`call:${call_id}`);
      if (!call) {
        await client.sadd(`call:${call_id}`, user_id);
        socket.emit('create-call-success');
        console.log(`${user.name} is calling ${user_id} at ${call_id}`);
        const socketByUser = await getSocket(user_id);
        if (socketByUser) {
          socket.to(socketByUser).emit('people-calling', { user, call_id });
          console.log('calling ...');
        }
      }
      console.log('create-call');
    });

    socket.on('calling', async ({ user_id, user, call_id }) => {
      console.log(`${user.name} is calling ${user_id} at ${call_id}`);
      const socketByUser = await getSocket(user_id);
      if (socketByUser) {
        socket.to(socketByUser).emit('people-calling', { user, call_id });
        console.log('emit calling');
      }
    });

    socket.on('refuse-call', async ({ user_id, call_id }) => {
      const socketByUser = await getSocket(user_id);
      if (socketByUser) {
        socket
          .to(socketByUser)
          .emit('people-refuse-call', { user_id, call_id });
        console.log('refuse-call');
      }
    });

    socket.on('end-call', async ({ call_id, user_id, peer_id }) => {
      socket
        .to(`call:${call_id}`)
        .broadcast.emit('user-leave', { user_id, peer_id });
      await client.del(`user:${socket.id}:call`);
      console.log('end-call');
    });

    socket.on('remove-call', async (call_id) => {
      socket.to(`call:${call_id}`).broadcast.emit('remove-call');
      await client.del(`call:${call_id}`);
      console.log('remove-call');
    });

    socket.on('cancel-call', async ({ call_id, user_id }) => {
      const socketByUser = await getSocket(user_id);
      if (socketByUser) {
        socket.to(socketByUser).emit('people-cancel-call', call_id);
      }
    });

    socket.on('typingUser', async ({ userId, roomId, isTyping }) => {
      const socketByUser = await getSocket(userId);
      if (socketByUser) {
        socket.to(socketByUser).emit('typing', { roomId, isTyping });
      }
    });

    socket.on('requestAddFriend', async ({ userId, requestUserId, data }) => {
      console.log(
        `An user ${requestUserId} has been added friend with user ${userId} and data: ${data}`
      );
      const socketByUser = await getSocket(userId);
      if (socketByUser) {
        socket.to(socketByUser).emit('responseAddFriend', data);
      }
    });

    socket.on('acceptFriend', async ({ userId, response }) => {
      console.log(
        `An user has been added friend with user ${userId} and data: ${response}`
      );

      const socketByUser = await getSocket(userId);
      if (socketByUser) {
        socket.to(socketByUser).emit('acceptFriendNotification', response);
      }
    });

    socket.on('likePost', async ({ user, post }) => {
      console.log(
        `An user ${user.name} had been like user ${post.user_id} post ${post.id}`
      );
      const socketByUser = await getSocket(post.user_id);
      if (socketByUser) {
        socket.to(socketByUser).emit('likePost', { user, post });
      }
    });

    socket.on('commentPost', async ({ user, comment, post }) => {
      console.log(
        `An user ${user.name} had been comment user ${post.user_id} post ${post.id}: ${comment.content}`
      );
      const socketByUser = await getSocket(post.user_id);
      if (socketByUser) {
        socket.to(socketByUser).emit('commentPost', { user, comment, post });
      }
    });

    socket.on('disconnect', async () => {
      const call_id = await client.get(`user:${socket.id}:call`);
      const user_id = await getUser(socket.id);
      if (call_id) {
        socket
          .to(`call:${call_id}`)
          .broadcast.emit('user-leave', { user_id, peer_id: null });
      }
      await client.del(`user:${socket.id}:call`);
      await client.del(`call:${call_id}`);
      removeUser(socket.id);
      console.log(`Client ${socket.id} had disconnected!`);
    });
  });
};
