// TicTacToe.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Canvas from './Canvas';
import { io } from 'socket.io-client';
import * as tf from '@tensorflow/tfjs';

function calculateWinner(squares) {
  const boardSize = Math.sqrt(squares.length); // Calculate board size from squares array
  const lines = [];

  // Generate lines based on boardSize
  if (boardSize === 3) {
    // Lines for 3x3 board
    lines.push(
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    );
    
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
  } 
  
  if (boardSize === 4) {
    // Lines for 4x4 board
    lines.push(
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9, 10, 11],
      [12, 13, 14, 15],
      [0, 4, 8, 12],
      [1, 5, 9, 13],
      [2, 6, 10, 14],
      [3, 7, 11, 15],
      [0, 5, 10, 15],
      [3, 6, 9, 12]
    );

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c, d] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c] && squares[a] === squares[d]) {
        return squares[a];
      }
    }
  } 
  
  if (boardSize === 5) {
    // Lines for 5x5 board
    lines.push(
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24],
      [0, 5, 10, 15, 20],
      [1, 6, 11, 16, 21],
      [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23],
      [4, 9, 14, 19, 24],
      [0, 6, 12, 18, 24],
      [4, 8, 12, 16, 20]
    );
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c, d, e] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c] && squares[a] === squares[d] && squares[a] === squares[e]) {
        return squares[a]
      }
    }
  }
  return null;
}

const TicTacToe = () => {
  const [socket, setSocket] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [gameState, setGameState] = useState(null);
  
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [modeSelected, setModeSelected] = useState(false);
  
  const [boardSize, setBoardSize] = useState(3);
  const [board, setBoard] = useState(Array(boardSize * boardSize).fill(null));
  
  const [isXNext, setIsXNext] = useState(true);
  const [isSinglePlayer, setIsSinglePlayer] = useState(true);
  const [isPlayerOne, setIsPlayerOne] = useState(false);
  const [isGameCreated, setIsGameCreated] = useState(false);
  
  const [aiDifficulty, setAIDifficulty] = useState('easy');
  const playerSymbol = 'X';
  const opponentSymbol = 'O';
  
  const [undoHistory, setUndoHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);
  const [undoHistoryAI, setUndoHistoryAI] = useState([]);
  const [redoHistoryAI, setRedoHistoryAI] = useState([]);

  useEffect(() => {
    const newSocket = io('https://952575c1-e41b-4977-9de2-51f525f357f9-00-3f8gwkw0dnok0.riker.replit.dev:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log(`Connected to server with id: ${newSocket.id}`);
    });

    newSocket.on('gameCreated', (gameId) => {
      setGameId(gameId);
      setIsPlayerOne(true);
      setGameStarted(true);
      setGameState({
        board: Array(boardSize * boardSize).fill(null),
        boardSize: boardSize,
        isPlayerOne: true,
        currentPlayer: playerSymbol,
        undoHistory: [],
        redoHistory: [],
        undoHistoryAI: [],
        redoHistoryAI: []
      });
      console.log(`Game created with id: ${gameId}`);
    });

    newSocket.on('gameJoined', (game) => {
      const isPlayerOne = game.isPlayerOne;
      const currentPlayer = isPlayerOne ? playerSymbol : opponentSymbol;
      
      setGameState({
        ...game,
        currentPlayer: currentPlayer,
      });
      setIsPlayerOne(false);
      setGameStarted(true);
      console.log(`Game joined with id: ${gameId}`);
      console.log(`Total players: ${game.players.length}`);
    });

    newSocket.on('updateGame', (game) => {
      setGameState(game);
      // Update undo and redo history as needed
      setUndoHistory(game.undoHistory || []);
      setRedoHistory(game.redoHistory || []);
      setUndoHistoryAI(game.undoHistoryAI || []);
      setRedoHistoryAI(game.redoHistoryAI || []);
    });

    newSocket.on('playerDisconnected', () => {
      setGameOver(true);
      alert("Your opponent has disconnected. Game over.");
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Check for game over conditions
  useEffect(() => {
    const winner = calculateWinner(board);
    if (winner) {
      setGameOver(true);
      setTimeout(() => {
        setGameOver(false);
      }, 5000);
    }
  }, [board]);
  
  const onSquareClick = useCallback((index) => {
    console.log(`Clicked on index: ${index}`);

    if (!board[index] && !gameOver && isSinglePlayer && isXNext) {
      const newBoard = [...board];
      newBoard[index] = playerSymbol;
      
      setBoard(newBoard);
      setIsXNext(false);
      setUndoHistory([...undoHistory, index]);
      setRedoHistory([]);

      // AI makes a move
      const aiMove = getAIMove(newBoard, playerSymbol, opponentSymbol, aiDifficulty);
      console.log(aiMove);
      if (aiMove !== -1) {
        newBoard[aiMove] = opponentSymbol;
        setBoard(newBoard);
        setIsXNext(true); // Switch turns back to human
        setUndoHistoryAI([...undoHistoryAI, aiMove]);
        setRedoHistoryAI([]);
      }
    } 
  }, [board, boardSize, gameOver, isXNext, undoHistory, redoHistory, undoHistoryAI, redoHistoryAI, aiDifficulty, isSinglePlayer]);

  // Function to handle undoing a move
  const undoMove = () => {
    if (socket && gameId) {
      socket.emit("undo", gameId);
    }
    
    if (isXNext) {
      // Player's turn, undo player's move
      if (undoHistory.length > 0) {
        const lastMove = undoHistory[undoHistory.length - 1];
        const newBoard = [...board];
        newBoard[lastMove] = null;
        setBoard(newBoard);
        setIsXNext(false); // Switch to AI's turn
        
        const updatedUndoHistory = undoHistory.slice(0, -1);
        setUndoHistory(updatedUndoHistory);
        setRedoHistory([...redoHistory, lastMove]);
      } else {
        alert('No moves left to undo for player.');
      }
    } else if (!isXNext) {
      // AI's turn, undo AI's move
      if (undoHistoryAI.length > 0) {
        const lastMoveAI = undoHistoryAI[undoHistoryAI.length - 1];
        const newBoard = [...board];
        newBoard[lastMoveAI] = null;
        setBoard(newBoard);
        setIsXNext(true); // Switch to player's turn
        
        const updatedUndoHistoryAI = undoHistoryAI.slice(0, -1);
        setUndoHistoryAI(updatedUndoHistoryAI);
        setRedoHistoryAI([...redoHistoryAI, lastMoveAI]);
      } else {
        alert('No moves left to undo for AI.');
      }
    }
  };

  // Function to handle redoing a move
  const redoMove = () => {
    if (socket && gameId) {
      socket.emit("redo", gameId);
    }
    
    if (isXNext) {
      // Player's turn, redo player's move
      if (redoHistory.length > 0) {
        const lastMove = redoHistory[redoHistory.length - 1];
        const newBoard = [...board];
        newBoard[lastMove] = playerSymbol; // Redo player's move
        setBoard(newBoard);
        setIsXNext(false); // Stay on player's turn
        
        const updatedRedoHistory = redoHistory.slice(0, -1);
        setRedoHistory(updatedRedoHistory);
        setUndoHistory([...undoHistory, lastMove]);
      } else {
        alert('No moves left to redo for player.');
      }
    } else if (!isXNext) {
      // AI's turn, redo AI's move
      if (redoHistoryAI.length > 0) {
        const lastMoveAI = redoHistoryAI[redoHistoryAI.length - 1];
        const newBoard = [...board];
        newBoard[lastMoveAI] = opponentSymbol; // Redo AI's move
        setBoard(newBoard);
        setIsXNext(true); // Stay on AI's turn
        
        const updatedRedoHistoryAI = redoHistoryAI.slice(0, -1);
        setRedoHistoryAI(updatedRedoHistoryAI);
        setUndoHistoryAI([...undoHistoryAI, lastMoveAI]);
      } else {
        alert('No moves left to redo for AI.');
      }
    }
  };

  // Get AI move based on AI difficulty and board size
  const getAIMove = (board, playerSymbol, opponentSymbol, aiDifficulty) => {
    const boardSize = Math.sqrt(board.length);
    let move;

    if (aiDifficulty === 'easy') {
      if (boardSize === 3) {
        move = easyAIMove(board, opponentSymbol);
      } else if (boardSize === 4) {
        move = aiEasyMove(board, opponentSymbol);
      } else if (boardSize === 5) {
        move = aiEasierMove(board, opponentSymbol);
      }
    } else if (aiDifficulty === 'medium') {
      if (boardSize === 3) {
        move = mediumAIMove(board, playerSymbol, opponentSymbol);
      } else if (boardSize === 4) {
        move = aiMediumMove(board, playerSymbol, opponentSymbol);
      } else if (boardSize === 5) {
        move = aiMediumerMove(board, playerSymbol, opponentSymbol);
      }
    } else if (aiDifficulty === 'hard') {
      if (boardSize === 3) {
        move = getBetterMove(board, opponentSymbol);
      } else if (boardSize === 4) {
        move = getBestMove(board, playerSymbol, opponentSymbol);
      } else if (boardSize === 5) {
        move = getUltimateMove(board, opponentSymbol);
      }
    }

    return move;
  };

  // AI Level: Easy
  const easyAIMove = (board, opponentSymbol) => {
    const model = tf.sequential();
    
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [board.length] }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: board.length, activation: 'softmax' }));

    // Use categorical crossentropy for multi-class classification problems
    model.compile({ loss: 'categoricalCrossentropy', optimizer: 'adam' });
    
    const boardSize = Math.sqrt(board.length); 

    // Convert the board to a 2D array with one-hot encoding
    const board2D = Array.from({ length: boardSize }, (_, i) =>
      board.slice(i * boardSize, (i + 1) * boardSize).map(cell => {
        if (cell === opponentSymbol) return 0; // opponentSymbol
        if (cell === playerSymbol) return 1; // playerSymbol
        return 2; // null
      })
    );
    
    // Convert the 2D array to a TensorFlow tensor
    const input = tf.tensor2d(board2D);
    
    const prediction = model.predict(input.reshape([1, board.length]));
    const availableMoves = [];
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        availableMoves.push({ index: i, value: prediction.dataSync()[i] });
      }
    }
    
    availableMoves.sort((a, b) => b.value - a.value);
    return availableMoves.length > 0 ? availableMoves[0].index : -1;
  };

  // For 4×4 board
  const aiEasyMove = (board, opponentSymbol) => {
    const model = tf.sequential();

    model.add(tf.layers.dense({ units: 128, activation: 'relu', inputShape: [board.length] }));
    model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
    model.add(tf.layers.dense({ units: board.length, activation: 'softmax' }));

    // Use categorical crossentropy for multi-class classification problems
    model.compile({ loss: 'categoricalCrossentropy', optimizer: 'adam' });

    const boardSize = Math.sqrt(board.length); 

    // Convert the board to a 2D array with one-hot encoding
    const board2D = Array.from({ length: boardSize }, (_, i) =>
      board.slice(i * boardSize, (i + 1) * boardSize).map(cell => {
        if (cell === opponentSymbol) return 0; // opponentSymbol
        if (cell === playerSymbol) return 1; // playerSymbol
        return 2; // null
      })
    );

    // Convert the 2D array to a TensorFlow tensor
    const input = tf.tensor2d(board2D);

    const prediction = model.predict(input.reshape([1, board.length]));
    const availableMoves = [];
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        availableMoves.push({ index: i, value: prediction.dataSync()[i] });
      }
    }

    availableMoves.sort((a, b) => b.value - a.value);
    return availableMoves.length > 0 ? availableMoves[0].index : -1;
  };

  // For 5×5 board
  const aiEasierMove = (board, opponentSymbol) => {
    const model = tf.sequential();

    model.add(tf.layers.dense({ units: 256, activation: 'relu', inputShape: [board.length] }));
    model.add(tf.layers.dense({ units: 256, activation: 'relu' }));
    model.add(tf.layers.dense({ units: board.length, activation: 'softmax' }));

    // Use categorical crossentropy for multi-class classification problems
    model.compile({ loss: 'categoricalCrossentropy', optimizer: 'adam' });

    const boardSize = Math.sqrt(board.length); 

    // Convert the board to a 2D array with one-hot encoding
    const board2D = Array.from({ length: boardSize }, (_, i) =>
      board.slice(i * boardSize, (i + 1) * boardSize).map(cell => {
        if (cell === opponentSymbol) return 0; // opponentSymbol
        if (cell === playerSymbol) return 1; // playerSymbol
        return 2; // null
      })
    );

    // Convert the 2D array to a TensorFlow tensor
    const input = tf.tensor2d(board2D);

    const prediction = model.predict(input.reshape([1, board.length]));
    const availableMoves = [];
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        availableMoves.push({ index: i, value: prediction.dataSync()[i] });
      }
    }

    availableMoves.sort((a, b) => b.value - a.value);
    return availableMoves.length > 0 ? availableMoves[0].index : -1;
  };

  // AI Level: Medium
  const mediumAIMove = (board, playerSymbol, opponentSymbol) => {
    const boardSize = Math.sqrt(board.length);

    // Function to calculate available moves
    const getAvailableMoves = (board) => {
      return board.reduce((moves, cell, index) => {
        if (!cell) moves.push(index);
        return moves;
      }, []);
    };

    // Function to check for a winning move
    const findWinningMove = (board, symbol) => {
      for (let i = 0; i < board.length; i++) {
        if (!board[i]) {
          const newBoard = [...board];
          newBoard[i] = symbol;
          if (calculateWinner(newBoard) === symbol) {
            return i;
          }
        }
      }
      return -1;
    };

    // Check for immediate winning moves
    const winningMove = findWinningMove(board, opponentSymbol);
    if (winningMove !== -1) {
      return winningMove;
    }

    // Check for blocking opponent's winning moves
    const blockingMove = findWinningMove(board, playerSymbol);
    if (blockingMove !== -1 && isNearRecentMove(blockingMove)) { // Only block if near recent move
      return blockingMove;
    }

    // Heuristic approach to prioritize moves
    // Example: Prefer center and corners for initial moves
    const center = Math.floor(boardSize / 2);
    const corners = [0, boardSize - 1, boardSize * (boardSize - 1), boardSize * boardSize - 1];

    for (const move of [center, ...corners]) {
      if (!board[move]) {
        return move;
      }
    }

    // If no immediate win or block, use a strategic heuristic for remaining moves
    const availableMoves = getAvailableMoves(board);

    // Example: Preferentially take positions that increase chances of future wins
    const strategicMoves = [4, 0, 2, 6, 8, 1, 3, 5, 7]; // Example order of strategic moves

    for (const move of strategicMoves) {
      if (availableMoves.includes(move)) {
        return move;
      }
    }

    // Default to a random available move if no strategic move is found
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];

    // Function to check if move is near recent move (adjust the threshold as needed)
    function isNearRecentMove(move) {
      // Replace with your logic to determine proximity, e.g., manhattan distance, etc.
      const recentMove = findRecentMove(board, playerSymbol);
      const threshold = 2; // Adjust as needed based on board size and game dynamics
      return distanceBetweenMoves(move, recentMove) <= threshold;
    }

    // Function to find recent move
    function findRecentMove(board, symbol) {
      for (let i = board.length - 1; i >= 0; i--) {
        if (board[i] === symbol) {
          return i;
        }
      }
      return -1; // Return a default value or handle case where recent move isn't found
    }

    // Function to calculate distance between ai player moves and opponent human moves
    function distanceBetweenMoves(move1, move2) {
      // Replace with actual distance calculation logic based on board size and move representation. ex: manhatten distance 
      const boardSize = Math.sqrt(board.length);
      
      const row1 = Math.floor(move1 / boardSize);
      const col1 = move1 % boardSize;
      const row2 = Math.floor(move2 / boardSize);
      const col2 = move2 % boardSize;

      return Math.abs(row1 - row2) + Math.abs(col1 - col2);
    }
  };

  // For 4×4 board
  const aiMediumMove = (board, playerSymbol, opponentSymbol) => {
    const boardSize = Math.sqrt(board.length);

    // Function to calculate available moves
    const getAvailableMoves = (board) => {
      return board.reduce((moves, cell, index) => {
        if (!cell) moves.push(index);
        return moves;
      }, []);
    };

    // Function to check for a winning move
    const findWinningMove = (board, symbol) => {
      for (let i = 0; i < board.length; i++) {
        if (!board[i]) {
          const newBoard = [...board];
          newBoard[i] = symbol;
          if (calculateWinner(newBoard, boardSize) === symbol) {
            return i;
          }
        }
      }
      return -1;
    };

    // Check for immediate winning moves
    const winningMove = findWinningMove(board, opponentSymbol);
    if (winningMove !== -1) {
      return winningMove;
    }

    // Check for blocking opponent's winning moves
    const blockingMove = findWinningMove(board, playerSymbol);
    if (blockingMove !== -1 && isNearRecentMove(blockingMove)) {
      return blockingMove;
    }

    // Heuristic approach to prioritize moves
    // Example: Prefer center and corners for initial moves
    const center = Math.floor(boardSize / 2);
    const corners = [0, boardSize - 1, boardSize * (boardSize - 1), boardSize * boardSize - 1];

    for (const move of [center, ...corners]) {
      if (!board[move]) {
        return move;
      }
    }

    // If no immediate win or block, use a strategic heuristic for remaining moves
    const availableMoves = getAvailableMoves(board);

    // Example: Preferentially take positions that increase chances of future wins
    const strategicMoves = [5, 10, 15, 0, 2, 8, 12, 3, 7]; // Example order of strategic moves

    // Introducing controlled randomness with strategy
    const randomMoveThreshold = 0.5; // Adjust the threshold as needed
    const randomMoveIndex = Math.random();
    if (randomMoveIndex < randomMoveThreshold) {
      // Randomly select a move from available strategic moves
      const randomIndex = Math.floor(Math.random() * strategicMoves.length);
      const randomStrategicMove = strategicMoves[randomIndex];
      if (availableMoves.includes(randomStrategicMove)) {
        return randomStrategicMove;
      }
    }

    // Default to a strategic move if randomization doesn't apply
    for (const move of strategicMoves) {
      if (availableMoves.includes(move)) {
        return move;
      }
    }

    // Default to a random available move if no strategic move is found
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    
    function isNearRecentMove(move) {
      const recentMove = findRecentMove(board, playerSymbol);
      const threshold = 1; // Adjust as needed based on board size and game dynamics
      return distanceBetweenMoves(move, recentMove) <= threshold;
    }

    function findRecentMove(board, symbol) {
      for (let i = board.length - 1; i >= 0; i--) {
        if (board[i] === symbol) {
          return i;
        }
      }
      return -1; // Return a default value or handle case where recent move isn't found
    }

    function distanceBetweenMoves(move1, move2) {
      const boardSize = Math.sqrt(board.length);

      const row1 = Math.floor(move1 / boardSize);
      const col1 = move1 % boardSize;
      const row2 = Math.floor(move2 / boardSize);
      const col2 = move2 % boardSize;

      return Math.abs(row1 - row2) + Math.abs(col1 - col2);
    }
  };

  // For 5×5 board
  const aiMediumerMove = (board, playerSymbol, opponentSymbol) => {
    const boardSize = Math.sqrt(board.length);

    // Function to calculate available moves
    const getAvailableMoves = (board) => {
      return board.reduce((moves, cell, index) => {
        if (!cell) moves.push(index);
        return moves;
      }, []);
    };

    // Function to check for a winning move
    const findWinningMove = (board, symbol) => {
      for (let i = 0; i < board.length; i++) {
        if (!board[i]) {
          const newBoard = [...board];
          newBoard[i] = symbol;
          if (calculateWinner(newBoard) === symbol) {
            return i;
          }
        }
      }
      return -1;
    };

    // Check for immediate winning moves
    const winningMove = findWinningMove(board, opponentSymbol);
    if (winningMove !== -1) {
      return winningMove;
    }

    // Check for blocking opponent's winning moves
    const blockingMove = findWinningMove(board, playerSymbol);
    if (blockingMove !== -1 && isNearRecentMove(blockingMove)) {
      return blockingMove;
    }

    // Heuristic approach to prioritize moves
    // Example: Prefer center and corners for initial moves
    const center = Math.floor(boardSize / 2);
    const corners = [0, boardSize - 1, boardSize * (boardSize - 1), boardSize * boardSize - 1];

    for (const move of [center, ...corners]) {
      if (!board[move]) {
        return move;
      }
    }

    // If no immediate win or block, use a strategic heuristic for remaining moves
    const availableMoves = getAvailableMoves(board);

    // Example: Preferentially take positions that increase chances of future wins
    const strategicMoves = [12, 0, 4, 20, 24, 6, 8, 19, 2, 12, 16, 18, 22]; // Example order of strategic moves

    // Pattern recognition and response if near AI's recent move
    const lastAIMoveIndex = board.findIndex((cell) => cell === playerSymbol);
    if (lastAIMoveIndex !== -1) {
      const row = Math.floor(lastAIMoveIndex / boardSize);
      const col = lastAIMoveIndex % boardSize;

      // Check nearby cells for potential strategic moves
      const nearbyMoves = [
        { row: row - 1, col }, // Top
        { row: row + 1, col }, // Bottom
        { row, col: col - 1 }, // Left
        { row, col: col + 1 }, // Right
      ];

      for (const move of nearbyMoves) {
        const index = move.row * boardSize + move.col;
        if (move.row >= 0 && move.row < boardSize && move.col >= 0 && move.col < boardSize && !board[index]) {
          return index;
        }
      }
    }

    // Default to a strategic move if no nearby move found
    for (const move of strategicMoves) {
      if (availableMoves.includes(move)) {
        return move;
      }
    }

    // Default to a random available move if no strategic move is found
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];

    function isNearRecentMove(move) {
      const recentMove = findRecentMove(board, playerSymbol);
      const threshold = 2; // Adjust as needed based on board size and game dynamics
      return distanceBetweenMoves(move, recentMove) <= threshold;
    }

    function findRecentMove(board, symbol) {
      for (let i = board.length - 1; i >= 0; i--) {
        if (board[i] === symbol) {
          return i;
        }
      }
      return -1; // Return a default value or handle case where recent move isn't found
    }

    function distanceBetweenMoves(move1, move2) {
      // Replace with actual distance calculation logic based on board size and move representation. ex: manhatten distance 
      const boardSize = Math.sqrt(board.length);

      const row1 = Math.floor(move1 / boardSize);
      const col1 = move1 % boardSize;
      const row2 = Math.floor(move2 / boardSize);
      const col2 = move2 % boardSize;

      return Math.abs(row1 - row2) + Math.abs(col1 - col2);
    }
  };
  
  // AI Level: Unbeatable (Minimax algorithm to determine the AI's move)
  const getBetterMove = (board, player) => {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = player;
        let score = minimax(board, 0, false, player, playerSymbol).score;
        board[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  // Minimax algorithm for 3×3 board
  const minimax = (board, depth, isMaximizingPlayer, player, opponent) => {
    let winner = calculateWinner(board);
    if (winner === opponent) return { score: -10 + depth };
    if (winner === player) return { score: 10 - depth };
    if (isBoardFull(board)) return { score: 0 };

    if (isMaximizingPlayer) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = player;
          let score = minimax(board, depth + 1, false, player, opponent).score;
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return { score: bestScore };
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = opponent;
          let score = minimax(board, depth + 1, true, player, opponent).score;
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return { score: bestScore };
    }
  };

  // Minimax with Monte Carlo simulations for 4×4 board
  const getBestMove = (board, playerSymbol, opponentSymbol) => {
    // Function to calculate available moves
    const getAvailableMoves = (board) => {
      return board.reduce((moves, cell, index) => {
        if (!cell) moves.push(index);
        return moves;
      }, []);
    };

    // Minimax with Monte Carlo Simulation function
    const minimaxMonteCarlo = (board, depth, maximizingPlayer) => {
      if (depth === 0 || calculateWinner(board)) {
        // Return evaluation score for leaf node
        return evaluate(board, playerSymbol);
      }

      const availableMoves = getAvailableMoves(board);

      if (maximizingPlayer) {
        let maxEval = -Infinity;
        let bestMove = -1;

        for (const move of availableMoves) {
          const newBoard = [...board];
          newBoard[move] = playerSymbol;

          const evaluation = minimaxMonteCarlo(newBoard, depth - 1, false);
          if (evaluation > maxEval) {
            maxEval = evaluation;
            bestMove = move;
          }
        }

        return bestMove;
      } else {
        let minEval = Infinity;
        let bestMove = -1;

        for (const move of availableMoves) {
          const newBoard = [...board];
          newBoard[move] = opponentSymbol;

          const evaluation = minimaxMonteCarlo(newBoard, depth - 1, true);
          if (evaluation < minEval) {
            minEval = evaluation;
            bestMove = move;
          }
        }

        return bestMove;
      }
    };

    // Function to evaluate board state
    const evaluate = (board, playerSymbol) => {
      const winner = calculateWinner(board);
      if (winner === playerSymbol) {
        return 1; // AI wins
      } else if (winner === opponentSymbol) {
        return -1; // Opponent wins
      } else {
        return 0; // Draw or undecided
      }
    };

    // Perform Minimax with Monte Carlo simulations to determine the best move
    const depth = 3; // Depth limit for Minimax search
    return minimaxMonteCarlo(board, depth, true);
  };

  // Minimax alpha beta pruning
  const getUltimateMove = (board, player) => {
    let bestScore = -Infinity;
    let bestMove = -1;
    const maxDepth = 5;

    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = player;
        let score = minimaxab(board, 0, -Infinity, Infinity, false, player, playerSymbol, maxDepth).score;
        board[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    
    return bestMove;
  };

  // Minimax algorithm with alpha-beta pruning for 5×5 board
  const minimaxab = (board, depth, alpha, beta, isMaximizing, player, opponent, maxDepth) => {
    let winner = calculateWinner(board);
    if (winner === player) return { score: 10 - depth };
    if (winner === opponent) return { score: -10 + depth }; 
    if (isBoardFull(board) || depth === maxDepth) return { score: 0 };

    const availableMoves = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        availableMoves.push(i);
      }
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      
      for (const move of availableMoves) {
        board[move] = player;
        let score = minimaxab(board, depth + 1, alpha, beta, false, player, opponent, maxDepth).score;
        board[move] = null;
        bestScore = Math.max(bestScore, score);
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) break;
      }
      return { score: bestScore };
    } else {
      let bestScore = Infinity;
      
      for (const move of availableMoves) {
        board[move] = opponent;
        let score = minimaxab(board, depth + 1, alpha, beta, true, player, opponent, maxDepth).score;
        board[move] = null;
        bestScore = Math.min(bestScore, score);
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) break;
      }
      return { score: bestScore };
    }
  };

  const isBoardFull = (board) => {
    return board.every((cell) => cell !== null);
  };

  const handleSingleMode = () => {
    setIsSinglePlayer(true);
    setIsXNext(true);
    setModeSelected(true);
  }

  const handlePlayerMode = () => {
    setIsSinglePlayer(false);
    setModeSelected(true);
  }

  // Update AI difficulty
  const changeAIDifficulty = (aiDifficulty) => {
    setAIDifficulty(aiDifficulty);
  };

  const handleStartGame = () => {
    setGameStarted(true);
    setIsXNext(true);
    setBoard(Array(boardSize * boardSize).fill(null));
  };

  const handleStartPVP = () => {
    if (socket) {
      socket.emit("createGame", boardSize);
    }
  }

  const handleJoinPVP = () => {
    const id = prompt("Enter game ID:");
    if (id && socket) {
      setGameId(id);
      socket.emit("joinGame", id);
    }
  }

  const handleMove = (index) => {
    if (socket && gameId && gameState.board[index] === null) {
      if (gameState.currentPlayer === playerSymbol || (gameState.currentPlayer === opponentSymbol && !isPlayerOne)) {
        socket.emit("move", { gameId, index });
      } else {
        // Optionally handle UI or logic for when it's not the player's turn
      }
    }
  };
  
  const handleReset = () => {
    // Reset local game state
    setBoard(Array(boardSize * boardSize).fill(null));
    setIsXNext(true);
    setGameOver(false);
    setUndoHistory([]);
    setRedoHistory([]);
    
    if (socket && gameId) {
        socket.emit("resetGame", gameId)
    }
  };

  const handleStartOver = () => {
    setGameOver(false);
    setModeSelected(false);
    setGameStarted(false);
  }
  
  return (
    <>
      {!gameStarted && !gameOver && (
        <div className="start-screen">
          <h1>Welcome!</h1>
          <div>
            <button onClick={handleSingleMode}>Single Player</button>
            <button onClick={handlePlayerMode}>Double Player</button>
          </div>
        </div>
        )}
      
        {!gameStarted && modeSelected && isSinglePlayer && (
        <div className="start-screen2">
          <label>
            AI Difficulty:
            <select value={aiDifficulty} onChange={(e) => changeAIDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label>
            Board Size:
            <select value={boardSize} onChange={(e) => setBoardSize(parseInt(e.target.value))}>
              <option value={3}>3x3</option>
              <option value={4}>4x4</option>
              <option value={5}>5x5</option>
            </select>
          </label>
          <button onClick={handleStartGame}>Start Game</button>
        </div>
        )}
      
        {!gameStarted && modeSelected && !isSinglePlayer && (
          <div className="start-screen3">
            <p>Welcome To PVP Mode!</p>
             <button onClick={() => setIsGameCreated(true)}>Create</button>
            <button onClick={handleJoinPVP}>Join</button>
            {!gameStarted && modeSelected && !isSinglePlayer && isGameCreated && (
              <div>
                <label>
                  Board Size:
                  <select value={boardSize} onChange={(e) => setBoardSize(parseInt(e.target.value))}>
                    <option value={3}>3x3</option>
                    <option value={4}>4x4</option>
                    <option value={5}>5x5</option>
                  </select>
                </label>
                <button onClick={handleStartPVP}>Start Game</button>
              </div>
            )}
          </div>
        )}
        
        {gameStarted && modeSelected && !gameState && isSinglePlayer && !gameOver && (
        <div className="game">
          <h1>Tic Tac Toe</h1>
          <Canvas board={board} boardSize={boardSize} onSquareClick={onSquareClick} currentPlayer={isXNext ? playerSymbol : opponentSymbol} />
          <div className="game-info">
            <div>{'Next player: ' + (isXNext ? playerSymbol : opponentSymbol)}</div>
            <button onClick={handleReset}>Reset Game</button>
            <button onClick={undoMove}>Undo</button>
            <button onClick={redoMove}>Redo</button>
          </div>
        </div>
      )}

      {gameStarted && modeSelected && gameState && !isSinglePlayer && !gameOver && (
        <div className="game">
          <h1>Tic Tac Toe</h1>
          <Canvas board={gameState.board} boardSize={gameState.boardSize} onSquareClick={handleMove} currentPlayer={gameState.currentPlayer} />
          <div className="game-info">
            <div>Next player: {gameState.currentPlayer}</div>
            <button onClick={handleReset}>Reset Game</button>
            <button onClick={undoMove}>Undo</button>
            <button onClick={redoMove}>Redo</button>
          </div>
          {gameId && <p>Game ID: {gameId}</p>}
        </div>
      )}
      
      {gameStarted && modeSelected && gameOver && (
        <div className="game-over">
          <h1>Game Over!</h1>
            <p>Winner: {calculateWinner(board)}</p>
          <button onClick={handleReset}>Play Again</button>
          <button onClick={handleStartOver}>Go back to Start</button>
        </div>
      )}
    </>
  );
};

export default TicTacToe;