const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const games = new Map(); // Store game states

const playerSymbol = 'X';
const opponentSymbol = 'O';

io.on("connection", (socket) => {
  console.log(`A user connected with id: ${socket.id}`);

  socket.on("createGame", (boardSize) => {
    const gameId = Math.random().toString(36).substring(7);
    
    games.set(gameId, {
      board: Array(boardSize * boardSize).fill(null),
      currentPlayer: playerSymbol,
      players: [{ id: socket.id }], // Store the players id
      boardSize: boardSize,
      undoHistory: [],
      redoHistory: [],
      undoHistoryAI: [],
      redoHistoryAI: []
    });
    
    socket.join(gameId);
    io.to(gameId).emit("gameCreated", gameId);
  });

  socket.on("joinGame", (gameId) => {
    const game = games.get(gameId);
    if (game && game.players.length < 2) {
      game.players.push({ id: socket.id });
      game.isPlayerOne = false;
      game.currentPlayer = opponentSymbol;
      
      socket.join(gameId);
      io.to(gameId).emit("gameJoined", game);
    } else {
      socket.emit("joinError", "Game not found or full");
    }
  });

  socket.on("move", ({ gameId, index }) => {
    const game = games.get(gameId);
    if (game && game.board[index] === null && game.currentPlayer === playerSymbol) {
      game.board[index] = game.currentPlayer;
      game.undoHistory.push({ index });
      game.redoHistory = [];
      game.currentPlayer = opponentSymbol;
      io.to(gameId).emit("updateGame", game);
    } else if (game && game.board[index] === null && game.currentPlayer === opponentSymbol) {
      if (!game.isPlayerOne) {
        game.board[index] = game.currentPlayer;
        game.undoHistoryAI.push({ index });
        game.redoHistoryAI = [];
        game.currentPlayer = playerSymbol;
        io.to(gameId).emit("updateGame", game);
      }
    }
  });

  socket.on("undo", (gameId) => {
    const game = games.get(gameId);
    if (game) {
      let lastMove;
      if (game.currentPlayer === opponentSymbol && game.undoHistory.length > 0) {
        lastMove = game.undoHistory.pop();
        game.redoHistory.push(lastMove);
      } else if (game.currentPlayer === playerSymbol && game.undoHistoryAI.length > 0) {
        lastMove = game.undoHistoryAI.pop();
        game.redoHistoryAI.push(lastMove);
      }
      if (lastMove) {
        game.board[lastMove.index] = null;
        game.currentPlayer = game.currentPlayer === playerSymbol ? opponentSymbol : playerSymbol;
        io.to(gameId).emit("updateGame", game);
      }
    }
  });

  socket.on("redo", (gameId) => {
    const game = games.get(gameId);
    if (game) {
      let lastMove;
      if (game.currentPlayer === opponentSymbol && game.redoHistoryAI.length > 0) {
        lastMove = game.redoHistoryAI[game.redoHistoryAI.length - 1]; 
        game.undoHistoryAI.push(lastMove);
        updatedRedoHistoryAI = game.redoHistoryAI.slice(0, -1);
        game.redoHistoryAI = updatedRedoHistoryAI;
      } else if (game.currentPlayer === playerSymbol && game.redoHistory.length > 0) {
        lastMove = game.redoHistory[game.redoHistory.length - 1];
        game.undoHistory.push(lastMove);
        updatedRedoHistory = game.redoHistory.slice(0, -1);
        game.redoHistory = updatedRedoHistory;
      }
      if (lastMove) {
        game.board[lastMove.index] = game.currentPlayer;
        game.currentPlayer = game.currentPlayer === playerSymbol ? opponentSymbol : playerSymbol;
        io.to(gameId).emit("updateGame", game);
      }
    }
  });

  socket.on("resetGame", (gameId) => {
    const game = games.get(gameId);
    if (game) {
      game.board = Array(game.boardSize * game.boardSize).fill(null);
      game.currentPlayer = playerSymbol;
      game.undoHistory = [];
      game.redoHistory = [];
      game.undoHistoryAI = [];
      game.redoHistoryAI = [];
      io.to(gameId).emit("updateGame", game);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    // Clean up game if user disconnects
    games.forEach((game, gameId) => {
      if (game.players.includes(socket.id)) {
        games.delete(gameId);
        io.to(gameId).emit("playerDisconnected");
      }
    });
  });
});

httpServer.listen(3001, () => {
  console.log("Server is running on port 3001");
});