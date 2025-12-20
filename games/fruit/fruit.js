const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let fruits = [];
let score = 0;

canvas.addEventListener("mousemove", slice);

setInterval(() => {
  fruits.push({
    x: Math.random()*360,
    y: 500,
    r: 20,
    vy: Math.random()*-5 - 8
  });
}, 800);

function slice(e){
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  fruits = fruits.filter(f => {
    const hit = Math.hypot(mx-f.x,my-f.y)<f.r;
    if(hit) score++;
    return !hit;
  });
}

function loop(){
  ctx.clearRect(0,0,400,500);
  ctx.fillStyle="white";
  ctx.fillText("Score: "+score,10,20);

  fruits.forEach(f=>{
    f.y += f.vy;
    f.vy += 0.2;
    ctx.beginPath();
    ctx.arc(f.x,f.y,f.r,0,Math.PI*2);
    ctx.fillStyle="orange";
    ctx.fill();
  });

  fruits = fruits.filter(f=>f.y<520);
  requestAnimationFrame(loop);
}
loop();

window.onbeforeunload = () => {
  const best = localStorage.getItem("fruit_highscore") || 0;
  if(score>best) localStorage.setItem("fruit_highscore",score);
};
