// Snake Game
GameUtils.applyTheme();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// Game variables
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake = [{ x: 10, y: 10 }];
let dx = 0;
let dy = 0;
let food = {};
let score = 0;
let level = 1;
let gameRunning = false;
let gamePaused = false;
let gameLoop;

// Load high score
const highScore = parseInt(localStorage.getItem('snake_highscore')) || 0;
highScoreElement.textContent = highScore;

// Initialize game
function init() {
    generateFood();
    draw();
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Make sure food doesn't spawn on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#1a1e37';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Draw snake
    ctx.fillStyle = '#10b981';
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = '#34d399';
        } else {
            ctx.fillStyle = '#10b981';
        }
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
        
        // Add eyes to head
        if (index === 0) {
            ctx.fillStyle = '#ffffff';
            const eyeSize = 3;
            const offset = 5;
            if (dx === 1) { // Moving right
                ctx.fillRect(segment.x * gridSize + offset + 8, segment.y * gridSize + offset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + offset + 8, segment.y * gridSize + offset + 8, eyeSize, eyeSize);
            } else if (dx === -1) { // Moving left
                ctx.fillRect(segment.x * gridSize + offset, segment.y * gridSize + offset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + offset, segment.y * gridSize + offset + 8, eyeSize, eyeSize);
            } else if (dy === -1) { // Moving up
                ctx.fillRect(segment.x * gridSize + offset, segment.y * gridSize + offset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + offset + 8, segment.y * gridSize + offset, eyeSize, eyeSize);
            } else if (dy === 1) { // Moving down
                ctx.fillRect(segment.x * gridSize + offset, segment.y * gridSize + offset + 8, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + offset + 8, segment.y * gridSize + offset + 8, eyeSize, eyeSize);
            }
        }
    });
    
    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        2 * Math.PI
    );
    ctx.fill();
}

function moveSnake() {
    // Don't move if no direction is set
    if (dx === 0 && dy === 0) {
        return;
    }
    
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // Check self collision (skip if snake hasn't moved yet)
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        level = Math.floor(score / 100) + 1;
        scoreElement.textContent = score;
        levelElement.textContent = level;
        generateFood();
        GameUtils.playSound(440, 0.1);
    } else {
        snake.pop();
    }
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    // Check for high score
    if (score > highScore) {
        GameUtils.saveHighScore('snake', score);
        highScoreElement.textContent = score;
        GameUtils.playSound(523, 0.3);
        alert(`Game Over! New High Score: ${score}`);
    } else {
        GameUtils.playSound(200, 0.3);
        alert(`Game Over! Score: ${score}`);
    }
}

function gameStep() {
    if (!gamePaused) {
        moveSnake();
        draw();
    }
}

// Event listeners
startBtn.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
        // Reset game if needed
        if (snake.length === 1 && dx === 0 && dy === 0) {
            snake = [{ x: 10, y: 10 }];
            dx = 1; // Start moving right
            dy = 0;
            score = 0;
            level = 1;
            scoreElement.textContent = score;
            levelElement.textContent = level;
            generateFood();
        }
        
        const speed = Math.max(100, 200 - (level - 1) * 10);
        gameLoop = setInterval(gameStep, speed);
    }
});

pauseBtn.addEventListener('click', () => {
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
});

resetBtn.addEventListener('click', () => {
    gameRunning = false;
    gamePaused = false;
    clearInterval(gameLoop);
    snake = [{ x: 10, y: 10 }];
    dx = 0; // Reset to 0 so player must choose direction
    dy = 0;
    score = 0;
    level = 1;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    generateFood();
    draw();
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    const key = e.key.toLowerCase();
    
    // Prevent reverse direction
    if ((key === 'arrowup' || key === 'w') && dy !== 1) {
        dx = 0;
        dy = -1;
    } else if ((key === 'arrowdown' || key === 's') && dy !== -1) {
        dx = 0;
        dy = 1;
    } else if ((key === 'arrowleft' || key === 'a') && dx !== 1) {
        dx = -1;
        dy = 0;
    } else if ((key === 'arrowright' || key === 'd') && dx !== -1) {
        dx = 1;
        dy = 0;
    }
});

// Mobile controls
document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (!gameRunning) return;
        
        const direction = btn.getAttribute('data-direction');
        
        if (direction === 'up' && dy !== 1) {
            dx = 0;
            dy = -1;
        } else if (direction === 'down' && dy !== -1) {
            dx = 0;
            dy = 1;
        } else if (direction === 'left' && dx !== 1) {
            dx = -1;
            dy = 0;
        } else if (direction === 'right' && dx !== -1) {
            dx = 1;
            dy = 0;
        }
    });
});

// Initialize
init();

