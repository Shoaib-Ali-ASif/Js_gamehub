const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let player, obstacles, score, speed, running;

function startGame() {
  player = { x: 180, y: 430, w: 40, h: 40 };
  obstacles = [];
  score = 0;
  speed = 3;
  running = true;
  loop();
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") player.x -= 40;
  if (e.key === "ArrowRight") player.x += 40;
});

function loop() {
  if (!running) return;
  ctx.clearRect(0,0,400,500);

  // player
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // obstacles
  if (Math.random() < 0.03) {
    obstacles.push({ x: Math.random()*360, y: 0, w: 40, h: 40 });
  }

  obstacles.forEach(o => {
    o.y += speed;
    ctx.fillStyle = "red";
    ctx.fillRect(o.x,o.y,o.w,o.h);

    if (o.y > 500) score++;
    if (collision(player,o)) endGame();
  });

  document.getElementById("score").textContent = score;
  speed += 0.001;
  requestAnimationFrame(loop);
}

function collision(a,b){
  return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
}

function endGame(){
  running=false;
  const best = localStorage.getItem("runner_highscore") || 0;
  if(score>best) localStorage.setItem("runner_highscore",score);
  alert("Game Over! Score: "+score);
}
