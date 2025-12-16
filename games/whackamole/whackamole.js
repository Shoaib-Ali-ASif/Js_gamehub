// Whack-a-Mole Game
GameUtils.applyTheme();

const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const timeLeftElement = document.getElementById('timeLeft');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const moleHoles = document.querySelectorAll('.mole-hole');

// Game variables
let score = 0;
let timeLeft = 30;
let gameRunning = false;
let gameInterval = null;
let moleInterval = null;
let timerInterval = null;

// Load high score
const highScore = parseInt(localStorage.getItem('whackamole_highscore')) || 0;
highScoreElement.textContent = highScore;

function getRandomHole() {
    return Math.floor(Math.random() * moleHoles.length);
}

function showMole() {
    if (!gameRunning) return;
    
    // Hide all moles first
    moleHoles.forEach(hole => {
        const mole = hole.querySelector('.mole');
        mole.classList.remove('active');
    });
    
    // Show random mole
    const randomIndex = getRandomHole();
    const mole = moleHoles[randomIndex].querySelector('.mole');
    mole.classList.add('active');
    
    // Auto-hide after 1.5 seconds
    setTimeout(() => {
        mole.classList.remove('active');
    }, 1500);
}

function whackMole(index) {
    if (!gameRunning) return;
    
    const mole = moleHoles[index].querySelector('.mole');
    if (mole.classList.contains('active')) {
        mole.classList.remove('active');
        mole.classList.add('whacked');
        score++;
        scoreElement.textContent = score;
        GameUtils.playSound(523, 0.1);
        
        setTimeout(() => {
            mole.classList.remove('whacked');
        }, 200);
    }
}

function startGame() {
    gameRunning = true;
    score = 0;
    timeLeft = 30;
    scoreElement.textContent = score;
    timeLeftElement.textContent = timeLeft;
    startBtn.disabled = true;
    
    // Show moles periodically
    moleInterval = setInterval(showMole, 1000);
    showMole(); // Show first mole immediately
    
    // Timer
    timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    gameRunning = false;
    clearInterval(moleInterval);
    clearInterval(timerInterval);
    startBtn.disabled = false;
    
    // Hide all moles
    moleHoles.forEach(hole => {
        const mole = hole.querySelector('.mole');
        mole.classList.remove('active');
    });
    
    if (score > highScore) {
        GameUtils.saveHighScore('whackamole', score);
        highScoreElement.textContent = score;
        GameUtils.playSound(523, 0.5);
        alert(`Time's Up! New High Score: ${score}`);
    } else {
        GameUtils.playSound(300, 0.3);
        alert(`Time's Up! Score: ${score}`);
    }
}

startBtn.addEventListener('click', () => {
    if (!gameRunning) {
        startGame();
    }
});

resetBtn.addEventListener('click', () => {
    if (gameRunning) {
        clearInterval(moleInterval);
        clearInterval(timerInterval);
        gameRunning = false;
    }
    score = 0;
    timeLeft = 30;
    scoreElement.textContent = score;
    timeLeftElement.textContent = timeLeft;
    startBtn.disabled = false;
    
    moleHoles.forEach(hole => {
        const mole = hole.querySelector('.mole');
        mole.classList.remove('active', 'whacked');
    });
});

// Add click handlers
moleHoles.forEach((hole, index) => {
    hole.addEventListener('click', () => {
        whackMole(index);
    });
});

