const {
  Engine, Render, Runner, World, Bodies, Body,
  Constraint, Mouse, MouseConstraint, Events
} = Matter;

/* ================= UI ================= */
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const levelEl = document.getElementById("level");
const resetBtn = document.getElementById("resetBtn");
const nextLevelBtn = document.getElementById("nextLevelBtn");

/* ================= STATE ================= */
let score = 0;
let level = 1;
let highScore = Number(localStorage.getItem("slingshotHighScore")) || 0;
let launched = false;

scoreEl.textContent = score;
highScoreEl.textContent = highScore;
levelEl.textContent = level;

/* ================= ENGINE ================= */
const engine = Engine.create();
const world = engine.world;

const render = Render.create({
  canvas: document.getElementById("game"),
  engine,
  options: {
    width: 1000,
    height: 500,
    wireframes: false,
    background: "#87CEEB"
  }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);
const ctx = render.context;

/* ================= WORLD ================= */
const ground = Bodies.rectangle(2000, 480, 4000, 40, {
  isStatic: true,
  render: { fillStyle: "#654321" }
});

const poleHeight = 110;
const groundY = 463;

const pole = Bodies.rectangle(200, groundY - poleHeight / 2, 12, poleHeight, {
  isStatic: true,
  render: { fillStyle: "#654321" }
});



let bird = Bodies.circle(200, 320, 20, {
  density: 0.004,
  restitution: 0.8,
  frictionAir: 0.01,
  render: { fillStyle: "red" }
});

let sling = Constraint.create({
  pointA: { x: 200, y: 320 },
  bodyB: bird,
  stiffness: 0.05,
  length: 0,
  render: { visible: false }
});

World.add(world, [ground, pole, bird, sling]);

/* ================= MOUSE ================= */
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse,
  constraint: {
    stiffness: 0.08,
    render: { visible: false }
  }
});
World.add(world, mouseConstraint);

/* 🚫 PREVENT FREE THROW */
Events.on(mouseConstraint, "startdrag", e => {
  if (e.body !== bird || launched) {
    mouseConstraint.constraint.bodyB = null;
  }
});

/* ================= LEVELS ================= */
let blocks = [];

const levels = [
  () => [
    createBlock(700, 420),
    createBlock(760, 420),
    createBlock(730, 360)
  ]
];

function createBlock(x, y) {
  const block = Bodies.rectangle(x, y, 60, 60, {
    health: 100,
    render: { fillStyle: "#888" }
  });
  World.add(world, block);
  return block;
}

function loadLevel() {
  blocks.forEach(b => World.remove(world, b));
  blocks = levels[0]();
}

/* ================= SLINGSHOT ================= */

// LIMIT PULL
Events.on(engine, "beforeUpdate", () => {
  if (sling.bodyB && !launched) {
    const dx = bird.position.x - sling.pointA.x;
    const dy = bird.position.y - sling.pointA.y;
    const dist = Math.hypot(dx, dy);
    const maxPull = 120;

    if (dist > maxPull) {
      Body.setPosition(bird, {
        x: sling.pointA.x + (dx / dist) * maxPull,
        y: sling.pointA.y + (dy / dist) * maxPull
      });
    }
  }
});

// RELEASE
Events.on(mouseConstraint, "enddrag", e => {
  if (e.body === bird && !launched) {
    const dx = sling.pointA.x - bird.position.x;
    const dy = sling.pointA.y - bird.position.y;

    const launchPower = 0.15; 

    Body.setVelocity(bird, {
      x: dx * launchPower,
      y: dy * launchPower
    });

    sling.bodyB = null;
    launched = true;

    mouseConstraint.constraint.bodyB = null;
  }
});


/* ================= COLLISION ================= */
Events.on(engine, "collisionStart", e => {
  e.pairs.forEach(p => {
    [p.bodyA, p.bodyB].forEach(b => {
      if (b.health) {
        b.health -= 30;
        score += 10;
        scoreEl.textContent = score;
        if (b.health <= 0) {
          World.remove(world, b);
        }
      }
    });
  });
});

/* ================= CAMERA ================= */
Events.on(engine, "afterUpdate", () => {
  if (bird.position.x > 400) {
    render.bounds.min.x = bird.position.x - 400;
    render.bounds.max.x = bird.position.x + 600;
  }

  if (launched && bird.speed < 0.3) {
    setTimeout(resetBird, 1000);
  }
});

/* ================= ROPE DRAW ================= */
function drawRope() {
  if (!sling.bodyB) return;

  const a = sling.pointA;
  const b = bird.position;
  const offset = 8;

  ctx.lineWidth = 5;
  ctx.strokeStyle = "#2b1b10";

  ctx.beginPath();
  ctx.moveTo(a.x - offset, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(a.x + offset, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

Events.on(render, "afterRender", drawRope);

/* ================= CONTROLS ================= */
function resetBird() {
  Body.setPosition(bird, { x: 200, y: 320 });
  Body.setVelocity(bird, { x: 0, y: 0 });
  Body.setAngularVelocity(bird, 0);

  sling.bodyB = bird;
  launched = false;

  render.bounds.min.x = 0;
  render.bounds.max.x = 1000;
}

resetBtn.onclick = resetBird;
nextLevelBtn.onclick = () => {
  resetBird();
  loadLevel();
};

/* ================= SCORE SAVE ================= */
setInterval(() => {
  if (score > highScore) {
    highScore = score;
    highScoreEl.textContent = highScore;
    localStorage.setItem("slingshotHighScore", highScore);
  }
}, 500);

/* ================= INIT ================= */
loadLevel();
