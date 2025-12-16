// Wordle Game
GameUtils.applyTheme();

const board = document.getElementById('board');
const keyboard = document.getElementById('keyboard');
const guessesElement = document.getElementById('guesses');
const winsElement = document.getElementById('wins');
const wordLengthElement = document.getElementById('wordLength');
const gameMessage = document.getElementById('gameMessage');
const newGameBtn = document.getElementById('newGameBtn');
const resetBtn = document.getElementById('resetBtn');

// Word list (5-letter words)
const words = [
    'APPLE', 'BRAVE', 'CLOUD', 'DANCE', 'EARTH', 'FLAME', 'GLASS', 'HEART',
    'IMAGE', 'JOKER', 'KNIFE', 'LIGHT', 'MAGIC', 'NIGHT', 'OCEAN', 'PIANO',
    'QUICK', 'RIVER', 'STORM', 'TABLE', 'UNITY', 'VALUE', 'WATER', 'YOUTH',
    'ZEBRA', 'BEACH', 'CHAIR', 'DREAM', 'EAGLE', 'FROST', 'GREEN', 'HAPPY'
];

let currentWord = '';
let currentRow = 0;
let currentCell = 0;
let guesses = 0;
let wins = parseInt(localStorage.getItem('wordle_highscore')) || 0;
winsElement.textContent = wins;

function initBoard() {
    board.innerHTML = '';
    currentRow = 0;
    currentCell = 0;
    guesses = 0;
    guessesElement.textContent = '0/6';
    gameMessage.textContent = '';
    gameMessage.className = 'game-message';
    
    // Pick random word
    currentWord = words[Math.floor(Math.random() * words.length)];
    
    // Create 6 rows
    for (let r = 0; r < 6; r++) {
        const row = document.createElement('div');
        row.className = 'wordle-row';
        for (let c = 0; c < 5; c++) {
            const cell = document.createElement('div');
            cell.className = 'wordle-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
}

function initKeyboard() {
    const layout = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
    ];
    
    keyboard.innerHTML = '';
    layout.forEach(row => {
        const keyboardRow = document.createElement('div');
        keyboardRow.className = 'keyboard-row';
        row.forEach(key => {
            const keyBtn = document.createElement('button');
            keyBtn.className = 'key' + (key.length > 1 ? ' wide' : '');
            keyBtn.textContent = key;
            keyBtn.addEventListener('click', () => handleKeyPress(key));
            keyboardRow.appendChild(keyBtn);
        });
        keyboard.appendChild(keyboardRow);
    });
}

function handleKeyPress(key) {
    if (guesses >= 6) return;
    
    if (key === 'BACK') {
        if (currentCell > 0) {
            currentCell--;
            const cell = board.children[currentRow].children[currentCell];
            cell.textContent = '';
            cell.classList.remove('filled');
        }
    } else if (key === 'ENTER') {
        checkGuess();
    } else if (currentCell < 5) {
        const cell = board.children[currentRow].children[currentCell];
        cell.textContent = key;
        cell.classList.add('filled');
        currentCell++;
    }
}

function checkGuess() {
    if (currentCell !== 5) return;
    
    let guess = '';
    const row = board.children[currentRow];
    for (let i = 0; i < 5; i++) {
        guess += row.children[i].textContent;
    }
    
    guesses++;
    guessesElement.textContent = `${guesses}/6`;
    
    // Check each letter
    const wordArray = currentWord.split('');
    const guessArray = guess.split('');
    const result = [];
    
    // First pass: mark correct positions
    for (let i = 0; i < 5; i++) {
        if (guessArray[i] === wordArray[i]) {
            result[i] = 'correct';
            wordArray[i] = null;
            guessArray[i] = null;
        }
    }
    
    // Second pass: mark present letters
    for (let i = 0; i < 5; i++) {
        if (guessArray[i] !== null) {
            const index = wordArray.indexOf(guessArray[i]);
            if (index !== -1) {
                result[i] = 'present';
                wordArray[index] = null;
            } else {
                result[i] = 'absent';
            }
        }
    }
    
    // Animate cells
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const cell = row.children[i];
            cell.classList.add(result[i]);
            updateKeyColor(guess[i], result[i]);
        }, i * 100);
    }
    
    // Check win/lose
    if (guess === currentWord) {
        setTimeout(() => {
            wins++;
            winsElement.textContent = wins;
            GameUtils.saveHighScore('wordle', wins);
            gameMessage.textContent = 'You Win! 🎉';
            gameMessage.className = 'game-message win';
            GameUtils.playSound(523, 0.5);
        }, 600);
    } else if (guesses >= 6) {
        setTimeout(() => {
            gameMessage.textContent = `Game Over! Word was: ${currentWord}`;
            gameMessage.className = 'game-message lose';
            GameUtils.playSound(200, 0.3);
        }, 600);
    } else {
        currentRow++;
        currentCell = 0;
        GameUtils.playSound(440, 0.1);
    }
}

function updateKeyColor(letter, status) {
    const keys = keyboard.querySelectorAll('.key');
    keys.forEach(key => {
        if (key.textContent === letter) {
            if (status === 'correct' || (status === 'present' && !key.classList.contains('correct'))) {
                key.classList.remove('present', 'absent');
                key.classList.add(status);
            } else if (status === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present')) {
                key.classList.add('absent');
            }
        }
    });
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    if (key === 'BACKSPACE') {
        handleKeyPress('BACK');
    } else if (key === 'ENTER') {
        handleKeyPress('ENTER');
    } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
        handleKeyPress(key);
    }
});

newGameBtn.addEventListener('click', () => {
    initBoard();
});

resetBtn.addEventListener('click', () => {
    initBoard();
});

// Initialize
initBoard();
initKeyboard();

