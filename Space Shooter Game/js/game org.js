const KEY_CODE_LEFT = 37;
const KEY_CODE_RIGHT = 39;
const KEY_CODE_SPACE = 32;
const KEY_CODE_ARROW_UP = 38;
const KEY_CODE_ARROW_DOWN = 40;
const KEY_CODE_PAUSE = 80;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 56;
const PLAYER_MAX_SPEED = 300;
const LASER_MAX_SPEED = 100;
const Laser_COOLDOWN = 0.5;

const ENEMIES_PER_ROW = 10;
const ENEMY_HORIZONTAL_PADDING = 80;
const ENEMY_VERTICAL_PADDING = 30;
const ENEMY_VERTICAL_SPACING = 80;
const ENEMY_COOLDOWN = 9;
const ENEMY_VELOCITY_Y = 20;

let timePassed = 0;

const GAME_STATE = {
  lastTime: Date.now(),
  leftPressed: false,
  rightPressed: false,
  spacePressed: false,
  upPressed: false,
  downPressed: false,
  playerX: 0,
  playerY: 0,
  playerCooldown: 0,
  lasers: [],
  enemies: [],
  enemyLasers: [],
  isPaused: false,
  gameOver: false,
  score: 0,
  lives: 3,
};

function rectsIntersect(r1, r2) {
  return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}

function clamp(v, min, max) {
  if (v < min) {
    return min;
  } else if (v > max) {
    return max;
  } else {
    return v;
  }
}

function setPosition($el, x, y) {
  $el.style.transform = `translate(${x}px, ${y}px)`;
}

function rand(min, max) {
  if (min === undefined) min = 0;
  if (max === undefined) max = 1;
  return min + Math.random() * (max - min);
}

function createPlayer($container) {
  GAME_STATE.playerX = GAME_WIDTH / 2;
  GAME_STATE.playerY = GAME_HEIGHT - 50;
  GAME_STATE.spaceshipImages = [
    '../img/left.png', // Left movement image
    '../img/pRed.png', // Neutral image
    '../img/right.png', // Right movement image
  ];
  GAME_STATE.currentImageIndex = 1; // Start with the neutral image
  const $player = document.createElement('img');
  $player.src = GAME_STATE.spaceshipImages[GAME_STATE.currentImageIndex];
  $player.className = 'player';
  $container.appendChild($player);
  setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY);
}

function destroyPlayer($container, player) {
  GAME_STATE.lives--;
  updateHeartsDisplay();

  if (GAME_STATE.lives > 0) {
    // Player still has lives, respawn player
    setPosition(player, GAME_STATE.playerX, GAME_STATE.playerY);
  } else {
    // Player has no lives left, game over
    $container.removeChild(player);
    GAME_STATE.gameOver = true;
    const audio = new Audio('../sound/sfx-lose.ogg');
    audio.play();
  }
}
function init() {
  const $container = document.querySelector('.game');
  createPlayer($container);
  displayTopScores();

  const enemySpacing = (GAME_WIDTH - ENEMY_HORIZONTAL_PADDING * 2) / (ENEMIES_PER_ROW - 1);
  for (let j = 0; j < 3; j++) {
    const y = ENEMY_VERTICAL_PADDING + j * ENEMY_VERTICAL_SPACING;
    for (let i = 0; i < ENEMIES_PER_ROW; i++) {
      const x = i * enemySpacing + ENEMY_HORIZONTAL_PADDING;
      createEnemy($container, x, y);
    }
  }
}

function updatePlayer(dt, $container) {
  if (GAME_STATE.leftPressed) {
    GAME_STATE.playerX -= dt * PLAYER_MAX_SPEED;
    GAME_STATE.currentImageIndex = 0; // Set image for left movement
  } else if (GAME_STATE.rightPressed) {
    GAME_STATE.playerX += dt * PLAYER_MAX_SPEED;
    GAME_STATE.currentImageIndex = 2; // Set image for right movement
  } else {
    GAME_STATE.currentImageIndex = 1; // Set neutral image when no horizontal movement
  }
  if (GAME_STATE.upPressed) {
    GAME_STATE.playerY -= dt * PLAYER_MAX_SPEED;
  }
  if (GAME_STATE.downPressed) {
    GAME_STATE.playerY += dt * PLAYER_MAX_SPEED;
  }

  GAME_STATE.playerX = clamp(GAME_STATE.playerX, PLAYER_WIDTH, GAME_WIDTH - PLAYER_WIDTH);
  GAME_STATE.playerY = clamp(GAME_STATE.playerY, 300, GAME_HEIGHT - PLAYER_HEIGHT);

  if (GAME_STATE.spacePressed && GAME_STATE.playerCooldown <= 0) {
    createLaser($container, GAME_STATE.playerX, GAME_STATE.playerY);
    GAME_STATE.playerCooldown = Laser_COOLDOWN;
  }
  if (GAME_STATE.playerCooldown > 0) {
    GAME_STATE.playerCooldown -= dt;
  }
  const $player = document.querySelector('.player');
  $player.src = GAME_STATE.spaceshipImages[GAME_STATE.currentImageIndex]; // Update spaceship image
  setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY);
}

function createLaser($container, x, y) {
  const $element = document.createElement('img');
  $element.src = '../img/bullet.png';
  $element.className = 'laser';
  $container.appendChild($element);
  const laser = { x, y, $element };
  GAME_STATE.lasers.push(laser);
  const audio = new Audio('../sound/sfx-laser1.ogg');
  audio.play();
  setPosition($element, x, y);
}

function updateLasers(dt, $container) {
  const lasers = GAME_STATE.lasers;
  for (let i = 0; i < lasers.length; i++) {
    const laser = lasers[i];
    laser.y -= dt * LASER_MAX_SPEED;
    if (laser.y < 0) {
      destroyLaser($container, laser);
    }
    setPosition(laser.$element, laser.x, laser.y);
    const r1 = laser.$element.getBoundingClientRect();
    const enemies = GAME_STATE.enemies;
    for (let j = 0; j < enemies.length; j++) {
      const enemy = enemies[j];
      if (enemy.isDead) continue;
      const r2 = enemy.$element.getBoundingClientRect();
      if (rectsIntersect(r1, r2)) {
        // Enemy was hit
        destroyEnemy($container, enemy);
        destroyLaser($container, laser);
        break;
      }
    }
  }
  GAME_STATE.lasers = GAME_STATE.lasers.filter((e) => !e.isDead);
}

function destroyLaser($container, laser) {
  $container.removeChild(laser.$element);
  laser.isDead = true;
}

function createEnemy($container, x, y) {
  const $element = document.createElement('img');
  $element.src = '../img/en1.png';
  $element.className = 'enemy';
  $container.appendChild($element);
  const enemy = {
    x,
    y,
    cooldown: rand(0.5, ENEMY_COOLDOWN),
    $element,
  };
  GAME_STATE.enemies.push(enemy);
  setPosition($element, x, y);
}

function destroyEnemy($container, enemy) {
  $container.removeChild(enemy.$element);
  enemy.isDead = true;
  GAME_STATE.score += 100;
}

function createEnemyLaser($container, x, y) {
  const $element = document.createElement('img');
  $element.src = '../img/blaser.png';
  $element.className = 'enemy-laser';
  $container.appendChild($element);
  const laser = { x, y, $element };
  GAME_STATE.enemyLasers.push(laser);
  setPosition($element, x, y);
}

function updateEnemyLasers(dt, $container) {
  const lasers = GAME_STATE.enemyLasers;
  for (let i = 0; i < lasers.length; i++) {
    const laser = lasers[i];
    laser.y += dt * LASER_MAX_SPEED;
    if (laser.y > GAME_HEIGHT) {
      destroyLaser($container, laser);
    }
    setPosition(laser.$element, laser.x, laser.y);
    const r1 = laser.$element.getBoundingClientRect();
    const player = document.querySelector('.player');
    const r2 = player.getBoundingClientRect();
    if (rectsIntersect(r1, r2)) {
      // Player was hit
      destroyPlayer($container, player);
      destroyLaser($container, laser);
      const audio = new Audio('../sound/hit.ogg');
      audio.play();
      break;
    }
  }
  GAME_STATE.enemyLasers = GAME_STATE.enemyLasers.filter((e) => !e.isDead);
}

function updateEnemies(dt, $container) {
  const dx = Math.sin(GAME_STATE.lastTime / 1000.0) * 50;

  const enemies = GAME_STATE.enemies;
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    const x = enemy.x + dx;
    const y = enemy.y;

    // If the enemy reaches the bottom, set the game over flag
    if (y >= GAME_HEIGHT - 30) {
      GAME_STATE.gameOver = true;
      return;
    }
    // Collision detection with the player
    const player = document.querySelector('.player');
    const r1 = player.getBoundingClientRect();
    const r2 = enemy.$element.getBoundingClientRect();
    if (rectsIntersect(r1, r2)) {
      GAME_STATE.gameOver = true;
      return;
    }
    enemy.y += dt * 10;
    setPosition(enemy.$element, x, y);
    enemy.cooldown -= dt;
    // Check if it's time to create a new enemy laser
    if (enemy.cooldown <= 0) {
      createEnemyLaser($container, x, y);
      enemy.cooldown = ENEMY_COOLDOWN;
    }
  }

  GAME_STATE.enemies = GAME_STATE.enemies.filter((e) => !e.isDead);
}

function playerHasWon() {
  return GAME_STATE.enemies.length === 0;
}
function saveUserScore(name, score) {
  const scores = JSON.parse(localStorage.getItem('scores')) || {};
  scores[name] = score;
  localStorage.setItem('scores', JSON.stringify(scores));
  displayTopScores();
}

function displayTopScores() {
  const $topScoredUsers = document.querySelector('.topScoredUsers');
  const scores = JSON.parse(localStorage.getItem('scores')) || {};

  // Sort scores in descending order
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  let topScoreHtml = '';
  sortedScores.slice(0, 5).forEach((score, index) => {
    topScoreHtml += `${index + 1}. ${score[0]}: ${score[1]}<br>`;
  });
  $topScoredUsers.innerHTML = topScoreHtml;
}

function updateHeartsDisplay() {
  const $hearts = document.querySelectorAll('.heart');
  for (let i = 0; i < $hearts.length; i++) {
    $hearts[i].style.display = i < GAME_STATE.lives ? 'inline' : 'none';
  }
}

function update(e) {
  if (!GAME_STATE.isPaused) {
    const currentTime = Date.now();
    const dt = (currentTime - GAME_STATE.lastTime) / 1000;
    timePassed += dt;

    if (GAME_STATE.gameOver) {
      document.querySelector('.game-over').style.display = 'block';
      timePassed = 0;
      // Reset lives and game over flag
      GAME_STATE.lives = 3;
      updateHeartsDisplay();
      return;
    }

    if (playerHasWon()) {
      document.querySelector('.congratulations').style.display = 'block';
      let name = '';
      //Prompt for username until a valid one entered
      while (true) {
        name = prompt('Congrats! Enter your name(only letters and numbers!):');
        //Check name
        if (/^[a-zA-Z0-9]+$/.test(name)) {
          // Check if the name is already used by another player
          const scores = JSON.parse(localStorage.getItem('scores')) || {};
          if (name in scores) {
            alert('This name is already used by another player, please choose a different one.');
            continue;
          } else {
            break;
          }
        } else {
          alert('The name can only contain letters and numbers.');
        }
      }
      saveUserScore(name, Math.floor((GAME_STATE.score / timePassed.toFixed(2)) * 100));
      timePassed = 0;
      return;
    }

    const $container = document.querySelector('.game');
    updatePlayer(dt, $container);
    updateLasers(dt, $container);
    updateEnemies(dt, $container);
    updateEnemyLasers(dt, $container);

    GAME_STATE.lastTime = currentTime;
    document.querySelector('.timePassedSpan').textContent = `Time: ${timePassed.toFixed(2)}s`;
    const score = Math.floor((GAME_STATE.score / timePassed.toFixed(2)) * 100);
    //console.log(dt);
    document.querySelector('.score').textContent = `Score: ${score}`;
    if (playerHasWon()) {
      document.querySelector('.score').textContent = `Score: ${score + 10000}`;
    }
  }
  togglePause();
  window.requestAnimationFrame(update);
}

function onKeyDown(e) {
  if (e.keyCode === KEY_CODE_LEFT) {
    GAME_STATE.leftPressed = true;
  } else if (e.keyCode === KEY_CODE_RIGHT) {
    GAME_STATE.rightPressed = true;
  } else if (e.keyCode === KEY_CODE_SPACE) {
    GAME_STATE.spacePressed = true;
  } else if (e.keyCode === KEY_CODE_ARROW_UP) {
    GAME_STATE.upPressed = true;
  } else if (e.keyCode === KEY_CODE_ARROW_DOWN) {
    GAME_STATE.downPressed = true;
  } else if (e.keyCode === KEY_CODE_PAUSE) {
    GAME_STATE.isPaused = !GAME_STATE.isPaused;
    togglePause();
  }
}

function onKeyUp(e) {
  if (e.keyCode === KEY_CODE_LEFT) {
    GAME_STATE.leftPressed = false;
  } else if (e.keyCode === KEY_CODE_RIGHT) {
    GAME_STATE.rightPressed = false;
  } else if (e.keyCode === KEY_CODE_SPACE) {
    GAME_STATE.spacePressed = false;
  } else if (e.keyCode === KEY_CODE_ARROW_UP) {
    GAME_STATE.upPressed = false;
  } else if (e.keyCode === KEY_CODE_ARROW_DOWN) {
    GAME_STATE.downPressed = false;
  }
}
function togglePause() {
  const $gameContainer = document.querySelector('.game');
  const $asteroidsContainer = document.querySelector('.asteroidsContainer');

  if (GAME_STATE.isPaused) {
    $gameContainer.classList.add('paused');
    $asteroidsContainer.classList.add('hidden');
  } else {
    $gameContainer.classList.remove('paused');
    $asteroidsContainer.classList.remove('hidden');
  }
}

init();
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
window.requestAnimationFrame(update);
