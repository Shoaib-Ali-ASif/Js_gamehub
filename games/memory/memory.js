// Memory Card Game
GameUtils.applyTheme();

const board = document.getElementById('board');
const movesElement = document.getElementById('moves');
const timeElement = document.getElementById('time');
const bestTimeElement = document.getElementById('bestTime');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

// Game variables
const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
let cards = [];
let flippedCards = [];
let moves = 0;
let matches = 0;
let gameStarted = false;
let startTime = null;
let timerInterval = null;
let canFlip = true;

// Load best time
const bestTime = parseInt(localStorage.getItem('memory_highscore'));
if (bestTime) {
    bestTimeElement.textContent = formatTime(bestTime);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function createCards() {
    const pairs = [...emojis, ...emojis];
    // Shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    return pairs;
}

function initBoard() {
    board.innerHTML = '';
    cards = createCards();
    flippedCards = [];
    moves = 0;
    matches = 0;
    gameStarted = false;
    canFlip = true;
    movesElement.textContent = moves;
    timeElement.textContent = '00:00';
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        
        const front = document.createElement('div');
        front.className = 'card-front';
        front.textContent = '?';
        
        const back = document.createElement('div');
        back.className = 'card-back';
        back.textContent = emoji;
        
        card.appendChild(front);
        card.appendChild(back);
        
        card.addEventListener('click', () => flipCard(index));
        board.appendChild(card);
    });
}

function flipCard(index) {
    if (!canFlip || cards[index] === null) return;
    
    const card = board.children[index];
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    
    if (!gameStarted) {
        gameStarted = true;
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
    }
    
    card.classList.add('flipped');
    flippedCards.push(index);
    GameUtils.playSound(440, 0.1);
    
    if (flippedCards.length === 2) {
        canFlip = false;
        moves++;
        movesElement.textContent = moves;
        
        setTimeout(() => {
            checkMatch();
        }, 1000);
    }
}

function checkMatch() {
    const [index1, index2] = flippedCards;
    const card1 = board.children[index1];
    const card2 = board.children[index2];
    
    if (cards[index1] === cards[index2]) {
        // Match!
        card1.classList.add('matched');
        card2.classList.add('matched');
        matches++;
        GameUtils.playSound(523, 0.2);
        
        if (matches === emojis.length) {
            // Game won!
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            clearInterval(timerInterval);
            
            if (GameUtils.saveBestTime('memory', elapsed)) {
                bestTimeElement.textContent = formatTime(elapsed);
                alert(`Congratulations! New Best Time: ${formatTime(elapsed)}`);
            } else {
                alert(`Congratulations! Time: ${formatTime(elapsed)}`);
            }
            GameUtils.playSound(523, 0.5);
        }
    } else {
        // No match
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }
    
    flippedCards = [];
    canFlip = true;
}

function updateTimer() {
    if (!startTime) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeElement.textContent = formatTime(elapsed);
}

startBtn.addEventListener('click', () => {
    initBoard();
});

resetBtn.addEventListener('click', () => {
    initBoard();
});

// Initialize
initBoard();

