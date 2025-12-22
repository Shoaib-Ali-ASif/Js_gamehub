/* ----------------- BASIC SETUP ----------------- */
const container = document.getElementById("game3d");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

/* ----------------- LIGHTS ----------------- */
scene.add(new THREE.AmbientLight(0x404040));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

/* ----------------- GROUND ----------------- */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x2ecc71 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

/* ----------------- CANNON ----------------- */
const cannon = new THREE.Mesh(
  new THREE.CylinderGeometry(0.5, 0.5, 4),
  new THREE.MeshStandardMaterial({ color: 0x333 })
);
cannon.rotation.z = Math.PI / 2;
cannon.position.set(-10, 1, 0);
scene.add(cannon);

/* ----------------- GAME STATE ----------------- */
let balls = [];
let targets = [];
let gravity = -0.01;

let score = 0;
let level = 1;
let shotsLeft = 10;

/* ----------------- UI UPDATE ----------------- */
function updateUI() {
  scoreEl.innerText = score;
  levelEl.innerText = level;
  shotsEl.innerText = shotsLeft;
}

const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const shotsEl = document.getElementById("shots");

/* ----------------- TARGETS ----------------- */
function addTarget(x, z) {
  const target = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({ color: 0xe74c3c })
  );
  target.position.set(x, 1, z);
  scene.add(target);
  targets.push(target);
}

function spawnTargets() {
  targets.forEach((t) => scene.remove(t));
  targets = [];

  for (let i = 0; i < level + 2; i++) {
    addTarget(6 + i * 3, i % 2 === 0 ? 2 : -2);
  }
}

/* ----------------- SOUNDS ----------------- */
const sounds = {};
["shoot", "explosion", "win"].forEach((name) => {
  sounds[name] = new Audio(`sounds/${name}.wav`);
});

function playSound(name) {
  sounds[name].currentTime = 0;
  sounds[name].play();
}

/* ----------------- SHOOT ----------------- */
window.addEventListener("click", () => {
  if (shotsLeft <= 0) return;

  const power = document.getElementById("powerSlider").value / 100;

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x000 })
  );

  ball.position.set(-8, 1, 0);
  ball.velocity = new THREE.Vector3(0.6 * power, 0.4 * power, 0);

  scene.add(ball);
  balls.push(ball);

  shotsLeft--;
  updateUI();
  playSound("shoot");
});

/* ----------------- EXPLOSION ----------------- */
function explosion(pos) {
  for (let i = 0; i < 8; i++) {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(0.1),
      new THREE.MeshStandardMaterial({ color: 0xffa500 })
    );

    p.position.copy(pos);
    p.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.3,
      Math.random() * 0.3,
      (Math.random() - 0.5) * 0.3
    );

    scene.add(p);
    setTimeout(() => scene.remove(p), 500);
  }
}

/* ----------------- LEADERBOARD ----------------- */
function saveScore() {
  let scores = JSON.parse(localStorage.getItem("cannonScores")) || [];
  scores.push({ score, date: new Date().toLocaleDateString() });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem("cannonScores", JSON.stringify(scores.slice(0, 10)));
}

/* ----------------- GAME LOOP ----------------- */
camera.position.set(0, 10, 20);
camera.lookAt(0, 0, 0);

function animate() {
  requestAnimationFrame(animate);

  balls.forEach((ball, i) => {
    ball.velocity.y += gravity;
    ball.position.add(ball.velocity);

    if (ball.position.y < 0) {
      scene.remove(ball);
      balls.splice(i, 1);
    }

    targets.forEach((t, j) => {
      if (ball.position.distanceTo(t.position) < 1.5) {
        explosion(t.position);
        playSound("explosion");

        scene.remove(t);
        scene.remove(ball);

        targets.splice(j, 1);
        balls.splice(i, 1);

        score += 100;
        updateUI();

        if (targets.length === 0) {
          playSound("win");

          // ✅ SAVE HIGH SCORE TO GAME HUB SYSTEM
          GameUtils.saveHighScore("cannon-ball", score);

          level++;
          shotsLeft = 10 + level * 2;
          spawnTargets();
          updateUI();
        }
      }
    });
  });

  renderer.render(scene, camera);
}

spawnTargets();
updateUI();
animate();

/* ----------------- RESIZE ----------------- */
window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});
