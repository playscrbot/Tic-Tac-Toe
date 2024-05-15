// Canvas.jsx
import React, { useRef, useEffect } from 'react';

function calculateWinner(squares) {
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
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

const Canvas = ({ board, onSquareClick, currentPlayer }) => {
  const canvasRef = useRef(null);
  const humanPlayer = 'X';
  const aiPlayer = 'O';

  // Function to draw the Tic Tac Toe board
  const drawBoard = (ctx) => {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000';

    // Vertical lines
    ctx.moveTo(100, 0);
    ctx.lineTo(100, 300);
    ctx.moveTo(200, 0);
    ctx.lineTo(200, 300);

    // Horizontal lines
    ctx.moveTo(0, 100);
    ctx.lineTo(300, 100);
    ctx.moveTo(0, 200);
    ctx.lineTo(300, 200);

    ctx.stroke();
  };

  // Function to draw X
  const drawX = (ctx, x, y) => {
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    ctx.moveTo(x + 20, y + 20);
    ctx.lineTo(x + 80, y + 80);
    ctx.moveTo(x + 80, y + 20);
    ctx.lineTo(x + 20, y + 80);

    ctx.stroke();
  };

  // Function to draw O
  const drawO = (ctx, x, y) => {
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;

    ctx.arc(x + 50, y + 50, 40, 0, Math.PI * 2);
    ctx.stroke();
  };

  const drawMoves = (ctx, board) => {
    board.forEach((cell, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = col * 100;
      const y = row * 100;

      if (cell === humanPlayer) {
        drawX(ctx, x, y);
      } else if (cell === aiPlayer) {
        drawO(ctx, x, y);
      }
    });
  };

  // Minimax algorithm to determine the AI's move
  const minimax = (board, depth, isMaximizingPlayer) => {
    const winner = calculateWinner(board);
    if (winner === aiPlayer) return { score: 10 };
    if (winner === humanPlayer) return { score: -10 };
    if (isFull(board)) return { score: 0 };

    if (isMaximizingPlayer) {
      let bestScore = -Infinity;
      board.forEach((cell, index) => {
        if (cell === null) {
          board[index] = aiPlayer;
          let score = minimax(board, depth + 1, false).score;
          board[index] = null;
          bestScore = Math.max(score, bestScore);
        }
      });
      return { score: bestScore };
    } else {
        let bestScore = Infinity;
        board.forEach((cell, index) => {
          if (cell === null) {
            board[index] = humanPlayer;
            let score = minimax(board, depth + 1, true).score;
            board[index] = null;
            bestScore = Math.min(score, bestScore);
          }
        });
        return { score: bestScore };
      }
  };

  // Function to check if the board is full
  const isFull = (board) => {
    return board && board.every(cell => cell !== null);
  };

  // Function to get the best move for the AI
  const getBestMove = () => {
    let bestScore = -Infinity;
    let move;
    board.forEach((cell, index) => {
      if (cell === null) {
        board[index] = aiPlayer;
        let score = minimax(board, 0, false).score;
        board[index] = null;
        if (score > bestScore) {
          bestScore = score;
          move = index;
        }
      }
    });
    return move;
  };

  // AI makes a move
  const aiMakeMove = () => {
    const bestMove = getBestMove(board);
    onSquareClick(bestMove);
  };

  const drawWinningLine = (ctx, squares) => {
    const winnerInfo = calculateWinner(squares);
    if (winnerInfo) {
      const { line } = winnerInfo;
      ctx.beginPath();
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 4;

      // Draw a line through the winning squares
      ctx.moveTo((line[0] % 3) * 100 + 50, Math.floor(line[0] / 3) * 100 + 50);
      ctx.lineTo((line[2] % 3) * 100 + 50, Math.floor(line[2] / 3) * 100 + 50);

      ctx.stroke();
    }
  };

  // Function to highlight the winning combination
  const highlightWin = (ctx, line) => {
    line.forEach(index => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = col * 100;
      const y = row * 100;

      ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
      ctx.fillRect(x, y, 100, 100);
    });
  };

  const clearCanvas = (ctx) => {
    ctx.clearRect(0, 0, 300, 300); // Adjust the size if your canvas size is different
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (board.every(cell => cell === null)) {
      clearCanvas(ctx);
    }
    drawBoard(ctx);
    drawMoves(ctx, board);
    drawWinningLine(ctx, board);
    const winnerInfo = calculateWinner(board);
    if (winnerInfo) {
      highlightWin(ctx, winnerInfo.line);
    } else if (isFull(board)) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, 300, 300);
    }
  }, [board]);

  // Event listener to handle player moves
  const handleCanvasClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / 100);
    const row = Math.floor(y / 100);
    const index = row * 3 + col;
    onSquareClick(index);
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        onClick={handleCanvasClick}
        style={{ border: '1px solid black' }}
      />
    </div>
  );
};

export default Canvas;