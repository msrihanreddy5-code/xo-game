const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const modeSelect = document.getElementById("mode");
const difficultySelect = document.getElementById("difficulty");
const diffLabel = document.getElementById("diffLabel");

let currentPlayer = "X";
let board = ["", "", "", "", "", "", "", "", ""];
let running = false;
let mode = "pvp";
let difficulty = "easy";

const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

startGame();

function startGame() {
  cells.forEach(cell => cell.addEventListener("click", cellClicked));
  restartBtn.addEventListener("click", restartGame);
  modeSelect.addEventListener("change", changeMode);
  difficultySelect.addEventListener("change", changeDifficulty);
  statusText.textContent = `Player ${currentPlayer}'s Turn`;
  running = true;
}

function changeMode() {
  mode = modeSelect.value;
  if (mode === "ai") {
    difficultySelect.style.display = "inline";
    diffLabel.style.display = "inline";
  } else {
    difficultySelect.style.display = "none";
    diffLabel.style.display = "none";
  }
  restartGame();
}

function changeDifficulty() {
  difficulty = difficultySelect.value;
  restartGame();
}

function cellClicked() {
  const index = this.getAttribute("data-index");

  if (board[index] !== "" || !running) return;

  updateCell(this, index);
  checkWinner();

  if (mode === "ai" && running && currentPlayer === "O") {
    setTimeout(aiMove, 400); 
  }
}

function updateCell(cell, index) {
  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
}

function changePlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s Turn`;
}

function checkWinner() {
  let winnerFound = false;

  for (let i = 0; i < winPatterns.length; i++) {
    const [a, b, c] = winPatterns[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      winnerFound = true;
      highlightWin([a, b, c]);
      break;
    }
  }

  if (winnerFound) {
    statusText.textContent = `Player ${currentPlayer} Wins! 🎉`;
    running = false;
  } else if (!board.includes("")) {
    statusText.textContent = `It's a Draw! 😐`;
    running = false;
  } else {
    changePlayer();
  }
}

function highlightWin(indices) {
  indices.forEach(i => cells[i].classList.add("win"));
}

function restartGame() {
  currentPlayer = "X";
  board = ["", "", "", "", "", "", "", "", ""];
  running = true;
  statusText.textContent = `Player ${currentPlayer}'s Turn`;
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("win");
  });
}

function aiMove() {
  let move;

  if (difficulty === "easy") {
    move = getRandomMove();
  } else {
    move = getBestMove();
  }

  const cell = cells[move];
  updateCell(cell, move);
  checkWinner();
}

function getRandomMove() {
  const emptyCells = board.map((v, i) => (v === "" ? i : null)).filter(v => v !== null);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function getBestMove() {
  return minimax(board, "O").index;
}

function minimax(newBoard, player) {
  const availSpots = newBoard.map((v, i) => (v === "" ? i : null)).filter(v => v !== null);

  const winner = checkWinnerMini(newBoard);
  if (winner === "X") return { score: -10 };
  if (winner === "O") return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    if (player === "O") {
      const result = minimax(newBoard, "X");
      move.score = result.score;
    } else {
      const result = minimax(newBoard, "O");
      move.score = result.score;
    }

    newBoard[availSpots[i]] = "";
    moves.push(move);
  }

  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    for (const m of moves) {
      if (m.score > bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
  } else {
    let bestScore = Infinity;
    for (const m of moves) {
      if (m.score < bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
  }

  return bestMove;
}

function checkWinnerMini(bd) {
  for (const [a, b, c] of winPatterns) {
    if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) return bd[a];
  }
  return null;
}
