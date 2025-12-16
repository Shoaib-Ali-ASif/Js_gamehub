# JavaScript Game Hub

A comprehensive collection of 10 browser-based games built with HTML5, CSS3, and JavaScript. Each game features full mechanics, scoring systems, high score tracking, animations, and mobile-friendly controls.

## 🎮 Games Included

1. **Snake** - Classic snake game with growing mechanics and increasing difficulty
2. **Tic-Tac-Toe** - Play against AI or a friend with smart AI opponent
3. **Flappy Bird** - Navigate through obstacles with physics-based gameplay
4. **Pong** - Classic arcade paddle game for two players
5. **Memory Card Game** - Test your memory with matching card pairs
6. **Breakout** - Break all the bricks with the paddle
7. **Rock Paper Scissors** - Classic game with animations
8. **Minesweeper** - Find all mines safely with flagging system
9. **Whack-a-Mole** - Hit the moles quickly in this timed game
10. **2048** - Merge tiles to reach 2048

## ✨ Features

- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Dark Mode Toggle** - Switch between light and dark themes
- **High Score Tracking** - All games save high scores using localStorage
- **Shared Leaderboard** - View all high scores in one place
- **Sound Effects** - Audio feedback using Web Audio API
- **Animations** - Smooth transitions and visual effects
- **Mobile Controls** - Touch-friendly controls for mobile devices
- **Unified Theme** - Consistent design across all games

## 🚀 Getting Started

1. Clone or download this repository
2. Open `index.html` in a web browser
3. Start playing!

No build process or dependencies required - just open and play!

## 📁 Project Structure

```
Js_gamehub/
├── index.html              # Homepage
├── leaderboard.html         # Leaderboard page
├── styles/
│   ├── main.css            # Main stylesheet
│   └── leaderboard.css     # Leaderboard styles
├── scripts/
│   ├── main.js             # Main JavaScript utilities
│   └── leaderboard.js      # Leaderboard functionality
└── games/
    ├── snake/              # Snake game files
    ├── tictactoe/          # Tic-Tac-Toe game files
    ├── flappy/             # Flappy Bird game files
    ├── pong/               # Pong game files
    ├── memory/             # Memory Card game files
    ├── breakout/           # Breakout game files
    ├── rps/                # Rock Paper Scissors game files
    ├── minesweeper/        # Minesweeper game files
    ├── whackamole/         # Whack-a-Mole game files
    └── 2048/               # 2048 game files
```

Each game has its own directory with:
- `[gamename].html` - Game HTML file
- `[gamename].css` - Game-specific styles
- `[gamename].js` - Game logic and mechanics

## 🎯 Game Controls

### Snake
- **Desktop**: Arrow keys or WASD
- **Mobile**: On-screen directional buttons

### Tic-Tac-Toe
- Click on cells to place your mark
- Switch between AI and 2-player mode

### Flappy Bird
- **Desktop**: Click or press SPACE
- **Mobile**: Tap to flap

### Pong
- **Player 1**: W (up) / S (down)
- **Player 2**: Arrow Up / Arrow Down

### Memory Cards
- Click cards to flip and match pairs

### Breakout
- **Desktop**: Mouse or Arrow keys
- **Mobile**: Touch to move paddle

### Rock Paper Scissors
- Click your choice (Rock, Paper, or Scissors)

### Minesweeper
- **Left Click**: Reveal cell
- **Right Click**: Flag/unflag cell

### Whack-a-Mole
- Click on moles as they appear

### 2048
- **Desktop**: Arrow keys
- **Mobile**: Swipe gestures

## 💾 Data Storage

All high scores are stored in the browser's localStorage. To clear all scores, visit the Leaderboard page and click "Clear All Scores".

## 🎨 Customization

The theme can be customized by modifying CSS variables in `styles/main.css`:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --accent-color: #ec4899;
    /* ... more variables */
}
```

## 🌐 Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## 📝 License

This project is open source and available for educational purposes.

## 🛠️ Technologies Used

- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript (ES6+)
- Canvas API (for some games)
- Web Audio API (for sound effects)
- localStorage API (for high scores)

## 🎓 Learning Resources

This project demonstrates:
- DOM manipulation
- Event handling
- Canvas graphics
- Game loop patterns
- State management
- Responsive design
- Local storage
- CSS animations
- Mobile-first design

Enjoy playing! 🎮

