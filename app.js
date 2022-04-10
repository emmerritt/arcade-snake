
/* Note about the Coordinates
Because the Y coordinates represent rows in the table, which are always handled first in the code, I decided to format all of the coordinates as [Y,X]. 
*/

// Global Variables

const gameBoard = document.getElementById('game-board');
const startButton = document.getElementById('start-button');
const instructionsButton = document.getElementById('instructions-button');
const scoreCounter = document.getElementById('score-counter');
const highScoreTracker = document.getElementById('high-score');

const startingSnake = {
  body: [ [10, 5], [10, 6], [10, 7], [10, 8] ],
  nextDirection: [-1, 0]
}

let snake = {
  body: [ [10, 5], [10, 6], [10, 7], [10, 8] ],
  nextDirection: [-1, 0]
}

let apple = [];

let speedBoost = [];

let boostPlaced = false;

let speed = 200;

let score = 0;

let highScore = 0;

// Functions to Handle Initial Setup of Game Board

function setupBoard() {
  for (i = 0; i < 20; ++i) {
    const newRow = document.createElement('tr');
      for (j = 0; j < 20; ++j) {
        const newCell = document.createElement('td');
        newRow.appendChild(newCell);
      }
    gameBoard.appendChild(newRow);
  }
}

function buildSnake(snakeObj){
  const body = snakeObj.body;
  let yGrid = gameBoard.getElementsByTagName('tr');
  
  for (let i = 0; i < body.length; ++i) {
    let yCoord = body[i][0];
    let xGrid = yGrid[yCoord].getElementsByTagName('td');
    let xCoord = body[i][1];
    xGrid[xCoord].classList.toggle('snake');
  }
} 

function placeApple () {
    const yGrid = gameBoard.getElementsByTagName('tr');
    const xGrid = yGrid[0].getElementsByTagName('td');
    let appleYCoord = Math.floor(Math.random() * (yGrid.length-1));
    let appleXCoord = Math.floor(Math.random() * (xGrid.length-1));
    let appleCoords = [appleYCoord, appleXCoord];

    for (let i = 0; i < snake.body.length; ++i) {
        const snakeY = snake.body[i][0];
        const snakeX = snake.body[i][1];

        if (appleYCoord === snakeY && appleXCoord === snakeX) {
            placeApple();
            return;
        }
    }

    apple = appleCoords;
}

function displayApple() {
    const appleYCoord = apple[0];
    const appleXCoord = apple[1];
    const yGrid = gameBoard.getElementsByTagName('tr');
    const xGrid = yGrid[appleYCoord].getElementsByTagName('td');
    const appleCell = xGrid[appleXCoord];

    appleCell.classList.add('apple');

}


function placeBoost () {
  const yGrid = gameBoard.getElementsByTagName('tr');
  const xGrid = yGrid[0].getElementsByTagName('td');
  let boostYCoord = Math.floor(Math.random() * (yGrid.length-1));
  let boostXCoord = Math.floor(Math.random() * (xGrid.length-1));
  let boostCoords = [boostYCoord, boostXCoord];

  for (let i = 0; i < snake.body.length; ++i) {
      const snakeY = snake.body[i][0];
      const snakeX = snake.body[i][1];

      if (boostYCoord === snakeY && boostXCoord === snakeX) {
          placeBoost();
          return;
      }
  }

  if (boostYCoord === apple[0] && boostXCoord === apple[1]) {
    placeBoost();
    return;
  }

  speedBoost = boostCoords;
}

function displayBoost() {
  const boostYCoord = speedBoost[0];
  const boostXCoord = speedBoost[1];
  const yGrid = gameBoard.getElementsByTagName('tr');
  const xGrid = yGrid[boostYCoord].getElementsByTagName('td');
  const boostCell = xGrid[boostXCoord];

  boostCell.classList.add('boost');

}

// Main Gameplay Functions
// updateBoard and buildUpdatedSnake handle the updating of the game board as the snake moves on each tick

function updateBoard() {
    let direction = snake.nextDirection;
    let ateApple = false;
    let gotBoost = false;
    let boostChance = Math.floor(Math.random() * 100);

    const body = snake.body;
    const previousHead = body[snake.body.length-1];
    const newYCoord = previousHead[0] + direction[0];
    const newXCoord = previousHead[1] + direction[1];
    const newHead = [newYCoord, newXCoord];
    const oldTail = body[0];
  
    if (detectWallCollision(newHead) || detectSnakeCOllision(newHead)) {
        window.clearInterval(tick);
        showGameOver();
        startButton.disabled = false;

        if (score > highScore) {
            highScore = score;
            updateHighScore();
        }

        return;
    };
  
    body.push(newHead);
    body.shift();

    if (detectAppleCollision(newHead)) {
        snake.body.unshift(oldTail);
        ateApple = true;
        ++score;
        updateScore();

        console.log('snake ate the apple');
        
        placeApple();
        displayApple();
    }

    if (detectBoostCollision(newHead)) {
      gotBoost = true;
      speed -= 10;
      window.clearInterval(tick);
      tick = window.setInterval(updateBoard, speed);
    }

    if (boostPlaced === false && score > 20 && speed > 50) {
      if (boostChance > 95) {
        placeBoost();
        displayBoost();
        boostPlaced = true;
      }
      // placeBoost();
      // displayBoost();
      // boostPlaced = true;
    }

    buildUpdatedSnake(oldTail, newHead, ateApple, gotBoost);

}

function buildUpdatedSnake(oldCoords, newCoords, appleCollision, boostCollision) {
    const body = snake.body;
    const yGrid = gameBoard.getElementsByTagName('tr');
    const oldYCoord = oldCoords[0];
    const newYCoord = newCoords[0];
    const oldXCoord = oldCoords[1];
    const newXCoord = newCoords[1];
  
    const oldTail = yGrid[oldYCoord].getElementsByTagName('td')[oldXCoord];
    const newHead = yGrid[newYCoord].getElementsByTagName('td')[newXCoord];

    newHead.classList.add('snake');
    if (appleCollision) {
        newHead.classList.remove('apple');
    } else {
        oldTail.classList.remove('snake');
    }

    if (boostCollision) {
      newHead.classList.remove('boost');
      boostPlaced = false;
  }

}

// Collision Detection Functions
// Wall and Snake Collision trigger "Game Over"
// Apple Collision triggers snake to grow
// Speed Boost collision decreases delay of tick interval

function detectWallCollision(newCoords) {
    const yGrid = gameBoard.getElementsByTagName('tr');
    const xGrid = yGrid[0].getElementsByTagName('td');
    const collisionTop = newCoords[0] < 0;
    const collisionBottom = newCoords[0] > yGrid.length - 1;
    const collisionRight = newCoords[1] > xGrid.length-1;
    const collisionLeft = newCoords[1] < 0;
    if (collisionTop || collisionBottom || collisionRight || collisionLeft) {
        console.log('game over!');
        return true;
    }
}

function detectSnakeCOllision(newCoords) {
    const yGrid = gameBoard.getElementsByTagName('tr');
    const xGrid = yGrid[newCoords[0]].getElementsByTagName('td');
    const newHeadElement = xGrid[newCoords[1]];

    if (newHeadElement.classList.contains('snake')){
        console.log('game over!');
        return true;
    }

}

function detectAppleCollision(newCoords) {
    if (newCoords[0] === apple[0] && newCoords[1] === apple[1]) {
        return true;
    }
}

function detectBoostCollision(newCoords) {
  if (newCoords[0] === speedBoost[0] && newCoords[1] === speedBoost[1]) {
      return true;
  }
}

// Score Handling Functions

function updateScore() {
    scoreCounter.innerHTML = `<p>Score: ${score}</p>`;
}

function updateHighScore() {
    highScoreTracker.innerHTML = `<p>High Score: ${highScore}</p>`;
}

function showInstructions() {
  const instructions =
  `<tr>
    <td>
        <div id="instructions">
            <h3>How to Play</h3>
            <ul>
                <li>Use the arrow keys to change direction</li>
                <li>Eat apples to score points</li>
                <li>Don't run into the wall or your own tail!</li>
                <li>Keep an eye out for blue speed boosts</li>
            </ul>
            <img id="arrow-keys" src="Images/arrow-keys.png"/>
        </div>
    </td>
  </tr>`;
  gameBoard.innerHTML = instructions;

}

function showGameOver() {
  const gameOver =
  `<tr>
    <td>
        <div id="game-over">
            <h2>Game Over</h2>
            <img id="snek" src="Images/snek.png"/>
        </div>
    </td>
  </tr>`;
  gameBoard.innerHTML = gameOver;
}

// startGame function runs upon clicking "Start Game" button.
// This works for first time playing in a session, also for resetting the game after losing.

function startGame() {
  startButton.disabled = true;
  gameBoard.innerHTML = "";
  setupBoard();
  score = 0;
  snake.body = [ [10, 5], [10, 6], [10, 7], [10, 8] ];
  snake.nextDirection = [-1, 0];
  speed = 200;
  buildSnake(snake);
  placeApple();
  displayApple();
  updateScore();
  updateHighScore();
  tick = window.setInterval(updateBoard, 200);
}


// Initialize Game on Page

setupBoard();
updateScore();
updateHighScore();
let tick;


// Event Listeners

document.addEventListener('keydown', function(event) {
  let snakeDirection = snake.nextDirection;
  
  if (event.keyCode === 38 && snakeDirection[0] != 1) {
    snake.nextDirection = [-1, 0];
  } else if (event.keyCode === 40 && snakeDirection[0] != -1) {
    snake.nextDirection = [1, 0];
  } else if (event.keyCode === 39 && snakeDirection[1] != -1) {
    snake.nextDirection = [0, 1];
  } else if (event.keyCode === 37 && snakeDirection[1] != 1) {
    snake.nextDirection = [0, -1];
  }
});

startButton.addEventListener('click', startGame);
instructionsButton.addEventListener('click', showInstructions);