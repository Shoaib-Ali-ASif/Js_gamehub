// Breakout Game
GameUtils.applyTheme();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const livesElement = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

// Game variables
const brickRows = 5;
const brickCols = 10;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 5;
const brickOffsetTop = 50;
const brickOffsetLeft = 35;

let paddle = {
    x: canvas.width / 2 - 75,
    y: canvas.height - 30,
    width: 150,
    height: 15,
    speed: 7
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: 10,
    dx: 4,
    dy: -4,
    speed: 4
};

let bricks = [];
let score = 0;
let lives = 3;
let gameRunning = false;
let gameLoop;

// Load high score
const highScore = parseInt(localStorage.getItem('breakout_highscore')) || 0;
highScoreElement.textContent = highScore;

function createBricks() {
    bricks = [];
    const colors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6'];
    
    for (let r = 0; r < brickRows; r++) {
        for (let c = 0; c < brickCols; c++) {
            bricks.push({
                x: c * (brickWidth + brickPadding) + brickOffsetLeft,
                y: r * (brickHeight + brickPadding) + brickOffsetTop,
                width: brickWidth,
                height: brickHeight,
                color: colors[r],
                visible: true
            });
        }
    }
}

function drawBricks() {
    bricks.forEach(brick => {
        if (brick.visible) {
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        }
    });
}

function drawPaddle() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(paddle.x + 5, paddle.y, paddle.width - 10, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawBricks();
    drawPaddle();
    drawBall();
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collisions
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
        GameUtils.playSound(440, 0.1);
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
        GameUtils.playSound(440, 0.1);
    }
    
    // Paddle collision
    if (ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width &&
        ball.dy > 0) {
        const hitPos = (ball.x - paddle.x) / paddle.width;
        ball.dx = (hitPos - 0.5) * 8;
        ball.dy = -Math.abs(ball.dy);
        GameUtils.playSound(523, 0.1);
    }
    
    // Brick collisions
    bricks.forEach(brick => {
        if (brick.visible) {
            if (ball.x > brick.x &&
                ball.x < brick.x + brick.width &&
                ball.y > brick.y &&
                ball.y < brick.y + brick.height) {
                brick.visible = false;
                ball.dy = -ball.dy;
                score += 10;
                scoreElement.textContent = score;
                GameUtils.playSound(523, 0.1);
            }
        }
    });
    
    // Ball out of bounds
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        livesElement.textContent = lives;
        GameUtils.playSound(200, 0.2);
        
        if (lives <= 0) {
            gameOver();
        } else {
            resetBall();
        }
    }
    
    // Check win condition
    if (bricks.every(brick => !brick.visible)) {
        gameWon();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 50;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4;
    ball.dy = -4;
}

function updatePaddle() {
    // Mouse control
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        paddle.x = e.clientX - rect.left - paddle.width / 2;
        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
    });
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    startBtn.disabled = false;
    
    if (score > highScore) {
        GameUtils.saveHighScore('breakout', score);
        highScoreElement.textContent = score;
        alert(`Game Over! New High Score: ${score}`);
    } else {
        alert(`Game Over! Score: ${score}`);
    }
    GameUtils.playSound(200, 0.3);
}

function gameWon() {
    gameRunning = false;
    clearInterval(gameLoop);
    startBtn.disabled = false;
    
    if (score > highScore) {
        GameUtils.saveHighScore('breakout', score);
        highScoreElement.textContent = score;
    }
    GameUtils.playSound(523, 0.5);
    alert(`Congratulations! You cleared all bricks! Score: ${score}`);
}

function gameStep() {
    updateBall();
    draw();
}

startBtn.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        startBtn.disabled = true;
        resetBall();
        gameLoop = setInterval(gameStep, 16);
    }
});

resetBtn.addEventListener('click', () => {
    if (gameRunning) {
        clearInterval(gameLoop);
        gameRunning = false;
    }
    score = 0;
    lives = 3;
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    createBricks();
    resetBall();
    paddle.x = canvas.width / 2 - 75;
    startBtn.disabled = false;
    draw();
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }
    if (e.key === 'ArrowRight' && paddle.x + paddle.width < canvas.width) {
        paddle.x += paddle.speed;
    }
});

updatePaddle();
createBricks();
draw();

