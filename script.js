const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const scoreEl = document.getElementById("score");

let isJumping = false;
let score = 0;
let gameOver = false;

// Jump logic
document.addEventListener("keydown", function (e) {
  if (e.code === "Space" && !isJumping && !gameOver) {
    jump();
  }
});

function jump() {
  isJumping = true;
  let position = 0;
  let upInterval = setInterval(() => {
    if (position >= 150) {
      clearInterval(upInterval);
      let downInterval = setInterval(() => {
        if (position <= 0) {
          clearInterval(downInterval);
          isJumping = false;
        }
        position -= 5;
        player.style.bottom = position + "px";
      }, 20);
    }
    position += 5;
    player.style.bottom = position + "px";
  }, 20);
}


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
