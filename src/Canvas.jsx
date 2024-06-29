import React, { useRef, useEffect } from 'react';

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
        return { winner: squares[a], line: [a, b, c] };
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
        return { winner: squares[a], line: [a, b, c, d] };
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
        return { winner: squares[a], line: [a, b, c, d, e] };
      }
    }
  }
  return null;
}

const Canvas = ({ board, boardSize, onSquareClick }) => {
  const canvasRef = useRef(null);
  const cellSize = 300 / boardSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    clearCanvas(ctx);
    drawBoard(ctx);
    
    drawMoves(ctx, board);
    drawWinningLine(ctx, board);
    
    const winnerInfo = calculateWinner(board);
    if (winnerInfo) {
      highlightWin(ctx, winnerInfo.line);
    } else if (isFull(board)) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [board]);

  const clearCanvas = (ctx) => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const drawBoard = (ctx) => {
    ctx.beginPath();
    ctx.translate(0.5, 0.5);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';

    for (let i = 1; i < boardSize; i++) {
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(300, i * cellSize);
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, 300);
    }

    ctx.stroke();
    ctx.translate(-0.5, -0.5);
    console.log(board, boardSize, board.length);
  };

  // Function to draw X and O
  const drawX = (ctx, x, y) => {
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    const padding = cellSize * 0.1;
    ctx.moveTo(x + padding, y + padding);
    ctx.lineTo(x + cellSize - padding, y + cellSize - padding);
    ctx.moveTo(x + cellSize - padding, y + padding);
    ctx.lineTo(x + padding, y + cellSize - padding);

    ctx.stroke();
  }

  const drawO = (ctx, x, y) => {
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    const centerX = x + cellSize / 2;
    const centerY = y + cellSize / 2;
    const radius = (cellSize / 2) * 0.8;
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    
    ctx.stroke();
  }

  const drawMoves = (ctx, board) => {
    board.forEach((cell, index) => {
      const row = Math.floor(index / boardSize);
      const col = index % boardSize;
      const x = col * cellSize;
      const y = row * cellSize;
      
      if (cell === 'X') {
        drawX(ctx, x, y);
      } else if (cell === 'O') {
        drawO(ctx, x, y);
      }
    });
  }

  // Function to check if the board is full considering every boardSize
  const isFull = (board) => {
    return board && Array.isArray(board) && board.every(cell => cell !== null);
  }

  const drawWinningLine = (ctx, squares) => {
    const winnerInfo = calculateWinner(squares);
    const boardSize = Math.sqrt(squares.length);
    
    if (winnerInfo) {
      const { line } = winnerInfo;
      ctx.beginPath();
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 4;

      // Draw a line through the winning squares
      if (boardSize === 3) {
        // Draw for 3x3 board
        ctx.moveTo((line[0] % 3) * 100 + 50, Math.floor(line[0] / 3) * 100 + 50);
        ctx.lineTo((line[2] % 3) * 100 + 50, Math.floor(line[2] / 3) * 100 + 50);
      } else if (boardSize === 4) {
        // Draw for 4x4 board
        ctx.moveTo((line[0] % 4) * 75 + 37.5, Math.floor(line[0] / 4) * 75 + 37.5);
        ctx.lineTo((line[3] % 4) * 75 + 37.5, Math.floor(line[3] / 4) * 75 + 37.5);
      } else if (boardSize === 5) {
        // Draw for 5x5 board
        ctx.moveTo((line[0] % 5) * 60 + 30, Math.floor(line[0] / 5) * 60 + 30);
        ctx.lineTo((line[4] % 5) * 60 + 30, Math.floor(line[4] / 5) * 60 + 30);
      }
      
      ctx.stroke();
    }
  };

  const highlightWin = (ctx, line) => {
    line.forEach(index => {
      ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';

      const col = index % boardSize;
      const row = Math.floor(index / boardSize);

      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    });
  };

  const handleCanvasClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    const index = row * boardSize + col;
    console.log(index);
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