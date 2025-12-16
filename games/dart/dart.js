// Dart Throwing Game
GameUtils.applyTheme();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const dartsLeftElement = document.getElementById('dartsLeft');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

// Game variables
let score = 0;
let dartsLeft = 10;
let gameRunning = false;
let dart = null;
let dartboard = {
    centerX: canvas.width / 2,
    centerY: canvas.height / 2,
    radius: 200
};

// Load high score
const highScore = parseInt(localStorage.getItem('dart_highscore')) || 0;
highScoreElement.textContent = highScore;

function drawDartboard() {
    // Outer ring
    const rings = [
        { radius: 200, color: '#fff', score: 1 },
        { radius: 180, color: '#000', score: 3 },
        { radius: 120, color: '#fff', score: 1 },
        { radius: 100, color: '#000', score: 3 },
        { radius: 60, color: '#fff', score: 1 },
        { radius: 40, color: '#000', score: 3 },
        { radius: 20, color: '#ff0000', score: 5 },
        { radius: 10, color: '#ff0000', score: 10 }
    ];
    
    rings.forEach(ring => {
        ctx.fillStyle = ring.color;
        ctx.beginPath();
        ctx.arc(dartboard.centerX, dartboard.centerY, ring.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Numbers
    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    for (let i = 1; i <= 20; i++) {
        const angle = (i * Math.PI / 10) - Math.PI / 2;
        const x = dartboard.centerX + Math.cos(angle) * 170;
        const y = dartboard.centerY + Math.sin(angle) * 170;
        ctx.fillText(i, x, y);
    }
}

function drawDart(x, y) {
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Dart tail
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 10, y - 10);
    ctx.stroke();
}

function calculateScore(x, y) {
    const dx = x - dartboard.centerX;
    const dy = y - dartboard.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > dartboard.radius) return 0;
    if (distance <= 10) return 10;
    if (distance <= 20) return 5;
    if (distance <= 40) return 3;
    if (distance <= 60) return 1;
    if (distance <= 100) return 3;
    if (distance <= 120) return 1;
    if (distance <= 180) return 3;
    return 1;
}

function throwDart(x, y) {
    if (!gameRunning || dartsLeft <= 0) return;
    
    const points = calculateScore(x, y);
    score += points;
    dartsLeft--;
    scoreElement.textContent = score;
    dartsLeftElement.textContent = dartsLeft;
    
    drawDart(x, y);
    GameUtils.playSound(440, 0.1);
    
    if (dartsLeft <= 0) {
        gameOver();
    }
}

function gameOver() {
    gameRunning = false;
    startBtn.disabled = false;
    
    if (score > highScore) {
        GameUtils.saveHighScore('dart', score);
        highScoreElement.textContent = score;
        GameUtils.playSound(523, 0.5);
        alert(`Game Over! New High Score: ${score}`);
    } else {
        GameUtils.playSound(300, 0.3);
        alert(`Game Over! Score: ${score}`);
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawDartboard();
    
    if (dart) {
        drawDart(dart.x, dart.y);
    }
}

function startGame() {
    gameRunning = true;
    startBtn.disabled = true;
    score = 0;
    dartsLeft = 10;
    scoreElement.textContent = score;
    dartsLeftElement.textContent = dartsLeft;
    dart = null;
    draw();
}

startBtn.addEventListener('click', startGame);

resetBtn.addEventListener('click', () => {
    gameRunning = false;
    startBtn.disabled = false;
    score = 0;
    dartsLeft = 10;
    scoreElement.textContent = score;
    dartsLeftElement.textContent = dartsLeft;
    dart = null;
    draw();
});

canvas.addEventListener('click', (e) => {
    if (!gameRunning) {
        startGame();
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    throwDart(x, y);
});

canvas.addEventListener('mousemove', (e) => {
    if (!gameRunning) return;
    
    const rect = canvas.getBoundingClientRect();
    dart = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    draw();
});

// Initial draw
draw();

