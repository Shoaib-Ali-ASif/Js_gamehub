// Flappy Bird Game
GameUtils.applyTheme();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const startScreen = document.getElementById('startScreen');

// Game variables
let bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.5
};

let pipes = [];
let score = 0;
let gameRunning = false;
let gameLoop;
let pipeGap = 150;
let pipeWidth = 60;
let pipeSpeed = 2;

// Load high score
const highScore = parseInt(localStorage.getItem('flappy_highscore')) || 0;
highScoreElement.textContent = highScore;

function drawBird() {
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width, bird.y + bird.height / 2);
    ctx.lineTo(bird.x + bird.width + 10, bird.y + bird.height / 2 - 5);
    ctx.lineTo(bird.x + bird.width + 10, bird.y + bird.height / 2 + 5);
    ctx.closePath();
    ctx.fill();
    
    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2 + 5, bird.y + bird.height / 2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawPipes() {
    ctx.fillStyle = '#2ecc71';
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, canvas.height - (pipe.topHeight + pipeGap));
        
        // Pipe caps
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        ctx.fillRect(pipe.x - 5, pipe.topHeight + pipeGap, pipeWidth + 10, 20);
        ctx.fillStyle = '#2ecc71';
    });
}

function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        passed: false
    });
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Check boundaries
    if (bird.y + bird.height > canvas.height) {
        gameOver();
    }
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

function updatePipes() {
    // Move pipes
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
        
        // Check collision
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.topHeight || bird.y + bird.height > pipe.topHeight + pipeGap)) {
            gameOver();
        }
        
        // Score point
        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            score++;
            scoreElement.textContent = score;
            GameUtils.playSound(523, 0.1);
        }
    });
    
    // Remove off-screen pipes
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
    
    // Create new pipe
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        createPipe();
    }
}

function draw() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#4facfe');
    gradient.addColorStop(1, '#00f2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ground
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    ctx.fillStyle = '#90ee90';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 5);
    
    drawPipes();
    drawBird();
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    startBtn.disabled = false;
    startScreen.classList.remove('hidden');
    
    if (score > highScore) {
        GameUtils.saveHighScore('flappy', score);
        highScoreElement.textContent = score;
        GameUtils.playSound(523, 0.3);
        alert(`Game Over! New High Score: ${score}`);
    } else {
        GameUtils.playSound(200, 0.3);
        alert(`Game Over! Score: ${score}`);
    }
}

function gameStep() {
    updateBird();
    updatePipes();
    draw();
}

function startGame() {
    gameRunning = true;
    startBtn.disabled = true;
    startScreen.classList.add('hidden');
    
    // Reset game
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    scoreElement.textContent = score;
    
    gameLoop = setInterval(gameStep, 20);
}

startBtn.addEventListener('click', startGame);

resetBtn.addEventListener('click', () => {
    if (gameRunning) {
        clearInterval(gameLoop);
        gameRunning = false;
    }
    startBtn.disabled = false;
    startScreen.classList.remove('hidden');
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    scoreElement.textContent = score;
    draw();
});

// Controls
canvas.addEventListener('click', () => {
    if (gameRunning) {
        bird.velocity = -8;
        GameUtils.playSound(440, 0.1);
    } else {
        startGame();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameRunning) {
            bird.velocity = -8;
            GameUtils.playSound(440, 0.1);
        } else {
            startGame();
        }
    }
});

// Initial draw
draw();

