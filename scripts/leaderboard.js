// Leaderboard Page
document.addEventListener('DOMContentLoaded', () => {
    const leaderboardGrid = document.getElementById('leaderboardGrid');
    const clearAllBtn = document.getElementById('clearAllBtn');
    
    const games = [
        { name: 'Snake', icon: '🐍', key: 'snake_highscore', type: 'Score' },
        { name: 'Tic-Tac-Toe', icon: '⭕', key: 'tictactoe_highscore', type: 'Wins' },
        { name: 'Flappy Bird', icon: '🐦', key: 'flappy_highscore', type: 'Score' },
        { name: 'Pong', icon: '🏓', key: 'pong_highscore', type: 'Score' },
        { name: 'Memory Cards', icon: '🧠', key: 'memory_highscore', type: 'Best Time' },
        { name: 'Breakout', icon: '💥', key: 'breakout_highscore', type: 'Score' },
        { name: 'Rock Paper Scissors', icon: '✂️', key: 'rps_highscore', type: 'Wins' },
        { name: 'Minesweeper', icon: '💣', key: 'minesweeper_highscore', type: 'Best Time' },
        { name: 'Whack-a-Mole', icon: '🔨', key: 'whackamole_highscore', type: 'Score' },
        { name: '2048', icon: '🔢', key: '2048_highscore', type: 'Score' },
        { name: 'Mini Racing', icon: '🏎️', key: 'racing_highscore', type: 'Score' },
        { name: 'Math Challenge', icon: '🔢', key: 'math_highscore', type: 'Score' },
        { name: 'Wordle', icon: '📝', key: 'wordle_highscore', type: 'Wins' },
        { name: '4 Pics 1 Word', icon: '🖼️', key: 'picsword_highscore', type: 'Score' },
        { name: 'Sliding Puzzle', icon: '🧩', key: 'sliding_highscore', type: 'Best Time' },
        { name: 'Bubble Shooter', icon: '🎯', key: 'bubble_highscore', type: 'Score' },
        { name: 'Dart Throwing', icon: '🎯', key: 'dart_highscore', type: 'Score' },
        { name: 'Color Switch', icon: '🌈', key: 'colorswitch_highscore', type: 'Score' }
    ];
    
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    function displayLeaderboard() {
        leaderboardGrid.innerHTML = '';
        
        games.forEach(game => {
            const score = localStorage.getItem(game.key);
            let displayValue = '--';
            
            if (score) {
                if (game.type === 'Best Time') {
                    displayValue = formatTime(parseInt(score));
                } else {
                    displayValue = score;
                }
            }
            
            const card = document.createElement('div');
            card.className = 'leaderboard-card';
            card.innerHTML = `
                <div class="leaderboard-card-header">
                    <span class="leaderboard-card-icon">${game.icon}</span>
                    <h3 class="leaderboard-card-title">${game.name}</h3>
                </div>
                <div class="leaderboard-card-score">
                    <div class="score-label">${game.type}</div>
                    <div class="score-value">${displayValue}</div>
                    <div class="score-type">${game.type}</div>
                </div>
            `;
            
            leaderboardGrid.appendChild(card);
        });
    }
    
    clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all high scores? This action cannot be undone.')) {
            games.forEach(game => {
                localStorage.removeItem(game.key);
            });
            displayLeaderboard();
            alert('All high scores have been cleared!');
        }
    });
    
    // Initial display
    displayLeaderboard();
});

