// Bubble Shooter Game
GameUtils.applyTheme();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const bubblesLeftElement = document.getElementById('bubblesLeft');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

// Game variables
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
let bubbles = [];
let shooter = { x: canvas.width / 2, y: canvas.height - 50, angle: 0 };
let currentBubble = null;
let nextBubble = null;
let score = 0;
let bubblesLeft = 50;
let gameRunning = false;
let gameLoop;

// Load high score
const highScore = parseInt(localStorage.getItem('bubble_highscore')) || 0;
highScoreElement.textContent = highScore;

function initBubbles() {
    bubbles = [];
    const rows = 8;
    const cols = 8;
    const radius = 20;
    const spacing = radius * 2.2;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = (col * spacing) + (row % 2 === 1 ? spacing / 2 : 0) + 50;
            const y = row * spacing + 50;
            if (x + radius < canvas.width - 50) {
                bubbles.push({
                    x, y, radius,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    active: true
                });
            }
        }
    }
}

function createBubble() {
    return {
        x: shooter.x,
        y: shooter.y,
        radius: 20,
        vx: 0,
        vy: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        active: true
    };
}

function drawBubble(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(x - radius / 3, y - radius / 3, radius / 3, 0, Math.PI * 2);
    ctx.fill();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#e0f6ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw bubbles
    bubbles.forEach(bubble => {
        if (bubble.active) {
            drawBubble(bubble.x, bubble.y, bubble.radius, bubble.color);
        }
    });
    
    // Draw shooter
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(shooter.x, shooter.y);
    ctx.lineTo(
        shooter.x + Math.cos(shooter.angle) * 50,
        shooter.y + Math.sin(shooter.angle) * 50
    );
    ctx.stroke();
    
    // Draw current bubble
    if (currentBubble) {
        drawBubble(currentBubble.x, currentBubble.y, currentBubble.radius, currentBubble.color);
    }
    
    // Draw next bubble
    if (nextBubble) {
        drawBubble(canvas.width - 40, canvas.height - 50, 15, nextBubble.color);
    }
}

function update() {
    if (!gameRunning) return;
    
    // Update current bubble
    if (currentBubble && currentBubble.active) {
        currentBubble.x += currentBubble.vx;
        currentBubble.y += currentBubble.vy;
        
        // Check wall collision
        if (currentBubble.x - currentBubble.radius <= 0 || currentBubble.x + currentBubble.radius >= canvas.width) {
            currentBubble.vx = -currentBubble.vx;
        }
        
        // Check ceiling
        if (currentBubble.y - currentBubble.radius <= 0) {
            attachBubble();
            return;
        }
        
        // Check bubble collision
        bubbles.forEach(bubble => {
            if (bubble.active) {
                const dx = currentBubble.x - bubble.x;
                const dy = currentBubble.y - bubble.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < currentBubble.radius + bubble.radius) {
                    attachBubble();
                    checkMatches(bubble);
                }
            }
        });
    }
}

function attachBubble() {
    if (!currentBubble) return;
    
    currentBubble.active = false;
    bubbles.push({
        x: currentBubble.x,
        y: currentBubble.y,
        radius: currentBubble.radius,
        color: currentBubble.color,
        active: true
    });
    
    currentBubble = nextBubble;
    nextBubble = createBubble();
    bubblesLeft--;
    bubblesLeftElement.textContent = bubblesLeft;
    
    if (bubblesLeft <= 0) {
        gameOver();
    }
}

function checkMatches(bubble) {
    const matches = [bubble];
    const toCheck = [bubble];
    const checked = new Set();
    
    while (toCheck.length > 0) {
        const current = toCheck.pop();
        checked.add(current);
        
        bubbles.forEach(b => {
            if (b.active && b.color === current.color && !checked.has(b)) {
                const dx = current.x - b.x;
                const dy = current.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < current.radius + b.radius + 5) {
                    matches.push(b);
                    toCheck.push(b);
                }
            }
        });
    }
    
    if (matches.length >= 3) {
        matches.forEach(b => b.active = false);
        score += matches.length * 10;
        scoreElement.textContent = score;
        GameUtils.playSound(523, 0.2);
    }
}

function shoot() {
    if (!currentBubble || !gameRunning) return;
    
    currentBubble.vx = Math.cos(shooter.angle) * 8;
    currentBubble.vy = Math.sin(shooter.angle) * 8;
    GameUtils.playSound(440, 0.1);
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    startBtn.disabled = false;
    
    if (score > highScore) {
        GameUtils.saveHighScore('bubble', score);
        highScoreElement.textContent = score;
        alert(`Game Over! New High Score: ${score}`);
    } else {
        alert(`Game Over! Score: ${score}`);
    }
    GameUtils.playSound(300, 0.3);
}

function gameStep() {
    update();
    draw();
}

function startGame() {
    gameRunning = true;
    startBtn.disabled = true;
    score = 0;
    bubblesLeft = 50;
    scoreElement.textContent = score;
    bubblesLeftElement.textContent = bubblesLeft;
    
    initBubbles();
    currentBubble = createBubble();
    nextBubble = createBubble();
    
    gameLoop = setInterval(gameStep, 16);
}

startBtn.addEventListener('click', startGame);

resetBtn.addEventListener('click', () => {
    if (gameRunning) {
        clearInterval(gameLoop);
        gameRunning = false;
    }
    startBtn.disabled = false;
    score = 0;
    bubblesLeft = 50;
    scoreElement.textContent = score;
    bubblesLeftElement.textContent = bubblesLeft;
    initBubbles();
    currentBubble = null;
    nextBubble = null;
    draw();
});

// Mouse controls
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    shooter.angle = Math.atan2(mouseY - shooter.y, mouseX - shooter.x);
});

canvas.addEventListener('click', () => {
    if (gameRunning && currentBubble && !currentBubble.vx && !currentBubble.vy) {
        shoot();
    } else if (!gameRunning) {
        startGame();
    }
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (gameRunning && currentBubble && !currentBubble.vx && !currentBubble.vy) {
            shoot();
        } else if (!gameRunning) {
            startGame();
        }
    }
    
    if (e.key === 'ArrowLeft') {
        shooter.angle -= 0.1;
    } else if (e.key === 'ArrowRight') {
        shooter.angle += 0.1;
    }
});

// Initial draw
draw();

