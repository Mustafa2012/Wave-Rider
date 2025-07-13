const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const wavePath = document.getElementById("wave-path");

const jumpSound = new Audio("jump.wav");
const splashSound = new Audio("splash.wav");
const gameOverSound = new Audio("gameover.wav");
const backgroundMusic = new Audio("background.wav");
backgroundMusic.loop = true;         
backgroundMusic.volume = 0.8;        



let isJumping = false;
let isGameStarted = false;
const startMessage = document.getElementById("start-message");
let score = 0;
let gameOver = false;
let gameLoop = null;



const width = 120;
const height = 60;
const segments = 40;





document.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    if (!isGameStarted) {
      splashSound.load();
      jumpSound.load();
      backgroundMusic.load();
      gameOverSound.load();
      startGame();
    } else if (!gameOver) {
      jump(); 
    }
  }
});



let upInterval = null;
let downInterval = null;

function jump() {
  let position = parseInt(player.style.bottom) || 60;

  
  if (!isJumping) {
    isJumping = true;
    jumpSound.currentTime = 0; 
    jumpSound.play();

    const maxJump = position + 250;

    clearInterval(upInterval);
    clearInterval(downInterval);

    upInterval = setInterval(() => {
      if (position >= maxJump) {
        clearInterval(upInterval);
        startFall(position);
      } else {
        position += 15;
        player.style.bottom = position + "px";
      }
    }, 20);
  } else {
    
    if (upInterval) clearInterval(upInterval);
    if (downInterval) clearInterval(downInterval);
    startFall(parseInt(player.style.bottom) || 60, true); 
  }
}

function startFall(startPos, slam = false) {
  let position = startPos;
  const fallSpeed = slam ? 1 : 2000;

 let downInterval = setInterval(() => {
  const waveY = getWaveYAtPlayer();
  if (position <= waveY) {
    clearInterval(downInterval);
    isJumping = false;
    player.style.bottom = (waveY - 30) + "px"; 

    if (slam) {
        const rect = player.getBoundingClientRect();
const playerX = rect.left + rect.width / 2;  
const playerY = rect.bottom;                  
triggerSplash(playerX, playerY);
splashSound.currentTime = 0;
splashSound.play();



    }
  } else {
    position -= 15;
    player.style.bottom = position + "px";
  }
}, 20);

}


function getWaveYAtPlayer(t = Date.now() / 500) {
  const playerX = 50 / window.innerWidth * width; 
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
  const offset = new SAT.Vector(rect.left, rect.top);

  const points = [
    new SAT.Vector(20, 10),
    new SAT.Vector(120, 10),
    new SAT.Vector(120, 140),
    new SAT.Vector(20, 140)
  ];

  return new SAT.Polygon(offset, points);
}



function startGame() {
  isGameStarted = true;
  startMessage.style.display = "none";

   backgroundMusic.play();

  spawnObstacles();      
  moveObstacles();       

  gameLoop = setInterval(() => {
    if (gameOver) return;

    const playerPoly = getPlayerPolygon(player);

    for (let obj of activeObstacles) {
      const coralPoly = getCoralPolygon(obj.el);
      const response = new SAT.Response();
      if (SAT.testPolygonPolygon(playerPoly, coralPoly, response)) {
  clearInterval(gameLoop);
  gameOver = true;
  gameOverSound.play();


  const name = prompt("Game Over! Enter your name:");
saveScore(name || "Anonymous", score);
updateLeaderboard(); 


  setTimeout(() => location.reload(), 2000); // Optional restart
  return;
}
    }


if (score > highScore) {
  highScore = score;
  localStorage.setItem("highScore", highScore);
  document.getElementById("high-score").textContent = "High Score: " + highScore;
}


    score++;
    scoreEl.textContent = "Score: " + score;
  }, 50);
}

const clouds = Array.from(document.querySelectorAll('.cloud'));
const cloudSpeeds = [0.3, 0.2, 0.25, 0.15, 0.1];

let cloudPositions = clouds.map(cloud => {
  return {
    x: parseFloat(cloud.style.left),
    y: parseFloat(cloud.style.top),
    speed: 0.2
  };
});


function moveClouds() {
  clouds.forEach((cloud, i) => {
    let pos = cloudPositions[i];
    pos.x += pos.speed;

    if (pos.x > window.innerWidth + 200) {
      pos.x = -200; 
    }

    cloud.style.left = `${pos.x}px`;
    cloud.style.top = `${pos.y}px`;
  });

  requestAnimationFrame(moveClouds);
}



const obstacleTypes = [
  {
    width: 50,
    height: 70,
    image: "coral1.png",
    bottom: 12
  },
  {
    width: 90,
    height: 60,
    image: "coral2.png",
    bottom: 15
  },
  {
    width: 100,
    height: 87,
    image: "coral3.png",
    bottom: 0.1
  }
];

function createObstacle() {
  const container = document.getElementById("obstacles-container");
  const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");
  obstacle.style.width = `${type.width}px`;
  obstacle.style.height = `${type.height}px`;
  obstacle.style.left = `${window.innerWidth}px`;
  obstacle.style.bottom = `${type.bottom}px`;
  obstacle.style.backgroundImage = `url(${type.image})`;
  obstacle.style.backgroundSize = "contain";
  obstacle.style.backgroundRepeat = "no-repeat";

  
  const img = new Image();
  img.src = type.image;
  img.onload = () => {
    container.appendChild(obstacle);
    activeObstacles.push({ el: obstacle, x: window.innerWidth });
  };

  return obstacle;
}


let activeObstacles = [];

function spawnObstacles() {
  let minDelay = 1500;  
  let maxDelay = 3000;  
  const difficultyIncreaseRate = 0.98;

  function spawn() {
    if (gameOver || !isGameStarted) return;

    const newObstacle = createObstacle();
    activeObstacles.push({ el: newObstacle, x: window.innerWidth });

    
    minDelay = Math.max(500, minDelay * difficultyIncreaseRate);
    maxDelay = Math.max(minDelay + 300, maxDelay * difficultyIncreaseRate);

    const nextDelay = Math.random() * (maxDelay - minDelay) + minDelay;
    setTimeout(spawn, nextDelay);
  }

  spawn(); 
}


function moveObstacles() {
  const speed = window.innerWidth / 2000 * 20;

  activeObstacles.forEach((obj, index) => {
    obj.x -= speed;
    obj.el.style.left = `${obj.x}px`;

    
  });

  requestAnimationFrame(moveObstacles);
}


moveClouds();

function triggerSplash() {
  const container = document.getElementById("splash-container");
  const playerRect = player.getBoundingClientRect();
  const startX = playerRect.left + playerRect.width / 2;
  const startY = playerRect.bottom - 10;

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement("div");
    particle.classList.add("splash-particle");

    const size = Math.random() * 10 + 8;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // Start position
    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;

    // Initial velocity
    const angle = Math.random() * Math.PI - Math.PI / 2;
    const speed = Math.random() * 5 + 2;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;

    let x = startX;
    let y = startY;
    let gravity = 0.4;

    function animate() {
      vy += gravity;
      x += vx;
      y += vy;

      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      if (parseFloat(particle.style.opacity) <= 0) {
        particle.remove();
      } else {
        requestAnimationFrame(animate);
      }
    }

    container.appendChild(particle);
    animate();
  }
}

let highScore = localStorage.getItem("highScore") || 0;
document.getElementById("high-score").textContent = "High Score: " + highScore;


import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const supabase = createClient(
  'https://acgfjifjnglcgkrtuyay.supabase.co',  
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZ2ZqaWZqbmdsY2drcnR1eWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzAyNDgsImV4cCI6MjA2NzkwNjI0OH0.j56rGtp-UFHL0KMxRcJliVoDqVDiP1WyB9liQXfu5Z8'
);

async function saveScore(name, score) {
  const { error } = await supabase.from('Leaderboard').insert([{ name, score }]);
  if (error) console.error("Failed to save score:", error);
}

async function updateLeaderboard() {
  const { data, error } = await supabase
    .from('Leaderboard')  
    .select('*')
    .order('score', { ascending: false })
    .limit(5);

  const list = document.getElementById("leaderboard-list");
  list.innerHTML = "";

  if (error) {
    console.error("Failed to load leaderboard:", error);
    return;
  }

  data.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.name}: ${entry.score}`;
    list.appendChild(li);
  });
}


updateLeaderboard();



function generateLightningBolt() {
  const container = document.getElementById("lightning-container");

  const startX = Math.random() * window.innerWidth;
  const startY = 0;
  const bolt = document.createElementNS("http://www.w3.org/2000/svg", "path");

  let path = `M ${startX},${startY}`;
  let x = startX;
  let y = startY;
  const segments = 10;
  const segmentLength = 40 + Math.random() * 20;

  for (let i = 0; i < segments; i++) {
    x += (Math.random() - 0.5) * 40; // Zigzag
    y += segmentLength;
    path += ` L ${x},${y}`;
  }

  bolt.setAttribute("d", path);
  bolt.classList.add("lightning-bolt");

  container.appendChild(bolt);

  setTimeout(() => bolt.remove(), 500); 
}


setInterval(() => {
  if (Math.random() < 0.6) {
    generateLightningBolt();
  }
}, 4000);
