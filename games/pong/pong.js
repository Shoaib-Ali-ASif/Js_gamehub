// Pong Game
GameUtils.applyTheme();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const player1ScoreElement = document.getElementById('player1Score');
const player2ScoreElement = document.getElementById('player2Score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

// Game variables
const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;

let paddle1 = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 5
};

let paddle2 = {
    x: canvas.width - 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 5
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    speedX: 5,
    speedY: 5
};

let player1Score = 0;
let player2Score = 0;
let gameRunning = false;
let gameLoop;
let keys = {};

// Load high score
const highScore = parseInt(localStorage.getItem('pong_highscore')) || 0;
highScoreElement.textContent = highScore;

function drawPaddle(x, y, width, height) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y, width, height);
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawCenterLine();
    drawPaddle(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    drawPaddle(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
    drawBall();
}

function updatePaddles() {
    // Player 1 controls (W/S)
    if (keys['w'] && paddle1.y > 0) {
        paddle1.y -= paddle1.speed;
    }
    if (keys['s'] && paddle1.y + paddle1.height < canvas.height) {
        paddle1.y += paddle1.speed;
    }
    
    // Player 2 controls (Arrow keys)
    if (keys['ArrowUp'] && paddle2.y > 0) {
        paddle2.y -= paddle2.speed;
    }
    if (keys['ArrowDown'] && paddle2.y + paddle2.height < canvas.height) {
        paddle2.y += paddle2.speed;
    }
}

function updateBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    
    // Top and bottom walls
    if (ball.y - ball.size <= 0 || ball.y + ball.size >= canvas.height) {
        ball.speedY = -ball.speedY;
        GameUtils.playSound(440, 0.1);
    }
    
    // Paddle collisions
    if (ball.x - ball.size <= paddle1.x + paddle1.width &&
        ball.y >= paddle1.y &&
        ball.y <= paddle1.y + paddle1.height &&
        ball.speedX < 0) {
        ball.speedX = -ball.speedX;
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - paddle1.y) / paddle1.height;
        ball.speedY = (hitPos - 0.5) * 10;
        GameUtils.playSound(523, 0.1);
    }
    
    if (ball.x + ball.size >= paddle2.x &&
        ball.y >= paddle2.y &&
        ball.y <= paddle2.y + paddle2.height &&
        ball.speedX > 0) {
        ball.speedX = -ball.speedX;
        const hitPos = (ball.y - paddle2.y) / paddle2.height;
        ball.speedY = (hitPos - 0.5) * 10;
        GameUtils.playSound(523, 0.1);
    }
    
    // Score
    if (ball.x < 0) {
        player2Score++;
        player2ScoreElement.textContent = player2Score;
        resetBall();
        GameUtils.playSound(300, 0.2);
        checkWin();
    } else if (ball.x > canvas.width) {
        player1Score++;
        player1ScoreElement.textContent = player1Score;
        resetBall();
        GameUtils.playSound(300, 0.2);
        checkWin();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.speedY = (Math.random() > 0.5 ? 1 : -1) * 5;
}

function checkWin() {
    if (player1Score >= 5) {
        gameRunning = false;
        clearInterval(gameLoop);
        startBtn.disabled = false;
        const newHigh = Math.max(player1Score, highScore);
        if (newHigh > highScore) {
            GameUtils.saveHighScore('pong', newHigh);
            highScoreElement.textContent = newHigh;
        }
        GameUtils.playSound(523, 0.5);
        alert(`Player 1 Wins! 🎉`);
    } else if (player2Score >= 5) {
        gameRunning = false;
        clearInterval(gameLoop);
        startBtn.disabled = false;
        const newHigh = Math.max(player2Score, highScore);
        if (newHigh > highScore) {
            GameUtils.saveHighScore('pong', newHigh);
            highScoreElement.textContent = newHigh;
        }
        GameUtils.playSound(523, 0.5);
        alert(`Player 2 Wins! 🎉`);
    }
}

function gameStep() {
    updatePaddles();
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
    player1Score = 0;
    player2Score = 0;
    player1ScoreElement.textContent = player1Score;
    player2ScoreElement.textContent = player2Score;
    paddle1.y = canvas.height / 2 - paddleHeight / 2;
    paddle2.y = canvas.height / 2 - paddleHeight / 2;
    resetBall();
    startBtn.disabled = false;
    draw();
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Initial draw
draw();

