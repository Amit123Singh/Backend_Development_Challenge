const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

const setupSocketIO = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.decoded = decoded;
        next();
      });
    } else {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.decoded.id}`);
    
    // Join a room based on user ID
    socket.join(socket.decoded.id);
    
    // Join room based on role
    socket.join(socket.decoded.role);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.decoded.id}`);
    });
  });

  return io;
};

module.exports = { setupSocketIO };