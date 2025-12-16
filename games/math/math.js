// Math Challenge Game
GameUtils.applyTheme();

const questionDisplay = document.getElementById('questionDisplay');
const answersGrid = document.getElementById('answersGrid');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const levelElement = document.getElementById('level');
const timeLeftElement = document.getElementById('timeLeft');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

// Game variables
let score = 0;
let level = 1;
let timeLeft = 30;
let currentQuestion = null;
let gameRunning = false;
let gameTimer = null;
let questionTimer = null;

// Load high score
const highScore = parseInt(localStorage.getItem('math_highscore')) || 0;
highScoreElement.textContent = highScore;

function generateQuestion() {
    const operations = ['+', '-', '*'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;
    
    const maxNum = 10 + (level * 5);
    
    switch(op) {
        case '+':
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * maxNum) + 1;
            answer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
            answer = num1 - num2;
            break;
        case '*':
            num1 = Math.floor(Math.random() * Math.min(maxNum, 12)) + 1;
            num2 = Math.floor(Math.random() * Math.min(maxNum, 12)) + 1;
            answer = num1 * num2;
            break;
    }
    
    currentQuestion = { num1, num2, op, answer };
    questionDisplay.textContent = `${num1} ${op} ${num2} = ?`;
    
    // Generate wrong answers
    const wrongAnswers = [];
    while (wrongAnswers.length < 3) {
        const wrong = answer + Math.floor(Math.random() * 20) - 10;
        if (wrong !== answer && wrong > 0 && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
        }
    }
    
    // Create answer buttons
    const allAnswers = [answer, ...wrongAnswers];
    // Shuffle
    for (let i = allAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }
    
    answersGrid.innerHTML = '';
    allAnswers.forEach(ans => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = ans;
        btn.addEventListener('click', () => checkAnswer(ans === answer, btn));
        answersGrid.appendChild(btn);
    });
}

function checkAnswer(isCorrect, btn) {
    if (!gameRunning) return;
    
    // Disable all buttons
    document.querySelectorAll('.answer-btn').forEach(b => {
        b.style.pointerEvents = 'none';
    });
    
    if (isCorrect) {
        btn.classList.add('correct');
        score += 10 + (level * 5);
        level = Math.floor(score / 100) + 1;
        scoreElement.textContent = score;
        levelElement.textContent = level;
        timeLeft = Math.min(30, timeLeft + 2);
        timeLeftElement.textContent = timeLeft;
        GameUtils.playSound(523, 0.2);
        
        setTimeout(() => {
            generateQuestion();
        }, 1000);
    } else {
        btn.classList.add('wrong');
        timeLeft = Math.max(0, timeLeft - 5);
        timeLeftElement.textContent = timeLeft;
        GameUtils.playSound(200, 0.2);
        
        if (timeLeft <= 0) {
            gameOver();
        } else {
            setTimeout(() => {
                generateQuestion();
            }, 1000);
        }
    }
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameTimer);
    clearInterval(questionTimer);
    startBtn.disabled = false;
    
    if (score > highScore) {
        GameUtils.saveHighScore('math', score);
        highScoreElement.textContent = score;
        GameUtils.playSound(523, 0.5);
        alert(`Game Over! New High Score: ${score}`);
    } else {
        GameUtils.playSound(300, 0.3);
        alert(`Game Over! Score: ${score}`);
    }
}

function startGame() {
    gameRunning = true;
    score = 0;
    level = 1;
    timeLeft = 30;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    timeLeftElement.textContent = timeLeft;
    startBtn.disabled = true;
    
    generateQuestion();
    
    gameTimer = setInterval(() => {
        timeLeft--;
        timeLeftElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            gameOver();
        }
    }, 1000);
}

startBtn.addEventListener('click', () => {
    if (!gameRunning) {
        startGame();
    }
});

resetBtn.addEventListener('click', () => {
    if (gameRunning) {
        clearInterval(gameTimer);
        clearInterval(questionTimer);
        gameRunning = false;
    }
    score = 0;
    level = 1;
    timeLeft = 30;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    timeLeftElement.textContent = timeLeft;
    startBtn.disabled = false;
    questionDisplay.textContent = 'Click Start to begin!';
    answersGrid.innerHTML = '';
});

