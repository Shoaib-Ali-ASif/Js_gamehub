// Sliding Puzzle Game
GameUtils.applyTheme();

const board = document.getElementById('board');
const movesElement = document.getElementById('moves');
const timeElement = document.getElementById('time');
const bestTimeElement = document.getElementById('bestTime');
const newGameBtn = document.getElementById('newGameBtn');
const shuffleBtn = document.getElementById('shuffleBtn');

// Game variables
const size = 4;
let grid = [];
let emptyPos = { row: 3, col: 3 };
let moves = 0;
let startTime = null;
let timerInterval = null;
let gameStarted = false;

// Load best time
const bestTime = parseInt(localStorage.getItem('sliding_highscore'));
if (bestTime) {
    bestTimeElement.textContent = formatTime(bestTime);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function initBoard() {
    grid = [];
    let num = 1;
    for (let r = 0; r < size; r++) {
        grid[r] = [];
        for (let c = 0; c < size; c++) {
            if (r === size - 1 && c === size - 1) {
                grid[r][c] = 0; // Empty space
            } else {
                grid[r][c] = num++;
            }
        }
    }
    emptyPos = { row: size - 1, col: size - 1 };
    moves = 0;
    movesElement.textContent = moves;
    timeElement.textContent = '00:00';
    gameStarted = false;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    updateDisplay();
}

function shuffleBoard() {
    // Perform random valid moves
    for (let i = 0; i < 1000; i++) {
        const directions = [
            { row: -1, col: 0 }, // up
            { row: 1, col: 0 },  // down
            { row: 0, col: -1 }, // left
            { row: 0, col: 1 }   // right
        ];
        const validDirs = directions.filter(dir => {
            const newRow = emptyPos.row + dir.row;
            const newCol = emptyPos.col + dir.col;
            return newRow >= 0 && newRow < size && newCol >= 0 && newCol < size;
        });
        if (validDirs.length > 0) {
            const dir = validDirs[Math.floor(Math.random() * validDirs.length)];
            moveTile(emptyPos.row + dir.row, emptyPos.col + dir.col, false);
        }
    }
    moves = 0;
    movesElement.textContent = moves;
    gameStarted = false;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    startTime = null;
    timeElement.textContent = '00:00';
}

function moveTile(row, col, countMove = true) {
    // Check if tile is adjacent to empty space
    const rowDiff = Math.abs(row - emptyPos.row);
    const colDiff = Math.abs(col - emptyPos.col);
    
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        // Swap
        grid[emptyPos.row][emptyPos.col] = grid[row][col];
        grid[row][col] = 0;
        emptyPos = { row, col };
        
        if (countMove) {
            moves++;
            movesElement.textContent = moves;
            
            if (!gameStarted) {
                gameStarted = true;
                startTime = Date.now();
                timerInterval = setInterval(updateTimer, 1000);
            }
            
            GameUtils.playSound(440, 0.1);
        }
        
        updateDisplay();
        checkWin();
    }
}

function updateDisplay() {
    board.innerHTML = '';
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const tile = document.createElement('div');
            tile.className = 'sliding-tile';
            if (grid[r][c] === 0) {
                tile.classList.add('empty');
            } else {
                tile.textContent = grid[r][c];
                tile.addEventListener('click', () => moveTile(r, c));
            }
            board.appendChild(tile);
        }
    }
}

function checkWin() {
    let num = 1;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (r === size - 1 && c === size - 1) {
                if (grid[r][c] !== 0) return;
            } else {
                if (grid[r][c] !== num++) return;
            }
        }
    }
    
    // Win!
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    
    if (GameUtils.saveBestTime('sliding', elapsed)) {
        bestTimeElement.textContent = formatTime(elapsed);
        alert(`Congratulations! New Best Time: ${formatTime(elapsed)}`);
    } else {
        alert(`Congratulations! Time: ${formatTime(elapsed)}`);
    }
    GameUtils.playSound(523, 0.5);
}

function updateTimer() {
    if (!startTime) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeElement.textContent = formatTime(elapsed);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    const { row, col } = emptyPos;
    if (e.key === 'ArrowUp' && row < size - 1) {
        moveTile(row + 1, col);
    } else if (e.key === 'ArrowDown' && row > 0) {
        moveTile(row - 1, col);
    } else if (e.key === 'ArrowLeft' && col < size - 1) {
        moveTile(row, col + 1);
    } else if (e.key === 'ArrowRight' && col > 0) {
        moveTile(row, col - 1);
    }
});

newGameBtn.addEventListener('click', () => {
    initBoard();
    shuffleBoard();
});

shuffleBtn.addEventListener('click', () => {
    shuffleBoard();
});

// Initialize
initBoard();
shuffleBoard();

