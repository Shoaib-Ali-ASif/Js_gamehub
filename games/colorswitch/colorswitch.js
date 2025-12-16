// Color Switch Game
GameUtils.applyTheme();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const startScreen = document.getElementById('startScreen');

// Game variables
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
let ball = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    radius: 20,
    colorIndex: 0,
    velocity: 0,
    gravity: 0.3
};

let obstacles = [];
let score = 0;
let level = 1;
let gameRunning = false;
let gameLoop;
let obstacleTimer = 0;

// Load high score
const highScore = parseInt(localStorage.getItem('colorswitch_highscore')) || 0;
highScoreElement.textContent = highScore;

function createObstacle() {
    const types = ['circle', 'square', 'triangle'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colorIndex = Math.floor(Math.random() * colors.length);
    
    obstacles.push({
        y: -50,
        type,
        colorIndex,
        passed: false
    });
}

function drawBall() {
    ctx.fillStyle = colors[ball.colorIndex];
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawObstacle(obstacle) {
    ctx.fillStyle = colors[obstacle.colorIndex];
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    
    const centerX = canvas.width / 2;
    const size = 80;
    
    switch(obstacle.type) {
        case 'circle':
            ctx.beginPath();
            ctx.arc(centerX, obstacle.y, size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Add opening
            ctx.fillStyle = '#667eea';
            ctx.beginPath();
            ctx.arc(centerX, obstacle.y, size / 3, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'square':
            ctx.fillRect(centerX - size / 2, obstacle.y - size / 2, size, size);
            ctx.strokeRect(centerX - size / 2, obstacle.y - size / 2, size, size);
            // Add opening
            ctx.fillStyle = '#667eea';
            ctx.fillRect(centerX - size / 3, obstacle.y - size / 3, size * 2 / 3, size * 2 / 3);
            break;
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(centerX, obstacle.y - size / 2);
            ctx.lineTo(centerX - size / 2, obstacle.y + size / 2);
            ctx.lineTo(centerX + size / 2, obstacle.y + size / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
    }
}

function updateBall() {
    ball.velocity += ball.gravity;
    ball.y += ball.velocity;
    
    // Check boundaries
    if (ball.y + ball.radius > canvas.height) {
        gameOver();
    }
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.velocity = 0;
    }
}

function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.y += 3 + (level * 0.5);
        
        // Check collision
        const centerX = canvas.width / 2;
        const dx = ball.x - centerX;
        const dy = ball.y - obstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (Math.abs(dy) < 50 && distance < 50) {
            if (ball.colorIndex !== obstacle.colorIndex) {
                gameOver();
            }
        }
        
        // Score point
        if (!obstacle.passed && obstacle.y > ball.y + 50) {
            obstacle.passed = true;
            score++;
            level = Math.floor(score / 10) + 1;
            scoreElement.textContent = score;
            levelElement.textContent = level;
            GameUtils.playSound(523, 0.1);
        }
        
        // Remove off-screen
        if (obstacle.y > canvas.height + 100) {
            obstacles.splice(index, 1);
        }
    });
    
    // Create new obstacle
    obstacleTimer++;
    if (obstacleTimer > 60 - (level * 2)) {
        createObstacle();
        obstacleTimer = 0;
    }
}

function switchColor() {
    ball.colorIndex = (ball.colorIndex + 1) % colors.length;
    ball.velocity = -8;
    GameUtils.playSound(440, 0.1);
}

function draw() {
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    obstacles.forEach(drawObstacle);
    drawBall();
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    startBtn.disabled = false;
    startScreen.classList.remove('hidden');
    
    if (score > highScore) {
        GameUtils.saveHighScore('colorswitch', score);
        highScoreElement.textContent = score;
        GameUtils.playSound(523, 0.3);
        alert(`Game Over! New High Score: ${score}`);
    } else {
        GameUtils.playSound(200, 0.3);
        alert(`Game Over! Score: ${score}`);
    }
}

function gameStep() {
    updateBall();
    updateObstacles();
    draw();
}

function startGame() {
    gameRunning = true;
    startBtn.disabled = true;
    startScreen.classList.add('hidden');
    
    ball.y = canvas.height - 100;
    ball.velocity = 0;
    ball.colorIndex = 0;
    obstacles = [];
    score = 0;
    level = 1;
    obstacleTimer = 0;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    
    gameLoop = setInterval(gameStep, 16);
}

startBtn.addEventListener('click', startGame);

resetBtn.addEventListener('click', () => {
    if (gameRunning) {
        clearInterval(gameLoop);
        gameRunning = false;
    }
    startBtn.disabled = false;
    startScreen.classList.remove('hidden');
    ball.y = canvas.height - 100;
    ball.velocity = 0;
    ball.colorIndex = 0;
    obstacles = [];
    score = 0;
    level = 1;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    draw();
});

canvas.addEventListener('click', () => {
    if (gameRunning) {
        switchColor();
    } else {
        startGame();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameRunning) {
            switchColor();
        } else {
            startGame();
        }
    }
});

// Initial draw
draw();

