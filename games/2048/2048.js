// 2048 Game
GameUtils.applyTheme();

const board = document.getElementById('board');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const bestTileElement = document.getElementById('bestTile');
const gameMessage = document.getElementById('gameMessage');
const newGameBtn = document.getElementById('newGameBtn');
const resetBtn = document.getElementById('resetBtn');

// Game variables
const size = 4;
let grid = [];
let score = 0;
let bestTile = 2;
let touchStartX = 0;
let touchStartY = 0;

// Load high score
let highScore = parseInt(localStorage.getItem('2048_highscore')) || 0;
highScoreElement.textContent = highScore;

function initBoard() {
    grid = [];
    for (let r = 0; r < size; r++) {
        grid[r] = [];
        for (let c = 0; c < size; c++) {
            grid[r][c] = 0;
        }
    }
    addRandomTile();
    addRandomTile();
    updateDisplay();
}

function addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (grid[r][c] === 0) {
                emptyCells.push({ r, c });
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    }
}

function updateDisplay() {
    board.innerHTML = '';
    let currentBestTile = 2;
    
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const tile = document.createElement('div');
            const value = grid[r][c];
            tile.className = `tile-2048 ${value > 0 ? `number-${value}` : ''}`;
            tile.textContent = value > 0 ? value : '';
            board.appendChild(tile);
            
            if (value > currentBestTile) {
                currentBestTile = value;
            }
        }
    }
    
    bestTile = Math.max(bestTile, currentBestTile);
    bestTileElement.textContent = bestTile;
    
    // Check win condition
    if (bestTile >= 2048 && !gameMessage.textContent.includes('Win')) {
        gameMessage.textContent = 'You Win! 🎉';
        gameMessage.className = 'game-message-2048 win';
        GameUtils.playSound(523, 0.5);
    }
    
    // Check game over (only if board is full)
    let hasEmpty = false;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (grid[r][c] === 0) {
                hasEmpty = true;
                break;
            }
        }
        if (hasEmpty) break;
    }
    
    if (!hasEmpty && !canMove()) {
        gameMessage.textContent = 'Game Over! 😢';
        gameMessage.className = 'game-message-2048 game-over';
        GameUtils.playSound(200, 0.3);
    } else if (gameMessage.textContent === 'Game Over! 😢') {
        // Clear game over message if game is playable again
        gameMessage.textContent = '';
        gameMessage.className = 'game-message-2048';
    }
}

function moveLeft() {
    let moved = false;
    for (let r = 0; r < size; r++) {
        const row = grid[r].filter(val => val !== 0);
        for (let i = 0; i < row.length - 1; i++) {
            if (row[i] === row[i + 1]) {
                row[i] *= 2;
                score += row[i];
                row[i + 1] = 0;
                moved = true;
            }
        }
        const newRow = row.filter(val => val !== 0);
        while (newRow.length < size) {
            newRow.push(0);
        }
        if (JSON.stringify(grid[r]) !== JSON.stringify(newRow)) {
            moved = true;
        }
        grid[r] = newRow;
    }
    return moved;
}

function moveRight() {
    let moved = false;
    for (let r = 0; r < size; r++) {
        const row = grid[r].filter(val => val !== 0);
        for (let i = row.length - 1; i > 0; i--) {
            if (row[i] === row[i - 1]) {
                row[i] *= 2;
                score += row[i];
                row[i - 1] = 0;
                moved = true;
            }
        }
        const newRow = row.filter(val => val !== 0);
        while (newRow.length < size) {
            newRow.unshift(0);
        }
        if (JSON.stringify(grid[r]) !== JSON.stringify(newRow)) {
            moved = true;
        }
        grid[r] = newRow;
    }
    return moved;
}

function moveUp() {
    let moved = false;
    for (let c = 0; c < size; c++) {
        const column = [];
        for (let r = 0; r < size; r++) {
            if (grid[r][c] !== 0) {
                column.push(grid[r][c]);
            }
        }
        for (let i = 0; i < column.length - 1; i++) {
            if (column[i] === column[i + 1]) {
                column[i] *= 2;
                score += column[i];
                column[i + 1] = 0;
                moved = true;
            }
        }
        const newColumn = column.filter(val => val !== 0);
        while (newColumn.length < size) {
            newColumn.push(0);
        }
        for (let r = 0; r < size; r++) {
            if (grid[r][c] !== newColumn[r]) {
                moved = true;
            }
            grid[r][c] = newColumn[r];
        }
    }
    return moved;
}

function moveDown() {
    let moved = false;
    for (let c = 0; c < size; c++) {
        const column = [];
        for (let r = 0; r < size; r++) {
            if (grid[r][c] !== 0) {
                column.push(grid[r][c]);
            }
        }
        for (let i = column.length - 1; i > 0; i--) {
            if (column[i] === column[i - 1]) {
                column[i] *= 2;
                score += column[i];
                column[i - 1] = 0;
                moved = true;
            }
        }
        const newColumn = column.filter(val => val !== 0);
        while (newColumn.length < size) {
            newColumn.unshift(0);
        }
        for (let r = 0; r < size; r++) {
            if (grid[r][c] !== newColumn[r]) {
                moved = true;
            }
            grid[r][c] = newColumn[r];
        }
    }
    return moved;
}

function canMove() {
    // Check for empty cells
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (grid[r][c] === 0) return true;
        }
    }
    
    // Check for possible merges
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const current = grid[r][c];
            if ((r < size - 1 && grid[r + 1][c] === current) ||
                (c < size - 1 && grid[r][c + 1] === current)) {
                return true;
            }
        }
    }
    
    return false;
}

function handleMove(direction) {
    let moved = false;
    
    switch (direction) {
        case 'left':
            moved = moveLeft();
            break;
        case 'right':
            moved = moveRight();
            break;
        case 'up':
            moved = moveUp();
            break;
        case 'down':
            moved = moveDown();
            break;
    }
    
    if (moved) {
        addRandomTile();
        scoreElement.textContent = score;
        
        if (score > highScore) {
            highScore = score;
            GameUtils.saveHighScore('2048', score);
            highScoreElement.textContent = score;
        }
        
        GameUtils.playSound(440, 0.1);
        updateDisplay();
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleMove('left');
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleMove('right');
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleMove('up');
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleMove('down');
    }
});

// Touch controls
board.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

board.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
            handleMove('left');
        } else {
            handleMove('right');
        }
    } else {
        if (diffY > 0) {
            handleMove('up');
        } else {
            handleMove('down');
        }
    }
    
    touchStartX = 0;
    touchStartY = 0;
});

newGameBtn.addEventListener('click', () => {
    score = 0;
    bestTile = 2;
    scoreElement.textContent = score;
    bestTileElement.textContent = bestTile;
    gameMessage.textContent = '';
    gameMessage.className = 'game-message-2048';
    initBoard();
});

resetBtn.addEventListener('click', () => {
    score = 0;
    bestTile = 2;
    scoreElement.textContent = score;
    bestTileElement.textContent = bestTile;
    gameMessage.textContent = '';
    gameMessage.className = 'game-message-2048';
    initBoard();
});

// Initialize
initBoard();

