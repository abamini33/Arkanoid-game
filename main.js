const game = {
  canvasWidth: 800,
  canvasHeight: 400,
  backgroundColor: "#000",
  context: null,
  gameOver: false,
  start: false,
  pause: false,
  lives: 3,
  bricks: [],
};

const ball = {
  x: 375,
  y: 150,
  color: "#f00",
  radius: 10,
  direction: { x: 0, y: -1 },
};

const paddle = {
  x: 375,
  y: 350,
  width: 100,
  height: 10,
  color: "#00f",
  speed: 5,
  direction: 0,
};

function Canvas() {
  game.canvas = document.getElementById("gameCanvas");
  game.context = game.canvas.getContext("2d");

  // Ajout des gestionnaires d'événements ici
  document.addEventListener("keydown", keyboardEvent);
  document.addEventListener("keyup", keyboardEvent);

  initBricks(); // Initialiser les briques
}

function initBricks() {
  const brickWidth = 60;
  const brickHeight = 20;
  const numRows = 2;
  const numCols = 5;
  const padding = 10;

  const totalWidth = numCols * brickWidth + (numCols - 1) * padding;
  const offsetX = (game.canvasWidth - totalWidth) / 2;

  game.bricks = []; // Réinitialiser les briques

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const brick = {
        x: col * (brickWidth + padding) + offsetX,
        y: row * (brickHeight + padding) + 30,
        width: brickWidth,
        height: brickHeight,
        color: getRandomColor(),
      };

      game.bricks.push(brick);
    }
  }
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function displayGame() {
  game.context.clearRect(0, 0, game.canvasWidth, game.canvasHeight);
  game.context.fillStyle = game.backgroundColor;
  game.context.fillRect(0, 0, game.canvasWidth, game.canvasHeight);

  // Dessin de la balle
  game.context.fillStyle = ball.color;
  game.context.beginPath();
  game.context.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
  game.context.fill();

  // Dessin du paddle
  game.context.fillStyle = paddle.color;
  game.context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  // Dessin des briques
  game.bricks.forEach((brick) => {
    game.context.fillStyle = brick.color;
    game.context.fillRect(brick.x, brick.y, brick.width, brick.height);
  });

  // Afficher le nombre de vies
  document.getElementById("lives").innerText = game.lives;

  // Afficher le message Game Over si nécessaire
  if (game.gameOver) {
    game.context.fillStyle = "#fff";
    game.context.font = "30px Arial";
    game.context.fillText(
      "Game Over",
      game.canvasWidth / 2 - 80,
      game.canvasHeight / 2
    );
  }
}

function detectCollisions() {
  // Détecter les collisions avec le haut du canvas
  if (ball.y - ball.radius <= 0) {
    ball.direction.y *= -1;
  }

  // Détecter les collisions avec le bas du canvas
  if (ball.y + ball.radius >= game.canvasHeight) {
    game.lives--;

    if (game.lives === 0) {
      game.gameOver = true;
    } else {
      initPositions();
    }
  }

  // Détecter les collisions avec les côtés gauche et droit du canvas
  if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= game.canvasWidth) {
    // Si la balle touche le côté gauche du paddle
    if (
      ball.y > paddle.y &&
      ball.y < paddle.y + paddle.height &&
      ball.x - ball.radius <= paddle.x + paddle.width / 3
    ) {
      ball.direction = { x: -1, y: -1 };
    }
    // Si la balle touche le côté droit du paddle
    else if (
      ball.y > paddle.y &&
      ball.y < paddle.y + paddle.height &&
      ball.x + ball.radius >= paddle.x + (2 * paddle.width) / 3
    ) {
      ball.direction = { x: 1, y: -1 };
    } else {
      ball.direction.x *= -1;
    }
  }

  // Détecter les collisions avec le paddle
  if (
    ball.y + ball.radius >= paddle.y &&
    ball.y - ball.radius <= paddle.y + paddle.height &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width
  ) {
    ball.direction.y *= -1; // Inverser la direction de la balle en Y
  }

  // Détecter les collisions avec les briques
  game.bricks.forEach((brick, index) => {
    if (
      ball.y - ball.radius <= brick.y + brick.height &&
      ball.y + ball.radius >= brick.y &&
      ball.x >= brick.x &&
      ball.x <= brick.x + brick.width
    ) {
      // La balle a frappé une brique
      game.bricks.splice(index, 1); // Retirer la brique du tableau
      ball.direction.y *= -1; // Inverser la direction de la balle en Y
    }
  });

  // Si le joueur a gagné (toutes les briques sont détruites et il a encore des vies)
  if (game.bricks.length === 0 && game.lives > 0) {
    game.context.fillStyle = "#fff";
    game.context.font = "30px Arial";
    game.context.fillText(
      "You Win!",
      game.canvasWidth / 2 - 60,
      game.canvasHeight / 2
    );
    game.start = false; // Arrêter le jeu
    game.pause = true; // Mettre en pause le jeu
  }
}

function initPositions() {
  ball.x = paddle.x + paddle.width / 2;
  ball.y = paddle.y - ball.radius;
  ball.direction = { x: 0, y: -1 };

  initBricks(); // Réinitialiser les briques
}

function keyboardEvent(event) {
  if (event.type === "keydown") {
    if (event.key === "ArrowRight") {
      paddle.direction = 1;
    } else if (event.key === "ArrowLeft") {
      paddle.direction = -1;
    } else if (event.key === " ") {
      if (!game.start && !game.gameOver) {
        game.start = true;
        game.pause = false;
        requestAnimationFrame(playGame);
      } else {
        game.pause = !game.pause;
        if (!game.pause) {
          requestAnimationFrame(playGame);
        }
      }
    }
  } else if (event.type === "keyup") {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      paddle.direction = 0;
    }
  }
}

function updatePositions() {
  // Mise à jour de la position de la balle
  ball.x += 2 * ball.direction.x;
  ball.y += 2 * ball.direction.y;

  // Mise à jour de la position du paddle
  paddle.x += paddle.speed * paddle.direction;

  // Limiter la position du paddle dans les limites du canvas
  paddle.x = Math.max(0, Math.min(game.canvasWidth - paddle.width, paddle.x));
}

function playGame() {
  if (!game.pause && !game.gameOver) {
    updatePositions();
    detectCollisions();
    displayGame();
    requestAnimationFrame(playGame);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  Canvas();
  playGame();
});
