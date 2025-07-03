const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const scoreEl = document.getElementById("score");
const wavePath = document.getElementById("wave-path");

let isJumping = false;
let score = 0;
let gameOver = false;

const width = 120;
const height = 60;
const segments = 40;

document.addEventListener("keydown", function (e) {
  if (e.code === "Space" && !isJumping && !gameOver) {
    jump();
  }
});

function jump() {
  isJumping = true;
  let position = parseInt(player.style.bottom) || 60;
  const maxJump = position + 250;

  
  let upInterval = setInterval(() => {
    if (position >= maxJump) {
      clearInterval(upInterval);

      
      let downInterval = setInterval(() => {
        const waveY = getWaveYAtPlayer();
        if (position <= waveY) {
          clearInterval(downInterval);
          isJumping = false;
        } else {
          position -= 15;
          player.style.bottom = position + "px";
        }
      }, 20);
    } else {
      position += 15;
      player.style.bottom = position + "px";
    }
  }, 20);
}

function getWaveYAtPlayer(t = Date.now() / 500) {
  const playerX = 50 / window.innerWidth * width; // 50px is player left
  const i = Math.floor((playerX / width) * segments);
  return (
    height / 2 +
    Math.sin(t + i * 0.5) * 5 +
    Math.cos(t * 0.7 + i) * 3
  );
}

function animateChurningWave() {
  const t = Date.now() / 500;
  let path = `M0 ${height / 2} `;

  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const y =
      height / 2 +
      Math.sin(t + i * 0.5) * 5 +
      Math.cos(t * 0.7 + i) * 3;
    path += `L${x} ${y} `;
  }

  
  path += `L${width} ${height} L0 ${height} Z`;
  wavePath.setAttribute("d", path);

 if (!isJumping) {
  const waveY = getWaveYAtPlayer(t);
  player.style.bottom = (waveY - 30) + "px"; 
}


  requestAnimationFrame(animateChurningWave);
}

animateChurningWave();

let gameLoop = setInterval(() => {
  if (gameOver) return;

  const playerRect = player.getBoundingClientRect();
  const obstacleRect = obstacle.getBoundingClientRect();

  const isColliding =
    playerRect.left < obstacleRect.right &&
    playerRect.right > obstacleRect.left &&
    playerRect.top < obstacleRect.bottom &&
    playerRect.bottom > obstacleRect.top;

  if (isColliding) {
    alert("Game Over! Score: " + score);
    gameOver = true;
    clearInterval(gameLoop);
    location.reload();
  } else {
    score++;
    scoreEl.textContent = "Score: " + score;
  }
}, 50);
