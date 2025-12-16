// Minesweeper Game
GameUtils.applyTheme();

const board = document.getElementById('board');
const minesLeftElement = document.getElementById('minesLeft');
const timeElement = document.getElementById('time');
const bestTimeElement = document.getElementById('bestTime');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const minesSelect = document.getElementById('minesSelect');

// Game variables
const rows = 10;
const cols = 10;
let totalMines = 10; // Made variable so it can be changed
let grid = [];
let revealed = [];
let flagged = [];
let gameStarted = false;
let gameOver = false;
let gameWon = false;
let startTime = null;
let timerInterval = null;
let minesLeft = totalMines;

// Initialize totalMines from selector if it exists
if (minesSelect) {
    totalMines = parseInt(minesSelect.value) || 10;
    minesLeft = totalMines;
}

// Load best time
const bestTime = parseInt(localStorage.getItem('minesweeper_highscore'));
if (bestTime) {
    bestTimeElement.textContent = formatTime(bestTime);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function initBoard() {
    board.innerHTML = '';
    grid = [];
    revealed = [];
    flagged = [];
    gameStarted = false;
    gameOver = false;
    gameWon = false;
    
    // Update totalMines from selector if it exists
    if (minesSelect) {
        totalMines = parseInt(minesSelect.value) || 10;
    }
    
    minesLeft = totalMines;
    minesLeftElement.textContent = minesLeft;
    timeElement.textContent = '00:00';
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Initialize grid
    for (let r = 0; r < rows; r++) {
        grid[r] = [];
        revealed[r] = [];
        flagged[r] = [];
        for (let c = 0; c < cols; c++) {
            grid[r][c] = 0;
            revealed[r][c] = false;
            flagged[r][c] = false;
        }
    }
    
    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < totalMines) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        if (grid[r][c] !== -1) {
            grid[r][c] = -1; // -1 represents a mine
            minesPlaced++;
        }
    }
    
    // Calculate numbers
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] !== -1) {
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === -1) {
                            count++;
                        }
                    }
                }
                grid[r][c] = count;
            }
        }
    }
    
    // Create cells
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'mine-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            cell.addEventListener('click', (e) => {
                if (e.button === 0) revealCell(r, c);
            });
            
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlag(r, c);
            });
            
            board.appendChild(cell);
        }
    }
}

function revealCell(r, c) {
    if (gameOver || gameWon || revealed[r][c] || flagged[r][c]) return;
    
    if (!gameStarted) {
        gameStarted = true;
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
    }
    
    revealed[r][c] = true;
    const cell = board.children[r * cols + c];
    cell.classList.add('revealed');
    
    if (grid[r][c] === -1) {
        // Mine hit!
        cell.classList.add('mine');
        cell.textContent = '💣';
        endGame(false);
        GameUtils.playSound(200, 0.3);
        return;
    }
    
    if (grid[r][c] > 0) {
        cell.textContent = grid[r][c];
        cell.classList.add(`number-${grid[r][c]}`);
    } else {
        // Reveal adjacent cells
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !revealed[nr][nc]) {
                    revealCell(nr, nc);
                }
            }
        }
    }
    
    GameUtils.playSound(440, 0.1);
    checkWin();
}

function toggleFlag(r, c) {
    if (gameOver || gameWon || revealed[r][c]) return;
    
    flagged[r][c] = !flagged[r][c];
    const cell = board.children[r * cols + c];
    
    if (flagged[r][c]) {
        cell.classList.add('flagged');
        cell.textContent = '🚩';
        minesLeft--;
    } else {
        cell.classList.remove('flagged');
        cell.textContent = '';
        minesLeft++;
    }
    
    minesLeftElement.textContent = minesLeft;
    GameUtils.playSound(350, 0.1);
}

function checkWin() {
    let revealedCount = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (revealed[r][c]) revealedCount++;
        }
    }
    
    if (revealedCount === rows * cols - totalMines) {
        endGame(true);
    }
}

function endGame(won) {
    gameOver = true;
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    if (won) {
        gameWon = true;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        if (GameUtils.saveBestTime('minesweeper', elapsed)) {
            bestTimeElement.textContent = formatTime(elapsed);
            alert(`Congratulations! New Best Time: ${formatTime(elapsed)}`);
        } else {
            alert(`Congratulations! Time: ${formatTime(elapsed)}`);
        }
        GameUtils.playSound(523, 0.5);
    } else {
        // Reveal all mines
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === -1 && !revealed[r][c]) {
                    const cell = board.children[r * cols + c];
                    cell.classList.add('revealed', 'mine');
                    cell.textContent = '💣';
                }
            }
        }
    }
}

function updateTimer() {
    if (!startTime) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeElement.textContent = formatTime(elapsed);
}

startBtn.addEventListener('click', () => {
    initBoard();
});

resetBtn.addEventListener('click', () => {
    initBoard();
});

if (minesSelect) {
    minesSelect.addEventListener('change', (e) => {
        const newMineCount = parseInt(e.target.value);
        // Validate mine count (can't exceed 90% of grid)
        const maxMines = Math.floor(rows * cols * 0.9);
        if (newMineCount > 0 && newMineCount <= maxMines) {
            totalMines = newMineCount;
            // Always reset the board when difficulty changes
            initBoard();
        } else {
            // Reset to previous value if invalid
            e.target.value = totalMines;
            alert(`Invalid mine count. Maximum allowed: ${maxMines}`);
        }
    });
}

// Initialize
initBoard();
