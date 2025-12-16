// Mini Racing Game
GameUtils.applyTheme();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const speedElement = document.getElementById('speed');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const startScreen = document.getElementById('startScreen');

// Game variables
let car = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 80,
    speed: 0,
    maxSpeed: 8
};

let roadOffset = 0;
let obstacles = [];
let score = 0;
let gameRunning = false;
let gameLoop;
let obstacleTimer = 0;
let roadSpeed = 3;

// Load high score
const highScore = parseInt(localStorage.getItem('racing_highscore')) || 0;
highScoreElement.textContent = highScore;

function drawRoad() {
    // Road background
    ctx.fillStyle = '#333';
    ctx.fillRect(canvas.width / 2 - 60, 0, 120, canvas.height);
    
    // Road markings
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    
    for (let y = -roadOffset % 40; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, y);
        ctx.lineTo(canvas.width / 2, y + 20);
        ctx.stroke();
    }
    ctx.setLineDash([]);
    
    // Road edges
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 60, 0);
    ctx.lineTo(canvas.width / 2 - 60, canvas.height);
    ctx.moveTo(canvas.width / 2 + 60, 0);
    ctx.lineTo(canvas.width / 2 + 60, canvas.height);
    ctx.stroke();
}

function drawCar() {
    // Car body
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(car.x, car.y, car.width, car.height);
    
    // Car windows
    ctx.fillStyle = '#4a90e2';
    ctx.fillRect(car.x + 10, car.y + 10, 30, 25);
    
    // Car wheels
    ctx.fillStyle = '#000';
    ctx.fillRect(car.x - 5, car.y + 20, 10, 15);
    ctx.fillRect(car.x + car.width - 5, car.y + 20, 10, 15);
    ctx.fillRect(car.x - 5, car.y + 45, 10, 15);
    ctx.fillRect(car.x + car.width - 5, car.y + 45, 10, 15);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Obstacle details
        ctx.fillStyle = '#fff';
        ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, obstacle.height - 10);
    });
}

function createObstacle() {
    const laneWidth = 60;
    const lanes = [
        canvas.width / 2 - 30,
        canvas.width / 2 + 30
    ];
    
    obstacles.push({
        x: lanes[Math.floor(Math.random() * lanes.length)],
        y: -50,
        width: 40,
        height: 60,
        color: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf'][Math.floor(Math.random() * 4)]
    });
}

function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.y += roadSpeed + car.speed;
        
        // Check collision
        if (obstacle.y + obstacle.height > car.y &&
            obstacle.y < car.y + car.height &&
            obstacle.x + obstacle.width > car.x &&
            obstacle.x < car.x + car.width) {
            gameOver();
        }
        
        // Remove off-screen obstacles
        if (obstacle.y > canvas.height) {
            obstacles.splice(index, 1);
            score += 10;
            scoreElement.textContent = score;
            GameUtils.playSound(440, 0.1);
        }
    });
}

function update() {
    roadOffset += roadSpeed + car.speed;
    if (roadOffset > 40) roadOffset = 0;
    
    // Update obstacles
    obstacleTimer++;
    if (obstacleTimer > 60 - (score / 100)) {
        createObstacle();
        obstacleTimer = 0;
    }
    
    updateObstacles();
    
    // Update speed display
    speedElement.textContent = Math.floor((roadSpeed + car.speed) * 10);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawRoad();
    drawObstacles();
    drawCar();
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    startBtn.disabled = false;
    startScreen.classList.remove('hidden');
    
    if (score > highScore) {
        GameUtils.saveHighScore('racing', score);
        highScoreElement.textContent = score;
        GameUtils.playSound(523, 0.3);
        alert(`Game Over! New High Score: ${score}`);
    } else {
        GameUtils.playSound(200, 0.3);
        alert(`Game Over! Score: ${score}`);
    }
}

function gameStep() {
    update();
    draw();
}

function startGame() {
    gameRunning = true;
    startBtn.disabled = true;
    startScreen.classList.add('hidden');
    
    // Reset game
    car.x = canvas.width / 2 - 25;
    car.speed = 0;
    obstacles = [];
    score = 0;
    obstacleTimer = 0;
    roadSpeed = 3;
    scoreElement.textContent = score;
    speedElement.textContent = 0;
    
    gameLoop = setInterval(gameStepWithInput, 16);
}

startBtn.addEventListener('click', startGame);

resetBtn.addEventListener('click', () => {
    if (gameRunning) {
        clearInterval(gameLoop);
        gameRunning = false;
    }
    startBtn.disabled = false;
    startScreen.classList.remove('hidden');
    car.x = canvas.width / 2 - 25;
    car.speed = 0;
    obstacles = [];
    score = 0;
    obstacleTimer = 0;
    roadSpeed = 3;
    scoreElement.textContent = score;
    speedElement.textContent = 0;
    draw();
});

// Keyboard controls
let keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (!gameRunning) startGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function handleInput() {
    if (!gameRunning) return;
    
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        car.x = Math.max(canvas.width / 2 - 60, car.x - 5);
        car.speed = Math.min(car.maxSpeed, car.speed + 0.2);
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        car.x = Math.min(canvas.width / 2 + 60 - car.width, car.x + 5);
        car.speed = Math.min(car.maxSpeed, car.speed + 0.2);
    } else {
        car.speed = Math.max(0, car.speed - 0.1);
    }
}

// Update game step to include input handling
const gameStepWithInput = () => {
    handleInput();
    update();
    draw();
};

canvas.addEventListener('click', () => {
    if (!gameRunning) {
        startGame();
    }
});

// Initial draw
draw();

