// Main script for homepage
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dark mode
    const darkModeToggle = document.getElementById('darkModeToggle');
    const themeIcon = darkModeToggle.querySelector('.theme-icon');
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    // Dark mode toggle
    darkModeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    
    // Load high scores for all games
    loadHighScores();
    
    // Game card navigation
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            const gameName = card.getAttribute('data-game');
            window.location.href = `games/${gameName}/${gameName}.html`;
        });
    });
});

// Function to load high scores from localStorage
function loadHighScores() {
    const games = ['snake', 'tictactoe', 'flappy', 'pong', 'memory', 'breakout', 'rps', 'minesweeper', 'whackamole', '2048', 'racing', 'math', 'wordle', 'picsword', 'sliding', 'bubble', 'dart', 'colorswitch'];
    
    games.forEach(game => {
        const scoreKey = `${game}_highscore`;
        const score = localStorage.getItem(scoreKey);
        const element = document.getElementById(`${game}-highscore`);
        
        if (element) {
            if (score) {
                if (game === 'memory' || game === 'minesweeper') {
                    // Time-based scores
                    element.textContent = formatTime(parseInt(score));
                } else {
                    element.textContent = score;
                }
            } else {
                element.textContent = game === 'memory' || game === 'minesweeper' ? '--' : '0';
            }
        }
    });
}

// Format time in seconds to MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Shared utility functions
const GameUtils = {
    // Save high score
    saveHighScore(gameName, score) {
        const key = `${gameName}_highscore`;
        const currentHigh = parseInt(localStorage.getItem(key)) || 0;
        
        if (score > currentHigh) {
            localStorage.setItem(key, score.toString());
            return true; // New high score!
        }
        return false;
    },
    
    // Save time-based high score (lower is better)
    saveBestTime(gameName, time) {
        const key = `${gameName}_highscore`;
        const currentBest = parseInt(localStorage.getItem(key));
        
        if (!currentBest || time < currentBest) {
            localStorage.setItem(key, time.toString());
            return true; // New best time!
        }
        return false;
    },
    
    // Play sound effect (using Web Audio API)
    playSound(frequency, duration, type = 'sine') {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            // Fallback if audio context not available
            console.log('Audio not available');
        }
    },
    
    // Apply theme from localStorage
    applyTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    }
};

// Make GameUtils available globally
window.GameUtils = GameUtils;

