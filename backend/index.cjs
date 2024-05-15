const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on("connection", (socket) => {
  console.log(`A user connected with id: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Client ${socket.id} disconnected`);
  });
});

httpServer.listen(3001, () => {
  console.log('Listening on port');
});