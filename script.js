const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const scoreEl = document.getElementById("score");
const wavePath = document.getElementById("wave-path");

let isJumping = false;
let isGameStarted = false;
const startMessage = document.getElementById("start-message");
let score = 0;
let gameOver = false;

const width = 120;
const height = 60;
const segments = 40;

document.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    if (!isGameStarted) {
      startGame();
    } else if (!isJumping && !gameOver) {
      jump();
    }
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



const obstacleX = obstacle.getBoundingClientRect().left / window.innerWidth * width;
const i = Math.floor((obstacleX / width) * segments);
const waveYObstacle =
  height / 2 +
  Math.sin(t + i * 0.5) * 5 +
  Math.cos(t * 0.7 + i) * 3;

obstacle.style.bottom = `${waveYObstacle - 24}px`; 



  requestAnimationFrame(animateChurningWave);
}

 animateChurningWave();




function moveObstacle() {
  let obstacleX = window.innerWidth; 
  obstacle.style.left = obstacleX + 'px';

  const speed = window.innerWidth / 2000 * 20; 
  const obstacleInterval = setInterval(() => {
    if (gameOver) {
      clearInterval(obstacleInterval);
      return;
    }

    obstacleX -= speed;
    obstacle.style.left = obstacleX + 'px';

    if (obstacleX < -50) {
      obstacleX = window.innerWidth;
    }
  }, 30);
}



function getCoralPolygon(obstacleEl) {
  const rect = obstacleEl.getBoundingClientRect();
  const x = rect.left;
  const y = rect.top;

  
  const points = [
    new SAT.Vector(x + 10, y + 10),
    new SAT.Vector(x + 30, y + 0),
    new SAT.Vector(x + 50, y + 20),
    new SAT.Vector(x + 55, y + 40),
    new SAT.Vector(x + 45, y + 80),
    new SAT.Vector(x + 25, y + 100),
    new SAT.Vector(x + 5, y + 90),
    new SAT.Vector(x + 0, y + 60)
  ];

  return new SAT.Polygon(new SAT.Vector(0, 0), points);
}


function getPlayerPolygon(playerEl) {
  const rect = playerEl.getBoundingClientRect();
  const x = rect.left;
  const y = rect.top;


  const points = [
    new SAT.Vector(x + 20, y + 10),
    new SAT.Vector(x + 120, y + 10),
    new SAT.Vector(x + 120, y + 140),
    new SAT.Vector(x + 20, y + 140)
  ];

  return new SAT.Polygon(new SAT.Vector(0, 0), points);
}


function startGame() {
  isGameStarted = true;
  startMessage.style.display = "none";

  moveObstacle();         

  gameLoop = setInterval(() => {
    if (gameOver) return;

    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    function checkPolygonCollision(playerEl, obstacleEl) {
      const playerPoly = getPlayerPolygon(playerEl);
      const coralPoly = getCoralPolygon(obstacleEl);

      const response = new SAT.Response();
      return SAT.testPolygonPolygon(playerPoly, coralPoly, response);
    }

    if (checkPolygonCollision(player, obstacle)) {
      alert("Game Over! Score: " + score);
      gameOver = true;
      clearInterval(gameLoop);
      location.reload();
    } else {
      score++;
      scoreEl.textContent = "Score: " + score;
    }
  }, 50);
}



