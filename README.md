# React Tic Tac Toe with Socket.IO
<img src="public/game.jpeg" />

Welcome to my React Society!

This project is a modern take on the classic game Tic Tac Toe, featuring a real gameplay experience with AI powered by Socket.IO and a sleek canvas-based UI.

## Getting Started

Replit is an online IDE that allows you to run and edit code from a browser. Here's how you can get this project up and running on Replit:

**Step 1: Create a Replit Account**

<img src="public/Create_account.jpg" width="300" height="300" style="float:left" />

If you don't already have a Replit account, go to Replit.com and sign up for a free account.

**Step 2: Start a New Repl**

<img src="public/Create_repl.jpg" width="300" height="200" style="float:left" />

- Once logged in, click the **"+"** button or go to the **Repls** tab and click **"New Repl"**.

<img src="public/Import.jpg" width="300" height="250" style="float:left" />

- Choose **"Import from GitHub"**.

<img src="public/Github.jpg" width="300" height="300" style="float:left" />

- Paste the URL of this GitHub repository: `https://github.com/playscrbot/Tic-Tac-Toe`
- Click **"Import from GitHub"** again to create your Repl.

**Step 3: Wait for few secs and click Run Button**

<img src="public/Run.jpg" />

- Once the import is complete, click on the **"Run"** button at the top of the page to start the application.

**Step 4: Playing the Game**

<img src="public/Gameplay.gif" width="100%" height="100%" />

- After clicking **"Run"**, Replit will start the server and the React application should compile.
- A new window labeled **"Webview"** will appear showing your live game.
- Click on the **"Symbol"** next to replit dev url to play the game in full screen.

Enjoy the game!

**Support:**
If you encounter any issues or have questions about running the project, feel free to raise an issue in the GitHub repository or reach out to the community on Replit.


### Install dependencies
Clone the repository and install the dependencies:

```bash
git clone https://your-repository-url.git
cd your-repository-name
npm install react, socket.io, socket.io-client
```

Start the server
```bash
node backend/index.cjs
```

Run the React App
```bash
npm run dev
```


## Features
  - **Server connection**: Enhance your online gameplay to the next level using Socket.io.
  - **AI Opponent**: Sharpen your skills against a challenging AI.
  - **Stylish Canvas UI**: Enjoy a visually appealing game board.
  - **Learn React**: This is a basic yet perfect chance to start learning react game development.

# Backend Setup
The backend is built with Express and Socket.IO to handle real-time player login and logout.

```bash
// backend/index.cjs
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// ...rest of the backend code
```

# Frontend Components
## App Component
The App component initializes the game and displays a loading spinner before rendering the TicTacToe component.

```bash
// App.jsx
import React, { useState } from 'react';
import { ClipLoader } from 'react-spinners';
import TicTacToe from './TicTacToe';

// ...rest of the App component
```

## Canvas Component
The Canvas component is responsible for drawing the game board and handling user interactions.

```bash
// Canvas.jsx
import React, { useRef, useEffect } from 'react';

// ...rest of the Canvas component
```

## TicTacToe Component
The TicTacToe component manages the game state and communicates with the backend server.

```bash
// TicTacToe.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Canvas from './Canvas';

// ...rest of the TicTacToe component
```

Certainly! Here's a more straightforward and genuine explanation of the minimax algorithm for your README file, formatted in markdown:

---


## Minimax Algorithm Explained

```javascript
const minimax = (board, depth, isMaximizingPlayer) => {
  // rest of the code
};
```

### What is Minimax?

Minimax is a decision-making algorithm used in game theory and artificial intelligence to determine the optimal move for a player, assuming that the opponent is also playing optimally. It's particularly well-suited for turn-based games like Tic-Tac-Toe.

### How Does it Work?

The algorithm simulates all possible moves in the game, creating a game tree of choices. It then evaluates the final positions at the leaves of this tree using a scoring system:

**Game States and Moves:** 
- The algorithm starts with the current state of the game board.
- Each possible move by a player creates a new game state, leading to a tree of game states.
- There are two types of players in the algorithm: the maximizer (AI) and the minimizer (human).

**Terminal States:**
- Terminal states are the end points of the game tree, where the game has been won, lost, or drawn.

**Scoring System:**
Each terminal state is assigned a score:
- **+10** for AI (maximizing player) win
- **-10** for Human (minimizing player) win
- **0** for a tie

**Maximizing and Minimizing:**
- There are two types of players in the algorithm: the maximizer (AI) and the minimizer (human).
- The maximizer tries to get the highest score possible, while the minimizer tries to get the lowest score possible.

**Evaluating Moves:**
- For each move, the algorithm asks, “What would happen if the opponent plays optimally from here?”
- It assumes that the opponent will also use the minimax strategy, leading to the best possible countermove.

**Backtracking and Score Propagation:**
- After reaching a terminal state, the algorithm backtracks, updating the scores of the parent states.
- The scores propagate up the tree, with each state getting the score of the best move available to it.

**Decision Making:**
- Once all scores are propagated to the initial state, the algorithm decides on the move with the best score.

**Depth and Computation:**

-**Depth Parameter**: Limits the lookahead depth to manage computational load.

-**Horizon Effect**: Without depth limitation, the algorithm would evaluate all possible game outcomes, which is impractical for complex games.

The algorithm is implemented with a recursive function that takes the current board state, the depth, and a boolean indicating if it’s the maximizer’s turn.

### Why Use Minimax?

Minimax is perfect for games like Tic-Tac-Toe because it's complete and optimal; it guarantees the best possible outcome for a player, given an opponent who also plays perfectly.


## Config files
  - **vite.config.js**: Configures Vite for the React app.
  - **tsconfig.json**: Sets up TypeScript options for the project.

### Assets
Use Microsoft Copilot to create and upload your own assets to avoid copyright issues ©️

## Contributions
Contributions are welcome! Please feel free to submit a pull request or create an issue if you have any ideas or find any bugs.

## License
This project is open-sourced under the MIT license. See the LICENSE file for details.

### Made for Individuals who want to start JavaScript game development.

Have fun playing with AI 😁🌈
