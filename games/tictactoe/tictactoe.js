// Tic-Tac-Toe Game
GameUtils.applyTheme();

const board = document.getElementById('board');
const currentPlayerElement = document.getElementById('currentPlayer');
const winsElement = document.getElementById('wins');
const gameModeElement = document.getElementById('gameMode');
const resetBtn = document.getElementById('resetBtn');
const modeBtn = document.getElementById('modeBtn');
const gameMessage = document.getElementById('gameMessage');

let cells = [];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'ai'; // 'ai' or 'twoPlayer'
let wins = parseInt(localStorage.getItem('tictactoe_highscore')) || 0;

winsElement.textContent = wins;

// Initialize board
function initBoard() {
    board.innerHTML = '';
    cells = [];
    currentPlayer = 'X';
    gameActive = true;
    gameMessage.textContent = '';
    currentPlayerElement.textContent = currentPlayer;
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleCellClick(i));
        board.appendChild(cell);
        cells.push('');
    }
}

function handleCellClick(index) {
    if (!gameActive || cells[index] !== '') return;
    
    cells[index] = currentPlayer;
    updateCell(index);
    
    if (checkWinner()) {
        gameActive = false;
        if (currentPlayer === 'X') {
            wins++;
            winsElement.textContent = wins;
            GameUtils.saveHighScore('tictactoe', wins);
            gameMessage.textContent = `Player X Wins! 🎉`;
            gameMessage.className = 'game-message winner';
        } else {
            gameMessage.textContent = `Player O Wins! 🎉`;
            gameMessage.className = 'game-message winner';
        }
        GameUtils.playSound(523, 0.3);
        return;
    }
    
    if (checkDraw()) {
        gameActive = false;
        gameMessage.textContent = `It's a Draw! 🤝`;
        gameMessage.className = 'game-message draw';
        GameUtils.playSound(300, 0.2);
        return;
    }
    
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    currentPlayerElement.textContent = currentPlayer;
    GameUtils.playSound(440, 0.1);
    
    // AI move
    if (gameMode === 'ai' && currentPlayer === 'O' && gameActive) {
        setTimeout(() => {
            makeAIMove();
        }, 500);
    }
}

function updateCell(index) {
    const cell = board.children[index];
    cell.textContent = cells[index];
    cell.classList.add(cells[index].toLowerCase());
    cell.classList.add('disabled');
}

function checkWinner() {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];
    
    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
            // Highlight winning cells
            condition.forEach(idx => {
                board.children[idx].style.background = 'var(--primary-color)';
                board.children[idx].style.opacity = '0.8';
            });
            return true;
        }
    }
    return false;
}

function checkDraw() {
    return cells.every(cell => cell !== '');
}

function makeAIMove() {
    // Try to win
    for (let i = 0; i < 9; i++) {
        if (cells[i] === '') {
            cells[i] = 'O';
            if (checkWinner()) {
                updateCell(i);
                gameActive = false;
                gameMessage.textContent = `AI Wins! 🤖`;
                gameMessage.className = 'game-message';
                GameUtils.playSound(200, 0.3);
                return;
            }
            cells[i] = '';
        }
    }
    
    // Try to block
    for (let i = 0; i < 9; i++) {
        if (cells[i] === '') {
            cells[i] = 'X';
            if (checkWinner()) {
                cells[i] = 'O';
                updateCell(i);
                currentPlayer = 'X';
                currentPlayerElement.textContent = currentPlayer;
                GameUtils.playSound(440, 0.1);
                return;
            }
            cells[i] = '';
        }
    }
    
    // Take center if available
    if (cells[4] === '') {
        cells[4] = 'O';
        updateCell(4);
        currentPlayer = 'X';
        currentPlayerElement.textContent = currentPlayer;
        GameUtils.playSound(440, 0.1);
        return;
    }
    
    // Take corner if available
    const corners = [0, 2, 6, 8];
    for (let corner of corners) {
        if (cells[corner] === '') {
            cells[corner] = 'O';
            updateCell(corner);
            currentPlayer = 'X';
            currentPlayerElement.textContent = currentPlayer;
            GameUtils.playSound(440, 0.1);
            return;
        }
    }
    
    // Take any available
    for (let i = 0; i < 9; i++) {
        if (cells[i] === '') {
            cells[i] = 'O';
            updateCell(i);
            currentPlayer = 'X';
            currentPlayerElement.textContent = currentPlayer;
            GameUtils.playSound(440, 0.1);
            return;
        }
    }
}

resetBtn.addEventListener('click', () => {
    initBoard();
});

modeBtn.addEventListener('click', () => {
    gameMode = gameMode === 'ai' ? 'twoPlayer' : 'ai';
    gameModeElement.textContent = gameMode === 'ai' ? 'Player vs AI' : '2 Players';
    modeBtn.textContent = gameMode === 'ai' ? 'Switch to 2 Players' : 'Switch to AI';
    initBoard();
});

// Initialize
initBoard();

