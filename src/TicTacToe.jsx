// TicTacToe.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Canvas from './Canvas';
import { io } from 'socket.io-client';
let socket;

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const humanPlayer = 'X';
  const aiPlayer = 'O';

  useEffect(() => {
    const socket = io('https://952575c1-e41b-4977-9de2-51f525f357f9-00-3f8gwkw0dnok0.riker.replit.dev:3001');

    // Join the game
    socket.on('connect', () => {
    console.log(socket.id);
    });

    socket.on('gameState', (gameState) => {
    setBoard(gameState.board);
    setIsXNext(gameState.currentPlayer === 'X');
    setGameOver(gameState.winner || isBoardFull(gameState.board));
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const onSquareClick = useCallback((index) => {
    if (!board[index] && !gameOver && isXNext) {
      const newBoard = [...board];
      newBoard[index] = humanPlayer;
      setBoard(newBoard);
      setIsXNext(false); // Switch turns to AI

      // AI makes a move
      const aiMove = getBestMove(newBoard, aiPlayer);
      if (aiMove !== -1) {
        newBoard[aiMove] = aiPlayer;
        setBoard(newBoard);
        setIsXNext(true); // Switch turns back to human
      }
    }
  }, [board, gameOver, isXNext]);

  const handleReset = () => {
    // Reset local game state
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
    if (socket) {
      socket.emit('resetGame'); // Inform the server to reset the game state
      console.log('Game reset');
    }
  };

  // Minimax algorithm to determine the AI's move
  const getBestMove = (board, player) => {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = player;
        let score = minimax(board, 0, false, player, humanPlayer).score;
        board[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

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

  const isBoardFull = (board) => {
    return board && Array.isArray(board) && board.every(cell => cell !== null);
  };

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  return (
    <div className="game">
      <h1>Tic Tac Toe</h1>
      <Canvas board={board} onSquareClick={onSquareClick} currentPlayer={isXNext ? humanPlayer : aiPlayer} />
      <div className="game-info">
        <div>{'Next player: ' + (isXNext ? 'X' : 'O')}</div>
        <button onClick={handleReset}>Reset Game</button>
      </div>
    </div>
  );
};

export default TicTacToe;