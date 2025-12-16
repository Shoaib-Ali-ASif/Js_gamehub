// 4 Pics 1 Word Game
GameUtils.applyTheme();

const picturesGrid = document.getElementById('picturesGrid');
const wordDisplay = document.getElementById('wordDisplay');
const lettersGrid = document.getElementById('lettersGrid');
const selectedLetters = document.getElementById('selectedLetters');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const levelElement = document.getElementById('level');
const nextBtn = document.getElementById('nextBtn');
const hintBtn = document.getElementById('hintBtn');

// Puzzles: [pics, word, letters]
const puzzles = [
    { pics: ['🍎', '🍌', '🍊', '🍇'], word: 'FRUIT', letters: 'FRUITABCDE' },
    { pics: ['🐶', '🐱', '🐰', '🐹'], word: 'PET', letters: 'PETABCDEFGH' },
    { pics: ['🚗', '🚕', '🚙', '🚌'], word: 'CAR', letters: 'CARBDEFGHIJ' },
    { pics: ['⚽', '🏀', '🏈', '⚾'], word: 'BALL', letters: 'BALLCDEFGHI' },
    { pics: ['🌞', '🌙', '⭐', '☁️'], word: 'SKY', letters: 'SKYABCDEFGH' },
    { pics: ['🌊', '🏖️', '🐚', '🏄'], word: 'BEACH', letters: 'BEACHDFGIJ' },
    { pics: ['🎂', '🍰', '🍪', '🍩'], word: 'SWEET', letters: 'SWEETABCDF' },
    { pics: ['📚', '✏️', '📝', '📖'], word: 'STUDY', letters: 'STUDYABCFG' }
];

let currentPuzzle = 0;
let score = 0;
let level = 1;
let selected = [];
let usedLetters = [];

// Load high score
const highScore = parseInt(localStorage.getItem('picsword_highscore')) || 0;
highScoreElement.textContent = highScore;

function loadPuzzle() {
    const puzzle = puzzles[currentPuzzle % puzzles.length];
    selected = [];
    usedLetters = [];
    
    // Display pictures
    picturesGrid.innerHTML = '';
    puzzle.pics.forEach(pic => {
        const picItem = document.createElement('div');
        picItem.className = 'picture-item';
        picItem.textContent = pic;
        picturesGrid.appendChild(picItem);
    });
    
    // Display word placeholder
    wordDisplay.textContent = '_ '.repeat(puzzle.word.length).trim();
    
    // Display selected letters area
    selectedLetters.innerHTML = '';
    
    // Create letter buttons
    lettersGrid.innerHTML = '';
    const shuffled = puzzle.letters.split('').sort(() => Math.random() - 0.5);
    shuffled.forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'letter-btn';
        btn.textContent = letter;
        btn.addEventListener('click', () => selectLetter(letter, btn));
        lettersGrid.appendChild(btn);
    });
}

function selectLetter(letter, btn) {
    if (selected.length >= puzzles[currentPuzzle % puzzles.length].word.length) return;
    if (usedLetters.includes(letter)) return;
    
    selected.push(letter);
    usedLetters.push(letter);
    btn.classList.add('used');
    
    // Add to selected display
    const selectedDiv = document.createElement('div');
    selectedDiv.className = 'selected-letter';
    selectedDiv.textContent = letter;
    selectedDiv.addEventListener('click', () => removeLetter(letter, selectedDiv, btn));
    selectedLetters.appendChild(selectedDiv);
    
    updateWordDisplay();
    checkAnswer();
    GameUtils.playSound(440, 0.1);
}

function removeLetter(letter, selectedDiv, btn) {
    const index = selected.indexOf(letter);
    if (index !== -1) {
        selected.splice(index, 1);
        usedLetters = usedLetters.filter(l => l !== letter);
        selectedDiv.remove();
        btn.classList.remove('used');
        updateWordDisplay();
    }
}

function updateWordDisplay() {
    const puzzle = puzzles[currentPuzzle % puzzles.length];
    let display = '';
    for (let i = 0; i < puzzle.word.length; i++) {
        display += (selected[i] || '_') + ' ';
    }
    wordDisplay.textContent = display.trim();
}

function checkAnswer() {
    const puzzle = puzzles[currentPuzzle % puzzles.length];
    if (selected.length === puzzle.word.length) {
        const guess = selected.join('');
        if (guess === puzzle.word) {
            score += 10;
            level = Math.floor(score / 50) + 1;
            scoreElement.textContent = score;
            levelElement.textContent = level;
            GameUtils.playSound(523, 0.3);
            
            if (score > highScore) {
                GameUtils.saveHighScore('picsword', score);
                highScoreElement.textContent = score;
            }
            
            setTimeout(() => {
                currentPuzzle++;
                loadPuzzle();
            }, 1000);
        }
    }
}

function showHint() {
    const puzzle = puzzles[currentPuzzle % puzzles.length];
    const hintIndex = Math.floor(Math.random() * puzzle.word.length);
    if (!selected[hintIndex]) {
        const letter = puzzle.word[hintIndex];
        const btn = Array.from(lettersGrid.children).find(b => b.textContent === letter && !b.classList.contains('used'));
        if (btn) {
            selectLetter(letter, btn);
        }
    }
}

nextBtn.addEventListener('click', () => {
    currentPuzzle++;
    loadPuzzle();
});

hintBtn.addEventListener('click', () => {
    showHint();
});

// Initialize
loadPuzzle();

