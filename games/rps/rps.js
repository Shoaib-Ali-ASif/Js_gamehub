// Rock Paper Scissors Game
GameUtils.applyTheme();

const playerChoiceElement = document.getElementById('playerChoice');
const computerChoiceElement = document.getElementById('computerChoice');
const resultMessage = document.getElementById('resultMessage');
const winsElement = document.getElementById('wins');
const lossesElement = document.getElementById('losses');
const drawsElement = document.getElementById('draws');
const resetBtn = document.getElementById('resetBtn');
const choiceButtons = document.querySelectorAll('.choice-btn');

const choices = {
    rock: '🪨',
    paper: '📄',
    scissors: '✂️'
};

let wins = 0;
let losses = 0;
let draws = 0;

// Load wins from localStorage
const savedWins = parseInt(localStorage.getItem('rps_highscore')) || 0;
wins = savedWins;
winsElement.textContent = wins;

function getComputerChoice() {
    const choicesArray = Object.keys(choices);
    return choicesArray[Math.floor(Math.random() * choicesArray.length)];
}

function determineWinner(player, computer) {
    if (player === computer) {
        return 'draw';
    }
    
    if (
        (player === 'rock' && computer === 'scissors') ||
        (player === 'paper' && computer === 'rock') ||
        (player === 'scissors' && computer === 'paper')
    ) {
        return 'win';
    }
    
    return 'lose';
}

function playRound(playerChoice) {
    const computerChoice = getComputerChoice();
    
    // Animate choices
    playerChoiceElement.textContent = choices[playerChoice];
    playerChoiceElement.classList.add('animate');
    computerChoiceElement.textContent = choices[computerChoice];
    computerChoiceElement.classList.add('animate');
    
    setTimeout(() => {
        playerChoiceElement.classList.remove('animate');
        computerChoiceElement.classList.remove('animate');
    }, 500);
    
    const result = determineWinner(playerChoice, computerChoice);
    
    setTimeout(() => {
        if (result === 'win') {
            wins++;
            winsElement.textContent = wins;
            GameUtils.saveHighScore('rps', wins);
            resultMessage.textContent = 'You Win! 🎉';
            resultMessage.className = 'result-message win';
            GameUtils.playSound(523, 0.3);
        } else if (result === 'lose') {
            losses++;
            lossesElement.textContent = losses;
            resultMessage.textContent = 'You Lose! 😢';
            resultMessage.className = 'result-message lose';
            GameUtils.playSound(200, 0.3);
        } else {
            draws++;
            drawsElement.textContent = draws;
            resultMessage.textContent = "It's a Draw! 🤝";
            resultMessage.className = 'result-message draw';
            GameUtils.playSound(350, 0.2);
        }
    }, 300);
}

choiceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const choice = btn.getAttribute('data-choice');
        playRound(choice);
        GameUtils.playSound(440, 0.1);
    });
});

resetBtn.addEventListener('click', () => {
    wins = 0;
    losses = 0;
    draws = 0;
    winsElement.textContent = wins;
    lossesElement.textContent = losses;
    drawsElement.textContent = draws;
    playerChoiceElement.textContent = '❓';
    computerChoiceElement.textContent = '❓';
    resultMessage.textContent = '';
    resultMessage.className = 'result-message';
    localStorage.setItem('rps_highscore', '0');
});

