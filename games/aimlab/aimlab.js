const canvas = document.getElementById("aimCanvas");
const ctx = canvas.getContext("2d");

// Sounds
const hitSound = new Audio("sounds/hit.mp3");
const missSound = new Audio("sounds/miss.mp3");

// Game State
let targets = [];
let score = 0;
let clicks = 0;
let hits = 0;
let timeLeft = 30;
let running = false;
let timer;

let ammo = 12;
const maxAmmo = 12;

// Events
canvas.addEventListener("click", shoot);
document.addEventListener("keydown", reload);

// Start Game
function startGame() {
    resetGame();
    running = true;
    spawnTargets();

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("time").textContent = timeLeft;
        if (timeLeft <= 0) endGame();
    }, 1000);
}

// Reset
function resetGame() {
    clearInterval(timer);
    score = clicks = hits = 0;
    timeLeft = 30;
    ammo = maxAmmo;
    targets = [];
    running = false;
    updateUI();
    draw();
}

// Spawn 3 Static Targets
function spawnTargets() {
    targets = [];
    for (let i = 0; i < 3; i++) {
        targets.push({
            x: Math.random() * (canvas.width - 60) + 30,
            y: Math.random() * (canvas.height - 60) + 30,
            r: 18,
            color: randomColor()
        });
    }
}


// Shooting Logic
function shoot(e) {
    if (!running || ammo <= 0) return;

    ammo--;
    clicks++;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let hit = false;

    for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        const dist = Math.hypot(mx - t.x, my - t.y);
        if (dist < t.r) {
            hits++;
            score += 10;
            hit = true;
            hitSound.currentTime = 0;
            hitSound.play();

            // Remove only this target
            targets.splice(i, 1);

            // Spawn 1 new target to replace it
            targets.push({
                x: Math.random() * (canvas.width - 60) + 30,
                y: Math.random() * (canvas.height - 60) + 30,
                r: 18,
                color: randomColor()
            });

            break; // Stop checking other targets
        }
    }

    if (!hit) {
        missSound.currentTime = 0;
        missSound.play();
    }

    updateUI();
}



// Reload
function reload(e) {
    if (e.key.toLowerCase() === "r") {
        ammo = maxAmmo;
        updateUI();
    }
}

// UI Update
function updateUI() {
    document.getElementById("score").textContent = score;
    document.getElementById("ammo").textContent = ammo;
    document.getElementById("accuracy").textContent =
        clicks === 0 ? "100%" : Math.round((hits / clicks) * 100) + "%";
}

// Draw Targets
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    targets.forEach(t => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fillStyle = t.color;
        ctx.fill();
    });

    requestAnimationFrame(draw);
}

// Random Color
function randomColor() {
    const colors = ["#ff4d4d", "#4dff4d", "#4dd2ff", "#ffd24d", "#c77dff"];
    return colors[Math.floor(Math.random() * colors.length)];
}

// End Game
function endGame() {
    running = false;
    clearInterval(timer);

    const best = localStorage.getItem("aimlab_highscore") || 0;
    if (score > best) {
        localStorage.setItem("aimlab_highscore", score);
    }

    alert(
        `Time's Up!\n\nScore: ${score}\nAccuracy: ${Math.round((hits / clicks) * 100)}%`
    );
}

draw();
